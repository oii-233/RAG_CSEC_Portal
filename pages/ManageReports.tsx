
import React, { useState } from 'react';
import { Report, ReportStatus, ReportType } from '../types';
import { Icons } from '../constants';

interface ManageReportsProps {
  reports: Report[];
  updateStatus: (id: string, status: ReportStatus) => void;
}

const ManageReports: React.FC<ManageReportsProps> = ({ reports, updateStatus }) => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.OPEN:
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-[10px] font-black uppercase tracking-widest border border-yellow-200">Open</span>;
      case ReportStatus.IN_REVIEW:
        return <span className="px-3 py-1 bg-[#17A2B8]/10 text-[#17A2B8] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[#17A2B8]/20 text-center">In Audit</span>;
      case ReportStatus.RESOLVED:
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-200">Resolved</span>;
    }
  };

  const getPriorityBadge = (p: string) => {
    const colors = p === 'Critical' ? 'bg-red-600 text-white' : p === 'High' ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-gray-50 text-gray-400 border border-gray-100';
    return <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.1em] ${colors}`}>{p}</span>;
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto px-4 md:px-0">
      <div className="bg-white rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-10 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/20 gap-4">
          <div>
            <h3 className="font-black text-[#0F2A3D] text-xl md:text-3xl tracking-tighter uppercase">Incident Registry</h3>
            <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Verified Official Event Log</p>
          </div>
          <button className="w-full sm:w-auto bg-[#0F2A3D] text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-[#0F2A3D]/90 transition-all active:scale-95 shadow-xl">
            Download Case Inventory
          </button>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-white text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <th className="px-6 md:px-10 py-6 md:py-8">Reference ID</th>
                <th className="px-6 md:px-10 py-6 md:py-8">Focus Area</th>
                <th className="px-6 md:px-10 py-6 md:py-8">Priority</th>
                <th className="px-6 md:px-10 py-6 md:py-8">Audit Status</th>
                <th className="px-6 md:px-10 py-6 md:py-8">Logged At</th>
                <th className="px-6 md:px-10 py-6 md:py-8 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 md:px-10 py-4 md:py-6 font-mono text-xs font-black text-[#0F2A3D]">{report.id}</td>
                  <td className="px-6 md:px-10 py-4 md:py-6">
                    <div className="flex flex-col">
                      <span className="text-xs md:text-sm font-black text-gray-800 leading-none mb-1">{report.category}</span>
                      <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${report.type === ReportType.SECURITY ? 'text-red-500' : 'text-[#17A2B8]'}`}>{report.type}</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-10 py-4 md:py-6">{getPriorityBadge(report.priority || 'Medium')}</td>
                  <td className="px-6 md:px-10 py-4 md:py-6">{getStatusBadge(report.status)}</td>
                  <td className="px-6 md:px-10 py-4 md:py-6 text-[10px] md:text-xs text-gray-400 font-medium">{report.createdAt}</td>
                  <td className="px-6 md:px-10 py-4 md:py-6 text-right">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-[#17A2B8] hover:bg-[#17A2B8]/5 p-2 md:p-3 rounded-2xl transition-all active:scale-90"
                    >
                      <Icons.Search />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-[#0F2A3D]/95 backdrop-blur-xl z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="bg-white w-full max-w-2xl sm:rounded-[48px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 border-0 sm:border-8 border-white h-[90vh] sm:h-auto flex flex-col">
            <div className={`p-8 md:p-12 text-white flex justify-between items-center flex-shrink-0 ${selectedReport.type === ReportType.SECURITY ? 'bg-[#C62828]' : 'bg-[#17A2B8]'}`}>
              <div>
                <h3 className="font-black text-2xl md:text-4xl tracking-tighter uppercase truncate max-w-[200px] sm:max-w-none">CASE FILE: {selectedReport.id}</h3>
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">Official University Record</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="hover:bg-white/20 p-2 rounded-2xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="md:w-8 md:h-8"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="p-8 md:p-16 space-y-8 md:space-y-10 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">
                <div>
                  <span className="text-[9px] md:text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-2 md:mb-3">Logged Priority</span>
                  <div className="font-black text-[#0F2A3D] text-xl md:text-2xl uppercase tracking-tighter">{selectedReport.priority || 'MEDIUM'}</div>
                </div>
                <div>
                  <span className="text-[9px] md:text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-2 md:mb-3">Registry Location</span>
                  <div className="font-black text-[#0F2A3D] text-xl md:text-2xl tracking-tighter">{selectedReport.location}</div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 md:p-10 rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-inner">
                <span className="text-[9px] md:text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-4">Case Statement</span>
                <p className="text-gray-700 leading-relaxed font-bold italic text-base md:text-lg">
                  "{selectedReport.description}"
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                <span className="text-[9px] md:text-[10px] uppercase font-black text-gray-400 tracking-widest block text-center">Official Status Override</span>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {[ReportStatus.OPEN, ReportStatus.IN_REVIEW, ReportStatus.RESOLVED].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        updateStatus(selectedReport.id, status);
                        setSelectedReport({ ...selectedReport, status });
                      }}
                      className={`flex-1 py-4 md:py-5 px-3 rounded-xl md:rounded-[24px] text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all border-2 ${selectedReport.status === status
                          ? 'bg-[#17A2B8] text-white border-[#17A2B8] shadow-2xl shadow-[#17A2B8]/30'
                          : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 shadow-sm'
                        }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4 opacity-30 pb-4">
                <Icons.Lock />
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em]">Secure Audit Trail Encryption Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReports;
