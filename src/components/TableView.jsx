import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Phone, 
  Copy, 
  Check, 
  Eye, 
  EyeOff,
  Edit3, 
  Trash2,
  AlertCircle,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { formatCurrency, copyToClipboard } from '../utils/formatters';
import { STATUS_COLORS, STATUS_LIST, MANAGERS } from '../data/initialTasks';

// Table Columns Definition
export const TABLE_COLUMNS = [
  { id: 'budget', label: '예산' },
  { id: 'facility', label: '분류' },
  { id: 'location', label: '위치' },
  { id: 'title', label: '공사명', required: true },
  { id: 'estimatedCost', label: '예상비용', align: 'right' },
  { id: 'manager', label: '담당자', align: 'center' },
  { id: 'status', label: '진행상태', align: 'center' },
  { id: 'quoteAmount', label: '견적가', align: 'right' },
  { id: 'contractAmount', label: '계약금액', align: 'right' },
  { id: 'vendor', label: '업체명' },
  { id: 'contact', label: '업체 연락처' },
];

// View Presets
export const VIEW_PRESETS = [
  {
    id: 'all',
    name: '전체 보기',
    description: '모든 열을 표시합니다',
    columns: ['budget', 'facility', 'location', 'title', 'estimatedCost', 'manager', 'status', 'quoteAmount', 'contractAmount', 'vendor', 'contact']
  },
  {
    id: 'budget_focused',
    name: '💰 예산·비용 중심',
    description: '예산, 견적가, 계약금액 등 재정 정보 중심',
    columns: ['budget', 'title', 'estimatedCost', 'quoteAmount', 'contractAmount', 'status', 'vendor']
  },
  {
    id: 'field_focused',
    name: '👷 현장·업체 중심',
    description: '시설, 위치, 담당자, 시공업체 및 연락처 중심',
    columns: ['facility', 'location', 'title', 'manager', 'status', 'vendor', 'contact']
  },
  {
    id: 'compact',
    name: '⚡ 간략 요약',
    description: '주요 핵심 정보만 간략히 확인',
    columns: ['location', 'title', 'estimatedCost', 'manager', 'status']
  }
];

