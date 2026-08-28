import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, Brain, User, AlertCircle, Copy, Check } from 'lucide-react';
import { useClassroom } from '../context/ClassroomContext';
import { Student } from '../types';

export const AIAssistantModal: React.FC = () => {
  const {
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    currentStudents,
    attendanceRecords,
    pointTransactions,
    aiApiKey,
    activeModel,
  } = useClassroom();

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [generatedRemarks, setGeneratedRemarks] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [currentRunningModel, setCurrentRunningModel] = useState<string>('');
  const [aiLogs, setAiLogs] = useState<{ step: string; status: 'pending' | 'success' | 'error'; info?: string }[]>([]);

  useEffect(() => {
    if (isAIAssistantOpen && currentStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(currentStudents[0].id);
    }
    setGeneratedRemarks('');
    setApiError('');
  }, [isAIAssistantOpen, currentStudents]);

  if (!isAIAssistantOpen) return null;

  const targetStudent = currentStudents.find((s) => s.id === selectedStudentId);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedRemarks);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateRemarks = async () => {
    if (!targetStudent) return;
    setIsLoading(true);
    setApiError('');
    setGeneratedRemarks('');
    setAiLogs([]);

    // Fetch metrics for selected student
    const studentTx = pointTransactions.filter((t) => t.studentId === targetStudent.id);
    const positiveTx = studentTx.filter((t) => t.type === 'positive');
    const negativeTx = studentTx.filter((t) => t.type === 'negative');

    // Count absences
    let excusedAbsences = 0;
    let unexcusedAbsences = 0;
    let lates = 0;

    attendanceRecords.forEach((record) => {
      const status = record.records[targetStudent.id];
      if (status === 'excused') excusedAbsences++;
      else if (status === 'unexcused') unexcusedAbsences++;
      else if (status === 'late') lates++;
    });

    const studentInfoText = `
Họ tên: ${targetStudent.name}
Giới tính: ${targetStudent.gender === 'male' ? 'Nam' : 'Nữ'}
Sao tích luỹ: ${targetStudent.stars} sao
Số lần được tuyên dương: ${positiveTx.length} lần
Các lý do tuyên dương chính: ${positiveTx.map(t => t.reason).join(', ') || 'Chưa có ghi nhận'}
Số lần bị nhắc nhở: ${negativeTx.length} lần
Các lý do nhắc nhở: ${negativeTx.map(t => t.reason).join(', ') || 'Chưa có ghi nhận'}
Huy hiệu đã đạt: ${targetStudent.badges.join(', ') || 'Chưa có'}
Chuyên cần: Nghỉ có phép ${excusedAbsences} buổi, nghỉ không phép ${unexcusedAbsences} buổi, đi muộn ${lates} buổi.
Ghi chú hiện tại: ${targetStudent.notes || 'Không có'}
`;

    // Prompt for AI
    const systemInstruction = `Bạn là một chuyên gia tâm lý giáo dục và là giáo viên chủ nhiệm tiểu học giàu tình yêu thương. Nhiệm vụ của bạn là viết một đoạn nhận xét/lời phê học bạ hạnh phúc cho học sinh dựa trên số liệu thi đua được cung cấp. Lời phê phải giàu tính động viên, chân thành, nhìn nhận điểm mạnh trước, chỉ ra điểm cần khắc phục một cách nhẹ nhàng mang tính xây dựng. Giọng điệu ấm áp chuẩn giáo dục Việt Nam. Viết khoảng 100-150 từ.`;
    const prompt = `Hãy viết nhận xét học bạ hạnh phúc cho học sinh sau:\n${studentInfoText}`;

    // Mode A: Online with Gemini API
    if (aiApiKey) {
      const modelList = ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'];
      const uniqueModels = Array.from(new Set([activeModel, ...modelList]));
      
      let success = false;
      let lastErrorText = '';
      const logs: typeof aiLogs = [];

      for (let i = 0; i < uniqueModels.length; i++) {
        const modelName = uniqueModels[i];
        setCurrentRunningModel(modelName);
        
        const currentStepIndex = logs.length;
        logs.push({ step: `Đang gọi model: ${modelName}`, status: 'pending' });
        setAiLogs([...logs]);

        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${aiApiKey}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }],
              systemInstruction: {
                parts: [{ text: systemInstruction }]
              }
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const apiErrMessage = errData?.error?.message || `HTTP error! status: ${response.status}`;
            throw new Error(apiErrMessage);
          }

          const resData = await response.json();
          const generatedText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (generatedText) {
            setGeneratedRemarks(generatedText.trim());
            logs[currentStepIndex] = { step: `Model ${modelName} hoàn thành`, status: 'success' };
            setAiLogs([...logs]);
            success = true;
            break;
          } else {
            throw new Error('API không trả về văn bản.');
          }
        } catch (err: any) {
          console.error(`Lỗi model ${modelName}:`, err);
          const errMessage = err?.message || err?.toString() || 'Lỗi không xác định';
          lastErrorText = errMessage;
          logs[currentStepIndex] = { 
            step: `Model ${modelName} lỗi`, 
            status: 'error', 
            info: errMessage 
          };
          setAiLogs([...logs]);
        }
      }

      if (!success) {
        setApiError(`Quy trình đã dừng do lỗi! Tất cả các model đều thất bại. Chi tiết lỗi cuối cùng: ${lastErrorText}`);
        logs.push({ step: 'Quy trình thi đua AI', status: 'error', info: 'Đã dừng do lỗi' });
        setAiLogs([...logs]);
      }
      setIsLoading(false);
    } 
    // Mode B: Offline Mock AI
    else {
      const logs: typeof aiLogs = [];
      logs.push({ step: 'Khởi động AI Offline', status: 'pending' });
      setAiLogs([...logs]);
      
      setTimeout(() => {
        generateMockRemarks(targetStudent, positiveTx, negativeTx, excusedAbsences, unexcusedAbsences, lates);
        logs[0] = { step: 'Trợ lý Mock AI Offline hoàn thành', status: 'success' };
        setAiLogs([...logs]);
        setIsLoading(false);
      }, 1200);
    }
  };

  const generateMockRemarks = (
    student: Student,
    pos: any[],
    neg: any[],
    excused: number,
    unexcused: number,
    lates: number
  ) => {
    let remark = '';
    const name = student.name;
    const pronoun = student.gender === 'male' ? 'Em' : 'Em';

    // 1. Praise section based on stars
    if (student.stars >= 40) {
      remark += `🌟 ${pronoun} ${name} là một học sinh xuất sắc và là niềm tự hào của lớp học hạnh phúc. Với tích lũy ${student.stars} sao vàng, em luôn thể hiện thái độ tích cực, tự giác trong học tập và hăng hái phát biểu xây dựng bài. `;
    } else if (student.stars >= 20) {
      remark += `✨ ${pronoun} ${name} ngoan ngoãn, chăm chỉ và có tinh thần tự giác cao trong các hoạt động tập thể. Em đạt thành tích tốt với ${student.stars} sao tích lũy và tích cực tham gia các buổi sinh hoạt lớp. `;
    } else {
      remark += `🌱 ${pronoun} ${name} là một học sinh dễ thương, hòa đồng và có nhiều nỗ lực trong quá trình rèn luyện. `;
    }

    // 2. Strengths or custom logs
    if (pos.length > 0) {
      const topReason = pos[0].reason.toLowerCase();
      remark += `Giáo viên ghi nhận em luôn có tinh thần tốt, đặc biệt xuất sắc ở khía cạnh ${topReason}. Em luôn biết cách quan tâm, giúp đỡ bạn bè xung quanh. `;
    } else {
      remark += `Em luôn giữ mối quan hệ tốt đẹp, hòa nhã với các bạn trong lớp và có ý thức giữ gìn vệ sinh chung. `;
    }

    // 3. Critiques / Points to improve
    if (neg.length > 0 || unexcused > 0 || lates > 0) {
      remark += `Để hoàn thiện bản thân hơn nữa trong thời gian tới, `;
      if (lates > 0 || unexcused > 0) {
        remark += `em cần chú ý sắp xếp thời gian đi học đúng giờ hơn để không ảnh hưởng đến việc tiếp thu bài đầu giờ. `;
      } else if (neg.length > 0) {
        remark += `em nên rèn luyện thêm tính tập trung, giảm bớt nói chuyện riêng trong các giờ giảng lý thuyết trên lớp. `;
      }
      remark += `Cô tin rằng với sự thông minh của mình, em sẽ khắc phục được và ngày càng tiến bộ hơn! `;
    } else {
      remark += `Mong em tiếp tục phát huy những ưu điểm hiện tại để luôn là một đóa hoa thơm trong vườn hoa học sinh chăm ngoan của lớp. Chúc em học tập thật vui vẻ! `;
    }

    setGeneratedRemarks(remark);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Trợ Lý AI Sư Phạm</h3>
                <p className="text-xs text-slate-500">Tự động sinh lời nhận xét học bạ hạnh phúc</p>
              </div>
            </div>
            <button
              onClick={() => setIsAIAssistantOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white shadow-3xs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {/* API Mode Indicator */}
            <div className="px-3.5 py-2.5 rounded-2xl text-[11px] font-semibold flex items-center justify-between bg-slate-50 border border-slate-200 text-slate-600">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Chế độ AI hiện tại:
              </span>
              <span className={`px-2 py-0.5 rounded font-extrabold ${aiApiKey ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                {aiApiKey ? 'Online (Gemini)' : 'Offline (Mock AI)'}
              </span>
            </div>

            {/* Error Message */}
            {apiError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Student Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Chọn học sinh cần nhận xét</label>
              <div className="relative">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 font-bold text-xs rounded-xl px-3.5 py-2.5 pr-8 appearance-none shadow-2xs focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {currentStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode}) — ⭐ {s.stars} sao
                    </option>
                  ))}
                </select>
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Generate Action */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleGenerateRemarks}
                disabled={isLoading || !selectedStudentId}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isLoading ? 'AI Đang suy nghĩ...' : 'Tạo nhận xét học bạ hạnh phúc'}
              </button>
            </div>

            {/* Result Area */}
            {(generatedRemarks || isLoading || aiLogs.length > 0) && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {generatedRemarks ? 'Lời phê được đề xuất' : 'Tiến trình xử lý AI'}
                  </label>
                  {generatedRemarks && (
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  )}
                </div>

                <div className="relative min-h-24 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-xs text-slate-800 leading-relaxed">
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center py-2 gap-2">
                        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] text-slate-400 font-medium">Trợ lý AI đang đọc dữ liệu thi đua của {targetStudent?.name}...</span>
                      </div>
                      
                      {/* Show active logs/steps */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200/50">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Tiến trình xử lý:</span>
                        {aiLogs.map((log, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[10px] font-medium">
                            <span className="text-slate-600">{log.step}</span>
                            <span className={`font-extrabold ${
                              log.status === 'success' ? 'text-emerald-600' :
                              log.status === 'error' ? 'text-rose-600' : 'text-amber-500 animate-pulse'
                            }`}>
                              {log.status === 'success' ? '✓ Hoàn tất' :
                               log.status === 'error' ? '✕ Lỗi API' : '⚡ Đang xử lý...'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : generatedRemarks ? (
                    <p className="whitespace-pre-line">{generatedRemarks}</p>
                  ) : (
                    /* Show failed logs when stopped due to errors */
                    <div className="space-y-2 text-xs">
                      <span className="text-rose-600 font-extrabold block">❌ Đã dừng do lỗi</span>
                      <div className="space-y-1.5">
                        {aiLogs.map((log, idx) => (
                          <div key={idx} className="flex items-start justify-between text-[10px] font-medium border-b border-slate-100 pb-1">
                            <div className="text-slate-600">
                              <span>{log.step}</span>
                              {log.info && <p className="text-rose-500 font-normal text-[9px] mt-0.5 max-w-xs">{log.info}</p>}
                            </div>
                            <span className={`font-extrabold shrink-0 ml-2 ${
                              log.status === 'success' ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {log.status === 'success' ? '✓ Hoàn tất' : '✕ Lỗi API'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center leading-normal">
            💡 *Lời khuyên:* Nhận xét trên có tính chất tham khảo, giáo viên có thể chỉnh sửa lại cho phù hợp trước khi đưa vào học bạ chính thức của em học sinh.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
