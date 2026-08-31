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

  const [activeEffect, setActiveEffect] = useState<'spin' | 'bounce' | 'zoom' | 'orbit' | 'rain' | 'pulse' | 'wave'>('spin');
  const [settingTab, setSettingTab] = useState<'effect' | 'manual' | 'favorite'>('effect');

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

    // Tự động đổi hiệu ứng ngẫu nhiên nếu chọn tab Tự động đổi
    if (settingTab === 'effect') {
      const effects: Array<'spin' | 'bounce' | 'zoom' | 'orbit' | 'rain' | 'pulse' | 'wave'> = [
        'spin', 'bounce', 'zoom', 'orbit', 'rain', 'pulse', 'wave'
      ];
      const otherEffects = effects.filter(e => e !== activeEffect);
      const randomEffect = otherEffects[Math.floor(Math.random() * otherEffects.length)];
      setActiveEffect(randomEffect);
    }

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
        particleCount: 120,
        spread: 100,
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
        {/* Dynamic Keyframes Styling */}
        <style>{`
          @keyframes wheelBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          @keyframes wheelZoom {
            0%, 100% { scale: 1; }
            50% { scale: 1.08; }
          }
          @keyframes wheelOrbit {
            0%, 100% { translate: 0px 0px; }
            25% { translate: 10px -8px; }
            50% { translate: 0px -12px; }
            75% { translate: -10px -8px; }
          }
          @keyframes wheelRain {
            0%, 100% { transform: translateY(0) rotate(2deg); }
            50% { transform: translateY(6px) rotate(-2deg); }
          }
          @keyframes wheelPulse {
            0%, 100% { box-shadow: 0 20px 25px -5px rgba(167, 139, 250, 0.4), 0 0 0 0px rgba(167, 139, 250, 0.3); }
            50% { box-shadow: 0 20px 25px -5px rgba(244, 114, 182, 0.6), 0 0 0 15px rgba(244, 114, 182, 0); }
          }
          @keyframes wheelWave {
            0%, 100% { transform: skewX(0deg) skewY(0deg); }
            50% { transform: skewX(2.5deg) skewY(1.5deg); }
          }
        `}</style>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-purple-50 via-pink-50 to-amber-50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
              <div>
                <h3 className="font-bold text-slate-800 text-base">Vòng Quay Gọi Tên May Mắn</h3>
                <p className="text-xs text-slate-500">Khơi dậy không khí lớp học sôi nổi và hứng khởi</p>
              </div>
            </div>
            <button
              id="btn-close-lucky-wheel"
              onClick={() => setIsLuckyWheelOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Cột Trái (lg:col-span-3) - Vòng quay & Winner Overlay */}
            <div className="lg:col-span-3 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl p-4 border border-slate-200/50 relative overflow-hidden min-h-[400px]">
              
              {/* Mũi tên chỉ vị trí */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-500 drop-shadow-md" />

              {/* Container quay của Vòng quay */}
              <div
                style={{
                  transform: `rotate(${spinAngle}deg)`,
                  transition: isSpinning ? 'transform 3.8s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
                  animation: isSpinning ? (
                    activeEffect === 'bounce' ? 'wheelBounce 0.4s infinite ease-in-out' :
                    activeEffect === 'zoom' ? 'wheelZoom 0.5s infinite ease-in-out' :
                    activeEffect === 'orbit' ? 'wheelOrbit 0.6s infinite linear' :
                    activeEffect === 'rain' ? 'wheelRain 0.4s infinite ease-in-out' :
                    activeEffect === 'pulse' ? 'wheelPulse 0.5s infinite ease-in-out' :
                    activeEffect === 'wave' ? 'wheelWave 0.5s infinite ease-in-out' : 'none'
                  ) : 'none',
                }}
                className="w-80 h-80 rounded-full shadow-2xl flex items-center justify-center relative bg-white border border-slate-100"
              >
                <canvas ref={canvasRef} width={320} height={320} className="rounded-full" />

                {/* Avatar học sinh chạy dọc chu vi viền ngoài vòng quay */}
                {candidatesList.map((std, i) => {
                  const angle = (i * 360) / candidatesList.length;
                  const radius = 130; // Khoảng cách từ tâm
                  const rad = (angle * Math.PI) / 180;
                  const x = 160 + radius * Math.cos(rad) - 18; // Offset nửa chiều rộng avatar (36px)
                  const y = 160 + radius * Math.sin(rad) - 18;
                  
                  return (
                    <div
                      key={std.id}
                      className="absolute w-9 h-9 rounded-full border-2 border-white shadow-xs overflow-hidden bg-white shrink-0 flex items-center justify-center pointer-events-none z-10"
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        transform: `rotate(${angle + 90}deg)`,
                      }}
                    >
                      {std.avatar ? (
                        <img src={std.avatar} alt={std.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{std.name.substring(0, 2)}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Nút quay tròn giữa vòng quay (Tâm trục) */}
              <button
                disabled={isSpinning || candidatesList.length === 0}
                onClick={startSpin}
                className="absolute z-20 w-16 h-16 rounded-full bg-slate-900 text-white font-bold text-xs shadow-lg hover:scale-105 transition-transform flex items-center justify-center cursor-pointer border-4 border-white disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isSpinning ? 'QUAY...' : 'QUAY'}
              </button>

              {/* Winner Announcement Overlay TO VÀ NỔI BẬT GIỮA MÀN HÌNH QUAY */}
              {winner && !isSpinning && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-4 bg-white/95 backdrop-blur-md rounded-2xl z-30 flex flex-col items-center justify-center p-6 border-4 border-amber-300 shadow-2xl space-y-4"
                >
                  <div className="text-center">
                    <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                      🎉 CHÚC MỪNG CHIẾN THẮNG 🎉
                    </span>
                  </div>

                  {/* Avatar bự */}
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-400 shadow-lg shrink-0 relative group animate-bounce">
                    <img
                      src={winner.avatar}
                      alt={winner.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-amber-500/10 animate-ping rounded-full pointer-events-none" />
                  </div>

                  {/* TÊN HỌC SINH CỰC TO NỔI BẬT */}
                  <div className="text-center space-y-0.5">
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-linear-to-r from-purple-600 via-pink-600 to-amber-500 uppercase tracking-wide">
                      {winner.name}
                    </h2>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Mã số: {winner.studentCode}
                    </span>
                  </div>

                  {/* Star Award / Quiz Panel */}
                  <div className="w-full max-w-sm bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow-3xs space-y-3">
                    {!isQuizMode ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          id="btn-winner-award-star"
                          onClick={() => {
                            awardPoints(winner.id, 5, 'Nhận thưởng may mắn từ Vòng quay');
                            setWinner(null);
                          }}
                          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer flex-1 justify-center"
                        >
                          <Star className="w-4 h-4 fill-white" />
                          +5 Sao Thưởng
                        </button>
                        <button
                          onClick={() => {
                            setIsLuckyWheelOpen(false);
                            setSelectedStudent(winner);
                          }}
                          className="px-3 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex-1"
                        >
                          Xem Hồ Sơ
                        </button>
                      </div>
                    ) : (
                      // Quiz panel
                      activeQuestion && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">❓ CÂU HỎI THỬ THÁCH:</span>
                            <p className="text-xs font-bold text-slate-800 leading-snug">{activeQuestion.text}</p>
                          </div>

                          {showAnswer ? (
                            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-800 leading-normal font-bold">
                              🔑 Đáp án: {activeQuestion.answer}
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowAnswer(true)}
                              className="text-xs text-purple-600 font-bold hover:underline block cursor-pointer"
                            >
                              Hiện đáp án gợi ý
                            </button>
                          )}

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                            <button
                              onClick={() => {
                                awardPoints(winner.id, 5, `Trả lời đúng câu đố: ${activeQuestion.text}`);
                                setWinner(null);
                                setActiveQuestion(null);
                              }}
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex-1"
                            >
                              Đúng (+5 Sao)
                            </button>
                            <button
                              onClick={() => {
                                setWinner(null);
                                setActiveQuestion(null);
                              }}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1"
                            >
                              Chưa đúng
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* Nút đóng Overlay Winner */}
                  <button
                    onClick={() => setWinner(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                  >
                    Quay lượt mới ✕
                  </button>
                </motion.div>
              )}
            </div>

            {/* Cột Phải (lg:col-span-2) - Cài đặt & Hiệu ứng */}
            <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
              
              {/* Tabs Cấu hình */}
              <div className="space-y-3">
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold w-full">
                  <button
                    type="button"
                    onClick={() => setSettingTab('effect')}
                    className={`flex-1 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                      settingTab === 'effect' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⚙️ Dạng Quay
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingTab('manual')}
                    className={`flex-1 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                      settingTab === 'manual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🎯 Chọn Lọc
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingTab('favorite')}
                    className={`flex-1 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                      settingTab === 'favorite' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ❤️ Nhóm
                  </button>
                </div>

                {/* Tab content 1: Dạng Quay / Bộ sưu tập hiệu ứng */}
                {settingTab === 'effect' && (
                  <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-200/60">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        ✨ Lồng Cầu Hiệu Ứng
                      </span>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Mỗi lượt quay sẽ chạy một hiệu ứng vật lý ngẫu nhiên. Tránh lặp lại kiểu xoay vừa thực hiện.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/50 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 block">Chọn hiệu ứng thủ công:</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'spin', label: 'Xoáy tròn ✨' },
                          { id: 'bounce', label: 'Tung nảy' },
                          { id: 'zoom', label: 'Hút vào tâm' },
                          { id: 'orbit', label: 'Bay theo quỹ đạo' },
                          { id: 'rain', label: 'Mưa bóng' },
                          { id: 'pulse', label: 'Sân khấu ánh sáng' },
                          { id: 'wave', label: 'Sóng bồng bềnh' },
                        ].map(eff => (
                          <button
                            key={eff.id}
                            type="button"
                            onClick={() => {
                              setActiveEffect(eff.id as any);
                              // Play preview sound
                              soundManager.playWheelTick();
                            }}
                            className={`px-3 py-2 rounded-xl text-[11px] font-bold text-left border transition-all cursor-pointer ${
                              activeEffect === eff.id
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {eff.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab content 2: Chọn lọc / Chế độ đố vui */}
                {settingTab === 'manual' && (
                  <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-200/60 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">Chế độ trò chơi:</span>
                    <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={isQuizMode}
                        onChange={(e) => {
                          setIsQuizMode(e.target.checked);
                          setWinner(null);
                          setActiveQuestion(null);
                        }}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded border-slate-300"
                      />
                      <span>💡 Bật chế độ đố vui khi gọi tên</span>
                    </label>
                  </div>
                )}

                {/* Tab content 3: Nhóm */}
                {settingTab === 'favorite' && (
                  <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-200/60 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">Chọn nhanh theo giới tính:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedCandidates(currentStudents.filter(s => s.gender === 'male').map(s => s.id))}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                      >
                        👦 Học Sinh Nam
                      </button>
                      <button
                        onClick={() => setSelectedCandidates(currentStudents.filter(s => s.gender === 'female').map(s => s.id))}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                      >
                        👧 Học Sinh Nữ
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Candidate Checklist Filters */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-bold text-slate-600">
                    Danh sách tham gia ({candidatesList.length}/{currentStudents.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCandidates.length === currentStudents.length) {
                        setSelectedCandidates([currentStudents[0]?.id || '']);
                      } else {
                        setSelectedCandidates(currentStudents.map(s => s.id));
                      }
                    }}
                    className="text-purple-600 font-bold hover:underline text-[11px] cursor-pointer"
                  >
                    {selectedCandidates.length === currentStudents.length ? 'Bỏ chọn hết' : 'Chọn tất cả'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                  {currentStudents.map(s => {
                    const isSelected = selectedCandidates.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleCandidate(s.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-white text-slate-400 border border-slate-200 line-through'
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nút QUAY NGAY dưới chân cột Cài đặt */}
              <button
                onClick={startSpin}
                disabled={isSpinning || candidatesList.length === 0}
                className="w-full py-3.5 bg-linear-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                {isSpinning ? 'ĐANG QUAY LỒNG...' : 'QUAY PHÁT SÁNG!'}
              </button>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
