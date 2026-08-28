import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  User,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';
import { TimetableSlot } from '../../types';

export const TimetableView: React.FC = () => {
  const {
    timetable,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    activeClass,
  } = useClassroom();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [formData, setFormData] = useState<{
    dayOfWeek: number;
    period: number;
    subject: string;
    teacher: string;
    room: string;
    timeRange: string;
    color: string;
  }>({
    dayOfWeek: 2,
    period: 1,
    subject: 'Toán',
    teacher: activeClass.teacherName,
    room: activeClass.roomName,
    timeRange: '07:30 - 08:10',
    color: '#10B981',
  });

  const DAYS = [
    { day: 2, label: 'Thứ Hai', short: 'T2' },
    { day: 3, label: 'Thứ Ba', short: 'T3' },
    { day: 4, label: 'Thứ Tư', short: 'T4' },
    { day: 5, label: 'Thứ Năm', short: 'T5' },
    { day: 6, label: 'Thứ Sáu', short: 'T6' },
    { day: 7, label: 'Thứ Bảy', short: 'T7' },
  ];

  const PERIODS = [
    { period: 1, time: '07:30 - 08:10', session: 'Sáng' },
    { period: 2, time: '08:15 - 08:55', session: 'Sáng' },
    { period: 3, time: '09:15 - 09:55', session: 'Sáng' },
    { period: 4, time: '10:00 - 10:40', session: 'Sáng' },
    { period: 5, time: '13:30 - 14:10', session: 'Chiều' },
    { period: 6, time: '14:15 - 14:55', session: 'Chiều' },
  ];

  const POPULAR_SUBJECTS = [
    { name: 'Toán', color: '#10B981' },
    { name: 'Tiếng Việt', color: '#3B82F6' },
    { name: 'Tiếng Anh', color: '#8B5CF6' },
    { name: 'Tự nhiên & Xã hội', color: '#06B6D4' },
    { name: 'Đạo đức', color: '#F59E0B' },
    { name: 'Mĩ thuật', color: '#EC4899' },
    { name: 'Âm nhạc', color: '#6366F1' },
    { name: 'Giáo dục Thể chất', color: '#F97316' },
    { name: 'Tin học', color: '#0EA5E9' },
    { name: 'Công nghệ', color: '#84CC16' },
    { name: 'Hoạt động trải nghiệm', color: '#14B8A6' },
    { name: 'Chào cờ / Sinh hoạt', color: '#EF4444' },
  ];

  const currentClassTimetable = timetable.filter(s => s.classId === activeClass.id);

  const getSlot = (day: number, period: number): TimetableSlot | undefined => {
    return currentClassTimetable.find(s => s.dayOfWeek === day && s.period === period);
  };

  const handleOpenAdd = (day: number, period: number) => {
    const periodObj = PERIODS.find(p => p.period === period);
    setEditingSlot(null);
    setFormData({
      dayOfWeek: day,
      period: period,
      subject: 'Toán',
      teacher: activeClass.teacherName,
      room: activeClass.roomName,
      timeRange: periodObj?.time || '07:30 - 08:10',
      color: '#10B981',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormData({
      dayOfWeek: slot.dayOfWeek,
      period: slot.period,
      subject: slot.subject,
      teacher: slot.teacher,
      room: slot.room || activeClass.roomName,
      timeRange: slot.timeRange,
      color: slot.color,
    });
    setIsModalOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim()) return;

    if (editingSlot) {
      updateTimetableSlot({
        ...editingSlot,
        ...formData,
      });
    } else {
      addTimetableSlot({
        classId: activeClass.id,
        ...formData,
      });
    }
    setIsModalOpen(false);
  };

  // Determine current day of week (in VN JS: 0=Sun, 1=Mon(T2), 2=Tue(T3)...)
  const currentJsDay = new Date().getDay();
  const todayDayOfWeek = currentJsDay === 0 ? 8 : currentJsDay + 1; // 2 to 7

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Thời Khóa Biểu Lớp Học
            </h2>
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
              {activeClass.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Lịch học hàng tuần, phân màu trực quan theo chuẩn môn học Giáo dục Việt Nam
          </p>
        </div>

        <button
          id="btn-add-timetable-slot"
          onClick={() => handleOpenAdd(2, 1)}
          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-purple-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Thêm Tiết Học Mới
        </button>
      </div>

      {/* Timetable Table Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-left text-xs font-bold text-slate-500 w-28 uppercase tracking-wider">
                  Tiết / Giờ
                </th>
                {DAYS.map(d => {
                  const isToday = d.day === todayDayOfWeek;
                  return (
                    <th
                      key={d.day}
                      className={`p-3 text-center text-xs font-bold uppercase tracking-wider ${
                        isToday ? 'bg-purple-100/70 text-purple-900 border-b-2 border-purple-600' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{d.label}</span>
                        {isToday && (
                          <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.2 rounded font-bold">
                            Hôm nay
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {PERIODS.map(p => (
                <tr key={p.period} className="hover:bg-slate-50/40 transition-colors">
                  {/* Period Time Header */}
                  <td className="p-3 bg-slate-50/70 border-r border-slate-100 font-medium text-slate-600">
                    <div className="font-bold text-slate-800">Tiết {p.period}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {p.time}
                    </div>
                  </td>

                  {/* Days columns */}
                  {DAYS.map(d => {
                    const slot = getSlot(d.day, p.period);
                    const isToday = d.day === todayDayOfWeek;

                    return (
                      <td
                        key={d.day}
                        className={`p-2 border-r border-slate-100 min-w-[150px] align-top ${
                          isToday ? 'bg-purple-50/30' : ''
                        }`}
                      >
                        {slot ? (
                          <div
                            onClick={() => handleOpenEdit(slot)}
                            className="p-2.5 rounded-2xl border text-left transition-all hover:scale-102 hover:shadow-md cursor-pointer group flex flex-col justify-between h-full min-h-[85px]"
                            style={{
                              backgroundColor: `${slot.color}12`,
                              borderColor: `${slot.color}40`,
                            }}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span
                                  className="font-bold text-xs line-clamp-1"
                                  style={{ color: slot.color }}
                                >
                                  {slot.subject}
                                </span>
                                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-400" />
                              </div>

                              <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-1 font-medium">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{slot.teacher}</span>
                              </div>
                            </div>

                            {slot.room && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{slot.room}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            id={`btn-add-slot-${d.day}-${p.period}`}
                            onClick={() => handleOpenAdd(d.day, p.period)}
                            className="w-full h-full min-h-[85px] rounded-2xl border border-dashed border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-slate-300 hover:text-purple-600 flex flex-col items-center justify-center transition-all group"
                          >
                            <Plus className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-medium">Thêm</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Timetable Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                {editingSlot ? 'Chỉnh Sửa Tiết Học' : 'Thêm Tiết Học Mới'}
              </h3>
              <button
                id="btn-close-timetable-modal"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="mt-4 space-y-3.5">
              {/* Day and Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Ngày học</label>
                  <select
                    id="input-timetable-day"
                    value={formData.dayOfWeek}
                    onChange={e => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    {DAYS.map(d => (
                      <option key={d.day} value={d.day}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tiết thứ</label>
                  <select
                    id="input-timetable-period"
                    value={formData.period}
                    onChange={e => {
                      const pNum = parseInt(e.target.value);
                      const pObj = PERIODS.find(p => p.period === pNum);
                      setFormData({
                        ...formData,
                        period: pNum,
                        timeRange: pObj?.time || formData.timeRange,
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    {PERIODS.map(p => (
                      <option key={p.period} value={p.period}>
                        Tiết {p.period} ({p.session})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Presets */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Môn học</label>
                <input
                  id="input-timetable-subject"
                  type="text"
                  required
                  placeholder="Ví dụ: Toán, Tiếng Việt..."
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 font-bold text-slate-800"
                />

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {POPULAR_SUBJECTS.map(subj => (
                    <button
                      key={subj.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, subject: subj.name, color: subj.color })}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all hover:scale-105"
                      style={{
                        backgroundColor: `${subj.color}15`,
                        color: subj.color,
                        borderColor: `${subj.color}40`,
                      }}
                    >
                      {subj.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Teacher & Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Giáo viên phụ trách</label>
                  <input
                    id="input-timetable-teacher"
                    type="text"
                    value={formData.teacher}
                    onChange={e => setFormData({ ...formData, teacher: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phòng học</label>
                  <input
                    id="input-timetable-room"
                    type="text"
                    value={formData.room}
                    onChange={e => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Time Range */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Khung giờ tiết học</label>
                <input
                  id="input-timetable-timerange"
                  type="text"
                  value={formData.timeRange}
                  onChange={e => setFormData({ ...formData, timeRange: e.target.value })}
                  placeholder="07:30 - 08:10"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                {editingSlot ? (
                  <button
                    type="button"
                    id="btn-delete-timetable-slot"
                    onClick={() => {
                      if (window.confirm('Xoá tiết học này khỏi thời khóa biểu?')) {
                        deleteTimetableSlot(editingSlot.id);
                        setIsModalOpen(false);
                      }
                    }}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xoá tiết này
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    id="btn-cancel-timetable-form"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-timetable-form"
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
                  >
                    Lưu Tiết Học
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
