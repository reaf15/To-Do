import React, { useState } from 'react';
import { 
  Building2, 
  Train, 
  Sparkles, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Hammer, 
  Database, 
  Table, 
  Kanban, 
  Building, 
  Users, 
  Check,
  Plus,
  FileSpreadsheet,
  UserCheck,
  Calendar
} from 'lucide-react';
import { ORGANIZATION_TREE } from '../data/organizationChart';
import { MANAGERS } from '../data/initialTasks';

export default function OrgDepartmentBar({
  selectedDivision,
  onSelectDivision,
  selectedDepartment,
  onSelectDepartment,
  selectedDbId = 'facility',
  onSelectDbId,
  tasksCount = 0,
  viewMode = 'table',
  onViewModeChange,
  onNewTask,
  onExportExcel,
  currentUser,
  onUserChange,
  myTasksCount = 0
}) {
  // Current active division object based on selectedDepartment
  const currentDiv = ORGANIZATION_TREE.find(div => 
    div.departments.some(d => d.name === selectedDepartment)
  ) || ORGANIZATION_TREE.find(div => div.id === selectedDivision) || ORGANIZATION_TREE[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-5 overflow-hidden select-none">
      
      {/* 1. Top Bar: Current Department Breadcrumb & Persona Selector */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        
        {/* Left: Current Active Department Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-teal-400 border border-slate-700">
            <FolderOpen className="w-3.5 h-3.5" />
            시설본부
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="flex items-center gap-1 text-slate-300 font-bold">
            {currentDiv.name}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-600/30 text-teal-300 font-black border border-teal-500/50 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            {selectedDepartment}
            {selectedDepartment === '남양주체육문화센터' && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 font-bold ml-1">
                본부
              </span>
            )}
          </span>
        </div>

        {/* Right: User Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentUser && onUserChange && (
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400 text-[11px] hidden sm:inline">접속자:</span>
              <select
                value={currentUser}
                onChange={(e) => onUserChange(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer border-none py-0 text-xs"
              >
                <option value="ALL" className="bg-slate-800 text-white">전체 보기 (관리자)</option>
                {MANAGERS.map((m) => (
                  <option key={m} value={m} className="bg-slate-800 text-white">
                    {m} (담당)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

      </div>

      {/* 3. Register Header: Only 시설·공사 관리대장 */}
      <div className="px-4 py-2.5 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Department & Facility Management Register Indicator */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mr-1">
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <strong className="text-slate-800">{selectedDepartment}</strong>:
          </span>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-teal-600 text-white border border-teal-600 shadow-xs">
            <Hammer className="w-3.5 h-3.5" />
            <span>시설·공사 관리대장</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-teal-700 text-white ml-0.5">
              {tasksCount}건
            </span>
          </div>
        </div>

        {/* Right: View Mode Pills & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onViewModeChange && (
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => onViewModeChange('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition ${
                  viewMode === 'table' ? 'bg-white text-teal-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table className="w-3 h-3" />
                <span>표 보기</span>
              </button>
              <button
                onClick={() => onViewModeChange('kanban')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition ${
                  viewMode === 'kanban' ? 'bg-white text-teal-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Kanban className="w-3 h-3" />
                <span>칸반보드</span>
              </button>
              <button
                onClick={() => onViewModeChange('facility')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition ${
                  viewMode === 'facility' ? 'bg-white text-teal-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-3 h-3" />
                <span>시설별</span>
              </button>
              <button
                onClick={() => onViewModeChange('staff')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition ${
                  viewMode === 'staff' ? 'bg-white text-teal-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>담당자별</span>
              </button>
              <button
                onClick={() => onViewModeChange('calendar')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition ${
                  viewMode === 'calendar' ? 'bg-white text-teal-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3 h-3 text-teal-600" />
                <span>공사일정(달력)</span>
              </button>
            </div>
          )}

          {onExportExcel && (
            <button
              onClick={onExportExcel}
              title="현재 공사 목록 Excel 다운로드"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">엑셀</span>
            </button>
          )}

          {onNewTask && (
            <button
              onClick={onNewTask}
              title="새로운 공사 업무 등록"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition active:scale-95"
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
