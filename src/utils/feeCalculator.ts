import { Student } from '../types';

export const ALL_CLASSES = [
  'UKG',
  'LKG',
  'KG',
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  '6th',
  '7th',
  '8th',
  '9th',
  '10th',
  '11th',
  '12th',
];

/**
 * Formats amount in INR format (e.g. ₹800 or ₹12,400)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Returns formatted date like "16 January 2026"
 */
export function formatDateReadable(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Returns month key like "2026-01"
 */
export function getMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Returns display month string like "January 2026"
 */
export function getMonthDisplayName(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

/**
 * Generate all month keys between fee start date and target date
 */
export function getRequiredMonthsForStudent(student: Student, targetDateStr: string = new Date().toISOString().split('T')[0]): string[] {
  const startDateStr = student.feeStartDate || student.joiningDate || '2026-01-01';
  const start = new Date(startDateStr + 'T00:00:00');
  const target = new Date(targetDateStr + 'T00:00:00');

  const months: string[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const end = new Date(target.getFullYear(), target.getMonth(), 1);

  while (current <= end) {
    months.push(getMonthKey(current));
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

/**
 * Calculate automatic pending fee stats for a student
 */
export function calculateStudentFeeSummary(student: Student, targetDateStr: string = new Date().toISOString().split('T')[0]) {
  const requiredMonths = getRequiredMonthsForStudent(student, targetDateStr);
  let pendingMonthsCount = 0;
  let totalPendingAmount = 0;

  requiredMonths.forEach((mKey) => {
    const feeRec = student.fees[mKey];
    if (!feeRec || feeRec.status === 'Pending') {
      pendingMonthsCount++;
      totalPendingAmount += student.monthlyFee;
    } else if (feeRec.status === 'Partial' && feeRec.amountPaid !== undefined) {
      const remaining = Math.max(0, student.monthlyFee - feeRec.amountPaid);
      if (remaining > 0) {
        pendingMonthsCount += remaining / student.monthlyFee;
        totalPendingAmount += remaining;
      }
    }
  });

  // Calculate next due date
  // Usually due on the day-of-month of feeStartDate each month
  const startDate = new Date((student.feeStartDate || student.joiningDate) + 'T00:00:00');
  const dueDay = startDate.getDate();
  const today = new Date(targetDateStr + 'T00:00:00');
  
  let nextDueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
  if (today.getDate() > dueDay) {
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
  }

  const nextDueDateStr = `${nextDueDate.getFullYear()}-${String(nextDueDate.getMonth() + 1).padStart(2, '0')}-${String(nextDueDate.getDate()).padStart(2, '0')}`;

  return {
    pendingMonthsCount: Math.ceil(pendingMonthsCount),
    totalPendingAmount,
    isPending: totalPendingAmount > 0,
    nextDueDateStr,
    dueDay,
  };
}

/**
 * Calculate attendance statistics for a given month or overall
 */
export function calculateAttendanceStats(student: Student, monthKey?: string) {
  const records = Object.values(student.attendance).filter((rec) => {
    if (!monthKey) return true;
    return rec.date.startsWith(monthKey);
  });

  let present = 0;
  let absent = 0;
  let holiday = 0;

  records.forEach((r) => {
    if (r.status === 'Present') present++;
    else if (r.status === 'Absent') absent++;
    else if (r.status === 'Holiday') holiday++;
  });

  const totalEvaluated = present + absent;
  const percentage = totalEvaluated > 0 ? Math.round((present / totalEvaluated) * 100) : 0;

  let badgeLabel = 'Needs Improvement';
  let badgeColor = 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';

  if (percentage >= 95) {
    badgeLabel = 'Excellent';
    badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
  } else if (percentage >= 75) {
    badgeLabel = 'Good';
    badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
  } else if (totalEvaluated === 0) {
    badgeLabel = 'No Data';
    badgeColor = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }

  return {
    present,
    absent,
    holiday,
    totalRecords: records.length,
    percentage,
    badgeLabel,
    badgeColor,
  };
}

/**
 * Check if today is student's birthday
 */
export function isBirthdayToday(student: Student, todayStr: string = new Date().toISOString().split('T')[0]): boolean {
  if (!student.dob) return false;
  const [, dobM, dobD] = student.dob.split('-');
  const [, todayM, todayD] = todayStr.split('-');
  return dobM === todayM && dobD === todayD;
}

/**
 * Check if fee is due tomorrow
 */
export function isFeeDueTomorrow(student: Student, todayStr: string = new Date().toISOString().split('T')[0]): boolean {
  const today = new Date(todayStr + 'T00:00:00');
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = tomorrow.getDate();

  const startDate = new Date((student.feeStartDate || student.joiningDate) + 'T00:00:00');
  const feeDueDay = startDate.getDate();

  // If tomorrow is due day and student has pending fees
  const summary = calculateStudentFeeSummary(student, todayStr);
  return tomorrowDay === feeDueDay && summary.isPending;
}
