import React, { useState, useMemo } from 'react';
import { 
  ArrowRightLeft, 
  X, 
  Check, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  Building2, 
  Sparkles,
  Info
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function CarryoverModal({
  isOpen,
  onClose,
  tasks = [],
  prevYear = '2026',
  targetYear = '2027',
  onCarryover,
  selectedDepartment = '남양주체육문화센터'
}) {
  const [selectedIds, setSelectedIds] = useState(() => {
    // Default: all tasks checked
    return tasks.map(t => t.id);
  });

  // Re-sync selected IDs when tasks change
  React.useEffect(() => {
    if (isOpen) {
      setSelectedIds(tasks.map(t => t.id));
    }
  }, [isOpen, tasks]);

  if (!isOpen) return null;

  const reviewTasks = tasks.filter(t => t.status === '검토');
  const inProgressTasks = tasks.filter(t => t.status !== '검토');

  const handleToggle = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(tasks.map(t => t.id));
  };

  const handleSelectOnlyReview = () => {
    setSelectedIds(reviewTasks.map(t => t.id));
  };

  const handleSelectOnlyInProgress = () => {
    setSelectedIds(inProgressTasks.map(t => t.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (selectedIds.length === 0) {
      alert('이월할 공사를 최소 1건 이상 선택해주세요.');
      return;
    }
    if (onCarryover) {
      onCarryover(selectedIds, targetYear);
    }
    onClose();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case '검토':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">검토</span>;
      case '설계':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">설계</span>;
      case '진행':
      case '공사진행':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">진행</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{status || '미정'}</span>;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  회기 이월 관리
                </span>
                <span className="text-xs text-slate-300 font-bold">
                  {prevYear}년도 ➔ {targetYear}년도
                </span>
                <span className="text-[11px] text-teal-300">
                  [{selectedDepartment}]
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">
                미완료 및 검토 공사 회기 이월
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Notification Box */}
        <div className="bg-indigo-50/70 border-b border-indigo-100 p-4 shrink-0 flex items-start gap-2.5 text-xs text-indigo-900 leading-relaxed">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">
              전년도({prevYear}년)에 완료되지 않은 공사를 {targetYear}년도 새 회기로 이월합니다.
            </p>
            <p className="text-[11px] text-indigo-700/90 mt-0.5">
              💡 <strong>진행상태가 '검토'인 공사는 이월하더라도 {targetYear}년도 예산(집행예정/잔여예산)을 차감하지 않으므로</strong>, 안심하고 이월하여 차기년도 안건으로 관리하실 수 있습니다.
            </p>
          </div>
        </div>

        {/* Quick Selection Buttons Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-600 mr-1">선택 필터:</span>
            <button
              type="button"
              onClick={handleSelectAll}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                selectedIds.length === tasks.length 
                  ? 'bg-slate-800 text-white border-slate-800' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              전체 선택 ({tasks.length})
            </button>
            {reviewTasks.length > 0 && (
              <button
                type="button"
                onClick={handleSelectOnlyReview}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 transition cursor-pointer"
              >
                '검토' 건만 선택 ({reviewTasks.length})
              </button>
            )}
            {inProgressTasks.length > 0 && (
              <button
                type="button"
                onClick={handleSelectOnlyInProgress}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 transition cursor-pointer"
              >
                '진행/설계' 건만 선택 ({inProgressTasks.length})
              </button>
            )}
            <button
              type="button"
              onClick={handleDeselectAll}
              className="px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              선택 해제
            </button>
          </div>

          <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
            {selectedIds.length} / {tasks.length}건 선택됨
          </span>
        </div>

        {/* Tasks List Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              이월 가능한 전년도({prevYear}년) 미완료 공사가 없습니다.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-2xs">
              {tasks.map((t) => {
                const isSelected = selectedIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => handleToggle(t.id)}
                    className={`flex items-center gap-3 p-3 transition cursor-pointer select-none ${
                      isSelected 
                        ? 'bg-indigo-50/50 hover:bg-indigo-50/80' 
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                          {t.budget || '수선유지비'}
                        </span>
                        {getStatusBadge(t.status)}
                        {t.facility && (
                          <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                            {t.facility} {t.location ? `(${t.location})` : ''}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {t.title}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-slate-900">
                        {t.contractAmount 
                          ? `${Number(t.contractAmount).toLocaleString()}원 (계약)` 
                          : t.quoteAmount 
                            ? `${Number(t.quoteAmount).toLocaleString()}원 (견적)`
                            : t.estimatedCost 
                              ? `${Number(t.estimatedCost).toLocaleString()}원 (예상)`
                              : '비용 미정'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        담당: {t.manager || '미지정'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white transition shadow-sm cursor-pointer disabled:cursor-not-allowed active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>선택한 {selectedIds.length}건을 {targetYear}년도로 이월 확정</span>
          </button>
        </div>
      </div>
    </div>
  );
}
