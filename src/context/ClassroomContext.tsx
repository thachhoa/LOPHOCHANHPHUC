import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Classroom,
  Student,
  RewardItem,
  TimetableSlot,
  RewardRedemption,
  PointTransaction,
  AttendanceDay,
  AttendanceStatus,
  ActiveTab,
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS_3A,
  INITIAL_REWARDS,
  INITIAL_TIMETABLE,
  INITIAL_REDEMPTIONS,
  INITIAL_POINT_TRANSACTIONS,
  INITIAL_ATTENDANCE,
  getTodayDateString,
} from '../data/initialData';
import { soundManager } from '../utils/audio';

interface ClassroomContextType {
  // Navigation & Class state
  currentTab: ActiveTab;
  setCurrentTab: (tab: ActiveTab) => void;
  classes: Classroom[];
  activeClassId: string;
  setActiveClassId: (id: string) => void;
  activeClass: Classroom;
  addClass: (cls: Omit<Classroom, 'id'>) => void;
  updateClass: (cls: Classroom) => void;

  // Students
  students: Student[];
  currentStudents: Student[];
  selectedStudent: Student | null;
  setSelectedStudent: (std: Student | null) => void;
  addStudent: (std: Omit<Student, 'id' | 'stars' | 'badges' | 'seatRow' | 'seatCol'>) => void;
  updateStudent: (std: Student) => void;
  deleteStudent: (studentId: string) => void;
  updateStudentAvatar: (studentId: string, avatarUrl: string) => void;
  importStudentsBulk: (newStds: Omit<Student, 'id' | 'stars' | 'badges' | 'seatRow' | 'seatCol'>[]) => void;

  // Attendance
  attendanceRecords: AttendanceDay[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  todayAttendance: Record<string, AttendanceStatus>;
  setStudentAttendance: (studentId: string, status: AttendanceStatus) => void;
  markAllAttendance: (status: AttendanceStatus) => void;
  saveAttendanceNotes: (notes: string) => void;
  currentAttendanceNotes: string;

  // Seating
  updateStudentSeat: (studentId: string, row: number, col: number) => void;
  swapSeats: (studentId1: string, studentId2: string) => void;
  randomizeSeats: () => void;
  clearSeating: () => void;

  // Rewards & Gamification
  rewards: RewardItem[];
  redemptions: RewardRedemption[];
  pointTransactions: PointTransaction[];
  awardPoints: (studentId: string, amount: number, reason: string, icon?: string) => void;
  redeemReward: (studentId: string, rewardId: string) => { success: boolean; message: string };
  addRewardItem: (item: Omit<RewardItem, 'id'>) => void;
  updateRewardItem: (item: RewardItem) => void;
  deleteRewardItem: (itemId: string) => void;

  // Timetable
  timetable: TimetableSlot[];
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  updateTimetableSlot: (slot: TimetableSlot) => void;
  deleteTimetableSlot: (slotId: string) => void;

  // Sound settings & Modals
  isSoundMuted: boolean;
  toggleSound: () => void;
  isQuickPointModalOpen: boolean;
  setIsQuickPointModalOpen: (open: boolean) => void;
  quickPointTargetStudent: Student | null;
  setQuickPointTargetStudent: (std: Student | null) => void;
  isLuckyWheelOpen: boolean;
  setIsLuckyWheelOpen: (open: boolean) => void;
  isCropModalOpen: boolean;
  setIsCropModalOpen: (open: boolean) => void;
  cropTargetStudentId: string | null;
  setCropTargetStudentId: (id: string | null) => void;
  cropSourceImage: string | null;
  setCropSourceImage: (src: string | null) => void;
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  aiApiKey: string;
  setAiApiKey: (key: string) => void;
  exportBackupData: () => void;
  importBackupData: (jsonData: string) => { success: boolean; message: string };
  activeModel: string;
  setActiveModel: (model: string) => void;
}

const ClassroomContext = createContext<ClassroomContextType | null>(null);

const STORAGE_KEYS = {
  CLASSES: 'lophoc_classes_v2',
  ACTIVE_CLASS: 'lophoc_active_class_v2',
  STUDENTS: 'lophoc_students_v2',
  ATTENDANCE: 'lophoc_attendance_v2',
  REWARDS: 'lophoc_rewards_v2',
  REDEMPTIONS: 'lophoc_redemptions_v2',
  TRANSACTIONS: 'lophoc_transactions_v2',
  TIMETABLE: 'lophoc_timetable_v2',
  SOUND_MUTED: 'lophoc_sound_muted_v2',
};

export const ClassroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('attendance');

