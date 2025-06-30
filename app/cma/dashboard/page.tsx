'use client';

import { useSession } from 'next-auth/react';
import {
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import Filters, { FilterValues } from '@/app/components/Filters';
import { useState, useEffect } from 'react';
import SPEEDInterceptor from '@/app/api/interceptors/SPEEDInterceptor';

interface DashboardCard {
  title: string;
  value: number;
  description: string;
}

interface DashboardStats {
  tx_cur: number;
  iit: number;
  drug_pickup: number;
  
  viral_load: {
    eligible: number;
    suppressed: number;
    total_results: number;
    collected: number;
    eligible2: number;
  };
}

interface AppointmentTrendData {
  drug_pickups: WeekData[];
  viral_loads: WeekData[];
  total_visit: WeekData[];
}

interface WeekData {
  count: number;
  week_end: string;
  week_label: string;
  week_start: string;
}

interface TopCaseManager {
  case_manager_id: number;
  fullname: string;
  cmt: string;
  role: string;
  state: string;
  facility: string;
  final_score: number; // Percentage performance
}

interface TopCMTs{
  cmt: string;
  state: string;
  facility: string;
  final_score: number; // Percentage performance
}

// Colors for pie chart
const COLORS = ['#0088FE', '#FF8042'];

// Update PERFORMANCE_COLORS with better color combinations
const PERFORMANCE_COLORS = {
  first: {
    text: '#096D49',
    background: 'linear-gradient(145deg, #E6F4F1 0%, #C5E8E2 50%, #E6F4F1 100%)',
    height: 'h-[310px]',
    trophy: '#FFD700',
    shadow: '0 8px 20px -4px rgba(9, 109, 73, 0.15)'
  },
  second: {
    text: '#2563EB',
    background: 'linear-gradient(145deg, #EFF6FF 0%, #D1E2FF 50%, #EFF6FF 100%)',
    height: 'h-[280px]',
    trophy: '#C0C0C0',
    shadow: '0 8px 20px -4px rgba(37, 99, 235, 0.15)'
  },
  third: {
    text: '#7C3AED',
    background: 'linear-gradient(145deg, #F5F3FF 0%, #E4DCFF 50%, #F5F3FF 100%)',
    height: 'h-[260px]',
    trophy: '#CD7F32',
    shadow: '0 8px 20px -4px rgba(124, 58, 237, 0.15)'
  }
};


export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [filterValues, setFilterValues] = useState<FilterValues>({
    state: '',
    facility: '',
  });
  const [stateList, setStateList] = useState<{ id: number; name: string }[]>([]);
  const [facilityList, setFacilityList] = useState<{ id: number; name: string; state_id: number }[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topCaseManagers, setTopCaseManagers] = useState<TopCaseManager[]>([]);
  const [topCMTs, setTopCMTs] = useState<TopCMTs[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentTrends, setAppointmentTrends] = useState<AppointmentTrendData | null>(null);
  const [trendLoading, setTrendLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statesResponse, facilitiesResponse] = await Promise.all([
          SPEEDInterceptor.get(`${process.env.NEXT_PUBLIC_baseURL}/facilities/states`),
          SPEEDInterceptor.get(`${process.env.NEXT_PUBLIC_baseURL}/facilities/`)
        ]);
        
        setStateList(statesResponse.data);
        setFacilityList(facilitiesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    const fetchDashboardStats = async () => {
      try {
        const response = await SPEEDInterceptor.get(
          `${process.env.NEXT_PUBLIC_baseURL}/dashboard/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchAppointmentTrends = async () => {
      try {
        const response = await SPEEDInterceptor.get(
          `${process.env.NEXT_PUBLIC_baseURL}/dashboard/appointment-trends`);
        setAppointmentTrends(response.data);
      } catch (error) {
        console.error('Error fetching appointment trends:', error);
      } finally {
        setTrendLoading(false);
      }
    };
    const fetchTopCaseManagers = async () => {
      try {
        const response = await SPEEDInterceptor.get(
          `${process.env.NEXT_PUBLIC_baseURL}/dashboard/top3-case-managers`);
        setTopCaseManagers(response.data);
      } catch (error) {
        console.error('Error fetching top case managers:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchTopCMTs = async () => {
      try {
        const response = await SPEEDInterceptor.get(
          `${process.env.NEXT_PUBLIC_baseURL}/dashboard/top3-cmts`);
        setTopCMTs(response.data);
      } catch (error) {
        console.error('Error fetching top CMTs:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.access_token) {
      fetchData();
      fetchDashboardStats();
      fetchAppointmentTrends();
      fetchTopCaseManagers();
      fetchTopCMTs();
    }

  }, [user?.access_token]);

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
    
    // Example: Fetch filtered data
    fetchFilteredData(newFilters);
  };

  const fetchFilteredData = async (filters: FilterValues) => {
    try {
      

      // Example API call with filters
      // const response = await axios.get(`/api/dashboard-data`, { params: filters });
      // Update your dashboard data state here
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    }
  };


  const cards: DashboardCard[] = [
    {
      title: 'TX_CURR',
      value: stats?.tx_cur || 0,
      description: 'Currently active patients',
    },
    {
      title: 'IIT',
      value: stats?.iit || 0,
      description: `${((stats?.iit || 0) / (stats?.tx_cur || 1) * 100).toFixed(1)}% IIT rate`,
    },
    {
      title: 'Drug Pickups',
      value: stats?.drug_pickup || 0,
      description: 'Completed pickups',
    },
    {
      title: 'Viral Load',
      value: stats?.viral_load.total_results || 0,
      description: `${Math.round((stats?.viral_load.total_results || 0) / (stats?.viral_load.eligible || 1) * 100)}% coverage |
      ${Math.round((stats?.viral_load.suppressed || 0) / (stats?.viral_load.total_results || 1) * 100)}% suppressed`,
    },
  ];

  // Update viral load data
  const viralLoadData = [
    { name: 'Collected', value: stats?.viral_load.collected },
    { name: 'Pending', value: (stats?.viral_load?.eligible2 ?? 0) - (stats?.viral_load?.collected ?? 0) }
  ];

  // Transform the data for the chart
  const chartData = appointmentTrends ? appointmentTrends.drug_pickups.map((week, index) => ({
    week_label: week.week_label,
    drugPickups: week.count,
    viralLoad: appointmentTrends.viral_loads[index].count,
    unscheduledAppointments: appointmentTrends.total_visit[index].count - week.count
  })) : [];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <div className="w-full md:w-3/5">
          <Filters 
            onFilterChange={handleFilterChange}
            stateList={stateList}
            facilityList={facilityList}
            showStateFilter={true}
          />
        </div>
      </div>

      {/* Filter Info */}
      {filterValues.state && (
        <div className="text-sm text-gray-500 px-2 md:px-0">
          Showing data for {filterValues.state} 
          {filterValues.facility && ` - ${filterValues.facility}`}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {loading ? (
          // Loading skeleton for cards
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div className="h-1 bg-gray-200" />
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))
        ) : (
          cards.map((card) => {
            let icon = '';
            let cardColor = '';
             if(card.title === 'TX_CURR'){
                icon = 'hospital-user'
                cardColor = '#22C55E'
              }
              else if(card.title === 'IIT'){
                icon = 'bed'
                cardColor = '#EF4444'
              }
              else if(card.title === 'Drug Pickups'){
                icon = 'pills'
                cardColor = '#A855F7'
              }
              else if(card.title === 'Viral Load'){
                icon = 'vial-virus'
                cardColor = '#EAB308'
              }
            return (
            <div
              key={card.title}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="h-1" style={{"backgroundColor": cardColor}} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{card.title}</h3>
                      <p className="mt-1 text-3xl font-semibold text-gray-900">
                        {card.value.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <i className={`fas fa-${icon} 
                        text-4xl`} style={{"color": cardColor}}></i>

                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{card.description}</p>
                </div>
            </div>
          )}
        )
        )}
      </div>

      {/* Appointment Trends */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Appointment Trends
        </h3>
        <div className="h-60 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            {trendLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#096D49]"></div>
              </div>
            ) : (
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="week_label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="drugPickups" 
                  stroke="#8884d8" 
                  name="Drug Pickups" 
                />
                <Line 
                  type="monotone" 
                  dataKey="viralLoad" 
                  stroke="#82ca9d" 
                  name="Viral Load" 
                />
                <Line 
                  type="monotone" 
                  dataKey="unscheduledAppointments" 
                  stroke="#ef5350" 
                  name="Unscheduled Appointments" 
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers Section */}
      <div className='flex w-full gap-4 md:gap-6'>
        <div className="bg-white p-4 md:p-8 rounded-lg shadow-sm w-full md:w-1/2">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 md:mb-6">
            <i className="fas fa-trophy mr-2"></i>
            Top Performing CMTs
            {user?.state && <span className="text-sm font-normal text-gray-500 ml-2">({user.state})</span>}
          </h3>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-center gap-4">
            {topCMTs.map((cmt, index) => {
              let rankStyle = PERFORMANCE_COLORS.third;
              if (index === 0) rankStyle = PERFORMANCE_COLORS.first;
              else if (index === 1) rankStyle = PERFORMANCE_COLORS.second;
              else if (index === 2) rankStyle = PERFORMANCE_COLORS.third;

              const displayOrder = index === 0 ? 1 : index === 1 ? 0 : 2;

              return (
                <div key={cmt.cmt} 
                  className={`${rankStyle.height} w-full sm:w-1/3 transition-all duration-200 hover:translate-y-[-8px]`}
                  style={{ 
                    background: rankStyle.background,
                    order: displayOrder,
                    boxShadow: rankStyle.shadow
                  }}>
                  <div className="h-full flex flex-col justify-end p-3 md:p-4 border border-gray-200 space-y-4 md:space-y-6">
                    <div className="flex justify-center">
                      <i className="fas fa-trophy text-3xl md:text-4xl" style={{ color: rankStyle.trophy }}></i>
                    </div>
                    
                    <div className="text-center">
                      <h4 className="font-semibold text-base md:text-lg mb-1" style={{ color: rankStyle.text }}>
                        {cmt.cmt}
                      </h4>
                      <div className="text-xs md:text-sm text-gray-600 space-y-1">
                        <p>
                          <i className="fas fa-location-dot mr-1"></i>
                          {cmt.state}
                        </p>
                        <p>
                          <i className="fas fa-hospital mr-1"></i>
                          {cmt.facility}
                        </p>
                      </div>
                    </div>

                    <div className="text-center ">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                        Performance Score
                      </div>
                      <span className="font-bold text-xl md:text-2xl" style={{ color: rankStyle.text }}>
                        {Math.round(cmt.final_score)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white p-4 md:p-8 rounded-lg shadow-sm w-full md:w-1/2">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 md:mb-6">
            <i className="fas fa-trophy mr-2"></i>
            Top Performing Case Managers
            {user?.state && <span className="text-sm font-normal text-gray-500 ml-2">({user.state})</span>}
          </h3>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-center gap-4">
            {topCaseManagers.map((manager, index) => {
              let rankStyle = PERFORMANCE_COLORS.third;
              if (index === 0) rankStyle = PERFORMANCE_COLORS.first;
              else if (index === 1) rankStyle = PERFORMANCE_COLORS.second;
              else if (index === 2) rankStyle = PERFORMANCE_COLORS.third;

              const displayOrder = index === 0 ? 1 : index === 1 ? 0 : 2;

              return (
                <div key={manager.case_manager_id} 
                  className={`${rankStyle.height} w-full sm:w-1/3 transition-all duration-200 hover:translate-y-[-8px]`}
                  style={{ 
                    background: rankStyle.background,
                    order: displayOrder,
                    boxShadow: rankStyle.shadow
                  }}>
                  <div className="h-full flex flex-col justify-end p-3 md:p-4 border border-gray-200 space-y-4 md:space-y-6">
                    <div className="flex justify-center">
                      <i className="fas fa-trophy text-3xl md:text-4xl" style={{ color: rankStyle.trophy }}></i>
                    </div>
                    
                    <div className="text-center">
                      <h4 className="font-semibold text-base md:text-lg mb-1" style={{ color: rankStyle.text }}>
                        {manager.fullname}
                      </h4>
                      <div className="text-xs md:text-sm text-gray-600 space-y-1">
                        <p>
                          <i className="fas fa-user-md mr-1"></i>
                          {manager.role}
                        </p>
                        <p>
                          <i className="fas fa-hospital mr-1"></i>
                          {manager.facility}
                        </p>
                      </div>
                    </div>

                    <div className="text-center ">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                        Performance Score
                      </div>
                      <span className="font-bold text-xl md:text-2xl" style={{ color: rankStyle.text }}>
                        {Math.round(manager.final_score)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Viral Load Section */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        <h3 className="my-2 text-lg font-semibold text-center text-gray-900 mb-4">
          Viral Load Sample Collection Status
        </h3>
        <div className="h-56 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={viralLoadData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {viralLoadData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}