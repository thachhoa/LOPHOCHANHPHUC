import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, RotateCcw, Award, Star, Sparkles, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useClassroom } from '../context/ClassroomContext';
import { soundManager } from '../utils/audio';
import { Student } from '../types';

const MOCK_QUESTIONS = [
  { text: 'Có 3 quả táo trên bàn, bạn lấy đi 2 quả. Hỏi bạn còn mấy quả táo?', answer: 'Bạn còn 2 quả táo (vì đó là 2 quả bạn đã lấy đi).' },
  { text: 'Từ gì mà 100% người Việt Nam đều phát âm sai?', answer: 'Từ "Sai".' },
  { text: 'Cái gì có cổ nhưng không có đầu?', answer: 'Cái áo.' },
  { text: 'Tháng nào trong năm có 28 ngày?', answer: 'Tất cả các tháng đều có ít nhất 28 ngày.' },
  { text: 'Cái gì càng lau càng bẩn?', answer: 'Cái giẻ lau.' },
  { text: 'Cái gì chỉ tăng lên mà không bao giờ giảm đi?', answer: 'Tuổi tác.' },
  { text: 'Con gì chân ngắn mà lại có cánh bay rất cao?', answer: 'Con chim bồ câu (hoặc chim sẻ).' }
];

export const LuckyWheelModal: React.FC = () => {
  const {
    isLuckyWheelOpen,
    setIsLuckyWheelOpen,
    currentStudents,
    awardPoints,
    setSelectedStudent,
  } = useClassroom();

  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Student | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [spinAngle, setSpinAngle] = useState(0);

  const [isQuizMode, setIsQuizMode] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<{ text: string; answer: string } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isLuckyWheelOpen) {
      setSelectedCandidates(currentStudents.map(s => s.id));
      setWinner(null);
    }
  }, [isLuckyWheelOpen, currentStudents]);

  const candidatesList = currentStudents.filter(s => selectedCandidates.includes(s.id));

  // Draw the lucky wheel on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    ctx.clearRect(0, 0, width, height);

    const numSegments = candidatesList.length;
    if (numSegments === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Chọn ít nhất 1 học sinh', centerX, centerY);
      return;
    }

    const anglePerSegment = (Math.PI * 2) / numSegments;
    const COLORS = [
      '#F43F5E', '#FB923C', '#FBBF24', '#34D399', '#38BDF8',
      '#818CF8', '#A78BFA', '#F472B6', '#10B981', '#06B6D4',
      '#EAB308', '#6366F1', '#EC4899', '#14B8A6', '#8B5CF6',
    ];

    candidatesList.forEach((std, i) => {
      const startAngle = i * anglePerSegment;
      const endAngle = startAngle + anglePerSegment;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 3;

      // Truncate name if too long
      const displayName = std.name.length > 14 ? std.name.substring(0, 12) + '...' : std.name;
      ctx.fillText(displayName, radius - 20, 4);
      ctx.restore();
    });

    // Center circle pin
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
  }, [candidatesList]);

  if (!isLuckyWheelOpen) return null;

  const startSpin = () => {
    if (isSpinning || candidatesList.length === 0) return;

    setIsSpinning(true);
    setWinner(null);
    setActiveQuestion(null);
    setShowAnswer(false);

    const randomIndex = Math.floor(Math.random() * candidatesList.length);
    const chosenStudent = candidatesList[randomIndex];

    const numSegments = candidatesList.length;
    const segmentAngleDeg = 360 / numSegments;
    // Arrow is at top (270 deg / -90 deg). We align segment center to arrow
    const targetOffset = 360 - (randomIndex * segmentAngleDeg + segmentAngleDeg / 2);
    const totalRounds = 5 + Math.floor(Math.random() * 3); // 5 to 7 full spins
    const finalAngle = spinAngle + totalRounds * 360 + targetOffset - (spinAngle % 360);

    setSpinAngle(finalAngle);

    // Sound effect ticks during spin
    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;
      soundManager.playWheelTick();
      if (tickCount >= 25) clearInterval(interval);
    }, 120);

    setTimeout(() => {
      setIsSpinning(false);
      setWinner(chosenStudent);
      if (isQuizMode) {
        const randQ = MOCK_QUESTIONS[Math.floor(Math.random() * MOCK_QUESTIONS.length)];
        setActiveQuestion(randQ);
      }
      soundManager.playSuccessFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }, 3800);
  };

  const toggleCandidate = (id: string) => {
    if (selectedCandidates.includes(id)) {
      if (selectedCandidates.length > 1) {
        setSelectedCandidates(prev => prev.filter(c => c !== id));
      }
    } else {
      setSelectedCandidates(prev => [...prev, id]);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-purple-50 via-pink-50 to-amber-50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-bold text-slate-800 text-base">Vòng Quay Gọi Tên May Mắn</h3>
                <p className="text-xs text-slate-500">Khơi dậy không khí lớp học sôi nổi</p>
              </div>
            </div>
            <button
              id="btn-close-lucky-wheel"
              onClick={() => setIsLuckyWheelOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center">
            {/* Wheel Canvas & Indicator */}
            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Pointer Indicator at Top */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-500 drop-shadow-md" />

              <div
                style={{
                  transform: `rotate(${spinAngle}deg)`,
                  transition: isSpinning ? 'transform 3.8s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
                }}
                className="w-full h-full rounded-full shadow-xl flex items-center justify-center"
              >
                <canvas ref={canvasRef} width={320} height={320} className="rounded-full" />
              </div>
            </div>

            {/* Spin Action Button & Quiz mode Toggle */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <button
                id="btn-trigger-spin-wheel"
                onClick={startSpin}
                disabled={isSpinning || candidatesList.length === 0}
                className="px-8 py-3.5 bg-linear-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white font-bold text-base rounded-2xl shadow-lg shadow-purple-500/30 flex items-center gap-2 transform active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                {isSpinning ? 'Đang quay...' : 'QUAY NGAY!'}
              </button>
              
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer mt-1 select-none">
                <input
                  type="checkbox"
                  checked={isQuizMode}
                  onChange={(e) => {
                    setIsQuizMode(e.target.checked);
                    setWinner(null);
                    setActiveQuestion(null);
                  }}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                />
                💡 Bật chế độ đố vui trả lời câu hỏi lấy sao
              </label>
            </div>

            {/* Winner Announcement Card */}
            {winner && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-6 p-4 rounded-2xl bg-linear-to-r from-amber-100 via-yellow-50 to-orange-100 border-2 border-amber-300 w-full flex flex-col gap-4 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-sm shrink-0">
                      <img
                        src={winner.avatar}
                        alt={winner.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block">
                        🎉 Chúc mừng bạn:
                      </span>
                      <h4 className="text-sm font-bold text-slate-800">{winner.name}</h4>
                      <span className="text-[10px] text-slate-500">{winner.studentCode}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isQuizMode && (
                      <button
                        id="btn-winner-award-star"
                        onClick={() => {
                          awardPoints(winner.id, 5, 'Nhận thưởng may mắn từ Vòng quay');
                          setWinner(null);
                        }}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Star className="w-4 h-4 fill-white" />
                        +5 Sao
                      </button>
                    )}
                    <button
                      id="btn-winner-view-profile"
                      onClick={() => {
                        setIsLuckyWheelOpen(false);
                        setSelectedStudent(winner);
                      }}
                      className="px-3 py-2 bg-white border border-amber-300 text-amber-900 text-xs font-medium rounded-xl hover:bg-amber-50 transition-colors cursor-pointer"
                    >
                      Xem hồ sơ
                    </button>
                  </div>
                </div>

                {/* Quiz panel within winner card */}
                {isQuizMode && activeQuestion && (
                  <div className="bg-white/80 rounded-xl p-3.5 border border-amber-200 space-y-3.5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider">❓ CÂU HỎI THỬ THÁCH:</span>
                      <p className="text-xs font-bold text-slate-800">{activeQuestion.text}</p>
                    </div>

                    {showAnswer ? (
                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 leading-normal font-medium">
                        🔑 Đáp án: {activeQuestion.answer}
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="text-xs text-purple-600 font-bold hover:underline block cursor-pointer"
                      >
                        Hiện đáp án
                      </button>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          awardPoints(winner.id, 5, `Trả lời đúng câu đố: ${activeQuestion.text}`);
                          setWinner(null);
                          setActiveQuestion(null);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex-1"
                      >
                        Đúng (+5 Sao)
                      </button>
                      <button
                        onClick={() => {
                          setWinner(null);
                          setActiveQuestion(null);
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer flex-1"
                      >
                        Trả lời chưa đúng
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Candidate Checklist Filters */}
            <div className="mt-6 w-full pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600">
                  Danh sách tham gia ({candidatesList.length}/{currentStudents.length}):
                </span>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedCandidates(currentStudents.map(s => s.id))}
                    className="text-purple-600 font-medium hover:underline"
                  >
                    Chọn tất cả
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                {currentStudents.map(s => {
                  const isSelected = selectedCandidates.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleCandidate(s.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-slate-100 text-slate-400 border border-transparent line-through'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
