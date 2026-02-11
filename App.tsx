
import React, { useState } from 'react';
import { UserRole, User, Report, ReportStatus, ReportType } from './types';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminKnowledgeBase from './pages/AdminKnowledgeBase';
import ManageReports from './pages/ManageReports';
import ChatBot from './components/ChatBot';
import Sidebar from './components/Sidebar';
import { Icons } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [reports, setReports] = useState<Report[]>([
    { id: 'ASTU-10234', type: ReportType.SECURITY, category: 'Suspicious Activity', description: 'Unattended bag in Library hall.', location: 'Main Library, 2nd Floor', priority: 'High', status: ReportStatus.OPEN, createdAt: '2024-03-20 10:30', userId: 'U1' },
    { id: 'ASTU-10235', type: ReportType.MAINTENANCE, category: 'Plumbing', description: 'Leaking pipe in Block C restroom.', location: 'Block C, Ground Floor', priority: 'Medium', status: ReportStatus.IN_REVIEW, createdAt: '2024-03-20 09:15', userId: 'U1' },
    { id: 'ASTU-10236', type: ReportType.SECURITY, category: 'Lost Item', description: 'Lost student ID near the cafeteria.', location: 'Cafeteria Entrance', priority: 'Low', status: ReportStatus.RESOLVED, createdAt: '2024-03-19 14:00', userId: 'U1' },
  ]);

  const handleLogin = (role: UserRole) => {
    const mockUser: User = {
      id: role === UserRole.ADMIN ? 'A1' : 'U1',
      email: role === UserRole.ADMIN ? 'admin@astu.edu.et' : 'student@astu.edu.et',
      name: role === UserRole.ADMIN ? 'Campus Registrar' : 'D. Bekele',
      role: role,
      universityId: role === UserRole.ADMIN ? 'ASTU/ADM/SEC-001' : 'ASTU/STU/10042'
    };
    setUser(mockUser);
    setView('app');
    setActiveTab(role === UserRole.ADMIN ? 'admin-dashboard' : 'dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setIsChatOpen(false);
  };

  const onAIReportGenerated = (data: any) => {
    const report: Report = {
      id: `ASTU-${Math.floor(10000 + Math.random() * 90000)}`,
      type: data.type,
      category: data.category,
      location: data.location,
      description: data.description,
      priority: data.priority || 'Medium',
      status: ReportStatus.OPEN,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      userId: user?.id || 'anonymous'
    };
    setReports(prev => [report, ...prev]);
  };

  const updateReportStatus = (id: string, status: ReportStatus) => {
    setReports(reports.map(r => r.id === id ? { ...r, status } : r));
  };

  const triggerAIReporting = () => {
    setIsChatOpen(true);
    if ((window as any).triggerAIReporting) {
      (window as any).triggerAIReporting();
    }
  };

  const renderContent = () => {
    if (!user) return null;

    if (user.role === UserRole.ADMIN) {
      switch (activeTab) {
        case 'admin-dashboard': return <AdminDashboard reports={reports} onManageAll={() => setActiveTab('admin-reports')} />;
        case 'admin-reports': return <ManageReports reports={reports} updateStatus={updateReportStatus} />;
        case 'admin-rag': return <AdminKnowledgeBase />;
        default: return <AdminDashboard reports={reports} onManageAll={() => setActiveTab('admin-reports')} />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard': return <StudentDashboard user={user} reports={reports} onReportClick={triggerAIReporting} />;
        case 'notifications': return (
          <div className="bg-white p-20 rounded-[48px] shadow-sm border border-gray-100 text-center max-w-4xl mx-auto">
            <div className="text-[#17A2B8] scale-150 mb-8 flex justify-center"><Icons.Bell /></div>
            <h3 className="text-2xl font-black text-[#0F2A3D] uppercase tracking-tighter">Emergency Broadcasts</h3>
            <p className="text-gray-400 font-bold text-sm mt-4 uppercase tracking-widest italic">No critical safety alerts have been issued in the current cycle.</p>
          </div>
        );
        default: return <StudentDashboard user={user} reports={reports} onReportClick={triggerAIReporting} />;
      }
    }
  };

  if (view === 'landing') return <LandingPage onGetStarted={() => setView('login')} />;
  if (view === 'login') return <LoginPage onLogin={handleLogin} onBack={() => setView('landing')} />;

  return (
    <div className="flex h-screen bg-[#F4F8FA]">
      <Sidebar 
        role={user?.role || UserRole.STUDENT} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout}
        onReportClick={triggerAIReporting}
      />
      <main className="flex-1 ml-64 overflow-y-auto relative">
        {/* Institutional Background Element */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.015] flex items-center justify-center">
           <div className="scale-[5]"><Icons.ASTULogo /></div>
        </div>
        
        <header className="h-24 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-12 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="h-10 w-1.5 bg-[#17A2B8] rounded-full"></div>
             <span className="font-black text-[#0F2A3D] text-2xl uppercase tracking-tighter">
              {activeTab.replace('admin-', '').replace('-', ' ')}
             </span>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <div className="text-sm font-black text-[#0F2A3D] tracking-tight">{user?.name}</div>
              <div className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">{user?.universityId}</div>
            </div>
            <div className="bg-[#F4F8FA] p-3 rounded-2xl border border-gray-100 shadow-inner">
               <Icons.ASTULogo />
            </div>
          </div>
        </header>
        
        <div className="p-12 relative z-10">
          {renderContent()}
        </div>
      </main>
      <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} onReportGenerated={onAIReportGenerated} />
    </div>
  );
};

export default App;
