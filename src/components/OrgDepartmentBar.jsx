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
  Check,
  ClipboardCheck,
  ExternalLink
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
  onOpenNewDbModal,
  submissionStats = { totalCount: 20, submittedCount: 1, unsubmittedCount: 19, rate: '5.0' }
}) {
  // Department picker open/close state (기본 숨김, 변경 클릭 시에만 노출 후 선택 시 자동 숨김)
  const [isDeptPickerOpen, setIsDeptPickerOpen] = useState(false);

  // Current active division object based on selectedDepartment
  const currentDiv = ORGANIZATION_TREE.find(div => 
    div.departments.some(d => d.name === selectedDepartment)
  ) || ORGANIZATION_TREE.find(div => div.id === selectedDivision) || ORGANIZATION_TREE[0];

  // Available databases for the selected department
  const deptDatabases = customDatabases.filter(db => 
    !db.department || db.department === selectedDepartment || db.department === '전체'
  );

  const handleSelectDept = (divId, deptName) => {
    onSelectDivision(divId);
    onSelectDepartment(deptName);
    setIsDeptPickerOpen(false); // 부서 선택 후 즉시 닫고 나머지는 숨김!
  };

  const coworkUrl = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`;

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
                본청
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

      {/* 2. REAL-TIME SUBMISSION PROGRESS RATE STRIP (제출 진행률만 깔끔하게 노출) */}
      <div className="bg-slate-800/95 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 text-xs">
        
        {/* Left: Submission Rate & Interactive Progress Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-teal-400 flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-teal-400" />
              업무자료 제출 진행률:
            </span>
            <span className="text-sm font-black text-white">
              {submissionStats.submittedCount} / {submissionStats.totalCount}개소
            </span>
            <span className="px-2 py-0.5 rounded font-black text-xs bg-teal-600 text-white shadow-2xs">
              {submissionStats.rate}%
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-32 sm:w-56 bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700">
            <div 
              className="bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.max(Number(submissionStats.rate), 3)}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              완료: {submissionStats.submittedCount}곳
            </span>
            <span className="text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
              미제출: {submissionStats.unsubmittedCount}곳
            </span>
          </div>
        </div>

        {/* Right: Cowork Portal Link */}
        <div className="flex items-center gap-2">
          <a
            href={coworkUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="시설본부 실시간 자료취합 포털 (포트 3001) 새 창 열기"
            className="flex items-center gap-1.5 text-[11px] font-bold text-teal-400 hover:text-teal-300 px-2.5 py-1 rounded bg-slate-900 border border-teal-500/40 transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>취합포털 (3001) 실시간 연동</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>

      </div>

      {/* 3. Collapsible Department Picker (부서 변경 클릭 시에만 나타나고, 선택하면 즉시 닫혀서 나머지 부서는 숨김!) */}
      {isDeptPickerOpen && (
        <div className="bg-slate-50 p-4 border-b border-slate-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>조직도에서 부서/센터를 선택하세요:</span>
              <span className="text-[11px] text-teal-600 font-medium">(선택 시 나머지 부서는 자동으로 숨겨집니다)</span>
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
                            <span className="text-[9px] px-1 rounded bg-amber-200 text-amber-900 font-bold">본청</span>
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

      {/* 4. Sub-Databases under this Department (선택된 부서의 하위 대장 탭) */}
      <div className="px-4 py-2.5 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Sub-items tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mr-1">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <strong className="text-slate-800">{selectedDepartment}</strong> 대장:
          </span>

          {/* Sub-item 1: 시설·공사 관리대장 (업무 데이터베이스 하위 항목) */}
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
