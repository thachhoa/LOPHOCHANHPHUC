import React, { useState } from 'react';
import {
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  Plus,
  UserPlus,
  Play,
  Calendar,
  Layers,
  Settings,
  Brain,
} from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { Classroom } from '../types';
import { SettingsModal } from './SettingsModal';

export const Header: React.FC = () => {
  const {
    activeClass,
    classes,
    addClass,
    isSoundMuted,
    toggleSound,
    setIsQuickPointModalOpen,
    setQuickPointTargetStudent,
    setIsLuckyWheelOpen,
    currentStudents,
    addStudent,
    isSettingsOpen,
    setIsSettingsOpen,
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    aiApiKey,
  } = useClassroom();

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);

  // Quick add student form state
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'male' | 'female'>('male');
  const [newStudentBirthday, setNewStudentBirthday] = useState('2016-01-01');
  const [newStudentParent, setNewStudentParent] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');

  // Add class form state
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [newClassTeacher, setNewClassTeacher] = useState('');

  React.useEffect(() => {
    const hasKey = localStorage.getItem('lophoc_ai_api_key');
    if (!hasKey) {
      const timer = setTimeout(() => {
        setIsSettingsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [setIsSettingsOpen]);

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const nextCode = `HS${activeClass.grade}-${String(currentStudents.length + 1).padStart(2, '0')}`;
    const defaultAvatars = {
      male: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      female: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    };

    addStudent({
      classId: activeClass.id,
      studentCode: nextCode,
      name: newStudentName.trim(),
      gender: newStudentGender,
      birthday: newStudentBirthday,
      avatar: defaultAvatars[newStudentGender],
      parentName: newStudentParent.trim() || 'Phụ huynh học sinh',
      parentPhone: newStudentPhone.trim() || '0901 234 567',
      notes: 'Học sinh mới tham gia lớp học.',
      hobby: 'Học tập & vui chơi',
      dream: 'Ước mơ tương lai',
    });

    setNewStudentName('');
    setIsAddStudentOpen(false);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    addClass({
      name: newClassName.trim(),
      code: newClassCode.trim() || `${newClassName.substring(0, 3)}-2025`,
      grade: 3,
      academicYear: '2025 - 2026',
      teacherName: newClassTeacher.trim() || 'Giáo viên Chủ nhiệm',
      roomName: 'Phòng 205',
      rows: 4,
      cols: 6,
      themeColor: 'emerald',
    });

    setNewClassName('');
    setNewClassCode('');
    setNewClassTeacher('');
    setIsAddClassOpen(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 select-none shadow-2xs">
      {/* Current Context Details */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-800 text-lg">{activeClass.name}</h2>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-100">
              Mã: {activeClass.code}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {activeClass.roomName} • GVCN: <span className="font-medium text-slate-700">{activeClass.teacherName}</span>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Settings Button */}
        <div className="flex items-center gap-1.5">
          {!aiApiKey && (
            <span className="text-[10px] text-rose-600 font-extrabold animate-pulse hidden md:inline bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
              Lấy API key để sử dụng app
            </span>
          )}
          <button
            id="btn-open-settings"
            onClick={() => setIsSettingsOpen(true)}
            title="Cài đặt hệ thống"
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-2xs ${
              !aiApiKey
                ? 'bg-rose-500 border-rose-600 text-white hover:bg-rose-600'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Sound FX Toggle */}
        <button
          id="btn-toggle-sound"
          onClick={toggleSound}
          title={isSoundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className={`p-2 rounded-xl border transition-all ${
            isSoundMuted
              ? 'bg-slate-50 border-slate-200 text-slate-400'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Lucky Wheel Modal Trigger */}
        <button
          id="btn-header-lucky-wheel"
          onClick={() => setIsLuckyWheelOpen(true)}
          className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="hidden sm:inline">Vòng quay gọi tên</span>
        </button>

        {/* AI Assistant Modal Trigger */}
        <button
          id="btn-header-ai-assistant"
          onClick={() => setIsAIAssistantOpen(true)}
          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Brain className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Trợ lý AI</span>
        </button>

        {/* Quick Star Points Modal Trigger */}
        <button
          id="btn-header-quick-points"
          onClick={() => {
            setQuickPointTargetStudent(null);
            setIsQuickPointModalOpen(true);
          }}
          className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="hidden sm:inline">Thưởng sao</span>
        </button>

        {/* Add Student Button */}
        <button
          id="btn-header-add-student"
          onClick={() => setIsAddStudentOpen(true)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-emerald-600/30 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Thêm học sinh</span>
        </button>
      </div>

      {/* Add Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                Thêm học sinh mới vào {activeClass.name}
              </h3>
              <button
                id="btn-close-add-student-modal"
                onClick={() => setIsAddStudentOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Họ và tên học sinh *</label>
                <input
                  id="input-new-student-name"
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Hoàng Long"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Giới tính</label>
                  <select
                    id="input-new-student-gender"
                    value={newStudentGender}
                    onChange={e => setNewStudentGender(e.target.value as 'male' | 'female')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Ngày sinh</label>
                  <input
                    id="input-new-student-birthday"
                    type="date"
                    value={newStudentBirthday}
                    onChange={e => setNewStudentBirthday(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Họ tên Phụ huynh</label>
                <input
                  id="input-new-student-parent"
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn Hưng"
                  value={newStudentParent}
                  onChange={e => setNewStudentParent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Số điện thoại liên hệ</label>
                <input
                  id="input-new-student-phone"
                  type="text"
                  placeholder="Ví dụ: 0912 345 678"
                  value={newStudentPhone}
                  onChange={e => setNewStudentPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  id="btn-cancel-add-student"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  id="btn-submit-add-student"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Thêm vào lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Configuration Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};
