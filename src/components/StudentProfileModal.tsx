import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Star,
  Award,
  Phone,
  User,
  Calendar,
  Heart,
  Compass,
  Edit2,
  Check,
  Camera,
  Plus,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { Student } from '../types';

export const StudentProfileModal: React.FC = () => {
  const {
    selectedStudent,
    setSelectedStudent,
    updateStudent,
    deleteStudent,
    setCropTargetStudentId,
    setCropSourceImage,
    setIsCropModalOpen,
    pointTransactions,
    setQuickPointTargetStudent,
    setIsQuickPointModalOpen,
  } = useClassroom();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Student | null>(null);
  const [newBadgeText, setNewBadgeText] = useState('');

  if (!selectedStudent) return null;

  const currentData = isEditing && formData ? formData : selectedStudent;

  const handleStartEdit = () => {
    setFormData({ ...selectedStudent });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (formData) {
      updateStudent(formData);
      setIsEditing(false);
    }
  };

  const handleAddBadge = () => {
    if (!newBadgeText.trim() || !formData) return;
    setFormData({
      ...formData,
      badges: [...formData.badges, newBadgeText.trim()],
    });
    setNewBadgeText('');
  };

  const handleRemoveBadge = (index: number) => {
    if (!formData) return;
    const updated = [...formData.badges];
    updated.splice(index, 1);
    setFormData({ ...formData, badges: updated });
  };

  const openCropForThisStudent = () => {
    setCropTargetStudentId(selectedStudent.id);
    setCropSourceImage(selectedStudent.avatar);
    setIsCropModalOpen(true);
  };

  const studentTx = pointTransactions.filter(t => t.studentId === selectedStudent.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Top Banner with Student Cover */}
          <div className="relative bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-600 p-6 text-white shrink-0">
            <button
              id="btn-close-student-profile"
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              {/* Avatar with Crop Trigger */}
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white/90 shadow-lg bg-white">
                  <img
                    src={currentData.avatar}
                    alt={currentData.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <button
                  id="btn-open-crop-from-profile"
                  onClick={openCropForThisStudent}
                  title="Thay đổi & Cắt ảnh đại diện"
                  className="absolute bottom-0 right-0 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full shadow-md border-2 border-white transition-transform hover:scale-110"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
                    {currentData.studentCode}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      currentData.gender === 'female' ? 'bg-pink-400/80 text-white' : 'bg-blue-400/80 text-white'
                    }`}
                  >
                    {currentData.gender === 'female' ? 'Nữ' : 'Nam'}
                  </span>
                </div>

                <h2 className="text-2xl font-bold mt-1 text-white">{currentData.name}</h2>

                {/* Stars Counter */}
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-400/90 text-amber-950 font-bold rounded-xl shadow-xs text-sm">
                    <Star className="w-4 h-4 fill-amber-950" />
                    <span>{currentData.stars} Sao thưởng</span>
                  </div>
                  <button
                    id="btn-profile-award-points"
                    onClick={() => {
                      setQuickPointTargetStudent(selectedStudent);
                      setIsQuickPointModalOpen(true);
                    }}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-medium backdrop-blur-md flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thưởng / Trừ sao
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {isEditing ? (
              /* Edit Mode Form */
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider text-emerald-700">
                  Chỉnh sửa thông tin học sinh
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Họ và tên</label>
                    <input
                      id="edit-student-name"
                      type="text"
                      value={formData?.name || ''}
                      onChange={e => setFormData(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Mã học sinh</label>
                    <input
                      id="edit-student-code"
                      type="text"
                      value={formData?.studentCode || ''}
                      onChange={e => setFormData(prev => prev ? { ...prev, studentCode: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Giới tính</label>
                    <select
                      id="edit-student-gender"
                      value={formData?.gender || 'male'}
                      onChange={e => setFormData(prev => prev ? { ...prev, gender: e.target.value as 'male' | 'female' } : null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Ngày sinh</label>
                    <input
                      id="edit-student-birthday"
                      type="date"
                      value={formData?.birthday || ''}
                      onChange={e => setFormData(prev => prev ? { ...prev, birthday: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tên Phụ huynh</label>
                    <input
                      id="edit-student-parent-name"
                      type="text"
                      value={formData?.parentName || ''}
                      onChange={e => setFormData(prev => prev ? { ...prev, parentName: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">SĐT Phụ huynh</label>
                    <input
                      id="edit-student-parent-phone"
                      type="text"
                      value={formData?.parentPhone || ''}
                      onChange={e => setFormData(prev => prev ? { ...prev, parentPhone: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Sở thích</label>
                    <input
                      id="edit-student-hobby"
                      type="text"
                      value={formData?.hobby || ''}
                      onChange={e => setFormData(prev => prev ? { ...prev, hobby: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ví dụ: Đọc sách, đá bóng..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Ước mơ</label>
                    <input
                      id="edit-student-dream"
                      type="text"
                      value={formData?.dream || ''}
                      onChange={e => setFormData(prev => prev ? { ...prev, dream: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ví dụ: Bác sĩ, Kỹ sư..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Ghi chú của giáo viên</label>
                  <textarea
                    id="edit-student-notes"
                    rows={3}
                    value={formData?.notes || ''}
                    onChange={e => setFormData(prev => prev ? { ...prev, notes: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Badges edit */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Huy hiệu danh hiệu</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData?.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        {badge}
                        <button
                          type="button"
                          onClick={() => handleRemoveBadge(idx)}
                          className="text-amber-600 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="input-new-badge"
                      type="text"
                      placeholder="Nhập tên huy hiệu mới..."
                      value={newBadgeText}
                      onChange={e => setNewBadgeText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBadge();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddBadge}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                {/* Personal & Family Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-600" />
                      Thông tin cơ bản
                    </h4>
                    <div className="text-sm space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ngày sinh:</span>
                        <span className="font-medium text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {currentData.birthday}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Phụ huynh:</span>
                        <span className="font-medium text-slate-800">{currentData.parentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Điện thoại liên hệ:</span>
                        <a
                          href={`tel:${currentData.parentPhone}`}
                          className="font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {currentData.parentPhone}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60 space-y-3">
                    <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Tính cách & Ước mơ
                    </h4>
                    <div className="text-sm space-y-1.5">
                      <div className="flex items-start gap-2">
                        <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-slate-500 block">Sở thích:</span>
                          <span className="font-medium text-slate-800">{currentData.hobby || 'Chưa cập nhật'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Compass className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-slate-500 block">Ước mơ tương lai:</span>
                          <span className="font-medium text-slate-800">{currentData.dream || 'Chưa cập nhật'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges Section */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    Huy hiệu danh hiệu ({currentData.badges.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentData.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-2xs"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {badge}
                      </span>
                    ))}
                    {currentData.badges.length === 0 && (
                      <span className="text-xs text-slate-400 italic">Chưa có huy hiệu</span>
                    )}
                  </div>
                </div>

                {/* Teacher's Notes */}
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100">
                  <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
                    Nhận xét / Ghi chú của giáo viên:
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {currentData.notes || 'Chưa có ghi chú đặc biệt cho học sinh này.'}
                  </p>
                </div>

                {/* Recent Star Transactions History */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Lịch sử khen thưởng & Đổi quà gần đây
                  </h4>
                  {studentTx.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {studentTx.map(t => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-100"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                                t.type === 'positive'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {t.type === 'positive' ? '+' : '-'}
                            </span>
                            <span className="font-medium text-slate-700">{t.reason}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                t.type === 'positive' ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {t.amount > 0 ? `+${t.amount}` : t.amount} sao
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              {new Date(t.timestamp).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Chưa có ghi nhận điểm trong hệ thống.</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            {isEditing ? (
              <div className="flex items-center justify-end gap-3 w-full">
                <button
                  id="btn-cancel-edit-student"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                >
                  Huỷ
                </button>
                <button
                  id="btn-save-student-changes"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-2 transition-all"
                >
                  <Check className="w-4 h-4" />
                  Lưu thay đổi
                </button>
              </div>
            ) : (
              <>
                <button
                  id="btn-delete-student"
                  onClick={() => {
                    if (window.confirm(`Bạn có chắc muốn xoá học sinh "${selectedStudent.name}" khỏi danh sách lớp?`)) {
                      deleteStudent(selectedStudent.id);
                    }
                  }}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Xoá học sinh
                </button>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-edit-student-profile"
                    onClick={handleStartEdit}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500" />
                    Chỉnh sửa
                  </button>
                  <button
                    id="btn-profile-done"
                    onClick={() => setSelectedStudent(null)}
                    className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
