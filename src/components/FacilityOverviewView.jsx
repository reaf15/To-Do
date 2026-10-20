import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Phone, 
  User, 
  Layers, 
  Plus, 
  Settings, 
  Hammer, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  CheckCircle2, 
  FolderOpen,
  Tag, 
  Coins, 
  Info,
  Clock,
  Users
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { STATUS_COLORS } from '../data/initialTasks';
import FacilityModal from './FacilityModal';

export default function FacilityOverviewView({
  facilities = [],
  selectedDepartment = '남양주체육문화센터',
  tasks = [],
  onSaveFacility,
  onDeleteFacility,
  onEditTask,
  onNewTaskForFacility,
  onNavigateToTasks,
  currentUser,
  onOpenDeptManagersModal
}) {
  // Filter facilities for current department
  const deptFacilities = useMemo(() => {
    return facilities.filter(f => f.department === selectedDepartment);
  }, [facilities, selectedDepartment]);

  // Selected facility filter tab: 'ALL' or facility id
  const [selectedFacilityTab, setSelectedFacilityTab] = useState('ALL');

  // Filter tasks belonging to current department
  const deptTasks = useMemo(() => {
    return tasks.filter(t => (t.department || '남양주체육문화센터') === selectedDepartment);
  }, [tasks, selectedDepartment]);

  // Expanded facility accordion map: { [facId]: boolean }
  // Default: first facility or all facilities expanded
  const [expandedFacilityMap, setExpandedFacilityMap] = useState({});

  const toggleExpand = (facId) => {
    setExpandedFacilityMap(prev => ({
      ...prev,
      [facId]: prev[facId] !== undefined ? !prev[facId] : false
    }));
  };

  const isFacilityExpanded = (facId) => {
    if (expandedFacilityMap[facId] !== undefined) {
      return expandedFacilityMap[facId];
    }
    // Default: expanded if single tab selected or first 2 items
    return true;
  };

  // Facilities to display based on tab
  const displayedFacilities = useMemo(() => {
    if (selectedFacilityTab === 'ALL') {
      return deptFacilities;
    }
    return deptFacilities.filter(f => f.id === selectedFacilityTab);
  }, [deptFacilities, selectedFacilityTab]);

  // Facility Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingFacility, setEditingFacility] = useState(null);

  // Quick zone input per facility: { [facId]: string }
  const [quickZoneInputs, setQuickZoneInputs] = useState({});

  // Task filter per facility: { [facId]: string }
  const [taskFilters, setTaskFilters] = useState({});

  // Open modal in create mode
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingFacility(null);
    setIsModalOpen(true);
  };

  // Open modal in edit mode for specific facility
  const handleOpenEditModal = (targetFac) => {
    if (!targetFac) return;
    setModalMode('edit');
    setEditingFacility(targetFac);
    setIsModalOpen(true);
  };

  // Quick add zone to facility
  const handleAddQuickZone = (e, targetFac) => {
    e.preventDefault();
    if (!targetFac) return;
    const inputVal = (quickZoneInputs[targetFac.id] || '').trim();
    if (!inputVal) return;

    const currentZones = Array.isArray(targetFac.zones) ? targetFac.zones : [];
    if (currentZones.includes(inputVal)) {
      setQuickZoneInputs(prev => ({ ...prev, [targetFac.id]: '' }));
      return;
    }

    const updated = {
      ...targetFac,
      zones: [...currentZones, inputVal]
    };
    onSaveFacility(updated, true);
    setQuickZoneInputs(prev => ({ ...prev, [targetFac.id]: '' }));
  };

  // Total summary statistics
  const totalCostAll = deptTasks.reduce((s, t) => s + (Number(t.estimatedCost) || 0), 0);
  const completedCountAll = deptTasks.filter(t => t.status === '완료').length;

  return (
    <div className="space-y-5 mb-12 select-none animate-in fade-in duration-200">
      
      {/* ========================================================
          1. UNIFIED SINGLE HEADER (단일 통합 헤더: 중복 배너 제거)
         ======================================================== */}
      <div className="bg-slate-900 rounded-2xl text-white p-5 sm:p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Department & Title */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                <FolderOpen className="w-3.5 h-3.5 text-teal-400" />
                시설본부
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-amber-400 font-extrabold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                {selectedDepartment}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-black shadow-inner shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
                  <span>부서별 시설 현황 및 개요</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-900/80 text-teal-300 border border-teal-600 font-bold">
                    {deptFacilities.length}개 시설 관리
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  부서에서 관할하는 관리 대상 시설의 제원, 주요 설비 및 보수공사 내역을 나열하여 총괄 조회합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
            {onOpenDeptManagersModal && (
              <button
                onClick={onOpenDeptManagersModal}
                title="부서별 담당자(직원) 목록을 추가 및 수정합니다"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white border border-slate-700 hover:border-teal-500/50 transition shadow-2xs active:scale-95 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-teal-400" />
                <span>부서 담당자 설정</span>
              </button>
            )}

            <button
              onClick={handleOpenCreateModal}
              title="현재 부서에 새로운 관리 대상 시설을 등록합니다"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ 새 시설 등록</span>
            </button>

            {onNavigateToTasks && (
              <button
                onClick={onNavigateToTasks}
                title="시설·공사 관리대장(표 보기)으로 이동합니다"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-2xs"
              >
                <Hammer className="w-3.5 h-3.5 text-amber-400" />
                <span>공사 관리대장</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================
          2. KPI SUMMARY BAR (부서 총괄 통계 요약)
         ======================================================== */}
      {deptFacilities.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 font-bold shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">총 관리 시설</span>
              <span className="text-base font-black text-slate-900">{deptFacilities.length}개소</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shrink-0">
              <Hammer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">총 보수·공사 건수</span>
              <span className="text-base font-black text-blue-700">{deptTasks.length}건</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">총 예상비용 합계</span>
              <span className="text-base font-black text-emerald-700">{formatCurrency(totalCostAll)}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">공사 완료율</span>
              <span className="text-base font-black text-slate-900">
                {deptTasks.length > 0 ? `${Math.round((completedCountAll / deptTasks.length) * 100)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3. FACILITY TABS SELECTOR (간결한 시설 탭 바)
         ======================================================== */}
      {deptFacilities.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedFacilityTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                selectedFacilityTab === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-black'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>전체 시설 나열 보기</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                selectedFacilityTab === 'ALL' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-600'
              }`}>
                {deptFacilities.length}
              </span>
            </button>

            {deptFacilities.map((fac) => {
              const facTaskCount = deptTasks.filter(t => t.facility === fac.name).length;
              const isSelected = selectedFacilityTab === fac.id;

              return (
                <button
                  key={fac.id}
                  onClick={() => setSelectedFacilityTab(fac.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm font-black'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{fac.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-teal-900 text-teal-100' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {facTaskCount}건
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 font-semibold px-2">
            표시 시설: <strong className="text-slate-900 font-black">{displayedFacilities.length}개소</strong>
          </div>
        </div>
      )}

      {/* ========================================================
          4. EMPTY STATE (등록된 시설이 없을 때)
         ======================================================== */}
      {deptFacilities.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              [{selectedDepartment}]에 등록된 관리 시설이 없습니다
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              상단의 <strong>[+ 새 시설 등록]</strong> 버튼을 클릭하여 부서에서 관할하는 시설을 등록하세요.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-500 text-white shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>첫 번째 시설 등록하기</span>
          </button>
        </div>
      )}

      {/* ========================================================
          5. SEQUENTIAL FACILITY LISTING (시설 나열식 목록)
         ======================================================== */}
      {displayedFacilities.length > 0 && (
        <div className="space-y-5">
          {displayedFacilities.map((fac, index) => {
            const facTasks = deptTasks.filter(t => t.facility === fac.name);
            const facCost = facTasks.reduce((s, t) => s + (Number(t.estimatedCost) || 0), 0);
            const facQuote = facTasks.reduce((s, t) => s + (Number(t.quoteAmount) || 0), 0);
            const facContract = facTasks.reduce((s, t) => s + (Number(t.contractAmount) || 0), 0);
            const facCompleted = facTasks.filter(t => t.status === '완료').length;
            const isExpanded = isFacilityExpanded(fac.id);

            // Facility-specific filter
            const currentFilter = taskFilters[fac.id] || '';
            const filteredTasks = currentFilter
              ? facTasks.filter(t => t.status === currentFilter)
              : facTasks;

            return (
              <div 
                key={fac.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition hover:border-slate-300"
              >
                {/* 5-A. FACILITY SUMMARY ROW / CARD HEADER (통합 나열식 헤더) */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border-b border-slate-100">
                  
                  {/* Left: Index, Icon & Basic Info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-black shadow-2xs shrink-0 mt-0.5">
                      <span className="text-xs text-teal-800 font-extrabold">{String(index + 1).padStart(2, '0')}</span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          {fac.name}
                        </h3>
                        {fac.fullName && fac.fullName !== fac.name && (
                          <span className="text-xs text-slate-500 font-semibold">
                            ({fac.fullName})
                          </span>
                        )}
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                          {fac.category || '종합체육시설'}
                        </span>
                        {fac.completionDate && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-500" />
                            준공: {fac.completionDate}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{fac.location || '위치 정보 미기재'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Key Stats & Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
                    
                    {/* Compact Cost / Tasks Stats */}
                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">공사 건수</span>
                        <span className="font-black text-slate-800">{facTasks.length}건</span>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">예상비용</span>
                        <span className="font-black text-teal-700">{formatCurrency(facCost)}</span>
                      </div>
                    </div>

                    {/* Action 1: 이 시설에 공사 등록 */}
                    <button
                      onClick={() => onNewTaskForFacility && onNewTaskForFacility(fac.name)}
                      title={`'${fac.name}'에 새로운 공사를 등록합니다`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-500 text-white transition shadow-2xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>공사 등록</span>
                    </button>

                    {/* Action 2: 시설 정보 및 개요 수정 */}
                    <button
                      onClick={() => handleOpenEditModal(fac)}
                      title={`'${fac.name}' 주소, 대지면적, 시설면적, 층수, 건축면적, 연면적, 준공일 등 개요 수정`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition shadow-2xs"
                    >
                      <Settings className="w-3.5 h-3.5 text-teal-600" />
                      <span>시설 개요 및 제원 수정</span>
                    </button>

                    {/* Action 3: 공사 내역 펼치기/접기 토글 */}
                    <button
                      onClick={() => toggleExpand(fac.id)}
                      title={isExpanded ? '상세 정보 및 공사 내역 접기' : '상세 정보 및 공사 내역 펼치기'}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        isExpanded
                          ? 'bg-slate-100 text-slate-800 border-slate-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>공사 내역 ({facTasks.length}건)</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </button>

                  </div>

                </div>

                {/* 5-B. ARCHITECTURAL & SPECIFICATION DETAILS (건축 제원 및 면적 개요) */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 space-y-2.5">
                  {/* 6 Key Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                    
                    {/* 층수 */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1 mb-0.5">
                        <Layers className="w-3 h-3 text-blue-500" />
                        층수
                      </span>
                      <strong className="text-slate-800 font-extrabold truncate block">
                        {fac.floorCount || (fac.scale?.split('(')[0] || '정보 미기재')}
                      </strong>
                    </div>

                    {/* 대지면적 */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5">
                        대지면적
                      </span>
                      <strong className="text-slate-800 font-extrabold truncate block">
                        {fac.landArea || '-'}
                      </strong>
                    </div>

                    {/* 시설면적 */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5">
                        시설면적
                      </span>
                      <strong className="text-slate-800 font-extrabold truncate block">
                        {fac.facilityArea || fac.totalFloorArea || '-'}
                      </strong>
                    </div>

                    {/* 건축면적 */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5">
                        건축면적
                      </span>
                      <strong className="text-slate-800 font-extrabold truncate block">
                        {fac.buildingArea || '-'}
                      </strong>
                    </div>

                    {/* 연면적 */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5">
                        연면적
                      </span>
                      <strong className="text-teal-700 font-black truncate block">
                        {fac.totalFloorArea || (fac.scale?.match(/연면적\s*[0-9,]+(\.[0-9]+)?\s*㎡/)?.[0] || '-')}
                      </strong>
                    </div>

                    {/* 준공일 */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1 mb-0.5">
                        <Calendar className="w-3 h-3 text-amber-500" />
                        준공일
                      </span>
                      <strong className="text-slate-800 font-extrabold truncate block">
                        {fac.completionDate || '미상'}
                      </strong>
                    </div>

                  </div>

                  {/* Second row: Location address & Contact & Manager */}
                  <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="text-slate-400 font-medium">소재지 주소:</span>
                      <strong className="text-slate-800 font-semibold truncate">{fac.location || '주소 정보 미기재'}</strong>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-400 font-medium">관리책임자:</span>
                        <strong className="text-slate-800">{fac.manager ? `${fac.manager} (담당)` : '담당자 미정'}</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-400 font-medium">대표연락처:</span>
                        <strong className="text-slate-800">{fac.contact || '031-560-1200'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5-C. MAJOR FACILITIES & DESCRIPTION (설비 및 개요) */}
                <div className="p-4 sm:p-5 space-y-3 bg-white">
                  {/* Facility Description with inline Edit Button */}
                  <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-teal-600" />
                        <span>시설 개요 및 운영 설명</span>
                      </span>
                      <button
                        onClick={() => handleOpenEditModal(fac)}
                        className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline"
                        title="시설 개요 및 설명 수정"
                      >
                        <Settings className="w-3 h-3" />
                        <span>개요 수정</span>
                      </button>
                    </div>
                    <p className="text-slate-600 pt-0.5">
                      {fac.description || '등록된 시설 개요 설명이 없습니다. [개요 수정] 버튼을 눌러 상세 설명을 등록해주세요.'}
                    </p>
                  </div>
                  {/* Major Facilities Tags */}
                  {fac.majorFacilities && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 block flex items-center gap-1">
                        <Tag className="w-3 h-3 text-teal-600" />
                        주요 구성 설비 및 공간:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {fac.majorFacilities.split(',').map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/70"
                          >
                            {item.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {fac.description && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                      <div className="font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                        <Info className="w-3 h-3 text-slate-400" />
                        시설 개요:
                      </div>
                      {fac.description}
                    </div>
                  )}

                  {/* Sub-Zones Badges */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      세부 구역:
                    </span>
                    {(fac.zones || []).map((zone) => {
                      const zoneCount = facTasks.filter(t => t.location === zone).length;
                      return (
                        <span 
                          key={zone}
                          className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1"
                        >
                          <span>{zone}</span>
                          {zoneCount > 0 && (
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1 rounded">
                              {zoneCount}
                            </span>
                          )}
                        </span>
                      );
                    })}

                    {/* Quick Add Zone Form */}
                    <form 
                      onSubmit={(e) => handleAddQuickZone(e, fac)}
                      className="inline-flex items-center gap-1 ml-auto"
                    >
                      <input
                        type="text"
                        value={quickZoneInputs[fac.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuickZoneInputs(prev => ({ ...prev, [fac.id]: val }));
                        }}
                        placeholder="+ 구역 추가"
                        className="px-2 py-0.5 text-[11px] rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 w-24"
                      />
                      <button
                        type="submit"
                        className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold"
                      >
                        등록
                      </button>
                    </form>
                  </div>
                </div>

                {/* 5-D. EXPANDABLE MAINTENANCE TASK LIST (시설별 보수·공사 내역 목록) */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/50">
                    
                    {/* Tasks Filter Bar */}
                    <div className="px-5 py-3 bg-slate-100/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <Hammer className="w-4 h-4 text-teal-600" />
                        <h4 className="text-xs font-black text-slate-900">
                          [{fac.name}] 공사·보수 관리 내역
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          {filteredTasks.length}건
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={currentFilter}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTaskFilters(prev => ({ ...prev, [fac.id]: val }));
                          }}
                          className="text-[11px] font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                        >
                          <option value="">진행상태 전체</option>
                          <option value="접수/대기">접수/대기</option>
                          <option value="검토중">검토중</option>
                          <option value="견적의뢰">견적의뢰</option>
                          <option value="견적방문">견적방문</option>
                          <option value="제안서 협의">제안서 협의</option>
                          <option value="계약체결">계약체결</option>
                          <option value="공사진행">공사진행</option>
                          <option value="완료">완료</option>
                        </select>

                        <button
                          onClick={() => onNewTaskForFacility && onNewTaskForFacility(fac.name)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-2xs transition active:scale-95"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <span>새 공사</span>
                        </button>
                      </div>
                    </div>

                    {/* Tasks Table */}
                    <div className="overflow-x-auto">
                      {filteredTasks.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs space-y-1">
                          <p>이 시설에 등록된 공사 내역이 없습니다.</p>
                          <button
                            onClick={() => onNewTaskForFacility && onNewTaskForFacility(fac.name)}
                            className="text-teal-600 font-bold hover:underline"
                          >
                            + 새 공사 등록하기
                          </button>
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100/90 text-slate-600 border-b border-slate-200 font-bold">
                              <th className="px-4 py-2.5">공사명 / 업무명</th>
                              <th className="px-3 py-2.5">세부 위치</th>
                              <th className="px-3 py-2.5">예산 과목</th>
                              <th className="px-3 py-2.5 text-right">예상비용</th>
                              <th className="px-3 py-2.5 text-right">견적가</th>
                              <th className="px-3 py-2.5 text-right">계약금액</th>
                              <th className="px-3 py-2.5">시공업체</th>
                              <th className="px-3 py-2.5 text-center">담당자</th>
                              <th className="px-4 py-2.5 text-center">진행상태</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredTasks.map((t) => {
                              const statusStyle = STATUS_COLORS[t.status] || {
                                bg: 'bg-slate-50',
                                text: 'text-slate-700',
                                border: 'border-slate-200'
                              };

                              return (
                                <tr
                                  key={t.id}
                                  onClick={() => onEditTask && onEditTask(t)}
                                  className="hover:bg-teal-50/40 cursor-pointer transition"
                                  title="클릭하여 공사 상세 정보를 확인 및 수정합니다"
                                >
                                  <td className="px-4 py-2.5 font-bold text-slate-900 max-w-xs truncate">
                                    {t.title}
                                  </td>
                                  <td className="px-3 py-2.5 text-slate-600">
                                    {t.location || '-'}
                                  </td>
                                  <td className="px-3 py-2.5 text-slate-600 font-medium">
                                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                                      {t.budget || '수선유지비'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-black text-slate-800">
                                    {t.estimatedCost ? `${Number(t.estimatedCost).toLocaleString()}원` : (t.estimatedCostNote || '-')}
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-bold text-indigo-700">
                                    {t.quoteAmount ? `${Number(t.quoteAmount).toLocaleString()}원` : '-'}
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-bold text-emerald-700">
                                    {t.contractAmount ? `${Number(t.contractAmount).toLocaleString()}원` : '-'}
                                  </td>
                                  <td className="px-3 py-2.5 text-slate-700 font-medium">
                                    {t.vendor || '-'}
                                  </td>
                                  <td className="px-3 py-2.5 text-center">
                                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                                      t.manager ? 'bg-slate-100 text-slate-700' : 'text-slate-400'
                                    }`}>
                                      {t.manager || '미정'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                      {t.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          6. FACILITY CREATE / EDIT MODAL
         ======================================================== */}
      <FacilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data, isEdit) => {
          onSaveFacility(data, isEdit);
          setSelectedFacilityTab(data.id);
        }}
        onDelete={(facId) => {
          onDeleteFacility(facId);
          setSelectedFacilityTab('ALL');
        }}
        facility={editingFacility}
        selectedDepartment={selectedDepartment}
      />

    </div>
  );
}
