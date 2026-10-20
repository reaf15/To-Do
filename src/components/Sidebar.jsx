import React, { useState } from 'react';
import { 
  Building2, 
  Table, 
  Kanban, 
  Building, 
  Users, 
  Database, 
  Package, 
  Car, 
  MessageSquare, 
  PlusCircle, 
  ShieldCheck, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Wifi, 
  ChevronDown,
  Hammer,
  Folder,
  FolderOpen,
  Train,
  Sparkles,
  Check,
  RotateCcw,
  Calendar
} from 'lucide-react';
import { ORGANIZATION_TREE } from '../data/organizationChart';

const DB_ICONS = {
  Package: Package,
  Car: Car,
  MessageSquare: MessageSquare,
  Database: Database
};

export default function Sidebar({
  currentModule,
  onModuleChange,
  viewMode,
  onViewModeChange,
  customDatabases = [],
  selectedDbId,
  onSelectDbId,
  selectedDivision,
  onSelectDivision,
  selectedDepartment,
  onSelectDepartment,
  onOpenNewDbModal,
  onOpenConnectModal,
  currentUser,
  tasksCount = 0,
  facilitiesCount = 0,
  serverInfo,
  submissionStats = { totalCount: 20, submittedCount: 1, unsubmittedCount: 19, rate: '5.0', submittedDepts: [], unsubmittedDepts: [] },
  submissionMap = {}
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('nyj_sidebar_collapsed') === 'true';
  });

  // State for toggling department selector (오직 변경 시에만 열리고, 선택하면 나머지는 자동 숨김)
  const [isDeptPickerOpen, setIsDeptPickerOpen] = useState(false);

  // Group expand state
  const [expandedGroups, setExpandedGroups] = useState({
    databases: true,
    system: true
  });

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('nyj_sidebar_collapsed', String(nextState));
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Find current division from selectedDepartment
  const currentDiv = ORGANIZATION_TREE.find(div => 
    div.departments.some(d => d.name === selectedDepartment)
  ) || ORGANIZATION_TREE.find(div => div.id === selectedDivision) || ORGANIZATION_TREE[0];

  // Current department submission status
  const currentDeptSubmission = submissionMap[selectedDepartment];
  const isCurrentDeptSubmitted = currentDeptSubmission && (currentDeptSubmission.status === '제출완료' || currentDeptSubmission.status === '완료');

  const handleDeptSelect = (divId, deptName) => {
    if (onSelectDivision) onSelectDivision(divId);
    if (onSelectDepartment) onSelectDepartment(deptName);
    if (currentModule !== 'facility-overview') {
      onModuleChange('databases');
    }
    setIsDeptPickerOpen(false); // 부서 선택 후 나머지 부서들은 즉시 숨김!
  };

  const handleFacilityViewClick = (targetViewMode) => {
    onModuleChange('databases');
    if (onSelectDbId) onSelectDbId('facility');
    if (onViewModeChange) onViewModeChange(targetViewMode);
  };

  const handleDbClick = (dbId) => {
    onModuleChange('databases');
    if (onSelectDbId) onSelectDbId(dbId);
  };

  const coworkUrl = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`;

  return (
    <aside 
      className={`bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 z-40 transition-all duration-300 border-r border-slate-800 select-none shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64 sm:w-72'
      }`}
    >
      {/* 1. Sidebar Top Logo (Top Frame Brand) */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold shrink-0 shadow-inner">
            <Building2 className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="leading-tight truncate">
              <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                남양주도시공사 • 시설본부
              </div>
              <div className="text-sm font-extrabold text-white truncate">
                시설물종합관리시스템
              </div>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={toggleCollapse}
          title={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Navigation Menu Groups */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 text-xs font-semibold scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* GROUP 1: 업무 데이터베이스 (선택된 1개 부서만 표시 + 부서 변경 시에만 목록 토글) */}
        <div>
          {!isCollapsed ? (
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Database className="w-3.5 h-3.5" />
                업무 데이터베이스
              </span>
            </div>
          ) : (
            <div className="w-full border-t border-slate-800 my-2" />
          )}

          {!isCollapsed ? (
            <div className="space-y-2 mt-1">
              
              {/* Selected Department Card (선택된 1개 부서 표시 & 변경 토글 버튼) */}
              <div className="bg-slate-800/90 rounded-xl p-2.5 border border-slate-700/80 shadow-xs">
                
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0 font-bold">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div className="leading-tight truncate flex-1">
                      <div className="text-[10px] text-slate-400 font-medium truncate">
                        시설본부 • {currentDiv.name}
                      </div>
                      <div className="text-xs font-black text-amber-400 truncate flex items-center gap-1">
                        <span>{selectedDepartment}</span>
                        {selectedDepartment === '남양주체육문화센터' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                            본부
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* '부서 변경' Toggle Button (클릭 시에만 부서 목록이 나타남) */}
                  <button
                    onClick={() => setIsDeptPickerOpen(!isDeptPickerOpen)}
                    title={isDeptPickerOpen ? '부서 목록 닫기' : '다른 부서 선택하기'}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 border shrink-0 ${
                      isDeptPickerOpen 
                        ? 'bg-teal-600 text-white border-teal-500 shadow-xs' 
                        : 'bg-slate-700/90 hover:bg-slate-700 text-slate-200 border-slate-600'
                    }`}
                  >
                    <span>{isDeptPickerOpen ? '닫기' : '부서변경'}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isDeptPickerOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Dropdown: Organization Tree Picker (선택하면 즉시 닫히고 나머지는 숨김 처리!) */}
                {isDeptPickerOpen && (
                  <div className="mt-2 pt-2 border-t border-slate-700/80 space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
                    <div className="text-[10px] font-bold text-slate-400">
                      <span>조직도에서 부서 선택:</span>
                    </div>

                    {ORGANIZATION_TREE.map(div => {
                      const DivIcon = div.id === 'div-sports' ? Building2 : div.id === 'div-traffic' ? Train : Sparkles;

                      return (
                        <div key={div.id} className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-300 px-1.5 py-0.5 flex items-center gap-1.5 bg-slate-900/80 rounded border border-slate-800">
                            <DivIcon className="w-3 h-3 text-teal-400 shrink-0" />
                            <span>{div.name}</span>
                          </div>

                          <div className="grid grid-cols-1 gap-0.5 pl-2 border-l border-slate-700/60">
                            {div.departments.map(dept => {
                              const isSelected = dept.name === selectedDepartment;
                              const isHighlight = dept.name === '남양주체육문화센터';

                              return (
                                <button
                                  key={dept.id}
                                  onClick={() => handleDeptSelect(div.id, dept.name)}
                                  className={`w-full text-left px-2 py-1 rounded text-[11px] transition flex items-center justify-between ${
                                    isSelected
                                      ? 'bg-teal-600 text-white font-black shadow-xs'
                                      : isHighlight
                                      ? 'text-amber-400 font-bold hover:bg-slate-700/60'
                                      : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                                  }`}
                                >
                                  <span className="truncate">{dept.name}</span>
                                  {isSelected ? (
                                    <Check className="w-3 h-3 text-white" />
                                  ) : isHighlight ? (
                                    <span className="text-[9px] text-amber-400 font-bold">본부</span>
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>



              {/* Sub-items (하위 대장 목록): 오직 선택된 1개 부서의 것만 컴팩트하게 표시! */}
              <div className="space-y-1">
                
                {/* 1. 시설·공사 관리대장 (업무 데이터베이스 하위 항목) */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      onModuleChange('databases');
                      if (onSelectDbId) onSelectDbId('facility');
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition text-left ${
                      selectedDbId === 'facility' && currentModule === 'databases'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Hammer className="w-4 h-4 text-teal-400 shrink-0" />
                    <span className="truncate flex-1">시설·공사 관리대장</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-300 font-extrabold">
                      {tasksCount}
                    </span>
                  </button>

                  {/* Facility 4 Sub-views */}
                  {selectedDbId === 'facility' && currentModule === 'databases' && (
                    <div className="ml-3 pl-2.5 border-l-2 border-teal-500/40 space-y-0.5 py-1">
                      <button
                        onClick={() => handleFacilityViewClick('table')}
                        className={`w-full flex items-center gap-2 px-2 py-1 rounded text-[11px] transition text-left ${
                          viewMode === 'table' ? 'text-teal-300 font-black bg-teal-950/40' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Table className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">공사목록 (표 보기)</span>
                      </button>
                      <button
                        onClick={() => handleFacilityViewClick('kanban')}
                        className={`w-full flex items-center gap-2 px-2 py-1 rounded text-[11px] transition text-left ${
                          viewMode === 'kanban' ? 'text-teal-300 font-black bg-teal-950/40' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Kanban className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">공정별 칸반보드</span>
                      </button>
                      <button
                        onClick={() => handleFacilityViewClick('calendar')}
                        className={`w-full flex items-center gap-2 px-2 py-1 rounded text-[11px] transition text-left ${
                          viewMode === 'calendar' ? 'text-teal-300 font-black bg-teal-950/40' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-teal-400" />
                        <span className="truncate">공사일정 (달력 보기)</span>
                      </button>
                      <button
                        onClick={() => handleFacilityViewClick('facility')}
                        className={`w-full flex items-center gap-2 px-2 py-1 rounded text-[11px] transition text-left ${
                          viewMode === 'facility' ? 'text-teal-300 font-black bg-teal-950/40' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Building className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">시설물별 보수현황</span>
                      </button>
                      <button
                        onClick={() => handleFacilityViewClick('staff')}
                        className={`w-full flex items-center gap-2 px-2 py-1 rounded text-[11px] transition text-left ${
                          viewMode === 'staff' ? 'text-teal-300 font-black bg-teal-950/40' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">담당자별 공사현황</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. 부서별 시설 현황 및 개요 */}
                <div className="space-y-0.5 pt-1">
                  <button
                    onClick={() => {
                      onModuleChange('facility-overview');
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition text-left ${
                      currentModule === 'facility-overview'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate flex-1">부서별 시설 현황 및 개요</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-300 font-extrabold">
                      {facilitiesCount}개소
                    </span>
                  </button>
                </div>

              </div>

            </div>
          ) : (
            /* Collapsed Icon Mode */
            <div className="space-y-1 mt-1">
              <button
                onClick={() => {
                  onModuleChange('databases');
                  if (onSelectDbId) onSelectDbId('facility');
                }}
                title={`시설·공사 관리대장 (${selectedDepartment})`}
                className={`w-full p-2.5 rounded-lg flex justify-center transition ${
                  currentModule === 'databases' && selectedDbId === 'facility'
                    ? 'bg-teal-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Hammer className="w-5 h-5 text-teal-400" />
              </button>

              <button
                onClick={() => {
                  onModuleChange('facility-overview');
                }}
                title={`부서별 시설 현황 및 개요 (${selectedDepartment} - ${facilitiesCount}개소)`}
                className={`w-full p-2.5 rounded-lg flex justify-center transition ${
                  currentModule === 'facility-overview'
                    ? 'bg-teal-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-5 h-5 text-amber-400" />
              </button>
            </div>
          )}
        </div>

        {/* GROUP 2: 사내 연동 포털 (3001) */}
        <div>
          {!isCollapsed && (
            <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              사내 연동 시스템
            </div>
          )}
          <a
            href={coworkUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="시설본부 실시간 자료취합 포털 (포트 3001)"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-blue-400 hover:text-white hover:bg-blue-900/40 border border-blue-800/40 transition group"
          >
            <ExternalLink className="w-4 h-4 shrink-0 group-hover:scale-110 transition" />
            {!isCollapsed && (
              <div className="truncate text-left leading-tight">
                <div className="font-bold">자료취합 포털 (3001)</div>
                <div className="text-[10px] text-slate-400">시설본부 실시간 취합</div>
              </div>
            )}
          </a>
        </div>

        {/* GROUP 3: 시스템 관리 (로그인이력조회) */}
        <div>
          {!isCollapsed ? (
            <button
              onClick={() => toggleGroup('system')}
              className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                시스템 관리
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroups.system ? '' : '-rotate-90'}`} />
            </button>
          ) : (
            <div className="w-full border-t border-slate-800 my-2" />
          )}

          {(!isCollapsed ? expandedGroups.system : true) && (
            <div className="space-y-0.5 mt-1">
              <button
                onClick={() => onModuleChange('login-history')}
                title="시스템관리 > 로그인이력조회"
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                  currentModule === 'login-history'
                    ? 'bg-slate-800 text-teal-300 border border-teal-500/50 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                {!isCollapsed && <span className="truncate">로그인이력조회</span>}
              </button>

              <button
                onClick={() => onModuleChange('backup-restore')}
                title="시스템관리 > 데이터 백업 및 복구 관리"
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                  currentModule === 'backup-restore'
                    ? 'bg-slate-800 text-teal-300 border border-teal-500/50 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Database className="w-4 h-4 shrink-0 text-amber-400" />
                {!isCollapsed && <span className="truncate">데이터 백업 및 복구</span>}
              </button>

              <button
                onClick={onOpenConnectModal}
                title="사내망 공유 및 호스트 IP 확인"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition"
              >
                <Wifi className="w-4 h-4 shrink-0 text-teal-400" />
                {!isCollapsed && <span className="truncate">직원 접속 및 IP 안내</span>}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 3. Sidebar Footer: User Card & Host Server Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        {!isCollapsed ? (
          <div className="space-y-2">
            {/* User status */}
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="w-7 h-7 rounded-full bg-teal-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">
                {currentUser?.slice(0, 1) || '김'}
              </div>
              <div className="leading-tight truncate">
                <div className="font-bold text-white text-xs truncate">
                  {currentUser} {currentUser !== 'ALL' && '주임'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {selectedDepartment}
                </div>
              </div>
            </div>

            {/* Server status pill */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 py-1 bg-slate-900/60 rounded border border-slate-800/60">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-mono text-[10px] text-slate-300">192.168.101.96:5173</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">24H 가동</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="서버 정상 가동 중 (192.168.101.96)">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        )}
      </div>

    </aside>
  );
}