  // Load classes
  const [classes, setClasses] = useState<Classroom[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLASSES) || localStorage.getItem('lophoc_classes_v1');
    if (saved) {
      try {
        const parsed: Classroom[] = JSON.parse(saved);
        const filtered = parsed.filter(c => c.id !== 'class-4b');
        return filtered.map(c => {
          if (c.id === 'class-3a' && (c.teacherName === 'Cô Võ Châu Thanh' || c.name === 'Lớp 3A - Sao Băng')) {
            return { ...c, name: 'Lớp Học Hạnh Phúc', teacherName: 'Cô Thạch Hòa', code: 'HP-2025' };
          }
          return c;
        });
      } catch {
        return INITIAL_CLASSES;
      }
    }
    return INITIAL_CLASSES;
  });

  const [activeClassId, setActiveClassId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CLASS) || localStorage.getItem('lophoc_active_class_v1');
    return saved && saved !== 'class-4b' && INITIAL_CLASSES.some(c => c.id === saved) ? saved : INITIAL_CLASSES[0].id;
  });

  // Students
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS) || localStorage.getItem('lophoc_students_v1');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS_3A;
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Attendance
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceDay[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || localStorage.getItem('lophoc_attendance_v1');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Rewards
  const [rewards, setRewards] = useState<RewardItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REWARDS) || localStorage.getItem('lophoc_rewards_v1');
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
  });

  const [redemptions, setRedemptions] = useState<RewardRedemption[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REDEMPTIONS) || localStorage.getItem('lophoc_redemptions_v1');
    return saved ? JSON.parse(saved) : INITIAL_REDEMPTIONS;
  });

  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || localStorage.getItem('lophoc_transactions_v1');
    return saved ? JSON.parse(saved) : INITIAL_POINT_TRANSACTIONS;
  });

  // Timetable
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TIMETABLE) || localStorage.getItem('lophoc_timetable_v1');
    if (saved) {
      try {
        const parsed: TimetableSlot[] = JSON.parse(saved);
        return parsed.map(s => (s.teacher === 'Cô Võ Châu Thanh' ? { ...s, teacher: 'Cô Thạch Hòa' } : s));
      } catch {
        return INITIAL_TIMETABLE;
      }
    }
    return INITIAL_TIMETABLE;
  });

  // Sound & Modals
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND_MUTED);
    return saved ? JSON.parse(saved) : false;
  });

  const [isQuickPointModalOpen, setIsQuickPointModalOpen] = useState(false);
  const [quickPointTargetStudent, setQuickPointTargetStudent] = useState<Student | null>(null);
  const [isLuckyWheelOpen, setIsLuckyWheelOpen] = useState(false);

  // Avatar Cropper Modal State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropTargetStudentId, setCropTargetStudentId] = useState<string | null>(null);
  const [cropSourceImage, setCropSourceImage] = useState<string | null>(null);

  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiApiKey, setAiApiKey] = useState<string>(() => {
    return localStorage.getItem('lophoc_ai_api_key') || '';
  });

  useEffect(() => {
    localStorage.setItem('lophoc_ai_api_key', aiApiKey);
  }, [aiApiKey]);

  const [activeModel, setActiveModel] = useState<string>(() => {
    return localStorage.getItem('lophoc_ai_active_model') || 'gemini-3-flash-preview';
  });

  useEffect(() => {
    localStorage.setItem('lophoc_ai_active_model', activeModel);
  }, [activeModel]);

  const exportBackupData = () => {
    const backupData = {
      version: '2.5',
      timestamp: Date.now(),
      classes: JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES) || '[]'),
      activeClassId: localStorage.getItem(STORAGE_KEYS.ACTIVE_CLASS) || '',
      students: JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]'),
      attendance: JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]'),
      rewards: JSON.parse(localStorage.getItem(STORAGE_KEYS.REWARDS) || '[]'),
      redemptions: JSON.parse(localStorage.getItem(STORAGE_KEYS.REDEMPTIONS) || '[]'),
      transactions: JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]'),
      timetable: JSON.parse(localStorage.getItem(STORAGE_KEYS.TIMETABLE) || '[]'),
    };
    
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `Backup_LopHocHanhPhuc_${getTodayDateString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const importBackupData = (jsonData: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonData);
      if (!data.classes || !data.students) {
        return { success: false, message: 'File không đúng định dạng sao lưu của ứng dụng!' };
      }
      
      // Update states
      if (data.classes) {
        setClasses(data.classes);
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(data.classes));
      }
      if (data.activeClassId) {
        setActiveClassId(data.activeClassId);
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CLASS, data.activeClassId);
      }
      if (data.students) {
        setStudents(data.students);
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
      }
      if (data.attendance) {
        setAttendanceRecords(data.attendance);
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data.attendance));
      }
      if (data.rewards) {
        setRewards(data.rewards);
        localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(data.rewards));
      }
      if (data.redemptions) {
        setRedemptions(data.redemptions);
        localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(data.redemptions));
      }
      if (data.transactions) {
        setPointTransactions(data.transactions);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
      }
      if (data.timetable) {
        setTimetable(data.timetable);
        localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(data.timetable));
      }
      
      return { success: true, message: 'Phục hồi dữ liệu thành công!' };
    } catch (err) {
      return { success: false, message: 'Lỗi đọc file JSON: ' + (err as Error).message };
    }
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CLASS, activeClassId);
  }, [activeClassId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(redemptions));
  }, [redemptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(pointTransactions));
  }, [pointTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND_MUTED, JSON.stringify(isSoundMuted));
    soundManager.setMuted(isSoundMuted);
  }, [isSoundMuted]);

  const toggleSound = () => {
    setIsSoundMuted(prev => !prev);
  };

  const activeClass = classes.find(c => c.id === activeClassId) || classes[0] || INITIAL_CLASSES[0];
  const currentStudents = students.filter(s => s.classId === activeClassId);

  // Attendance helpers
  const currentAttendanceDay = attendanceRecords.find(
    a => a.classId === activeClassId && a.date === selectedDate
  );

  const todayAttendance: Record<string, AttendanceStatus> = currentAttendanceDay?.records || {};
  const currentAttendanceNotes = currentAttendanceDay?.notes || '';

  const setStudentAttendance = (studentId: string, status: AttendanceStatus) => {
    soundManager.playAttendanceClick();
    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(a => a.classId === activeClassId && a.date === selectedDate);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          records: {
            ...updated[existingIndex].records,
            [studentId]: status,
          },
          updatedAt: Date.now(),
        };
        return updated;
      } else {
        const newRecord: AttendanceDay = {
          id: `att-${Date.now()}`,
          classId: activeClassId,
          date: selectedDate,
          records: { [studentId]: status },
          updatedAt: Date.now(),
        };
        return [...prev, newRecord];
      }
    });
  };

  const markAllAttendance = (status: AttendanceStatus) => {
    soundManager.playAttendanceClick();
    const newRecords: Record<string, AttendanceStatus> = {};
    currentStudents.forEach(s => {
      newRecords[s.id] = status;
    });

    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(a => a.classId === activeClassId && a.date === selectedDate);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          records: newRecords,
          updatedAt: Date.now(),
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `att-${Date.now()}`,
            classId: activeClassId,
            date: selectedDate,
            records: newRecords,
            updatedAt: Date.now(),
          },
        ];
      }
    });
  };

  const saveAttendanceNotes = (notes: string) => {
    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(a => a.classId === activeClassId && a.date === selectedDate);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          notes,
          updatedAt: Date.now(),
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `att-${Date.now()}`,
            classId: activeClassId,
            date: selectedDate,
            records: {},
            notes,
            updatedAt: Date.now(),
          },
        ];
      }
    });
  };

  // Student CRUD
  const addStudent = (stdData: Omit<Student, 'id' | 'stars' | 'badges' | 'seatRow' | 'seatCol'>) => {
    const nextRow = Math.floor(currentStudents.length / activeClass.cols);
    const nextCol = currentStudents.length % activeClass.cols;
    const newStudent: Student = {
      ...stdData,
      id: `std-${Date.now()}`,
      stars: 10, // Starting bonus
      badges: ['Học sinh mới'],
      seatRow: nextRow < activeClass.rows ? nextRow : 0,
      seatCol: nextCol < activeClass.cols ? nextCol : 0,
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const importStudentsBulk = (newStdsData: Omit<Student, 'id' | 'stars' | 'badges' | 'seatRow' | 'seatCol'>[]) => {
    setStudents(prev => {
      const currentClassStudents = prev.filter(s => s.classId === activeClassId);
      const currentCount = currentClassStudents.length;
      
      const newStudents: Student[] = newStdsData.map((std, idx) => {
        const nextRow = Math.floor((currentCount + idx) / activeClass.cols);
        const nextCol = (currentCount + idx) % activeClass.cols;
        return {
          ...std,
          id: `std-${Date.now()}-${idx}`,
          stars: 10,
          badges: ['Học sinh mới'],
          seatRow: nextRow < activeClass.rows ? nextRow : 0,
          seatCol: nextCol < activeClass.cols ? nextCol : 0,
        };
      });
      return [...prev, ...newStudents];
    });
  };

  const updateStudent = (std: Student) => {
    setStudents(prev => prev.map(s => (s.id === std.id ? std : s)));
    if (selectedStudent?.id === std.id) {
      setSelectedStudent(std);
    }
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(null);
    }
  };

  const updateStudentAvatar = (studentId: string, avatarUrl: string) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, avatar: avatarUrl } : s))
    );
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(prev => prev ? { ...prev, avatar: avatarUrl } : null);
    }
  };

  // Seating
  const updateStudentSeat = (studentId: string, row: number, col: number) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          return { ...s, seatRow: row, seatCol: col };
        }
        // If another student was in that seat, move them
        if (s.classId === activeClassId && s.seatRow === row && s.seatCol === col) {
          return { ...s, seatRow: -1, seatCol: -1 };
        }
        return s;
      })
    );
  };

  const swapSeats = (studentId1: string, studentId2: string) => {
    const s1 = students.find(s => s.id === studentId1);
    const s2 = students.find(s => s.id === studentId2);
    if (!s1 || !s2) return;

    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId1) return { ...s, seatRow: s2.seatRow, seatCol: s2.seatCol };
        if (s.id === studentId2) return { ...s, seatRow: s1.seatRow, seatCol: s1.seatCol };
        return s;
      })
    );
  };

  const randomizeSeats = () => {
    const totalSlots = activeClass.rows * activeClass.cols;
    const positions: { r: number; c: number }[] = [];
    for (let r = 0; r < activeClass.rows; r++) {
      for (let c = 0; c < activeClass.cols; c++) {
        positions.push({ r, c });
      }
    }
    // Shuffle positions
    const shuffled = [...positions].sort(() => Math.random() - 0.5);

    setStudents(prev => {
      let idx = 0;
      return prev.map(s => {
        if (s.classId === activeClassId) {
          const pos = shuffled[idx] || { r: 0, c: 0 };
          idx++;
          return { ...s, seatRow: pos.r, seatCol: pos.c };
        }
        return s;
      });
    });
  };

  const clearSeating = () => {
    setStudents(prev =>
      prev.map(s => (s.classId === activeClassId ? { ...s, seatRow: -1, seatCol: -1 } : s))
    );
  };

  // Points & Rewards
  const awardPoints = (studentId: string, amount: number, reason: string, icon = 'Star') => {
    if (amount > 0) {
      soundManager.playStarTing();
    }
    const target = students.find(s => s.id === studentId);
    if (!target) return;

    const newStars = Math.max(0, target.stars + amount);

    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, stars: newStars } : s))
    );

    if (selectedStudent?.id === studentId) {
      setSelectedStudent(prev => prev ? { ...prev, stars: newStars } : null);
    }

    const tx: PointTransaction = {
      id: `pt-${Date.now()}`,
      studentId,
      studentName: target.name,
      classId: activeClassId,
      amount,
      reason,
      icon,
      type: amount >= 0 ? 'positive' : 'negative',
      timestamp: Date.now(),
    };

    setPointTransactions(prev => [tx, ...prev]);
  };

  const redeemReward = (studentId: string, rewardId: string): { success: boolean; message: string } => {
    const student = students.find(s => s.id === studentId);
    const reward = rewards.find(r => r.id === rewardId);

    if (!student || !reward) {
      return { success: false, message: 'Học sinh hoặc phần quà không tồn tại!' };
    }

    if (reward.stock <= 0) {
      return { success: false, message: 'Phần quà này đã hết trong kho quà!' };
    }

    if (student.stars < reward.cost) {
      return {
        success: false,
        message: `Em ${student.name} có ${student.stars} sao, cần ${reward.cost} sao để đổi món này!`,
      };
    }

    // Process redemption
    soundManager.playSuccessFanfare();

    // Deduct student stars
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, stars: s.stars - reward.cost } : s))
    );

    // Decrease stock
    setRewards(prev =>
      prev.map(r => (r.id === rewardId ? { ...r, stock: r.stock - 1 } : r))
    );

    // Add redemption log
    const redemption: RewardRedemption = {
      id: `rd-${Date.now()}`,
      studentId,
      studentName: student.name,
      studentAvatar: student.avatar,
      classId: activeClassId,
      itemId: reward.id,
      itemName: reward.name,
      itemIcon: reward.icon,
      cost: reward.cost,
      timestamp: Date.now(),
      status: 'completed',
    };
    setRedemptions(prev => [redemption, ...prev]);

    // Record transaction
    const tx: PointTransaction = {
      id: `pt-${Date.now()}`,
      studentId,
      studentName: student.name,
      classId: activeClassId,
      amount: -reward.cost,
      reason: `Đổi quà: ${reward.name}`,
      icon: 'Gift',
      type: 'negative',
      timestamp: Date.now(),
    };
    setPointTransactions(prev => [tx, ...prev]);

    return {
      success: true,
      message: `Đổi thành công "${reward.name}" cho em ${student.name}!`,
    };
  };

  const addRewardItem = (itemData: Omit<RewardItem, 'id'>) => {
    const newItem: RewardItem = {
      ...itemData,
      id: `rew-${Date.now()}`,
    };
    setRewards(prev => [...prev, newItem]);
  };

  const updateRewardItem = (item: RewardItem) => {
    setRewards(prev => prev.map(r => (r.id === item.id ? item : r)));
  };

  const deleteRewardItem = (itemId: string) => {
    setRewards(prev => prev.filter(r => r.id !== itemId));
  };

  // Timetable
  const addTimetableSlot = (slotData: Omit<TimetableSlot, 'id'>) => {
    const newSlot: TimetableSlot = {
      ...slotData,
      id: `tt-${Date.now()}`,
    };
    setTimetable(prev => [...prev, newSlot]);
  };

  const updateTimetableSlot = (slot: TimetableSlot) => {
    setTimetable(prev => prev.map(s => (s.id === slot.id ? slot : s)));
  };

  const deleteTimetableSlot = (slotId: string) => {
    setTimetable(prev => prev.filter(s => s.id !== slotId));
  };

  // Class methods
  const addClass = (clsData: Omit<Classroom, 'id'>) => {
    const newClass: Classroom = {
      ...clsData,
      id: `class-${Date.now()}`,
    };
    setClasses(prev => [...prev, newClass]);
    setActiveClassId(newClass.id);
  };

  const updateClass = (cls: Classroom) => {
    setClasses(prev => prev.map(c => (c.id === cls.id ? cls : c)));
  };

  return (
    <ClassroomContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        classes,
        activeClassId,
        setActiveClassId,
        activeClass,
        addClass,
        updateClass,
        students,
        currentStudents,
        selectedStudent,
        setSelectedStudent,
        addStudent,
        updateStudent,
        deleteStudent,
        updateStudentAvatar,
        attendanceRecords,
        selectedDate,
        setSelectedDate,
        todayAttendance,
        setStudentAttendance,
        markAllAttendance,
        saveAttendanceNotes,
        currentAttendanceNotes,
        updateStudentSeat,
        swapSeats,
        randomizeSeats,
        clearSeating,
        rewards,
        redemptions,
        pointTransactions,
        awardPoints,
        redeemReward,
        addRewardItem,
        updateRewardItem,
        deleteRewardItem,
        timetable,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        isSoundMuted,
        toggleSound,
        isQuickPointModalOpen,
        setIsQuickPointModalOpen,
        quickPointTargetStudent,
        setQuickPointTargetStudent,
        isLuckyWheelOpen,
        setIsLuckyWheelOpen,
        isCropModalOpen,
        setIsCropModalOpen,
        cropTargetStudentId,
        setCropTargetStudentId,
        cropSourceImage,
        setCropSourceImage,
        isAIAssistantOpen,
        setIsAIAssistantOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        aiApiKey,
        setAiApiKey,
        exportBackupData,
        importBackupData,
        activeModel,
        setActiveModel,
        importStudentsBulk,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  );
};

export const useClassroom = () => {
  const context = useContext(ClassroomContext);
  if (!context) {
    throw new Error('useClassroom must be used within ClassroomProvider');
  }
  return context;
};
