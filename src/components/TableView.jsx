import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Check, 
  Eye, 
  EyeOff,
  Edit3, 
  Trash2,
  AlertCircle,
  SlidersHorizontal,
  RotateCcw,
  Filter,
  X,
  Search
} from 'lucide-react';
import { formatCurrency, copyToClipboard } from '../utils/formatters';
import { STATUS_COLORS, STATUS_LIST, MANAGERS } from '../data/initialTasks';

// Table Columns Definition
export const TABLE_COLUMNS = [
  { id: 'budget', label: '예산' },
  { id: 'facility', label: '분류' },
  { id: 'location', label: '위치' },
  { id: 'title', label: '공사명', required: true },
  { id: 'estimatedCost', label: '예상비용', align: 'right' },
  { id: 'manager', label: '담당자', align: 'center' },
  { id: 'status', label: '진행상태', align: 'center' },
  { id: 'quoteAmount', label: '견적가', align: 'right' },
  { id: 'contractAmount', label: '계약금액', align: 'right' },
  { id: 'vendor', label: '업체명' },
];

// View Presets
export const VIEW_PRESETS = [
  {
    id: 'all',
    name: '전체 보기',
    description: '모든 열을 표시합니다',
    columns: ['budget', 'facility', 'location', 'title', 'estimatedCost', 'manager', 'status', 'quoteAmount', 'contractAmount', 'vendor']
  },
  {
    id: 'budget_focused',
    name: '💰 예산·비용 중심',
    description: '예산, 견적가, 계약금액 등 재정 정보 중심',
    columns: ['budget', 'title', 'estimatedCost', 'quoteAmount', 'contractAmount', 'status', 'vendor']
  },
  {
    id: 'field_focused',
    name: '👷 현장·업체 중심',
    description: '시설, 위치, 담당자, 시공업체 중심',
    columns: ['facility', 'location', 'title', 'manager', 'status', 'vendor']
  },
  {
    id: 'compact',
    name: '⚡ 간략 요약',
    description: '주요 핵심 정보만 간략히 확인',
    columns: ['location', 'title', 'estimatedCost', 'manager', 'status']
  }
];


// ============================================================================
// Spreadsheet Inline Editable Components (화면에서 바로 클릭하여 직접 수정)
// ============================================================================
function InlineAmountInput({ value, onSave, colorClass = 'text-slate-800', placeholder = '-' }) {
  const [currentVal, setCurrentVal] = useState(
    value !== null && value !== undefined && value !== '' ? String(value) : ''
  );
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setCurrentVal(value !== null && value !== undefined && value !== '' ? String(value) : '');
    }
  }, [value, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    const cleanNum = currentVal.replace(/[^0-9]/g, '');
    const num = cleanNum ? parseInt(cleanNum, 10) : null;
    if (num !== (value ?? null)) {
      onSave(num);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setCurrentVal(value !== null && value !== undefined && value !== '' ? String(value) : '');
      setIsFocused(false);
      e.target.blur();
    }
  };

  // Formatted display: show formatted raw number while focused, formatted with "원" when not focused
  const displayVal = isFocused
    ? (currentVal ? Number(currentVal.replace(/[^0-9]/g, '')).toLocaleString() : '')
    : (value !== null && value !== undefined && value !== '' && Number(value) > 0 
        ? Number(value).toLocaleString() + '원' 
        : '');

  return (
    <div className="flex items-center justify-end w-full" onClick={(e) => e.stopPropagation()}>
      <input
        type="text"
        value={displayVal}
        placeholder={placeholder}
        onFocus={(e) => {
          setIsFocused(true);
          e.target.select();
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, '');
          setCurrentVal(raw);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-28 text-right text-xs font-bold px-2 py-1 rounded-md transition border cursor-pointer focus:cursor-text focus:outline-none ${colorClass} ${
          isFocused 
            ? 'bg-white border-teal-500 ring-2 ring-teal-200 shadow-sm z-10' 
            : 'bg-slate-50/70 hover:bg-white border-slate-200/90 hover:border-teal-400'
        }`}
        title="클릭하여 금액 직접 수정 (Enter 또는 다른 곳 클릭 시 자동 저장)"
      />
    </div>
  );
}

function InlineTextInput({ value, onSave, placeholder = '-', className = '' }) {
  const [currentVal, setCurrentVal] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setCurrentVal(value || '');
    }
  }, [value, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    const trimmed = currentVal.trim();
    if (trimmed !== (value || '')) {
      onSave(trimmed);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setCurrentVal(value || '');
      setIsFocused(false);
      e.target.blur();
    }
  };

  return (
    <div className="flex items-center w-full" onClick={(e) => e.stopPropagation()}>
      <input
        type="text"
        value={currentVal}
        placeholder={placeholder}
        onFocus={(e) => {
          setIsFocused(true);
          e.target.select();
        }}
        onChange={(e) => setCurrentVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full max-w-[140px] text-left text-xs font-semibold px-2 py-1 rounded-md transition border cursor-pointer focus:cursor-text focus:outline-none text-slate-800 ${className} ${
          isFocused 
            ? 'bg-white border-teal-500 ring-2 ring-teal-200 shadow-sm z-10' 
            : 'bg-slate-50/70 hover:bg-white border-slate-200/90 hover:border-teal-400'
        }`}
        title="클릭하여 직접 수정 (Enter 또는 다른 곳 클릭 시 자동 저장)"
      />
    </div>
  );
}

