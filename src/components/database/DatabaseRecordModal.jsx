import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function DatabaseRecordModal({
  isOpen,
  onClose,
  onSave,
  database,
  editingRecord
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingRecord) {
      setFormData({ ...editingRecord });
    } else {
      const initial = {};
      (database?.columns || []).forEach(col => {
        if (col.type === 'select' && col.options && col.options.length > 0) {
          initial[col.id] = col.options[0];
        } else if (col.type === 'date') {
          initial[col.id] = new Date().toISOString().split('T')[0];
        } else {
          initial[col.id] = '';
        }
      });
      setFormData(initial);
    }
    setErrors({});
  }, [database, editingRecord, isOpen]);

  if (!isOpen || !database) return null;

  const handleChange = (colId, value) => {
    setFormData(prev => ({
      ...prev,
      [colId]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    (database.columns || []).forEach(col => {
      if (col.required && (!formData[col.id] || String(formData[col.id]).trim() === '')) {
        newErrors[col.id] = `${col.name} 항목을 입력해주세요.`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      ...formData,
      id: editingRecord ? editingRecord.id : `rec-${Date.now()}`
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold">
              {editingRecord ? '데이터 수정' : '새 데이터(행) 등록'}
            </h3>
            <p className="text-xs text-teal-400 mt-0.5">
              {database.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Form generated from columns */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {(database.columns || []).map(col => {
            const hasError = errors[col.id];

            return (
              <div key={col.id}>
                <label className="block font-bold text-slate-700 mb-1">
                  {col.name} {col.required && <span className="text-rose-500">*</span>}
                  {col.unit && <span className="text-slate-400 font-normal ml-1">({col.unit})</span>}
                </label>

                {/* 1. Date */}
                {col.type === 'date' && (
                  <input
                    type="date"
                    value={formData[col.id] || ''}
                    onChange={e => handleChange(col.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                )}

                {/* 2. Select */}
                {col.type === 'select' && (
                  <select
                    value={formData[col.id] || ''}
                    onChange={e => handleChange(col.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  >
                    <option value="">선택하세요</option>
                    {(col.options || []).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {/* 3. Number */}
                {col.type === 'number' && (
                  <div className="relative">
                    <input
                      type="number"
                      value={formData[col.id] ?? ''}
                      onChange={e => handleChange(col.id, e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="숫자 입력"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    {col.unit && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                        {col.unit}
                      </span>
                    )}
                  </div>
                )}

                {/* 4. Currency */}
                {col.type === 'currency' && (
                  <div>
                    <input
                      type="number"
                      value={formData[col.id] ?? ''}
                      onChange={e => handleChange(col.id, e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="금액(원) 입력"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <span className="text-[11px] text-teal-600 font-semibold mt-0.5 block">
                      {formData[col.id] ? formatCurrency(formData[col.id]) : '0원'}
                    </span>
                  </div>
                )}

                {/* 5. Textarea */}
                {col.type === 'textarea' && (
                  <textarea
                    rows={3}
                    value={formData[col.id] || ''}
                    onChange={e => handleChange(col.id, e.target.value)}
                    placeholder={`${col.name} 입력`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                )}

                {/* 6. Default Text */}
                {col.type === 'text' && (
                  <input
                    type="text"
                    value={formData[col.id] || ''}
                    onChange={e => handleChange(col.id, e.target.value)}
                    placeholder={`${col.name} 입력`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                )}

                {hasError && (
                  <p className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {hasError}
                  </p>
                )}
              </div>
            );
          })}

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
              <span>{editingRecord ? '수정 완료' : '등록하기'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
