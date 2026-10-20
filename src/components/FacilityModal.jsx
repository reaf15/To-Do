import React, { useState, useEffect } from 'react';
import { X, Save, Building2, MapPin, Trash2, AlertCircle, Plus, Tag } from 'lucide-react';

export default function FacilityModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  facility = null,
  selectedDepartment = '남양주체육문화센터'
}) {
  const isEdit = Boolean(facility && facility.id);

  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    category: '종합체육시설',
    location: '',
    scale: '',
    completionDate: '',
    majorFacilities: '',
    manager: '',
    contact: '',
    zones: [],
    description: ''
  });

  const [newZoneInput, setNewZoneInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name || '',
        fullName: facility.fullName || facility.name || '',
        category: facility.category || '종합체육시설',
        location: facility.location || '',
        scale: facility.scale || '',
        completionDate: facility.completionDate || '',
        majorFacilities: facility.majorFacilities || '',
        manager: facility.manager || '',
        contact: facility.contact || '',
        zones: Array.isArray(facility.zones) ? [...facility.zones] : [],
        description: facility.description || ''
      });
    } else {
      setFormData({
        name: '',
        fullName: '',
        category: '종합체육시설',
        location: '',
        scale: '',
        completionDate: '',
        majorFacilities: '',
        manager: '',
        contact: '',
        zones: ['본관', '부대시설', '주차장'],
        description: ''
      });
    }
    setErrors({});
    setNewZoneInput('');
  }, [facility, isOpen]);

  if (!isOpen) return null;

  const handleAddZone = () => {
    const trimmed = (newZoneInput || '').trim();
    if (!trimmed) return;
    if (formData.zones.includes(trimmed)) {
      setNewZoneInput('');
      return;
    }
    setFormData({
      ...formData,
      zones: [...formData.zones, trimmed]
    });
    setNewZoneInput('');
  };

  const handleRemoveZone = (zoneToRemove) => {
    setFormData({
      ...formData,
      zones: formData.zones.filter(z => z !== zoneToRemove)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '시설명(약칭)을 입력해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const facilityData = {
      ...(facility || {}),
      id: facility?.id || `fac-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      department: selectedDepartment,
      name: formData.name.trim(),
      fullName: (formData.fullName || formData.name).trim(),
      category: formData.category || '일반관리시설',
      location: formData.location.trim(),
      scale: formData.scale.trim(),
      completionDate: formData.completionDate.trim(),
      majorFacilities: formData.majorFacilities.trim(),
      manager: formData.manager.trim(),
      contact: formData.contact.trim(),
      zones: formData.zones,
      description: formData.description.trim()
    };

    onSave(facilityData, isEdit);
    onClose();
  };

  const handleDelete = () => {
    if (!facility) return;
    if (window.confirm(`정말 '${facility.name}' 시설을 삭제하시겠습니까?\n이 시설에 등록된 공사 목록과의 연결에 영향을 줄 수 있습니다.`)) {
      if (onDelete) onDelete(facility.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  {isEdit ? '시설 정보 수정 및 관리' : '새 시설 등록'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-900/80 text-teal-300 border border-teal-700">
                  {selectedDepartment}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEdit ? '부서에서 관리하는 시설의 제원 및 구역 정보를 수정합니다.' : '부서에 새로운 관리 대상 시설을 등록합니다.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Facility Name & Full Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                시설명 (약칭 / 구분명) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 남양주센터, 삼패야구장, 다산멀티"
                className={`w-full px-3 py-2 text-xs rounded-lg border font-bold ${
                  errors.name ? 'border-rose-400 bg-rose-50' : 'border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
                }`}
              />
              {errors.name && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                시설 정식 명칭
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="예: 남양주체육문화센터 본관"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          {/* Row 2: Category & Completion Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                시설 분류
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold bg-white"
              >
                <option value="종합체육시설">종합체육시설</option>
                <option value="야외체육시설">야외체육시설</option>
                <option value="복합체육시설">복합체육시설</option>
                <option value="체육공원시설">체육공원시설</option>
                <option value="문화·집회시설">문화·집회시설</option>
                <option value="철도안전시설">철도안전시설</option>
                <option value="교통주차시설">교통주차시설</option>
                <option value="청소년수련시설">청소년수련시설</option>
                <option value="체험·놀이시설">체험·놀이시설</option>
                <option value="일반관리시설">일반관리시설</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                준공연도 / 개관일
              </label>
              <input
                type="text"
                value={formData.completionDate}
                onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                placeholder="예: 2008년 10월, 2021년 3월"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          {/* Row 3: Address / Location & Scale */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                소재지 / 주소
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="예: 경기도 남양주시 다산지금로 91 (이패동)"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                시설 규모 (면적 / 층수)
              </label>
              <input
                type="text"
                value={formData.scale}
                onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                placeholder="예: 지하 1층 / 지상 3층 (연면적 12,450㎡)"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          {/* Row 4: Manager & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                시설 관리 담당자
              </label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                placeholder="예: 김일호, 권병학, 조현호"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                대표 연락처
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="예: 031-560-1200"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          {/* Row 5: Major Facilities / Equipments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              주요 구성 설비 및 공간
            </label>
            <input
              type="text"
              value={formData.majorFacilities}
              onChange={(e) => setFormData({ ...formData, majorFacilities: e.target.value })}
              placeholder="예: 실내체육관, 수영장(25m 6레인), 헬스장, A·B·C 축구장, 야외공연장, 테니스장"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              쉼표(,)로 구분하여 입력하시면 개요 화면에 태그로 표시됩니다.
            </span>
          </div>

          {/* Row 6: Sub-zones / Locations in this facility */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              시설 내 세부 구역 / 위치 관리
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newZoneInput}
                onChange={(e) => setNewZoneInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddZone();
                  }
                }}
                placeholder="구역 입력 후 [추가] (예: 옥상, 지하 기계실, 3층 방송실, A구장)"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
              <button
                type="button"
                onClick={handleAddZone}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition shrink-0"
              >
                + 구역 추가
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 min-h-[40px]">
              {formData.zones.length === 0 ? (
                <span className="text-slate-400 text-xs py-1">등록된 세부 구역이 없습니다.</span>
              ) : (
                formData.zones.map((zone) => (
                  <span
                    key={zone}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-semibold shadow-2xs"
                  >
                    <span>{zone}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveZone(zone)}
                      className="text-slate-400 hover:text-rose-500 transition ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Row 7: Description & Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              시설 개요 및 주요 설명
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="시설의 주된 목적, 운영 특이사항, 안전관리 중점사항 등을 기재합니다."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <div>
              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>시설 삭제</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-black bg-teal-600 hover:bg-teal-500 text-white shadow-md transition active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{isEdit ? '시설 정보 저장' : '시설 등록 완료'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
