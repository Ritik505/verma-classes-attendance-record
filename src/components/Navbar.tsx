import React from 'react';
import { GraduationCap, Sun, Moon, Database, Calendar, Lock } from 'lucide-react';
import { formatDateReadable } from '../utils/feeCalculator';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenBackupModal: () => void;
  onOpenMonthlyMatrix: () => void;
  onLogout: () => void;
  currentDateStr: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onOpenBackupModal,
  onOpenMonthlyMatrix,
  onLogout,
  currentDateStr,
}) => {
  return (
    <header className="bg-[#1E3A8A] text-white sticky top-0 z-30 shadow-md transition-colors border-b border-blue-900">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 min-h-[4rem] py-2 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Brand - Verma Classes */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FCD34D] text-[#1E3A8A] rounded-lg flex items-center justify-center font-bold shadow-xs shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-xl font-bold tracking-wider leading-tight uppercase truncate">
              Verma Classes
            </h1>
            <p className="text-[8px] sm:text-[10px] text-blue-200 tracking-wider sm:tracking-widest font-semibold uppercase truncate">
              Attendance & Fee Record
            </p>
          </div>
        </div>

        {/* Right Actions & Date */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Today's Date Display */}
          <div className="hidden md:flex flex-col text-right px-3 py-1 bg-white/10 rounded-lg border border-white/10">
            <span className="text-[9px] uppercase tracking-wider font-semibold text-blue-200">
              Today's Date
            </span>
            <span className="text-xs font-bold font-mono text-white">
              {formatDateReadable(currentDateStr)}
            </span>
          </div>

          {/* Monthly Matrix Button */}
          <button
            onClick={onOpenMonthlyMatrix}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all cursor-pointer"
            title="Monthly Calendar Matrix View"
          >
            <Calendar className="w-4 h-4 text-[#FCD34D]" />
            <span className="hidden sm:inline">Monthly Calendar</span>
          </button>

          {/* Backup Database Button */}
          <button
            onClick={onOpenBackupModal}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all cursor-pointer"
            title="Backup & Restore Database"
          >
            <Database className="w-4 h-4 text-emerald-300" />
            <span className="hidden sm:inline">Backup / Restore</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-blue-200" />
            )}
          </button>

          {/* Lock / Logout */}
          <button
            onClick={onLogout}
            className="p-2 text-red-200 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all cursor-pointer"
            title="Lock Session / Logout"
          >
            <Lock className="w-4 h-4 text-red-300" />
          </button>
        </div>
      </div>
    </header>
  );
};