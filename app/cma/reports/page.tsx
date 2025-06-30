'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SPEEDInterceptor from '@/app/api/interceptors/SPEEDInterceptor';
import { CaseManagerPerformance } from '@/app/types/case_manager';
import { CMTPerformanceData } from '@/app/types/cmt';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import { FaFileCsv, FaFilePdf, FaChartBar, FaUsers } from 'react-icons/fa';

interface ReportType {
  id: string;
  name: string;
  description: string;
  data: () => any[];
  columns: string[];
  icon: React.ReactNode;
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null);
  const [loading, setLoading] = useState(true);
  const [caseManagerData, setCaseManagerData] = useState<CaseManagerPerformance[]>([]);
  const [cmtData, setCmtData] = useState<CMTPerformanceData[]>([]);
console.log("User Roles:", user?.roles);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [caseManagerResponse, cmtResponse] = await Promise.all([
          SPEEDInterceptor.get(`${process.env.NEXT_PUBLIC_baseURL}/performance/case-managers`),
          SPEEDInterceptor.get(`${process.env.NEXT_PUBLIC_baseURL}/performance/cmts`)
        ]);
        setCaseManagerData(caseManagerResponse.data);
        setCmtData(cmtResponse.data);
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.access_token) {
      fetchData();
    }
  }, [user?.access_token]);

  const reports: ReportType[] = [
    {
      id: 'case-managers-performance',
      name: 'Case Managers Performance',
      description: 'Detailed performance metrics for all case managers',
      icon: <FaUsers className="w-6 h-6 text-[#096D49]" />,
      data: () => caseManagerData.map(cm => ({
        'Name': cm.case_manager.fullname,
        'Role': cm.case_manager.role,
        'State': cm.case_manager.state,
        'CMT': cm.case_manager.cmt,
        'TX_CURR': cm.performance.tx_cur,
        'IIT': cm.performance.iit,
        'Appointment Compliance (%)': cm.performance.appointment_compliance,
        'Appointment Details': `${cm.performance.appointments_completed}/${cm.performance.appointments_schedule}`,
        'VL Coverage (%)': (cm.performance.viral_load_samples / cm.performance.viral_load_eligible * 100).toFixed(1),
        'VL Coverage Details': `${cm.performance.viral_load_samples}/${cm.performance.viral_load_eligible}`,
        'VL Suppression (%)': cm.performance.suppression_rate,
        'VL Suppression Details': `${cm.performance.viral_load_suppressed}/${cm.performance.viral_load_results}`,
        'Overall Score': cm.performance.final_score
      })),
      columns: [
        'Name', 'Role', 'State', 'CMT', 'TX_CURR', 'IIT',
        'Appointment Compliance (%)', 'Appointment Details',
        'VL Coverage (%)', 'VL Coverage Details',
        'VL Suppression (%)', 'VL Suppression Details',
        'Overall Score'
      ]
    },
    {
      id: 'team-summary',
      name: 'CMT Performance Summary',
      description: 'Comprehensive summary of all case management teams',
      icon: <FaChartBar className="w-6 h-6 text-[#096D49]" />,
      data: () => cmtData.map(cmt => ({
        'CMT': cmt.cmt,
        'State': cmt.state,
        'Case Managers': cmt.case_managers_count,
        'TX_CURR': cmt.tx_cur,
        'IIT': cmt.iit,
        'Appointment Compliance (%)': cmt.appointments.completion_rate,
        'Appointment Details': `${cmt.appointments.completed}/${cmt.appointments.scheduled}`,
        'VL Coverage (%)': (cmt.viral_load.results / cmt.viral_load.eligible * 100).toFixed(1),
        'VL Coverage Details': `${cmt.viral_load.results}/${cmt.viral_load.eligible}`,
        'VL Suppression (%)': cmt.viral_load.suppression_rate,
        'VL Suppression Details': `${cmt.viral_load.suppressed}/${cmt.viral_load.results}`,
        'Overall Score': cmt.average_score
      })),
      columns: [
        'CMT', 'State', 'Case Managers', 'TX_CURR', 'IIT',
        'Appointment Compliance (%)', 'Appointment Details',
        'VL Coverage (%)', 'VL Coverage Details',
        'VL Suppression (%)', 'VL Suppression Details',
        'Overall Score'
      ]
    }
  ];

  const getSelectedReportData = () => {
    const report = reports.find(r => r.id === selectedReport);
    return report ? report.data() : [];
  };

  const exportToPDF = async () => {
    setExporting('pdf');
    const report = reports.find(r => r.id === selectedReport);
    if (!report) return;

    try {
      const doc = new jsPDF();
      const data = report.data();

      // Add header
      doc.setFontSize(16);
      doc.text(report.name, 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 25);
      doc.text(`Generated by: ${user?.name}`, 14, 32);

      // Create table with all metrics
      (doc as any).autoTable({
        startY: 40,
        head: [report.columns],
        body: data.map(row => report.columns.map(col => row[col])),
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [9, 109, 73] }
      });

      doc.save(`${report.id}-${new Date().toISOString().split('T')[0]}.pdf`);
    } finally {
      setExporting(null);
    }
  };

  const exportToCSV = async () => {
    setExporting('csv');
    const report = reports.find(r => r.id === selectedReport);
    if (!report) return;

    try {
      const data = report.data();
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${report.id}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setExporting(null);
    }
  };

  // Add loading state to the UI
  if (loading) {
    return (
      <div className="p-6 flex justify-center h-min-screen items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#096D49]"></div>
      </div>
    );
  }


  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">
            {user?.state ? `${user.state} State View` : 'National View'}
          </p>
        </div>
      </div>

      {/* Report Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all duration-200 ${
              selectedReport === report.id
                ? 'ring-2 ring-[#096D49] ring-opacity-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedReport(report.id)}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-[#096D49] bg-opacity-10 rounded-lg">
                {report.icon}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{report.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Content */}
      {selectedReport && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {reports.find(r => r.id === selectedReport)?.icon}
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {reports.find(r => r.id === selectedReport)?.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Generated on {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={exportToCSV}
                  disabled={exporting === 'csv'}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#096D49] disabled:opacity-50 transition-colors"
                >
                  <FaFileCsv className="mr-2 h-4 w-4" />
                  {exporting === 'csv' ? 'Exporting...' : 'Export as CSV'}
                </button>
                <button
                  onClick={exportToPDF}
                  disabled={exporting === 'pdf'}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#096D49] hover:bg-[#075238] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#096D49] disabled:opacity-50 transition-colors"
                >
                  <FaFilePdf className="mr-2 h-4 w-4" />
                  {exporting === 'pdf' ? 'Exporting...' : 'Export as PDF'}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {reports
                    .find(r => r.id === selectedReport)
                    ?.columns.map((column) => (
                      <th
                        key={column}
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getSelectedReportData().map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    {reports
                      .find(r => r.id === selectedReport)
                      ?.columns.map((column) => (
                        <td
                          key={column}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {row[column]}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}