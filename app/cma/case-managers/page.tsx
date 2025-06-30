'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SPEEDInterceptor from '@/app/api/interceptors/SPEEDInterceptor';
import Link from 'next/link';
import { FaFilter, FaUserPlus, FaMapMarkerAlt, FaUsers, FaArrowRight, FaSearch } from 'react-icons/fa';
import { CaseManager } from '@/app/types/case_manager';

interface CMT {
  id: string;
  name: string;
  state_id: number;
}

interface GroupedManager extends Omit<CaseManager, 'role' | 'cmt' | 'facilities' | 'state'> {
  roles: Set<string>;
  cmts: Set<string>;
  facilities: Set<string>;
  states: Set<string>;
}

export default function CaseManagersPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [loading, setLoading] = useState(true);
  const [caseManagers, setCaseManagers] = useState<CaseManager[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cmtList, setCmtList] = useState<CMT[]>([]);
  const [statesList, setStatesList] = useState<Array<{ id: number; name: string; }>>([]);

  // Fetch case managers data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [caseManagersRes, cmtRes, statesRes] = await Promise.all([
          SPEEDInterceptor.get(`${process.env.NEXT_PUBLIC_baseURL}/case-managers/`),
          SPEEDInterceptor.get(`${process.env.NEXT_PUBLIC_baseURL}/cmt/`),
          SPEEDInterceptor.get(`${process.env.NEXT_PUBLIC_baseURL}/facilities/states`)
        ]);

        // Log the actual data structure to debug
        console.log('Case Managers Data:', caseManagersRes.data);
        console.log('CMT Data:', cmtRes.data);
        console.log('States Data:', statesRes.data);

        setCaseManagers(caseManagersRes.data || []);
        setCmtList(cmtRes.data || []);
        setStatesList(statesRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays on error to prevent crashes
        setCaseManagers([]);
        setCmtList([]);
        setStatesList([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.access_token) {
      fetchAllData();
    }
  }, [user?.access_token]);

  // Function to get unique case managers by grouping duplicates
  const getUniqueGroupedCaseManagers = (): CaseManager[] => {
    if (!Array.isArray(caseManagers)) {
      console.warn('caseManagers is not an array:', caseManagers);
      return [];
    }

    // Group case managers by their ID
    const groupedManagers = caseManagers.reduce<Record<string, GroupedManager>>((acc, manager) => {
      if (!manager) return acc;
      
      const managerId = manager.id || manager.cm_id?.toString();
      if (!managerId) return acc;

      if (!acc[managerId]) {
        acc[managerId] = {
          ...manager,
          roles: new Set<string>(),
          cmts: new Set<string>(),
          facilities: new Set<string>(),
          states: new Set<string>()
        };
      }

      // Add values to sets to avoid duplicates
      if (manager.role) acc[managerId].roles.add(manager.role);
      if (manager.cmt) acc[managerId].cmts.add(manager.cmt);
      if (manager.facilities) acc[managerId].facilities.add(manager.facilities);
      if (manager.state) acc[managerId].states.add(manager.state);

      return acc;
    }, {});

    // Convert sets back to strings with slash separators
    return Object.values(groupedManagers).map<CaseManager>(manager => ({
      ...manager,
      role: Array.from(manager.roles).join(' / '),
      cmt: Array.from(manager.cmts).join(' / '),
      facilities: Array.from(manager.facilities).join(' / '),
      state: Array.from(manager.states).join(' / ')
    }));
  };

  // Improved filtering function with better null checks and debugging
  const getFilteredCaseManagers = (): CaseManager[] => {
    const uniqueManagers = getUniqueGroupedCaseManagers();

    return uniqueManagers.filter((manager: CaseManager) => {
      if (!manager) return false;

      // State filtering - check if any of the manager's states match
      const stateMatch = selectedState === 'all' || 
        (manager.state && manager.state.toLowerCase().includes(selectedState.toLowerCase()));

      // CMT filtering - check if any of the manager's CMTs match
      const cmtMatch = selectedTeam === 'all' || 
        (manager.cmt && manager.cmt.toLowerCase().includes(selectedTeam.toLowerCase()));

      // Search filtering - check if search query matches any field
      let searchMatch = true;
      if (searchQuery && searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        const searchFields = [
          manager.fullname,
          manager.role,
          manager.facilities,
          manager.state,
          manager.cmt
        ];
        
        searchMatch = searchFields.some(field => 
          field && field.toString().toLowerCase().includes(searchLower)
        );
      }

      return stateMatch && cmtMatch && searchMatch;
    });
  };

  // Get unique CMTs from case managers data (fallback if CMT API fails)
  const getCmtListFromCaseManagers = (): CMT[] => {
    if (!Array.isArray(caseManagers)) return [];
    
    const uniqueCmts = new Set<string>();
    caseManagers.forEach(manager => {
      if (manager.cmt) {
        // Handle multiple CMTs separated by any delimiter
        const cmts = manager.cmt.split(/[,/|;]/).map(c => c.trim()).filter(c => c);
        cmts.forEach(cmt => uniqueCmts.add(cmt));
      }
    });
    
    return Array.from(uniqueCmts).map((name): CMT => ({
      id: `cmt_${name.replace(/\s+/g, '_')}`,
      name,
      state_id: 0 // We don't have state mapping from case managers data
    }));
  };

  // Improved CMT filtering with fallback to case managers data
  const getFilteredCmtList = (): CMT[] => {
    let availableCmts: CMT[] = [];
    
    // Try to use CMT API data first, fallback to extracting from case managers
    if (Array.isArray(cmtList) && cmtList.length > 0) {
      availableCmts = cmtList;
      console.log('Using CMT API data:', cmtList);
    } else {
      availableCmts = getCmtListFromCaseManagers();
      console.log('Using CMTs extracted from case managers:', availableCmts);
    }

    if (selectedState === 'all') {
      return availableCmts;
    }

    // If we have state information, filter by state
    if (cmtList.length > 0) {
      // Find the selected state ID
      const selectedStateObj = statesList.find(s => 
        s.name && s.name.toLowerCase() === selectedState.toLowerCase()
      );
      
      if (!selectedStateObj) {
        console.log('Selected state not found:', selectedState, 'Available states:', statesList);
        return availableCmts; // Return all CMTs if state not found
      }

      try {
        const filtered = availableCmts.filter(cmt => cmt.state_id === selectedStateObj.id);
        console.log(`Filtered CMTs for state ${selectedState}:`, filtered);
        return filtered;
      } catch (error) {
        console.error('Error filtering CMTs:', error);
        return availableCmts; // Return all CMTs on error
      }
    }

    // If no state filtering possible, filter based on case managers in the selected state
    const cmtsInSelectedState = new Set<string>();
    caseManagers.forEach(manager => {
      if (manager.state && manager.state.toLowerCase() === selectedState.toLowerCase() && manager.cmt) {
        const cmts = manager.cmt.split(/[,/|;]/).map(c => c.trim()).filter(c => c);
        cmts.forEach(cmt => cmtsInSelectedState.add(cmt));
      }
    });

    return availableCmts.filter(cmt => cmtsInSelectedState.has(cmt.name));
  };

  // Enhanced handlers with better state management
  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log('Team changed to:', value);
    setSelectedTeam(value);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log('State changed to:', value);
    setSelectedState(value);
    setSelectedTeam('all'); // Reset CMT filter when state changes
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Search changed to:', value);
    setSearchQuery(value);
  };

  // Reset filters function
  const resetFilters = () => {
    setSelectedTeam('all');
    setSelectedState('all');
    setSearchQuery('');
    console.log('Filters reset');
  };

  // Get filtered data
  const filteredCaseManagers = getFilteredCaseManagers();
  const filteredCmtList = getFilteredCmtList();
  const uniqueGroupedCaseManagers = getUniqueGroupedCaseManagers();

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Case Managers</h1>
          <p className="text-sm text-gray-500">View and manage all case managers in the system</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Search Input */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <FaSearch className="mr-2 text-gray-400" />
                Search Case Managers
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name, role, or facility..."
                className="block w-full pl-4 pr-10 py-2.5 rounded-lg border border-gray-300 shadow-sm focus:border-[#096D49] focus:ring-2 focus:ring-[#096D49] focus:ring-opacity-50 sm:text-sm transition-all duration-150"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* State Filter (show only for super admins) */}
          {Array.isArray(user?.roles) && user.roles.includes("Super Admin") && (
            <div className="flex-1">
              <label htmlFor="state-filter" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-gray-400" />
                  Filter by State
                </span>
              </label>
              <select
                id="state-filter"
                value={selectedState}
                onChange={handleStateChange}
                className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm focus:border-[#096D49] focus:ring-2 focus:ring-[#096D49] focus:ring-opacity-50 sm:text-sm transition-all duration-150 cursor-pointer bg-white"
              >
                <option value="all">All States</option>
                {statesList.map((state) => (
                  <option key={state.id} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* CMT Filter */}
          <div className="flex-1">
            <label htmlFor="team-filter" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <FaFilter className="mr-2 text-gray-400" />
                Filter by CMT
              </span>
            </label>
            <select
              id="team-filter"
              value={selectedTeam}
              onChange={handleTeamChange}
              className="block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm focus:border-[#096D49] focus:ring-2 focus:ring-[#096D49] focus:ring-opacity-50 sm:text-sm transition-all duration-150 cursor-pointer bg-white"
            >
              <option value="all">All CMTs</option>
              {filteredCmtList.map((cmt: CMT) => {
                const count = uniqueGroupedCaseManagers.filter(cm => 
                  typeof cm.cmt === 'string' && typeof cmt.name === 'string' && 
                  cm.cmt.toLowerCase().includes(cmt.name.toLowerCase())
                ).length;
                return (
                  <option key={cmt.id} value={cmt.name || ''}>
                    {cmt.name || 'N/A'} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedTeam !== 'all' || selectedState !== 'all' || searchQuery) && (
          <div className="pt-4 flex flex-wrap items-center gap-2 border-t border-gray-100">
            <span className="text-sm text-gray-500">Active Filters:</span>
            {selectedState !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                State: {selectedState}
              </span>
            )}
            {selectedTeam !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                CMT: {selectedTeam}
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                Search: {searchQuery}
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-sm text-[#096D49] hover:text-[#075238] hover:underline ml-2 flex items-center"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Results count */}
        <div className="text-sm text-gray-500 pt-4 border-t border-gray-100">
          <span className="font-medium text-gray-900">{filteredCaseManagers.length}</span> case manager{filteredCaseManagers.length !== 1 ? 's' : ''} found
          {uniqueGroupedCaseManagers.length > 0 && (
            <span className="ml-2">
              (out of <span className="font-medium text-gray-900">{uniqueGroupedCaseManagers.length}</span> total)
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#096D49]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredCaseManagers.length === 0 ? (
            <div className="p-8 text-center">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No case managers found</h3>
              <p className="text-gray-500">
                {uniqueGroupedCaseManagers.length === 0 
                  ? "No case managers are available."
                  : "Try adjusting your filters or search terms."
                }
              </p>
              {(selectedTeam !== 'all' || selectedState !== 'all' || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="mt-4 text-[#096D49] hover:text-[#075238] underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/5">
                      Case Manager
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/5">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/5">
                      CMT
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/5">
                      Facilities
                    </th>
                    {!user?.state && (
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/5">
                        State
                      </th>
                    )}
                    <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCaseManagers.map((manager) => {
                    const managerId = manager.id || manager.cm_id;
                    return (
                      <tr key={managerId} className="group hover:bg-gray-50">
                        <td className="p-0 whitespace-nowrap w-1/5">
                          <Link
                            href={`/cma/case-managers/${managerId}`}
                            className="flex items-center h-full px-6 py-4 hover:bg-gray-50"
                          >
                            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-[#096D49] bg-opacity-10 text-[#096D49] flex items-center justify-center group-hover:bg-opacity-20 transition-all duration-150">
                              {manager.fullname?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-[#096D49] transition-colors">
                                {manager.fullname || 'N/A'}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="p-0 whitespace-nowrap w-1/5">
                          <Link
                            href={`/cma/case-managers/${managerId}`}
                            className="block h-full w-full px-6 py-4 hover:bg-gray-50"
                          >
                            <div className="flex flex-wrap gap-1">
                              {(manager.role || 'N/A').split(' / ').map((role, idx) => (
                                <span 
                                  key={idx} 
                                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 group-hover:bg-green-100 transition-colors"
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          </Link>
                        </td>
                        <td className="p-0 whitespace-nowrap w-1/5">
                          <Link
                            href={`/cma/case-managers/${managerId}`}
                            className="block h-full w-full px-6 py-4 hover:bg-gray-50"
                          >
                            <div className="flex flex-wrap gap-1">
                              {(manager.cmt || 'N/A').split(' / ').map((cmt, idx) => (
                                <span 
                                  key={idx}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition-colors"
                                >
                                  {cmt}
                                </span>
                              ))}
                            </div>
                          </Link>
                        </td>
                        <td className="p-0 w-1/5">
                          <Link
                            href={`/cma/case-managers/${managerId}`}
                            className="block h-full w-full px-6 py-4 hover:bg-gray-50"
                          >
                            <div className="flex flex-wrap gap-1">
                              {(manager.facilities || 'N/A').split(' / ').map((facility, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 group-hover:bg-purple-100 transition-colors"
                                >
                                  {facility}
                                </span>
                              ))}
                            </div>
                          </Link>
                        </td>
                        {!user?.state && (
                          <td className="p-0 whitespace-nowrap w-1/5">
                            <Link
                              href={`/cma/case-managers/${managerId}`}
                              className="block h-full w-full px-6 py-4 hover:bg-gray-50"
                            >
                              <div className="flex flex-wrap gap-1">
                                {(manager.state || 'N/A').split(' / ').map((state, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 group-hover:bg-gray-100 transition-colors"
                                  >
                                    {state}
                                  </span>
                                ))}
                              </div>
                            </Link>
                          </td>
                        )}
                        <td className="p-0 whitespace-nowrap">
                          <Link
                            href={`/cma/case-managers/${managerId}`}
                            className="flex items-center justify-end h-full px-6 py-4 text-sm font-medium text-[#096D49]  group-hover:opacity-100 transition-all duration-150 hover:bg-gray-50"
                          >
                            View Details
                            <FaArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}