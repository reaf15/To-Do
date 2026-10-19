import React from 'react';
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
  FileSpreadsheet
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
  onNewTask,
  onExportExcel
}) {
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
          {currentUser !== 'ALL' && (
            <button
              onClick={onQuickFilterMyTasks}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition shrink-0 ${
                isMyTasksActive
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>내 담당 업무만 보기 ({currentUser})</span>
            </button>
          )}

          <button
            onClick={() => onStatusChange(selectedStatus === '견적의뢰' ? '' : '견적의뢰')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition shrink-0 ${
              selectedStatus === '견적의뢰'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            견적의뢰 건
          </button>

          <button
            onClick={() => onStatusChange(selectedStatus === '견적방문' ? '' : '견적방문')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition shrink-0 ${
              selectedStatus === '견적방문'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            견적방문 예정 건
          </button>

          <button
            onClick={() => onManagerChange(selectedManager === 'unassigned' ? '' : 'unassigned')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition shrink-0 ${
              selectedManager === 'unassigned'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            담당자 미정 건
          </button>

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
            <button
              onClick={onExportExcel}
              title="현재 공사 목록 Excel 다운로드"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition shadow-2xs shrink-0 ml-auto md:ml-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>엑셀</span>
            </button>
          )}

          {onNewTask && (
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

      {/* Bottom row: Search & Dropdown Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
        
        {/* Search Input */}
        <div className="relative md:col-span-1 sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="공사명, 위치, 업체명 검색..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Facility Dropdown */}
        <div>
          <select
            value={selectedFacility}
            onChange={(e) => onFacilityChange(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-700"
          >
            <option value="">전체 센터/시설</option>
            {FACILITIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Budget Dropdown */}
        <div>
          <select
            value={selectedBudget}
            onChange={(e) => onBudgetChange(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-700"
          >
            <option value="">전체 예산과목</option>
            {BUDGET_TYPES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-700"
          >
            <option value="">전체 진행상태</option>
            {STATUS_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Manager Dropdown */}
        <div>
          <select
            value={selectedManager}
            onChange={(e) => onManagerChange(e.target.value)}
            className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-700"
          >
            <option value="">전체 담당자</option>
            {MANAGERS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
            <option value="unassigned">담당자 미정</option>
          </select>
        </div>

      </div>

    </div>
  );
}
