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
  Package, 
  Car, 
  MessageSquare, 
  PlusCircle, 
  Database,
  Table,
  Kanban,
  Building,
  Users,
  CheckCircle2
} from 'lucide-react';
import { ORGANIZATION_TREE } from '../data/organizationChart';

const DB_ICONS = {
  Package: Package,
  Car: Car,
  MessageSquare: MessageSquare,
  Database: Database
};

export default function OrgDepartmentBar({
  selectedDivision,
  onSelectDivision,
  selectedDepartment,
  onSelectDepartment,
  selectedDbId,
  onSelectDbId,
  customDatabases = [],
  tasksCount = 0,
  viewMode = 'table',
  onViewModeChange,
  onOpenNewDbModal
}) {
  const [isDeptTreeExpanded, setIsDeptTreeExpanded] = useState(true);

  // Current active division object
  const currentDiv = ORGANIZATION_TREE.find(div => div.id === selectedDivision) || ORGANIZATION_TREE[0];

  // Available databases for the selected department
  const deptDatabases = customDatabases.filter(db => 
    !db.department || db.department === selectedDepartment || db.department === '전체'
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-5 overflow-hidden select-none">
      
      {/* 1. Top Bar: Organization Breadcrumb & Division Toggles */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        
        {/* Left: Organization Hierarchy Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-teal-400 border border-slate-700">
            <FolderOpen className="w-3.5 h-3.5" />
            시설본부
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="flex items-center gap-1 text-slate-300 font-bold">
            {currentDiv.name}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-600/30 text-teal-300 font-extrabold border border-teal-500/40">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            {selectedDepartment}
          </span>
        </div>

        {/* Right: 3 Division Toggle Buttons (처 선택 토글) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {ORGANIZATION_TREE.map((div) => {
            const isSelected = div.id === selectedDivision;
            const Icon = div.id === 'div-sports' ? Building2 : div.id === 'div-traffic' ? Train : Sparkles;

            return (
              <button
                key={div.id}
                onClick={() => {
                  onSelectDivision(div.id);
                  // Auto-select first department in that division if current dept not in it
                  const depts = div.departments;
                  if (!depts.some(d => d.name === selectedDepartment)) {
                    onSelectDepartment(depts[0].name);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{div.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isSelected ? 'bg-slate-900 text-teal-300' : 'bg-slate-900/60 text-slate-400'
                }`}>
                  {div.departments.length}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsDeptTreeExpanded(!isDeptTreeExpanded)}
            title={isDeptTreeExpanded ? '조직도 접기' : '조직도 펼치기'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition ml-1"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDeptTreeExpanded ? '' : '-rotate-90'}`} />
          </button>
        </div>

      </div>

      {/* 2. Middle Bar: Department / Center Selection Chips (조직도 부서 토글) */}
      {isDeptTreeExpanded && (
        <div className="bg-slate-50/90 px-4 py-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <Folder className="w-3.5 h-3.5 text-slate-400" />
              소속 부서/센터:
            </span>

            {currentDiv.departments.map((dept) => {
              const isSelected = dept.name === selectedDepartment;
              const isHighlight = dept.name === '남양주체육문화센터';

              return (
                <button
                  key={dept.id}
                  onClick={() => onSelectDepartment(dept.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition shrink-0 border ${
                    isSelected
                      ? 'bg-teal-600 text-white font-bold border-teal-600 shadow-sm'
                      : isHighlight
                      ? 'bg-amber-50 text-amber-900 font-bold border-amber-300 hover:bg-amber-100'
                      : 'bg-white text-slate-700 font-medium border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : isHighlight ? 'bg-amber-500' : 'bg-slate-300'}`} />
                  <span>{dept.name}</span>
                  {dept.name === '남양주체육문화센터' && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                      isSelected ? 'bg-teal-700 text-white' : 'bg-amber-200 text-amber-900'
                    }`}>
                      본청 ({tasksCount})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Bottom Bar: Sub-Databases under this Department (업무 데이터베이스 하위 항목 탭) */}
      <div className="px-4 py-2 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Sub-items tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mr-1">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            업무 데이터베이스 목록:
          </span>

          {/* Sub-item 1: 시설·공사 관리대장 (이제 업무 데이터베이스 하위 항목!) */}
          <button
            onClick={() => onSelectDbId('facility')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition border ${
              selectedDbId === 'facility'
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>시설·공사 관리대장</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              selectedDbId === 'facility' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {selectedDepartment === '남양주체육문화센터' ? tasksCount : 0}
            </span>
          </button>

          {/* Sub-item 2..N: Custom Department Databases */}
          {deptDatabases.map(db => {
            const isSelected = selectedDbId === db.id;
            const Icon = DB_ICONS[db.icon] || Database;

            return (
              <button
                key={db.id}
                onClick={() => onSelectDbId(db.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{db.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {db.records?.length || 0}
                </span>
              </button>
            );
          })}

          {/* Add new database button */}
          <button
            onClick={onOpenNewDbModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-dashed border-slate-300 hover:border-teal-400 transition font-bold text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ 새 대장 추가</span>
          </button>
        </div>

        {/* Right: If facility maintenance is active, show viewMode pills */}
        {selectedDbId === 'facility' && onViewModeChange && (
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
