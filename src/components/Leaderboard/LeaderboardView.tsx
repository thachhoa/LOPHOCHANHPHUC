import React from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Star,
  Award,
  Sparkles,
  TrendingUp,
  Heart,
} from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';
import { exportLeaderboardPptx } from '../../utils/PresentationExporter';

export const LeaderboardView: React.FC = () => {
  const { currentStudents, setSelectedStudent, activeClass, setQuickPointTargetStudent, setIsQuickPointModalOpen } = useClassroom();

  // Sort by stars descending
  const sortedStudents = [...currentStudents].sort((a, b) => b.stars - a.stars);

  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];
  const rest = sortedStudents.slice(3);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold shadow-2xs">
          <Crown className="w-4 h-4 text-amber-600" />
          Bảng Vinh Danh Ngôi Sao Sáng
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          Bảng Xếp Hạng Lớp {activeClass.name}
        </h2>
        <p className="text-xs text-slate-500">
          Khen thưởng và tôn vinh những nỗ lực, thành tích học tập và rèn luyện đạo đức xuất sắc
        </p>
        <div className="pt-3 flex justify-center">
          <button
            onClick={() => exportLeaderboardPptx(activeClass, currentStudents)}
            className="px-4 py-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs shadow-amber-500/20"
          >
            📊 Xuất Slide Vinh Danh (.pptx)
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      {sortedStudents.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto items-end pt-10 pb-4">
          {/* Top 2 - Silver */}
          {top2 && (
            <div
              onClick={() => setSelectedStudent(top2)}
              className="flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="relative mb-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-slate-300 shadow-md group-hover:scale-105 transition-transform bg-white">
                  <img src={top2.avatar} alt={top2.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-extrabold text-xs flex items-center justify-center shadow-xs border border-white">
                  2
                </span>
              </div>

              <h4 className="font-bold text-xs sm:text-sm text-slate-800 mt-2 line-clamp-1">{top2.name}</h4>
              <div className="flex items-center gap-1 font-bold text-amber-900 text-xs mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{top2.stars} sao</span>
              </div>

              <div className="w-full h-24 sm:h-28 bg-linear-to-t from-slate-200 to-slate-100 rounded-t-2xl mt-3 flex items-center justify-center text-slate-400 font-bold text-lg shadow-inner">
                🥈 Hạng 2
              </div>
            </div>
          )}

          {/* Top 1 - Gold Champion */}
          {top1 && (
            <div
              onClick={() => setSelectedStudent(top1)}
              className="flex flex-col items-center text-center cursor-pointer group -translate-y-4"
            >
              <div className="relative mb-2">
                <Crown className="w-8 h-8 text-amber-500 absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce" />
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-amber-400 shadow-xl ring-4 ring-amber-100 group-hover:scale-105 transition-transform bg-white">
                  <img src={top1.avatar} alt={top1.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-extrabold text-sm flex items-center justify-center shadow-md border-2 border-white">
                  1
                </span>
              </div>

              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mt-2 line-clamp-1">{top1.name}</h4>
              <div className="flex items-center gap-1 font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full text-xs mt-1 border border-amber-300">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{top1.stars} sao</span>
              </div>

              <div className="w-full h-32 sm:h-36 bg-linear-to-t from-amber-400 via-yellow-300 to-amber-200 rounded-t-2xl mt-3 flex items-center justify-center text-amber-950 font-extrabold text-xl shadow-lg border-t-2 border-amber-200">
                👑 Quán Quân
              </div>
            </div>
          )}

          {/* Top 3 - Bronze */}
          {top3 && (
            <div
              onClick={() => setSelectedStudent(top3)}
              className="flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="relative mb-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-amber-700 shadow-md group-hover:scale-105 transition-transform bg-white">
                  <img src={top3.avatar} alt={top3.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center shadow-xs border border-white">
                  3
                </span>
              </div>

              <h4 className="font-bold text-xs sm:text-sm text-slate-800 mt-2 line-clamp-1">{top3.name}</h4>
              <div className="flex items-center gap-1 font-bold text-amber-900 text-xs mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{top3.stars} sao</span>
              </div>

              <div className="w-full h-18 sm:h-20 bg-linear-to-t from-amber-200 to-amber-100 rounded-t-2xl mt-3 flex items-center justify-center text-amber-800 font-bold text-base shadow-inner">
                🥉 Hạng 3
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden max-w-4xl mx-auto">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-600 uppercase tracking-wider flex items-center justify-between">
          <span>Xếp hạng toàn thể học sinh ({sortedStudents.length})</span>
          <span className="text-slate-400">Sao tích luỹ</span>
        </div>

        <div className="divide-y divide-slate-100">
          {sortedStudents.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => setSelectedStudent(s)}
              className="p-4 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                    idx === 0
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-800'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {idx + 1}
                </span>

                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0">
                  <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{s.name}</h4>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span>{s.studentCode}</span>
                    {s.badges[0] && (
                      <span className="text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-medium">
                        {s.badges[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{s.stars} sao</span>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    setQuickPointTargetStudent(s);
                    setIsQuickPointModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-lg text-xs font-bold transition-colors"
                >
                  + Thưởng
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
