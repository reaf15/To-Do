import React, { useState } from 'react';
import { 
  Briefcase, 
  Coins, 
  FileCheck2, 
  Users, 
  Pencil, 
  Check, 
  X,
  RotateCcw,
  Activity
} from 'lucide-react';
import { formatCurrency, formatCurrencyShort } from '../utils/formatters';
import BudgetModal from './BudgetModal';

export default function StatsCards({ 
  tasks = [], 
  allTasks = [],
  onFilterClick,
  onStatusFilterClick,
  selectedStatus = '',
  selectedDepartment = '남양주체육문화센터',
  budgets = {
    '수선유지비': 200000000,
    '시설비': 50000000
  },
  allBudgets = {},
  onSaveBudgets,
  onSaveDepartmentBudget
}) {
  const totalCount = tasks.length;
  
  // State: selected budget item for Card 2 (예산금액) & Card 3 (집행예정 및 잔여예산)
  const [selectedBudgetItem, setSelectedBudgetItem] = useState('ALL');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [inlineValue, setInlineValue] = useState('');

  // Fixed budget categories: strictly 수선유지비 and 시설비
  const allCategories = ['수선유지비', '시설비'];

  // Card 2: Allocated budget calculation for this department
  const allocatedBudget = selectedBudgetItem === 'ALL'
    ? ((Number(budgets?.['수선유지비']) || 0) + (Number(budgets?.['시설비']) || 0))
    : (Number(budgets?.[selectedBudgetItem]) || 0);

  // Helper: calculate planned cost per task with 3-tier priority (1.계약금액 > 2.견적가 > 3.예상비용)
  const getTaskPlannedCost = (t) => {
    const contract = Number(t.contractAmount) || 0;
    if (contract > 0) return { amount: contract, type: 'contract' };

    const quote = Number(t.quoteAmount) || 0;
    if (quote > 0) return { amount: quote, type: 'quote' };

    const estimated = Number(t.estimatedCost) || 0;
    if (estimated > 0) return { amount: estimated, type: 'estimated' };

    return { amount: 0, type: 'none' };
  };

  // Card 3: Tasks relevant to selected budget item in this department
  const relevantTasks = selectedBudgetItem === 'ALL'
    ? tasks
    : tasks.filter(t => t.budget === selectedBudgetItem);

  let contractAppliedCount = 0;
  let quoteAppliedCount = 0;
  let estimatedAppliedCount = 0;

  const plannedExecutionCost = relevantTasks.reduce((sum, t) => {
    const res = getTaskPlannedCost(t);
    if (res.type === 'contract') contractAppliedCount++;
    else if (res.type === 'quote') quoteAppliedCount++;
    else if (res.type === 'estimated') estimatedAppliedCount++;
    return sum + res.amount;
  }, 0);

  const plannedCount = contractAppliedCount + quoteAppliedCount + estimatedAppliedCount;
  const remainingBudget = allocatedBudget - plannedExecutionCost;
  const burnRate = allocatedBudget > 0 ? Math.min(Math.round((plannedExecutionCost / allocatedBudget) * 100), 100) : 0;
  const exactRate = allocatedBudget > 0 ? ((plannedExecutionCost / allocatedBudget) * 100).toFixed(1) : '0.0';

  // Status counts (Card 1) for this department
  const completedCount = tasks.filter((t) => t.status === '완료').length;
  const quoteCount = tasks.filter((t) => t.status === '견적의뢰').length;
  const visitCount = tasks.filter((t) => t.status === '견적방문').length;
  const inProgressCount = tasks.filter((t) => t.status !== '완료').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Manager workload (Card 4: 담당자 업무 현황) for this department
  const kimCount = tasks.filter((t) => t.manager === '김일호').length;
  const kwonCount = tasks.filter((t) => t.manager === '권병학').length;
  const choCount = tasks.filter((t) => t.manager === '조현호').length;
  const unassignedCount = tasks.filter((t) => !t.manager).length;

  // Handle inline quick amount edit on Card 2
  const handleStartInlineEdit = () => {
    if (selectedBudgetItem === 'ALL') {
      setIsBudgetModalOpen(true);
      return;
    }
    setInlineValue(String(allocatedBudget || ''));
    setIsInlineEditing(true);
  };

  const handleSaveInlineEdit = () => {
    const num = parseInt(inlineValue.replace(/[^0-9]/g, ''), 10) || 0;
    if (selectedBudgetItem !== 'ALL') {
      const updated = {
        '수선유지비': Number(budgets?.['수선유지비']) || 0,
        '시설비': Number(budgets?.['시설비']) || 0,
        [selectedBudgetItem]: num
      };
      if (onSaveDepartmentBudget) {
        onSaveDepartmentBudget(updated, selectedDepartment);
      } else if (onSaveBudgets) {
        onSaveBudgets(updated, selectedDepartment);
      }
    }
    setIsInlineEditing(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        
        {/* ======================================================== */}
        {/* 1. 총 업무 및 진행률 (선택 부서 기준) */}
        {/* ======================================================== */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>공사·수선 현황</span>
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              {selectedDepartment}
            </span>
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
              <span>진행 중 ({inProgressCount}건)</span>
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
                style={{ width: `${totalCount > 0 ? Math.round(((quoteCount + visitCount) / totalCount) * 100) : 0}%` }}
                title={`견적단계 ${quoteCount + visitCount}건`}
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. 예산금액 (부서별 시설비·수선유지비 개별 배정액 및 직접 입력) */}
        {/* ======================================================== */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                예산금액
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {selectedDepartment}
              </span>
            </div>

            {/* 예산종목 선택 드롭다운 (오직 전체, 수선유지비, 시설비만 표시!) */}
            <div className="flex items-center gap-1">
              <select
                value={selectedBudgetItem}
                onChange={(e) => {
                  setSelectedBudgetItem(e.target.value);
                  setIsInlineEditing(false);
                }}
                className="text-[11px] font-bold bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                title="조회할 예산종목을 선택하세요"
              >
                <option value="ALL">전체 예산 (합계)</option>
                <option value="수선유지비">수선유지비</option>
                <option value="시설비">시설비</option>
              </select>

              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(true)}
                title="부서 예산금액 직접 입력 및 관리 설정"
                className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center transition shadow-2xs"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Amount Display or Inline Input */}
          {!isInlineEditing ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                {formatCurrencyShort(allocatedBudget)}
              </span>
              <button
                type="button"
                onClick={handleStartInlineEdit}
                title="클릭하여 예산금액을 직접 입력합니다"
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline ml-0.5"
              >
                [금액입력]
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 my-1">
              <input
                type="text"
                value={inlineValue ? Number(inlineValue).toLocaleString() : ''}
                onChange={(e) => setInlineValue(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="예산금액 입력"
                className="w-32 px-2 py-1 text-xs font-black text-right border border-blue-500 rounded-lg bg-white focus:outline-none"
                autoFocus
              />
              <span className="text-xs text-slate-500 font-bold">원</span>
              <button
                type="button"
                onClick={handleSaveInlineEdit}
                className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs"
                title="저장"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsInlineEditing(false)}
                className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-xs"
                title="취소"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>배정액 합계:</span>
            <span className="font-semibold text-slate-700">{formatCurrency(allocatedBudget)}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            * [{selectedDepartment}] {selectedBudgetItem === 'ALL' ? '수선유지비 + 시설비 배정총액' : `${selectedBudgetItem} 배정액`} (담당자 직접 입력)
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. 집행예정금액 및 잔여예산 (선택 부서 실시간 연동) */}
        {/* ======================================================== */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                집행예정 및 잔여예산
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {selectedDepartment}
              </span>
            </div>
            <span 
              className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200"
              title="현재 선택된 예산종목 기준 집계"
            >
              {selectedBudgetItem === 'ALL' ? '전체 종목' : selectedBudgetItem}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
              {formatCurrencyShort(plannedExecutionCost)}
            </span>
            <span className="text-xs font-medium text-slate-400">
              ({plannedCount}건 반영)
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="font-bold">잔여 예산:</span>
            <span className={`font-black text-sm ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(remainingBudget)}
              {remainingBudget < 0 && <span className="text-[10px] ml-1 text-rose-500">(초과)</span>}
            </span>
          </div>

          {/* Budget execution burn rate progress bar */}
          <div className="mt-1.5 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>집행 소진율 ({exactRate}%)</span>
              <span className={remainingBudget >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                {remainingBudget >= 0 ? `${formatCurrencyShort(remainingBudget)} 잔여` : '예산 초과'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  burnRate > 90 ? 'bg-rose-500' : burnRate > 75 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${burnRate}%` }}
                title={`집행률 ${exactRate}%`}
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-400 mt-1 truncate" title={`1.계약(${contractAppliedCount}건) > 2.견적(${quoteAppliedCount}건) > 3.예상(${estimatedAppliedCount}건) 우선 적용`}>
            * 1.계약({contractAppliedCount}) &gt; 2.견적({quoteAppliedCount}) &gt; 3.예상({estimatedAppliedCount}) 적용
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. 담당자 업무 현황 (선택 부서 실시간 연동) */}
        {/* ======================================================== */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              담당자 업무 현황
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 text-center mt-1">
            <div 
              onClick={() => onFilterClick && onFilterClick('김일호')}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 cursor-pointer transition border border-slate-100"
              title="김일호 담당 공사 필터링"
            >
              <div className="text-[11px] font-bold text-slate-700">김일호</div>
              <div className="text-base font-extrabold text-teal-600">{kimCount}</div>
            </div>

            <div 
              onClick={() => onFilterClick && onFilterClick('권병학')}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 cursor-pointer transition border border-slate-100"
              title="권병학 담당 공사 필터링"
            >
              <div className="text-[11px] font-bold text-slate-700">권병학</div>
              <div className="text-base font-extrabold text-blue-600">{kwonCount}</div>
            </div>

            <div 
              onClick={() => onFilterClick && onFilterClick('조현호')}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 cursor-pointer transition border border-slate-100"
              title="조현호 담당 공사 필터링"
            >
              <div className="text-[11px] font-bold text-slate-700">조현호</div>
              <div className="text-base font-extrabold text-purple-600">{choCount}</div>
            </div>

            <div 
              onClick={() => onFilterClick && onFilterClick('unassigned')}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 cursor-pointer transition border border-slate-100"
              title="미배정 공사 필터링"
            >
              <div className="text-[11px] font-bold text-slate-500">미배정</div>
              <div className="text-base font-extrabold text-slate-400">{unassignedCount}</div>
            </div>
          </div>

          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>담당 지정률:</span>
            <span className="font-semibold text-slate-700">
              {totalCount > 0 ? Math.round(((totalCount - unassignedCount) / totalCount) * 100) : 0}%
            </span>
          </div>
        </div>

      </div>

      {/* Budget Management Modal with Department Selector */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentDepartment={selectedDepartment}
        budgets={budgets}
        allBudgets={allBudgets}
        onSave={(newBudgets, targetDept) => {
          if (onSaveDepartmentBudget) {
            onSaveDepartmentBudget(newBudgets, targetDept || selectedDepartment);
          } else if (onSaveBudgets) {
            onSaveBudgets(newBudgets, targetDept || selectedDepartment);
          }
        }}
        tasks={allTasks && allTasks.length > 0 ? allTasks : tasks}
      />
    </>
  );
}
