
import React from 'react';
import { Icons, COLORS } from '../constants';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onReportClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, onTabChange, onLogout, onReportClick }) => {
  const menuItems = role === UserRole.ADMIN ? [
    { id: 'admin-dashboard', label: 'Dashboard', icon: Icons.Layout },
    { id: 'admin-reports', label: 'Incident Registry', icon: Icons.Alert },
    { id: 'admin-rag', label: 'Knowledge Base', icon: Icons.Book },
    { id: 'admin-analytics', label: 'Analytics', icon: Icons.BarChart },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Layout },
    { id: 'notifications', label: 'Safety Alerts', icon: Icons.Bell },
  ];

  return (
    <aside className="w-64 bg-[#0F2A3D] text-white h-screen fixed left-0 top-0 flex flex-col z-50 shadow-2xl">
      <div className="p-8 border-b border-white/5 flex items-center gap-4">
        <Icons.ASTULogo />
        <div className="font-black text-sm leading-none tracking-tighter uppercase">
          ASTU <br />
          <span className="text-[#17A2B8] text-[10px] tracking-widest">Smart Safety</span>
        </div>
      </div>

      <div className="flex-1 mt-8 px-4 space-y-2">
        {role === UserRole.STUDENT && (
          <button
            onClick={onReportClick}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl bg-[#17A2B8] text-white shadow-lg hover:shadow-[#17A2B8]/20 transition-all active:scale-95 mb-6 font-bold text-sm"
          >
            <Icons.Shield />
            <span>I REPORT IT</span>
          </button>
        )}

        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
              activeTab === item.id 
                ? 'bg-white/10 text-[#17A2B8]' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 border-t border-white/5 space-y-4">
        <div className="bg-[#17A2B8]/5 p-4 rounded-xl border border-[#17A2B8]/10">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Emergency</p>
          <p className="text-sm font-bold text-[#17A2B8]">+251 XXX XXXX</p>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/5 rounded-xl transition-colors font-bold text-sm"
        >
          <Icons.LogOut />
          <span>Secure Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
