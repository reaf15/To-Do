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
  Check
} from 'lucide-react';
import { ORGANIZATION_TREE } from '../data/organizationChart';

export default function OrgDepartmentBar({
  selectedDivision,
  onSelectDivision,
  selectedDepartment,
  onSelectDepartment,
  selectedDbId = 'facility',
  onSelectDbId,
  tasksCount = 0,
  viewMode = 'table',
  onViewModeChange
}) {
  // Department picker open/close state (기본 숨김, 변경 클릭 시에만 노출 후 선택 시 자동 숨김)
  const [isDeptPickerOpen, setIsDeptPickerOpen] = useState(false);

  // Current active division object based on selectedDepartment
  const currentDiv = ORGANIZATION_TREE.find(div => 
    div.departments.some(d => d.name === selectedDepartment)
  ) || ORGANIZATION_TREE.find(div => div.id === selectedDivision) || ORGANIZATION_TREE[0];

  const handleSelectDept = (divId, deptName) => {
    onSelectDivision(divId);
    onSelectDepartment(deptName);
    setIsDeptPickerOpen(false); // 부서 선택 후 즉시 닫고 나머지는 숨김
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-5 overflow-hidden select-none">
      
      {/* 1. Top Bar: Current Department Breadcrumb & Change Button */}
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

        {/* Right: '부서 변경' Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDeptPickerOpen(!isDeptPickerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border shadow-xs ${
              isDeptPickerOpen
                ? 'bg-teal-500 text-slate-950 border-teal-400 font-black'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>{isDeptPickerOpen ? '부서 목록 닫기' : '부서 변경 (조직도)'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDeptPickerOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

      </div>

      {/* 2. Collapsible Department Picker (부서 변경 클릭 시에만 나타나고, 선택하면 즉시 닫힘) */}
      {isDeptPickerOpen && (
        <div className="bg-slate-50 p-4 border-b border-slate-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>조직도에서 부서/센터를 선택하세요:</span>
            </div>
            <button
              onClick={() => setIsDeptPickerOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              닫기 ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ORGANIZATION_TREE.map((div) => {
              const DivIcon = div.id === 'div-sports' ? Building2 : div.id === 'div-traffic' ? Train : Sparkles;

              return (
                <div key={div.id} className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 pb-2 mb-2 border-b border-slate-100">
                    <DivIcon className="w-3.5 h-3.5 text-teal-600" />
                    <span>{div.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({div.departments.length}개)</span>
                  </div>

                  <div className="space-y-1">
                    {div.departments.map((dept) => {
                      const isSelected = dept.name === selectedDepartment;
                      const isHighlight = dept.name === '남양주체육문화센터';

                      return (
                        <button
                          key={dept.id}
                          onClick={() => handleSelectDept(div.id, dept.name)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition flex items-center justify-between border ${
                            isSelected
                              ? 'bg-teal-600 text-white font-black border-teal-600 shadow-xs'
                              : isHighlight
                              ? 'bg-amber-50/80 text-amber-900 border-amber-200 hover:bg-amber-100 font-bold'
                              : 'bg-slate-50/60 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <span className="truncate">{dept.name}</span>
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : isHighlight ? (
                            <span className="text-[9px] px-1 rounded bg-amber-200 text-amber-900 font-bold">본부</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

        {/* Right: View Mode Pills (표 보기, 칸반보드, 시설별, 담당자별) */}
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
          </div>
        )}

      </div>

    </div>
  );
}
