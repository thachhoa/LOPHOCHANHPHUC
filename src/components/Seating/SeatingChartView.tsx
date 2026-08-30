import React, { useState } from 'react';
import {
  LayoutGrid,
  Shuffle,
  RotateCcw,
  Sparkles,
  Printer,
  Users,
  Star,
  Check,
  Plus,
  Info,
  Award,
} from 'lucide-react';
import { useClassroom } from '../../context/ClassroomContext';
import { Student } from '../../types';
import { exportSeatingPptx } from '../../utils/PresentationExporter';

export const SeatingChartView: React.FC = () => {
  const {
    activeClass,
    currentStudents,
    updateStudentSeat,
    swapSeats,
    randomizeSeats,
    clearSeating,
    todayAttendance,
    setSelectedStudent,
    setQuickPointTargetStudent,
    setIsQuickPointModalOpen,
    updateClass,
  } = useClassroom();

  const [selectedSeatForSwap, setSelectedSeatForSwap] = useState<{ studentId: string; row: number; col: number } | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetSlotToAssign, setTargetSlotToAssign] = useState<{ row: number; col: number } | null>(null);

  // Grid layout (e.g. 4 rows x 6 columns)
  const rows = activeClass.rows || 4;
  const cols = activeClass.cols || 6;

  // Unseated students
  const unseatedStudents = currentStudents.filter(
    s => s.seatRow === undefined || s.seatRow < 0 || s.seatCol === undefined || s.seatCol < 0 ||
         s.seatRow >= rows || s.seatCol >= cols
  );

  const getStudentAt = (r: number, c: number): Student | undefined => {
    return currentStudents.find(s => s.seatRow === r && s.seatCol === c);
  };

  const handleSeatClick = (r: number, c: number) => {
    const studentInSeat = getStudentAt(r, c);

    if (selectedSeatForSwap) {
      if (studentInSeat) {
        // Swap with another student
        swapSeats(selectedSeatForSwap.studentId, studentInSeat.id);
      } else {
        // Move to empty seat
        updateStudentSeat(selectedSeatForSwap.studentId, r, c);
      }
      setSelectedSeatForSwap(null);
    } else {
      if (studentInSeat) {
        // Select for swap
        setSelectedSeatForSwap({ studentId: studentInSeat.id, row: r, col: c });
      } else {
        // Open modal to assign unseated student
        setTargetSlotToAssign({ row: r, col: c });
        setIsAssignModalOpen(true);
      }
    }
  };

  const handleAssignStudent = (studentId: string) => {
    if (targetSlotToAssign) {
      updateStudentSeat(studentId, targetSlotToAssign.row, targetSlotToAssign.col);
      setIsAssignModalOpen(false);
      setTargetSlotToAssign(null);
    }
  };

  const handleGroupsCountChange = (groupCount: number) => {
    updateClass({
      ...activeClass,
      cols: groupCount * 2
    });
    setSelectedSeatForSwap(null);
  };

  const handleDesksCountChange = (deskCount: number) => {
    updateClass({
      ...activeClass,
      rows: deskCount
    });
    setSelectedSeatForSwap(null);
  };

  const renderSeat = (r: number, c: number, student: Student | undefined, side: 'Trái' | 'Phải') => {
    const isSelected = selectedSeatForSwap?.studentId === student?.id && student !== undefined;
    const currentStatus = student ? todayAttendance[student.id] || 'present' : 'present';

    return (
      <div
        onClick={() => handleSeatClick(r, c)}
        className={`relative min-h-[145px] rounded-xl border p-2.5 transition-all cursor-pointer flex flex-col justify-between ${
          isSelected
            ? 'border-amber-500 bg-amber-50 shadow-sm ring-2 ring-amber-300 scale-[1.02]'
            : student
            ? 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
            : 'bg-slate-50 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/20'
        }`}
      >
        {/* Seat Title */}
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
          <span>{side === 'Trái' ? 'Bên Trái' : 'Bên Phải'}</span>
          {student && (
            <span
              className={`w-2 h-2 rounded-full ${
                currentStatus === 'present'
                  ? 'bg-emerald-500'
                  : currentStatus === 'late'
                  ? 'bg-amber-500'
                  : currentStatus === 'excused'
                  ? 'bg-blue-500'
                  : 'bg-rose-500'
              }`}
            />
          )}
        </div>

        {student ? (
          <div className="flex flex-col items-center text-center my-1">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-3xs mb-1">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-extrabold text-[11px] text-slate-800 leading-tight line-clamp-1">
              {student.name}
            </span>
            <span className="text-[9px] text-slate-400 font-medium">{student.studentCode}</span>
            
            {/* Controls in seat */}
            <div className="mt-1.5 flex items-center justify-center gap-1.5 w-full pt-1 border-t border-slate-100">
              {/* Quick Star */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickPointTargetStudent(student);
                  setIsQuickPointModalOpen(true);
                }}
                className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-50 text-amber-800 text-[8px] font-bold"
              >
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                {student.stars}
              </button>
              
              {/* Profile */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStudent(student);
                }}
                className="text-[8px] text-blue-600 font-bold hover:underline"
              >
                Hồ sơ
              </button>

              {/* Remove Student Seat */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Gỡ em ${student.name} khỏi vị trí này?`)) {
                    updateStudentSeat(student.id, -1, -1);
                  }
                }}
                className="text-[8px] text-rose-600 font-bold hover:underline"
              >
                Gỡ
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center my-auto py-2 text-slate-400">
            <Plus className="w-4 h-4 mb-0.5 text-slate-300" />
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-500">Xếp chỗ</span>
          </div>
        )}
      </div>
    );
  };

  const printSeatingChart = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <LayoutGrid className="w-6 h-6 text-blue-600" />
              Sơ Đồ Lớp Học Tương Tác
            </h2>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
              {activeClass.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Nhấp 2 vị trí bất kỳ để hoán đổi chỗ ngồi, hoặc click vị trí trống để xếp học sinh
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedSeatForSwap && (
            <button
              id="btn-cancel-swap-seats"
              onClick={() => setSelectedSeatForSwap(null)}
              className="px-3.5 py-2 bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-pulse"
            >
              ✕ Huỷ chọn đổi chỗ
            </button>
          )}

          <button
            id="btn-randomize-seats"
            onClick={randomizeSeats}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Shuffle className="w-4 h-4 text-purple-600" />
            Xếp ngẫu nhiên
          </button>

          <button
            id="btn-clear-seats"
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn xoá toàn bộ sắp xếp chỗ ngồi hiện tại?')) {
                clearSeating();
              }
            }}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            Làm trống
          </button>

          <button
            id="btn-print-seating-chart"
            onClick={printSeatingChart}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            In sơ đồ
          </button>

          <button
            id="btn-export-seating-pptx"
            onClick={() => exportSeatingPptx(activeClass, currentStudents)}
            className="px-3 py-2 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4 text-blue-600" />
            Xuất Slide Sơ đồ (.pptx)
          </button>
        </div>
      </div>

      {/* Seating Configuration Controls Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-3xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Cấu hình sơ đồ lớp:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">Số tổ:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {[3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleGroupsCountChange(num)}
                  className={`px-3.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    cols / 2 === num
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {num} tổ
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">Số bàn mỗi tổ:</span>
            <select
              value={rows}
              onChange={(e) => handleDesksCountChange(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 px-2 py-1 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} bàn
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Classroom Physical Layout Stage */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col items-center">
        {/* Front of Classroom: Blackboard & Teacher Podium */}
        <div className="w-full max-w-2xl mb-8 flex flex-col items-center">
          {/* Blackboard */}
          <div className="w-full py-2.5 px-6 bg-linear-to-r from-emerald-800 via-emerald-900 to-emerald-800 text-white rounded-2xl shadow-md border-4 border-amber-800/80 flex items-center justify-between text-xs font-bold tracking-wide">
            <span className="opacity-80">🎓 BẢNG ĐEN LỚP {activeClass.name.toUpperCase()}</span>
            <span className="text-[11px] text-emerald-200 font-normal">Năm học {activeClass.academicYear}</span>
          </div>

          {/* Teacher's Desk */}
          <div className="mt-3 flex items-center justify-center gap-2 px-6 py-2 bg-amber-100 border-2 border-amber-300 rounded-xl text-amber-900 text-xs font-bold shadow-xs">
            <span>🧑‍🏫 Bàn Giáo Viên ({activeClass.teacherName})</span>
          </div>
        </div>

        {/* Seating Grid by Groups & Desks */}
        <div className="flex flex-wrap justify-center gap-6 w-full max-w-6xl mt-4">
          {Array.from({ length: cols / 2 }).map((_, groupIdx) => (
            <div key={groupIdx} className="flex-1 min-w-[260px] bg-slate-100/50 p-4 rounded-3xl border border-slate-200/80 space-y-4 shadow-3xs">
              {/* Tiêu đề Tổ */}
              <div className="text-center font-extrabold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                Tổ {groupIdx + 1}
              </div>
              
              {/* Danh sách bàn */}
              <div className="space-y-3.5">
                {Array.from({ length: rows }).map((_, deskIdx) => {
                  const colLeft = groupIdx * 2;
                  const colRight = groupIdx * 2 + 1;
                  const studentLeft = getStudentAt(deskIdx, colLeft);
                  const studentRight = getStudentAt(deskIdx, colRight);

                  return (
                    <div key={deskIdx} className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 block text-center uppercase">Bàn {deskIdx + 1}</span>
                      <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-2xl border border-slate-200/60 shadow-3xs">
                        {/* Chỗ ngồi bên trái */}
                        {renderSeat(deskIdx, colLeft, studentLeft, 'Trái')}
                        {/* Chỗ ngồi bên phải */}
                        {renderSeat(deskIdx, colRight, studentRight, 'Phải')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-4 border-t border-slate-200 w-full flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Chú thích điểm danh:</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Có mặt</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Đi muộn</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Vắng có phép</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Vắng không phép</span>
        </div>
      </div>

      {/* Unseated Students Section (if any) */}
      {unseatedStudents.length > 0 && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl">
          <h3 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-700" />
            Học sinh chưa được xếp chỗ ngồi ({unseatedStudents.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {unseatedStudents.map(std => (
              <div
                key={std.id}
                onClick={() => {
                  // Find first empty seat
                  for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                      if (!getStudentAt(r, c)) {
                        updateStudentSeat(std.id, r, c);
                        return;
                      }
                    }
                  }
                }}
                className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-slate-800 hover:bg-amber-100 cursor-pointer flex items-center gap-2 shadow-2xs"
              >
                <img src={std.avatar} alt={std.name} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                <span>{std.name}</span>
                <span className="text-[10px] text-amber-700 bg-amber-100 px-1 rounded font-bold">+ Xếp vào</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">
                Xếp học sinh vào Tổ {Math.floor((targetSlotToAssign?.col || 0) / 2) + 1} - Bàn {(targetSlotToAssign?.row || 0) + 1} ({targetSlotToAssign?.col !== undefined && targetSlotToAssign.col % 2 === 0 ? 'Bên Trái' : 'Bên Phải'})
              </h3>
              <button
                id="btn-close-assign-seat-modal"
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setTargetSlotToAssign(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 max-h-60 overflow-y-auto space-y-1.5">
              {[...currentStudents]
                .sort((a, b) => {
                  const aUnseated = a.seatRow === undefined || a.seatRow < 0;
                  const bUnseated = b.seatRow === undefined || b.seatRow < 0;
                  if (aUnseated && !bUnseated) return -1;
                  if (!aUnseated && bUnseated) return 1;
                  return a.name.localeCompare(b.name);
                })
                .map(student => (
                  <button
                    key={student.id}
                    onClick={() => handleAssignStudent(student.id)}
                    className="w-full p-2.5 rounded-xl hover:bg-blue-50 border border-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <span className="font-bold text-xs text-slate-800 block">{student.name}</span>
                        <span className="text-[10px] text-slate-400">{student.studentCode}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const isUnseated = student.seatRow === undefined || student.seatRow < 0;
                        if (isUnseated) {
                          return <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Sẵn sàng</span>;
                        }
                        const gNum = Math.floor(student.seatCol / 2) + 1;
                        const dNum = student.seatRow + 1;
                        const sideLabel = student.seatCol % 2 === 0 ? 'Trái' : 'Phải';
                        return <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Tổ {gNum} - Bàn {dNum} ({sideLabel})</span>;
                      })()}
                      <span className="text-xs font-semibold text-blue-600">Chọn</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
