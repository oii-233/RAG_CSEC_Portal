
import React from 'react';
import { Report, ReportStatus, ReportType } from '../types';
import { Icons } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';

interface AdminDashboardProps {
  reports: Report[];
  onManageAll?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ reports, onManageAll }) => {
  const stats = [
    { label: 'Total Logs', value: reports.length, icon: Icons.Layout, color: 'text-blue-600' },
    { label: 'Active Alerts', value: reports.filter(r => r.status === ReportStatus.OPEN).length, icon: Icons.Alert, color: 'text-red-600' },
    { label: 'Closed Cases', value: reports.filter(r => r.status === ReportStatus.RESOLVED).length, icon: Icons.Shield, color: 'text-green-600' },
    { label: 'Security Ratio', value: `${Math.round((reports.filter(r => r.type === ReportType.SECURITY).length / reports.length) * 100)}%`, icon: Icons.Shield, color: 'text-[#17A2B8]' },
  ];

  const pieData = [
    { name: 'Security', value: reports.filter(r => r.type === ReportType.SECURITY).length },
    { name: 'Maintenance', value: reports.filter(r => r.type === ReportType.MAINTENANCE).length },
  ];

  const PIE_COLORS = ['#C62828', '#17A2B8'];

  const recentUrgent = reports.filter(r => r.priority === 'Critical' || r.priority === 'High').slice(0, 3);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between h-40">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
              <div className={`${stat.color} opacity-80 scale-75`}><stat.icon /></div>
            </div>
            <div className="text-4xl font-black text-[#0F2A3D] tracking-tighter">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Urgent Attention Node */}
        <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-red-50/20">
            <h3 className="font-black text-[#0F2A3D] uppercase tracking-widest text-xs">Priority Interventions</h3>
            <button onClick={onManageAll} className="text-[10px] font-black text-[#17A2B8] uppercase tracking-widest hover:underline">Full Registry</button>
          </div>
          <div className="flex-1 divide-y divide-gray-50">
            {recentUrgent.length > 0 ? recentUrgent.map((item, i) => (
              <div key={i} className="px-10 py-8 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex gap-6 items-center">
                   <div className="bg-red-100 p-3 rounded-2xl text-red-600"><Icons.Alert /></div>
                   <div>
                     <p className="font-black text-[#0F2A3D] leading-none mb-1 uppercase tracking-tight">{item.category}</p>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.location} • ID: {item.id}</p>
                   </div>
                </div>
                <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{item.priority}</span>
              </div>
            )) : (
              <div className="p-20 text-center text-gray-300 font-bold uppercase tracking-widest text-sm italic">Zero critical alerts logged</div>
            )}
          </div>
        </div>

        {/* Intelligence Breakdown */}
        <div className="bg-[#0F2A3D] p-10 rounded-[48px] shadow-xl text-white">
          <h3 className="font-black uppercase tracking-widest text-xs mb-10 text-gray-400">Departmental Distribution</h3>
          <div className="h-64 flex flex-col items-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={10} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', backgroundColor: '#0F2A3D', border: '1px solid #17A2B8', color: '#fff' }} />
                </PieChart>
             </ResponsiveContainer>
             <div className="flex gap-8 mt-6">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{d.name}: {d.value}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[#17A2B8]/5 p-8 rounded-[40px] border border-[#17A2B8]/10 flex items-center gap-8">
         <div className="bg-[#17A2B8] text-white p-4 rounded-3xl"><Icons.Shield /></div>
         <div>
           <h4 className="font-black text-[#0F2A3D] uppercase tracking-widest text-xs mb-1">Administrative Note</h4>
           <p className="text-gray-500 text-sm font-medium leading-relaxed">System is performing real-time embedding sync with university databases. All logged sessions are recorded for audit compliance.</p>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
