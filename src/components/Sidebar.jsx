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
  Server
} from 'lucide-react';

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
  onOpenNewDbModal,
  onOpenConnectModal,
  currentUser,
  tasksCount = 0,
  serverInfo
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('nyj_sidebar_collapsed') === 'true';
  });

  const [expandedSections, setExpandedSections] = useState({
    facility: true,
    databases: true,
    system: true
  });

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('nyj_sidebar_collapsed', String(nextState));
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleFacilityMenuClick = (targetViewMode) => {
    onModuleChange('facility');
    onViewModeChange(targetViewMode);
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
      <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs font-semibold scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* GROUP 1: 시설·공사 관리 (Maintenance) */}
        <div>
          {!isCollapsed ? (
            <button
              onClick={() => toggleSection('facility')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition"
            >
              <span className="flex items-center gap-1.5">
                <Hammer className="w-3.5 h-3.5 text-teal-400" />
                시설·공사 관리
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSections.facility ? '' : '-rotate-90'}`} />
            </button>
          ) : (
            <div className="w-full border-t border-slate-800 my-2" />
          )}

          {(!isCollapsed ? expandedSections.facility : true) && (
            <div className="space-y-0.5 mt-1">
              <button
                onClick={() => handleFacilityMenuClick('table')}
                title="공사목록 (표/스프레드시트)"
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                  currentModule === 'facility' && viewMode === 'table'
                    ? 'bg-teal-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Table className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">공사목록 (표 보기)</span>}
                {!isCollapsed && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-extrabold">
                    {tasksCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleFacilityMenuClick('kanban')}
                title="공정별 칸반보드"
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                  currentModule === 'facility' && viewMode === 'kanban'
                    ? 'bg-teal-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Kanban className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">공정별 칸반보드</span>}
              </button>

              <button
                onClick={() => handleFacilityMenuClick('facility')}
                title="시설물별 분류 현황"
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                  currentModule === 'facility' && viewMode === 'facility'
                    ? 'bg-teal-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Building className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">시설물별 보수현황</span>}
              </button>

              <button
                onClick={() => handleFacilityMenuClick('staff')}
                title="담당자별 배정 현황"
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                  currentModule === 'facility' && viewMode === 'staff'
                    ? 'bg-teal-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">담당자별 공사현황</span>}
              </button>
            </div>
          )}
        </div>

        {/* GROUP 2: 업무 데이터베이스 (Registers) */}
        <div>
          {!isCollapsed ? (
            <button
              onClick={() => toggleSection('databases')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition"
            >
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                업무 데이터베이스
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSections.databases ? '' : '-rotate-90'}`} />
            </button>
          ) : (
            <div className="w-full border-t border-slate-800 my-2" />
          )}

          {(!isCollapsed ? expandedSections.databases : true) && (
            <div className="space-y-0.5 mt-1">
              {customDatabases.map(db => {
                const TabIcon = DB_ICONS[db.icon] || Database;
                const isSelected = currentModule === 'databases' && selectedDbId === db.id;

                return (
                  <button
                    key={db.id}
                    onClick={() => handleDbClick(db.id)}
                    title={db.name}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <TabIcon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{db.name}</span>}
                    {!isCollapsed && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-semibold">
                        {db.records?.length || 0}
                      </span>
                    )}
                  </button>
                );
              })}

              {!isCollapsed && (
                <button
                  onClick={() => {
                    onModuleChange('databases');
                    if (onOpenNewDbModal) onOpenNewDbModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800/60 rounded-lg transition text-[11px] font-bold mt-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ 새 데이터베이스 추가</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* GROUP 3: 연동 포털 (Inter-System Cowork Portal) */}
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

        {/* GROUP 4: 시스템 관리 (System Admin - BLCS-FMS 핵심) */}
        <div>
          {!isCollapsed ? (
            <button
              onClick={() => toggleSection('system')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                시스템 관리
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSections.system ? '' : '-rotate-90'}`} />
            </button>
          ) : (
            <div className="w-full border-t border-slate-800 my-2" />
          )}

          {(!isCollapsed ? expandedSections.system : true) && (
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
                  체육문화센터 시설팀
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
