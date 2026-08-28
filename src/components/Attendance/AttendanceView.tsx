import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  XCircle,
  Calendar,
  Sparkles,
  Download,
  Search,
  Users,
  FileText,
  Save,
  Check,
} from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';
import { AttendanceStatus } from '../../types';
import { exportAttendanceReportDocx } from '../../utils/DocumentExporter';

export const AttendanceView: React.FC = () => {
  const {
    currentStudents,
    selectedDate,
    setSelectedDate,
    todayAttendance,
    setStudentAttendance,
    markAllAttendance,
    currentAttendanceNotes,
    saveAttendanceNotes,
    setSelectedStudent,
    activeClass,
  } = useClassroom();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [notesText, setNotesText] = useState(currentAttendanceNotes);
  const [isNotesSaved, setIsNotesSaved] = useState(false);

  // Sync notes on date change
  React.useEffect(() => {
    setNotesText(currentAttendanceNotes);
  }, [currentAttendanceNotes, selectedDate]);

  // Attendance metrics
  const total = currentStudents.length;
  let presentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;
  let unexcusedCount = 0;

  currentStudents.forEach(s => {
    const st = todayAttendance[s.id] || 'present';
    if (st === 'present') presentCount++;
    else if (st === 'late') lateCount++;
    else if (st === 'excused') excusedCount++;
    else if (st === 'unexcused') unexcusedCount++;
  });

  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 100;

  // Filtered list
  const filteredStudents = currentStudents.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchQuery.toLowerCase());
    const currentSt = todayAttendance[s.id] || 'present';
    const matchesFilter = filterStatus === 'all' || currentSt === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSaveNotes = () => {
    saveAttendanceNotes(notesText);
    setIsNotesSaved(true);
    setTimeout(() => setIsNotesSaved(false), 2500);
  };

  const exportAttendanceCSV = () => {
    const headers = ['STT', 'Mã Học Sinh', 'Họ và Tên', 'Giới Tính', 'Trạng Thái Ngày ' + selectedDate, 'SĐT Phụ Huynh'];
    const rows = currentStudents.map((s, index) => {
      const st = todayAttendance[s.id] || 'present';
      const stText =
        st === 'present'
          ? 'Có mặt'
          : st === 'late'
          ? 'Đi muộn'
          : st === 'excused'
          ? 'Vắng có phép'
          : 'Vắng không phép';
      return [
        index + 1,
        s.studentCode,
        `"${s.name}"`,
        s.gender === 'male' ? 'Nam' : 'Nữ',
        stText,
        s.parentPhone,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DiemDanh_${activeClass.code}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Summary Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-emerald-600" />
              Điểm Danh Thông Minh
            </h2>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              {activeClass.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Giao diện 1 chạm, tự động tổng hợp số liệu và tỷ lệ chuyên cần thời gian thực
          </p>
        </div>

        {/* Date Selector & Bulk Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              id="input-attendance-date"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
            />
          </div>

          <button
            id="btn-mark-all-present"
            onClick={() => markAllAttendance('present')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Có mặt tất cả
          </button>

          <button
            id="btn-export-attendance-csv"
            onClick={exportAttendanceCSV}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Xuất Excel/CSV
          </button>

          <button
            id="btn-export-attendance-docx"
            onClick={() => exportAttendanceReportDocx(activeClass, selectedDate, currentStudents, todayAttendance)}
            className="px-3 py-2 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            Báo cáo Word (.docx)
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium opacity-80 mb-1">
            <span>Tổng sĩ số</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold">{total}</div>
          <div className="text-[11px] mt-1 opacity-70">Học sinh lớp</div>
        </div>

        {/* Present */}
        <div
          onClick={() => setFilterStatus('present')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'present'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 mb-1">
            <span className={filterStatus === 'present' ? 'text-white' : ''}>Có mặt</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-extrabold ${filterStatus === 'present' ? 'text-white' : 'text-emerald-700'}`}>
            {presentCount}
          </div>
          <div className={`text-[11px] mt-1 ${filterStatus === 'present' ? 'text-emerald-100' : 'text-emerald-600'}`}>
            {total > 0 ? Math.round((presentCount / total) * 100) : 0}% lớp
          </div>
        </div>

        {/* Late */}
        <div
          onClick={() => setFilterStatus('late')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'late'
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-amber-50/60 border-amber-200 hover:bg-amber-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800 mb-1">
            <span className={filterStatus === 'late' ? 'text-white' : ''}>Đi muộn</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-2xl font-extrabold ${filterStatus === 'late' ? 'text-white' : 'text-amber-700'}`}>
            {lateCount}
          </div>
          <div className={`text-[11px] mt-1 ${filterStatus === 'late' ? 'text-amber-100' : 'text-amber-600'}`}>
            Học sinh
          </div>
        </div>

        {/* Excused */}
        <div
          onClick={() => setFilterStatus('excused')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'excused'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-blue-50/60 border-blue-200 hover:bg-blue-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-blue-800 mb-1">
            <span className={filterStatus === 'excused' ? 'text-white' : ''}>Vắng có phép</span>
            <HelpCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-2xl font-extrabold ${filterStatus === 'excused' ? 'text-white' : 'text-blue-700'}`}>
            {excusedCount}
          </div>
          <div className={`text-[11px] mt-1 ${filterStatus === 'excused' ? 'text-blue-100' : 'text-blue-600'}`}>
            Có đơn xin phép
          </div>
        </div>

        {/* Unexcused */}
        <div
          onClick={() => setFilterStatus('unexcused')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'unexcused'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-rose-50/60 border-rose-200 hover:bg-rose-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-rose-800 mb-1">
            <span className={filterStatus === 'unexcused' ? 'text-white' : ''}>Vắng không phép</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className={`text-2xl font-extrabold ${filterStatus === 'unexcused' ? 'text-white' : 'text-rose-700'}`}>
            {unexcusedCount}
          </div>
          <div className={`text-[11px] mt-1 ${filterStatus === 'unexcused' ? 'text-rose-100' : 'text-rose-600'}`}>
            Cần liên hệ PH
          </div>
        </div>

        {/* Rate */}
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Tỷ lệ chuyên cần</span>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-teal-700">{attendanceRate}%</div>
          <div className="w-full bg-teal-200 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-teal-600 h-full rounded-full" style={{ width: `${attendanceRate}%` }} />
          </div>
        </div>
      </div>

      {/* Student List & Attendance Actions */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Search and Table Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-attendance-students"
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã HS..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Hiển thị: <strong className="text-slate-800">{filteredStudents.length}</strong> / {total} học sinh</span>
          </div>
        </div>

        {/* Student Row Cards */}
        <div className="divide-y divide-slate-100">
          {filteredStudents.map((student, index) => {
            const currentStatus = todayAttendance[student.id] || 'present';

            return (
              <div
                key={student.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Student Info */}
                <div
                  onClick={() => setSelectedStudent(student)}
                  className="flex items-center gap-3.5 cursor-pointer group flex-1"
                >
                  <span className="text-xs font-bold text-slate-400 w-6 text-center">{index + 1}</span>

                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 shadow-2xs group-hover:border-emerald-500 transition-colors">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Status dot */}
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        currentStatus === 'present'
                          ? 'bg-emerald-500'
                          : currentStatus === 'late'
                          ? 'bg-amber-500'
                          : currentStatus === 'excused'
                          ? 'bg-blue-500'
                          : 'bg-rose-500'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">
                        {student.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {student.studentCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>PH: {student.parentName} ({student.parentPhone})</span>
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        ⭐ {student.stars} sao
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4-State Quick Action Buttons */}
                <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                  {/* Present */}
                  <button
                    id={`btn-att-present-${student.id}`}
                    onClick={() => setStudentAttendance(student.id, 'present')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Có mặt
                  </button>

                  {/* Late */}
                  <button
                    id={`btn-att-late-${student.id}`}
                    onClick={() => setStudentAttendance(student.id, 'late')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      currentStatus === 'late'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Đi muộn
                  </button>

                  {/* Excused */}
                  <button
                    id={`btn-att-excused-${student.id}`}
                    onClick={() => setStudentAttendance(student.id, 'excused')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      currentStatus === 'excused'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Có phép
                  </button>

                  {/* Unexcused */}
                  <button
                    id={`btn-att-unexcused-${student.id}`}
                    onClick={() => setStudentAttendance(student.id, 'unexcused')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      currentStatus === 'unexcused'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Không phép
                  </button>
                </div>
              </div>
            );
          })}

          {filteredStudents.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              Không tìm thấy học sinh nào phù hợp với bộ lọc.
            </div>
          )}
        </div>
      </div>

      {/* Daily Attendance Notes Box */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Nhật ký / Ghi chú điểm danh ngày {selectedDate}
          </label>
          <button
            id="btn-save-attendance-notes"
            onClick={handleSaveNotes}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isNotesSaved ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isNotesSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {isNotesSaved ? 'Đã lưu ghi chú' : 'Lưu ghi chú'}
          </button>
        </div>
        <textarea
          id="textarea-attendance-notes"
          rows={2}
          value={notesText}
          onChange={e => setNotesText(e.target.value)}
          placeholder="Nhập lý do học sinh đi muộn / vắng mặt, ghi chú sức khoẻ của các em trong ngày..."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};
