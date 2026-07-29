import React from 'react';
import { Users, UserCheck, UserX, CalendarOff, IndianRupee, AlertCircle } from 'lucide-react';
import { DashboardStats as IDashboardStats, Student } from '../types';
import { formatCurrency, isBirthdayToday, isFeeDueTomorrow } from '../utils/feeCalculator';

interface DashboardStatsProps {
  stats: IDashboardStats;
  students: Student[];
  currentDateStr: string;
  onFilterClick?: (filterType: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  students,
  currentDateStr,
  onFilterClick,
}) => {
  const birthdayStudents = students.filter((s) => isBirthdayToday(s, currentDateStr));
  const feeDueStudents = students.filter((s) => isFeeDueTomorrow(s, currentDateStr));

  return (
    <div className="space-y-4 mb-6">
      {/* Birthday & Reminders Alert Banner - Geometric Yellow Alert */}
      {(birthdayStudents.length > 0 || feeDueStudents.length > 0) && (
        <div className="space-y-2">
          {birthdayStudents.map((s) => (
            <div
              key={`bday-${s.id}`}
              className="bg-[#FEF3C7] border border-[#F59E0B] p-3 rounded-lg flex items-center justify-between text-xs text-[#92400E]"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🎂</span>
                <span>
                  <b>Birthday Reminder:</b> Today is <b>{s.name}'s</b> Birthday! (Class {s.studentClass}) 🎉
                </span>
              </div>
            </div>
          ))}

          {feeDueStudents.map((s) => (
            <div
              key={`fee-${s.id}`}
              className="bg-orange-50 border border-orange-300 p-3 rounded-lg flex items-center justify-between text-xs text-orange-900"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 shrink-0" />
                <span>
                  <b>Fee Reminder:</b> Monthly Fees Due Tomorrow for <b>{s.name}</b> (Class {s.studentClass})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top 5 Geometric Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Students */}
        <div
          onClick={() => onFilterClick && onFilterClick('All')}
          className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-[#E2E8F0] dark:border-slate-800 flex flex-col justify-center cursor-pointer hover:border-[#1E3A8A] transition-all"
        >
          <span className="text-[11px] text-[#718096] uppercase tracking-wider font-semibold mb-1">
            Total Students
          </span>
          <span className="text-2xl font-black text-[#1E3A8A] dark:text-blue-400">
            {stats.totalStudents}
          </span>
        </div>

        {/* Present Today */}
        <div
          onClick={() => onFilterClick && onFilterClick('PresentToday')}
          className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-[#E2E8F0] dark:border-slate-800 flex flex-col justify-center cursor-pointer hover:border-emerald-600 transition-all"
        >
          <span className="text-[11px] text-[#718096] uppercase tracking-wider font-semibold mb-1">
            Present Today
          </span>
          <span className="text-2xl font-black text-[#059669]">
            {stats.presentToday}
          </span>
        </div>

        {/* Absent Today */}
        <div
          onClick={() => onFilterClick && onFilterClick('AbsentToday')}
          className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-[#E2E8F0] dark:border-slate-800 flex flex-col justify-center cursor-pointer hover:border-red-600 transition-all"
        >
          <span className="text-[11px] text-[#718096] uppercase tracking-wider font-semibold mb-1">
            Absent Today
          </span>
          <span className="text-2xl font-black text-[#DC2626]">
            {stats.absentToday}
          </span>
        </div>

        {/* Holiday */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-[#E2E8F0] dark:border-slate-800 flex flex-col justify-center">
          <span className="text-[11px] text-[#718096] uppercase tracking-wider font-semibold mb-1">
            Holiday
          </span>
          <span className="text-2xl font-black text-[#6366F1]">
            {stats.holidayToday}
          </span>
        </div>

        {/* Fees Pending */}
        <div
          onClick={() => onFilterClick && onFilterClick('FeesPending')}
          className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-[#E2E8F0] dark:border-slate-800 flex flex-col justify-center cursor-pointer hover:border-amber-600 transition-all col-span-2 sm:col-span-1"
        >
          <span className="text-[11px] text-[#718096] uppercase tracking-wider font-semibold mb-1">
            Fees Pending
          </span>
          <span className="text-2xl font-black text-[#D97706]">
            {formatCurrency(stats.totalFeesPending)}
          </span>
        </div>
      </div>
    </div>
  );
};
