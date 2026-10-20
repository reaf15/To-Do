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
  ExternalLink, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Tag, 
  BarChart3, 
  Coins, 
  SlidersHorizontal,
  ChevronDown,
  Info
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
  currentUser
}) {
  // Filter facilities for current department
  const deptFacilities = useMemo(() => {
    return facilities.filter(f => f.department === selectedDepartment);
  }, [facilities, selectedDepartment]);

  // Selected facility cursor state: 'ALL' or facility id
  const [selectedFacilityId, setSelectedFacilityId] = useState(() => {
    return deptFacilities.length > 0 ? deptFacilities[0].id : 'ALL';
  });

  // Ensure selectedFacilityId is valid when department changes
  React.useEffect(() => {
    if (deptFacilities.length > 0) {
      if (!deptFacilities.some(f => f.id === selectedFacilityId) && selectedFacilityId !== 'ALL') {
        setSelectedFacilityId(deptFacilities[0].id);
      }
    } else {
      setSelectedFacilityId('ALL');
    }
  }, [deptFacilities]);

  // Active facility object
  const activeFacility = useMemo(() => {
    if (selectedFacilityId === 'ALL') return null;
    return deptFacilities.find(f => f.id === selectedFacilityId) || deptFacilities[0] || null;
  }, [deptFacilities, selectedFacilityId]);

  // Filter tasks belonging to current department
  const deptTasks = useMemo(() => {
    return tasks.filter(t => (t.department || '남양주체육문화센터') === selectedDepartment);
  }, [tasks, selectedDepartment]);

  // Filter tasks for active facility
  const activeFacilityTasks = useMemo(() => {
    if (!activeFacility) return [];
    return deptTasks.filter(t => t.facility === activeFacility.name);
  }, [deptTasks, activeFacility]);

  // Facility Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingFacility, setEditingFacility] = useState(null);

  // Quick zone input state inside facility overview
  const [quickZoneInput, setQuickZoneInput] = useState('');

  // Task filter inside facility view
  const [taskStatusFilter, setTaskStatusFilter] = useState('');

  // Filtered tasks for the active facility
  const filteredActiveTasks = useMemo(() => {
    if (!taskStatusFilter) return activeFacilityTasks;
    return activeFacilityTasks.filter(t => t.status === taskStatusFilter);
  }, [activeFacilityTasks, taskStatusFilter]);

  // Cost calculations
  const totalEstimatedCost = activeFacilityTasks.reduce((sum, t) => sum + (Number(t.estimatedCost) || 0), 0);
  const totalQuoteAmount = activeFacilityTasks.reduce((sum, t) => sum + (Number(t.quoteAmount) || 0), 0);
  const totalContractAmount = activeFacilityTasks.reduce((sum, t) => sum + (Number(t.contractAmount) || 0), 0);
  const completedTasksCount = activeFacilityTasks.filter(t => t.status === '완료').length;
  const inProgressTasksCount = activeFacilityTasks.filter(t => t.status !== '완료').length;

  // Open modal in create mode
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingFacility(null);
    setIsModalOpen(true);
  };

  // Open modal in edit mode
  const handleOpenEditModal = () => {
    if (!activeFacility) return;
    setModalMode('edit');
    setEditingFacility(activeFacility);
    setIsModalOpen(true);
  };

  // Quick add zone to active facility
  const handleAddQuickZone = (e) => {
    e.preventDefault();
    const trimmed = (quickZoneInput || '').trim();
    if (!trimmed || !activeFacility) return;

    const currentZones = Array.isArray(activeFacility.zones) ? activeFacility.zones : [];
    if (currentZones.includes(trimmed)) {
      setQuickZoneInput('');
      return;
    }

    const updated = {
      ...activeFacility,
      zones: [...currentZones, trimmed]
    };
    onSaveFacility(updated, true);
    setQuickZoneInput('');
  };

  return (
    <div className="space-y-6 mb-12 select-none animate-in fade-in duration-200">
      
      {/* ========================================================
          1. FACILITY CURSOR BAR (부서별 관리 시설 선택 커서)
         ======================================================== */}
      <div className="bg-slate-900 rounded-2xl text-white p-3.5 sm:p-4 border border-slate-800 shadow-md flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin flex-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            시설 커서:
          </span>

          {/* ALL Pill */}
          <button
            onClick={() => setSelectedFacilityId('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1.5 border ${
              selectedFacilityId === 'ALL'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-black'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>전체 요약 보기</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/60 font-extrabold">
              {deptFacilities.length}
            </span>
          </button>

          {/* Individual Facility Pills */}
          {deptFacilities.map((fac) => {
            const facTaskCount = deptTasks.filter(t => t.facility === fac.name).length;
            const isSelected = selectedFacilityId === fac.id;

            return (
              <button
                key={fac.id}
                onClick={() => setSelectedFacilityId(fac.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-400 shadow-md ring-2 ring-teal-400/30 font-black'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {isSelected && <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />}
                <span>{fac.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-teal-900 text-teal-200' : 'bg-slate-900 text-slate-400'
                }`}>
                  {facTaskCount}건
                </span>
              </button>
            );
          })}

          {/* Inline Add Button in Cursor Bar */}
          <button
            onClick={handleOpenCreateModal}
            title="새 관리 시설 추가"
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-xs transition shrink-0 flex items-center gap-1 font-black"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ 새 시설 등록</span>
          </button>
        </div>
      </div>


      {/* ========================================================
          2. EMPTY STATE (해당 부서에 등록된 시설이 없을 때)
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
              상단 헤더의 <strong>[+ 새 시설 등록]</strong> 버튼을 누르거나 아래 버튼을 클릭하여 부서에서 관할하는 첫 번째 시설을 생성하세요.
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
          3. ALL FACILITIES OVERVIEW GRID (전체 요약 보기 모드)
         ======================================================== */}
      {deptFacilities.length > 0 && selectedFacilityId === 'ALL' && (
        <div className="space-y-6">
          
          {/* Department KPI Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 font-bold shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">부서 총 관리시설</span>
                <span className="text-lg font-black text-slate-900">{deptFacilities.length}개소</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shrink-0">
                <Hammer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">총 보수·공사 건수</span>
                <span className="text-lg font-black text-blue-700">{deptTasks.length}건</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">총 예상비용 합계</span>
                <span className="text-lg font-black text-emerald-700">
                  {formatCurrency(deptTasks.reduce((s, t) => s + (Number(t.estimatedCost) || 0), 0))}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">공사 완료율</span>
                <span className="text-lg font-black text-slate-900">
                  {deptTasks.length > 0 
                    ? `${Math.round((deptTasks.filter(t => t.status === '완료').length / deptTasks.length) * 100)}%` 
                    : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Facilities Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {deptFacilities.map((fac) => {
              const facTasks = deptTasks.filter(t => t.facility === fac.name);
              const costSum = facTasks.reduce((s, t) => s + (Number(t.estimatedCost) || 0), 0);
              const quoteSum = facTasks.reduce((s, t) => s + (Number(t.quoteAmount) || 0), 0);

              return (
                <div
                  key={fac.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-teal-700 transition">
                            {fac.name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {fac.category || '관리시설'}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                        {facTasks.length}건
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      {fac.location && (
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{fac.location}</span>
                        </div>
                      )}
                      {fac.scale && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{fac.scale}</span>
                        </div>
                      )}
                      {fac.manager && (
                        <div className="flex items-center gap-1.5 truncate">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>담당자: <strong>{fac.manager}</strong></span>
                        </div>
                      )}
                    </div>

                    {fac.majorFacilities && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">주요 설비:</span>
                        <div className="flex flex-wrap gap-1">
                          {fac.majorFacilities.split(',').slice(0, 3).map((item, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700">
                              {item.trim()}
                            </span>
                          ))}
                          {fac.majorFacilities.split(',').length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-slate-400">
                              +{fac.majorFacilities.split(',').length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">예상비용 합계:</span>
                      <span className="font-black text-slate-900">{formatCurrency(costSum)}</span>
                    </div>

                    <button
                      onClick={() => setSelectedFacilityId(fac.id)}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-teal-600 hover:text-white text-slate-700 border border-slate-200 hover:border-teal-600 transition flex items-center justify-center gap-1.5"
                    >
                      <span>이 시설 개요 및 공사 보기</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Quick Add Facility Card */}
            <div
              onClick={handleOpenCreateModal}
              className="bg-slate-50/60 hover:bg-teal-50/30 rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-400 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[220px] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 group-hover:text-teal-600 group-hover:border-teal-300 flex items-center justify-center shadow-xs transition mb-2">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="text-xs font-black text-slate-700 group-hover:text-teal-700">
                + 새 시설 추가 등록
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                [{selectedDepartment}]에 새로운 관리 대상 시설을 등록합니다.
              </p>
            </div>
          </div>

        </div>
      )}


      {/* ========================================================
          4. SINGLE FACILITY DETAILED OVERVIEW (특정 시설 커서 선택 모드)
         ======================================================== */}
      {deptFacilities.length > 0 && selectedFacilityId !== 'ALL' && activeFacility && (
        <div className="space-y-6">
          
          {/* 4-A. FACILITY PROFILE & SPECIFICATION CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Card Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 font-black shadow-inner shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {activeFacility.name}
                    </h3>
                    {activeFacility.fullName && activeFacility.fullName !== activeFacility.name && (
                      <span className="text-xs text-slate-300 font-semibold">
                        ({activeFacility.fullName})
                      </span>
                    )}
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                      {activeFacility.category || '종합체육시설'}
                    </span>
                    {activeFacility.completionDate && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        준공: {activeFacility.completionDate}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{activeFacility.location || '위치 정보 미기재'}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons inside Banner */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  onClick={handleOpenEditModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition shadow-xs"
                >
                  <Settings className="w-3.5 h-3.5 text-teal-400" />
                  <span>시설 정보 수정</span>
                </button>
                <button
                  onClick={() => onNewTaskForFacility && onNewTaskForFacility(activeFacility.name)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-sm active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>이 시설에 공사 등록</span>
                </button>
              </div>
            </div>

            {/* Facility Details Grid */}
            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/50 border-b border-slate-200 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <Layers className="w-3 h-3 text-slate-500" />
                  시설 규모 / 층수
                </span>
                <span className="font-bold text-slate-900 block truncate">
                  {activeFacility.scale || '정보 미기재'}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" />
                  관리 책임자 / 담당
                </span>
                <span className="font-bold text-slate-900 block truncate">
                  {activeFacility.manager ? `${activeFacility.manager} (담당)` : '담당자 미정'}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  대표 연락처
                </span>
                <span className="font-bold text-slate-900 block truncate">
                  {activeFacility.contact || '031-560-1200'}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  준공 / 개관일
                </span>
                <span className="font-bold text-slate-900 block truncate">
                  {activeFacility.completionDate || '미상'}
                </span>
              </div>
            </div>

            {/* Major Facilities & Description */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Major Facilities Tags */}
              {activeFacility.majorFacilities && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-teal-600" />
                    주요 구성 설비 및 체육 공간:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeFacility.majorFacilities.split(',').map((facItem, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs"
                      >
                        {facItem.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {activeFacility.description && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <div className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    시설 개요 및 운영 설명:
                  </div>
                  {activeFacility.description}
                </div>
              )}
            </div>

          </div>


          {/* 4-B. FACILITY MAINTENANCE & BUDGET KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Tasks */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">시설 총 공사 건수</span>
                <span className="text-xl font-black text-slate-900">{activeFacilityTasks.length}건</span>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  진행중 {inProgressTasksCount}건 / 완료 {completedTasksCount}건
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center font-bold">
                <Hammer className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Estimated Cost */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">총 예상비용 합계</span>
                <span className="text-xl font-black text-slate-900">{formatCurrency(totalEstimatedCost)}</span>
                <div className="text-[10px] text-slate-400 mt-0.5">배정 예산 소요액</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                <Coins className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Quote Amount */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">견적 접수액</span>
                <span className="text-xl font-black text-indigo-700">
                  {totalQuoteAmount > 0 ? formatCurrency(totalQuoteAmount) : '-'}
                </span>
                <div className="text-[10px] text-slate-400 mt-0.5">시공업체 제출 견적</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4: Contract / Completion */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">계약 체결액</span>
                <span className="text-xl font-black text-emerald-700">
                  {totalContractAmount > 0 ? formatCurrency(totalContractAmount) : '-'}
                </span>
                <div className="text-[10px] text-slate-400 mt-0.5">최종 계약 및 집행</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

          </div>


          {/* 4-C. SUB-ZONES / LOCATIONS MANAGEMENT */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>시설 내 세부 구역 및 유지보수 이력 현황</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  해당 시설의 각 세부 구역별로 발생한 보수·공사 건수를 확인하고 새로운 구역을 등록할 수 있습니다.
                </p>
              </div>

              {/* Quick Add Zone Input */}
              <form onSubmit={handleAddQuickZone} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={quickZoneInput}
                  onChange={(e) => setQuickZoneInput(e.target.value)}
                  placeholder="새 구역 입력 (예: 기계실)"
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 font-medium"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition shrink-0"
                >
                  + 구역 추가
                </button>
              </form>
            </div>

            {/* Zones Badges with Task Counts */}
            <div className="flex flex-wrap gap-2 pt-1">
              {(activeFacility.zones || []).map((zone) => {
                const zoneTasksCount = activeFacilityTasks.filter(t => t.location === zone).length;

                return (
                  <div
                    key={zone}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                  >
                    <span>{zone}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      zoneTasksCount > 0 ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {zoneTasksCount}건
                    </span>
                  </div>
                );
              })}
              {(!activeFacility.zones || activeFacility.zones.length === 0) && (
                <span className="text-xs text-slate-400 py-1">등록된 세부 구역이 없습니다.</span>
              )}
            </div>
          </div>


          {/* 4-D. FACILITY MAINTENANCE & CONSTRUCTION TASK LIST */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Table Header & Filter Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Hammer className="w-4 h-4 text-teal-600" />
                <h4 className="text-sm font-black text-slate-900">
                  [{activeFacility.name}] 소속 공사·보수 관리 목록
                </h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-extrabold">
                  {filteredActiveTasks.length}건
                </span>
              </div>

              {/* Status Filter & New Task Button */}
              <div className="flex items-center gap-2">
                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
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
                  onClick={() => onNewTaskForFacility && onNewTaskForFacility(activeFacility.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>새 공사 등록</span>
                </button>
              </div>
            </div>

            {/* Tasks Table */}
            <div className="overflow-x-auto">
              {filteredActiveTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <p>이 시설에 등록된 공사 내역이 없습니다.</p>
                  <button
                    onClick={() => onNewTaskForFacility && onNewTaskForFacility(activeFacility.name)}
                    className="text-teal-600 font-bold hover:underline"
                  >
                    + 새 공사 등록하기
                  </button>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 text-slate-600 border-b border-slate-200 font-bold">
                      <th className="px-4 py-3">공사명 / 업무명</th>
                      <th className="px-3 py-3">상세 위치</th>
                      <th className="px-3 py-3">예산 과목</th>
                      <th className="px-3 py-3 text-right">예상비용</th>
                      <th className="px-3 py-3 text-right">견적가</th>
                      <th className="px-3 py-3 text-right">계약금액</th>
                      <th className="px-3 py-3">시공업체</th>
                      <th className="px-3 py-3 text-center">담당자</th>
                      <th className="px-4 py-3 text-center">진행상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredActiveTasks.map((t) => {
                      const statusStyle = STATUS_COLORS[t.status] || {
                        bg: 'bg-slate-50',
                        text: 'text-slate-700',
                        border: 'border-slate-200'
                      };

                      return (
                        <tr
                          key={t.id}
                          onClick={() => onEditTask && onEditTask(t)}
                          className="hover:bg-teal-50/30 cursor-pointer transition"
                          title="클릭하여 공사 상세 정보를 수정합니다"
                        >
                          <td className="px-4 py-3 font-bold text-slate-900 max-w-xs truncate">
                            {t.title}
                          </td>
                          <td className="px-3 py-3 text-slate-600">
                            {t.location || '-'}
                          </td>
                          <td className="px-3 py-3 text-slate-600 font-medium">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                              {t.budget || '수선유지비'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right font-black text-slate-800">
                            {t.estimatedCost ? `${Number(t.estimatedCost).toLocaleString()}원` : (t.estimatedCostNote || '-')}
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-indigo-700">
                            {t.quoteAmount ? `${Number(t.quoteAmount).toLocaleString()}원` : '-'}
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-emerald-700">
                            {t.contractAmount ? `${Number(t.contractAmount).toLocaleString()}원` : '-'}
                          </td>
                          <td className="px-3 py-3 text-slate-700 font-medium">
                            {t.vendor || '-'}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              t.manager ? 'bg-slate-100 text-slate-700' : 'text-slate-400'
                            }`}>
                              {t.manager || '미정'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
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

        </div>
      )}

      {/* ========================================================
          5. FACILITY CREATE / EDIT MODAL
         ======================================================== */}
      <FacilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data, isEdit) => {
          onSaveFacility(data, isEdit);
          setSelectedFacilityId(data.id);
        }}
        onDelete={(facId) => {
          onDeleteFacility(facId);
          setSelectedFacilityId('ALL');
        }}
        facility={editingFacility}
        selectedDepartment={selectedDepartment}
      />

    </div>
  );
}
