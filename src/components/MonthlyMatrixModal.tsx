import React, { useState } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Student } from '../types';
import { calculateAttendanceStats, getMonthDisplayName, getMonthKey } from '../utils/feeCalculator';
import { exportStudentsToExcel } from '../utils/excelExporter';

interface MonthlyMatrixModalProps {
  students: Student[];
  currentDateStr: string;
  onClose: () => void;
}

export const MonthlyMatrixModal: React.FC<MonthlyMatrixModalProps> = ({
  students,
  currentDateStr,
  onClose,
}) => {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(currentDateStr.substring(0, 7));

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

  const [yearNum, monthNum] = selectedMonthKey.split('-').map(Number);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-3 sm:p-6 overflow-hidden">
      <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Monthly Class Attendance Calendar View</h2>
              <p className="text-xs text-slate-300">
                Matrix view of all student attendance records for {getMonthDisplayName(selectedMonthKey)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportStudentsToExcel(students, selectedMonthKey)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Month Selector Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-base font-bold text-slate-900 dark:text-white font-mono px-3">
              {getMonthDisplayName(selectedMonthKey)}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
              <span className="text-slate-700 dark:text-slate-300">P = Present</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-500 inline-block"></span>
              <span className="text-slate-700 dark:text-slate-300">A = Absent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purple-500 inline-block"></span>
              <span className="text-slate-700 dark:text-slate-300">H = Holiday</span>
            </div>
          </div>
        </div>

        {/* Scrollable Matrix Table */}
        <div className="overflow-auto flex-1 p-4">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase sticky top-0 z-10">
                <th className="p-2.5 text-left border border-slate-200 dark:border-slate-700 min-w-[140px]">
                  Student Name
                </th>
                <th className="p-2 text-center border border-slate-200 dark:border-slate-700 min-w-[50px]">
                  Class
                </th>
                {daysArray.map((day) => (
                  <th
                    key={day}
                    className="p-1 border border-slate-200 dark:border-slate-700 min-w-[28px] font-mono"
                  >
                    {day}
                  </th>
                ))}
                <th className="p-2 border border-slate-200 dark:border-slate-700 min-w-[60px]">
                  Total P
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((student) => {
                const monthStats = calculateAttendanceStats(student, selectedMonthKey);

                return (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 text-left font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                      {student.name}
                    </td>
                    <td className="p-2 border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-400">
                      {student.studentClass}
                    </td>

                    {daysArray.map((day) => {
                      const dayStr = String(day).padStart(2, '0');
                      const dateStr = `${selectedMonthKey}-${dayStr}`;
                      const rec = student.attendance[dateStr];
                      const dateObj = new Date(yearNum, monthNum - 1, day);
                      const isSunday = dateObj.getDay() === 0;

                      const status = rec?.status || (isSunday ? 'Holiday' : undefined);

                      let cellBg = 'bg-slate-50 dark:bg-slate-900 text-slate-400';
                      let label = '-';

                      if (status === 'Present') {
                        cellBg = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold';
                        label = 'P';
                      } else if (status === 'Absent') {
                        cellBg = 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 font-bold';
                        label = 'A';
                      } else if (status === 'Holiday') {
                        cellBg = 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 font-bold';
                        label = 'H';
                      }

                      return (
                        <td
                          key={day}
                          className={`p-1 border border-slate-200 dark:border-slate-700 font-mono text-[11px] ${cellBg}`}
                        >
                          {label}
                        </td>
                      );
                    })}

                    <td className="p-2 border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                      {monthStats.present}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
