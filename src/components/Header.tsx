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
    const headers = 'Ma hoc sinh,Ho ten,Gio tinh (Nam/Nu),Ngay sinh (YYYY-MM-DD),Ho ten Phu huynh,SDT lien he,So thich,Uoc mo\n';
    const sample = 'HS-001,Nguyen Minh Anh,Nu,2016-04-12,Nguyen Van Hung,0912345678,Doc sach,Bac si\nHS-002,Tran Bảo Long,Nam,2016-08-20,Tran Dinh Trong,0987654321,Co vua,Ky su';
    const csvContent = '\uFEFF' + headers + sample;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Mau_Danh_Sach_Hoc_Sinh.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        const lines = text.split(/\r?\n/);
        const list: any[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const columns = line.split(',').map(col => col.replace(/^["']|["']$/g, '').trim());
          if (columns.length < 2 || !columns[1]) continue;
          
          list.push({
            classId: activeClass.id,
            studentCode: columns[0] || `HS-${Date.now()}-${i}`,
            name: columns[1],
            gender: columns[2]?.toLowerCase() === 'nữ' || columns[2]?.toLowerCase() === 'nu' || columns[2]?.toLowerCase() === 'female' ? 'female' : 'male',
            birthday: columns[3] || '2016-01-01',
            avatar: '',
            parentName: columns[4] || '',
            parentPhone: columns[5] || '',
            hobby: columns[6] || '',
            dream: columns[7] || '',
          });
        }

        if (list.length === 0) {
          setImportError('Không tìm thấy học sinh hợp lệ trong file!');
        } else {
          setParsedStudentsList(list);
          setParsedStudentsCount(list.length);
        }
      } catch (err: any) {
        setImportError('Lỗi đọc file: ' + err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedStudentsList.length === 0) return;
    
    const AVATARS_MALE = [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595454223600-91fbdd77e584?w=200&auto=format&fit=crop&q=80',
    ];
    const AVATARS_FEMALE = [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    ];
    
    const finalizedList = parsedStudentsList.map((std, idx) => {
      const avatarUrl = std.gender === 'female' 
        ? AVATARS_FEMALE[idx % AVATARS_FEMALE.length] 
        : AVATARS_MALE[idx % AVATARS_MALE.length];
      return {
        ...std,
        avatar: avatarUrl,
      };
    });
    
    importStudentsBulk(finalizedList);
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
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tải danh sách học sinh cả lớp nhanh chóng bằng tệp CSV. Hãy điền danh sách theo tệp mẫu bên dưới để đảm bảo cấu trúc dữ liệu chính xác.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 text-slate-700 hover:text-emerald-800 rounded-lg text-[10px] font-bold shadow-3xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    Tải tệp mẫu (.csv)
                  </button>
                </div>

                {/* Upload Input Area */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Chọn tệp danh sách học sinh</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-between px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-600 cursor-pointer hover:border-slate-400">
                      <span className="truncate">{importFileName || 'Chưa chọn tệp...'}</span>
                      <Upload className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {importError && (
                    <p className="text-[10px] text-rose-600 font-medium leading-relaxed">{importError}</p>
                  )}
                </div>

                {/* Preview Status */}
                {parsedStudentsCount > 0 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold">Đọc dữ liệu thành công!</p>
                      <p>Tìm thấy **{parsedStudentsCount} học sinh** sẵn sàng nhập lớp.</p>
                    </div>
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
