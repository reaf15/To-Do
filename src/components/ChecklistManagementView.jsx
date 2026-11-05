import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ListChecks, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Eye, 
  CheckSquare, 
  Square,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const DEFAULT_CHECKLIST_TEMPLATES = [
  { id: 'CHK-1', title: '현장 실측 및 사전 답사', description: '현장 치수 확인 및 시공 여건 사전 답사', order: 1, active: true },
  { id: 'CHK-2', title: '복수 비교견적서 징구', description: '2개 이상 업체 비교견적 확보 및 단가 비교', order: 2, active: true },
  { id: 'CHK-3', title: '일상감사 및 품의 결재', description: '일상감사 요청 및 수선 공사 내부 품의 결재 완료', order: 3, active: true },
  { id: 'CHK-4', title: '계약 체결 및 시공일정 협의', description: '시공 업체 선정 및 세부 공사 일정 조율', order: 4, active: true },
  { id: 'CHK-5', title: '착공계 접수 및 현장 안전점검', description: '공사 착공계 확인 및 근로자 안전 점검', order: 5, active: true },
  { id: 'CHK-6', title: '준공검사 및 검수조서 작성', description: '현장 준공 확인 및 검수조서 사진 대지 작성', order: 6, active: true },
  { id: 'CHK-7', title: '세금계산서 및 공사대금 정산', description: '전자세금계산서 청구 및 회계팀 지출 결의', order: 7, active: true }
];

