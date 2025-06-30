'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SPEEDInterceptor from '@/app/api/interceptors/SPEEDInterceptor';
import { FaArrowLeft, FaUsers, FaUserCheck, FaUserClock, FaChartLine, FaUserPlus, FaTimes, 
         FaMapMarkerAlt, FaHospital, FaCalendarCheck, FaUserAlt, FaStethoscope, FaVial } from 'react-icons/fa';

interface CaseManager {
  id: string;
  fullname: string;
  role: string;
  state: string;
  facilities: string;
}

interface TeamPerformance {
  case_managers_count: number;
  tx_cur: number;
  iit: number;
  transferred_out: number;
  dead: number;
  discontinued: number;
  appointments: {
    completed: number;
    scheduled: number;
    completion_rate: number;
  };
  viral_load: {
    suppressed: number;
    eligible: number;
    samples: number;
    results: number;
    suppression_rate: number;
  };
  average_score: number;
}

interface TeamDetails {
  id: number;
  name: string;
  state: string;
  facility_name: string;
  case_managers: CaseManager[];
  patient_count: number;
  performance: TeamPerformance;
}

export default function TeamDetailsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const user = session?.user;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<TeamDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        setLoading(true);
        const response = await SPEEDInterceptor.get(`${process.env.NEXT_PUBLIC_baseURL}/cmt/${params.id}`);
        setTeam(response.data);
      } catch (error) {
        console.error('Error fetching team details:', error);
        setError('Failed to load team details');
      } finally {
        setLoading(false);
      }
    };

    if (user?.access_token) {
      fetchTeamDetails();
    }
  }, [params.id, user?.access_token]);

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return 'text-green-600 bg-green-50';
    if (value >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-red-600 mb-4">{error || 'Team not found'}</div>
            <Link href="/cma/case-management-teams" className="text-[#096D49] hover:text-[#075238] underline">
              Return to teams list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Navigation */}
        <Link
          href="/cma/case-management-teams"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" /> Back to Teams
        </Link>

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-[#096D49] px-6 py-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                <div className="flex items-center gap-4 text-green-100">
                  <div className="flex items-center gap-1">
                    <FaMapMarkerAlt className="h-4 w-4" />
                    <span>{team.state}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaHospital className="h-4 w-4" />
                    <span>{team.facility_name}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="text-sm font-medium text-white">Performance Score</div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(team.performance.average_score)}%
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="p-6 text-center">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Case Managers</div>
              <div className="text-3xl font-bold text-gray-900">{team.performance.case_managers_count}</div>
            </div>
            <div className="p-6 text-center">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Patients</div>
              <div className="text-3xl font-bold text-gray-900">{team.patient_count}</div>
            </div>
            <div className="p-6 text-center">
              <div className="text-sm font-medium text-gray-500 mb-1">TX_CURR</div>
              <div className="text-3xl font-bold text-gray-900">{team.performance.tx_cur}</div>
            </div>
            <div className="p-6 text-center">
              <div className="text-sm font-medium text-gray-500 mb-1">IIT</div>
              <div className="text-3xl font-bold text-gray-900">
                {(team.performance.iit / team.performance.tx_cur * 100).toFixed(1)}%
                </div>
            </div>
          </div>
        </div>

        {/* Performance Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Status */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b">
              <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                <FaUsers className="h-5 w-5" />
                Patient Status
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">TX_CURR</p>
                  <p className="text-xl font-bold text-green-600">{team.performance.tx_cur}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">IIT</p>
                  <p className="text-xl font-bold text-red-600">{team.performance.iit}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Transferred Out</p>
                  <p className="text-xl font-bold text-gray-900">{team.performance.transferred_out}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Discontinued</p>
                  <p className="text-xl font-bold text-orange-600">{team.performance.discontinued}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">Dead</p>
                  <p className="text-xl font-bold text-red-600">{team.performance.dead}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Management */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-yellow-50 border-b">
              <h3 className="text-lg font-semibold text-yellow-700 flex items-center gap-2">
                <FaCalendarCheck className="h-5 w-5" />
                Appointment Compliance
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Compliance Rate</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${getPerformanceColor(team.performance.appointments.completion_rate)}`}>
                    {Math.round(team.performance.appointments.completion_rate)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      team.performance.appointments.completion_rate >= 80 ? 'bg-green-500' :
                      team.performance.appointments.completion_rate >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${team.performance.appointments.completion_rate}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Scheduled</p>
                  <p className="text-xl font-bold text-gray-900">{team.performance.appointments.scheduled}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Kept</p>
                  <p className="text-xl font-bold text-gray-900">{team.performance.appointments.completed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Viral Load Management */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-purple-50 border-b">
              <h3 className="text-lg font-semibold text-purple-700 flex items-center gap-2">
                <FaVial className="h-5 w-5" />
                Viral Load Management
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Suppression Rate</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${getPerformanceColor(team.performance.viral_load.suppression_rate)}`}>
                    {Math.round(team.performance.viral_load.suppression_rate)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      team.performance.viral_load.suppression_rate >= 80 ? 'bg-green-500' :
                      team.performance.viral_load.suppression_rate >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${team.performance.viral_load.suppression_rate}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Eligible for VL</p>
                  <p className="text-xl font-bold text-gray-900">{team.performance.viral_load.eligible}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Samples Collected</p>
                  <p className="text-xl font-bold text-gray-900">{team.performance.viral_load.samples}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Valid Results</p>
                  <p className="text-xl font-bold text-gray-900">{team.performance.viral_load.results}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Suppressed</p>
                  <p className="text-xl font-bold text-green-600">{team.performance.viral_load.suppressed}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Case Managers List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Case Managers</h3>
            {/* {user?.roles?.includes("Super Admin") && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-[#096D49] hover:bg-[#075238] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#096D49]"
              >
                <FaUserPlus className="h-4 w-4 mr-1.5" />
                Add Manager
              </button>
            )} */}
          </div>
          <div className="divide-y divide-gray-200">
            {team.case_managers.map((manager) => (
              <Link key={manager.id} href={`/cma/case-managers/${manager.id}`} 
                className="block p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#096D49] bg-opacity-10 text-[#096D49] flex items-center justify-center">
                      {manager.fullname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{manager.fullname}</div>
                      <div className="text-sm text-gray-500">{manager.role}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{manager.facilities}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}