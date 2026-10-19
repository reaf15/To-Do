import React from 'react';
import { 
  User, 
  UserCheck, 
  Briefcase, 
  Coins, 
  CheckCircle2, 
  Send, 
  HelpCircle,
  ExternalLink,
  Phone
} from 'lucide-react';
import { MANAGERS, STATUS_COLORS } from '../data/initialTasks';
import { formatCurrency, formatCurrencyShort } from '../utils/formatters';

export default function StaffView({
  tasks,
  onSelectTask,
  onQuickManagerChange
}) {
  const staffGroups = [
    ...MANAGERS.map((m) => ({ name: m, isUnassigned: false })),
    { name: '미정 (담당자 미지정)', isUnassigned: true }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 items-start">
      {staffGroups.map((staff) => {
        const staffTasks = tasks.filter((t) => 
          staff.isUnassigned ? !t.manager : t.manager === staff.name
        );
        const totalCost = staffTasks.reduce((sum, t) => sum + (Number(t.estimatedCost) || 0), 0);
        const quoteSum = staffTasks.reduce((sum, t) => sum + (Number(t.quoteAmount) || 0), 0);
        const completedCount = staffTasks.filter((t) => t.status === '완료').length;
        const quoteCount = staffTasks.filter((t) => t.status === '견적의뢰' || t.status === '견적방문').length;

        return (
          <div
            key={staff.name}
            className={`rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col ${
              staff.isUnassigned ? 'border-amber-300' : 'border-slate-200'
            }`}
          >
            {/* Staff Card Header */}
            <div className={`p-4 border-b ${
              staff.isUnassigned ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    staff.isUnassigned 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-teal-100 text-teal-800'
                  }`}>
                    {staff.isUnassigned ? '?' : staff.name.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {staff.name}
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      {staff.isUnassigned ? '신규 업무 배정 필요' : '남양주센터 시설관리'}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                  staff.isUnassigned 
                    ? 'bg-amber-200 text-amber-900' 
                    : 'bg-teal-500 text-white'
                }`}>
                  {staffTasks.length}건
                </span>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-200/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">예상 담당예산</span>
                  <span className="font-bold text-slate-800">{formatCurrencyShort(totalCost)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">견적/진행 건수</span>
                  <span className="font-bold text-blue-600">{quoteCount}건 견적</span>
                </div>
              </div>
            </div>

            {/* Tasks list */}
            <div className="p-3 space-y-2.5 overflow-y-auto max-h-[65vh]">
              {staffTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  배정된 업무가 없습니다.
                </div>
              ) : (
                staffTasks.map((t) => {
                  const statusStyle = STATUS_COLORS[t.status] || {
                    bg: 'bg-slate-50',
                    text: 'text-slate-700',
                    border: 'border-slate-200'
                  };

                  return (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className="p-3 rounded-lg border border-slate-200 hover:border-teal-400 bg-white hover:bg-slate-50/80 cursor-pointer transition shadow-xs group"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-semibold text-slate-500">
                          {t.facility} · {t.location}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {t.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition line-clamp-2 mb-1.5">
                        {t.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                        <span className="font-medium text-slate-700">
                          {t.estimatedCost ? formatCurrency(t.estimatedCost) : (t.estimatedCostNote || '-')}
                        </span>

                        {t.vendor && (
                          <span className="text-slate-500 font-normal truncate max-w-[100px]">
                            {t.vendor}
                          </span>
                        )}
                      </div>

                      {/* If unassigned, provide quick assign buttons */}
                      {staff.isUnassigned && (
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]" onClick={(e) => e.stopPropagation()}>
                          <span className="text-slate-400">배정:</span>
                          <div className="flex gap-1">
                            {MANAGERS.map((m) => (
                              <button
                                key={m}
                                onClick={() => onQuickManagerChange(t.id, m)}
                                className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-teal-100 hover:text-teal-800 text-slate-600 font-bold transition"
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
