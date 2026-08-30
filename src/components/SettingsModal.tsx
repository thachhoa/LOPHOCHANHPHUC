import React, { useRef, useState } from 'react';
import { Settings, Download, Upload, Key, X, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    exportBackupData,
    importBackupData,
    aiApiKey,
    setAiApiKey,
    activeModel,
    setActiveModel,
    activeClass,
    updateClass,
  } = useClassroom();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localApiKey, setLocalApiKey] = useState(aiApiKey);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [isSaved, setIsSaved] = useState(false);

  const classLogoInputRef = useRef<HTMLInputElement>(null);
  const teacherAvatarInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'teacherAvatar') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateClass({
        ...activeClass,
        [field]: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setAiApiKey(localApiKey.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupData(content);
      if (res.success) {
        setImportStatus({
          type: 'success',
          message: res.message,
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setImportStatus({
          type: 'error',
          message: res.message,
        });
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 shrink-0">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-600" />
            Cài Đặt Hệ Thống
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 cursor-pointer shadow-3xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-6">
          {/* Section 0: Thông tin lớp học & Giáo viên */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
              Thông tin lớp học & Giáo viên
            </h4>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-4">
              {/* Tên lớp & Mã lớp & Năm học */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tên lớp học:</label>
                  <input
                    type="text"
                    value={activeClass.name}
                    onChange={(e) => updateClass({ ...activeClass, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Mã lớp (Tùy chọn):</label>
                  <input
                    type="text"
                    value={activeClass.code || ''}
                    onChange={(e) => updateClass({ ...activeClass, code: e.target.value })}
                    placeholder="Ví dụ: HP-2025"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Năm học:</label>
                  <input
                    type="text"
                    value={activeClass.academicYear}
                    onChange={(e) => updateClass({ ...activeClass, academicYear: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Tên giáo viên & Phòng học */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Giáo viên chủ nhiệm:</label>
                  <input
                    type="text"
                    value={activeClass.teacherName}
                    onChange={(e) => updateClass({ ...activeClass, teacherName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Phòng học:</label>
                  <input
                    type="text"
                    value={activeClass.roomName}
                    onChange={(e) => updateClass({ ...activeClass, roomName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Tải ảnh Logo lớp học & Avatar Giáo viên */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                {/* Logo lớp */}
                <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Logo Lớp Học</span>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-slate-100 flex items-center justify-center overflow-hidden mb-2 relative group">
                    {activeClass.avatar ? (
                      <img src={activeClass.avatar} alt="Logo Lớp" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 uppercase">{activeClass.name.substring(0, 2)}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => classLogoInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[9px] font-bold cursor-pointer transition-colors"
                  >
                    Chọn logo
                  </button>
                  <input
                    type="file"
                    ref={classLogoInputRef}
                    onChange={(e) => handleLogoChange(e, 'avatar')}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Avatar Giáo viên */}
                <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Ảnh Giáo Viên</span>
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-slate-100 flex items-center justify-center overflow-hidden mb-2 relative group">
                    {activeClass.teacherAvatar ? (
                      <img src={activeClass.teacherAvatar} alt="GVCN" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-blue-600 uppercase">{activeClass.teacherName.substring(0, 2)}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => teacherAvatarInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[9px] font-bold cursor-pointer transition-colors"
                  >
                    Chọn ảnh
                  </button>
                  <input
                    type="file"
                    ref={teacherAvatarInputRef}
                    onChange={(e) => handleLogoChange(e, 'teacherAvatar')}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Sao lưu & Khôi phục */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
              Dữ liệu lớp học (Offline LocalStorage)
            </h4>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Dữ liệu hiện được lưu trữ trực tiếp trên trình duyệt của bạn. Hãy sao lưu thường xuyên để tránh mất mát khi dọn dẹp bộ nhớ cache.
              </p>
              
              <div className="grid grid-cols-2 gap-3.5">
                {/* Export Button */}
                <button
                  onClick={exportBackupData}
                  className="px-3.5 py-2.5 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  Sao lưu (.json)
                </button>

                {/* Import Button */}
                <button
                  onClick={triggerFileInput}
                  className="px-3.5 py-2.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 text-slate-700 hover:text-blue-800 rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  Khôi phục
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
              </div>

              {/* Status Message */}
              {importStatus.type && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    importStatus.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {importStatus.type === 'success' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: AI Settings */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
              Trí tuệ nhân tạo (AI Assistant)
            </h4>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-4">
              {/* Model Selection Cards */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 block">Chọn Model AI sử dụng:</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Default)', desc: 'Nhanh nhẹn, tối ưu cho các tác vụ nhận xét nhanh.' },
                    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', desc: 'Thông minh vượt trội, lập luận sư phạm sâu sắc.' },
                    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Tốc độ cao, độ trễ thấp, phản hồi tức thì.' }
                  ].map(m => {
                    const isSelected = activeModel === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setActiveModel(m.id)}
                        className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-emerald-800' : 'text-slate-700'}`}>
                            {m.name}
                          </span>
                          {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{m.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* API Key Form */}
              <form onSubmit={handleSaveApiKey} className="space-y-3 pt-2 border-t border-slate-200/50">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-500" />
                    Gemini API Key:
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="text-[10px] leading-normal space-y-1 text-slate-500">
                    <p>
                      👉 Chưa có API key? Nhấp vào <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold underline hover:text-emerald-700">Google AI Studio</a> để lấy key hoàn toàn miễn phí!
                    </p>
                    <p className="text-slate-400">
                      Nếu không nhập key, hệ thống sẽ tự động sử dụng kịch bản sư phạm offline giả lập (Mock AI).
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    }`}
                  >
                    {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
                    {isSaved ? 'Đã lưu cấu hình' : 'Lưu API Key'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-6 pt-0 border-t border-slate-100 text-[10px] text-slate-400 text-center shrink-0">
          <div className="pt-4">
            Ứng dụng Lớp Học Hạnh Phúc v2.5. Hỗ trợ sư phạm thời đại số.
          </div>
        </div>
      </div>
    </div>
  );
};
