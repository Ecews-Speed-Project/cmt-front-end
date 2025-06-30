import { FaTimes, FaCalendarCheck, FaVial } from 'react-icons/fa';
import { FaUserGroup } from 'react-icons/fa6';
import { CaseManagerPerformance } from '@/app/types/case_manager';
import { CMTPerformanceData } from '@/app/types/cmt';

interface PerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CaseManagerPerformance | CMTPerformanceData | null;
  type: 'cmt' | 'caseManager';
}

type PerformanceData = {
  tx_cur: number;
  iit: number;
  discontinued: number;
  transferred_out: number;
  dead: number;
  appointments: {
    scheduled: number;
    completed: number;
    completion_rate: number;
  } | {
    appointments_schedule: number;
    appointments_completed: number;
    appointment_compliance: number;
  };
  viral_load: {
    eligible: number;
    samples: number;
    results: number;
    suppressed: number;
    suppression_rate: number;
  } | {
    viral_load_eligible: number;
    viral_load_samples: number;
    viral_load_results: number;
    viral_load_suppressed: number;
    suppression_rate: number;
  };
  final_score?: number;
  average_score?: number;
};

export default function PerformanceModal({ isOpen, onClose, data, type }: PerformanceModalProps) {
  if (!isOpen || !data) return null;

  const getPerformanceColor = (value: number): string => {
    if (value >= 80) return 'text-green-600';
    if (value >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const performanceData = type === 'cmt' 
    ? (data as CMTPerformanceData)
    : (data as CaseManagerPerformance).performance;

  const getAppointmentData = () => {
    if (type === 'cmt') {
      const cmtData = performanceData as CMTPerformanceData;
      return {
        scheduled: cmtData.appointments.scheduled,
        completed: cmtData.appointments.completed,
        completion_rate: cmtData.appointments.completion_rate
      };
    } else {
      const cmData = performanceData as CaseManagerPerformance['performance'];
      return {
        scheduled: cmData.appointments_schedule,
        completed: cmData.appointments_completed,
        completion_rate: cmData.appointment_compliance
      };
    }
  };

  const getViralLoadData = () => {
    if (type === 'cmt') {
      const cmtData = performanceData as CMTPerformanceData;
      return {
        eligible: cmtData.viral_load.eligible,
        samples: cmtData.viral_load.samples,
        results: cmtData.viral_load.results,
        suppressed: cmtData.viral_load.suppressed,
        suppression_rate: cmtData.viral_load.suppression_rate
      };
    } else {
      const cmData = performanceData as CaseManagerPerformance['performance'];
      return {
        eligible: cmData.viral_load_eligible,
        samples: cmData.viral_load_samples,
        results: cmData.viral_load_results,
        suppressed: cmData.viral_load_suppressed,
        suppression_rate: cmData.suppression_rate
      };
    }
  };

  const appointmentData = getAppointmentData();
  const viralLoadData = getViralLoadData();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 space-y-8">
          {/* Header with close button */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {type === 'cmt' ? (data as CMTPerformanceData).cmt : (data as CaseManagerPerformance).case_manager.fullname}
              </h2>
              <div className="mt-2 text-sm text-gray-500">
                <p>State: {type === 'cmt' ? (data as CMTPerformanceData).state : (data as CaseManagerPerformance).case_manager.state}</p>
                {type === 'caseManager' && (
                  <>
                    <p>CMT: {(data as CaseManagerPerformance).case_manager.cmt}</p>
                    <p>Role: {(data as CaseManagerPerformance).case_manager.role}</p>
                  </>
                )}
                <p>Facility: {type === 'cmt' ? 
                  (data as CMTPerformanceData).facility_name : 
                  (data as CaseManagerPerformance).case_manager.facilities}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2"
              aria-label="Close modal"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {/* Performance Score */}
          <div className="flex justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Overall Performance</p>
              <p className={`text-4xl font-bold mt-1 ${
                getPerformanceColor(type === 'cmt' ? 
                  (data as CMTPerformanceData).average_score : 
                  (data as CaseManagerPerformance).performance.final_score)
              }`}>
                {Math.round(type === 'cmt' ? 
                  (data as CMTPerformanceData).average_score : 
                  (data as CaseManagerPerformance).performance.final_score
                )}%
              </p>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Status Section */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 bg-purple-50 border-b">
                <h3 className="text-lg font-semibold text-purple-700 flex items-center gap-2">
                  <FaUserGroup className="h-5 w-5" />
                  Patient Status
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">TX_CURR</p>
                    <p className="text-lg font-bold text-green-600">{performanceData.tx_cur}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">IIT</p>
                    <p className="text-lg font-bold text-red-600">{performanceData.iit}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Discontinued</p>
                    <p className="text-lg font-bold text-red-600">{performanceData.discontinued}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Transferred Out</p>
                    <p className="text-lg font-bold text-red-600">{performanceData.transferred_out}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Dead</p>
                    <p className="text-lg font-bold text-red-600">{performanceData.dead}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments Section */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 bg-blue-50 border-b">
                <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                  <FaCalendarCheck className="h-5 w-5" />
                  Appointments
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Scheduled</p>
                    <p className="text-lg font-bold">
                      {appointmentData.scheduled}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Completed</p>
                    <p className="text-lg font-bold">
                      {appointmentData.completed}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Compliance Rate</p>
                    <p className={`text-lg font-bold ${getPerformanceColor(appointmentData.completion_rate)}`}>
                      {Math.round(appointmentData.completion_rate)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Viral Load Section */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 bg-green-50 border-b">
                <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                  <FaVial className="h-5 w-5" />
                  Viral Load Management
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Eligible</p>
                    <p className="text-lg font-bold">
                      {viralLoadData.eligible}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Collected</p>
                    <p className="text-lg font-bold">
                      {viralLoadData.samples}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Results</p>
                    <p className="text-lg font-bold">
                      {viralLoadData.results}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Suppression Rate</p>
                    <div className="flex items-end justify-between">
                      <p className={`text-lg font-bold ${getPerformanceColor(viralLoadData.suppression_rate)}`}>
                        {Math.round(viralLoadData.suppression_rate)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {viralLoadData.suppressed} suppressed
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
  );
}
