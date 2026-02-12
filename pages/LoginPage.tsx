
import React, { useState } from 'react';
import { UserRole } from '../types';
import { Icons } from '../constants';

interface LoginPageProps {
  onLogin: (role: UserRole, data?: any) => void;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack }) => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(role, isSignup ? { name, email, universityId, password } : { email, password });
  };

  return (
    <div className="min-h-screen bg-[#F4F8FA] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 p-2">
        <div className="bg-[#17A2B8] p-12 rounded-[36px] text-white text-center relative overflow-hidden">
          {/* Institutional Decal */}
          <div className="absolute top-0 right-0 opacity-10 -mr-12 -mt-12 scale-150 transform rotate-12">
            <Icons.ASTULogo />
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-white p-6 rounded-[32px] shadow-2xl ring-12 ring-white/10">
              <Icons.ASTULogo />
            </div>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">
            {isSignup ? 'Create Account' : 'Unified Access'}
          </h2>
          <p className="opacity-80 text-[10px] font-black mt-3 tracking-[0.3em] uppercase">University Safety Node</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <button
              type="button"
              onClick={() => setRole(UserRole.STUDENT)}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${role === UserRole.STUDENT ? 'bg-white shadow-xl text-[#17A2B8] border border-gray-100' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole(UserRole.ADMIN)}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${role === UserRole.ADMIN ? 'bg-white shadow-xl text-[#17A2B8] border border-gray-100' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              Admin
            </button>
          </div>

          <div className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-6 py-5 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-[#17A2B8] outline-none transition-all font-bold text-sm shadow-inner"
                  required={isSignup}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Institutional Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === UserRole.ADMIN ? 'registrar@astu.edu.et' : 'astu_stu_10042@astu.edu.et'}
                className="w-full px-6 py-5 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-[#17A2B8] outline-none transition-all font-bold text-sm shadow-inner"
                required
              />
            </div>

            {isSignup && role === UserRole.STUDENT && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">University ID (ugr/XXXXX/XX)</label>
                <input
                  type="text"
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value.toLowerCase())}
                  placeholder="ugr/12345/16"
                  className="w-full px-6 py-5 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-[#17A2B8] outline-none transition-all font-bold text-sm shadow-inner"
                  pattern="ugr/\d{5}/\d{2}"
                  title="Format: ugr/XXXXX/XX (e.g., ugr/12345/16)"
                  required={isSignup && role === UserRole.STUDENT}
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secure Passcode</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-5 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-[#17A2B8] outline-none transition-all font-bold text-sm shadow-inner"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0F2A3D] text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-[#0F2A3D]/90 active:scale-[0.98] transition-all text-xs"
          >
            {isSignup ? 'Register Now' : 'Log In Securely'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-[10px] font-black text-[#17A2B8] uppercase tracking-widest hover:underline"
            >
              {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div className="flex items-center gap-3 justify-center text-[10px] font-black text-gray-300 uppercase tracking-widest pt-2">
            <Icons.Lock />
            <span>256-Bit SSL Secured</span>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 transition-colors pt-4"
          >
            Back to Public Domain
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
