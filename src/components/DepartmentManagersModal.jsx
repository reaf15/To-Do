import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserCheck, 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  RotateCcw, 
  Save, 
  Building2, 
  ChevronRight,
  ArrowUp,
  ArrowDown,
  AlertCircle
} from 'lucide-react';
import { ORGANIZATION_TREE, ALL_DEPARTMENTS } from '../data/organizationChart';
import { INITIAL_DEPARTMENT_MANAGERS } from '../data/initialDepartmentManagers';

export default function DepartmentManagersModal({
  isOpen,
  onClose,
  departmentManagers = {},
  selectedDepartment = '남양주체육문화센터',
  onSaveManagers
}) {
  const [activeDept, setActiveDept] = useState(selectedDepartment);
  const [localManagersMap, setLocalManagersMap] = useState({});
  const [newManagerName, setNewManagerName] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync state when opening
  useEffect(() => {
    if (isOpen) {
      const merged = { ...INITIAL_DEPARTMENT_MANAGERS, ...departmentManagers };
      setLocalManagersMap(merged);
      setActiveDept(selectedDepartment || '남양주체육문화센터');
      setNewManagerName('');
      setEditingIndex(null);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, departmentManagers, selectedDepartment]);

  if (!isOpen) return null;

  const currentList = localManagersMap[activeDept] || [];

  // Add Manager
  const handleAddManager = (e) => {
    if (e) e.preventDefault();
    const trimmed = newManagerName.trim();
    if (!trimmed) {
      setErrorMsg('담당자 이름을 입력해주세요.');
      return;
    }
    if (currentList.includes(trimmed)) {
      setErrorMsg(`'${trimmed}' 담당자가 이미 목록에 존재합니다.`);
      return;
    }

    const updatedList = [...currentList, trimmed];
    setLocalManagersMap(prev => ({
      ...prev,
      [activeDept]: updatedList
    }));
    setNewManagerName('');
    setErrorMsg('');
  };

  // Remove Manager
  const handleRemoveManager = (indexToRemove) => {
    const targetName = currentList[indexToRemove];
    if (window.confirm(`'${targetName}' 담당자를 목록에서 삭제하시겠습니까?\n(기존에 등록된 업무의 담당자 기록은 유지됩니다)`)) {
      const updatedList = currentList.filter((_, idx) => idx !== indexToRemove);
      setLocalManagersMap(prev => ({
        ...prev,
        [activeDept]: updatedList
      }));
      if (editingIndex === indexToRemove) {
        setEditingIndex(null);
      }
    }
  };

  // Start Inline Edit
  const handleStartEdit = (index, name) => {
    setEditingIndex(index);
    setEditingName(name);
    setErrorMsg('');
  };

  // Save Inline Edit
  const handleSaveEdit = (index) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setErrorMsg('담당자 이름을 입력해주세요.');
      return;
    }
    if (currentList.some((m, idx) => idx !== index && m === trimmed)) {
      setErrorMsg(`'${trimmed}' 담당자가 이미 목록에 존재합니다.`);
      return;
    }

    const updatedList = [...currentList];
    updatedList[index] = trimmed;
    setLocalManagersMap(prev => ({
      ...prev,
      [activeDept]: updatedList
    }));
    setEditingIndex(null);
    setEditingName('');
    setErrorMsg('');
  };

  // Move Manager Up/Down
  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;
    const updated = [...currentList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setLocalManagersMap(prev => ({
      ...prev,
      [activeDept]: updated
    }));
  };

  // Reset current department to initial default
  const handleResetCurrentDept = () => {
    const defaultList = INITIAL_DEPARTMENT_MANAGERS[activeDept] || ['담당자1', '담당자2'];
    if (window.confirm(`'${activeDept}'의 담당자 목록을 초기 기본값으로 복원하시겠습니까?`)) {
      setLocalManagersMap(prev => ({
        ...prev,
        [activeDept]: [...defaultList]
      }));
      setEditingIndex(null);
      setErrorMsg('');
    }
  };

  // Save All Changes
  const handleSaveAll = async () => {
    try {
      if (onSaveManagers) {
        await onSaveManagers(localManagersMap);
      }
      setSuccessMsg('담당자 정보가 성공적으로 저장되었습니다.');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setErrorMsg('저장 중 오류가 발생했습니다: ' + err.message);
    }
  };

  // Find division for activeDept
  const activeDivision = ORGANIZATION_TREE.find(div => 
    div.departments.some(d => d.name === activeDept)
  ) || ORGANIZATION_TREE[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 font-bold shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                부서별 담당자(직원) 관리
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                각 부서의 담당자를 등록·수정·삭제하여 업무 배정 및 접속자 목록을 최신으로 유지합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Department Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-teal-600" />
                관리할 부서 선택
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {activeDivision?.name} 소속
              </span>
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={activeDept}
                onChange={(e) => {
                  setActiveDept(e.target.value);
                  setEditingIndex(null);
                  setErrorMsg('');
                }}
                className="col-span-1 sm:col-span-3 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold text-sm text-slate-800 transition cursor-pointer"
              >
                {ORGANIZATION_TREE.map(div => (
                  <optgroup key={div.id} label={`[${div.name}]`}>
                    {div.departments.map(dept => {
                      const count = (localManagersMap[dept.name] || []).length;
                      return (
                        <option key={dept.name} value={dept.name}>
                          {dept.name} ({count}명)
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Active Department Info Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-md bg-teal-100 text-teal-800 font-bold">
                {activeDivision?.name}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm font-black text-slate-900">
                {activeDept}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                현재 담당자 {currentList.length}명
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetCurrentDept}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium px-2.5 py-1 rounded hover:bg-slate-200 transition"
              title="이 부서의 초기 기본 담당자 목록으로 리셋"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>초기값 복원</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Manager List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal-600" />
                등록된 담당자 목록
              </h3>
              <span className="text-[11px] text-slate-400">
                순서 변경 시 맨 위의 담당자가 대표 담당자로 우선 노출됩니다.
              </span>
            </div>

            {currentList.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                <p className="text-xs text-slate-400">등록된 담당자가 없습니다. 아래에서 새 담당자를 추가해주세요.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentList.map((manager, idx) => {
                  const isEditing = editingIndex === idx;

                  return (
                    <div 
                      key={`${manager}-${idx}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition shadow-2xs"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center shrink-0 border border-teal-200">
                          {idx + 1}
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 max-w-sm">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(idx);
                                if (e.key === 'Escape') setEditingIndex(null);
                              }}
                              autoFocus
                              className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(idx)}
                              className="p-1.5 rounded-md bg-teal-600 text-white hover:bg-teal-500 transition"
                              title="수정 완료"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingIndex(null)}
                              className="p-1.5 rounded-md bg-slate-200 text-slate-600 hover:bg-slate-300 transition"
                              title="취소"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900">
                              {manager}
                            </span>
                            {idx === 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
                                대표
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Move Up */}
                        <button
                          type="button"
                          onClick={() => handleMove(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition"
                          title="위로 이동"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        {/* Move Down */}
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 1)}
                          disabled={idx === currentList.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition"
                          title="아래로 이동"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button */}
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(idx, manager)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition"
                            title="이름 수정"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveManager(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="담당자 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add New Manager Form */}
          <form onSubmit={handleAddManager} className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              + 새 담당자 추가
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newManagerName}
                onChange={(e) => {
                  setNewManagerName(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="새 담당자 성명 입력 (예: 홍길동)"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>추가</span>
              </button>
            </div>
          </form>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 hidden sm:block">
            저장 시 모든 공사 등록, 상세정보, 통계 및 필터에 즉시 반영됩니다.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>저장 및 적용</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
