import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Table, 
  Kanban, 
  Building, 
  UserSquare2, 
  X, 
  RotateCcw,
  Sparkles,
  Calendar,
  Plus,
  FileSpreadsheet,
  Building2,
  ChevronDown
} from 'lucide-react';
import { FACILITIES, BUDGET_TYPES, MANAGERS, STATUS_LIST } from '../data/initialTasks';

export default function FilterBar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  selectedFacility,
  onFacilityChange,
  selectedBudget,
  onBudgetChange,
  selectedStatus,
  onStatusChange,
  selectedManager,
  onManagerChange,
  onResetFilters,
  hasActiveFilters,
  currentUser,
  onQuickFilterMyTasks,
  isMyTasksActive,
  isReadOnly = false,
  onNewTask,
  onExportExcel,
  onExportAllExcel,
  budgetCategories = BUDGET_TYPES,
  facilities = [],
  managers = MANAGERS
}) {
  const facilityList = facilities && facilities.length > 0 ? facilities : FACILITIES;
  const activeManagers = managers && managers.length > 0 ? managers : MANAGERS;
  const [isExcelMenuOpen, setIsExcelMenuOpen] = useState(false);
  const excelMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (excelMenuRef.current && !excelMenuRef.current.contains(event.target)) {
        setIsExcelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-6 space-y-3.5 no-print">
      
      {/* Top row: View Modes & Quick Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* View Mode Buttons */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg self-start">
          <button
            onClick={() => onViewModeChange('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              viewMode === 'table'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>표 (스프레드시트)</span>
          </button>

          <button
            onClick={() => onViewModeChange('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              viewMode === 'kanban'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>칸반 보드</span>
          </button>

          <button
            onClick={() => onViewModeChange('facility')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              viewMode === 'facility'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>시설별 보기</span>
          </button>

          <button
            onClick={() => onViewModeChange('staff')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              viewMode === 'staff'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserSquare2 className="w-3.5 h-3.5" />
            <span>담당자별 현황</span>
          </button>

          <button
            onClick={() => onViewModeChange('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
              viewMode === 'calendar'
                ? 'bg-white text-teal-700 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>공사일정 (달력)</span>
          </button>
        </div>

        {/* Quick Fast Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              title="필터 초기화"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>초기화</span>
            </button>
          )}

          {/* Action buttons: Excel & New Task */}
          {onExportExcel && (
            <div className="relative inline-flex items-center rounded-lg shadow-2xs shrink-0" ref={excelMenuRef}>
              {/* Main Button: Directly triggers immediate download */}
              <button
                type="button"
                onClick={onExportExcel}
                title="클릭 시 현재 부서 공사목록을 엑셀(.xlsx)로 즉시 다운로드"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border border-emerald-600 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                <span>엑셀 다운로드</span>
              </button>

              {/* Dropdown Toggle: Options for full master export */}
              {onExportAllExcel && (
                <button
                  type="button"
                  onClick={() => setIsExcelMenuOpen(!isExcelMenuOpen)}
                  title="엑셀 다운로드 추가 옵션 (전체 통합 엑셀 등)"
                  className="px-1.5 py-1.5 rounded-r-lg bg-emerald-700 hover:bg-emerald-800 text-white border-t border-r border-b border-emerald-700 border-l border-emerald-500/50 transition cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-100" />
                </button>
              )}

              {isExcelMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExcelMenuOpen(false);
                      onExportExcel();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-emerald-50 transition flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-emerald-900">현재 부서 공사목록 (.xlsx)</div>
                      <div className="text-[10px] text-slate-400">현재 선택된 부서의 공사 업무 엑셀 파일</div>
                    </div>
                  </button>

                  {onExportAllExcel && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsExcelMenuOpen(false);
                        onExportAllExcel();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-teal-50 transition flex items-center gap-2.5 text-xs text-teal-900 border-t border-slate-100 cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <div>
                        <div className="font-bold text-teal-700">시설본부 전체 통합 엑셀 (.xlsx)</div>
                        <div className="text-[10px] text-slate-400">전 부서 공사 + 시설현황 + 예산 등 4개 시트 통합</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {!isReadOnly && onNewTask && (
            <button
              onClick={onNewTask}
              title="새로운 공사 업무 등록"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ 새 공사 등록</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
