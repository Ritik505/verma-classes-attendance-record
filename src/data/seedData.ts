import { Student, AttendanceRecord } from '../types';

// Helper to generate calendar attendance for January & February 2026
function generateAttendanceForMonth(year: number, monthZeroIndexed: number, pattern: ('P' | 'A' | 'H')[]): Record<string, AttendanceRecord> {
  const records: Record<string, AttendanceRecord> = {};
  const daysInMonth = new Date(year, monthZeroIndexed + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthZeroIndexed, day);
    const dateStr = `${year}-${String(monthZeroIndexed + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isSunday = d.getDay() === 0;

    let status: 'Present' | 'Absent' | 'Holiday' = 'Present';

    if (isSunday) {
      status = 'Holiday';
    } else {
      const pIndex = (day - 1) % pattern.length;
      const char = pattern[pIndex];
      if (char === 'A') status = 'Absent';
      else if (char === 'H') status = 'Holiday';
      else status = 'Present';
    }

    records[dateStr] = {
      date: dateStr,
      status,
      isOverride: false,
    };
  }

  return records;
}

const todayFormatted = new Date().toISOString().split('T')[0];
const todayMonthDay = todayFormatted.substring(5); // e.g. "07-28" or "01-16"

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'Rohan',
    studentClass: '8th',
    fatherName: 'Ram Kumar',
    mobileNumber: '9812345678',
    dob: `2012-${todayMonthDay}`, // Set to today so Birthday Banner triggers!
    monthlyFee: 800,
    joiningDate: '2026-01-15',
    feeStartDate: '2026-01-15',
    notes: 'Weak in Maths, needs extra practice and attention.',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    attendance: {
      ...generateAttendanceForMonth(2026, 0, ['P', 'P', 'P', 'P', 'A', 'P', 'P']),
      '2026-01-16': { date: '2026-01-16', status: 'Present' },
      [todayFormatted]: { date: todayFormatted, status: 'Present' },
    },
    fees: {
      '2026-01': { monthKey: '2026-01', monthName: 'January 2026', status: 'Paid', amountPaid: 800, paidDate: '2026-01-15' },
      '2026-02': { monthKey: '2026-02', monthName: 'February 2026', status: 'Pending' },
    },
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'std-2',
    name: 'Akansha',
    studentClass: '9th',
    fatherName: 'Suresh Verma',
    mobileNumber: '9876543210',
    dob: '2011-04-12',
    monthlyFee: 1000,
    joiningDate: '2026-01-10',
    feeStartDate: '2026-01-10',
    notes: 'Excellent performance in Science.',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    attendance: {
      ...generateAttendanceForMonth(2026, 0, ['P', 'A', 'P', 'P', 'P', 'A', 'P']),
      [todayFormatted]: { date: todayFormatted, status: 'Absent' },
    },
    fees: {
      '2026-01': { monthKey: '2026-01', monthName: 'January 2026', status: 'Pending' },
      '2026-02': { monthKey: '2026-02', monthName: 'February 2026', status: 'Pending' },
    },
    createdAt: '2026-01-10T09:30:00Z',
  },
  {
    id: 'std-3',
    name: 'Rahul',
    studentClass: '10th',
    fatherName: 'Rajesh Sharma',
    mobileNumber: '9823456789',
    dob: '2010-09-25',
    monthlyFee: 1200,
    joiningDate: '2026-01-01',
    feeStartDate: '2026-01-01',
    notes: 'Regular student, very punctual.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    attendance: {
      ...generateAttendanceForMonth(2026, 0, ['P', 'P', 'P', 'P', 'P', 'P', 'P']),
      [todayFormatted]: { date: todayFormatted, status: 'Present' },
    },
    fees: {
      '2026-01': { monthKey: '2026-01', monthName: 'January 2026', status: 'Paid', amountPaid: 1200, paidDate: '2026-01-02' },
      '2026-02': { monthKey: '2026-02', monthName: 'February 2026', status: 'Paid', amountPaid: 1200, paidDate: '2026-02-01' },
    },
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'std-4',
    name: 'Priya',
    studentClass: '8th',
    fatherName: 'Mahesh Gupta',
    mobileNumber: '9834567890',
    dob: '2012-11-05',
    monthlyFee: 800,
    joiningDate: '2026-01-12',
    feeStartDate: '2026-01-12',
    notes: 'Good student, needs practice in English grammar.',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    attendance: {
      ...generateAttendanceForMonth(2026, 0, ['P', 'P', 'A', 'P', 'P', 'P', 'P']),
      [todayFormatted]: { date: todayFormatted, status: 'Present' },
    },
    fees: {
      '2026-01': { monthKey: '2026-01', monthName: 'January 2026', status: 'Paid', amountPaid: 800, paidDate: '2026-01-12' },
      '2026-02': { monthKey: '2026-02', monthName: 'February 2026', status: 'Pending' },
    },
    createdAt: '2026-01-12T11:20:00Z',
  },
  {
    id: 'std-5',
    name: 'Vikram',
    studentClass: '10th',
    fatherName: 'Sunil Singh',
    mobileNumber: '9845678901',
    dob: '2010-03-18',
    monthlyFee: 1200,
    joiningDate: '2026-01-05',
    feeStartDate: '2026-01-05',
    notes: 'Prepares well for weekly physics tests.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    attendance: {
      ...generateAttendanceForMonth(2026, 0, ['P', 'P', 'P', 'H', 'P', 'P', 'A']),
      [todayFormatted]: { date: todayFormatted, status: 'Holiday' },
    },
    fees: {
      '2026-01': { monthKey: '2026-01', monthName: 'January 2026', status: 'Pending' },
      '2026-02': { monthKey: '2026-02', monthName: 'February 2026', status: 'Pending' },
    },
    createdAt: '2026-01-05T14:15:00Z',
  },
  {
    id: 'std-6',
    name: 'Ananya',
    studentClass: '9th',
    fatherName: 'Vinod Saxena',
    mobileNumber: '9856789012',
    dob: '2011-08-30',
    monthlyFee: 1000,
    joiningDate: '2026-01-18',
    feeStartDate: '2026-01-18',
    notes: 'Recently joined, adapting quickly.',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    attendance: {
      ...generateAttendanceForMonth(2026, 0, ['P', 'P', 'P', 'P', 'P', 'P', 'P']),
      [todayFormatted]: { date: todayFormatted, status: 'Present' },
    },
    fees: {
      '2026-01': { monthKey: '2026-01', monthName: 'January 2026', status: 'Paid', amountPaid: 1000, paidDate: '2026-01-18' },
    },
    createdAt: '2026-01-18T09:00:00Z',
  },
];
