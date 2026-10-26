import React, { useState, useEffect, useRef } from 'react';
import { X, Save, AlertCircle, Building2, Calendar, Camera, Image, Eye, Trash2, Plus, Upload } from 'lucide-react';
import { FACILITIES, BUDGET_TYPES, MANAGERS, STATUS_LIST } from '../data/initialTasks';
import { ALL_DEPARTMENTS } from '../data/organizationChart';

// 클라이언트 측 이미지 압축 헬퍼 (스마트폰 원본 사진을 1280px, ~150KB 이하로 자동 리사이징)
function compressImageFile(file, maxWidth = 1280, maxHeight = 1280, quality = 0.78) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          id: `IMG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          url: dataUrl,
          date: new Date().toISOString().split('T')[0]
        });
      };
      img.onerror = () => {
        resolve({
          id: `IMG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          url: e.target.result,
          date: new Date().toISOString().split('T')[0]
        });
      };
    };
    reader.onerror = () => resolve(null);
  });
}

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  task,
  editingTask,
  selectedDepartment = '남양주체육문화센터',
  budgetCategories = BUDGET_TYPES,
  facilityOptions = [],
  allFacilities = [],
  allBudgets = {},
  allDepartmentManagers = {},
  managers = MANAGERS
}) {
  const currentTask = task || editingTask;
  const defaultBudget = budgetCategories[0] || '수선유지비';
  const [isCustomFacility, setIsCustomFacility] = useState(false);

  const getDeptFacilityList = (dept) => {
    const targetDept = dept || selectedDepartment || '남양주체육문화센터';
    if (Array.isArray(allFacilities) && allFacilities.length > 0) {
      const matched = allFacilities
        .filter((f) => (f.department || '남양주체육문화센터') === targetDept)
        .map((f) => f.name)
        .filter(Boolean);
      if (matched.length > 0) return matched;
    }
    if (targetDept === selectedDepartment && Array.isArray(facilityOptions) && facilityOptions.length > 0) {
      return facilityOptions;
    }
    if (targetDept === '남양주체육문화센터') return FACILITIES;
    return [targetDept.includes('체육문화센터') ? targetDept.replace('체육문화센터', '센터') : targetDept];
  };

  const [formData, setFormData] = useState({
    department: selectedDepartment,
    budget: defaultBudget,
    facility: getDeptFacilityList(selectedDepartment)[0] || '남양주센터',
    location: '',
    title: '',
    estimatedCost: '',
    estimatedCostNote: '',
    manager: '',
    status: '검토',
    startDate: '',
    endDate: '',
    quoteAmount: '',
    contractAmount: '',
    vendor: '',
    memo: '',
    photos: [],
  });

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [selectedPreviewPhoto, setSelectedPreviewPhoto] = useState(null);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingPhoto(true);
    try {
      const promises = files.map(file => compressImageFile(file));
      const newPhotos = (await Promise.all(promises)).filter(Boolean);
      setFormData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), ...newPhotos]
      }));
    } catch (err) {
      console.error('Photo processing error:', err);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (photoId) => {
    setFormData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter(p => (p.id ? p.id !== photoId : p.url !== photoId))
    }));
  };

  useEffect(() => {
    setIsCustomFacility(false);
    if (currentTask) {
      const taskDept = currentTask.department || selectedDepartment || '남양주체육문화센터';
      const deptFacs = getDeptFacilityList(taskDept);
      setFormData({
        department: taskDept,
        budget: currentTask.budget || defaultBudget,
        facility: currentTask.facility || deptFacs[0] || taskDept,
        location: currentTask.location || '',
        title: currentTask.title || '',
        estimatedCost: currentTask.estimatedCost ? String(currentTask.estimatedCost) : '',
        estimatedCostNote: currentTask.estimatedCostNote || '',
        manager: currentTask.manager || '',
        status: currentTask.status || '검토',
        startDate: currentTask.startDate || '',
        endDate: currentTask.endDate || '',
        quoteAmount: currentTask.quoteAmount ? String(currentTask.quoteAmount) : '',
        contractAmount: currentTask.contractAmount ? String(currentTask.contractAmount) : '',
        vendor: currentTask.vendor || '',
        memo: currentTask.memo || '',
        photos: Array.isArray(currentTask.photos) ? currentTask.photos : [],
      });
    } else {
      const deptFacs = getDeptFacilityList(selectedDepartment);
      setFormData({
        department: selectedDepartment || '남양주체육문화센터',
        budget: defaultBudget,
        facility: deptFacs[0] || (selectedDepartment.includes('체육문화센터') ? selectedDepartment.replace('체육문화센터', '센터') : selectedDepartment),
        location: '',
        title: '',
        estimatedCost: '',
        estimatedCostNote: '',
        manager: '',
        status: '검토',
        startDate: '',
        endDate: '',
        quoteAmount: '',
        contractAmount: '',
        vendor: '',
        memo: '',
        photos: [],
      });
    }
    setErrors({});
  }, [currentTask, isOpen, selectedDepartment, defaultBudget, allFacilities]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeDept = formData.department || selectedDepartment || '남양주체육문화센터';

  // Department-specific facilities (from 부서별 시설 현황)
  const deptFacilityObjects = Array.isArray(allFacilities)
    ? allFacilities.filter((f) => (f.department || '남양주체육문화센터') === activeDept)
    : [];
  const baseFacilities = getDeptFacilityList(activeDept);
  const activeFacilityOptions = Array.from(
    new Set([
      ...baseFacilities,
      ...(formData.facility && !isCustomFacility ? [formData.facility] : [])
    ])
  );

  // Zones of the currently selected facility for location autocomplete
  const selectedFacilityObj = deptFacilityObjects.find((f) => f.name === formData.facility);
  const activeFacilityZones = Array.isArray(selectedFacilityObj?.zones) ? selectedFacilityObj.zones : [];

  // Department-specific budget categories
  const activeBudgetCategories = (() => {
    const deptBudgetObj = allBudgets?.[activeDept];
    if (deptBudgetObj && typeof deptBudgetObj === 'object' && Object.keys(deptBudgetObj).length > 0) {
      return Array.from(new Set([...Object.keys(deptBudgetObj), ...(formData.budget ? [formData.budget] : [])]));
    }
    return Array.from(new Set([...(budgetCategories || BUDGET_TYPES), ...(formData.budget ? [formData.budget] : [])]));
  })();

  // Department-specific managers
  const deptMgrList = allDepartmentManagers?.[activeDept];
  const baseManagers = Array.isArray(deptMgrList) && deptMgrList.length > 0
    ? deptMgrList
    : (managers && managers.length > 0 ? managers : MANAGERS);
  const activeManagers = Array.from(new Set([
    ...baseManagers,
    ...(formData?.manager ? [formData.manager] : [])
  ]));

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '공사명을 입력해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      ...formData,
      department: formData.department || selectedDepartment || '남양주체육문화센터',
      id: currentTask ? currentTask.id : `TASK-${Date.now()}`,
      estimatedCost: formData.estimatedCost ? Number(formData.estimatedCost) : null,
      quoteAmount: formData.quoteAmount ? Number(formData.quoteAmount) : null,
      contractAmount: formData.contractAmount ? Number(formData.contractAmount) : null,
      logs: currentTask?.logs || [
        {
          date: new Date().toISOString().split('T')[0],
          author: formData.manager || '시스템',
          message: currentTask ? '공사 정보 수정' : '신규 공사 업무 등록'
        }
      ]
    };

    onSave(payload);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl sm:max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Slide-out Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-sm border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {currentTask ? '공사 업무 상세 수정' : '신규 업무 등록'}
              </span>
              <span className="text-[11px] font-semibold text-slate-300">
                {formData.department}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md sm:max-w-lg">
              {currentTask ? (formData.title || '공사 정보 수정') : '신규 시설·공사 업무 등록'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="닫기 (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Row 0: Department Indicator & Switcher */}
          <div className="flex items-center justify-between p-3 bg-amber-50/70 rounded-xl border border-amber-200/90">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-700">소속 부서:</span>
              <span className="text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                {formData.department}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-semibold">부서 변경:</span>
              <select
                value={formData.department}
                onChange={(e) => {
                  const nextDept = e.target.value;
                  const nextFacs = getDeptFacilityList(nextDept);
                  const nextBudgetObj = allBudgets?.[nextDept];
                  const nextBudget = nextBudgetObj && Object.keys(nextBudgetObj).length > 0
                    ? Object.keys(nextBudgetObj)[0]
                    : '수선유지비';
                  setIsCustomFacility(false);
                  setFormData(prev => ({
                    ...prev,
                    department: nextDept,
                    facility: nextFacs[0] || nextDept,
                    budget: nextBudget,
                    manager: ''
                  }));
                }}
                className="text-xs font-bold bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {ALL_DEPARTMENTS.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 1: Budget, Facility, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                예산 과목 <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              >
                {activeBudgetCategories.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  분류 (시설/센터) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  등록시설 {baseFacilities.length}개
                </span>
              </div>
              {!isCustomFacility ? (
                <select
                  value={formData.facility}
                  onChange={(e) => {
                    if (e.target.value === '__CUSTOM__') {
                      setIsCustomFacility(true);
                      setFormData({ ...formData, facility: '' });
                    } else {
                      setFormData({ ...formData, facility: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold text-slate-800 bg-white cursor-pointer"
                >
                  {activeFacilityOptions.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                  <option value="__CUSTOM__">+ 직접 입력...</option>
                </select>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={formData.facility}
                    onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                    placeholder="시설/구역 직접 입력"
                    autoFocus
                    className="w-full px-2.5 py-2 rounded-lg border border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomFacility(false);
                      setFormData({ ...formData, facility: baseFacilities[0] || activeDept });
                    }}
                    className="shrink-0 px-2 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition"
                    title="등록된 시설 목록에서 선택"
                  >
                    목록
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                상세 위치
              </label>
              <input
                type="text"
                list="facility-zones-datalist"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="예: 옥상, 지하 기계실, 3층 로비"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
              {activeFacilityZones.length > 0 && (
                <datalist id="facility-zones-datalist">
                  {activeFacilityZones.map((zone) => (
                    <option key={zone} value={zone} />
                  ))}
                </datalist>
              )}
            </div>
          </div>

          {/* Row 2: Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              공사명 / 업무명 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="예: 체육관 옥상 방수(콘크리트면)"
              className={`w-full px-3 py-2 rounded-lg border font-bold text-sm ${
                errors.title ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-teal-500/20 focus:border-teal-500'
              }`}
            />
            {errors.title && (
              <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Row 3: Estimated Cost & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                예상비용 (원)
              </label>
              <input
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                placeholder="예: 10000000"
                step="100000"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {formData.estimatedCost ? `${Number(formData.estimatedCost).toLocaleString()}원` : '숫자만 입력'}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                예상비용 비고
              </label>
              <input
                type="text"
                value={formData.estimatedCostNote}
                onChange={(e) => setFormData({ ...formData, estimatedCostNote: e.target.value })}
                placeholder="예: 시설비, 사무관리비 등 특이사항"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Row 4: Manager & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                담당자
              </label>
              <select
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              >
                <option value="">미정 (선택안함)</option>
                {activeManagers.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                진행 상태
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold"
              >
                {STATUS_LIST.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4.5: Construction Schedule (공사 일정: 착공일 ~ 준공일) */}
          <div className="bg-teal-50/70 p-3 rounded-xl border border-teal-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 mb-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>공사 일정 (달력 연동)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  착공일 (공사 시작일)
                </label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs font-medium cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  준공 예정일 (공사 완료일)
                </label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs font-medium cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Quote & Contract Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block font-bold text-indigo-900 mb-1">
                견적가 (원)
              </label>
              <input
                type="number"
                value={formData.quoteAmount}
                onChange={(e) => setFormData({ ...formData, quoteAmount: e.target.value })}
                placeholder="예: 2255000"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-indigo-700"
              />
            </div>

            <div>
              <label className="block font-bold text-emerald-900 mb-1">
                계약금액 (원)
              </label>
              <input
                type="number"
                value={formData.contractAmount}
                onChange={(e) => setFormData({ ...formData, contractAmount: e.target.value })}
                placeholder="예: 최종 계약 체결액"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-700"
              />
            </div>
          </div>

          {/* Row 6: Vendor */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              업체명
            </label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              placeholder="예: 진산종합환경, 고려안전, 서진전력"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
            />
          </div>

          {/* Row 7: Memo */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              비고 / 공사 세부 메모
            </label>
            <textarea
              rows={3}
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              placeholder="특이사항, 견적방문 예정일자, 시공 범위 등 직원간 공유할 내용 입력"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
            />
          </div>

          {/* Row 7.5: Photos / Site Images Section */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Camera className="w-4 h-4 text-teal-600" />
                <span>현장 및 공사 사진</span>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {(formData.photos || []).length}장
                </span>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="task-photo-upload-input"
                />
                <label
                  htmlFor="task-photo-upload-input"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isUploadingPhoto ? '사진 처리 중...' : '사진 첨부'}</span>
                </label>
              </div>
            </div>

            {/* Photo Thumbnails Grid */}
            {(formData.photos && formData.photos.length > 0) ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {formData.photos.map((photo, index) => {
                  const photoUrl = typeof photo === 'string' ? photo : photo.url;
                  const photoName = typeof photo === 'string' ? `사진 ${index + 1}` : (photo.name || `사진 ${index + 1}`);
                  const photoId = typeof photo === 'string' ? photo : (photo.id || index);

                  return (
                    <div 
                      key={photoId} 
                      className="group relative rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs hover:shadow-md transition aspect-4/3 flex flex-col"
                    >
                      <img
                        src={photoUrl}
                        alt={photoName}
                        onClick={() => setSelectedPreviewPhoto(photoUrl)}
                        className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition duration-300"
                        title="클릭하여 큰 사진으로 보기"
                      />
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(photoId);
                        }}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white transition cursor-pointer shadow-xs"
                        title="사진 삭제"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {/* Enlarge overlay badge */}
                      <div 
                        onClick={() => setSelectedPreviewPhoto(photoUrl)}
                        className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer pointer-events-none"
                      >
                        <span className="bg-slate-900/80 text-white text-[10px] px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                          <Eye className="w-3 h-3" /> 크게 보기
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="py-4 px-3 border border-dashed border-slate-300 hover:border-teal-400 bg-white hover:bg-teal-50/30 rounded-xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-teal-700"
              >
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-teal-600" />
                <span className="text-xs font-semibold">클릭하여 공사 전/후 현장 사진을 첨부하세요</span>
                <span className="text-[10px] text-slate-400">스마트폰 사진, 캡처 이미지 등 여러 장 선택 가능 (시트 미반영)</span>
              </div>
            )}
          </div>

          {/* Row 8: Logs Timeline if present */}
          {currentTask?.logs && currentTask.logs.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-700 block mb-2">📜 업무 진행 일지 및 변경 이력 ({currentTask.logs.length}건)</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {currentTask.logs.map((log, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 text-[11px]">
                    <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                      <span>{log.author}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{log.date}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{log.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Slide-out Sticky Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0 shadow-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition cursor-pointer text-xs"
          >
            취소
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-bold shadow-md hover:shadow-lg transition cursor-pointer text-xs"
          >
            <Save className="w-4 h-4" />
            <span>{currentTask ? '수정사항 저장' : '신규 업무 등록'}</span>
          </button>
        </div>

      </form>

    </div>

    {/* Photo Lightbox Preview Modal */}
    {selectedPreviewPhoto && (
      <div 
        className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        onClick={() => setSelectedPreviewPhoto(null)}
      >
        <div 
          className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3 bg-slate-950 flex items-center justify-between text-white shrink-0 border-b border-slate-800">
            <span className="text-xs font-bold flex items-center gap-1.5 text-teal-300">
              <Camera className="w-4 h-4 text-teal-400" />
              현장 사진 원본 크게 보기
            </span>
            <button
              type="button"
              onClick={() => setSelectedPreviewPhoto(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-3 flex items-center justify-center overflow-auto max-h-[80vh] bg-slate-950/50">
            <img 
              src={selectedPreviewPhoto} 
              alt="확대 사진" 
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    )}

  </div>
);
}
