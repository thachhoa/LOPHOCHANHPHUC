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
  Download,
  Upload,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { downloadStudentTemplate, parseStudentListText } from '../utils/studentImport';

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
    importStudentsBulk,
  } = useClassroom();

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);

  // File upload states
  const [addStudentMode, setAddStudentMode] = useState<'manual' | 'file'>('manual');
  const [importFileName, setImportFileName] = useState('');
  const [parsedStudentsCount, setParsedStudentsCount] = useState(0);
  const [parsedStudentsList, setParsedStudentsList] = useState<any[]>([]);
  const [importError, setImportError] = useState('');

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

  const handleDownloadTemplate = () => {
    downloadStudentTemplate();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportFileName(file.name);
    setImportError('');
    setParsedStudentsList([]);
    setParsedStudentsCount(0);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const res = parseStudentListText(text, activeClass.id);
        if (!res.success) {
          setImportError(res.message || 'Lỗi đọc tệp!');
        } else {
          setParsedStudentsList(res.students);
          setParsedStudentsCount(res.students.length);
        }
      } catch (err: any) {
        setImportError('Lỗi xử lý tệp: ' + err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedStudentsList.length === 0) return;
    
    // Pass replaceExisting = true to reset current class list
    importStudentsBulk(parsedStudentsList, true);
    setIsAddStudentOpen(false);
    
    setAddStudentMode('manual');
    setImportFileName('');
    setParsedStudentsList([]);
    setParsedStudentsCount(0);
  };

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
            {activeClass.code && (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-100">
                Mã: {activeClass.code}
              </span>
            )}
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

            {/* Tab Selector */}
            <div className="flex border-b border-slate-100 mt-2 mb-4">
              <button
                type="button"
                onClick={() => setAddStudentMode('manual')}
                className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition-all ${
                  addStudentMode === 'manual'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Thêm thủ công
              </button>
              <button
                type="button"
                onClick={() => setAddStudentMode('file')}
                className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition-all ${
                  addStudentMode === 'file'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Nhập từ file (CSV/Excel)
              </button>
            </div>

            {addStudentMode === 'manual' ? (
              <form onSubmit={handleCreateStudent} className="space-y-3.5">
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
                    />
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
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-add-student"
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
                  >
                    Thêm vào lớp
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleImportSubmit} className="space-y-4">
                {/* Instructions and Download Template Link */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 space-y-2">
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Tải mẫu danh sách chuẩn gồm 5 cột: <span className="font-bold text-emerald-800">Họ tên học sinh, Ngày sinh, Giới tính, Họ tên phụ huynh, Số điện thoại</span>.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 text-slate-700 hover:text-emerald-800 rounded-lg text-[10px] font-bold shadow-3xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    Tải tệp mẫu chuẩn (.csv)
                  </button>
                </div>

                {/* Upload Input Area */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Chọn tệp danh sách học sinh (CSV / Excel)</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-between px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-600 cursor-pointer hover:border-slate-400">
                      <span className="truncate">{importFileName || 'Chưa chọn tệp...'}</span>
                      <Upload className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                      <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {importError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 font-medium">
                      ⚠️ {importError}
                    </div>
                  )}
                </div>

                {/* Preview Status & Reset Alert */}
                {parsedStudentsCount > 0 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Đọc dữ liệu thành công! (Tìm thấy {parsedStudentsCount} học sinh)</span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 leading-normal bg-white/70 p-2 rounded-lg border border-emerald-100">
                      ⚡ <strong>Lưu ý:</strong> Tất cả danh sách học sinh cũ sẽ được <span className="text-rose-600 font-bold">làm mới (reset)</span> và thay thế hoàn toàn bằng <strong>{parsedStudentsCount} học sinh</strong> trong danh sách này.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddStudentOpen(false);
                      setAddStudentMode('manual');
                      setImportFileName('');
                      setParsedStudentsList([]);
                      setParsedStudentsCount(0);
                    }}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    disabled={parsedStudentsCount === 0}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    Nhập danh sách ({parsedStudentsCount} HS)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Settings Configuration Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};
