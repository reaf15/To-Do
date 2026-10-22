import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ChevronDown, 
  ChevronRight, 
  Phone, 
  Plus, 
  ExternalLink 
} from 'lucide-react';
import { FACILITIES, STATUS_COLORS } from '../data/initialTasks';
import { formatCurrency } from '../utils/formatters';

export default function FacilityView({
  tasks = [],
  facilities = [],
  onSelectTask,
  onNewTask
}) {
  const facilityNames = Array.from(
    new Set([
      ...(Array.isArray(facilities) && facilities.length > 0
        ? facilities.map((f) => (typeof f === 'string' ? f : f.name)).filter(Boolean)
        : FACILITIES),
      ...tasks.map((t) => t.facility).filter(Boolean)
    ])
  );

  const [expandedFacilities, setExpandedFacilities] = useState({});

  const toggleFacility = (facility) => {
    setExpandedFacilities((prev) => ({
      ...prev,
      [facility]: prev[facility] === false ? true : false
    }));
  };

  return (
    <div className="space-y-4 mb-8">
      {facilityNames.map((facility) => {
        const facObj = Array.isArray(facilities)
          ? facilities.find((f) => typeof f === 'object' && f.name === facility)
          : null;
        const facilityTasks = tasks.filter((t) => t.facility === facility);
        const totalCost = facilityTasks.reduce((sum, t) => sum + (Number(t.estimatedCost) || 0), 0);
        const totalQuote = facilityTasks.reduce((sum, t) => sum + (Number(t.quoteAmount) || 0), 0);
        const isExpanded = expandedFacilities[facility] !== false;

        return (
          <div
            key={facility}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div
              onClick={() => toggleFacility(facility)}
              className="p-4 bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200"
            >
              <div className="flex items-center gap-3">
                <button className="text-slate-500">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
                <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{facility}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-extrabold">
                      {facilityTasks.length}건
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {facObj?.fullName || facObj?.location || '남양주도시공사 관리 시설구역'}
                  </p>
                </div>
              </div>

              {/* Facility Budget Stats */}
              <div className="flex items-center gap-4 text-xs ml-12 sm:ml-0">
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">예상비용 합계</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
                {totalQuote > 0 && (
                  <div className="text-right border-l border-slate-200 pl-4">
                    <span className="text-slate-400 block text-[11px]">견적 접수액</span>
                    <span className="font-extrabold text-indigo-700 text-sm">
                      {formatCurrency(totalQuote)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Expanded Content Table/Grid */}
            {isExpanded && (
              <div className="p-4 divide-y divide-slate-100">
                {facilityTasks.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    등록된 공사 업무가 없습니다.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {facilityTasks.map((t) => {
                      const statusStyle = STATUS_COLORS[t.status] || {
                        bg: 'bg-slate-50',
                        text: 'text-slate-700',
                        border: 'border-slate-200'
                      };

                      return (
                        <div
                          key={t.id}
                          onClick={() => onSelectTask(t)}
                          className="p-3 rounded-lg border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/20 cursor-pointer transition shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{t.location || '공용'}</span>
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                {t.status}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mb-2">
                              {t.title}
                            </h4>
                          </div>

                          <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                            <div className="flex justify-between text-slate-600">
                              <span>예산:</span>
                              <span className="font-semibold text-slate-800">
                                {t.estimatedCost ? formatCurrency(t.estimatedCost) : (t.estimatedCostNote || '-')}
                              </span>
                            </div>
                            {t.vendor && (
                              <div className="flex justify-between text-slate-500">
                                <span>업체:</span>
                                <span className="font-medium text-slate-700">{t.vendor}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center text-slate-500 pt-1">
                              <span>담당자:</span>
                              <span className={`px-1.5 py-0.2 rounded font-bold ${
                                t.manager ? 'bg-slate-100 text-slate-700' : 'text-slate-400'
                              }`}>
                                {t.manager || '미정'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
