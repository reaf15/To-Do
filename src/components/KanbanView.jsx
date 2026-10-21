import React from 'react';
import { 
  Clock, 
  FileText, 
  Send, 
  Hammer, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Eye,
  Plus
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const KANBAN_COLUMNS = [
  {
    id: 'pending',
    title: '접수 / 대기',
    statuses: ['접수/대기'],
    color: 'border-slate-300 bg-slate-50/50',
    headerBg: 'bg-slate-100 text-slate-800',
    icon: Clock,
  },
  {
    id: 'review',
    title: '검토 및 협의',
    statuses: ['검토중', '제안서 협의'],
    color: 'border-amber-300 bg-amber-50/20',
    headerBg: 'bg-amber-100 text-amber-900',
    icon: FileText,
  },
  {
    id: 'quote',
    title: '견적의뢰 / 방문',
    statuses: ['견적의뢰', '견적방문'],
    color: 'border-blue-300 bg-blue-50/20',
    headerBg: 'bg-blue-100 text-blue-900',
    icon: Send,
  },
  {
    id: 'contract',
    title: '계약 / 공사진행',
    statuses: ['계약체결', '공사진행'],
    color: 'border-purple-300 bg-purple-50/20',
    headerBg: 'bg-purple-100 text-purple-900',
    icon: Hammer,
  },
  {
    id: 'done',
    title: '완료',
    statuses: ['완료'],
    color: 'border-emerald-300 bg-emerald-50/20',
    headerBg: 'bg-emerald-100 text-emerald-900',
    icon: CheckCircle,
  },
];

export default function KanbanView({
  tasks,
  onSelectTask,
  onQuickStatusChange,
  onNewTask
}) {
  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case '접수/대기': return '검토중';
      case '검토중': return '견적의뢰';
      case '제안서 협의': return '견적의뢰';
      case '견적의뢰': return '공사진행';
      case '견적방문': return '견적의뢰';
      case '계약체결': return '공사진행';
      case '공사진행': return '완료';
      default: return null;
    }
  };

  const getPrevStatus = (currentStatus) => {
    switch (currentStatus) {
      case '완료': return '공사진행';
      case '공사진행': return '견적의뢰';
      case '계약체결': return '견적의뢰';
      case '견적의뢰': return '접수/대기';
      case '견적방문': return '접수/대기';
      case '검토중': return '접수/대기';
      case '제안서 협의': return '접수/대기';
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 items-start">
      {KANBAN_COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => col.statuses.includes(t.status));
        const colTotalCost = columnTasks.reduce((sum, t) => sum + (Number(t.estimatedCost) || 0), 0);
        const IconComponent = col.icon;

        return (
          <div
            key={col.id}
            className={`rounded-xl border ${col.color} flex flex-col max-h-[82vh] shadow-sm`}
          >
            {/* Column Header */}
            <div className={`p-3 rounded-t-xl ${col.headerBg} flex items-center justify-between border-b border-inherit`}>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <IconComponent className="w-4 h-4" />
                <span>{col.title}</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/80 text-[11px] font-extrabold shadow-xs">
                  {columnTasks.length}
                </span>
              </div>
              <span className="text-[11px] font-semibold opacity-80">
                {colTotalCost > 0 ? formatCurrency(colTotalCost) : '-'}
              </span>
            </div>

            {/* Column Cards List */}
            <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1 min-h-[140px]">
              {columnTasks.length === 0 ? (
                <div className="h-28 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                  항목 없음
                </div>
              ) : (
                columnTasks.map((t) => {
                  const next = getNextStatus(t.status);
                  const prev = getPrevStatus(t.status);

                  return (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className="bg-white rounded-lg p-3 border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow transition cursor-pointer group"
                    >
                      {/* Facility & Location & Budget tag */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {t.facility} · {t.location}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                          t.budget === '수선유지비'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : t.budget === '시설비'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : t.budget === '운영경비' || t.budget === '일상경비'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {t.budget}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition line-clamp-2 mb-2">
                        {t.title}
                      </h4>

                      {/* Cost details */}
                      <div className="bg-slate-50 rounded p-1.5 text-[11px] mb-2 space-y-0.5">
                        <div className="flex justify-between text-slate-600">
                          <span>예상:</span>
                          <span className="font-semibold text-slate-800">
                            {t.estimatedCost ? formatCurrency(t.estimatedCost) : (t.estimatedCostNote || '미정')}
                          </span>
                        </div>
                        {t.quoteAmount && (
                          <div className="flex justify-between text-indigo-700 font-bold">
                            <span>견적:</span>
                            <span>{formatCurrency(t.quoteAmount)}</span>
                          </div>
                        )}
                      </div>

                      {/* Vendor if any */}
                      {t.vendor && (
                        <div className="text-[11px] text-slate-600 mb-2 pb-1.5 border-b border-slate-100">
                          <span className="font-medium text-slate-700 truncate block">
                            🏢 {t.vendor}
                          </span>
                        </div>
                      )}

                      {/* Footer: Manager & Step Action Buttons */}
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          !t.manager
                            ? 'bg-slate-100 text-slate-400'
                            : t.manager === '김일호'
                            ? 'bg-teal-50 text-teal-700'
                            : t.manager === '권병학'
                            ? 'bg-blue-50 text-blue-700'
                            : t.manager === '조현호'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-teal-50 text-teal-700'
                        }`}>
                          {t.manager ? `@${t.manager}` : '미정'}
                        </span>

                        {/* Quick stage transition buttons */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {prev && (
                            <button
                              onClick={() => onQuickStatusChange(t.id, prev)}
                              title={`이전 단계(${prev})로 이동`}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {next && (
                            <button
                              onClick={() => onQuickStatusChange(t.id, next)}
                              title={`다음 단계(${next})로 이동`}
                              className="p-1 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* Quick add task to this phase */}
            <div className="p-2 border-t border-inherit bg-white/60 rounded-b-xl">
              <button
                onClick={onNewTask}
                className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-white rounded border border-dashed border-slate-300 flex items-center justify-center gap-1 transition"
              >
                <Plus className="w-3 h-3" />
                <span>공사 추가</span>
              </button>
            </div>

          </div>
        );
      })}
    </div>
  );
}
