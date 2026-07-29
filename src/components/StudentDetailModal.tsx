import React, { useState } from 'react';
import { X, User, Calendar as CalendarIcon, Download, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { Student, AttendanceStatus, AttendanceRecord } from '../types';
import { calculateAttendanceStats, calculateStudentFeeSummary, formatDateReadable, getMonthDisplayName, getMonthKey, getRequiredMonthsForStudent } from '../utils/feeCalculator';
import { generateStudentPDF, generateTodayStudentPDF } from '../utils/pdfGenerator';

interface StudentDetailModalProps {
  student: Student;
  currentDateStr: string;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onUpdateAttendance: (studentId: string, dateStr: string, status: AttendanceStatus, isOverride?: boolean) => void;
  onToggleFeeStatus: (studentId: string, monthKey: string, status: 'Paid' | 'Pending') => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  currentDateStr,
  onClose,
  onEdit,
  onUpdateAttendance,
  onToggleFeeStatus,
}) => {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(currentDateStr.substring(0, 7)); // e.g. "2026-01"
  const [activeTab, setActiveTab] = useState<'Overview' | 'Calendar' | 'Fees' | 'History'>('Overview');

  // Month-wise Stats calculation
  const currentMonthStats = calculateAttendanceStats(student, selectedMonthKey);
  const feeSummary = calculateStudentFeeSummary(student, currentDateStr);
  const requiredMonths = getRequiredMonthsForStudent(student, currentDateStr);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonthKey.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    setSelectedMonthKey(getMonthKey(date));
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonthKey.split('-').map(Number);
    const date = new Date(y, m, 1);
    setSelectedMonthKey(getMonthKey(date));
  };

  // Generate calendar days for selectedMonthKey
  const [yearNum, monthNum] = selectedMonthKey.split('-').map(Number);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const firstDayOfWeek = new Date(yearNum, monthNum - 1, 1).getDay(); // 0 = Sunday

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar - Geometric Navy #1E3A8A (No profile picture) */}
        <div className="p-4 sm:p-6 bg-[#1E3A8A] text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{student.name}</h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FCD34D] text-[#1E3A8A]">
                Class {student.studentClass}
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Joined: {formatDateReadable(student.joiningDate)} • Active Month: {getMonthDisplayName(selectedMonthKey)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons & Tabs Toolbar */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('Overview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'Overview'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('Calendar')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'Calendar'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Mark Attendance
            </button>
            <button
              onClick={() => setActiveTab('Fees')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'Fees'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Fees Management
            </button>
            <button
              onClick={() => setActiveTab('History')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'History'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Attendance History
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generateTodayStudentPDF(student)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Download Today PDF</span>
            </button>
            <button
              onClick={() => generateStudentPDF(student, selectedMonthKey)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-[#1E3A8A] bg-[#FCD34D] hover:bg-amber-400 rounded-lg transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Monthly PDF</span>
            </button>
            <button
              onClick={() => onEdit(student)}
              className="p-1.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              title="Edit Student"
            >
              <Edit3 className="w-4 h-4 text-amber-600" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* OVERVIEW TAB */}
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              {/* Month Selector Control Header */}
              <div className="flex items-center justify-between bg-[#F8FAFC] dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Viewing Month</span>
                  <div className="text-base font-extrabold text-[#1E3A8A] dark:text-blue-300">
                    {getMonthDisplayName(selectedMonthKey)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold font-mono px-2 text-slate-700 dark:text-slate-300">
                    {selectedMonthKey}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Attendance Month Metrics */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-[#1E3A8A] dark:text-blue-300 uppercase tracking-wider mb-4">
                  Month Attendance Summary ({getMonthDisplayName(selectedMonthKey)})
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#DEF7EC] p-4 rounded-xl border border-emerald-200 text-center">
                    <span className="text-xs font-bold text-[#03543F]">Present Days</span>
                    <div className="text-2xl font-black text-[#059669] mt-1">
                      {currentMonthStats.present}
                    </div>
                  </div>

                  <div className="bg-[#FDF2F2] p-4 rounded-xl border border-red-200 text-center">
                    <span className="text-xs font-bold text-[#9B1C1C]">Absent Days</span>
                    <div className="text-2xl font-black text-[#DC2626] mt-1">
                      {currentMonthStats.absent}
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-200/60 text-center">
                    <span className="text-xs font-bold text-purple-800 dark:text-purple-300">Holidays</span>
                    <div className="text-2xl font-black text-[#6366F1] mt-1">
                      {currentMonthStats.holiday}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200/60 text-center flex flex-col justify-center items-center">
                    <span className="text-xs font-bold text-[#1E3A8A] dark:text-blue-300">Attendance %</span>
                    <div className="text-2xl font-black text-[#1E3A8A] dark:text-blue-400 mt-1">
                      {currentMonthStats.percentage}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CALENDAR TAB */}
          {(activeTab === 'Calendar' || activeTab === 'Overview') && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#1E3A8A]" />
                  <span>Calendar Attendance - {getMonthDisplayName(selectedMonthKey)}</span>
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {selectedMonthKey}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                💡 <strong>Sunday Rule:</strong> Sundays automatically default to <strong>Holiday</strong>. Click any date box to toggle status (Present / Absent / Holiday).
              </p>

              {/* Calendar Grid Header S M T W T F S */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-slate-500 mb-2">
                <span className="text-red-500">S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                  <div key={`blank-${idx}`} className="h-14 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl" />
                ))}

                {daysArray.map((day) => {
                  const dayStr = String(day).padStart(2, '0');
                  const fullDateStr = `${selectedMonthKey}-${dayStr}`;
                  const dateObj = new Date(yearNum, monthNum - 1, day);
                  const isSunday = dateObj.getDay() === 0;

                  const existingRecord = student.attendance[fullDateStr];
                  const currentStatus = existingRecord?.status || (isSunday ? 'Holiday' : undefined);

                  return (
                    <div
                      key={fullDateStr}
                      className={`h-16 p-1.5 rounded-xl border flex flex-col justify-between items-center transition-all cursor-pointer group ${
                        currentStatus === 'Present'
                          ? 'bg-[#DEF7EC] border-emerald-300 text-[#03543F]'
                          : currentStatus === 'Absent'
                          ? 'bg-[#FDF2F2] border-red-300 text-[#9B1C1C]'
                          : currentStatus === 'Holiday'
                          ? 'bg-purple-50 border-purple-300 text-purple-900'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#1E3A8A]'
                      }`}
                      onClick={() => {
                        let nextStatus: AttendanceStatus = 'Present';
                        if (currentStatus === 'Present') nextStatus = 'Absent';
                        else if (currentStatus === 'Absent') nextStatus = 'Holiday';
                        else if (currentStatus === 'Holiday') nextStatus = 'Present';

                        onUpdateAttendance(student.id, fullDateStr, nextStatus, isSunday);
                      }}
                    >
                      <div className="w-full flex items-center justify-between text-[11px] font-bold">
                        <span className={isSunday ? 'text-red-600 font-extrabold' : ''}>{day}</span>
                        {existingRecord?.isOverride && (
                          <span className="text-[9px] bg-amber-500 text-white px-1 rounded">Special</span>
                        )}
                      </div>

                      <div className="text-[10px] font-extrabold uppercase tracking-wider">
                        {currentStatus || 'Mark'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FEES TAB */}
          {activeTab === 'Fees' && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Month Fee Status Management
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Click 'Paid' or 'Pending' to toggle monthly status.
                  </p>
                </div>
              </div>

              {/* Month Fee Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {requiredMonths.map((mKey) => {
                  const displayName = getMonthDisplayName(mKey);
                  const feeRec = student.fees[mKey];
                  const isPaid = feeRec?.status === 'Paid';

                  return (
                    <div
                      key={mKey}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        isPaid
                          ? 'bg-[#DEF7EC] border-emerald-200'
                          : 'bg-[#FDF2F2] border-red-200'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {displayName}
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleFeeStatus(student.id, mKey, isPaid ? 'Pending' : 'Paid')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer ${
                          isPaid
                            ? 'bg-[#03543F] text-white hover:bg-emerald-800'
                            : 'bg-[#9B1C1C] text-white hover:bg-red-800'
                        }`}
                      >
                        {isPaid ? 'PAID ✓' : 'PENDING'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'History' && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Attendance History Log
              </h3>

              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] dark:bg-slate-900 text-xs font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(Object.values(student.attendance) as AttendanceRecord[])
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((r) => (
                        <tr key={r.date} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                            {formatDateReadable(r.date)}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                r.status === 'Present'
                                  ? 'bg-[#DEF7EC] text-[#03543F]'
                                  : r.status === 'Absent'
                                  ? 'bg-[#FDF2F2] text-[#9B1C1C]'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
