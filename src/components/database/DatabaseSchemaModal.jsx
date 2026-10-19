import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Layers, 
  AlertCircle, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { COLUMN_TYPES } from '../../data/initialDatabases';

export default function DatabaseSchemaModal({
  isOpen,
  onClose,
  onSave,
  editingDb
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('teal');
  const [columns, setColumns] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingDb) {
      setName(editingDb.name || '');
      setDescription(editingDb.description || '');
      setColor(editingDb.color || 'teal');
      setColumns(
        (editingDb.columns || []).map(col => ({
          ...col,
          optionsInput: (col.options || []).join(', ')
        }))
      );
    } else {
      // Default empty template for new DB
      setName('');
      setDescription('');
      setColor('teal');
      setColumns([
        { id: 'col_1', name: '관리번호', type: 'text', required: true, optionsInput: '' },
        { id: 'col_2', name: '품명/항목명', type: 'text', required: true, optionsInput: '' },
        { id: 'col_3', name: '수량', type: 'number', unit: '개', required: false, optionsInput: '' },
        { id: 'col_4', name: '상태', type: 'select', options: ['양호', '주의', '수리필요'], optionsInput: '양호, 주의, 수리필요', required: false },
        { id: 'col_5', name: '비고', type: 'textarea', required: false, optionsInput: '' }
      ]);
    }
    setErrors({});
  }, [editingDb, isOpen]);

  if (!isOpen) return null;

  const handleAddColumn = () => {
    const newId = `col_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setColumns(prev => [
      ...prev,
      {
        id: newId,
        name: `새 항목 ${prev.length + 1}`,
        type: 'text',
        required: false,
        optionsInput: '',
        options: []
      }
    ]);
  };

  const handleRemoveColumn = (colId) => {
    if (columns.length <= 1) {
      alert('데이터베이스에는 최소 1개 이상의 컬럼(항목)이 있어야 합니다.');
      return;
    }
    setColumns(prev => prev.filter(c => c.id !== colId));
  };

  const handleColumnChange = (colId, field, value) => {
    setColumns(prev =>
      prev.map(c => {
        if (c.id === colId) {
          const updated = { ...c, [field]: value };
          if (field === 'optionsInput') {
            updated.options = value
              .split(',')
              .map(s => s.trim())
              .filter(Boolean);
          }
          return updated;
        }
        return c;
      })
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = '데이터베이스 이름을 입력해주세요.';
    }

    const emptyCol = columns.some(c => !c.name.trim());
    if (emptyCol) {
      newErrors.columns = '모든 컬럼의 항목명을 입력해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      id: editingDb ? editingDb.id : `db-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      color,
      icon: 'Database',
      createdAt: editingDb?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      columns: columns.map(c => ({
        id: c.id,
        name: c.name.trim(),
        type: c.type,
        required: Boolean(c.required),
        unit: c.unit || '',
        options: c.type === 'select' 
          ? (c.optionsInput || '').split(',').map(s => s.trim()).filter(Boolean)
          : undefined
      })),
      records: editingDb?.records || []
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {editingDb ? '데이터베이스 구조(항목) 수정' : '새 업무 데이터베이스 만들기'}
              </h3>
              <p className="text-xs text-slate-400">
                필요한 업무 대장의 이름과 관리할 항목(컬럼)을 직접 설계하세요
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* DB Name & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                데이터베이스 이름 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="예: 수영장 수질 점검표, 헬스장 락커 배정표"
                className={`w-full px-3 py-2 rounded-lg border font-bold text-sm ${
                  errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-teal-500/20 focus:border-teal-500'
                }`}
              />
              {errors.name && (
                <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                테마 색상
              </label>
              <select
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="teal">청록색 (Teal)</option>
                <option value="blue">파란색 (Blue)</option>
                <option value="indigo">남색 (Indigo)</option>
                <option value="purple">보라색 (Purple)</option>
                <option value="amber">주황/노란색 (Amber)</option>
                <option value="emerald">초록색 (Emerald)</option>
                <option value="rose">장미색 (Rose)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              업무 설명 / 용도 안내
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="예: 센터 일일 수질 상태 및 약품 투입 기록 대장"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
            />
          </div>

          {/* Columns Designer */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-bold text-slate-800 text-xs">
                  항목(컬럼) 설계 ({columns.length}개)
                </h4>
                <p className="text-[11px] text-slate-400">
                  직원들이 입력할 각 데이터 열(항목)의 이름과 유형을 정합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddColumn}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold border border-teal-200 transition active:scale-95 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>항목 추가</span>
              </button>
            </div>

            {errors.columns && (
              <p className="text-rose-500 text-[11px] mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.columns}
              </p>
            )}

            {/* Column Cards List */}
            <div className="space-y-2.5 max-h-[42vh] overflow-y-auto pr-1">
              {columns.map((col, index) => (
                <div 
                  key={col.id}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {index + 1}
                    </span>

                    {/* Column Name */}
                    <div className="flex-1">
                      <input
                        type="text"
                        value={col.name}
                        onChange={e => handleColumnChange(col.id, 'name', e.target.value)}
                        placeholder="항목명 (예: 물품명, 담당자)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-xs focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    {/* Column Type */}
                    <div className="w-40 shrink-0">
                      <select
                        value={col.type}
                        onChange={e => handleColumnChange(col.id, 'type', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-xs focus:ring-1 focus:ring-teal-500"
                      >
                        {COLUMN_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Required Toggle */}
                    <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer select-none whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={Boolean(col.required)}
                        onChange={e => handleColumnChange(col.id, 'required', e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>필수</span>
                    </label>

                    {/* Delete Column */}
                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(col.id)}
                      title="항목 삭제"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* If Select type: enter comma-separated options */}
                  {col.type === 'select' && (
                    <div className="pl-7 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">선택 옵션:</span>
                      <input
                        type="text"
                        value={col.optionsInput || ''}
                        onChange={e => handleColumnChange(col.id, 'optionsInput', e.target.value)}
                        placeholder="콤마(,)로 구분하여 입력 (예: 접수, 처리중, 완료)"
                        className="flex-1 px-2 py-1 rounded border border-slate-300 bg-white text-[11px]"
                      />
                    </div>
                  )}

                  {/* If Number type: optional unit */}
                  {col.type === 'number' && (
                    <div className="pl-7 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">단위:</span>
                      <input
                        type="text"
                        value={col.unit || ''}
                        onChange={e => handleColumnChange(col.id, 'unit', e.target.value)}
                        placeholder="예: 개, 회, km, kg"
                        className="w-24 px-2 py-1 rounded border border-slate-300 bg-white text-[11px]"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{editingDb ? '설정 및 항목 저장' : '데이터베이스 생성하기'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
