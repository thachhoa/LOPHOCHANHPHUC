import React from 'react';
import {
  CalendarCheck,
  LayoutGrid,
  Gift,
  Calendar,
  Users,
  Trophy,
  GraduationCap,
  Sparkles,
  School,
  ChevronDown,
  Plus,
  BarChart3,
} from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { ActiveTab } from '../types';

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    classes,
    activeClassId,
    setActiveClassId,
    activeClass,
    currentStudents,
  } = useClassroom();

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; color: string; badge?: string }[] = [
    { id: 'attendance', label: 'Điểm danh', icon: CalendarCheck, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'seating', label: 'Sơ đồ lớp', icon: LayoutGrid, color: 'text-blue-600 bg-blue-50' },
    { id: 'rewards', label: 'Đổi quà (Gamification)', icon: Gift, color: 'text-amber-600 bg-amber-50' },
    { id: 'timetable', label: 'Thời khóa biểu', icon: Calendar, color: 'text-purple-600 bg-purple-50' },
    { id: 'students', label: 'Hồ sơ học sinh', icon: Users, color: 'text-teal-600 bg-teal-50', badge: `${currentStudents.length}` },
    { id: 'leaderboard', label: 'Bảng vinh danh', icon: Trophy, color: 'text-rose-600 bg-rose-50' },
    { id: 'dashboard', label: 'Thống kê lớp học', icon: BarChart3, color: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen shrink-0 select-none shadow-xs">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold text-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-extrabold text-slate-800 text-base tracking-tight flex items-center gap-1.5">
            Lớp Học Vui Vẻ
          </h1>
          <p className="text-[11px] text-emerald-600 font-medium">EdTech Classroom</p>
        </div>
      </div>

      {/* Class Selector Dropdown */}
      <div className="p-4 border-b border-slate-100">
        <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/70">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
            <span className="flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-slate-400" />
              Lớp đang chọn:
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md font-bold">
              {activeClass.academicYear}
            </span>
          </div>

          <div className="relative">
            <select
              id="select-active-class"
              value={activeClassId}
              onChange={e => setActiveClassId(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 font-bold text-sm rounded-xl px-3 py-2 pr-8 appearance-none shadow-2xs focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
            <span>GVCN: <strong className="text-slate-700">{activeClass.teacherName}</strong></span>
            <span>Sĩ số: <strong className="text-emerald-700 font-bold">{currentStudents.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Quản Lý Hoạt Động
        </div>

        {navItems.map(item => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? 'bg-white/20 text-white' : item.color
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-emerald-600' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Credit */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex flex-col gap-1">
        <div className="flex items-center justify-between font-medium">
          <span className="flex items-center gap-1 text-slate-600">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            Giáo viên EdTech
          </span>
          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
            v2.5
          </span>
        </div>
        <p className="text-[10px] text-slate-400">Thiết kế chuẩn Giáo dục Việt Nam</p>
      </div>
    </aside>
  );
};