export default function TableView({
  tasks,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onQuickStatusChange,
  onQuickManagerChange,
  onQuickFieldChange,
  managers = MANAGERS,
  facilities = [],
  budgetCategories = []
}) {
  const activeManagers = managers && managers.length > 0 ? managers : MANAGERS;

  const [sortField, setSortField] = useState('id');
  const [sortAsc, setSortAsc] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Column visibility state with localStorage persistence
  const [activePreset, setActivePreset] = useState(() => {
    return localStorage.getItem('nyj_table_preset') || 'all';
  });

  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = localStorage.getItem('nyj_table_visible_columns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return TABLE_COLUMNS.map(c => c.id);
  });

  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
  const [isBudgetColDropdownOpen, setIsBudgetColDropdownOpen] = useState(false);
  const [isStatusColDropdownOpen, setIsStatusColDropdownOpen] = useState(false);

  // Row filters state (budget is single-select, statuses is multi-select)
  const INITIAL_ROW_FILTERS = {
    budget: '',
    statuses: [],
    facility: '',
    location: '',
    title: '',
    costRange: '',
    manager: '',
    quoteState: '',
    contractState: '',
    vendor: '',
  };

  const [rowFilters, setRowFilters] = useState(INITIAL_ROW_FILTERS);
  const [isFilterRowVisible, setIsFilterRowVisible] = useState(true);

  // Unique options extracted dynamically from department budgets, facilities & tasks
  const uniqueBudgets = useMemo(
    () => Array.from(new Set([...(Array.isArray(budgetCategories) ? budgetCategories.filter(Boolean) : []), ...tasks.map(t => t.budget).filter(Boolean)])),
    [budgetCategories, tasks]
  );
  const uniqueFacilities = useMemo(
    () => Array.from(new Set([...(Array.isArray(facilities) ? facilities.filter(Boolean) : []), ...tasks.map(t => t.facility).filter(Boolean)])),
    [facilities, tasks]
  );
  const uniqueManagers = useMemo(() => Array.from(new Set(tasks.map(t => t.manager).filter(Boolean))), [tasks]);

  // Active filter count
  const activeRowFilterCount = useMemo(() => {
    let count = 0;
    if (rowFilters.budget) count++;
    if (Array.isArray(rowFilters.statuses)) count += rowFilters.statuses.length;
    if (rowFilters.facility) count++;
    if (rowFilters.location.trim()) count++;
    if (rowFilters.title.trim()) count++;
    if (rowFilters.costRange) count++;
    if (rowFilters.manager) count++;
    if (rowFilters.quoteState) count++;
    if (rowFilters.contractState) count++;
    if (rowFilters.vendor.trim()) count++;
    return count;
  }, [rowFilters]);

  // Row filtering logic
  const rowFilteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Single-select Budget filter (중복 없이 1개만 선택)
      if (rowFilters.budget && t.budget !== rowFilters.budget) {
        return false;
      }

      // Multi-select Status filter (2개 이상 선택 시 OR 조건으로 매칭)
      if (Array.isArray(rowFilters.statuses) && rowFilters.statuses.length > 0) {
        const taskStatus = t.status || '검토';
        if (!rowFilters.statuses.includes(taskStatus)) return false;
      }

      // Facility filter
      if (rowFilters.facility && t.facility !== rowFilters.facility) return false;

      // Location filter (contains)
      if (rowFilters.location.trim() && !(t.location || '').toLowerCase().includes(rowFilters.location.trim().toLowerCase())) {
        return false;
      }

      // Title filter (contains)
      if (rowFilters.title.trim() && !(t.title || '').toLowerCase().includes(rowFilters.title.trim().toLowerCase())) {
        return false;
      }

      // Estimated Cost Range filter
      if (rowFilters.costRange) {
        const cost = Number(t.estimatedCost) || 0;
        if (rowFilters.costRange === '10m+' && cost < 10000000) return false;
        if (rowFilters.costRange === '5m-10m' && (cost < 5000000 || cost >= 10000000)) return false;
        if (rowFilters.costRange === '5m-' && cost >= 5000000) return false;
      }

      // Manager filter
      if (rowFilters.manager) {
        if (rowFilters.manager === 'unassigned') {
          if (t.manager) return false;
        } else if (t.manager !== rowFilters.manager) {
          return false;
        }
      }

      // Quote State filter
      if (rowFilters.quoteState) {
        const hasQuote = t.quoteAmount !== null && t.quoteAmount !== undefined && t.quoteAmount !== '' && Number(t.quoteAmount) > 0;
        if (rowFilters.quoteState === 'has' && !hasQuote) return false;
        if (rowFilters.quoteState === 'none' && hasQuote) return false;
      }

      // Contract State filter
      if (rowFilters.contractState) {
        const hasContract = t.contractAmount !== null && t.contractAmount !== undefined && t.contractAmount !== '' && Number(t.contractAmount) > 0;
        if (rowFilters.contractState === 'has' && !hasContract) return false;
        if (rowFilters.contractState === 'none' && hasContract) return false;
      }

      // Vendor filter
      if (rowFilters.vendor.trim() && !(t.vendor || '').toLowerCase().includes(rowFilters.vendor.trim().toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [tasks, rowFilters]);

  // Reset all row filters
  const handleResetRowFilters = () => {
    setRowFilters(INITIAL_ROW_FILTERS);
  };

  // Single-select toggle for Budget item (중복 없이 1개만 선택, 재클릭 시 해제)
  const handleToggleBudgetFilter = (budgetItem) => {
    setRowFilters((prev) => ({
      ...prev,
      budget: prev.budget === budgetItem ? '' : budgetItem
    }));
  };

  // Multi-select toggle for Status item
  const handleToggleStatusFilter = (statusItem) => {
    setRowFilters((prev) => {
      const current = Array.isArray(prev.statuses) ? prev.statuses : [];
      const exists = current.includes(statusItem);
      return {
        ...prev,
        statuses: exists ? current.filter((s) => s !== statusItem) : [...current, statusItem]
      };
    });
  };

  // Quick toggle for all unfinished statuses (완료 제외 전체)
  const unfinishedStatuses = useMemo(() => STATUS_LIST.filter((s) => s !== '완료'), []);
  const isAllUnfinishedSelected =
    unfinishedStatuses.length > 0 &&
    unfinishedStatuses.every((s) => (rowFilters.statuses || []).includes(s)) &&
    !(rowFilters.statuses || []).includes('완료');

  const handleToggleAllUnfinished = () => {
    setRowFilters((prev) => ({
      ...prev,
      statuses: isAllUnfinishedSelected ? [] : [...unfinishedStatuses]
    }));
  };

  // Sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedTasks = [...rowFilteredTasks].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'estimatedCost' || sortField === 'quoteAmount' || sortField === 'contractAmount') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else {
      aVal = (aVal || '').toString().toLowerCase();
      bVal = (bVal || '').toString().toLowerCase();
    }

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  // Calculate totals
  const totalCost = sortedTasks.reduce((sum, t) => sum + (Number(t.estimatedCost) || 0), 0);
  const totalQuote = sortedTasks.reduce((sum, t) => sum + (Number(t.quoteAmount) || 0), 0);
  const totalContract = sortedTasks.reduce((sum, t) => sum + (Number(t.contractAmount) || 0), 0);


  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 inline ml-1 opacity-40 group-hover:opacity-100" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-teal-600 inline ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-teal-600 inline ml-1" />
    );
  };

  // View Presets Handler
  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setVisibleColumns(preset.columns);
    localStorage.setItem('nyj_table_preset', preset.id);
    localStorage.setItem('nyj_table_visible_columns', JSON.stringify(preset.columns));
  };

  // Toggle individual column
  const handleToggleColumn = (colId) => {
    if (colId === 'title') return; // 공사명은 필수
    let nextCols;
    if (visibleColumns.includes(colId)) {
      if (visibleColumns.length <= 2) {
        alert('최소 2개 이상의 열이 표시되어야 합니다.');
        return;
      }
      nextCols = visibleColumns.filter(id => id !== colId);
    } else {
      // Maintain defined order
      nextCols = TABLE_COLUMNS.map(c => c.id).filter(id => id === colId || visibleColumns.includes(id));
    }
    setVisibleColumns(nextCols);
    setActivePreset('custom');
    localStorage.setItem('nyj_table_preset', 'custom');
    localStorage.setItem('nyj_table_visible_columns', JSON.stringify(nextCols));
  };

  // Select all columns
  const handleSelectAllColumns = () => {
    const allIds = TABLE_COLUMNS.map(c => c.id);
    setVisibleColumns(allIds);
    setActivePreset('all');
    localStorage.setItem('nyj_table_preset', 'all');
    localStorage.setItem('nyj_table_visible_columns', JSON.stringify(allIds));
  };

  // Reset to default
  const handleResetColumns = () => {
    const defaultCols = VIEW_PRESETS[0].columns;
    setVisibleColumns(defaultCols);
    setActivePreset('all');
    localStorage.setItem('nyj_table_preset', 'all');
    localStorage.setItem('nyj_table_visible_columns', JSON.stringify(defaultCols));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      
      {/* 1. View Style Toolbar & Column Visibility Settings */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: View Mode Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
            보기 방식:
          </span>
          {VIEW_PRESETS.map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                title={preset.description}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  isActive
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
          {activePreset === 'custom' && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
              ✏️ 사용자 지정 ({visibleColumns.length}개 열)
            </span>
          )}
        </div>

        {/* Right: Actions (Row Filter Toggle & Column Picker) */}
        <div className="flex items-center gap-2">
          {/* Row Filter Toggle Button */}
          <button
            onClick={() => setIsFilterRowVisible(!isFilterRowVisible)}
            title="테이블 헤더 아래 각 열의 행별 필터 검색창을 열거나 숨깁니다"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border shadow-xs ${
              isFilterRowVisible
                ? 'bg-teal-50 border-teal-400 text-teal-800'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <Filter className={`w-3.5 h-3.5 ${isFilterRowVisible ? 'text-teal-600' : 'text-slate-500'}`} />
            <span>행 필터 {isFilterRowVisible ? '숨기기' : '검색'}</span>
            {activeRowFilterCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-teal-600 text-white">
                {activeRowFilterCount}
              </span>
            )}
          </button>

          {/* Column Picker Popover */}
          <div className="relative">
            <button
              onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-teal-600" />
              <span>열 표시 설정 ({visibleColumns.length}/{TABLE_COLUMNS.length})</span>
            </button>

            {isColumnPickerOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsColumnPickerOpen(false)} 
                />
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-40 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 font-bold text-slate-800">
                    <span className="flex items-center gap-1">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                      표시할 열 선택
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleSelectAllColumns}
                        className="text-[11px] text-teal-600 hover:underline font-bold"
                      >
                        전체선택
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={handleResetColumns}
                        className="text-[11px] text-slate-500 hover:underline font-semibold"
                      >
                        초기화
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                    {TABLE_COLUMNS.map((col) => {
                      const isChecked = visibleColumns.includes(col.id);
                      const isRequired = col.required;
                      return (
                        <label
                          key={col.id}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer select-none transition ${
                            isChecked ? 'text-slate-900 font-semibold bg-slate-50/50' : 'text-slate-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isRequired}
                            onChange={() => handleToggleColumn(col.id)}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 disabled:opacity-50 cursor-pointer"
                          />
                          <span className="flex-1">{col.label}</span>
                          {isRequired && (
                            <span className="text-[10px] text-slate-400 font-normal">(필수)</span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-center">
                    <span>자동으로 기억됩니다</span>
                    <button
                      onClick={() => setIsColumnPickerOpen(false)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      완료
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* 2. Row Filter Chips (예산 단일 선택 & 진행 다중 선택) */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-col gap-2 text-xs">
        
        {/* Top sub-row: Title, Reset/All button, Budget Chips, and Row Count */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-teal-600" />
              행 필터:
            </span>

            <button
              type="button"
              onClick={handleResetRowFilters}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                activeRowFilterCount === 0
                  ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              전체 ({tasks.length})
            </button>

            <span className="text-slate-300 mx-0.5">|</span>

            {/* Budget Single-Select Chips (중복 없이 1개만 선택) */}
            <span className="text-[11px] font-extrabold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
              💰 예산
            </span>
            {uniqueBudgets.map((b) => {
              const isSelected = rowFilters.budget === b;
              const count = tasks.filter((t) => t.budget === b).length;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleToggleBudgetFilter(b)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                      : 'bg-cyan-50/60 hover:bg-cyan-100 text-cyan-900 border-cyan-200'
                  }`}
                  title={`예산 [${b}] 선택 (클릭 시 선택, 재클릭 시 전체)`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>{b}</span>
                  <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-cyan-700 text-cyan-100' : 'bg-white text-cyan-700'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Row Count & Clear Button */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[11px] text-slate-500 font-medium">
              표시: <strong className="text-teal-700 font-extrabold">{sortedTasks.length}</strong> / {tasks.length}건
            </span>
            {activeRowFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetRowFilters}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                title="모든 행 필터 조건 초기화"
              >
                <RotateCcw className="w-3 h-3" />
                필터 초기화 ({activeRowFilterCount})
              </button>
            )}
          </div>
        </div>

        {/* Second sub-row: Progress/Status Multi-Select Chips (검토, 설계, 진행, 완료) */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
          <span className="text-[11px] font-extrabold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 mr-0.5">
            ⚡ 진행 <span className="text-[10px] font-normal text-indigo-600">(다중선택 가능)</span>
          </span>

          <button
            type="button"
            onClick={handleToggleAllUnfinished}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
              isAllUnfinishedSelected
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
            }`}
            title="완료 제외 모든 미완료(검토, 설계, 진행) 상태 일괄 선택/해제"
          >
            {isAllUnfinishedSelected && <Check className="w-3 h-3 stroke-[3]" />}
            <span>🚨 미완료 전체</span>
            <span className={`text-[10px] px-1 rounded-full ${isAllUnfinishedSelected ? 'bg-amber-700 text-amber-100' : 'bg-white text-amber-700'}`}>
              {tasks.filter((t) => t.status !== '완료').length}
            </span>
          </button>

          {STATUS_LIST.map((s) => {
            const isSelected = (rowFilters.statuses || []).includes(s);
            const count = tasks.filter((t) => (t.status || '검토') === s).length;
            const style = STATUS_COLORS[s] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleToggleStatusFilter(s)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : `${style.bg} ${style.text} ${style.border} hover:opacity-85`
                }`}
                title={`진행상태 [${s}] 필터 추가/해제 (다중 선택 가능)`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{s}</span>
                <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-teal-700 text-teal-100' : 'bg-white/80 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 3. Active Filters Chips (Removable individual tags) */}
      {activeRowFilterCount > 0 && (
        <div className="bg-amber-50/70 border-b border-amber-200/80 px-4 py-1.5 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-amber-900 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-amber-600" />
            적용 조건 ({activeRowFilterCount}개):
          </span>
          {rowFilters.budget && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-900 border border-cyan-300 text-[11px] shadow-2xs">
              예산: <strong>{rowFilters.budget}</strong>
              <button type="button" onClick={() => setRowFilters(p => ({ ...p, budget: '' }))} className="text-cyan-500 hover:text-rose-600 ml-0.5"><X className="w-3 h-3" /></button>
            </span>
          )}
          {(rowFilters.statuses || []).map((s) => (
            <span key={`status-${s}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-900 border border-teal-300 text-[11px] shadow-2xs">
              진행: <strong>{s}</strong>
              <button type="button" onClick={() => handleToggleStatusFilter(s)} className="text-teal-500 hover:text-rose-600 ml-0.5"><X className="w-3 h-3" /></button>
            </span>
          ))}
          {(rowFilters.statuses || []).map((s) => (
            <span key={`status-${s}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-900 border border-teal-300 text-[11px] shadow-2xs">
              진행: <strong>{s}</strong>
              <button type="button" onClick={() => handleToggleStatusFilter(s)} className="text-teal-500 hover:text-rose-600 ml-0.5"><X className="w-3 h-3" /></button>
            </span>
          ))}
          {rowFilters.facility && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-slate-800 border border-amber-300 text-[11px] shadow-2xs">
              분류: <strong>{rowFilters.facility}</strong>
              <button type="button" onClick={() => setRowFilters(p => ({ ...p, facility: '' }))} className="text-slate-400 hover:text-rose-600 ml-0.5"><X className="w-3 h-3" /></button>
            </span>
          )}
          {rowFilters.location.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-slate-800 border border-amber-300 text-[11px] shadow-2xs">
              위치: <strong>"{rowFilters.location}"</strong>
              <button type="button" onClick={() => setRowFilters(p => ({ ...p, location: '' }))} className="text-slate-400 hover:text-rose-600 ml-0.5"><X className="w-3 h-3" /></button>
            </span>
          )}
          {rowFilters.title.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-slate-800 border border-amber-300 text-[11px] shadow-2xs">
              공사명: <strong>"{rowFilters.title}"</strong>
              <button type="button" onClick={() => setRowFilters(p => ({ ...p, title: '' }))} className="text-slate-400 hover:text-rose-600 ml-0.5"><X className="w-3 h-3" /></button>
            </span>
          )}
          {rowFilters.costRange && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-slate-800 border border-amber-300 text-[11px] shadow-2xs">
              금액: <strong>{rowFilters.costRange === '10m+' ? '1,000만원 이상' : rowFilters.costRange === '5m-10m' ? '500만~1,000만원' : '500만원 미만'}</strong>
              <button type="button" onClick={() => setRowFilters(p => ({ ...p, costRange: '' }))} className="text-slate-400 hover:text-rose-600 ml-0.5"><X className="w-3 h-3" /></button>
            </span>
          )}
          {rowFilters.manager && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-slate-800 border border-amber-300 text-[11px] shadow-2xs">
              담당: <strong>{rowFilters.manager === 'unassigned' ? '미정' : rowFilters.manager}</strong>
              <button type="button" onClick={() => setRowFilters(p => ({ ...p, manager: '' }))} className="text-slate-400 hover:text-rose-600 ml-0.5"><X className="w-3 h-3" /></button>
            </span>
          )}
          {rowFilters.quoteState && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-slate-800 border border-amber-300 text-[11px] shadow-2xs">
              견적: <strong>{rowFilters.quoteState === 'has' ? '견적 등록됨' : '견적 미등록'}</strong>
              <button type="button" onClick={() => setRowFilters(p => ({ ...p, quoteState: '' }))} className="text-slate-400 hover:text-rose-600 ml-0.5"><X className="w-3 h-3" /></button>
            </span>
          )}
          {rowFilters.contractState && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-slate-800 border border-amber-300 text-[11px] shadow-2xs">
              계약: <strong>{rowFilters.contractState === 'has' ? '계약 완료' : '미계약'}</strong>
              <button type="button" onClick={() => setRowFilters(p => ({ ...p, contractState: '' }))} className="text-slate-400 hover:text-rose-600 ml-0.5"><X className="w-3 h-3" /></button>
            </span>
          )}
          {rowFilters.vendor.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-slate-800 border border-amber-300 text-[11px] shadow-2xs">
              업체: <strong>"{rowFilters.vendor}"</strong>
              <button type="button" onClick={() => setRowFilters(p => ({ ...p, vendor: '' }))} className="text-slate-400 hover:text-rose-600 ml-0.5"><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">조건에 맞는 공사 업무가 없습니다</h3>
          <p className="text-xs text-slate-400 mt-1">검색어나 상단 필터 조건을 변경해보세요.</p>
        </div>
      ) : (
        /* Table Container with sticky header */
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            
            {/* Header */}
            <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider sticky top-0 z-20 shadow-sm border-b border-slate-200">
              <tr>
                <th scope="col" className="py-3 px-3 w-12 text-center text-slate-400">#</th>

                {visibleColumns.includes('budget') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('budget')}
                    className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    예산 {renderSortIcon('budget')}
                  </th>
                )}

                {visibleColumns.includes('facility') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('facility')}
                    className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    분류 {renderSortIcon('facility')}
                  </th>
                )}

                {visibleColumns.includes('location') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('location')}
                    className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    위치 {renderSortIcon('location')}
                  </th>
                )}

                {visibleColumns.includes('title') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('title')}
                    className="py-3 px-4 cursor-pointer group hover:bg-slate-100 transition min-w-[240px]"
                  >
                    공사명 {renderSortIcon('title')}
                  </th>
                )}

                {visibleColumns.includes('estimatedCost') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('estimatedCost')}
                    className="py-3 px-3 text-right cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    예상비용 {renderSortIcon('estimatedCost')}
                  </th>
                )}

                {visibleColumns.includes('manager') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('manager')}
                    className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap text-center"
                  >
                    담당자 {renderSortIcon('manager')}
                  </th>
                )}

                {visibleColumns.includes('status') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('status')}
                    className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap text-center"
                  >
                    진행 {renderSortIcon('status')}
                  </th>
                )}

                {visibleColumns.includes('quoteAmount') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('quoteAmount')}
                    className="py-3 px-3 text-right cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    견적가 {renderSortIcon('quoteAmount')}
                  </th>
                )}

                {visibleColumns.includes('contractAmount') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('contractAmount')}
                    className="py-3 px-3 text-right cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    계약금액 {renderSortIcon('contractAmount')}
                  </th>
                )}

                {visibleColumns.includes('vendor') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('vendor')}
                    className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    업체명 {renderSortIcon('vendor')}
                  </th>
                )}


                <th scope="col" className="py-3 px-3 text-center whitespace-nowrap w-24">
                  관리
                </th>
              </tr>

              {/* Row 2: Excel-style Column-by-Column Row Filter Inputs */}
              {isFilterRowVisible && (
                <tr className="bg-slate-100/95 border-t border-b border-slate-300 text-slate-700 font-normal">
                  {/* # column */}
                  <th scope="col" className="py-1.5 px-2 text-center">
                    <div className="flex items-center justify-center text-slate-400" title="각 열별 행 필터">
                      <Filter className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                  </th>

                  {/* budget (single-select dropdown: 1개만 선택) */}
                  {visibleColumns.includes('budget') && (
                    <th scope="col" className="py-1.5 px-2 font-normal">
                      <select
                        value={rowFilters.budget}
                        onChange={(e) => setRowFilters({ ...rowFilters, budget: e.target.value })}
                        className={`w-full text-[11px] px-1.5 py-1 rounded border transition font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                          rowFilters.budget ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold' : 'border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <option value="">전체 예산</option>
                        {uniqueBudgets.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </th>
                  )}

                  {/* facility */}
                  {visibleColumns.includes('facility') && (
                    <th scope="col" className="py-1.5 px-2 font-normal">
                      <select
                        value={rowFilters.facility}
                        onChange={(e) => setRowFilters({ ...rowFilters, facility: e.target.value })}
                        className={`w-full text-[11px] px-1.5 py-1 rounded border transition font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                          rowFilters.facility ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold' : 'border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <option value="">전체 분류</option>
                        {uniqueFacilities.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </th>
                  )}

                  {/* location */}
                  {visibleColumns.includes('location') && (
                    <th scope="col" className="py-1.5 px-2 font-normal">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="위치 검색..."
                          value={rowFilters.location}
                          onChange={(e) => setRowFilters({ ...rowFilters, location: e.target.value })}
                          className={`w-full text-[11px] pl-2 pr-5 py-1 rounded border transition font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                            rowFilters.location ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold' : 'border-slate-300 bg-white text-slate-700'
                          }`}
                        />
                        {rowFilters.location && (
                          <button
                            type="button"
                            onClick={() => setRowFilters({ ...rowFilters, location: '' })}
                            className="absolute right-1.5 top-1.5 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </th>
                  )}

                  {/* title */}
                  {visibleColumns.includes('title') && (
                    <th scope="col" className="py-1.5 px-2 font-normal min-w-[200px]">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="공사명 검색..."
                          value={rowFilters.title}
                          onChange={(e) => setRowFilters({ ...rowFilters, title: e.target.value })}
                          className={`w-full text-[11px] pl-2 pr-5 py-1 rounded border transition font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                            rowFilters.title ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold' : 'border-slate-300 bg-white text-slate-700'
                          }`}
                        />
                        {rowFilters.title && (
                          <button
                            type="button"
                            onClick={() => setRowFilters({ ...rowFilters, title: '' })}
                            className="absolute right-1.5 top-1.5 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </th>
                  )}

                  {/* estimatedCost */}
                  {visibleColumns.includes('estimatedCost') && (
                    <th scope="col" className="py-1.5 px-2 font-normal">
                      <select
                        value={rowFilters.costRange}
                        onChange={(e) => setRowFilters({ ...rowFilters, costRange: e.target.value })}
                        className={`w-full text-[11px] px-1.5 py-1 rounded border transition font-medium text-right focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                          rowFilters.costRange ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold' : 'border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <option value="">전체 금액</option>
                        <option value="10m+">1,000만원 이상</option>
                        <option value="5m-10m">500만~1,000만원</option>
                        <option value="5m-">500만원 미만</option>
                      </select>
                    </th>
                  )}

                  {/* manager */}
                  {visibleColumns.includes('manager') && (
                    <th scope="col" className="py-1.5 px-2 font-normal">
                      <select
                        value={rowFilters.manager}
                        onChange={(e) => setRowFilters({ ...rowFilters, manager: e.target.value })}
                        className={`w-full text-[11px] px-1.5 py-1 rounded border transition font-medium text-center focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                          rowFilters.manager ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold' : 'border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <option value="">전체 담당자</option>
                        {uniqueManagers.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                        <option value="unassigned">(미정)</option>
                      </select>
                    </th>
                  )}

                  {/* status (multi-select dropdown) */}
                  {visibleColumns.includes('status') && (
                    <th scope="col" className="py-1.5 px-2 font-normal relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsStatusColDropdownOpen(!isStatusColDropdownOpen);
                          setIsBudgetColDropdownOpen(false);
                        }}
                        className={`w-full text-[11px] px-2 py-1 rounded border transition font-medium flex items-center justify-between gap-1 ${
                          (rowFilters.statuses || []).length > 0
                            ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold'
                            : 'border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <span className="truncate">
                          {(rowFilters.statuses || []).length === 0
                            ? '전체 상태'
                            : (rowFilters.statuses || []).length === 1
                            ? rowFilters.statuses[0]
                            : `진행 ${rowFilters.statuses.length}개`}
                        </span>
                        <span className="text-[9px] text-slate-400">▼</span>
                      </button>

                      {isStatusColDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setIsStatusColDropdownOpen(false)} />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-40 text-xs">
                            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                              <span className="font-bold text-slate-700 text-[11px]">진행상태 다중 선택</span>
                              {(rowFilters.statuses || []).length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setRowFilters(p => ({ ...p, statuses: [] }))}
                                  className="text-[10px] text-rose-600 font-bold hover:underline"
                                >
                                  선택해제
                                </button>
                              )}
                            </div>
                            <div className="space-y-1 max-h-56 overflow-y-auto">
                              {STATUS_LIST.map((s) => {
                                const checked = (rowFilters.statuses || []).includes(s);
                                return (
                                  <label
                                    key={s}
                                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => handleToggleStatusFilter(s)}
                                      className="w-3.5 h-3.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                                    />
                                    <span className={`truncate flex-1 ${checked ? 'font-bold text-teal-900' : 'text-slate-700'}`}>{s}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </th>
                  )}

                  {/* quoteAmount */}
                  {visibleColumns.includes('quoteAmount') && (
                    <th scope="col" className="py-1.5 px-2 font-normal">
                      <select
                        value={rowFilters.quoteState}
                        onChange={(e) => setRowFilters({ ...rowFilters, quoteState: e.target.value })}
                        className={`w-full text-[11px] px-1.5 py-1 rounded border transition font-medium text-right focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                          rowFilters.quoteState ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold' : 'border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <option value="">전체</option>
                        <option value="has">견적 등록</option>
                        <option value="none">견적 미등록</option>
                      </select>
                    </th>
                  )}

                  {/* contractAmount */}
                  {visibleColumns.includes('contractAmount') && (
                    <th scope="col" className="py-1.5 px-2 font-normal">
                      <select
                        value={rowFilters.contractState}
                        onChange={(e) => setRowFilters({ ...rowFilters, contractState: e.target.value })}
                        className={`w-full text-[11px] px-1.5 py-1 rounded border transition font-medium text-right focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                          rowFilters.contractState ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold' : 'border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <option value="">전체</option>
                        <option value="has">계약 완료</option>
                        <option value="none">미계약</option>
                      </select>
                    </th>
                  )}

                  {/* vendor */}
                  {visibleColumns.includes('vendor') && (
                    <th scope="col" className="py-1.5 px-2 font-normal">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="업체명..."
                          value={rowFilters.vendor}
                          onChange={(e) => setRowFilters({ ...rowFilters, vendor: e.target.value })}
                          className={`w-full text-[11px] pl-2 pr-5 py-1 rounded border transition font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                            rowFilters.vendor ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold' : 'border-slate-300 bg-white text-slate-700'
                          }`}
                        />
                        {rowFilters.vendor && (
                          <button
                            type="button"
                            onClick={() => setRowFilters({ ...rowFilters, vendor: '' })}
                            className="absolute right-1.5 top-1.5 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </th>
                  )}


                  {/* actions */}
                  <th scope="col" className="py-1.5 px-2 text-center font-normal">
                    {activeRowFilterCount > 0 ? (
                      <button
                        type="button"
                        onClick={handleResetRowFilters}
                        title="모든 행 필터 초기화"
                        className="w-full py-1 text-[11px] font-bold text-rose-600 hover:text-white bg-white hover:bg-rose-600 rounded border border-rose-300 transition"
                      >
                        초기화
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">필터</span>
                    )}
                  </th>
                </tr>
              )}
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-slate-100 text-xs">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="py-14 px-4 text-center bg-white">
                    <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-80" />
                    <h3 className="text-sm font-bold text-slate-800">설정한 행 필터 조건에 일치하는 공사가 없습니다</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-3">각 열의 필터 조건 또는 검색어를 변경해보세요.</p>
                    <button
                      type="button"
                      onClick={handleResetRowFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      모든 행 필터 초기화
                    </button>
                  </td>
                </tr>
              ) : (
                sortedTasks.map((t, index) => {
                const statusStyle = STATUS_COLORS[t.status] || {
                  bg: 'bg-slate-50',
                  text: 'text-slate-700',
                  border: 'border-slate-200',
                  dot: 'bg-slate-400'
                };

                return (
                  <tr 
                    key={t.id}
                    className="hover:bg-teal-50/30 transition group border-b border-slate-100"
                  >
                    {/* Number */}
                    <td className="py-2 px-3 text-center text-slate-400 font-medium">
                      {index + 1}
                    </td>

                    {/* Budget (Inline dropdown) */}
                    {visibleColumns.includes('budget') && (
                      <td className="py-1.5 px-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={t.budget || ''}
                          onChange={(e) => onQuickFieldChange && onQuickFieldChange(t.id, 'budget', e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-md border focus:outline-none transition cursor-pointer shadow-2xs ${
                            t.budget === '수선유지비' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300' 
                              : t.budget === '시설비' || (t.budget && t.budget.includes('시설비'))
                              ? 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300'
                              : t.budget === '운영경비' || t.budget === '일상경비'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300'
                          }`}
                          title="예산 과목 직접 변경"
                        >
                          {uniqueBudgets.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </td>
                    )}

                    {/* Facility (Inline dropdown) */}
                    {visibleColumns.includes('facility') && (
                      <td className="py-1.5 px-2 font-semibold text-slate-800 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {uniqueFacilities.length > 0 ? (
                          <select
                            value={t.facility || ''}
                            onChange={(e) => onQuickFieldChange && onQuickFieldChange(t.id, 'facility', e.target.value)}
                            className="text-[11px] font-bold px-2 py-1 rounded-md border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-2xs text-slate-800"
                            title="시설 분류 직접 변경"
                          >
                            <option value="">- 미지정 -</option>
                            {uniqueFacilities.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        ) : (
                          t.facility
                        )}
                      </td>
                    )}

                    {/* Location (Inline directly editable text input) */}
                    {visibleColumns.includes('location') && (
                      <td className="py-1.5 px-2 text-slate-600 whitespace-nowrap">
                        <InlineTextInput
                          value={t.location}
                          onSave={(newVal) => onQuickFieldChange && onQuickFieldChange(t.id, 'location', newVal)}
                          placeholder="위치 입력"
                        />
                      </td>
                    )}

                    {/* Work Title */}
                    {visibleColumns.includes('title') && (
                      <td className="py-2 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span 
                            onClick={() => onEditTask && onEditTask(t)}
                            className="cursor-pointer hover:text-teal-700 hover:underline transition"
                            title="클릭: 상세 정보 우측 슬라이드 열기"
                          >
                            {t.title}
                          </span>
                          {t.photos && t.photos.length > 0 && (
                            <span 
                              onClick={() => onEditTask && onEditTask(t)}
                              className="text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 px-1 rounded font-bold shrink-0 cursor-pointer transition" 
                              title={`현장 사진 ${t.photos.length}장 첨부됨 (클릭: 확인)`}
                            >
                              📷{t.photos.length}
                            </span>
                          )}
                          {t.logs && t.logs.length > 0 && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded font-normal shrink-0" title={`${t.logs.length}개 업무 일지 있음`}>
                              💬{t.logs.length}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Estimated Cost (Inline directly editable amount input) */}
                    {visibleColumns.includes('estimatedCost') && (
                      <td className="py-1.5 px-2 text-right whitespace-nowrap">
                        <InlineAmountInput
                          value={t.estimatedCost}
                          onSave={(num) => onQuickFieldChange && onQuickFieldChange(t.id, 'estimatedCost', num)}
                          colorClass="text-slate-800"
                          placeholder="-"
                        />
                      </td>
                    )}

                    {/* Manager (Inline change dropdown) */}
                    {visibleColumns.includes('manager') && (
                      <td className="py-1.5 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={t.manager || ''}
                          onChange={(e) => onQuickManagerChange(t.id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded border focus:outline-none transition cursor-pointer shadow-2xs ${
                            !t.manager
                              ? 'bg-slate-50 text-slate-400 border-slate-200'
                              : activeManagers.indexOf(t.manager) === 0
                              ? 'bg-teal-50 text-teal-700 border-teal-200 hover:border-teal-300'
                              : activeManagers.indexOf(t.manager) === 1
                              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300'
                              : activeManagers.indexOf(t.manager) === 2
                              ? 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-300'
                          }`}
                        >
                          <option value="">미정</option>
                          {Array.from(new Set([...activeManagers, ...(t.manager ? [t.manager] : [])])).map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </td>
                    )}

                    {/* Status (Inline change dropdown) */}
                    {visibleColumns.includes('status') && (
                      <td className="py-1.5 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={t.status || '검토'}
                          onChange={(e) => onQuickStatusChange(t.id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded border focus:outline-none transition cursor-pointer shadow-2xs ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {STATUS_LIST.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    )}

                    {/* Quoted Amount (Inline directly editable amount input) */}
                    {visibleColumns.includes('quoteAmount') && (
                      <td className="py-1.5 px-2 text-right whitespace-nowrap">
                        <InlineAmountInput
                          value={t.quoteAmount}
                          onSave={(num) => onQuickFieldChange && onQuickFieldChange(t.id, 'quoteAmount', num)}
                          colorClass="text-indigo-700"
                          placeholder="-"
                        />
                      </td>
                    )}

                    {/* Contract Amount (Inline directly editable amount input) */}
                    {visibleColumns.includes('contractAmount') && (
                      <td className="py-1.5 px-2 text-right whitespace-nowrap">
                        <InlineAmountInput
                          value={t.contractAmount}
                          onSave={(num) => onQuickFieldChange && onQuickFieldChange(t.id, 'contractAmount', num)}
                          colorClass="text-emerald-700 font-extrabold"
                          placeholder="-"
                        />
                      </td>
                    )}

                    {/* Contractor / Vendor (Inline directly editable text input) */}
                    {visibleColumns.includes('vendor') && (
                      <td className="py-1.5 px-2 whitespace-nowrap">
                        <InlineTextInput
                          value={t.vendor}
                          onSave={(newVal) => onQuickFieldChange && onQuickFieldChange(t.id, 'vendor', newVal)}
                          placeholder="업체명 입력"
                        />
                      </td>
                    )}

                    {/* Action buttons */}
                    <td className="py-1.5 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditTask(t)}
                          title="공사 정보 상세 수정"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(t.id, t.title)}
                          title="삭제"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              }))}
            </tbody>

            {/* Table Footer with Summary Row dynamically matching visible columns */}
            <tfoot className="bg-slate-100 font-extrabold text-xs text-slate-900 border-t-2 border-slate-300 sticky bottom-0 z-10 shadow-inner">
              <tr>
                <td className="py-3 px-3 text-center text-slate-600 font-bold">
                  합계
                </td>

                {visibleColumns.includes('budget') && (
                  <td className="py-3 px-3 text-slate-400 text-center font-normal">-</td>
                )}

                {visibleColumns.includes('facility') && (
                  <td className="py-3 px-3 text-slate-400 text-center font-normal">-</td>
                )}

                {visibleColumns.includes('location') && (
                  <td className="py-3 px-3 text-slate-400 text-center font-normal">-</td>
                )}

                {visibleColumns.includes('title') && (
                  <td className="py-3 px-4 text-slate-800 font-bold">
                    총 {sortedTasks.length}건
                  </td>
                )}

                {visibleColumns.includes('estimatedCost') && (
                  <td className="py-3 px-3 text-right text-slate-900 font-black text-sm whitespace-nowrap">
                    {formatCurrency(totalCost)}
                  </td>
                )}

                {visibleColumns.includes('manager') && (
                  <td className="py-3 px-3 text-center text-slate-400 font-normal">-</td>
                )}

                {visibleColumns.includes('status') && (
                  <td className="py-3 px-3 text-center text-slate-400 font-normal">-</td>
                )}

                {visibleColumns.includes('quoteAmount') && (
                  <td className="py-3 px-3 text-right text-indigo-700 font-black text-sm whitespace-nowrap">
                    {formatCurrency(totalQuote)}
                  </td>
                )}

                {visibleColumns.includes('contractAmount') && (
                  <td className="py-3 px-3 text-right text-emerald-700 font-black text-sm whitespace-nowrap">
                    {totalContract > 0 ? formatCurrency(totalContract) : '-'}
                  </td>
                )}

                {visibleColumns.includes('vendor') && (
                  <td className="py-3 px-3 text-slate-400 font-normal">-</td>
                )}

                {visibleColumns.includes('contact') && (
                  <td className="py-3 px-3 text-slate-400 font-normal">-</td>
                )}

                {/* Actions column */}
                <td className="py-3 px-2 text-center text-slate-400 font-normal">-</td>
              </tr>
            </tfoot>

          </table>
        </div>
      )}

      {/* Table bottom bar note */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span>💡 [보기 방식] 또는 [열 표시 설정]으로 열을 조정하고, [행 필터]와 각 열의 검색창으로 원하는 데이터 행만 빠르게 필터링할 수 있습니다.</span>
        <span>정렬: 각 컬럼 헤더 클릭</span>
      </div>

    </div>
  );
}
