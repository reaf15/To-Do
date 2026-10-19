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
  AlertCircle,
  Copy,
  Clock,
  ExternalLink,
  Filter,
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
  onOpenNewDbModal,
  submissionStats = { totalCount: 20, submittedCount: 1, unsubmittedCount: 19, rate: '5.0', submittedDepts: [], unsubmittedDepts: [] },
  submissionMap = {},
  onToggleSubmission
}) {
  // Department picker open/close state (기본 숨김, 변경 클릭 시에만 노출 후 선택 시 자동 숨김)
  const [isDeptPickerOpen, setIsDeptPickerOpen] = useState(false);
  
  // Unsubmitted departments drawer open/close state
  const [isUnsubmittedOpen, setIsUnsubmittedOpen] = useState(false);

  // Filter in organization picker: 'all' | 'submitted' | 'unsubmitted'
  const [deptFilter, setDeptFilter] = useState('all');

  // Copy notification state
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Current active division object based on selectedDepartment
  const currentDiv = ORGANIZATION_TREE.find(div => 
    div.departments.some(d => d.name === selectedDepartment)
  ) || ORGANIZATION_TREE.find(div => div.id === selectedDivision) || ORGANIZATION_TREE[0];

  // Current department submission status
  const currentDeptSubmission = submissionMap[selectedDepartment];
  const isCurrentDeptSubmitted = currentDeptSubmission && (currentDeptSubmission.status === '제출완료' || currentDeptSubmission.status === '완료');

  // Available databases for the selected department
  const deptDatabases = customDatabases.filter(db => 
    !db.department || db.department === selectedDepartment || db.department === '전체'
  );

  const handleSelectDept = (divId, deptName) => {
    onSelectDivision(divId);
    onSelectDepartment(deptName);
    setIsDeptPickerOpen(false); // 부서 선택 후 즉시 닫고 나머지는 숨김!
  };

  // Copy unsubmitted department names to clipboard for messenger notice
  const handleCopyUnsubmittedList = () => {
    const listText = submissionStats.unsubmittedDepts.map(d => d.name).join(', ');
    const fullText = `[남양주도시공사 시설본부] 자료 미제출 부서 안내 (총 ${submissionStats.unsubmittedCount}개소)\n- 미제출 부서: ${listText}\n- 신속한 자료 작성 및 제출 바랍니다. (제출 진행률: ${submissionStats.rate}%)`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
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
                본청
              </span>
            )}
          </span>

          {/* Current department submission status pill */}
          <div className="flex items-center gap-1.5 ml-1">
            {isCurrentDeptSubmitted ? (
              <span 
                className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold cursor-pointer hover:bg-emerald-500/30 transition"
                title="클릭 시 제출 상태를 미제출로 변경할 수 있습니다"
                onClick={() => onToggleSubmission && onToggleSubmission(selectedDepartment)}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>자료 제출완료</span>
              </span>
            ) : (
              <span 
                className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-extrabold cursor-pointer hover:bg-rose-500/30 transition"
                title="클릭 시 제출완료로 변경할 수 있습니다"
                onClick={() => onToggleSubmission && onToggleSubmission(selectedDepartment)}
              >
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>자료 미제출 (작성 대기)</span>
              </span>
            )}
          </div>
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

      {/* 2. REAL-TIME SUBMISSION PROGRESS RATE & UNSUBMITTED DEPARTMENTS STRIP */}
      <div className="bg-slate-800/95 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 text-xs">
        
        {/* Left: Submission Rate & Interactive Progress Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-teal-400 flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-teal-400" />
              제출 진행률:
            </span>
            <span className="text-sm font-black text-white">
              {submissionStats.submittedCount} / {submissionStats.totalCount}개소
            </span>
            <span className="px-2 py-0.5 rounded font-black text-xs bg-teal-600 text-white shadow-2xs">
              {submissionStats.rate}%
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-28 sm:w-44 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
            <div 
              className="bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${Math.max(Number(submissionStats.rate), 3)}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              🟢 제출완료: {submissionStats.submittedCount}곳
            </span>
            <span className="text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
              ⏳ 미제출: {submissionStats.unsubmittedCount}곳
            </span>
          </div>
        </div>

        {/* Right: Unsubmitted Departments Dropdown Toggle & One-Click Copy */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Toggle unsubmitted departments drawer */}
          <button
            onClick={() => setIsUnsubmittedOpen(!isUnsubmittedOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border shadow-xs ${
              isUnsubmittedOpen
                ? 'bg-rose-600 text-white border-rose-500 font-black'
                : 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 border-rose-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>미제출 부서 ({submissionStats.unsubmittedCount}곳) {isUnsubmittedOpen ? '닫기' : '명단보기'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isUnsubmittedOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* One-click copy unsubmitted list for messenger */}
          <button
            onClick={handleCopyUnsubmittedList}
            title="사내 메신저 공지용 미제출 부서 명단 복사"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition"
          >
            <Copy className="w-3.5 h-3.5 text-slate-300" />
            <span>{copiedNotification ? '✓ 복사완료!' : '명단 복사'}</span>
          </button>

          {/* Cowork Portal (3001) Link */}
          <a
            href={`http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`}
            target="_blank"
            rel="noopener noreferrer"
            title="시설본부 실시간 자료취합 포털(3001) 새 창 열기"
            className="flex items-center gap-1 text-[11px] font-bold text-teal-400 hover:text-teal-300 px-2 py-1 rounded bg-slate-900 border border-teal-500/40 transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>취합포털(3001)</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

        </div>

      </div>

      {/* 3. EXPANDABLE UNSUBMITTED DEPARTMENTS DRAWER */}
      {isUnsubmittedOpen && (
        <div className="bg-rose-50/90 border-b border-rose-200 p-4 transition-all animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-extrabold text-rose-950 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                실시간 미제출 부서 목록 (총 {submissionStats.unsubmittedCount}개소):
              </span>
              <span className="text-[11px] text-rose-700 font-medium hidden sm:inline">
                (부서명을 클릭하면 해당 부서로 바로 이동하며 대장을 확인할 수 있습니다)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyUnsubmittedList}
                className="text-xs text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-rose-300 shadow-2xs hover:bg-rose-100 transition"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedNotification ? '✓ 복사완료!' : '미제출 명단 1초 복사'}</span>
              </button>
              <button
                onClick={() => setIsUnsubmittedOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold ml-1 px-1.5 py-0.5"
              >
                닫기 ✕
              </button>
            </div>
          </div>

          {/* Interactive Badges of Unsubmitted Departments */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {submissionStats.unsubmittedDepts.map(dept => (
              <div 
                key={dept.id}
                className="flex items-center justify-between bg-white rounded-lg border border-rose-200 hover:border-rose-400 text-xs shadow-2xs overflow-hidden transition group"
              >
                <button
                  onClick={() => handleSelectDept(dept.divisionId, dept.name)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-800 hover:bg-rose-50 transition text-left flex-1 min-w-0"
                  title={`${dept.name} 대장으로 바로 이동`}
                >
                  <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-slate-100 text-slate-600 group-hover:bg-rose-200 group-hover:text-rose-900 shrink-0">
                    {dept.divisionName.replace('운영처', '').replace('처', '')}
                  </span>
                  <span className="font-extrabold text-slate-900 group-hover:text-rose-700 truncate">
                    {dept.name}
                  </span>
                </button>
                {onToggleSubmission && (
                  <button
                    onClick={() => onToggleSubmission(dept.name, '제출완료')}
                    title={`${dept.name} [제출완료]로 처리`}
                    className="px-2 py-1.5 border-l border-rose-200 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition text-[11px] font-extrabold shrink-0"
                  >
                    ✓
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Collapsible Department Picker (부서 변경 클릭 시에만 나타나고, 선택하면 즉시 닫혀서 나머지 부서는 숨김!) */}
      {isDeptPickerOpen && (
        <div className="bg-slate-50 p-4 border-b border-slate-200 transition-all">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>조직도에서 부서/센터를 선택하세요:</span>
              <span className="text-[11px] text-teal-600 font-medium">(선택 시 나머지 부서는 자동으로 숨겨집니다)</span>
            </div>

            {/* Status Filter Tabs (전체 / 제출완료 / 미제출) */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs text-xs">
              <button
                onClick={() => setDeptFilter('all')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  deptFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                전체 ({submissionStats.totalCount})
              </button>
              <button
                onClick={() => setDeptFilter('submitted')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  deptFilter === 'submitted' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                🟢 제출완료 ({submissionStats.submittedCount})
              </button>
              <button
                onClick={() => setDeptFilter('unsubmitted')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${
                  deptFilter === 'unsubmitted' ? 'bg-rose-600 text-white' : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                ⏳ 미제출 ({submissionStats.unsubmittedCount})
              </button>
              <button
                onClick={() => setIsDeptPickerOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold ml-2 px-1"
              >
                닫기 ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ORGANIZATION_TREE.map((div) => {
              const DivIcon = div.id === 'div-sports' ? Building2 : div.id === 'div-traffic' ? Train : Sparkles;
              
              // Filter departments in this division based on deptFilter
              const filteredDepts = div.departments.filter(dept => {
                const isSub = submissionMap[dept.name]?.status === '제출완료' || submissionMap[dept.name]?.status === '완료';
                if (deptFilter === 'submitted') return isSub;
                if (deptFilter === 'unsubmitted') return !isSub;
                return true;
              });

              return (
                <div key={div.id} className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 mb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <DivIcon className="w-3.5 h-3.5 text-teal-600" />
                      <span>{div.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({filteredDepts.length}/{div.departments.length}개)
                    </span>
                  </div>

                  <div className="space-y-1">
                    {filteredDepts.length === 0 ? (
                      <div className="py-3 text-center text-slate-400 text-[11px]">
                        해당하는 부서가 없습니다.
                      </div>
                    ) : (
                      filteredDepts.map((dept) => {
                        const isSelected = dept.name === selectedDepartment;
                        const isHighlight = dept.name === '남양주체육문화센터';
                        const isSubmitted = submissionMap[dept.name]?.status === '제출완료' || submissionMap[dept.name]?.status === '완료';

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
                            <span className="truncate flex-1">{dept.name}</span>
                            
                            <div className="flex items-center gap-1 ml-1 shrink-0">
                              {/* Submission Status Badge */}
                              {isSubmitted ? (
                                <span className={`text-[9px] px-1 py-0.2 rounded font-extrabold ${
                                  isSelected ? 'bg-teal-800 text-teal-100' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  완료
                                </span>
                              ) : (
                                <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                  isSelected ? 'bg-teal-800 text-teal-100' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  미제출
                                </span>
                              )}

                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-white" />
                              ) : isHighlight ? (
                                <span className="text-[9px] px-1 rounded bg-amber-200 text-amber-900 font-bold">본청</span>
                              ) : null}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Sub-Databases under this Department (선택된 부서의 하위 대장 탭) */}
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
