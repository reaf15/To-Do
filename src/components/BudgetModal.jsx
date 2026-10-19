import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { formatCurrency, formatCurrencyShort } from '../utils/formatters';

export default function BudgetModal({
  isOpen,
  onClose,
  budgets = {},
  onSave,
  budgetTypes = ['수선유지비', '시설비', '사무관리비'],
  tasks = []
}) {
  const [formData, setFormData] = useState(() => ({ ...budgets }));
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isOpen) return null;

  // Compute current planned execution cost per budget item
  const getPlannedCostForBudget = (budgetName) => {
    return tasks
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

  const allCategories = Array.from(
    new Set([...budgetTypes, ...Object.keys(formData)])
  ).filter(Boolean);

  const handleAmountChange = (category, value) => {
    // Only numbers
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

  const handleAddNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (!formData[trimmed]) {
      setFormData(prev => ({
        ...prev,
        [trimmed]: 0
      }));
    }
    setNewCategoryName('');
    setIsAddingNew(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const totalAllocated = Object.values(formData).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const totalPlanned = getPlannedCostForBudget(null);
  const totalRemaining = totalAllocated - totalPlanned;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                예산금액 설정 및 관리
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  담당자 직접 입력
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                예산종목별 배정 금액을 입력하고, 집행 예정액 및 잔여 예산을 실시간으로 관리합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Summary Banner */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-medium">총 배정예산 합계:</span>
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

        {/* Modal Body / Items List */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-3">
            {allCategories.map((category) => {
              const amount = Number(formData[category]) || 0;
              const planned = getPlannedCostForBudget(category);
              const remaining = amount - planned;
              const usageRate = amount > 0 ? Math.min(Math.round((planned / amount) * 100), 100) : 0;

              return (
                <div 
                  key={category}
                  className="bg-slate-50 hover:bg-slate-100/80 rounded-xl p-4 border border-slate-200 transition space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        {category}
                      </span>
                      <span className="text-xs font-semibold text-blue-600">
                        {amount > 0 ? formatCurrencyShort(amount) : '0원'}
                      </span>
                    </div>

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

          {/* Add New Category Section */}
          <div className="pt-2 border-t border-slate-200">
            {isAddingNew ? (
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="text"
                  placeholder="새 예산종목명 (예: 자산취득비)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 text-slate-600 hover:text-blue-600 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>새 예산종목 추가하기</span>
              </button>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            <span>저장 시 전 직원 및 중앙 서버에 실시간으로 즉시 반영됩니다.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>예산금액 저장</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
