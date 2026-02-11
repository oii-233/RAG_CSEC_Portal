
import React from 'react';
import { User, Report, ReportStatus } from '../types';
import { Icons } from '../constants';

// Added reports to interface to fix type mismatch in App.tsx
interface StudentDashboardProps {
  user: User;
  reports: Report[];
  onReportClick: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, reports, onReportClick }) => {
  // Filter reports to only show those belonging to the current user for privacy
  const userReports = reports.filter(r => r.userId === user.id);
  const activeReportsCount = userReports.filter(r => r.status !== ReportStatus.RESOLVED).length;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Institutional Verification */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-4xl font-black text-[#0F2A3D] tracking-tighter">Campus Safety Node</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Session: {user.universityId}</span>
            <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Verified Identity</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
             <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-[#0F2A3D] uppercase tracking-widest">Campus Status: Secure</span>
          </div>
          {activeReportsCount > 0 && (
            <span className="text-[9px] font-black text-[#17A2B8] uppercase tracking-widest">
              {activeReportsCount} ACTIVE CASE{activeReportsCount > 1 ? 'S' : ''} IN REGISTRY
            </span>
          )}
        </div>
      </div>

      {/* Primary Action Card */}
      <div className="relative">
        <button
          onClick={onReportClick}
          className="w-full bg-[#17A2B8] p-16 rounded-[48px] shadow-2xl hover:shadow-[#17A2B8]/30 hover:-translate-y-2 transition-all group overflow-hidden flex flex-col items-center text-center space-y-6"
        >
          {/* Subtle Watermark Decoration */}
          <div className="absolute top-0 right-0 p-12 opacity-5 transform scale-150 rotate-12 transition-transform group-hover:rotate-45">
            <Icons.Shield />
          </div>
          <div className="absolute bottom-0 left-0 p-12 opacity-5 transform scale-150 -rotate-12 transition-transform group-hover:-rotate-45">
            <Icons.Alert />
          </div>

          <div className="bg-white/20 p-6 rounded-full text-white shadow-inner">
            <Icons.Shield />
          </div>
          
          <div className="relative z-10 max-w-xl">
            <h3 className="text-6xl font-black text-white tracking-tighter mb-4">I REPORT IT</h3>
            <p className="text-white/80 font-bold text-xl leading-relaxed">
              Initiate an AI-guided secure session. No forms. Just talk to the assistant to log your case.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-white pt-4">
            <div className="bg-[#0F2A3D] px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl group-hover:bg-[#0F2A3D]/90">
              Start AI Assistant
            </div>
            <Icons.Lock />
          </div>
        </button>
      </div>

      {/* User specific report history visualization */}
      {userReports.length > 0 && (
        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-2xl font-black text-[#0F2A3D] tracking-tight uppercase">Your Case History</h4>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{userReports.length} ENTRIES</span>
          </div>
          <div className="space-y-4">
            {userReports.slice(0, 3).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#17A2B8]/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${report.status === ReportStatus.RESOLVED ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {report.status === ReportStatus.RESOLVED ? <Icons.Shield /> : <Icons.Alert />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0F2A3D]">{report.category}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest">{report.location} • {report.createdAt}</div>
                  </div>
                </div>
                <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                  report.status === ReportStatus.RESOLVED ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                }`}>
                  {report.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Realistic Info Nodes */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="text-[#17A2B8] mb-6"><Icons.Book /></div>
            <h4 className="text-2xl font-black text-[#0F2A3D] tracking-tight mb-2">Policy Intelligence</h4>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              Ask about emergency protocols, campus boundaries, or department office hours.
            </p>
          </div>
          <button 
            onClick={() => onReportClick()}
            className="mt-8 flex items-center gap-2 font-black text-[#17A2B8] uppercase text-xs tracking-widest hover:translate-x-1 transition-transform"
          >
            Access RAG Knowledge <Icons.Search />
          </button>
        </div>

        <div className="bg-[#0F2A3D] p-10 rounded-[40px] shadow-xl text-white">
          <div className="flex justify-between items-start mb-10">
            <h3 className="font-black uppercase tracking-widest text-[10px] text-gray-400">Live Campus Bulletin</h3>
            <span className="text-[9px] font-black text-[#17A2B8] border border-[#17A2B8]/30 px-2 py-0.5 rounded uppercase">Real-time</span>
          </div>
          <div className="space-y-6">
            {[
              { label: 'SECURITY', msg: 'Improved lighting at Block B South.', time: '2h ago' },
              { label: 'FACILITY', msg: 'Maintenance finished in Science Lab 3.', time: '5h ago' }
            ].map((alert, i) => (
              <div key={i} className="flex flex-col gap-1 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-[#17A2B8] uppercase tracking-[0.2em]">{alert.label}</span>
                  <span className="text-[8px] text-gray-500 font-bold">{alert.time}</span>
                </div>
                <p className="text-xs font-bold text-gray-300">{alert.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 py-8">
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">
          <Icons.Lock /> Encrypted Institutional Infrastructure
        </div>
        <div className="text-[9px] text-gray-200 font-medium">Adama Science and Technology University © 2025</div>
      </div>
    </div>
  );
};

export default StudentDashboard;
