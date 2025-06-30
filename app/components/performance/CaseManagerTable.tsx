import { CaseManager, CaseManagerPerformance } from '@/app/types/case_manager';

interface CaseManagerTableProps {
  data: CaseManagerPerformance[];
  isLoading: boolean;
  error: string | null;
  onSelectManager: (manager: CaseManager) => void;
  searchQuery: string;
  selectedTeamId: string | number;
}

const metrics = [
    { key: 'case_manager.fullname', label: 'Case Manager' },
    { key: 'case_manager.state', label: 'State' },
    { key: 'case_manager.cmt', label: 'CMT' },
    { key: 'tx_curr', label: 'TX_CURR' },
    { key: 'iit', label: 'IIT' },
    { key: 'appointment_compliance', label: 'Appointment Compliance' },
    { key: 'sample_collection_rate', label: 'VL Sample Collection Rate' },
    { key: 'suppression_rate', label: 'VL Suppression Rate' },
    { key: 'average_score', label: 'Performance Score' }
];

export default function CaseManagerTable({ data, isLoading, error, onSelectManager, searchQuery, selectedTeamId }: CaseManagerTableProps) {
   const getPerformanceColor = (value: number) => {
    if (value >= 80) return 'bg-green-100 text-green-800';
    if (value >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredData = data.filter(manager => {
    const matchesSearch = 
      manager.case_manager.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      //manager.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.case_manager.state.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCMT = selectedTeamId === 'all' || manager.case_manager.cmt === selectedTeamId;

    return matchesSearch && matchesCMT;
  });

  if (isLoading) {
    return <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#096D49]"></div></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }
  return (
     <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-700">
        <tr>
          {metrics.map((metric) => (
            <th key={metric.key} className="px-6 py-3 text-center text-sm font-semibold text-gray-100 uppercase tracking-wider">
              {metric.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredData.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
              No case managers found matching your criteria
            </td>
          </tr>
        ) : (
          filteredData.map((manager) => (
            <tr key={manager.case_manager.cm_id} onClick={() => onSelectManager(manager.case_manager)} className="cursor-pointer hover:bg-gray-50">
              <td className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                {manager.case_manager.fullname}
              </td>
              <td className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                {manager.case_manager.state}
              </td>
              <td className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                {manager.case_manager.cmt}
              </td>
              <td className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                {manager.performance.tx_cur.toLocaleString()}
              </td>
              <td className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                {manager.performance.iit.toLocaleString()}
              </td>
              
              <td className={`px-6 py-3 text-center text-sm font-medium ${getPerformanceColor(manager.performance.appointment_compliance)}`}>
                {Math.round(manager.performance.appointment_compliance)}%
              </td>
              <td className={`px-6 py-3 text-center text-sm font-medium ${getPerformanceColor(manager.performance.sample_collection_rate)}`}>
                {Math.round(manager.performance.sample_collection_rate)}%
              </td>
              <td className={`px-6 py-3 text-center text-sm font-medium ${getPerformanceColor(manager.performance.suppression_rate)}`}>
                {Math.round(manager.performance.suppression_rate)}%
              </td>
              <td className={`px-6 py-3 text-center text-sm font-medium ${getPerformanceColor(manager.performance.final_score)}`}>
                {Math.round(manager.performance.final_score)}%
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