export default function ChecklistManagementView({
  templates = DEFAULT_CHECKLIST_TEMPLATES,
  onSaveTemplates,
  onBackToApp
}) {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [previewChecked, setPreviewChecked] = useState({});

  // Sort items by order
  const sortedTemplates = [...templates].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Add new item
  const handleAddItem = (e) => {
    e?.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    const newItem = {
      id: `CHK-${Date.now()}`,
      title: title,
      description: newDesc.trim(),
      order: sortedTemplates.length + 1,
      active: true
    };

    const updated = [...sortedTemplates, newItem];
    onSaveTemplates(updated);
    setNewTitle('');
    setNewDesc('');
  };

  // Toggle active state
  const handleToggleActive = (id) => {
    const updated = sortedTemplates.map(item => 
      item.id === id ? { ...item, active: !item.active } : item
    );
    onSaveTemplates(updated);
  };

  // Delete item
  const handleDeleteItem = (id, title) => {
    if (window.confirm(`'${title}' 체크박스 항목을 삭제하시겠습니까?\n삭제 후 새 공사 등록창 목록에서 제외됩니다.`)) {
      const updated = sortedTemplates
        .filter(item => item.id !== id)
        .map((item, idx) => ({ ...item, order: idx + 1 }));
      onSaveTemplates(updated);
    }
  };

  // Move up/down
  const handleMoveOrder = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sortedTemplates.length) return;

    const reordered = [...sortedTemplates];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const updated = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    onSaveTemplates(updated);
  };

  // Start inline editing
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDesc(item.description || '');
  };

  // Save edit
  const handleSaveEdit = (id) => {
    const title = editTitle.trim();
    if (!title) return;

    const updated = sortedTemplates.map(item => 
      item.id === id ? { ...item, title: title, description: editDesc.trim() } : item
    );
    onSaveTemplates(updated);
    setEditingId(null);
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    if (window.confirm('공공기관 표준 공사 체크박스 항목(7개)으로 초기화하시겠습니까?\n기존에 추가하신 항목은 기본값으로 대체됩니다.')) {
      onSaveTemplates(DEFAULT_CHECKLIST_TEMPLATES);
    }
  };

  // Preview toggle check
  const handleTogglePreview = (id) => {
    setPreviewChecked(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const activeTemplates = sortedTemplates.filter(t => t.active);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900 rounded-2xl text-white p-5 sm:p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400 mb-1.5 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                시스템 관리
              </span>
              <span>&gt;</span>
              <span className="text-teal-300">공사 체크박스 항목 관리</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              <ListChecks className="w-6 h-6 text-teal-400" />
              <span>공사 점검 체크박스 마스터 관리</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-2xl">
              새 공사 등록 및 수정 창에 표시될 **체크박스 항목을 중앙에서 관리**합니다.
              일반 직원은 체크/해제만 가능하며, **항목의 생성·수정·삭제는 오직 이 시스템 관리 화면에서만** 가능합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetToDefaults}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer shadow-xs"
              title="공공기관 표준 7개 항목으로 기본값 복원"
            >
              <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
              <span>기본 항목 복원</span>
            </button>
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition cursor-pointer shadow-xs active:scale-95"
              >
                <span>대시보드로 돌아가기</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Grid: Left Management Form & List / Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column (2 spans): Creation Form & Item List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Create New Item Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4 text-teal-600 stroke-[3]" />
              <span>새 체크박스 항목 생성</span>
            </h2>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    항목명 (필수) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="예: 현장 실측 및 사전 답사"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    세부 설명 (선택)
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="예: 현장 치수 확인 및 시공 여건 답사"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:cursor-not-allowed active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>새 체크박스 항목 등록</span>
                </button>
              </div>
            </form>
          </div>

          {/* Items List Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-800">
                  등록된 체크박스 항목 목록 ({sortedTemplates.length}개)
                </h2>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  활성 {activeTemplates.length}개
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                위/아래 화살표로 순서 조정 가능
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {sortedTemplates.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  등록된 체크박스 항목이 없습니다. 상단에서 새 항목을 추가해보세요.
                </div>
              ) : (
                sortedTemplates.map((item, index) => {
                  const isEditing = editingId === item.id;

                  return (
                    <div 
                      key={item.id}
                      className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition ${
                        item.active ? 'bg-white hover:bg-slate-50/60' : 'bg-slate-50/40 opacity-60'
                      }`}
                    >
                      {/* Left: Reorder & Status & Content */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Order Controls */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveOrder(index, -1)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition"
                            title="위로 이동"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === sortedTemplates.length - 1}
                            onClick={() => handleMoveOrder(index, 1)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition"
                            title="아래로 이동"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Order Number Badge */}
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-black shrink-0 border border-slate-200">
                          {index + 1}
                        </span>

                        {/* Text / Edit Inputs */}
                        {!isEditing ? (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {item.title}
                              </span>
                              {!item.active && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                                  미사용
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col sm:flex-row gap-2 min-w-0">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 px-2.5 py-1 text-xs font-bold border border-teal-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                              placeholder="항목명"
                              autoFocus
                            />
                            <input
                              type="text"
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                              placeholder="세부 설명"
                            />
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isEditing ? (
                          <>
                            {/* Toggle Active Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleActive(item.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                                item.active 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                  : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                              }`}
                              title={item.active ? "현재 공사 등록창에 노출 중 (클릭 시 숨김)" : "현재 숨김 상태 (클릭 시 노출)"}
                            >
                              {item.active ? '노출 중' : '숨김'}
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="항목명 수정"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id, item.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="항목 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(item.id)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-600 hover:bg-teal-700 text-white transition cursor-pointer shadow-2xs flex items-center gap-1"
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>저장</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Live Interactive Preview in Task Modal */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs sticky top-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-slate-800">
                  새 공사 등록창 화면 미리보기
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                실제 작동 시뮬레이션
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              아래 박스는 사용자가 **새 공사 등록창**을 열었을 때 실제로 보게 되는 체크박스 UI입니다. 직접 체크/해제해보세요.
            </p>

            {/* Simulated Checklist Box from TaskModal */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                  <CheckSquare className="w-4 h-4 text-teal-600" />
                  <span>공사 점검 체크박스</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    {activeTemplates.filter(t => previewChecked[t.id]).length} / {activeTemplates.length} 완료
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {activeTemplates.length > 0 ? Math.round((activeTemplates.filter(t => previewChecked[t.id]).length / activeTemplates.length) * 100) : 0}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-1.5 bg-teal-500 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${activeTemplates.length > 0 ? Math.round((activeTemplates.filter(t => previewChecked[t.id]).length / activeTemplates.length) * 100) : 0}%` 
                  }}
                />
              </div>

              {/* Checkbox Items */}
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {activeTemplates.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 text-[11px]">
                    활성화된 체크박스 항목이 없습니다.
                  </div>
                ) : (
                  activeTemplates.map((item) => {
                    const isChecked = Boolean(previewChecked[item.id]);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => handleTogglePreview(item.id)}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border transition cursor-pointer select-none ${
                          isChecked 
                            ? 'bg-emerald-50/70 border-emerald-200' 
                            : 'bg-white border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick
                          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600 mt-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs ${isChecked ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-bold'}`}>
                            {item.title}
                          </div>
                          {item.description && (
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Notice to User */}
              <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200/80 text-[10px] text-slate-500 flex items-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  공사 등록창에서는 직원이 항목을 임의로 추가하거나 삭제할 수 없으며, 체크 여부만 기록됩니다.
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
