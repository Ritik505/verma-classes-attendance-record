import * as XLSX from 'xlsx';
import { Student } from '../types';
import { calculateAttendanceStats, calculateStudentFeeSummary, formatDateReadable } from './feeCalculator';

export function exportStudentsToExcel(students: Student[], monthKey?: string) {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Roster & Fees Sheet
  const rosterData = students.map((s, index) => {
    const feeSum = calculateStudentFeeSummary(s, todayStr);
    const attStats = calculateAttendanceStats(s, monthKey);

    return {
      'S.No': index + 1,
      'Student Name': s.name,
      'Class': s.studentClass,
      "Father's Name": s.fatherName,
      'Mobile Number': s.mobileNumber,
      'Monthly Fee (₹)': s.monthlyFee,
      'Joining Date': formatDateReadable(s.joiningDate),
      'Pending Months': feeSum.pendingMonthsCount,
      'Pending Amount (₹)': feeSum.totalPendingAmount,
      'Fee Status': feeSum.isPending ? 'Pending' : 'Paid',
      'Total Present': attStats.present,
      'Total Absent': attStats.absent,
      'Total Holiday': attStats.holiday,
      'Attendance %': `${attStats.percentage}%`,
      'Performance': attStats.badgeLabel,
      'Notes': s.notes || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rosterData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Summary');

  // Generate file download
  const fileName = `Verma_Classes_Students_${monthKey || todayStr}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
