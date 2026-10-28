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
  selectedBudget = '',
  onBudgetChange,
  selectedDepartment = '남양주체육문화센터',
  budgets = {},
  allBudgets = {},
  onSaveBudgets,
  onSaveDepartmentBudget,
  budgetCategories = ['수선유지비'],
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  managers = ['김일호', '권병학', '조현호'],
  onOpenDeptManagersModal
}) {
  const totalCount = tasks.length;
  
  // State: selected budget item for Card 2 (예산금액) & Card 3 (집행예정 및 잔여예산) - NO 'ALL' (전체예산 합계 없음)
  const [selectedBudgetItem, setSelectedBudgetItem] = useState(() => {
    return selectedBudget || budgetCategories[0] || '수선유지비';
  });
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [inlineValue, setInlineValue] = useState('');

  // Sync selected budget item if department, categories, or selectedBudget changes
  React.useEffect(() => {
    if (selectedBudget && budgetCategories.includes(selectedBudget)) {
      setSelectedBudgetItem(selectedBudget);
    } else if (!budgetCategories.includes(selectedBudgetItem)) {
      setSelectedBudgetItem(budgetCategories[0] || '수선유지비');
    }
  }, [selectedBudget, budgetCategories, selectedBudgetItem]);

  // Card 2: Allocated budget calculation strictly for selectedBudgetItem
  const allocatedBudget = Number(budgets?.[selectedBudgetItem]) || 0;

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

  // Card 3: Tasks relevant strictly to selected budget item in this department
  const relevantTasks = tasks.filter(t => t.budget === selectedBudgetItem);

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
  const inProgressCount = tasks.filter((t) => t.status === '진행' || t.status === '공사진행').length;
  const designCount = tasks.filter((t) => t.status === '설계').length;
  const reviewCount = tasks.filter((t) => t.status === '검토').length;
  const uncompletedCount = tasks.filter((t) => t.status !== '완료').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Manager workload (Card 4: 담당자 업무 현황) for this department
  const activeManagers = Array.isArray(managers) && managers.length > 0
    ? managers
    : ['김일호', '권병학', '조현호'];
  const unassignedCount = tasks.filter((t) => !t.manager || !activeManagers.includes(t.manager)).length;
  const managerColors = [
    { text: 'text-teal-600', hover: 'hover:bg-teal-50' },
    { text: 'text-blue-600', hover: 'hover:bg-blue-50' },
    { text: 'text-purple-600', hover: 'hover:bg-purple-50' },
    { text: 'text-indigo-600', hover: 'hover:bg-indigo-50' },
    { text: 'text-emerald-600', hover: 'hover:bg-emerald-50' },
    { text: 'text-amber-600', hover: 'hover:bg-amber-50' }
  ];

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
        ...(budgets && typeof budgets === 'object' ? budgets : {}),
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
              <span>미완료 ({uncompletedCount}건)</span>
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
                style={{ width: `${totalCount > 0 ? Math.round((inProgressCount / totalCount) * 100) : 0}%` }}
                title={`공사진행 ${inProgressCount}건`}
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

            {/* 예산종목 선택 (부서별 과목, 전체예산 합계 없음) */}
            <div className="flex items-center gap-1">
              {budgetCategories.length > 1 ? (
                <select
                  value={selectedBudgetItem}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    setSelectedBudgetItem(newVal);
                    setIsInlineEditing(false);
                    if (onBudgetChange) {
                      onBudgetChange(newVal);
                    }
                  }}
                  className="text-[11px] font-bold bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  title="조회할 예산종목을 선택하세요 (하단 스프레드시트 행 필터 즉시 연동)"
                >
                  {budgetCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onBudgetChange) {
                      const target = selectedBudget === selectedBudgetItem ? '' : selectedBudgetItem;
                      onBudgetChange(target);
                    }
                  }}
                  className={`text-[11px] font-black border rounded-lg px-2.5 py-1 shadow-2xs cursor-pointer transition ${
                    selectedBudget === selectedBudgetItem
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                  }`}
                  title={`클릭 시 하단 스프레드시트 행 필터 [${selectedBudgetItem}] 선택/해제`}
                >
                  {selectedBudgetItem}
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(true)}
                title="부서 예산금액 직접 입력 및 관리 설정"
                className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center transition shadow-2xs cursor-pointer"
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
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline ml-0.5 cursor-pointer"
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
                className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs cursor-pointer"
                title="저장"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsInlineEditing(false)}
                className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-xs cursor-pointer"
                title="취소"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{selectedBudgetItem} 배정액:</span>
            <span className="font-semibold text-slate-700">{formatCurrency(allocatedBudget)}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            * [{selectedDepartment}] {selectedBudgetItem} 배정액 (직접 금액 입력 가능)
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
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                담당자 업무 현황
              </span>
              {onOpenDeptManagersModal && (
                <button
                  onClick={onOpenDeptManagersModal}
                  className="p-1 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition"
                  title="부서 담당자 관리 (추가/수정/삭제)"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>
            <div
              onClick={onOpenDeptManagersModal}
              className={`w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center ${
                onOpenDeptManagersModal ? 'cursor-pointer hover:bg-purple-100 transition' : ''
              }`}
              title="부서 담당자 관리"
            >
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div
            className="grid gap-1 text-center mt-1"
            style={{ gridTemplateColumns: `repeat(${Math.min(activeManagers.length + 1, 6)}, minmax(0, 1fr))` }}
          >
            {activeManagers.map((managerName, idx) => {
              const count = tasks.filter((t) => t.manager === managerName).length;
              const colorObj = managerColors[idx % managerColors.length];
              return (
                <div
                  key={managerName}
                  onClick={() => onFilterClick && onFilterClick(managerName)}
                  className={`p-1.5 rounded-lg bg-slate-50 ${colorObj.hover} cursor-pointer transition border border-slate-100`}
                  title={`${managerName} 담당 공사 필터링`}
                >
                  <div className="text-[11px] font-bold text-slate-700 truncate">{managerName}</div>
                  <div className={`text-base font-extrabold ${colorObj.text}`}>{count}</div>
                </div>
              );
            })}

            <div 
              onClick={() => onFilterClick && onFilterClick('unassigned')}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 cursor-pointer transition border border-slate-100"
              title="담당자 미정 공사 필터링"
            >
              <div className="text-[11px] font-bold text-slate-500">미정</div>
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
        budgetCategories={budgetCategories}
        onAddCategory={onAddCategory}
        onRenameCategory={onRenameCategory}
        onDeleteCategory={onDeleteCategory}
      />
    </>
  );
}
