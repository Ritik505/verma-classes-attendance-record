export type AttendanceStatus = 'Present' | 'Absent' | 'Holiday';

export interface AttendanceRecord {
  date: string; // ISO format YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
  isOverride?: boolean; // True if Sunday was overridden to Present/Absent
}

export interface MonthlyFeeStatus {
  monthKey: string; // e.g. "2026-01"
  monthName: string; // e.g. "January 2026"
  status: 'Paid' | 'Pending' | 'Partial';
  amountPaid?: number;
  paidDate?: string;
}

export interface Student {
  id: string;
  name: string;
  studentClass: string; // e.g., "8th", "9th", "10th"
  fatherName: string;
  mobileNumber: string;
  dob?: string; // YYYY-MM-DD for birthday reminder
  monthlyFee: number; // e.g. 800
  joiningDate: string; // YYYY-MM-DD
  feeStartDate: string; // YYYY-MM-DD
  notes?: string;
  photoUrl?: string; // Base64 or avatar URL
  attendance: Record<string, AttendanceRecord>; // Keyed by YYYY-MM-DD
  fees: Record<string, MonthlyFeeStatus>; // Keyed by monthKey e.g. "2026-01"
  createdAt: string;
}

export type AttendanceFilter = 'All' | 'FeesPending' | 'PresentToday' | 'AbsentToday' | 'RecentlyJoined';

export interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  holidayToday: number;
  totalFeesPending: number;
}
