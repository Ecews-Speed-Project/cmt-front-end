'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SPEEDInterceptor from '@/app/api/interceptors/SPEEDInterceptor';
import Link from 'next/link';
import { FaPlus, FaUsers, FaArrowRight, FaMapMarkerAlt, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

interface CaseManager {
  id: string;
  fullname: string;
  role: string;
  state: string;
  facilities: string;
  created_at: string;
}

interface Team {
  id: number;
  name: string;
  facility_name: string;
  state: string;  // Using state name directly
  created_at: string;
  case_managers: CaseManager[];
  patient_count: number;
}

export default function CaseManagementTeamsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [states, setStates] = useState<{ id: number; name: string; }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teamsResponse, statesResponse] = await Promise.all([
          SPEEDInterceptor.get(`${process.env.NEXT_PUBLIC_baseURL}/cmt/`),
          SPEEDInterceptor.get(`${process.env.NEXT_PUBLIC_baseURL}/facilities/states`)
        ]);
        setTeams(teamsResponse.data);
        setStates(statesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    if (user?.access_token) {
      fetchData();
    }
  }, [user?.access_token]);

  // Filter teams based on search query and selected state
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.facility_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'all' || team.state.toLowerCase() === selectedState.toLowerCase();
    return matchesSearch && matchesState;
  });

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedState('all');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#096D49] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-8 text-center">
          <div className="text-red-600 mb-2">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="text-[#096D49] hover:text-[#075238] underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // // Get unique states from teams for the filter
  // const uniqueStates = Array.from(new Set(teams.map(team => team.state))).sort();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Case Management Teams</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">View and manage all case management teams</p>
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {filteredTeams.length} of {teams.length} Teams
            </span>
          </div>
        </div>
        {/* {user?.roles?.includes("Super Admin") && (
          <Link
            href="/cma/case-management-teams/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#096D49] hover:bg-[#075238] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#096D49]"
          >
            <FaPlus className="mr-2 h-4 w-4" /> Create New Team
          </Link>
        )} */}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <FaSearch className="mr-2 text-gray-400" />
                Search Teams
              </span>
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by team name or facility..."
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-[#096D49] focus:ring-2 focus:ring-[#096D49] focus:ring-opacity-50"
            />
          </div>

          {/* State Filter (only for super admin) */}
          {user?.roles?.includes("Super Admin") && (
            <div className="md:w-64">
              <label htmlFor="state-filter" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <FaFilter className="mr-2 text-gray-400" />
                  Filter by State
                </span>
              </label>
              <select
                id="state-filter"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-[#096D49] focus:ring-2 focus:ring-[#096D49] focus:ring-opacity-50"
              >
                <option value="all">All States</option>
                {states.map((state) => (
                  <option key={state.id} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedState !== 'all') && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Active Filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-blue-900">
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedState !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                State: {selectedState}
                <button onClick={() => setSelectedState('all')} className="ml-1 hover:text-green-900">
                  <FaTimes className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-sm text-[#096D49] hover:text-[#075238] hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
          <p className="text-gray-500 mb-4">
            {teams.length === 0
              ? "No case management teams are available."
              : "No teams match your search criteria."}
          </p>
          {(searchQuery || selectedState !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-[#096D49] hover:text-[#075238] underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div key={team.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-200">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {team.name}
                    </h3>
                    {user?.roles?.includes("Super Admin") && (
                      <div className="flex items-center text-gray-500 text-sm mb-1">
                        <FaMapMarkerAlt className="h-3.5 w-3.5 mr-1" />
                        {team.state}
                      </div>
                    )}
                    <div className="text-gray-500 text-sm">
                      {team.facility_name}
                    </div>
                  </div>
                  <div className="flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                    <FaUsers className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{team.case_managers.length}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Patients</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {team.patient_count.toLocaleString()}
                  </p>
                </div>

                <Link
                  href={`/cma/case-management-teams/${team.id}`}
                  className="group flex items-center justify-between w-full px-4 py-3 rounded-lg bg-[#E6F0ED] hover:bg-[#096D49] transition-all duration-200"
                >
                  <span className="font-medium text-[#096D49] group-hover:text-white transition-colors">View Team Details</span>
                  <FaArrowRight className="h-4 w-4 text-[#096D49] group-hover:text-white transform group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}