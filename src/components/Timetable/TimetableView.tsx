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
    updateClass,
  } = useClassroom();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'file'>(activeClass.timetableFile ? 'file' : 'grid');
  const [uploadError, setUploadError] = useState('');

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
    { period: 1, time: '07:30 - 08:10', session: 'Sáng', label: 'Tiết 1' },
    { period: 2, time: '08:15 - 08:55', session: 'Sáng', label: 'Tiết 2' },
    { period: 3, time: '09:15 - 09:55', session: 'Sáng', label: 'Tiết 3' },
    { period: 4, time: '10:00 - 10:40', session: 'Sáng', label: 'Tiết 4' },
    { period: 5, time: '10:45 - 11:25', session: 'Sáng', label: 'Tiết 5' },
    { period: 6, time: '13:30 - 14:10', session: 'Chiều', label: 'Tiết 1' },
    { period: 7, time: '14:15 - 14:55', session: 'Chiều', label: 'Tiết 2' },
    { period: 8, time: '15:15 - 15:55', session: 'Chiều', label: 'Tiết 3' },
    { period: 9, time: '16:00 - 16:40', session: 'Chiều', label: 'Tiết 4' },
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

  const handleTimetableFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Kích thước file không được vượt quá 8MB!');
      return;
    }

    const fileType = file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : null;
    if (!fileType) {
      setUploadError('Hệ thống chỉ chấp nhận file ảnh hoặc tệp PDF!');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateClass({
        ...activeClass,
        timetableFile: base64,
        timetableFileType: fileType,
      });
      setViewMode('file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveTimetableFile = () => {
    if (window.confirm('Bạn có chắc muốn xoá file thời khoá biểu đính kèm?')) {
      updateClass({
        ...activeClass,
        timetableFile: undefined,
        timetableFileType: undefined,
      });
      setViewMode('grid');
    }
  };

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
          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-purple-600/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm Tiết Học Mới
        </button>
      </div>

      {/* View Switcher & File Upload controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-3xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold w-full md:w-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Xem Bản Lưới
          </button>
          {activeClass.timetableFile && (
            <button
              type="button"
              onClick={() => setViewMode('file')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'file' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Xem Bản PDF/Ảnh Đính Kèm
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <label className="px-3.5 py-2 bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/20 text-slate-700 hover:text-purple-900 rounded-xl text-xs font-bold shadow-3xs flex items-center gap-1.5 transition-all cursor-pointer">
            <Plus className="w-4 h-4 text-purple-600" />
            <span>Tải Lên TKB (Ảnh/PDF)</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleTimetableFileUpload}
              className="hidden"
            />
          </label>
          
          {activeClass.timetableFile && (
            <button
              type="button"
              onClick={handleRemoveTimetableFile}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              Xoá File Đính Kèm
            </button>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          {uploadError}
        </div>
      )}

      {/* Main Content Area */}
      {viewMode === 'file' && activeClass.timetableFile ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center min-h-[400px]">
          {activeClass.timetableFileType === 'pdf' ? (
            <embed
              src={activeClass.timetableFile}
              type="application/pdf"
              className="w-full h-[650px] rounded-2xl border border-slate-200"
            />
          ) : (
            <div className="max-w-4xl w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-slate-50 flex items-center justify-center p-2">
              <img
                src={activeClass.timetableFile}
                alt="Thời khóa biểu lớp"
                className="max-w-full h-auto object-contain rounded-lg"
              />
            </div>
          )}
        </div>
      ) : (
        /* Timetable Table Grid */
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
                {(() => {
                  const rows: React.ReactNode[] = [];
                  PERIODS.forEach((p) => {
                    // Morning Header Divider
                    if (p.period === 1) {
                      rows.push(
                        <tr key="morning-header" className="bg-emerald-50/50">
                          <td colSpan={7} className="p-2 font-extrabold text-[11px] text-emerald-800 uppercase tracking-wider text-center">
                            ☀️ BUỔI SÁNG
                          </td>
                        </tr>
                      );
                    }
                    // Afternoon Header Divider
                    if (p.period === 6) {
                      rows.push(
                        <tr key="afternoon-header" className="bg-amber-50/50 border-t-2 border-slate-200">
                          <td colSpan={7} className="p-2 font-extrabold text-[11px] text-amber-800 uppercase tracking-wider text-center">
                            🌤️ BUỔI CHIỀU
                          </td>
                        </tr>
                      );
                    }

                    rows.push(
                      <tr key={p.period} className="hover:bg-slate-50/40 transition-colors">
                        {/* Period Time Header */}
                        <td className="p-3 bg-slate-50/70 border-r border-slate-100 font-medium text-slate-600">
                          <div className="font-bold text-slate-800">{p.label}</div>
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
                                  className="w-full h-full min-h-[85px] rounded-2xl border border-dashed border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-slate-300 hover:text-purple-600 flex flex-col items-center justify-center transition-all group cursor-pointer"
                                >
                                  <Plus className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
                                  <span className="text-[10px] font-medium">Thêm</span>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  });
                  return rows;
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                        {p.label} ({p.session})
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
