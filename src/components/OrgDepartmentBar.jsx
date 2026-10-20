import React from 'react';
import { 
  FolderOpen, 
  ChevronRight, 
  UserCheck,
  Users
} from 'lucide-react';
import { ORGANIZATION_TREE } from '../data/organizationChart';
import { MANAGERS } from '../data/initialTasks';

export default function OrgDepartmentBar({
  selectedDivision,
  selectedDepartment,
  currentUser,
  onUserChange,
  managers = MANAGERS,
  onOpenDeptManagersModal
}) {
  // Current active division object based on selectedDepartment
  const currentDiv = ORGANIZATION_TREE.find(div => 
    div.departments.some(d => d.name === selectedDepartment)
  ) || ORGANIZATION_TREE.find(div => div.id === selectedDivision) || ORGANIZATION_TREE[0];

  const activeManagers = managers && managers.length > 0 ? managers : MANAGERS;

  return (
    <div className="bg-slate-900 rounded-xl text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 mb-5 border border-slate-800 shadow-sm select-none">
      
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

      {/* Right: User Selector & Dept Managers Button */}
      <div className="flex items-center gap-2 flex-wrap">
        {onOpenDeptManagersModal && (
          <button
            type="button"
            onClick={onOpenDeptManagersModal}
            title="부서별 담당자(직원) 추가 및 수정"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white border border-slate-700 hover:border-teal-500/50 transition shadow-2xs active:scale-95 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-teal-400" />
            <span>담당자 설정</span>
          </button>
        )}

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
              {activeManagers.map((m) => (
                <option key={m} value={m} className="bg-slate-800 text-white">
                  {m} (담당)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

    </div>
  );
}
