export type AttendanceStatus = 'present' | 'late' | 'excused' | 'unexcused';

export interface Student {
  id: string;
  classId: string;
  studentCode: string;
  name: string;
  gender: 'male' | 'female';
  birthday: string;
  avatar: string;
  parentName: string;
  parentPhone: string;
  stars: number;
  badges: string[];
  seatRow: number; // 0-indexed
  seatCol: number; // 0-indexed
  notes: string;
  hobby?: string;
  dream?: string;
}

export interface Classroom {
  id: string;
  name: string;
  code: string;
  grade: number;
  academicYear: string;
  teacherName: string;
  roomName: string;
  rows: number; // Number of desk rows
  cols: number; // Number of desk columns (or seats per row)
  themeColor: string;
  avatar?: string;
  teacherAvatar?: string;
  timetableFile?: string;
  timetableFileType?: 'image' | 'pdf';
}

export interface AttendanceDay {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  records: Record<string, AttendanceStatus>; // studentId -> status
  notes?: string;
  updatedAt: number;
}

export interface RewardItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  stock: number;
  category: 'stationery' | 'voucher' | 'badge' | 'toy' | 'book';
  description: string;
  image?: string;
  color: string;
  classIds?: string[];
}

export interface RewardRedemption {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  classId: string;
  itemId: string;
  itemName: string;
  itemIcon: string;
  cost: number;
  timestamp: number;
  status: 'completed' | 'pending';
}

export interface PointTransaction {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  amount: number;
  reason: string;
  icon: string;
  type: 'positive' | 'negative';
  timestamp: number;
}

export interface TimetableSlot {
  id: string;
  classId: string;
  dayOfWeek: number; // 2 = Thứ 2, ..., 7 = Thứ 7
  period: number; // 1-5 Morning, 6-9 Afternoon
  subject: string;
  teacher: string;
  room?: string;
  timeRange: string;
  color: string;
}

export type ActiveTab = 'attendance' | 'seating' | 'rewards' | 'timetable' | 'students' | 'leaderboard' | 'dashboard';
