'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaUser, FaUsers, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import SPEEDInterceptor from '@/app/api/interceptors/SPEEDInterceptor';
import { CaseManager, CMPerformance } from '@/app/types/case_manager';
import { useSession } from 'next-auth/react';

interface GroupedCaseManagerData extends Omit<CaseManager, 'role' | 'cmt' | 'facilities' | 'state'> {
  roles: Set<string>;
  cmts: Set<string>;
  facilities: Set<string>;
  states: Set<string>;
}

interface GroupedCaseManager extends Omit<CaseManager, 'role' | 'cmt' | 'facilities' | 'state'> {
  role: string;
  cmt: string;
  facilities: string;
  state: string;
}

interface CaseManagerDetails {
  case_manager: GroupedCaseManager;
  performance: CMPerformance;
}

// Helper function to group case manager records
const groupCaseManagerRecords = (records: Array<{case_manager: CaseManager; performance: CMPerformance}>): CaseManagerDetails => {
  // Use the first record as base
  const firstRecord = records[0];
  
  // Create sets to track unique values
  const groupedData: GroupedCaseManagerData = {
    ...firstRecord.case_manager,
    roles: new Set<string>(),
    cmts: new Set<string>(),
    facilities: new Set<string>(),
    states: new Set<string>()
  };

  // Add values from all records
  records.forEach(record => {
    if (record.case_manager.role) groupedData.roles.add(record.case_manager.role);
    if (record.case_manager.cmt) groupedData.cmts.add(record.case_manager.cmt);
    if (record.case_manager.facilities) groupedData.facilities.add(record.case_manager.facilities);
    if (record.case_manager.state) groupedData.states.add(record.case_manager.state);
  });

  // Convert sets to strings with slashes
  const groupedManager: GroupedCaseManager = {
    ...firstRecord.case_manager,
    role: Array.from(groupedData.roles).join(' / '),
    cmt: Array.from(groupedData.cmts).join(' / '),
    facilities: Array.from(groupedData.facilities).join(' / '),
    state: Array.from(groupedData.states).join(' / ')
  };

  // Return the grouped record with the first performance record
  return {
    case_manager: groupedManager,
    performance: firstRecord.performance
  };
};

export default function CaseManagerDetailsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const user = session?.user;
  const [managerDetails, setManagerDetails] = useState<CaseManagerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaseManagerDetails = async () => {
      try {
        setLoading(true);
        const response = await SPEEDInterceptor.get(`${process.env.NEXT_PUBLIC_baseURL}/performance/case-managers/${params.id}`);
        
        // Handle response being an array of records or a single record
        const records = Array.isArray(response.data) ? response.data : [response.data];
        
        if (records.length === 0) {
          setError('No case manager records found');
          return;
        }

        // Group records if there are multiple
        const groupedDetails = records.length > 1 ? 
          groupCaseManagerRecords(records) : 
          records[0];

        setManagerDetails(groupedDetails);
      } catch (error) {
        console.error('Error fetching case manager details:', error);
        setError('Failed to load case manager details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCaseManagerDetails();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
            {/* Header Loading */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>

            {/* Content Loading */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info Loading */}
                <div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex">
                        <div className="h-8 w-8 bg-gray-200 rounded mr-3"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics Loading */}
                <div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-8 bg-gray-200 rounded"></div>
                          <div className="h-8 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !managerDetails) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Case Manager Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "The case manager you're looking for doesn't exist."}</p>
          <Link
            href="/cma/case-managers"
            className="inline-flex items-center text-[#096D49] hover:text-[#075238]"
          >
            <FaArrowLeft className="mr-2" /> Back to Case Managers
          </Link>
        </div>
      </div>
    );
  }

  const { case_manager: manager, performance } = managerDetails;

  const getPerformanceColor = (value: number): string => {
    if (value >= 80) return 'text-green-600';
    if (value >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/cma/case-managers"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back to Case Managers
        </Link>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#096D49] bg-opacity-10 text-[#096D49] flex items-center justify-center">
                    {manager.fullname?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  {manager.fullname}
                </h1>
                <p className="text-sm text-gray-500">Case Manager Details</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Performance Score</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(performance.final_score)}`}>
                  {Math.round(performance.final_score)}%
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="px-8 py-6 border-b border-gray-200 bg-white">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <FaUser className="h-5 w-5" />
                  Personal Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Case Manager ID</p>
                    <p className="text-sm text-gray-900">{manager.id || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <div className="flex flex-wrap gap-1">
                      {manager.role.split(' / ').map((role, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">CMT</p>
                    <div className="flex flex-wrap gap-1">
                      {manager.cmt.split(' / ').map((cmt, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                        >
                          {cmt || 'Unassigned'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">State</p>
                    <div className="flex flex-wrap gap-1">
                      {manager.state.split(' / ').map((state, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700"
                        >
                          {state}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-3">
                    <p className="text-sm font-medium text-gray-500">Facilities</p>
                    <div className="flex flex-wrap gap-1">
                      {manager.facilities ? 
                        manager.facilities.split(' / ').map((facility, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700"
                          >
                            {facility}
                          </span>
                        )) :
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700">
                          N/A
                        </span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Status Section */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 bg-purple-50 border-b">
                  <h3 className="text-lg font-semibold text-purple-700 flex items-center gap-2">
                    <FaUsers className="h-5 w-5" />
                    Patient Status
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">TX_CURR</p>
                      <p className="text-lg font-bold text-green-600">{performance.tx_cur}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">IIT</p>
                      <p className="text-lg font-bold text-red-600">{performance.iit}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Discontinued</p>
                      <p className="text-lg font-bold text-red-600">{performance.discontinued}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Transferred Out</p>
                      <p className="text-lg font-bold text-red-600">{performance.transferred_out}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Dead</p>
                      <p className="text-lg font-bold text-red-600">{performance.dead}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointments Section */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 bg-blue-50 border-b">
                  <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    <i className="fas fa-calendar-check" />
                    Appointments
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Scheduled</p>
                      <p className="text-lg font-bold">{performance.appointments_schedule}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Completed</p>
                      <p className="text-lg font-bold">{performance.appointments_completed}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Compliance Rate</p>
                      <div className="flex items-end justify-between">
                        <p className={`text-lg font-bold ${getPerformanceColor(performance.appointment_compliance)}`}>
                          {Math.round(performance.appointment_compliance)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Viral Load Section */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 bg-green-50 border-b">
                  <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                    <i className="fas fa-vial" />
                    Viral Load Management
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Eligible</p>
                      <p className="text-lg font-bold">{performance.viral_load_eligible}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Results</p>
                      <p className="text-lg font-bold">{performance.viral_load_results}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Suppression Rate</p>
                      <div className="flex items-end justify-between">
                        <p className={`text-lg font-bold ${getPerformanceColor(performance.suppression_rate)}`}>
                          {Math.round(performance.suppression_rate)}%
                        </p>
                        <p className="text-sm text-gray-500">
                          {performance.viral_load_suppressed} suppressed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}