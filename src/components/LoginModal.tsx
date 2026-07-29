import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: () => void;
}

const PORTAL_PASSWORD = import.meta.env.VITE_PORTAL_PASSWORD;

export const LoginModal: React.FC<LoginModalProps> = ({
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === PORTAL_PASSWORD) {
      setError('');
      setPassword('');
      onLoginSuccess();
    } else {
      setError('Incorrect Password! Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all">

        {/* Header */}
        <div className="bg-[#1E3A8A] p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-[#FCD34D] text-[#1E3A8A] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md font-bold">
            <GraduationCap className="w-9 h-9" />
          </div>

          <h1 className="text-2xl font-black tracking-wider uppercase">
            VERMA CLASSES
          </h1>

          <p className="text-blue-200 text-xs font-semibold tracking-wide mt-1 uppercase">
            Teacher &amp; Admin Portal
          </p>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="flex items-center justify-center gap-2 mb-6 text-slate-800 dark:text-slate-200 font-bold text-base">
            <Lock className="w-5 h-5 text-[#1E3A8A] dark:text-blue-400" />
            <span>Enter Portal Access Password</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  autoFocus
                  placeholder="Enter password..."
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all font-mono text-base font-semibold"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-700 dark:text-red-400 text-xs font-bold bg-[#FDF2F2] dark:bg-red-950/50 p-3 rounded-xl border border-red-200 dark:border-red-900">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#FCD34D] hover:bg-amber-400 active:scale-[0.99] text-[#1E3A8A] font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Login to Portal</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};