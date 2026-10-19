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
  Sparkles
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
  serverInfo
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('nyj_sidebar_collapsed') === 'true';
  });

  // Expand state for each division in the tree
  const [expandedDivisions, setExpandedDivisions] = useState({
    'div-sports': true,
    'div-traffic': false,
    'div-youth': false,
  });

  // Expand state for groups (System admin, portal)
  const [expandedGroups, setExpandedGroups] = useState({
    databases: true,
    system: true
  });

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('nyj_sidebar_collapsed', String(nextState));
  };

  const toggleDivision = (divId) => {
    setExpandedDivisions(prev => ({
      ...prev,
      [divId]: !prev[divId]
    }));
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const handleDeptClick = (divId, deptName) => {
    if (onSelectDivision) onSelectDivision(divId);
    if (onSelectDepartment) onSelectDepartment(deptName);
    onModuleChange('databases');
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
                BLCS-FMS • 남양주도시공사
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
      <div className="flex-1 overflow-y-auto p-2 space-y-3.5 text-xs font-semibold scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* GROUP 1: 업무 데이터베이스 (조직도 연동 및 하위 시설·공사 관리) */}
        <div>
          {!isCollapsed ? (
            <button
              onClick={() => toggleGroup('databases')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition"
            >
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                업무 데이터베이스 (조직도)
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroups.databases ? '' : '-rotate-90'}`} />
            </button>
          ) : (
            <div className="w-full border-t border-slate-800 my-2" />
          )}

          {(!isCollapsed ? expandedGroups.databases : true) && (
            <div className="mt-1">
              {!isCollapsed ? (
                /* Full Tree View matching Organization Chart */
                <div className="space-y-1">
                  
                  {/* Root Node: 시설본부 */}
                  <div className="flex items-center gap-1.5 px-2 py-1 text-slate-300 font-extrabold text-[11px] bg-slate-800/40 rounded border border-slate-800/80">
                    <FolderOpen className="w-3.5 h-3.5 text-teal-400" />
                    <span>시설본부</span>
                  </div>

                  {/* 3 Divisions (처) */}
                  {ORGANIZATION_TREE.map(div => {
                    const isDivExpanded = expandedDivisions[div.id];
                    const DivIcon = div.id === 'div-sports' ? Building2 : div.id === 'div-traffic' ? Train : Sparkles;

                    return (
                      <div key={div.id} className="ml-2 pl-2 border-l border-slate-700/60 my-1">
                        
                        {/* Division Header (Toggle) */}
                        <button
                          onClick={() => toggleDivision(div.id)}
                          className="w-full flex items-center gap-1.5 px-1.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded transition group"
                        >
                          <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] bg-slate-800 border border-slate-700 text-slate-400 group-hover:text-white rounded">
                            {isDivExpanded ? '-' : '+'}
                          </span>
                          <Folder className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate flex-1 text-left">{div.name}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({div.departments.length})
                          </span>
                        </button>

                        {/* Departments under Division */}
                        {isDivExpanded && (
                          <div className="ml-3 pl-2 border-l border-slate-700/50 space-y-0.5 mt-0.5">
                            {div.departments.map(dept => {
                              const isDeptSelected = selectedDepartment === dept.name;
                              const isHighlight = dept.name === '남양주체육문화센터';

                              return (
                                <div key={dept.id} className="space-y-0.5">
                                  
                                  {/* Department Button */}
                                  <button
                                    onClick={() => handleDeptClick(div.id, dept.name)}
                                    title={dept.name}
                                    className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition text-left ${
                                      isDeptSelected
                                        ? isHighlight
                                          ? 'text-amber-400 font-extrabold bg-amber-500/15 border border-amber-500/30'
                                          : 'text-teal-300 font-bold bg-teal-500/15 border border-teal-500/30'
                                        : isHighlight
                                        ? 'text-amber-500 font-bold hover:text-amber-400 hover:bg-slate-800/80'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                    }`}
                                  >
                                    <Folder className={`w-3 h-3 shrink-0 ${isHighlight ? 'text-amber-400' : 'text-slate-500'}`} />
                                    <span className="truncate flex-1">{dept.name}</span>
                                    {isHighlight && (
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-black">
                                        본청
                                      </span>
                                    )}
                                  </button>

                                  {/* Sub-items (하위 항목) under Selected Department */}
                                  {isDeptSelected && (
                                    <div className="ml-3 pl-2 border-l border-slate-700/40 space-y-0.5 my-1">
                                      
                                      {/* Sub-item 1: 시설·공사 관리대장 (이제 업무DB 하위 항목!) */}
                                      <div className="space-y-0.5">
                                        <button
                                          onClick={() => {
                                            onModuleChange('databases');
                                            if (onSelectDbId) onSelectDbId('facility');
                                          }}
                                          className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition text-left ${
                                            selectedDbId === 'facility' && currentModule === 'databases'
                                              ? 'bg-teal-600 text-white font-bold shadow-xs'
                                              : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                          }`}
                                        >
                                          <Hammer className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                                          <span className="truncate flex-1">시설·공사 관리</span>
                                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 text-slate-300 font-extrabold">
                                            {dept.name === '남양주체육문화센터' ? tasksCount : 0}
                                          </span>
                                        </button>

                                        {/* Facility 4 Sub-views (표, 칸반, 시설, 담당자) */}
                                        {selectedDbId === 'facility' && currentModule === 'databases' && (
                                          <div className="ml-3 pl-2 border-l border-teal-500/30 space-y-0.5 py-0.5">
                                            <button
                                              onClick={() => handleFacilityViewClick('table')}
                                              className={`w-full flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] transition text-left ${
                                                viewMode === 'table' ? 'text-teal-300 font-extrabold bg-teal-900/30' : 'text-slate-400 hover:text-slate-200'
                                              }`}
                                            >
                                              <Table className="w-3 h-3 shrink-0" />
                                              <span className="truncate">공사목록 (표 보기)</span>
                                            </button>
                                            <button
                                              onClick={() => handleFacilityViewClick('kanban')}
                                              className={`w-full flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] transition text-left ${
                                                viewMode === 'kanban' ? 'text-teal-300 font-extrabold bg-teal-900/30' : 'text-slate-400 hover:text-slate-200'
                                              }`}
                                            >
                                              <Kanban className="w-3 h-3 shrink-0" />
                                              <span className="truncate">공정별 칸반보드</span>
                                            </button>
                                            <button
                                              onClick={() => handleFacilityViewClick('facility')}
                                              className={`w-full flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] transition text-left ${
                                                viewMode === 'facility' ? 'text-teal-300 font-extrabold bg-teal-900/30' : 'text-slate-400 hover:text-slate-200'
                                              }`}
                                            >
                                              <Building className="w-3 h-3 shrink-0" />
                                              <span className="truncate">시설물별 보수현황</span>
                                            </button>
                                            <button
                                              onClick={() => handleFacilityViewClick('staff')}
                                              className={`w-full flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] transition text-left ${
                                                viewMode === 'staff' ? 'text-teal-300 font-extrabold bg-teal-900/30' : 'text-slate-400 hover:text-slate-200'
                                              }`}
                                            >
                                              <Users className="w-3 h-3 shrink-0" />
                                              <span className="truncate">담당자별 공사현황</span>
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      {/* Sub-item 2..N: Custom Department Databases */}
                                      {customDatabases.map(db => {
                                        const isDbSelected = currentModule === 'databases' && selectedDbId === db.id;
                                        const Icon = DB_ICONS[db.icon] || Database;
                                        return (
                                          <button
                                            key={db.id}
                                            onClick={() => handleDbClick(db.id)}
                                            className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition text-left ${
                                              isDbSelected
                                                ? 'bg-blue-600 text-white font-bold shadow-xs'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                            }`}
                                          >
                                            <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                            <span className="truncate flex-1">{db.name}</span>
                                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                                              {db.records?.length || 0}
                                            </span>
                                          </button>
                                        );
                                      })}

                                      {/* Add New DB Button */}
                                      <button
                                        onClick={() => {
                                          onModuleChange('databases');
                                          if (onOpenNewDbModal) onOpenNewDbModal();
                                        }}
                                        className="w-full flex items-center gap-1.5 px-2 py-1 text-slate-400 hover:text-teal-400 rounded transition text-[10px] font-bold"
                                      >
                                        <PlusCircle className="w-3 h-3 shrink-0" />
                                        <span>+ 새 대장 추가</span>
                                      </button>

                                    </div>
                                  )}

                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    );
                  })}

                </div>
              ) : (
                /* Collapsed Icon Mode */
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onModuleChange('databases');
                      if (onSelectDbId) onSelectDbId('facility');
                    }}
                    title="시설·공사 관리대장"
                    className={`w-full p-2.5 rounded-lg flex justify-center transition ${
                      currentModule === 'databases' && selectedDbId === 'facility'
                        ? 'bg-teal-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Hammer className="w-5 h-5 text-teal-400" />
                  </button>

                  <button
                    onClick={() => onModuleChange('databases')}
                    title="업무 데이터베이스 허브"
                    className={`w-full p-2.5 rounded-lg flex justify-center transition ${
                      currentModule === 'databases' && selectedDbId !== 'facility'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Database className="w-5 h-5 text-blue-400" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* GROUP 2: 사내 연동 포털 (3001) */}
        <div>
          {!isCollapsed && (
            <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
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

        {/* GROUP 3: 시스템 관리 (BLCS-FMS 로그인이력조회) */}
        <div>
          {!isCollapsed ? (
            <button
              onClick={() => toggleGroup('system')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition"
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
