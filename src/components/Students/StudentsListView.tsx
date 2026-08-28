import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Camera,
  Star,
  Download,
  Filter,
  Phone,
  Calendar,
  Grid,
  List,
  Award,
  MoreVertical,
} from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';
import { Student } from '../../types';

export const StudentsListView: React.FC = () => {
  const {
    currentStudents,
    setSelectedStudent,
    setCropTargetStudentId,
    setCropSourceImage,
    setIsCropModalOpen,
    setQuickPointTargetStudent,
    setIsQuickPointModalOpen,
    activeClass,
  } = useClassroom();

  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredStudents = currentStudents.filter(s => {
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parentPhone.includes(searchQuery);
    const matchesGender = genderFilter === 'all' || s.gender === genderFilter;
    return matchesQuery && matchesGender;
  });

  const exportStudentsCSV = () => {
    const headers = ['STT', 'Mã Học Sinh', 'Họ và Tên', 'Giới Tính', 'Ngày Sinh', 'Sao Tích Luỹ', 'Phụ Huynh', 'SĐT Phụ Huynh', 'Ghi Chú'];
    const rows = currentStudents.map((s, idx) => [
      idx + 1,
      s.studentCode,
      `"${s.name}"`,
      s.gender === 'male' ? 'Nam' : 'Nữ',
      s.birthday,
      s.stars,
      `"${s.parentName}"`,
      s.parentPhone,
      `"${s.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DanhSachHocSinh_${activeClass.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenCrop = (std: Student, e: React.MouseEvent) => {
    e.stopPropagation();
    setCropTargetStudentId(std.id);
    setCropSourceImage(std.avatar);
    setIsCropModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-teal-600" />
              Hồ Sơ & Danh Sách Học Sinh
            </h2>
            <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 text-xs font-bold rounded-full">
              Sĩ số: {currentStudents.length} em
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý thông tin chi tiết, cắt chỉnh ảnh đại diện, theo dõi khen thưởng và liên lạc phụ huynh
          </p>
        </div>

        <button
          id="btn-export-students-csv"
          onClick={exportStudentsCSV}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-400" />
          Xuất Danh Sách Excel/CSV
        </button>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-student-directory"
            type="text"
            placeholder="Tìm theo tên học sinh, mã số, số điện thoại phụ huynh..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-teal-500 font-medium"
          />
        </div>

        {/* Gender Filter & View Mode */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                genderFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tất cả ({currentStudents.length})
            </button>
            <button
              onClick={() => setGenderFilter('male')}
              className={`px-3 py-1 rounded-lg transition-all ${
                genderFilter === 'male' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Nam ({currentStudents.filter(s => s.gender === 'male').length})
            </button>
            <button
              onClick={() => setGenderFilter('female')}
              className={`px-3 py-1 rounded-lg transition-all ${
                genderFilter === 'female' ? 'bg-white text-pink-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Nữ ({currentStudents.filter(s => s.gender === 'female').length})
            </button>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl text-slate-600">
            <button
              id="btn-view-mode-cards"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
              title="Dạng thẻ Card"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              id="btn-view-mode-table"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
              title="Dạng bảng Table"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map(student => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Header with Avatar & Crop button */}
                <div className="flex items-start justify-between mb-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 group-hover:border-teal-500 shadow-2xs transition-colors">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Crop trigger */}
                    <button
                      id={`btn-crop-avatar-${student.id}`}
                      onClick={e => handleOpenCrop(student, e)}
                      title="Cắt / Chỉnh sửa ảnh đại diện"
                      className="absolute -bottom-1 -right-1 p-1 bg-white hover:bg-slate-100 text-slate-700 rounded-full shadow-xs border border-slate-200 transition-transform hover:scale-110"
                    >
                      <Camera className="w-3 h-3 text-teal-600" />
                    </button>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      student.gender === 'female' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {student.gender === 'female' ? 'Nữ' : 'Nam'}
                  </span>
                </div>

                {/* Name & Code */}
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-teal-700 transition-colors line-clamp-1">
                  {student.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">{student.studentCode}</span>

                {/* Stars & Badges */}
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1 font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{student.stars} sao</span>
                  </div>

                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    {student.badges.length} danh hiệu
                  </span>
                </div>

                {/* Parent Contact */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">PH: {student.parentName}</span>
                    <span className="font-semibold text-teal-600 text-[11px]">{student.parentPhone}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Quick Action */}
              <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  id={`btn-card-give-star-${student.id}`}
                  onClick={e => {
                    e.stopPropagation();
                    setQuickPointTargetStudent(student);
                    setIsQuickPointModalOpen(true);
                  }}
                  className="text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Star className="w-3 h-3 fill-amber-500" />
                  Thưởng sao
                </button>

                <span className="text-[11px] text-teal-600 font-semibold group-hover:underline">
                  Xem hồ sơ →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3.5 text-center w-12">STT</th>
                <th className="p-3.5">Học sinh</th>
                <th className="p-3.5">Mã HS</th>
                <th className="p-3.5">Giới tính</th>
                <th className="p-3.5">Ngày sinh</th>
                <th className="p-3.5">Sao thưởng</th>
                <th className="p-3.5">Phụ huynh & SĐT</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.map((s, idx) => (
                <tr
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  className="hover:bg-teal-50/40 cursor-pointer transition-colors"
                >
                  <td className="p-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <span className="font-bold text-slate-800 text-xs">{s.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-500 font-mono">{s.studentCode}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        s.gender === 'female' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {s.gender === 'female' ? 'Nữ' : 'Nam'}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600">{s.birthday}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      ⭐ {s.stars}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div>{s.parentName}</div>
                    <div className="text-[11px] text-teal-600 font-semibold">{s.parentPhone}</div>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setQuickPointTargetStudent(s);
                        setIsQuickPointModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold text-[11px] mr-2"
                    >
                      + Sao
                    </button>
                    <button
                      onClick={e => handleOpenCrop(s, e)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px]"
                    >
                      Ảnh
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
