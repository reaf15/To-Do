import React, { useState, useEffect } from 'react';
import { 
  X, 
  Coins, 
  Save, 
  CheckCircle2, 
  RotateCcw,
  Building2,
  Plus,
  Pencil,
  Trash2,
  Check,
  Tag,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatCurrencyShort } from '../utils/formatters';
import { ALL_DEPARTMENTS } from '../data/organizationChart';

export default function BudgetModal({
  isOpen,
  onClose,
  currentDepartment = '남양주체육문화센터',
  budgets = {},
  allBudgets = {},
  onSave,
  tasks = [],
  budgetCategories = ['수선유지비', '시설비', '운영경비'],
  onAddCategory,
  onRenameCategory,
  onDeleteCategory
}) {
  const [targetDepartment, setTargetDepartment] = useState(currentDepartment);
  const [formData, setFormData] = useState({});
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [renameInput, setRenameInput] = useState('');

  // Sync target department when modal opens
  useEffect(() => {
    if (isOpen) {
      setTargetDepartment(currentDepartment);
      setEditingCategory(null);
      setRenameInput('');
      setNewCategoryInput('');
    }
  }, [isOpen, currentDepartment]);

  // Load budgets for targetDepartment and dynamic categories
  useEffect(() => {
    if (!isOpen) return;

    let deptBudget = null;
    if (allBudgets && allBudgets[targetDepartment] && typeof allBudgets[targetDepartment] === 'object') {
      deptBudget = allBudgets[targetDepartment];
    } else if (targetDepartment === currentDepartment && budgets && typeof budgets === 'object') {
      deptBudget = budgets;
    }

    const nextForm = {};
    budgetCategories.forEach(cat => {
      let val = deptBudget?.[cat];
      // Compatibility fallback between 수선유지비 and legacy 일상경비
      if (val === undefined) {
        if (cat === '수선유지비' && deptBudget?.['일상경비'] !== undefined) {
          val = deptBudget['일상경비'];
        } else if (cat === '일상경비' && deptBudget?.['수선유지비'] !== undefined) {
          val = deptBudget['수선유지비'];
        }
      }
      nextForm[cat] = Number(val) || 0;
    });

    setFormData(nextForm);
  }, [isOpen, targetDepartment, allBudgets, currentDepartment, budgets, budgetCategories]);

  if (!isOpen) return null;

  // Filter tasks belonging strictly to targetDepartment
  const departmentTasks = tasks.filter(t => (t.department || '남양주체육문화센터') === targetDepartment);

  // Compute current planned execution cost per budget item (3-tier priority: contract > quote > estimated)
  const getPlannedCostForBudget = (budgetName) => {
    return departmentTasks
      .filter(t => !budgetName || t.budget === budgetName)
      .reduce((sum, t) => {
        const c = Number(t.contractAmount) || 0;
        if (c > 0) return sum + c;
        const q = Number(t.quoteAmount) || 0;
        if (q > 0) return sum + q;
        const e = Number(t.estimatedCost) || 0;
        if (e > 0) return sum + e;
        return sum;
      }, 0);
  };

  const handleAmountChange = (category, value) => {
    const cleanNum = value.replace(/[^0-9]/g, '');
    const num = cleanNum ? parseInt(cleanNum, 10) : 0;
    setFormData(prev => ({
      ...prev,
      [category]: num
    }));
  };

  const handleQuickAdd = (category, amount) => {
    setFormData(prev => ({
      ...prev,
      [category]: (Number(prev[category]) || 0) + amount
    }));
  };

  // Add new budget category
  const handleAddNewCategory = (e) => {
    e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (budgetCategories.includes(trimmed)) {
      alert(`'${trimmed}'은(는) 이미 존재하는 예산과목입니다.`);
      return;
    }
    if (onAddCategory) {
      onAddCategory(trimmed);
    }
    setFormData(prev => ({
      ...prev,
      [trimmed]: 0
    }));
    setNewCategoryInput('');
  };

  // Start inline rename
  const handleStartRename = (category) => {
    setEditingCategory(category);
    setRenameInput(category);
  };

  // Save inline rename
  const handleSaveRename = (oldName) => {
    const trimmed = renameInput.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingCategory(null);
      return;
    }
    if (budgetCategories.includes(trimmed)) {
      alert(`'${trimmed}'은(는) 이미 존재하는 예산과목명입니다.`);
      return;
    }
    if (onRenameCategory) {
      onRenameCategory(oldName, trimmed);
    }
    setFormData(prev => {
      const next = { ...prev };
      next[trimmed] = next[oldName] || 0;
      delete next[oldName];
      return next;
    });
    setEditingCategory(null);
  };

  // Cancel inline rename
  const handleCancelRename = () => {
    setEditingCategory(null);
    setRenameInput('');
  };

  // Delete category
  const handleDeleteCategory = (category) => {
    if (onDeleteCategory) {
      onDeleteCategory(category);
    }
  };

  // Save current department allocations
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData, targetDepartment);
    }
    onClose();
  };

  const totalAllocated = budgetCategories.reduce((sum, cat) => sum + (Number(formData[cat]) || 0), 0);
  const totalPlanned = getPlannedCostForBudget(null);
  const totalRemaining = totalAllocated - totalPlanned;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 font-bold shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-white">
                  부서별 예산금액 및 과목 관리
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  과목 추가·수정·삭제 지원
                </span>
              </div>
              
              {/* Department Switcher Dropdown */}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  대상 부서:
                </span>
                <select
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value)}
                  className="text-xs font-black bg-slate-800 text-amber-300 border border-slate-700 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-teal-400 focus:outline-none cursor-pointer"
                >
                  {ALL_DEPARTMENTS.map(d => (
                    <option key={d.name} value={d.name} className="bg-slate-900 text-white">
                      {d.name} {d.name === currentDepartment ? '(현재 활성 부서)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Category Top Control Bar */}
        <div className="bg-slate-800/95 border-b border-slate-700 px-6 py-2.5">
          <form onSubmit={handleAddNewCategory} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 shrink-0 font-bold">
              <Tag className="w-3.5 h-3.5 text-teal-400" />
              <span>새 과목 추가:</span>
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                placeholder="새 예산과목명 입력 (예: 일상경비, 소모품비, 재료비)"
                className="w-full text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>
            <button
              type="submit"
              disabled={!newCategoryInput.trim()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700 disabled:text-slate-500 text-white transition shrink-0 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ 과목 추가</span>
            </button>
          </form>
        </div>

        {/* Total Summary Banner for this Department */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-medium">[{targetDepartment}] 총 배정예산:</span>
            <span className="ml-1.5 text-base font-black text-blue-700">
              {formatCurrency(totalAllocated)}
            </span>
            <span className="text-slate-500 ml-1">({formatCurrencyShort(totalAllocated)})</span>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <span className="text-slate-500">집행예정:</span>
              <span className="ml-1 font-bold text-slate-800">{formatCurrency(totalPlanned)}</span>
            </div>
            <div className="border-l border-slate-300 pl-3">
              <span className="text-slate-500">잔여예산:</span>
              <span className={`ml-1 font-black ${totalRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(totalRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body: Dynamic Budget Categories List */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-4">
            {budgetCategories.map((category, index) => {
              const amount = Number(formData[category]) || 0;
              const planned = getPlannedCostForBudget(category);
              const remaining = amount - planned;
              const usageRate = amount > 0 ? Math.min(Math.round((planned / amount) * 100), 100) : 0;
              const isDefault = category === '수선유지비' || index === 0;
              const isEditingThis = editingCategory === category;

              return (
                <div 
                  key={category}
                  className="bg-slate-50 hover:bg-slate-100/90 rounded-xl p-4 border border-slate-200 transition space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {/* Left: Category Badge, Inline Rename, & Delete */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {isEditingThis ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={renameInput}
                            onChange={(e) => setRenameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveRename(category);
                              } else if (e.key === 'Escape') {
                                handleCancelRename();
                              }
                            }}
                            className="px-2 py-0.5 text-xs font-black border border-teal-500 rounded bg-white text-slate-900 focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(category)}
                            title="과목명 저장 (공사목록 일괄 반영)"
                            className="p-1 bg-teal-600 hover:bg-teal-700 text-white rounded transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelRename}
                            title="수정 취소"
                            className="p-1 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1.5">
                            <span>{category}</span>
                            {isDefault && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200">
                                기본
                              </span>
                            )}
                          </span>

                          {/* Rename Button */}
                          <button
                            type="button"
                            onClick={() => handleStartRename(category)}
                            title={`'${category}' 과목명 수정 (공사목록 및 예산 일괄 자동 변경)`}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition border border-transparent hover:border-blue-200"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(category)}
                            title={`'${category}' 과목 삭제`}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <span className="text-xs font-semibold text-blue-600 ml-1">
                            {amount > 0 ? formatCurrencyShort(amount) : '0원'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Planned execution and remaining */}
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>집행예정: <strong className="text-slate-800">{formatCurrency(planned)}</strong></span>
                      <span>
                        잔여: <strong className={remaining >= 0 ? 'text-emerald-700' : 'text-rose-600 font-black'}>
                          {formatCurrency(remaining)}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Input field & Quick Add Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={amount ? amount.toLocaleString() : ''}
                        onChange={(e) => handleAmountChange(category, e.target.value)}
                        placeholder="0"
                        className="w-full text-right font-black text-sm px-3 py-2 pr-8 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                        원
                      </span>
                    </div>

                    {/* Quick Increment Buttons */}
                    <div className="flex items-center gap-1 shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(category, 10000000)}
                        className="px-2 py-1.5 rounded text-[11px] font-bold bg-white hover:bg-blue-50 text-slate-700 border border-slate-300 transition"
                      >
                        +1천만
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(category, 50000000)}
                        className="px-2 py-1.5 rounded text-[11px] font-bold bg-white hover:bg-blue-50 text-slate-700 border border-slate-300 transition"
                      >
                        +5천만
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(category, 100000000)}
                        className="px-2 py-1.5 rounded text-[11px] font-bold bg-white hover:bg-blue-50 text-slate-700 border border-slate-300 transition"
                      >
                        +1억
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, [category]: 0 }))}
                        title="금액 0원으로 초기화"
                        className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {amount > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>집행 소진율 ({usageRate}%)</span>
                        <span>{remaining >= 0 ? `${formatCurrencyShort(remaining)} 남음` : '예산 초과'}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            usageRate > 90 ? 'bg-rose-500' : usageRate > 70 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${usageRate}%` }}
                        />
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>과목명 수정/삭제 시 등록된 공사 목록의 예산과목도 실시간 일괄 반영됩니다.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>[{targetDepartment}] 예산 저장</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
