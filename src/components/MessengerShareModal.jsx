import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { generateShareText, copyToClipboard } from '../utils/formatters';

export default function MessengerShareModal({
  isOpen,
  onClose,
  tasks,
  currentUser
}) {
  const [filterType, setFilterType] = useState('all');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  let filteredTasks = [...tasks];
  let title = '전체 공사 현황';

  if (filterType === 'my' && currentUser !== 'ALL') {
    filteredTasks = tasks.filter((t) => t.manager === currentUser);
    title = `${currentUser} 담당 공사 현황`;
  } else if (filterType === 'quotes') {
    filteredTasks = tasks.filter((t) => t.status === '견적의뢰' || t.status === '견적방문');
    title = '견적 진행 공사 현황';
  } else if (filterType === 'inProgress') {
    filteredTasks = tasks.filter((t) => t.status !== '완료');
    title = '미완료 진행중 공사 현황';
  }

  const shareText = generateShareText(filteredTasks, title);

  const handleCopy = async () => {
    const ok = await copyToClipboard(shareText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">카카오톡 / 사내 메신저 업무 공유</h3>
              <p className="text-xs text-slate-400">클릭 한 번으로 복사하여 직원 단톡방이나 메신저에 공유하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Filter options */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">공유 범위 선택</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                onClick={() => setFilterType('all')}
                className={`py-1.5 px-2 rounded-lg font-bold border transition ${
                  filterType === 'all'
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                전체 ({tasks.length}건)
              </button>

              {currentUser !== 'ALL' && (
                <button
                  onClick={() => setFilterType('my')}
                  className={`py-1.5 px-2 rounded-lg font-bold border transition ${
                    filterType === 'my'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  내 담당 ({tasks.filter(t => t.manager === currentUser).length}건)
                </button>
              )}

              <button
                onClick={() => setFilterType('quotes')}
                className={`py-1.5 px-2 rounded-lg font-bold border transition ${
                  filterType === 'quotes'
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                견적 진행건 ({tasks.filter(t => t.status === '견적의뢰' || t.status === '견적방문').length}건)
              </button>

              <button
                onClick={() => setFilterType('inProgress')}
                className={`py-1.5 px-2 rounded-lg font-bold border transition ${
                  filterType === 'inProgress'
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                진행중 ({tasks.filter(t => t.status !== '완료').length}건)
              </button>
            </div>
          </div>

          {/* Text preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">생성된 공유 텍스트 미리보기</label>
              <span className="text-[11px] text-slate-400">{filteredTasks.length}건 요약됨</span>
            </div>
            <textarea
              readOnly
              rows={12}
              value={shareText}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px] text-slate-800 leading-relaxed focus:outline-none select-all"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {copied ? '✅ 클립보드에 복사되었습니다! 메신저 창에 붙여넣기(Ctrl+V)하세요.' : '버튼을 누르면 전체 문구가 클립보드에 복사됩니다.'}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-md transition active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '복사 완료!' : '문구 전체 복사'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
