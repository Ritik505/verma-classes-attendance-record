import React, { useState } from 'react';
import { Search, Plus, MoreVertical, FileSpreadsheet, Eye, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import { Student, AttendanceFilter, AttendanceStatus } from '../types';
import { calculateAttendanceStats, calculateStudentFeeSummary, ALL_CLASSES, getMonthDisplayName } from '../utils/feeCalculator';

interface StudentTableProps {
  students: Student[];
  currentDateStr: string;
  selectedFilter: AttendanceFilter;
  onFilterChange: (filter: AttendanceFilter) => void;
  selectedClass: string;
  onClassChange: (cls: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddStudent: () => void;
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onQuickAttendanceChange: (studentId: string, dateStr: string, status: AttendanceStatus) => void;
  onExportExcel: () => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  currentDateStr,
  selectedFilter,
  onFilterChange,
  selectedClass,
  onClassChange,
  searchQuery,
  onSearchChange,
  onAddStudent,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onQuickAttendanceChange,
  onExportExcel,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deleteModalStudent, setDeleteModalStudent] = useState<Student | null>(null);

  const currentMonthKey = currentDateStr.substring(0, 7);

  const filteredStudents = students.filter((student) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = student.name.toLowerCase().includes(q);
      const matchClass = student.studentClass.toLowerCase().includes(q);
      if (!matchName && !matchClass) return false;
    }

    if (selectedClass !== 'All' && student.studentClass !== selectedClass) {
      return false;
    }

    const todayRecord = student.attendance[currentDateStr];
    const feeSummary = calculateStudentFeeSummary(student, currentDateStr);

    if (selectedFilter === 'FeesPending') return feeSummary.isPending;
    if (selectedFilter === 'PresentToday') return todayRecord?.status === 'Present';
    if (selectedFilter === 'AbsentToday') return todayRecord?.status === 'Absent';
    if (selectedFilter === 'RecentlyJoined') {
      const joinDate = new Date(student.joiningDate);
      const now = new Date();
      const diffDays = (now.getTime() - joinDate.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 30;
    }

    return true;
  });

  const handleDeleteConfirm = () => {
    if (deleteModalStudent) {
      onDeleteStudent(deleteModalStudent.id);
      setDeleteModalStudent(null);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* Header Actions & Search Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Name or Class..."
              className="w-full pl-10 pr-4 py-2 bg-[#F1F5F9] dark:bg-slate-800 border-none rounded-lg text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={onExportExcel}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-[#DEF7EC] dark:bg-emerald-950/60 hover:bg-emerald-200 rounded-lg transition-all cursor-pointer border border-emerald-300/50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Excel</span>
            </button>

            <button
              onClick={onAddStudent}
              className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-[#1E3A8A] bg-[#FCD34D] hover:bg-amber-400 active:scale-95 rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Student</span>
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {[
              { id: 'All', label: 'All Students' },
              { id: 'FeesPending', label: 'Fees Pending' },
              { id: 'PresentToday', label: 'Present Today' },
              { id: 'AbsentToday', label: 'Absent Today' },
              { id: 'RecentlyJoined', label: 'Recently Joined' },
            ].map((f) => {
              const active = selectedFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => onFilterChange(f.id as AttendanceFilter)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#1E3A8A] text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold bg-[#F1F5F9] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] cursor-pointer"
            >
              <option value="All">All Classes</option>
              {ALL_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MOBILE CARD VIEW (< 768px) */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-medium">
            No students found matching your filters.
          </div>
        ) : (
          filteredStudents.map((student) => {
            const feeSummary = calculateStudentFeeSummary(student, currentDateStr);
            const attStats = calculateAttendanceStats(student, currentMonthKey);
            const todayRec = student.attendance[currentDateStr];
            const todayStatus = todayRec?.status;

            return (
              <div key={student.id} className="p-3.5 sm:p-4 space-y-3 bg-white dark:bg-slate-900">
                {/* Top Row: Name & Class */}
                <div className="flex items-start justify-between gap-2">
                  <div onClick={() => onViewStudent(student)} className="cursor-pointer">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                      {student.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Joined: {student.joiningDate}</p>
                  </div>

                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-bold text-[#1E3A8A] dark:text-blue-300 shrink-0">
                    Class {student.studentClass}
                  </span>
                </div>

                {/* Middle Row: Fees Status & Attendance */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5 tracking-wider uppercase">
                      FEES STATUS
                    </span>
                    {feeSummary.isPending ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FDF2F2] text-[#9B1C1C] border border-red-200/60">
                        PENDING
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DEF7EC] text-[#03543F] border border-emerald-200/60">
                        PAID
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5 tracking-wider uppercase">
                      ATTENDANCE
                    </span>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {attStats.present}/{attStats.present + attStats.absent + attStats.holiday}{' '}
                      <span
                        className={`text-xs ${
                          attStats.percentage >= 75
                            ? 'text-[#059669]'
                            : attStats.percentage >= 50
                            ? 'text-[#D97706]'
                            : 'text-[#DC2626]'
                        }`}
                      >
                        ({attStats.percentage}%)
                      </span>
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Quick Today Status */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      QUICK TODAY STATUS
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      ACTION
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1.5">
                    {/* Quick Attendance Toggle Buttons */}
                    <div className="flex items-center gap-0.5 min-[360px]:gap-1 bg-[#F1F5F9] dark:bg-slate-800 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700">
                      <button
                        onClick={() => onQuickAttendanceChange(student.id, currentDateStr, 'Present')}
                        className={`px-2 min-[360px]:px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          todayStatus === 'Present' ? 'bg-[#059669] text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => onQuickAttendanceChange(student.id, currentDateStr, 'Absent')}
                        className={`px-2 min-[360px]:px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          todayStatus === 'Absent' ? 'bg-[#DC2626] text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => onQuickAttendanceChange(student.id, currentDateStr, 'Holiday')}
                        className={`px-2 min-[360px]:px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          todayStatus === 'Holiday' ? 'bg-[#6366F1] text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Holiday
                      </button>
                    </div>

                    {/* Action Icon Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onViewStudent(student)}
                        className="p-1.5 min-[360px]:p-2 text-slate-600 hover:text-[#1E3A8A] bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                        title="View Student"
                      >
                        <Eye className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4" />
                      </button>
                      <button
                        onClick={() => onEditStudent(student)}
                        className="p-1.5 min-[360px]:p-2 text-slate-600 hover:text-amber-600 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                        title="Edit Student"
                      >
                        <Edit3 className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModalStudent(student)}
                        className="p-1.5 min-[360px]:p-2 text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 rounded-lg cursor-pointer transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW (>= 768px) */}
      <div className="hidden md:block w-full overflow-x-auto min-w-0">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="bg-[#F8FAFC] dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-bold text-[#4A5568] dark:text-slate-400">
              <th className="py-3 px-4 whitespace-nowrap">STUDENT NAME</th>
              <th className="py-3 px-4 whitespace-nowrap">CLASS</th>
              <th className="py-3 px-4 whitespace-nowrap">FEES STATUS</th>
              <th className="py-3 px-4 whitespace-nowrap">ATTENDANCE ({getMonthDisplayName(currentMonthKey)})</th>
              <th className="py-3 px-4 text-center whitespace-nowrap">QUICK TODAY STATUS</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                  No students found matching your filters.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const feeSummary = calculateStudentFeeSummary(student, currentDateStr);
                const attStats = calculateAttendanceStats(student, currentMonthKey);
                const todayRec = student.attendance[currentDateStr];
                const todayStatus = todayRec?.status;

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div
                        onClick={() => onViewStudent(student)}
                        className="cursor-pointer group-hover:text-[#1E3A8A] dark:group-hover:text-blue-400 transition-colors"
                      >
                        <div className="font-bold text-[#1A202C] dark:text-white">
                          {student.name}
                        </div>
                        <div className="text-[11px] text-[#718096]">
                          Joined: {student.joiningDate}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-bold text-[#1E3A8A] dark:text-blue-300">
                        {student.studentClass}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {feeSummary.isPending ? (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FDF2F2] text-[#9B1C1C] border border-red-200/60">
                          PENDING
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#DEF7EC] text-[#03543F] border border-emerald-200/60">
                          PAID
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {attStats.present}/{attStats.present + attStats.absent + attStats.holiday}{' '}
                        <span
                          className={`text-xs ml-1 ${
                            attStats.percentage >= 75
                              ? 'text-[#059669]'
                              : attStats.percentage >= 50
                              ? 'text-[#D97706]'
                              : 'text-[#DC2626]'
                          }`}
                        >
                          ({attStats.percentage}%)
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 bg-[#F1F5F9] dark:bg-slate-800 p-1 rounded-lg w-fit mx-auto border border-slate-200/80 dark:border-slate-700">
                        <button
                          onClick={() => onQuickAttendanceChange(student.id, currentDateStr, 'Present')}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            todayStatus === 'Present'
                              ? 'bg-[#059669] text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-[#059669]'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => onQuickAttendanceChange(student.id, currentDateStr, 'Absent')}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            todayStatus === 'Absent'
                              ? 'bg-[#DC2626] text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-[#DC2626]'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => onQuickAttendanceChange(student.id, currentDateStr, 'Holiday')}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            todayStatus === 'Holiday'
                              ? 'bg-[#6366F1] text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-[#6366F1]'
                          }`}
                        >
                          Holiday
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right relative whitespace-nowrap">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === student.id ? null : student.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer font-bold"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeMenuId === student.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div className="absolute right-4 top-12 z-20 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 text-left text-sm">
                            <button
                              onClick={() => {
                                onViewStudent(student);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 font-medium cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-[#1E3A8A]" />
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => {
                                onEditStudent(student);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 font-medium cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4 text-amber-600" />
                              <span>Edit Student</span>
                            </button>
                            <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                            <button
                              onClick={() => {
                                setDeleteModalStudent(student);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 font-medium cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete Student</span>
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {deleteModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Warning
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete <br />
              <strong className="text-slate-900 dark:text-white font-bold text-base">{deleteModalStudent.name}</strong> ?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs transition-all cursor-pointer"
              >
                YES
              </button>
              <button
                onClick={() => setDeleteModalStudent(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg transition-all cursor-pointer"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};