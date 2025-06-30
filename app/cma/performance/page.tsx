'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import debounce from 'lodash/debounce';
import SPEEDInterceptor from '@/app/api/interceptors/SPEEDInterceptor';
import CMTTable from '@/app/components/performance/CMTTable';
import CaseManagerTable from '@/app/components/performance/CaseManagerTable';
import PerformanceModal from '@/app/components/performance/PerformanceModal';
import { CaseManagerPerformance } from '@/app/types/case_manager';
import { CMTPerformanceData } from '@/app/types/cmt';



export default function PerformancePage() {
  // Add loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cmt' | 'caseManager'>('cmt');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [caseManagerPerformance, setCaseManagerPrformance] = useState<CaseManagerPerformance[]>([]);
  const [cmtPerformance, setCmtPerformance] = useState<CMTPerformanceData[]>([]);
  const [cmtSearchQuery, setCmtSearchQuery] = useState('');
  const { data: session } = useSession();
  const user = session?.user;
  
const getCaseManagerPerformance = async() => {
  try {
    setIsLoading(true);
    const response = await SPEEDInterceptor.get(`${process.env.NEXT_PUBLIC_baseURL}/performance/case-managers`);
    // console.log('Case Managers API Response:', response.data);
    setCaseManagerPrformance(response.data);
  } catch (error) {
    console.error('Error fetching case manager performance:', error);
    setError('Failed to fetch case manager data');
  } finally {
    setIsLoading(false);
  }
}

const getCMTPerformance = async() => {
  try {
    setIsLoading(true);
    const response = await SPEEDInterceptor.get(`${process.env.NEXT_PUBLIC_baseURL}/performance/cmts`);
    // console.log('CMT API Response:', response.data);
    setCmtPerformance(response.data);
  } catch (error) {
    console.error('Error fetching CMT performance:', error);
    setError('Failed to fetch CMT data');
  } finally {
    setIsLoading(false);
  }
}
  
  useEffect(() => {
    if (user?.access_token) {
      setIsLoading(true);
      setError(null);
      Promise.all([
        getCaseManagerPerformance(),
        getCMTPerformance()
      ]).finally(() => setIsLoading(false));
    }
  }, [user?.access_token]);


  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleTeamFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTeamId(value === 'all' ? 'all' : value);
  };

  const openModal = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };


  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Performance Dashboard
        </h1>
        <div className="text-sm text-gray-500">
          {user?.state ? `${user.state} State View` : 'National View'}
        </div>
      </div>

      {/* Tab Selection */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('cmt')}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-semibold text-sm ${
              activeTab === 'cmt'
                ? 'border-[#096D49] border-b-4 text-[#096D49]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="fas fa-chart-line h-4 w-4 mr-2" />
            CMT Performance
          </button>

          <button
            onClick={() => setActiveTab('caseManager')}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-semibold text-sm ${
              activeTab === 'caseManager'
                ? 'border-[#096D49] border-b-4 text-[#096D49]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="fas fa-chart-line h-4 w-4 mr-2" />
            Case Manager Performance
          </button>
        </nav>
      </div>

      {/* Search Bar and Filters (Only for Case Manager tab) */}
      {activeTab === 'caseManager' && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-1/2">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search case managers..."
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-[#096D49] focus:ring-2 focus:ring-[#096D49] focus:ring-opacity-50"
              />
            </div>
            <div className="flex items-center gap-2 w-1/2">
              <label htmlFor="teamFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Filter by CMT:
              </label>
              <select
                id="teamFilter"
                onChange={handleTeamFilter}
                defaultValue="all"
                className="flex-1 rounded-lg border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-[#096D49] focus:ring-2 focus:ring-[#096D49] focus:ring-opacity-50"
              >
                <option value="all">All Teams</option>
                {Array.from(new Set(caseManagerPerformance.map(cm => cm.case_manager.cmt))).map(cmt => (
                  <option key={cmt} value={cmt}>
                    {cmt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Render appropriate table based on active tab */}
      {activeTab === 'cmt' ? (
        <CMTTable
          data={cmtPerformance}
          isLoading={isLoading}
          error={error}
          onSelectCMT={(cmt) => openModal(cmt)}
          searchQuery={cmtSearchQuery}
          onSearch={setCmtSearchQuery}
        />
      ) : (
        <CaseManagerTable
          data={caseManagerPerformance}
          isLoading={isLoading}
          error={error}
          onSelectManager={(manager) => openModal(manager)}
          searchQuery={searchQuery}
          selectedTeamId={selectedTeamId}
        />
      )}

      <PerformanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedItem}
        type={activeTab}
      />
    </div>
  );
}