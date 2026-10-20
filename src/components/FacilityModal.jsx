import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Building2, 
  MapPin, 
  Trash2, 
  AlertCircle, 
  Plus, 
  Tag, 
  Layers, 
  Calendar, 
  User, 
  Phone, 
  Info,
  Maximize2
} from 'lucide-react';

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
    location: '',          // 주소 (소재지)
    completionDate: '',    // 준공일
    landArea: '',          // 대지면적
    facilityArea: '',      // 시설면적
    floorCount: '',        // 층수
    buildingArea: '',      // 건축면적
    totalFloorArea: '',    // 연면적
    scale: '',             // 규모 요약
    majorFacilities: '',   // 주요 설비
    manager: '',           // 관리책임자
    contact: '',           // 대표연락처
    zones: [],             // 세부 구역
    description: ''        // 시설 개요
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
        completionDate: facility.completionDate || '',
        landArea: facility.landArea || '',
        facilityArea: facility.facilityArea || '',
        floorCount: facility.floorCount || '',
        buildingArea: facility.buildingArea || '',
        totalFloorArea: facility.totalFloorArea || '',
        scale: facility.scale || '',
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
        completionDate: '',
        landArea: '',
        facilityArea: '',
        floorCount: '',
        buildingArea: '',
        totalFloorArea: '',
        scale: '',
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

  // Auto-compose scale if scale is empty or user updates parts
  const handleAutoComposeScale = () => {
    const parts = [];
    if (formData.floorCount) parts.push(formData.floorCount);
    const areaParts = [];
    if (formData.landArea) areaParts.push(`대지 ${formData.landArea}`);
    if (formData.totalFloorArea) areaParts.push(`연면적 ${formData.totalFloorArea}`);
    else if (formData.facilityArea) areaParts.push(`시설면적 ${formData.facilityArea}`);

    if (areaParts.length > 0) {
      parts.push(`(${areaParts.join(', ')})`);
    }

    if (parts.length > 0) {
      setFormData(prev => ({ ...prev, scale: parts.join(' ') }));
    }
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

    // Compose final scale summary if empty
    let finalScale = formData.scale.trim();
    if (!finalScale && (formData.floorCount || formData.totalFloorArea || formData.landArea)) {
      const parts = [];
      if (formData.floorCount) parts.push(formData.floorCount.trim());
      const areaParts = [];
      if (formData.landArea) areaParts.push(`대지 ${formData.landArea.trim()}`);
      if (formData.totalFloorArea) areaParts.push(`연면적 ${formData.totalFloorArea.trim()}`);
      if (areaParts.length > 0) parts.push(`(${areaParts.join(', ')})`);
      finalScale = parts.join(' ');
    }

    const facilityData = {
      ...(facility || {}),
      id: facility?.id || `fac-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      department: selectedDepartment,
      name: formData.name.trim(),
      fullName: (formData.fullName || formData.name).trim(),
      category: formData.category || '일반관리시설',
      location: formData.location.trim(),
      completionDate: formData.completionDate.trim(),
      landArea: formData.landArea.trim(),
      facilityArea: formData.facilityArea.trim(),
      floorCount: formData.floorCount.trim(),
      buildingArea: formData.buildingArea.trim(),
      totalFloorArea: formData.totalFloorArea.trim(),
      scale: finalScale,
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
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  {isEdit ? `'${formData.name || '시설'}' 개요 및 제원 수정` : '새 시설 등록'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-900/80 text-teal-300 border border-teal-700">
                  {selectedDepartment}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                주소, 대지면적, 시설면적, 층수, 건축면적, 연면적, 준공일 등 시설 개요 정보를 개별 항목별로 수정합니다.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          
          {/* SECTION 1: 기본 식별 정보 */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>1. 시설 기본 정보</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  시설명 (약칭 / 구분명) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 남양주센터, 화도체육센터"
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
                  placeholder="예: 화도체육문화센터 본관"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                />
              </div>

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
            </div>
          </div>

          {/* SECTION 2: 개별 건축 제원 및 면적 (사용자 요청 핵심 항목) */}
          <div className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                <span>2. 시설 제원 및 건축 면적 (항목별 개별 수정)</span>
              </h4>
              <button
                type="button"
                onClick={handleAutoComposeScale}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-bold underline"
                title="입력한 층수와 면적으로 요약 문구를 자동 조합합니다"
              >
                규모 자동 조합
              </button>
            </div>

            {/* 주소 (소재지) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-600" />
                <span>소재지 / 주소</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="예: 경기도 남양주시 화도읍 수레로 1259"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium bg-white"
              />
            </div>

            {/* 준공일 & 층수 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-500" />
                  <span>준공일자 / 개관일</span>
                </label>
                <input
                  type="text"
                  value={formData.completionDate}
                  onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                  placeholder="예: 2015년 11월 2일, 2008년 10월"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-blue-500" />
                  <span>층수 (지하/지상)</span>
                </label>
                <input
                  type="text"
                  value={formData.floorCount}
                  onChange={(e) => setFormData({ ...formData, floorCount: e.target.value })}
                  placeholder="예: 지하 1층 / 지상 4층"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium bg-white"
                />
              </div>
            </div>

            {/* 4대 면적 항목: 대지면적, 시설면적, 건축면적, 연면적 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  대지면적
                </label>
                <input
                  type="text"
                  value={formData.landArea}
                  onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
                  placeholder="예: 32,710㎡"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  시설면적
                </label>
                <input
                  type="text"
                  value={formData.facilityArea}
                  onChange={(e) => setFormData({ ...formData, facilityArea: e.target.value })}
                  placeholder="예: 12,693㎡"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  건축면적
                </label>
                <input
                  type="text"
                  value={formData.buildingArea}
                  onChange={(e) => setFormData({ ...formData, buildingArea: e.target.value })}
                  placeholder="예: 4,215㎡"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  연면적 (연상면적)
                </label>
                <input
                  type="text"
                  value={formData.totalFloorArea}
                  onChange={(e) => setFormData({ ...formData, totalFloorArea: e.target.value })}
                  placeholder="예: 12,693㎡"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium bg-white"
                />
              </div>
            </div>

            {/* 시설 규모 종합 요약 */}
            <div className="pt-1">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>시설 규모 종합 요약 문구</span>
                <span className="text-[10px] text-slate-400 font-normal">보고서 및 표에 대표 표시됩니다</span>
              </label>
              <input
                type="text"
                value={formData.scale}
                onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                placeholder="예: 지하 1층 / 지상 4층 (대지 32,710㎡, 연면적 12,693㎡)"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium bg-white"
              />
            </div>
          </div>

          {/* SECTION 3: 관리자 및 연락처 */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>3. 운영 담당 및 대표 연락처</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  시설 관리 책임자 / 담당자
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
                  대표 연락처 / 전화번호
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
          </div>

          {/* SECTION 4: 주요 설비 및 세부 구역 관리 */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Tag className="w-3.5 h-3.5 text-teal-600" />
              <span>4. 주요 설비 및 세부 구역</span>
            </h4>

            {/* Major facilities */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                주요 구성 설비 및 체육 공간
              </label>
              <input
                type="text"
                value={formData.majorFacilities}
                onChange={(e) => setFormData({ ...formData, majorFacilities: e.target.value })}
                placeholder="예: 실내수영장(25m 6레인), 다목적체육관, 헬스장, 실내골프연습장, 문화교실"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                쉼표(,)로 구분하여 입력하시면 개요 화면에 태그 배지로 표시됩니다.
              </span>
            </div>

            {/* Sub-zones */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                시설 내 세부 관리 구역
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
                  placeholder="새 구역 입력 후 [추가] (예: 지하 기계실, 옥상 방수구역, 수영장홀, 2층 강당)"
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
          </div>

          {/* SECTION 5: 시설 개요 및 주요 설명 (사용자 요청 핵심 항목) */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Info className="w-3.5 h-3.5 text-teal-600" />
              <span>5. 시설 개요 및 운영 설명</span>
            </h4>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="시설의 주된 목적, 운영 현황, 주요 체육 프로그램 및 안전관리 중점사항 등을 자유롭게 기재합니다."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium leading-relaxed"
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
                <span>{isEdit ? '시설 정보 및 개요 저장' : '시설 등록 완료'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
