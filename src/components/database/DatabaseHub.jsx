import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Database, 
  Plus, 
  Search, 
  Settings2, 
  Trash2, 
  Edit3, 
  FileSpreadsheet, 
  Layers, 
  AlertCircle,
  Package,
  Car,
  MessageSquare,
  X,
  Calendar,
  CheckCircle2,
  Tag,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import DatabaseSchemaModal from './DatabaseSchemaModal';
import DatabaseRecordModal from './DatabaseRecordModal';
import { formatCurrency } from '../../utils/formatters';

const DB_ICONS = {
  Package: Package,
  Car: Car,
  MessageSquare: MessageSquare,
  Database: Database
};

export default function DatabaseHub({
  databases,
  onSaveDatabase,
  onDeleteDatabase,
  currentUser
}) {
  const [selectedDbId, setSelectedDbId] = useState(() => databases[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [editingDb, setEditingDb] = useState(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Active Database
  const activeDb = useMemo(() => {
    return databases.find(db => db.id === selectedDbId) || databases[0] || null;
  }, [databases, selectedDbId]);

  // Column visibility state per database
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
  const [hiddenColumnsByDb, setHiddenColumnsByDb] = useState(() => {
    try {
      const saved = localStorage.getItem('nyj_custom_db_hidden_cols');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  const visibleColumns = useMemo(() => {
    if (!activeDb || !activeDb.columns) return [];
    const hidden = hiddenColumnsByDb[activeDb.id] || [];
    return activeDb.columns.filter(c => !hidden.includes(c.id));
  }, [activeDb, hiddenColumnsByDb]);

  const toggleDbColumn = (colId) => {
    if (!activeDb) return;
    const currentHidden = hiddenColumnsByDb[activeDb.id] || [];
    let nextHidden;
    if (currentHidden.includes(colId)) {
      nextHidden = currentHidden.filter(id => id !== colId);
    } else {
      if (visibleColumns.length <= 1) {
        alert('최소 1개 이상의 열이 표시되어야 합니다.');
        return;
      }
      nextHidden = [...currentHidden, colId];
    }
    const updated = { ...hiddenColumnsByDb, [activeDb.id]: nextHidden };
    setHiddenColumnsByDb(updated);
    localStorage.setItem('nyj_custom_db_hidden_cols', JSON.stringify(updated));
  };

  const showAllDbColumns = () => {
    if (!activeDb) return;
    const updated = { ...hiddenColumnsByDb, [activeDb.id]: [] };
    setHiddenColumnsByDb(updated);
    localStorage.setItem('nyj_custom_db_hidden_cols', JSON.stringify(updated));
  };

  // Filtered Records
  const filteredRecords = useMemo(() => {
    if (!activeDb || !activeDb.records) return [];
    if (!searchQuery.trim()) return activeDb.records;

    const query = searchQuery.toLowerCase();
    return activeDb.records.filter(record => {
      return Object.values(record).some(val => 
        String(val || '').toLowerCase().includes(query)
      );
    });
  }, [activeDb, searchQuery]);

  // Add / Edit Record in active database
  const handleSaveRecord = (recordData) => {
    if (!activeDb) return;
    const exists = activeDb.records.some(r => r.id === recordData.id);
    let updatedRecords;
    if (exists) {
      updatedRecords = activeDb.records.map(r => r.id === recordData.id ? recordData : r);
    } else {
      updatedRecords = [recordData, ...activeDb.records];
    }

    const updatedDb = {
      ...activeDb,
      records: updatedRecords,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onSaveDatabase(updatedDb);
  };

  // Delete Record
  const handleDeleteRecord = (recId) => {
    if (!window.confirm('이 데이터를 삭제하시겠습니까?')) return;
    const updatedDb = {
      ...activeDb,
      records: activeDb.records.filter(r => r.id !== recId),
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onSaveDatabase(updatedDb);
  };

  // Delete Database
  const handleDeleteDbClick = () => {
    if (!activeDb) return;
    if (databases.length <= 1) {
      alert('최소 1개 이상의 데이터베이스가 유지되어야 합니다.');
      return;
    }
    if (window.confirm(`'${activeDb.name}' 데이터베이스와 포함된 모든 데이터(${activeDb.records.length}건)를 완전히 삭제하시겠습니까?`)) {
      onDeleteDatabase(activeDb.id);
      const remaining = databases.filter(d => d.id !== activeDb.id);
      if (remaining.length > 0) {
        setSelectedDbId(remaining[0].id);
      }
    }
  };

  // Excel Export for Active Database
  const handleExportExcel = () => {
    if (!activeDb) return;
    const exportData = activeDb.records.map(rec => {
      const row = {};
      activeDb.columns.forEach(col => {
        let val = rec[col.id];
        if (col.type === 'currency' && val) {
          val = Number(val);
        }
        row[col.name] = val ?? '';
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeDb.name.slice(0, 30));
    XLSX.writeFile(workbook, `${activeDb.name}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (!activeDb && databases.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">등록된 데이터베이스가 없습니다</h3>
        <button
          onClick={() => {
            setEditingDb(null);
            setIsSchemaModalOpen(true);
          }}
          className="mt-4 px-4 py-2 rounded-lg bg-teal-600 text-white font-bold text-xs"
        >
          + 첫 데이터베이스 만들기
        </button>
      </div>
    );
  }

  const IconComp = DB_ICONS[activeDb?.icon] || Database;

  return (
    <div className="space-y-4 mb-8">
      
      {/* 1. Database Selector Tabs */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {databases.map(db => {
            const isSelected = db.id === activeDb?.id;
            const TabIcon = DB_ICONS[db.icon] || Database;

            return (
              <button
                key={db.id}
                onClick={() => setSelectedDbId(db.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition shrink-0 border ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <TabIcon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-teal-600'}`} />
                <span>{db.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isSelected ? 'bg-teal-700/80 text-teal-100' : 'bg-slate-200 text-slate-600'
                }`}>
                  {db.records?.length || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Create new DB button */}
        <button
          onClick={() => {
            setEditingDb(null);
            setIsSchemaModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shrink-0 transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-teal-400" />
          <span>+ 새 DB 추가</span>
        </button>
      </div>

      {/* 2. Active Database Header & Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Info */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
            <IconComp className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">{activeDb.name}</h2>
              <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-600">
                컬럼 {activeDb.columns.length}개
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeDb.description || '맞춤형 업무 데이터 관리'} • 최종수정: {activeDb.updatedAt || '최근'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setEditingDb(activeDb);
              setIsSchemaModalOpen(true);
            }}
            title="데이터베이스 항목(컬럼) 수정"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs transition shadow-xs"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
            <span>DB 항목 수정</span>
          </button>

          <button
            onClick={handleExportExcel}
            title="현재 DB 엑셀 다운로드"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>엑셀 다운로드</span>
          </button>

          <button
            onClick={handleDeleteDbClick}
            title="데이터베이스 전체 삭제"
            className="p-2 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setEditingRecord(null);
              setIsRecordModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition active:scale-95 ml-1"
          >
            <Plus className="w-4 h-4" />
            <span>새 데이터 등록</span>
          </button>
        </div>

      </div>

      {/* 3. Search Bar & Column Visibility Settings */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`${activeDb.name} 내 전체 데이터 검색...`}
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Column Visibility Popover Button */}
          <div className="relative">
            <button
              onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-teal-600" />
              <span>열 표시 설정 ({visibleColumns.length}/{activeDb.columns.length})</span>
            </button>

            {isColumnPickerOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsColumnPickerOpen(false)} 
                />
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-40 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 font-bold text-slate-800">
                    <span className="flex items-center gap-1">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                      표시할 열 선택
                    </span>
                    <button
                      onClick={showAllDbColumns}
                      className="text-[11px] text-teal-600 hover:underline font-bold"
                    >
                      전체표시
                    </button>
                  </div>

                  <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                    {activeDb.columns.map(col => {
                      const isVisible = visibleColumns.some(c => c.id === col.id);
                      return (
                        <label
                          key={col.id}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer select-none transition ${
                            isVisible ? 'text-slate-900 font-semibold bg-slate-50/50' : 'text-slate-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={() => toggleDbColumn(col.id)}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                          <span className="flex-1">{col.name}</span>
                          {col.unit && (
                            <span className="text-[10px] text-slate-400 font-normal">({col.unit})</span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-center">
                    <span>설정이 자동 저장됩니다</span>
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

          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            총 <strong className="text-slate-900">{filteredRecords.length}</strong>건 표시 중
          </span>
        </div>
      </div>

      {/* 4. Dynamic Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200 shadow-xs">
              <tr>
                <th className="py-3 px-3 w-12 text-center text-slate-400">#</th>
                {visibleColumns.map(col => (
                  <th 
                    key={col.id}
                    className={`py-3 px-3 whitespace-nowrap ${
                      col.type === 'number' || col.type === 'currency' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <span>{col.name}</span>
                    {col.unit && <span className="text-slate-400 font-normal ml-0.5">({col.unit})</span>}
                  </th>
                ))}
                <th className="py-3 px-3 text-center whitespace-nowrap w-20">관리</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>등록된 데이터가 없습니다. 우측 상단 [+ 새 데이터 등록]을 눌러 데이터를 추가하세요.</span>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, index) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                      {index + 1}
                    </td>

                    {visibleColumns.map(col => {
                      const val = rec[col.id];

                      return (
                        <td 
                          key={col.id} 
                          className={`py-2.5 px-3 ${
                            col.type === 'number' || col.type === 'currency' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {/* Currency */}
                          {col.type === 'currency' && (
                            <span className="font-bold text-slate-900">
                              {val !== undefined && val !== '' && val !== null ? formatCurrency(val) : '-'}
                            </span>
                          )}

                          {/* Number */}
                          {col.type === 'number' && (
                            <span className="font-semibold text-slate-800">
                              {val !== undefined && val !== '' && val !== null ? `${Number(val).toLocaleString()} ${col.unit || ''}` : '-'}
                            </span>
                          )}

                          {/* Select tag */}
                          {col.type === 'select' && (
                            val ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {val}
                              </span>
                            ) : '-'
                          )}

                          {/* Date */}
                          {col.type === 'date' && (
                            <span className="text-slate-600 font-medium">
                              {val || '-'}
                            </span>
                          )}

                          {/* Textarea */}
                          {col.type === 'textarea' && (
                            <span className="text-slate-700 line-clamp-2 max-w-xs">
                              {val || '-'}
                            </span>
                          )}

                          {/* Regular text */}
                          {col.type === 'text' && (
                            <span className="font-medium text-slate-900">
                              {val || '-'}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingRecord(rec);
                            setIsRecordModalOpen(true);
                          }}
                          title="수정"
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          title="삭제"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>💡 [열 표시 설정]으로 필요한 열만 보거나, [DB 항목 수정]으로 새 컬럼을 추가/수정할 수 있습니다.</span>
          <span>남양주체육문화센터 맞춤형 업무 데이터베이스</span>
        </div>
      </div>

      {/* Schema Designer Modal */}
      <DatabaseSchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => {
          setIsSchemaModalOpen(false);
          setEditingDb(null);
        }}
        onSave={savedDb => {
          onSaveDatabase(savedDb);
          setSelectedDbId(savedDb.id);
        }}
        editingDb={editingDb}
      />

      {/* Record Add/Edit Modal */}
      <DatabaseRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        database={activeDb}
        editingRecord={editingRecord}
      />

    </div>
  );
}
