import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Building2, Calendar } from 'lucide-react';
import { FACILITIES, BUDGET_TYPES, MANAGERS, STATUS_LIST } from '../data/initialTasks';
import { ALL_DEPARTMENTS } from '../data/organizationChart';

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  task,
  editingTask,
  selectedDepartment = '남양주체육문화센터'
}) {
  const currentTask = task || editingTask;

  const [formData, setFormData] = useState({
    department: selectedDepartment,
    budget: '수선유지비',
    facility: '남양주센터',
    location: '',
    title: '',
    estimatedCost: '',
    estimatedCostNote: '',
    manager: '',
    status: '접수/대기',
    startDate: '',
    endDate: '',
    quoteAmount: '',
    contractAmount: '',
    vendor: '',
    memo: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentTask) {
      setFormData({
        department: currentTask.department || selectedDepartment || '남양주체육문화센터',
        budget: currentTask.budget || '수선유지비',
        facility: currentTask.facility || '남양주센터',
        location: currentTask.location || '',
        title: currentTask.title || '',
        estimatedCost: currentTask.estimatedCost ? String(currentTask.estimatedCost) : '',
        estimatedCostNote: currentTask.estimatedCostNote || '',
        manager: currentTask.manager || '',
        status: currentTask.status || '접수/대기',
        startDate: currentTask.startDate || '',
        endDate: currentTask.endDate || '',
        quoteAmount: currentTask.quoteAmount ? String(currentTask.quoteAmount) : '',
        contractAmount: currentTask.contractAmount ? String(currentTask.contractAmount) : '',
        vendor: currentTask.vendor || '',
        memo: currentTask.memo || '',
      });
    } else {
      setFormData({
        department: selectedDepartment || '남양주체육문화센터',
        budget: '수선유지비',
        facility: selectedDepartment.includes('체육문화센터') ? selectedDepartment.replace('체육문화센터', '센터') : selectedDepartment,
        location: '',
        title: '',
        estimatedCost: '',
        estimatedCostNote: '',
        manager: '',
        status: '접수/대기',
        startDate: '',
        endDate: '',
        quoteAmount: '',
        contractAmount: '',
        vendor: '',
        memo: '',
      });
    }
    setErrors({});
  }, [currentTask, isOpen, selectedDepartment]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold">
              {currentTask ? '공사 업무 정보 수정' : '신규 시설·공사 업무 등록'}
            </h3>
            <p className="text-xs text-teal-400 mt-0.5">
              시설본부 • {formData.department}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
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
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
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
                {BUDGET_TYPES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                분류 (센터/구역) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.facility}
                onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                placeholder="예: 남양주센터, 다목적체육관 등"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                상세 위치
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="예: 옥상, 지하 기계실, 3층 로비"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
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
                {MANAGERS.map((m) => (
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

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-bold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{currentTask ? '수정사항 저장' : '신규 업무 등록'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
