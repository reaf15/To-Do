import React from 'react';
import { 
  Briefcase, 
  Coins, 
  FileCheck2, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  CalendarClock
} from 'lucide-react';
import { formatCurrency, formatCurrencyShort } from '../utils/formatters';

export default function StatsCards({ tasks, onFilterClick }) {
  const totalCount = tasks.length;
  
  // Total costs
  const totalEstimatedCost = tasks.reduce((sum, t) => sum + (Number(t.estimatedCost) || 0), 0);
  const totalQuoteAmount = tasks.reduce((sum, t) => sum + (Number(t.quoteAmount) || 0), 0);
  const totalContractAmount = tasks.reduce((sum, t) => sum + (Number(t.contractAmount) || 0), 0);

  // Status counts
  const completedCount = tasks.filter((t) => t.status === '완료').length;
  const quoteCount = tasks.filter((t) => t.status === '견적의뢰').length;
  const visitCount = tasks.filter((t) => t.status === '견적방문').length;
  const pendingCount = tasks.filter((t) => t.status === '접수/대기' || t.status === '검토중').length;
  const inProgressCount = tasks.filter((t) => t.status !== '완료').length;

  // Manager workload
  const kimCount = tasks.filter((t) => t.manager === '김일호').length;
  const kwonCount = tasks.filter((t) => t.manager === '권병학').length;
  const choCount = tasks.filter((t) => t.manager === '조현호').length;
  const unassignedCount = tasks.filter((t) => !t.manager).length;

  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* 1. 총 업무 및 진행률 */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            공사·수선 현황
          </span>
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalCount}</span>
          <span className="text-xs font-semibold text-slate-500">건 등록</span>
          <span className="ml-auto text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            완료 {completedCount}건
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
            <span>진행 건수 ({inProgressCount}건)</span>
            <span>완료율 {completionRate}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-2 transition-all duration-500" 
              style={{ width: `${completionRate}%` }}
              title={`완료 ${completedCount}건`}
            />
            <div 
              className="bg-teal-500 h-2 opacity-70 transition-all duration-500" 
              style={{ width: `${Math.round(((quoteCount + visitCount) / totalCount) * 100)}%` }}
              title={`견적단계 ${quoteCount + visitCount}건`}
            />
          </div>
        </div>
      </div>

      {/* 2. 총 예상비용 */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            총 예상 소요예산
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {formatCurrencyShort(totalEstimatedCost)}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
          <span>정확 금액:</span>
          <span className="font-semibold text-slate-700">{formatCurrency(totalEstimatedCost)}</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          * 수선유지비 23건 + 시설비 1건 기준 산정
        </div>
      </div>

      {/* 3. 견적 및 계약 금액 */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            견적 접수 확정액
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
            {formatCurrencyShort(totalQuoteAmount)}
          </span>
          <span className="text-xs font-medium text-slate-400">
            ({tasks.filter(t => t.quoteAmount > 0).length}건 접수)
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
          <span>견적 합계:</span>
          <span className="font-semibold text-indigo-700">{formatCurrency(totalQuoteAmount)}</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">
          * 고려안전, 서진전력 접수 내역
        </div>
      </div>

      {/* 4. 담당자 배정 현황 */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            담당자 배정 현황
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1 text-center mt-1">
          <div 
            onClick={() => onFilterClick && onFilterClick('김일호')}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 cursor-pointer transition border border-slate-100"
          >
            <div className="text-[11px] font-bold text-slate-700">김일호</div>
            <div className="text-base font-extrabold text-teal-600">{kimCount}</div>
          </div>
          <div 
            onClick={() => onFilterClick && onFilterClick('권병학')}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 cursor-pointer transition border border-slate-100"
          >
            <div className="text-[11px] font-bold text-slate-700">권병학</div>
            <div className="text-base font-extrabold text-blue-600">{kwonCount}</div>
          </div>
          <div 
            onClick={() => onFilterClick && onFilterClick('조현호')}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 cursor-pointer transition border border-slate-100"
          >
            <div className="text-[11px] font-bold text-slate-700">조현호</div>
            <div className="text-base font-extrabold text-purple-600">{choCount}</div>
          </div>
          <div 
            onClick={() => onFilterClick && onFilterClick('unassigned')}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 cursor-pointer transition border border-slate-100"
          >
            <div className="text-[11px] font-bold text-slate-400">미배정</div>
            <div className="text-base font-extrabold text-amber-600">{unassignedCount}</div>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 mt-2 text-right">
          클릭 시 해당 담당자 업무 즉시 필터
        </div>
      </div>

    </div>
  );
}
