import React from 'react';
import { 
  Building2, 
  Plus, 
  FileSpreadsheet, 
  RotateCcw, 
  UserCheck, 
  Wifi,
  Hammer,
  Database,
  ExternalLink
} from 'lucide-react';
import { MANAGERS } from '../data/initialTasks';

export default function Header({
  currentUser,
  onUserChange,
  onNewTask,
  onExportExcel,
  onResetData,
  onOpenConnect,
  serverInfo,
  totalTasksCount,
  myTasksCount,
  currentModule,
  onModuleChange,
  dbCount,
  selectedDepartment,
  selectedDbId,
  managers = MANAGERS
}) {
  const activeManagers = managers && managers.length > 0 ? managers : MANAGERS;
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 no-print border-b border-slate-800">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Department Indicator */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 shadow-inner">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    남양주도시공사
                  </span>
                  <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {selectedDepartment || '남양주체육문화센터'}
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5 flex items-center gap-1.5">
                  <span>시설관리 시스템</span>
                  <span className="text-xs text-teal-400 font-semibold">| 시설·공사 관리대장</span>
                </h1>
              </div>
            </div>


          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Persona / Current User Selector */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span className="text-slate-400">접속자:</span>
              <select
                value={currentUser}
                onChange={(e) => onUserChange(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer border-none py-0"
              >
                <option value="ALL" className="bg-slate-800 text-white">전체 보기 (관리자)</option>
                {activeManagers.map((m) => (
                  <option key={m} value={m} className="bg-slate-800 text-white">
                    {m} (담당)
                  </option>
                ))}
              </select>
              {currentUser !== 'ALL' && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-teal-500 text-slate-950 font-bold text-[11px]">
                  {myTasksCount}건
                </span>
              )}
            </div>

            {/* Connect Other Staff Button */}
            <button
              onClick={onOpenConnect}
              title="다른 직원 접속 주소 및 QR 확인"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/40 transition shadow-sm animate-pulse"
            >
              <Wifi className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">직원 접속</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            </button>

            {/* Link to Cowork App (3001) */}
            <a
              href={`http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`}
              target="_blank"
              rel="noopener noreferrer"
              title="[남양주도시공사 시설본부 | 업무자료 실시간 자동 취합 시스템] 바로가기"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/40 transition shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">자료취합 포털 (3001)</span>
              <span className="md:hidden">취합포털</span>
            </a>

            {/* Excel Download Button */}
            <button
              onClick={onExportExcel}
              title="현재 업무 목록 Excel 다운로드"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/40 transition shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">엑셀 다운로드</span>
            </button>

            {/* Reset Data Button */}
            <button
              onClick={onResetData}
              title="초기 35개 공사 데이터로 복원"
              className="p-2 text-xs rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* New Task Button */}
            <button
              onClick={onNewTask}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-md transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>신규 등록</span>
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Subbar: User Switcher & Module Switcher */}
      <div className="lg:hidden bg-slate-800/90 border-t border-slate-700/80 px-4 py-2 flex items-center justify-between gap-2 text-xs">
        {/* Mobile Title Badge */}
        <div className="flex items-center px-2 py-1 bg-slate-900 rounded-lg border border-slate-700 text-teal-300 font-bold text-[11px]">
          <span>시설·공사 ({totalTasksCount}건)</span>
        </div>

        {/* Mobile Persona Switcher */}
        <div className="flex items-center gap-1.5">
          <select
            value={currentUser}
            onChange={(e) => onUserChange(e.target.value)}
            className="bg-slate-900 text-white font-medium px-2 py-1 rounded border border-slate-700 text-xs"
          >
            <option value="ALL">전체 보기 (관리자)</option>
            {activeManagers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
