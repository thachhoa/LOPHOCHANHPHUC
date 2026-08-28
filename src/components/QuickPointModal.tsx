import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Sparkles, ThumbsUp, ThumbsDown, Plus, Minus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useClassroom } from '../context/ClassroomContext';

export const QuickPointModal: React.FC = () => {
  const {
    isQuickPointModalOpen,
    setIsQuickPointModalOpen,
    quickPointTargetStudent,
    setQuickPointTargetStudent,
    awardPoints,
    currentStudents,
  } = useClassroom();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    quickPointTargetStudent?.id || (currentStudents[0]?.id || '')
  );
  const [customPoints, setCustomPoints] = useState<number>(5);
  const [customReason, setCustomReason] = useState<string>('');
  const [activePresetType, setActivePresetType] = useState<'positive' | 'negative'>('positive');

  React.useEffect(() => {
    if (quickPointTargetStudent) {
      setSelectedStudentId(quickPointTargetStudent.id);
    } else if (currentStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(currentStudents[0].id);
    }
  }, [quickPointTargetStudent, currentStudents]);

  if (!isQuickPointModalOpen) return null;

  const targetStudent = currentStudents.find(s => s.id === selectedStudentId);

  const POSITIVE_PRESETS = [
    { label: 'Phát biểu hăng hái', points: 5, icon: '🙋‍♂️' },
    { label: 'Làm bài tập xuất sắc', points: 10, icon: '📝' },
    { label: 'Đạt điểm 10 kiểm tra', points: 15, icon: '💯' },
    { label: 'Giúp đỡ bạn bè', points: 5, icon: '🤝' },
    { label: 'Trực nhật sạch sẽ gọn gàng', points: 5, icon: '🧹' },
    { label: 'Đọc bài diễn cảm / Hát hay', points: 5, icon: '🎵' },
    { label: 'Trung thực & Lễ phép', points: 10, icon: '⭐' },
    { label: 'Tiến bộ vượt bậc', points: 10, icon: '🚀' },
  ];

  const NEGATIVE_PRESETS = [
    { label: 'Nói chuyện riêng trong giờ', points: -5, icon: '🤫' },
    { label: 'Quên mang sách vở / Đồ dùng', points: -5, icon: '🎒' },
    { label: 'Chưa hoàn thành bài tập về nhà', points: -5, icon: '⚠️' },
    { label: 'Mất trật tự khi xếp hàng', points: -3, icon: '🛑' },
  ];

  const handleApplyPreset = (reason: string, pts: number) => {
    if (!selectedStudentId) return;

    if (pts > 0) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
      });
    }

    awardPoints(selectedStudentId, pts, reason);
    setIsQuickPointModalOpen(false);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !customReason.trim()) return;

    const finalPoints = activePresetType === 'positive' ? Math.abs(customPoints) : -Math.abs(customPoints);

    if (finalPoints > 0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    awardPoints(selectedStudentId, finalPoints, customReason.trim());
    setIsQuickPointModalOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-amber-50 via-yellow-50 to-orange-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold shadow-xs">
                <Star className="w-5 h-5 fill-amber-950" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Thưởng / Nhắc Nhở Sao</h3>
                <p className="text-xs text-slate-500">Tích lũy sao đổi quà khuyến khích học tập</p>
              </div>
            </div>
            <button
              id="btn-close-quick-point"
              onClick={() => setIsQuickPointModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Student Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Chọn học sinh nhận sao:
              </label>
              <select
                id="select-quick-point-student"
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              >
                {currentStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentCode}) - Hiện có {s.stars} ⭐
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Mode Toggle */}
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                id="tab-positive-points"
                onClick={() => setActivePresetType('positive')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activePresetType === 'positive'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Khen thưởng (+Sao)
              </button>
              <button
                type="button"
                id="tab-negative-points"
                onClick={() => setActivePresetType('negative')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activePresetType === 'negative'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                Nhắc nhở (-Sao)
              </button>
            </div>

            {/* Presets List */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">
                Chọn nhanh lý do {activePresetType === 'positive' ? 'khen ngợi' : 'nhắc nhở'}:
              </label>

              <div className="grid grid-cols-2 gap-2">
                {activePresetType === 'positive'
                  ? POSITIVE_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleApplyPreset(p.label, p.points)}
                        className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/70 hover:border-emerald-300 text-left transition-all flex items-start gap-2 group"
                      >
                        <span className="text-lg">{p.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 leading-tight group-hover:text-emerald-900">
                            {p.label}
                          </p>
                          <span className="text-[11px] font-bold text-emerald-600">+{p.points} sao</span>
                        </div>
                      </button>
                    ))
                  : NEGATIVE_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleApplyPreset(p.label, p.points)}
                        className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-100/70 hover:border-rose-300 text-left transition-all flex items-start gap-2 group"
                      >
                        <span className="text-lg">{p.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 leading-tight group-hover:text-rose-900">
                            {p.label}
                          </p>
                          <span className="text-[11px] font-bold text-rose-600">{p.points} sao</span>
                        </div>
                      </button>
                    ))}
              </div>
            </div>

            {/* Custom Input */}
            <form onSubmit={handleApplyCustom} className="pt-3 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-semibold text-slate-500">Hoặc nhập lý do tuỳ chỉnh:</label>
              <div className="flex gap-2">
                <input
                  id="input-custom-point-reason"
                  type="text"
                  placeholder="Lý do cụ thể..."
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
                <input
                  id="input-custom-point-amount"
                  type="number"
                  min="1"
                  max="100"
                  value={customPoints}
                  onChange={e => setCustomPoints(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-2 border border-slate-300 rounded-xl text-xs text-center font-bold"
                />
                <button
                  id="btn-apply-custom-point"
                  type="submit"
                  disabled={!customReason.trim()}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 ${
                    activePresetType === 'positive'
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  Ghi nhận
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
