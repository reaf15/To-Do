import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Copy, 
  Check, 
  Calendar, 
  Send, 
  MessageSquare, 
  UserCheck, 
  Edit3, 
  Coins, 
  FileSpreadsheet, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, copyToClipboard, formatDate } from '../utils/formatters';
import { STATUS_COLORS, STATUS_LIST, MANAGERS } from '../data/initialTasks';

export default function TaskDetailDrawer({
  isOpen,
  onClose,
  task,
  onEdit,
  onAddLog,
  currentUser,
  onQuickStatusChange
}) {
  const [newLogMessage, setNewLogMessage] = useState('');
  const [logAuthor, setLogAuthor] = useState(currentUser !== 'ALL' ? currentUser : '김일호');
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen || !task) return null;

  const statusStyle = STATUS_COLORS[task.status] || {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400'
  };

  const handleCopyTaskSummary = async () => {
    const summary = `[남양주체육문화센터 시설업무 공유]\n` +
      `📌 공사명: ${task.title}\n` +
      `🏢 위치: ${task.facility} ${task.location}\n` +
      `💰 예상: ${task.estimatedCost ? formatCurrency(task.estimatedCost) : (task.estimatedCostNote || '미정')}` +
      (task.quoteAmount ? ` | 견적: ${formatCurrency(task.quoteAmount)}` : '') + `\n` +
      `👤 담당자: ${task.manager || '미배정'} | 진행: ${task.status}\n` +
      (task.vendor ? `🏢 업체: ${task.vendor}\n` : '') +
      (task.memo ? `📝 비고: ${task.memo}\n` : '');

    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleAddLogSubmit = (e) => {
    e.preventDefault();
    if (!newLogMessage.trim()) return;

    onAddLog(task.id, {
      date: new Date().toISOString().split('T')[0],
      author: logAuthor,
      message: newLogMessage.trim()
    });

    setNewLogMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {task.facility}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {task.location || '공용'}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                {task.status}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              {task.title}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(task)}
              title="정보 수정"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          
          {/* Quick Status Bar */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-600">진행 상태 변경:</span>
            <select
              value={task.status}
              onChange={(e) => onQuickStatusChange(task.id, e.target.value)}
              className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg font-bold text-xs text-teal-700 shadow-xs focus:ring-2 focus:ring-teal-500/20"
            >
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Budget & Cost Section */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-700 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Coins className="w-4 h-4 text-teal-600" />
              <span>예산 및 견적 내역</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-400 block font-medium">예산과목</span>
                <span className="font-bold text-slate-800 text-xs mt-1 block">
                  {task.budget}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-400 block font-medium">예상소요비용</span>
                <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                  {task.estimatedCost ? formatCurrency(task.estimatedCost) : (task.estimatedCostNote || '-')}
                </span>
              </div>

              <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-200">
                <span className="text-[11px] text-indigo-500 block font-medium">견적가</span>
                <span className="font-extrabold text-indigo-700 text-sm mt-0.5 block">
                  {task.quoteAmount ? formatCurrency(task.quoteAmount) : '-'}
                </span>
              </div>
            </div>

            {task.contractAmount && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-800">최종 계약체결 금액:</span>
                <span className="font-black text-emerald-700 text-sm">{formatCurrency(task.contractAmount)}</span>
              </div>
            )}
          </div>

          {/* Manager & Contractor Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Manager Box */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium mb-1">담당 직원</span>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  {task.manager ? task.manager.slice(0, 1) : '?'}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    {task.manager || '담당자 미배정'}
                  </div>
                  <span className="text-[10px] text-slate-400">남양주체육문화센터</span>
                </div>
              </div>
            </div>

            {/* Contractor Box */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium mb-1">시공 / 협력업체</span>
              <div className="font-bold text-slate-900 text-xs">
                {task.vendor || '업체 미지정'}
              </div>
            </div>
          </div>

          {/* Memo Box */}
          {task.memo && (
            <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-slate-700">
              <span className="text-[11px] font-bold text-amber-800 block mb-1">📌 비고 및 특이사항</span>
              <p className="leading-relaxed whitespace-pre-wrap">{task.memo}</p>
            </div>
          )}

          {/* Collaboration Logs & Notes Section */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                <span>직원간 업무 일지 및 소통 ({task.logs?.length || 0})</span>
              </h3>
            </div>

            {/* Logs Timeline */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {(!task.logs || task.logs.length === 0) ? (
                <div className="py-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  아직 등록된 업무 일지가 없습니다.
                  <span className="block text-[11px] text-slate-400 mt-1">현장 답사 내용이나 진행 상황을 남겨보세요.</span>
                </div>
              ) : (
                task.logs.map((log, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      {log.author ? log.author.slice(0, 1) : '일'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-800">{log.author}</span>
                        <span className="text-slate-400">{formatDate(log.date)}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[11px]">
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add new log form */}
            <form onSubmit={handleAddLogSubmit} className="bg-slate-100 p-3 rounded-xl space-y-2 border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">새 업무 일지 / 메모 작성</span>
                <select
                  value={logAuthor}
                  onChange={(e) => setLogAuthor(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2 py-0.5 text-[11px] font-semibold"
                >
                  {MANAGERS.map((m) => (
                    <option key={m} value={m}>{m} (작성자)</option>
                  ))}
                  <option value="관리자">관리자</option>
                </select>
              </div>

              <textarea
                rows={2}
                value={newLogMessage}
                onChange={(e) => setNewLogMessage(e.target.value)}
                placeholder="예: 금일 현장 실측 완료. 누수 위치 확인하였으며 업체 견적 대기 중."
                className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newLogMessage.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition disabled:opacity-40"
                >
                  <Send className="w-3 h-3" />
                  <span>일지 등록</span>
                </button>
              </div>
            </form>

          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={handleCopyTaskSummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
          >
            {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedShare ? '복사 완료!' : '카톡/메신저용 복사'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(task)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 font-bold text-xs transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>수정하기</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-bold text-xs transition"
            >
              확인
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
