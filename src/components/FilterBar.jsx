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
  ChevronDown,
  ExternalLink
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
  onSyncNotion,
  isNotionSyncing = false,
  notionDatabaseUrl = 'https://app.notion.com/p/408deafa4bbd81a19467e7df6fdec5d1',
  budgetCategories = BUDGET_TYPES,
  facilities = [],
  managers = MANAGERS
}) {
  const facilityList = facilities && facilities.length > 0 ? facilities : FACILITIES;
  const activeManagers = managers && managers.length > 0 ? managers : MANAGERS;
  const [isExcelMenuOpen, setIsExcelMenuOpen] = useState(false);
  const excelMenuRef = useRef(null);
  const [isNotionMenuOpen, setIsNotionMenuOpen] = useState(false);
  const notionMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (excelMenuRef.current && !excelMenuRef.current.contains(event.target)) {
        setIsExcelMenuOpen(false);
      }
      if (notionMenuRef.current && !notionMenuRef.current.contains(event.target)) {
        setIsNotionMenuOpen(false);
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
            onClick={() => onStatusChange(selectedStatus === '설계' ? '' : '설계')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition shrink-0 ${
              selectedStatus === '설계'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            설계 단계 건
          </button>

          <button
            onClick={() => onStatusChange(selectedStatus === '진행' ? '' : '진행')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition shrink-0 ${
              selectedStatus === '진행'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            공사진행 건
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

          {/* Action Button: Notion Sync */}
          {onSyncNotion && (
            <div className="relative inline-flex items-center rounded-lg shadow-2xs shrink-0" ref={notionMenuRef}>
              <button
                type="button"
                onClick={onSyncNotion}
                disabled={isNotionSyncing}
                title="클릭 시 현재 시설보수 공사 데이터를 노션 [남양주도시공사 시설관리]에 동기화합니다"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white border border-slate-800 transition cursor-pointer disabled:opacity-50"
              >
                {isNotionSyncing ? (
                  <RotateCcw className="w-3.5 h-3.5 text-slate-300 animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.047-.373L18.47 2.015c-.466-.42-1.12-.7-2.008-.653L2.733 2.388c-.513.047-.653.373-.373.653l2.099 1.167zm1.12 3.126v12.78c0 .886.42 1.353 1.306 1.353h12.596c.886 0 1.213-.42 1.213-1.307V7.334c0-.793-.327-1.12-1.12-1.12H6.699c-.793 0-1.12.327-1.12 1.12zm11.895 2.193c.094.42 0 .84-.467.886l-.793.093v7.325c-.466.28-.98.466-1.54.466-.933 0-1.446-.373-2.146-1.213l-4.153-5.225v5.412c.513.093.886.233.886.653 0 .42-.327.42-.746.42l-2.613.14c-.093-.327.094-.653.467-.7l.7-.093V9.757c-.466-.046-.84-.14-1.073-.42-.093-.28 0-.513.42-.56l2.846-.187 4.34 5.365V9.43l-.7-.093c-.42-.047-.606-.233-.56-.606.047-.374.373-.42.793-.42l2.333-.14c.42 0 .56.28.56.7z"/>
                  </svg>
                )}
                <span>{isNotionSyncing ? '동기화 중...' : '노션 동기화'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsNotionMenuOpen(!isNotionMenuOpen)}
                title="노션 옵션 (새 창에서 노션 데이터베이스 열기)"
                className="px-1.5 py-1.5 rounded-r-lg bg-slate-800 hover:bg-slate-700 text-white border-t border-r border-b border-slate-800 border-l border-slate-700 transition cursor-pointer"
              >
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </button>

              {isNotionMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotionMenuOpen(false);
                      onSyncNotion();
                    }}
                    disabled={isNotionSyncing}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 transition flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-700 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">지금 노션으로 동기화</div>
                      <div className="text-[10px] text-slate-400">시설보수 공사 데이터 즉시 동기화</div>
                    </div>
                  </button>

                  <a
                    href={notionDatabaseUrl || "https://app.notion.com/p/408deafa4bbd81a19467e7df6fdec5d1"}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsNotionMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left hover:bg-indigo-50 transition flex items-center gap-2.5 text-xs text-indigo-900 border-t border-slate-100 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-bold text-indigo-700">노션에서 열기 (새 창)</div>
                      <div className="text-[10px] text-slate-400">남양주도시공사 시설관리 데이터베이스</div>
                    </div>
                  </a>
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
            {facilityList.map((f) => (
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
            {budgetCategories.map((b) => (
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
            {activeManagers.map((m) => (
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