export default function TableView({
  tasks,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onQuickStatusChange,
  onQuickManagerChange
}) {
  const [sortField, setSortField] = useState('id');
  const [sortAsc, setSortAsc] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Column visibility state with localStorage persistence
  const [activePreset, setActivePreset] = useState(() => {
    return localStorage.getItem('nyj_table_preset') || 'all';
  });

  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = localStorage.getItem('nyj_table_visible_columns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return TABLE_COLUMNS.map(c => c.id);
  });

  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);

  // Sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'estimatedCost' || sortField === 'quoteAmount' || sortField === 'contractAmount') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    } else {
      aVal = (aVal || '').toString().toLowerCase();
      bVal = (bVal || '').toString().toLowerCase();
    }

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  // Calculate totals
  const totalCost = sortedTasks.reduce((sum, t) => sum + (Number(t.estimatedCost) || 0), 0);
  const totalQuote = sortedTasks.reduce((sum, t) => sum + (Number(t.quoteAmount) || 0), 0);
  const totalContract = sortedTasks.reduce((sum, t) => sum + (Number(t.contractAmount) || 0), 0);

  const handleCopyPhone = async (e, phone, id) => {
    e.stopPropagation();
    const success = await copyToClipboard(phone);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 inline ml-1 opacity-40 group-hover:opacity-100" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-teal-600 inline ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-teal-600 inline ml-1" />
    );
  };

  // View Presets Handler
  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setVisibleColumns(preset.columns);
    localStorage.setItem('nyj_table_preset', preset.id);
    localStorage.setItem('nyj_table_visible_columns', JSON.stringify(preset.columns));
  };

  // Toggle individual column
  const handleToggleColumn = (colId) => {
    if (colId === 'title') return; // 공사명은 필수
    let nextCols;
    if (visibleColumns.includes(colId)) {
      if (visibleColumns.length <= 2) {
        alert('최소 2개 이상의 열이 표시되어야 합니다.');
        return;
      }
      nextCols = visibleColumns.filter(id => id !== colId);
    } else {
      // Maintain defined order
      nextCols = TABLE_COLUMNS.map(c => c.id).filter(id => id === colId || visibleColumns.includes(id));
    }
    setVisibleColumns(nextCols);
    setActivePreset('custom');
    localStorage.setItem('nyj_table_preset', 'custom');
    localStorage.setItem('nyj_table_visible_columns', JSON.stringify(nextCols));
  };

  // Select all columns
  const handleSelectAllColumns = () => {
    const allIds = TABLE_COLUMNS.map(c => c.id);
    setVisibleColumns(allIds);
    setActivePreset('all');
    localStorage.setItem('nyj_table_preset', 'all');
    localStorage.setItem('nyj_table_visible_columns', JSON.stringify(allIds));
  };

  // Reset to default
  const handleResetColumns = () => {
    const defaultCols = VIEW_PRESETS[0].columns;
    setVisibleColumns(defaultCols);
    setActivePreset('all');
    localStorage.setItem('nyj_table_preset', 'all');
    localStorage.setItem('nyj_table_visible_columns', JSON.stringify(defaultCols));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      
      {/* 1. View Style Toolbar & Column Visibility Settings */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: View Mode Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
            보기 방식:
          </span>
          {VIEW_PRESETS.map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                title={preset.description}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  isActive
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
          {activePreset === 'custom' && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
              ✏️ 사용자 지정 ({visibleColumns.length}개 열)
            </span>
          )}
        </div>

        {/* Right: Column Picker Popover */}
        <div className="relative">
          <button
            onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-teal-600" />
            <span>열 표시 설정 ({visibleColumns.length}/{TABLE_COLUMNS.length})</span>
          </button>

          {isColumnPickerOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsColumnPickerOpen(false)} 
              />
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-40 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 font-bold text-slate-800">
                  <span className="flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                    표시할 열 선택
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleSelectAllColumns}
                      className="text-[11px] text-teal-600 hover:underline font-bold"
                    >
                      전체선택
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={handleResetColumns}
                      className="text-[11px] text-slate-500 hover:underline font-semibold"
                    >
                      초기화
                    </button>
                  </div>
                </div>

                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  {TABLE_COLUMNS.map((col) => {
                    const isChecked = visibleColumns.includes(col.id);
                    const isRequired = col.required;
                    return (
                      <label
                        key={col.id}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer select-none transition ${
                          isChecked ? 'text-slate-900 font-semibold bg-slate-50/50' : 'text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isRequired}
                          onChange={() => handleToggleColumn(col.id)}
                          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 disabled:opacity-50 cursor-pointer"
                        />
                        <span className="flex-1">{col.label}</span>
                        {isRequired && (
                          <span className="text-[10px] text-slate-400 font-normal">(필수)</span>
                        )}
                      </label>
                    );
                  })}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-center">
                  <span>자동으로 기억됩니다</span>
                  <button
                    onClick={() => setIsColumnPickerOpen(false)}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    완료
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {sortedTasks.length === 0 ? (
        <div className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">조건에 맞는 공사 업무가 없습니다</h3>
          <p className="text-xs text-slate-400 mt-1">검색어나 필터 조건을 변경해보세요.</p>
        </div>
      ) : (
        /* Table Container with sticky header */
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            
            {/* Header */}
            <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider sticky top-0 z-20 shadow-sm border-b border-slate-200">
              <tr>
                <th scope="col" className="py-3 px-3 w-12 text-center text-slate-400">#</th>

                {visibleColumns.includes('budget') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('budget')}
                    className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    예산 {renderSortIcon('budget')}
                  </th>
                )}

                {visibleColumns.includes('facility') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('facility')}
                    className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    분류 {renderSortIcon('facility')}
                  </th>
                )}

                {visibleColumns.includes('location') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('location')}
                    className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    위치 {renderSortIcon('location')}
                  </th>
                )}

                {visibleColumns.includes('title') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('title')}
                    className="py-3 px-4 cursor-pointer group hover:bg-slate-100 transition min-w-[240px]"
                  >
                    공사명 {renderSortIcon('title')}
                  </th>
                )}

                {visibleColumns.includes('estimatedCost') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('estimatedCost')}
                    className="py-3 px-3 text-right cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    예상비용 {renderSortIcon('estimatedCost')}
                  </th>
                )}

                {visibleColumns.includes('manager') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('manager')}
                    className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap text-center"
                  >
                    담당자 {renderSortIcon('manager')}
                  </th>
                )}

                {visibleColumns.includes('status') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('status')}
                    className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap text-center"
                  >
                    진행 {renderSortIcon('status')}
                  </th>
                )}

                {visibleColumns.includes('quoteAmount') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('quoteAmount')}
                    className="py-3 px-3 text-right cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    견적가 {renderSortIcon('quoteAmount')}
                  </th>
                )}

                {visibleColumns.includes('contractAmount') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('contractAmount')}
                    className="py-3 px-3 text-right cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    계약금액 {renderSortIcon('contractAmount')}
                  </th>
                )}

                {visibleColumns.includes('vendor') && (
                  <th 
                    scope="col" 
                    onClick={() => handleSort('vendor')}
                    className="py-3 px-3 cursor-pointer group hover:bg-slate-100 transition whitespace-nowrap"
                  >
                    업체명 {renderSortIcon('vendor')}
                  </th>
                )}

                {visibleColumns.includes('contact') && (
                  <th scope="col" className="py-3 px-3 whitespace-nowrap">
                    업체 연락처
                  </th>
                )}

                <th scope="col" className="py-3 px-3 text-center whitespace-nowrap w-24">
                  관리
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-slate-100 text-xs">
              {sortedTasks.map((t, index) => {
                const statusStyle = STATUS_COLORS[t.status] || {
                  bg: 'bg-slate-50',
                  text: 'text-slate-700',
                  border: 'border-slate-200',
                  dot: 'bg-slate-400'
                };

                return (
                  <tr 
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    className="hover:bg-teal-50/40 cursor-pointer transition group"
                  >
                    {/* Number */}
                    <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                      {index + 1}
                    </td>

                    {/* Budget */}
                    {visibleColumns.includes('budget') && (
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          t.budget === '수선유지비' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : t.budget === '시설비'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {t.budget}
                        </span>
                      </td>
                    )}

                    {/* Facility */}
                    {visibleColumns.includes('facility') && (
                      <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                        {t.facility}
                      </td>
                    )}

                    {/* Location */}
                    {visibleColumns.includes('location') && (
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {t.location || '-'}
                      </td>
                    )}

                    {/* Work Title */}
                    {visibleColumns.includes('title') && (
                      <td className="py-2.5 px-4 font-bold text-slate-900 group-hover:text-teal-700 transition">
                        <div className="flex items-center gap-1.5">
                          <span>{t.title}</span>
                          {t.logs && t.logs.length > 0 && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded font-normal" title={`${t.logs.length}개 업무 일지 있음`}>
                              💬{t.logs.length}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Estimated Cost */}
                    {visibleColumns.includes('estimatedCost') && (
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                        {t.estimatedCost ? (
                          formatCurrency(t.estimatedCost)
                        ) : (
                          <span className="text-slate-400 italic">
                            {t.estimatedCostNote || '-'}
                          </span>
                        )}
                      </td>
                    )}

                    {/* Manager (Inline change dropdown) */}
                    {visibleColumns.includes('manager') && (
                      <td className="py-2.5 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={t.manager || ''}
                          onChange={(e) => onQuickManagerChange(t.id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded border focus:outline-none transition cursor-pointer ${
                            t.manager === '김일호'
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : t.manager === '권병학'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : t.manager === '조현호'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          <option value="">미배정</option>
                          {MANAGERS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </td>
                    )}

                    {/* Status (Inline change dropdown) */}
                    {visibleColumns.includes('status') && (
                      <td className="py-2.5 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={t.status || '접수/대기'}
                          onChange={(e) => onQuickStatusChange(t.id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded border focus:outline-none transition cursor-pointer ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {STATUS_LIST.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    )}

                    {/* Quoted Amount */}
                    {visibleColumns.includes('quoteAmount') && (
                      <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-indigo-700">
                        {t.quoteAmount ? formatCurrency(t.quoteAmount) : '-'}
                      </td>
                    )}

                    {/* Contract Amount */}
                    {visibleColumns.includes('contractAmount') && (
                      <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-emerald-700">
                        {t.contractAmount ? formatCurrency(t.contractAmount) : '-'}
                      </td>
                    )}

                    {/* Contractor / Vendor */}
                    {visibleColumns.includes('vendor') && (
                      <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                        {t.vendor || '-'}
                      </td>
                    )}

                    {/* Contact */}
                    {visibleColumns.includes('contact') && (
                      <td className="py-2.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {t.contact ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${t.contact}`}
                              className="flex items-center gap-1 text-teal-600 hover:text-teal-800 font-medium"
                              title="전화 걸기"
                            >
                              <Phone className="w-3 h-3 text-teal-500" />
                              <span>{t.contact}</span>
                            </a>
                            <button
                              onClick={(e) => handleCopyPhone(e, t.contact, t.id)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition"
                              title="연락처 복사"
                            >
                              {copiedId === t.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    )}

                    {/* Action buttons */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectTask(t)}
                          title="상세보기 & 일지"
                          className="p-1 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditTask(t)}
                          title="수정"
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(t.id, t.title)}
                          title="삭제"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer with Summary Row dynamically matching visible columns */}
            <tfoot className="bg-slate-100 font-extrabold text-xs text-slate-900 border-t-2 border-slate-300 sticky bottom-0 z-10 shadow-inner">
              <tr>
                <td className="py-3 px-3 text-center text-slate-600 font-bold">
                  합계
                </td>

                {visibleColumns.includes('budget') && (
                  <td className="py-3 px-3 text-slate-400 text-center font-normal">-</td>
                )}

                {visibleColumns.includes('facility') && (
                  <td className="py-3 px-3 text-slate-400 text-center font-normal">-</td>
                )}

                {visibleColumns.includes('location') && (
                  <td className="py-3 px-3 text-slate-400 text-center font-normal">-</td>
                )}

                {visibleColumns.includes('title') && (
                  <td className="py-3 px-4 text-slate-800 font-bold">
                    총 {sortedTasks.length}건
                  </td>
                )}

                {visibleColumns.includes('estimatedCost') && (
                  <td className="py-3 px-3 text-right text-slate-900 font-black text-sm whitespace-nowrap">
                    {formatCurrency(totalCost)}
                  </td>
                )}

                {visibleColumns.includes('manager') && (
                  <td className="py-3 px-3 text-center text-slate-400 font-normal">-</td>
                )}

                {visibleColumns.includes('status') && (
                  <td className="py-3 px-3 text-center text-slate-400 font-normal">-</td>
                )}

                {visibleColumns.includes('quoteAmount') && (
                  <td className="py-3 px-3 text-right text-indigo-700 font-black text-sm whitespace-nowrap">
                    {formatCurrency(totalQuote)}
                  </td>
                )}

                {visibleColumns.includes('contractAmount') && (
                  <td className="py-3 px-3 text-right text-emerald-700 font-black text-sm whitespace-nowrap">
                    {totalContract > 0 ? formatCurrency(totalContract) : '-'}
                  </td>
                )}

                {visibleColumns.includes('vendor') && (
                  <td className="py-3 px-3 text-slate-400 font-normal">-</td>
                )}

                {visibleColumns.includes('contact') && (
                  <td className="py-3 px-3 text-slate-400 font-normal">-</td>
                )}

                {/* Actions column */}
                <td className="py-3 px-2 text-center text-slate-400 font-normal">-</td>
              </tr>
            </tfoot>

          </table>
        </div>
      )}

      {/* Table bottom bar note */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span>💡 보기 방식 버튼 또는 [열 표시 설정]을 눌러 원하는 항목만 맞춤형으로 확인할 수 있습니다.</span>
        <span>정렬: 각 컬럼 헤더 클릭</span>
      </div>

    </div>
  );
}
