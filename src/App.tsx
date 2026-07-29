/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student, AttendanceFilter, AttendanceStatus, DashboardStats as IDashboardStats } from './types';
import { INITIAL_STUDENTS } from './data/seedData';
import { LoginModal } from './components/LoginModal';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { StudentTable } from './components/StudentTable';
import { StudentDetailModal } from './components/StudentDetailModal';
import { StudentFormModal } from './components/StudentFormModal';
import { MonthlyMatrixModal } from './components/MonthlyMatrixModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { calculateStudentFeeSummary } from './utils/feeCalculator';
import { exportStudentsToExcel } from './utils/excelExporter';

export default function App() {
  // Today's Date String (YYYY-MM-DD)
  const [currentDateStr, setCurrentDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('verma_logged_in') === 'true';
  });

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('verma_dark_mode') === 'true';
  });

  // Students Data State
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('verma_classes_students');

    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
        return [];
      }
    }

    // First launch only
    localStorage.setItem(
      'verma_classes_students',
      JSON.stringify(INITIAL_STUDENTS)
    );

    return INITIAL_STUDENTS;
  });

  // Sync Students to localStorage
  useEffect(() => {
    localStorage.setItem('verma_classes_students', JSON.stringify(students));
  }, [students]);

  // Sync Dark Mode class to <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('verma_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<AttendanceFilter>('All');
  const [selectedClass, setSelectedClass] = useState('All');

  // Modal States
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isMonthlyMatrixOpen, setIsMonthlyMatrixOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Calculate Dashboard Statistics
  const dashboardStats: IDashboardStats = React.useMemo(() => {
    let presentToday = 0;
    let absentToday = 0;
    let holidayToday = 0;
    let totalFeesPending = 0;

    students.forEach((s) => {
      const todayRec = s.attendance[currentDateStr];
      if (todayRec?.status === 'Present') presentToday++;
      else if (todayRec?.status === 'Absent') absentToday++;
      else if (todayRec?.status === 'Holiday') holidayToday++;

      const feeSum = calculateStudentFeeSummary(s, currentDateStr);
      totalFeesPending += feeSum.totalPendingAmount;
    });

    return {
      totalStudents: students.length,
      presentToday,
      absentToday,
      holidayToday,
      totalFeesPending,
    };
  }, [students, currentDateStr]);

  // Handlers
  const handleLoginSuccess = () => {
    sessionStorage.setItem('verma_logged_in', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('verma_logged_in');
    setIsLoggedIn(false);
  };

  // Quick Attendance Change handler
  const handleQuickAttendanceChange = (studentId: string, dateStr: string, status: AttendanceStatus) => {
    setStudents((prevStudents) =>
      prevStudents.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          attendance: {
            ...s.attendance,
            [dateStr]: {
              date: dateStr,
              status,
              isOverride: false,
            },
          },
        };
      })
    );

    // Also update detail modal if open
    if (selectedStudentForDetails && selectedStudentForDetails.id === studentId) {
      setSelectedStudentForDetails((prev) =>
        prev
          ? {
              ...prev,
              attendance: {
                ...prev.attendance,
                [dateStr]: {
                  date: dateStr,
                  status,
                  isOverride: false,
                },
              },
            }
          : null
      );
    }
  };

  // Attendance update with Sunday override flag
  const handleUpdateAttendance = (
    studentId: string,
    dateStr: string,
    status: AttendanceStatus,
    isOverride: boolean = false
  ) => {
    setStudents((prevStudents) =>
      prevStudents.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          attendance: {
            ...s.attendance,
            [dateStr]: {
              date: dateStr,
              status,
              isOverride,
            },
          },
        };
      })
    );

    if (selectedStudentForDetails && selectedStudentForDetails.id === studentId) {
      setSelectedStudentForDetails((prev) =>
        prev
          ? {
              ...prev,
              attendance: {
                ...prev.attendance,
                [dateStr]: {
                  date: dateStr,
                  status,
                  isOverride,
                },
              },
            }
          : null
      );
    }
  };

  // Monthly fee toggle status
  const handleToggleFeeStatus = (studentId: string, monthKey: string, status: 'Paid' | 'Pending') => {
    setStudents((prevStudents) =>
      prevStudents.map((s) => {
        if (s.id !== studentId) return s;
        const currentFee = s.fees[monthKey] || { monthKey, monthName: monthKey, status: 'Pending' };
        return {
          ...s,
          fees: {
            ...s.fees,
            [monthKey]: {
              ...currentFee,
              status,
              paidDate: status === 'Paid' ? new Date().toISOString().split('T')[0] : undefined,
              amountPaid: status === 'Paid' ? s.monthlyFee : 0,
            },
          },
        };
      })
    );

    if (selectedStudentForDetails && selectedStudentForDetails.id === studentId) {
      setSelectedStudentForDetails((prev) => {
        if (!prev) return null;
        const currentFee = prev.fees[monthKey] || { monthKey, monthName: monthKey, status: 'Pending' };
        return {
          ...prev,
          fees: {
            ...prev.fees,
            [monthKey]: {
              ...currentFee,
              status,
              paidDate: status === 'Paid' ? new Date().toISOString().split('T')[0] : undefined,
              amountPaid: status === 'Paid' ? prev.monthlyFee : 0,
            },
          },
        };
      });
    }
  };

  // Save Student (Add / Edit)
  const handleSaveStudent = (studentData: Partial<Student>) => {
    if (studentToEdit) {
      // Edit
      setStudents((prev) =>
        prev.map((s) => (s.id === studentToEdit.id ? { ...s, ...studentData } : s))
      );
    } else {
      // Add New
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        name: studentData.name || 'New Student',
        studentClass: studentData.studentClass || '8th',
        fatherName: studentData.fatherName || '',
        mobileNumber: studentData.mobileNumber || '',
        dob: studentData.dob,
        monthlyFee: studentData.monthlyFee || 800,
        joiningDate: studentData.joiningDate || currentDateStr,
        feeStartDate: studentData.feeStartDate || currentDateStr,
        notes: studentData.notes || '',
        photoUrl: studentData.photoUrl,
        attendance: {},
        fees: {
          [currentDateStr.substring(0, 7)]: {
            monthKey: currentDateStr.substring(0, 7),
            monthName: currentDateStr.substring(0, 7),
            status: 'Pending',
          },
        },
        createdAt: new Date().toISOString(),
      };
      setStudents((prev) => [newStudent, ...prev]);
    }

    setIsFormOpen(false);
    setStudentToEdit(null);
  };

  // Delete Student
  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    if (selectedStudentForDetails?.id === studentId) {
      setSelectedStudentForDetails(null);
    }
  };

  // Restore Database Data
  const handleRestoreData = (restoredList: Student[]) => {
    setStudents(restoredList);
  };

  // If not logged in, show Login Window first
  if (!isLoggedIn) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors pb-12">
      {/* Top Navbar Header */}
      <Navbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenMonthlyMatrix={() => setIsMonthlyMatrixOpen(true)}
        onLogout={handleLogout}
        currentDateStr={currentDateStr}
      />

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Top Metric Cards & Reminders */}
        <DashboardStats
          stats={dashboardStats}
          students={students}
          currentDateStr={currentDateStr}
          onFilterClick={(filterType) => setSelectedFilter(filterType as AttendanceFilter)}
        />

        {/* Main Students List Table */}
        <StudentTable
          students={students}
          currentDateStr={currentDateStr}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddStudent={() => {
            setStudentToEdit(null);
            setIsFormOpen(true);
          }}
          onViewStudent={(student) => setSelectedStudentForDetails(student)}
          onEditStudent={(student) => {
            setStudentToEdit(student);
            setIsFormOpen(true);
          }}
          onDeleteStudent={handleDeleteStudent}
          onQuickAttendanceChange={handleQuickAttendanceChange}
          onExportExcel={() => exportStudentsToExcel(students, currentDateStr.substring(0, 7))}
        />
      </main>

      {/* Student Detail Window Modal */}
      {selectedStudentForDetails && (
        <StudentDetailModal
          student={selectedStudentForDetails}
          currentDateStr={currentDateStr}
          onClose={() => setSelectedStudentForDetails(null)}
          onEdit={(student) => {
            setStudentToEdit(student);
            setIsFormOpen(true);
          }}
          onUpdateAttendance={handleUpdateAttendance}
          onToggleFeeStatus={handleToggleFeeStatus}
        />
      )}

      {/* Add / Edit Student Form Modal */}
      {isFormOpen && (
        <StudentFormModal
          studentToEdit={studentToEdit}
          onClose={() => {
            setIsFormOpen(false);
            setStudentToEdit(null);
          }}
          onSave={handleSaveStudent}
        />
      )}

      {/* Monthly Attendance Grid Modal */}
      {isMonthlyMatrixOpen && (
        <MonthlyMatrixModal
          students={students}
          currentDateStr={currentDateStr}
          onClose={() => setIsMonthlyMatrixOpen(false)}
        />
      )}

      {/* Backup & Restore Modal */}
      {isBackupModalOpen && (
        <BackupRestoreModal
          students={students}
          onRestoreData={handleRestoreData}
          onClose={() => setIsBackupModalOpen(false)}
        />
      )}
    </div>
  );
}