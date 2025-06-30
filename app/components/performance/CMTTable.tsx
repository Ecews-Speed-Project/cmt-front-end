import { CMTPerformanceData } from '@/app/types/cmt';

interface CMTTableProps {
  data: CMTPerformanceData[];
  isLoading: boolean;
  error: string | null;
  onSelectCMT: (cmt: CMTPerformanceData) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
}

const metrics = [
    { key: 'cmt', label: 'CMT' },
    { key: 'facility_name', label: 'FACILITY NAME' },
    { key: 'state', label: 'STATE' },
    { key: 'tx_cur', label: 'TX_CURR' },
    { key: 'iit', label: 'IIT' },
    { key: 'appointments.completion_rate', label: 'Appointment Compliance' },
    { key: 'sample_collection_rate', label: 'VL Sample Collection Rate' },
    { key: 'viral_load.suppression_rate', label: 'VL Suppression' },
    { key: 'average_score', label: 'Performance Score' }
];

export default function CMTTable({ 
  data, 
  isLoading, 
  error, 
  onSelectCMT, 
  searchQuery, 
  onSearch 
}: CMTTableProps) {
  const getPerformanceColor = (value: number) => {
    if (value >= 80) return 'bg-green-100 text-green-800';
    if (value >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredData = data.filter(cmt => 
    cmt.cmt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmt.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#096D49]"></div></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative w-full md:w-1/3">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search CMTs..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-[#096D49] focus:ring-2 focus:ring-[#096D49] focus:ring-opacity-50"
          />
        </div>
      </div>

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
        <tbody className="bg-white divide-y divide-gray-300">
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={metrics.length} className="px-6 py-4 text-center text-gray-500">
                No CMTs found matching your search
              </td>
            </tr>
          ) : (
            filteredData.map((cmt, index) => (
              <tr key={index} onClick={() => onSelectCMT(cmt)} className="cursor-pointer hover:bg-gray-50">
                <td className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                  {cmt.cmt}
                </td>
                <td className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                  {cmt.facility_name}
                </td>
                <td className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                  {cmt.state}
                </td>
                <td className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                  {cmt.tx_cur.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                  {cmt.iit.toLocaleString()}
                </td>
                
                <td className={`px-6 py-3 text-center text-sm font-medium ${getPerformanceColor(cmt.appointments.completion_rate)}`}>
                  {Math.round(cmt.appointments.completion_rate)}%
                </td>
                <td className={`px-6 py-3 text-center text-sm font-medium ${getPerformanceColor(Math.round(cmt.viral_load.samples / cmt.viral_load.eligible * 100))}`}>
                  {cmt.viral_load.eligible > 0 ? Math.round(cmt.viral_load.samples / cmt.viral_load.eligible * 100) : 0}%
                </td>
                <td className={`px-6 py-3 text-center text-sm font-medium ${getPerformanceColor(cmt.viral_load.suppression_rate)}`}>
                  {Math.round(cmt.viral_load.suppression_rate)}%
                </td>
                <td className={`px-6 py-3 text-center text-sm font-medium ${getPerformanceColor(cmt.average_score)}`}>
                  {Math.round(cmt.average_score)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
