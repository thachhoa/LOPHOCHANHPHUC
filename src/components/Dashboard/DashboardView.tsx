import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Award, Sparkles, CheckCircle2, AlertCircle, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';

export const DashboardView: React.FC = () => {
  const { currentStudents, attendanceRecords, pointTransactions, activeClass, awardPoints, updatePointTransaction, deletePointTransaction } = useClassroom();

  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [recordAmount, setRecordAmount] = useState<number>(5);
  const [recordReason, setRecordReason] = useState<string>('');
  const [recordIcon, setRecordIcon] = useState<string>('Star');

  // 1. Calculate General Metrics
  const totalStudents = currentStudents.length;
  
  // Total stars in class
  const totalStars = currentStudents.reduce((sum, s) => sum + s.stars, 0);
  const averageStars = totalStudents > 0 ? Math.round(totalStars / totalStudents) : 0;

  // Most active student (highest stars)
  const sortedByStars = [...currentStudents].sort((a, b) => b.stars - a.stars);
  const topStudent = sortedByStars[0];

  // 2. Attendance Calculations
  // Get attendance data for the last 5 days
  const classAttendanceRecords = attendanceRecords
    .filter((r) => r.classId === activeClass.id)
    .sort((a, b) => b.date.localeCompare(a.date)) // Latest first
    .slice(0, 5)
    .reverse(); // Chronological for chart

  // If no records, create mock/empty state representation
  const chartDays = classAttendanceRecords.map((record) => {
    let present = 0;
    let late = 0;
    let excused = 0;
    let unexcused = 0;

    currentStudents.forEach((student) => {
      const status = record.records[student.id] || 'present';
      if (status === 'present') present++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
      else if (status === 'unexcused') unexcused++;
    });

    const rate = totalStudents > 0 ? Math.round(((present + late) / totalStudents) * 100) : 100;

    return {
      date: record.date.substring(5), // MM-DD
      present,
      late,
      excused,
      unexcused,
      rate,
    };
  });

  // Calculate overall attendance rate
  let totalPresentDays = 0;
  let totalOpportunities = 0;
  attendanceRecords
    .filter((r) => r.classId === activeClass.id)
    .forEach((record) => {
      currentStudents.forEach((student) => {
        const status = record.records[student.id] || 'present';
        if (status === 'present' || status === 'late') {
          totalPresentDays++;
        }
        totalOpportunities++;
      });
    });

  const overallAttendanceRate = totalOpportunities > 0 ? Math.round((totalPresentDays / totalOpportunities) * 100) : 100;

  // 3. Point Distribution Grouping
  let excelCount = 0; // > 30 stars
  let activeCount = 0; // 15-30 stars
  let warmUpCount = 0; // < 15 stars

  currentStudents.forEach((s) => {
    if (s.stars > 30) excelCount++;
    else if (s.stars >= 15) activeCount++;
    else warmUpCount++;
  });

  const excelPercent = totalStudents > 0 ? Math.round((excelCount / totalStudents) * 100) : 0;
  const activePercent = totalStudents > 0 ? Math.round((activeCount / totalStudents) * 100) : 0;
  const warmUpPercent = totalStudents > 0 ? Math.round((warmUpCount / totalStudents) * 100) : 0;

  // 4. Point Transactions Over Time (Last 7 days)
  const last7DaysPoints = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - idx);
    const dateStr = d.toISOString().split('T')[0];
    
    // Sum positive points on this day for students currently in active class
    const dayPoints = pointTransactions
      .filter(
        (t) =>
          t.classId === activeClass.id &&
          t.type === 'positive' &&
          currentStudents.some((s) => s.id === t.studentId || s.name === t.studentName)
      )
      .filter((t) => {
        const txDate = new Date(t.timestamp).toISOString().split('T')[0];
        return txDate === dateStr;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      label: d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' }),
      value: dayPoints,
      rawDate: dateStr,
    };
  }).reverse();

  // Max value for scaling chart
  const maxDayPoints = Math.max(...last7DaysPoints.map((d) => d.value), 10);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          Báo Cáo & Phân Tích Thống Kê
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Trực quan hóa dữ liệu thi đua chuyên cần và điểm sao rèn luyện của cả lớp học
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Attendance Rate */}
        <div className="p-5 bg-white border border-slate-200/70 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Chuyên cần trung bình</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{overallAttendanceRate}%</h3>
            <span className="text-[10px] text-emerald-600 font-medium">Từ trước tới nay</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Average Star */}
        <div className="p-5 bg-white border border-slate-200/70 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Điểm Sao trung bình</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{averageStars} sao</h3>
            <span className="text-[10px] text-slate-500">Mỗi học sinh</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Top Student */}
        <div className="p-5 bg-white border border-slate-200/70 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Dẫn đầu thi đua</span>
            <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1">{topStudent ? topStudent.name : 'Chưa xếp hạng'}</h3>
            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
              ⭐ {topStudent ? topStudent.stars : 0} sao tích luỹ
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Total Record Days */}
        <div className="p-5 bg-white border border-slate-200/70 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tổng số buổi học</span>
            <h3 className="text-2xl font-extrabold text-slate-800">{attendanceRecords.filter(r => r.classId === activeClass.id).length} buổi</h3>
            <span className="text-[10px] text-slate-500">Có ghi nhận điểm danh</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: Main charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Attendance Chart (Vẽ bằng SVG) */}
          <div className="p-5 bg-white border border-slate-200/70 rounded-3xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Biểu Đồ Chuyên Cần 5 Ngày Gần Nhất</h4>
                <p className="text-[10px] text-slate-400">Hiển thị phần trăm học sinh đi học đầy đủ</p>
              </div>
            </div>

            {chartDays.length > 0 ? (
              <div className="w-full">
                {/* SVG Chart area */}
                <svg viewBox="0 0 500 200" className="w-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="40" y1="60" x2="480" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="40" y1="100" x2="480" y2="100" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="40" y1="140" x2="480" y2="140" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="40" y1="160" x2="480" y2="160" stroke="#CBD5E1" strokeWidth="1" />

                  {/* Left Axis Labels */}
                  <text x="30" y="24" fontSize="9" fill="#94A3B8" textAnchor="end">100%</text>
                  <text x="30" y="64" fontSize="9" fill="#94A3B8" textAnchor="end">75%</text>
                  <text x="30" y="104" fontSize="9" fill="#94A3B8" textAnchor="end">50%</text>
                  <text x="30" y="144" fontSize="9" fill="#94A3B8" textAnchor="end">25%</text>

                  {/* Draw Bars */}
                  {chartDays.map((day, idx) => {
                    const step = 440 / (chartDays.length + 1);
                    const x = 40 + (idx + 1) * step - 25;
                    const height = (day.rate / 100) * 140;
                    const y = 160 - height;

                    return (
                      <g key={day.date} className="group">
                        {/* Shadow bar background */}
                        <rect x={x} y="20" width="30" height="140" fill="#F8FAFC" rx="4" />
                        {/* Active bar */}
                        <rect
                          x={x}
                          y={y}
                          width="30"
                          height={height}
                          fill="url(#emerald-gradient)"
                          rx="4"
                          className="transition-all duration-500 hover:opacity-90"
                        />
                        {/* Bar Label (Value) */}
                        <text x={x + 15} y={y - 6} fontSize="10" fontWeight="bold" fill="#047857" textAnchor="middle">
                          {day.rate}%
                        </text>
                        {/* X Axis Label */}
                        <text x={x + 15} y="178" fontSize="10" fill="#64748B" textAnchor="middle">
                          {day.date}
                        </text>
                      </g>
                    );
                  })}

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="emerald-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Chưa có dữ liệu điểm danh nào được ghi nhận cho lớp này.
              </div>
            )}
          </div>

          {/* Point Activity Trend Chart (Vẽ bằng SVG) */}
          <div className="p-5 bg-white border border-slate-200/70 rounded-3xl shadow-2xs space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Xu Hướng Khen Thưởng (Sao Vàng 7 Ngày Qua)</h4>
              <p className="text-[10px] text-slate-400">Tổng điểm sao tích cực được tặng theo ngày</p>
            </div>

            <div className="w-full">
              <svg viewBox="0 0 500 180" className="w-full overflow-visible">
                {/* Horizontal lines */}
                <line x1="30" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="30" y1="80" x2="480" y2="80" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="30" y1="140" x2="480" y2="140" stroke="#CBD5E1" strokeWidth="1" />

                {/* Y Axis Max Label */}
                <text x="22" y="24" fontSize="9" fill="#94A3B8" textAnchor="end">{maxDayPoints}</text>
                <text x="22" y="144" fontSize="9" fill="#94A3B8" textAnchor="end">0</text>

                {/* Draw Trend Line */}
                {(() => {
                  const points = last7DaysPoints.map((day, idx) => {
                    const step = 450 / 6;
                    const x = 30 + idx * step;
                    // Max height is 120 (from y=140 up to y=20)
                    const y = 140 - (day.value / maxDayPoints) * 120;
                    return { x, y, label: day.label, val: day.value };
                  });

                  // Build path line string
                  let pathString = '';
                  points.forEach((p, idx) => {
                    if (idx === 0) pathString += `M ${p.x} ${p.y}`;
                    else pathString += ` L ${p.x} ${p.y}`;
                  });

                  return (
                    <g>
                      {/* Grid Vertical Lines */}
                      {points.map((p) => (
                        <line key={p.label} x1={p.x} y1="20" x2={p.x} y2="140" stroke="#F8FAFC" strokeWidth="1.5" />
                      ))}

                      {/* Main Trend Line */}
                      {pathString && (
                        <path
                          d={pathString}
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Dots on line */}
                      {points.map((p) => (
                        <g key={p.label} className="cursor-pointer group">
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            fill="#FFFFFF"
                            stroke="#F59E0B"
                            strokeWidth="2.5"
                          />
                          {/* Tooltip value */}
                          <text
                            x={p.x}
                            y={p.y - 10}
                            fontSize="9"
                            fontWeight="extrabold"
                            fill="#B45309"
                            textAnchor="middle"
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900"
                          >
                            +{p.val}
                          </text>
                          {/* X label */}
                          <text x={p.x} y="156" fontSize="9" fill="#64748B" textAnchor="middle">
                            {p.label}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>

        {/* Column 3: Side Panels */}
        <div className="space-y-6">
          
          {/* Card: Star Distribution Categories */}
          <div className="p-5 bg-white border border-slate-200/70 rounded-3xl shadow-2xs space-y-5">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Phân Nhóm Thi Đua Học Sinh</h4>
              <p className="text-[10px] text-slate-400">Phân bố số lượng sao đạt được trong lớp</p>
            </div>

            <div className="space-y-4">
              {/* Group 1: Excellent */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    Bứt phá (&gt;30 sao)
                  </span>
                  <span>{excelCount} học sinh ({excelPercent}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${excelPercent}%` }} />
                </div>
              </div>

              {/* Group 2: Active */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Chăm ngoan (15-30 sao)
                  </span>
                  <span>{activeCount} học sinh ({activePercent}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${activePercent}%` }} />
                </div>
              </div>

              {/* Group 3: Warming up */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Cần cố gắng (&lt;15 sao)
                  </span>
                  <span>{warmUpCount} học sinh ({warmUpPercent}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${warmUpPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50 leading-relaxed">
              💡 **Lời khuyên sư phạm:** Có **{warmUpCount}** em cần được khích lệ thêm trong tuần này. Hãy giao thêm các nhiệm vụ nhỏ tại lớp để thưởng điểm sao khuyến khích các em tích cực hơn!
            </div>
          </div>

          {/* Card: Classroom Activity Logs */}
          <div className="p-5 bg-white border border-slate-200/70 rounded-3xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Ghi Nhận Hoạt Động Gần Nhất</h4>
                <p className="text-[10px] text-slate-400">Nhật ký rèn luyện và khen thưởng của lớp</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (currentStudents.length > 0 && !selectedStudentId) {
                    setSelectedStudentId(currentStudents[0].id);
                  }
                  setIsAddRecordModalOpen(true);
                }}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ghi nhận mới</span>
              </button>
            </div>
            
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {(() => {
                // Filter transactions so they ONLY belong to students in currentStudents
                const validTransactions = pointTransactions.filter(
                  (tx) =>
                    tx.classId === activeClass.id &&
                    currentStudents.some((s) => s.id === tx.studentId || s.name === tx.studentName)
                );

                const sampleReasons = [
                  'Phát biểu xây dựng bài sôi nổi môn Tiếng Việt',
                  'Đạt điểm 10 kiểm tra Toán giữa kỳ',
                  'Tích cực rèn luyện và giữ gìn vệ sinh lớp học',
                  'Tự giác hoàn thành tốt bài tập về nhà',
                ];
                
                const displayList = (
                  validTransactions.length > 0
                    ? validTransactions
                    : currentStudents.slice(0, 4).map((s, idx) => ({
                        id: `tx-default-${s.id}`,
                        studentId: s.id,
                        studentName: s.name,
                        classId: activeClass.id,
                        amount: 5 + (idx % 2 === 0 ? 5 : 0),
                        reason: sampleReasons[idx % sampleReasons.length],
                        icon: 'Star',
                        type: 'positive' as const,
                        timestamp: Date.now() - (idx + 1) * 3600000,
                      }))
                ).map((tx) => {
                  const student = currentStudents.find(
                    (s) => s.id === tx.studentId || s.name === tx.studentName
                  );
                  return {
                    ...tx,
                    studentName: student ? student.name : tx.studentName,
                  };
                });

                if (displayList.length === 0) {
                  return (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Chưa ghi nhận hoạt động khen thưởng nào.
                    </div>
                  );
                }

                return displayList.slice(0, 8).map((tx) => (
                  <div key={tx.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/50 text-[11px] flex gap-2.5 items-start hover:border-slate-300 transition-colors group">
                    <span className="text-base shrink-0">
                      {tx.icon === 'Star' ? '⭐' : tx.icon === 'Gift' ? '🎁' : '📝'}
                    </span>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-slate-800 truncate">
                          {tx.studentName}{' '}
                          <span className={tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                            {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} sao
                          </span>
                        </p>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            type="button"
                            title="Chỉnh sửa ghi nhận"
                            onClick={() => {
                              setEditingTx(tx);
                              setSelectedStudentId(tx.studentId);
                              setRecordAmount(tx.amount);
                              setRecordReason(tx.reason);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Xoá ghi nhận này"
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xoá ghi nhận "${tx.reason}" của em ${tx.studentName}?`)) {
                                deletePointTransaction(tx.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-500 leading-normal break-words">{tx.reason}</p>
                      <p className="text-[9px] text-slate-400">
                        {new Date(tx.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

        </div>

      </div>

      {/* Modal: Ghi Nhận Hoạt Động Mới Cho Học Sinh */}
      {isAddRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
                  📝
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Ghi Nhận Hoạt Động Học Sinh</h3>
                  <p className="text-[10px] text-slate-400">Tuyên dương hoặc ghi nhận rèn luyện</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedStudentId || !recordReason.trim()) return;
                awardPoints(selectedStudentId, recordAmount, recordReason.trim(), recordIcon);
                setIsAddRecordModalOpen(false);
                setRecordReason('');
              }}
              className="space-y-4"
            >
              {/* Select Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn học sinh ghi nhận *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {currentStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode || 'HS'}) — ⭐ {s.stars} sao
                    </option>
                  ))}
                  {currentStudents.length === 0 && (
                    <option value="" disabled>Chưa có học sinh trong lớp</option>
                  )}
                </select>
              </div>

              {/* Reward Amount Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mức sao ghi nhận *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '+5 sao', val: 5 },
                    { label: '+10 sao', val: 10 },
                    { label: '+2 sao', val: 2 },
                    { label: '-5 sao', val: -5 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setRecordAmount(preset.val)}
                      className={`py-2 px-2 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                        recordAmount === preset.val
                          ? preset.val >= 0
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs scale-105'
                            : 'bg-rose-500 text-white border-rose-500 shadow-xs scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Reason Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung / Ghi chú hoạt động *
                </label>
                <textarea
                  rows={3}
                  required
                  value={recordReason}
                  onChange={(e) => setRecordReason(e.target.value)}
                  placeholder="Ghi chú nội dung rèn luyện của học sinh (VD: Tích cực phát biểu xây dựng bài sôi nổi môn Tiếng Việt...)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder:text-slate-400 font-medium leading-relaxed"
                />

                {/* Quick Templates Chips */}
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">Gợi ý nhanh nội dung:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Phát biểu xây dựng bài sôi nổi',
                      'Đạt điểm 10 bài kiểm tra',
                      'Giúp đỡ bạn giữ gìn vệ sinh lớp',
                      'Tự giác hoàn thành bài tập về nhà',
                      'Tích cực làm việc nhóm',
                    ].map((tpl) => (
                      <button
                        key={tpl}
                        type="button"
                        onClick={() => setRecordReason(tpl)}
                        className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/80 rounded-lg text-[10px] font-semibold text-slate-600 transition-colors cursor-pointer"
                      >
                        + {tpl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRecordModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Lưu Ghi Nhận</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Chỉnh Sửa Ghi Nhận Hoạt Động */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
                  ✏️
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Chỉnh Sửa Ghi Nhận</h3>
                  <p className="text-[10px] text-slate-400">Cập nhật nội dung hoặc số sao rèn luyện</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!recordReason.trim()) return;

                const targetStudent = currentStudents.find((s) => s.id === selectedStudentId);

                updatePointTransaction({
                  ...editingTx,
                  studentId: selectedStudentId,
                  studentName: targetStudent ? targetStudent.name : editingTx.studentName,
                  amount: recordAmount,
                  reason: recordReason.trim(),
                  type: recordAmount >= 0 ? 'positive' : 'negative',
                });
                setEditingTx(null);
              }}
              className="space-y-4"
            >
              {/* Select Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn học sinh *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {currentStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode || 'HS'}) — ⭐ {s.stars} sao
                    </option>
                  ))}
                </select>
              </div>

              {/* Reward Amount Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mức sao ghi nhận *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '+5 sao', val: 5 },
                    { label: '+10 sao', val: 10 },
                    { label: '+2 sao', val: 2 },
                    { label: '-5 sao', val: -5 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setRecordAmount(preset.val)}
                      className={`py-2 px-2 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                        recordAmount === preset.val
                          ? preset.val >= 0
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-105'
                            : 'bg-rose-500 text-white border-rose-500 shadow-xs scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Reason Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung / Ghi chú hoạt động *
                </label>
                <textarea
                  rows={3}
                  required
                  value={recordReason}
                  onChange={(e) => setRecordReason(e.target.value)}
                  placeholder="Ghi chú nội dung rèn luyện của học sinh..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium leading-relaxed"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Cập Nhật Ghi Nhận</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
