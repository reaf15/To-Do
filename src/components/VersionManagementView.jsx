import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Tag, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Copy, 
  Check, 
  Plus, 
  ShieldCheck, 
  Server, 
  Laptop, 
  ChevronRight, 
  Sparkles, 
  FileText, 
  ArrowLeft,
  X,
  RefreshCw,
  FolderArchive
} from 'lucide-react';
import { 
  INITIAL_VERSION_HISTORY, 
  CURRENT_SYSTEM_VERSION, 
  CURRENT_VERSION_DATE, 
  CURRENT_CHECKPOINT_TAG 
} from '../data/initialVersionHistory';

export default function VersionManagementView({ 
  onNavigateToBackup, 
  onNavigateBack,
  currentUser = '관리자'
}) {
  const [versionList, setVersionList] = useState(INITIAL_VERSION_HISTORY);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Version Form State
  const [newVersion, setNewVersion] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newChangesText, setNewChangesText] = useState('');

  // Fetch version history from API
  const fetchVersionHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/version-history');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setVersionList(data);
        }
      }
    } catch {
      // fallback to INITIAL_VERSION_HISTORY
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVersionHistory();
  }, []);

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleSaveNewVersion = async (e) => {
    e.preventDefault();
    if (!newVersion.trim() || !newTitle.trim()) {
      alert('버전 번호와 제목을 입력해 주세요.');
      return;
    }

    const changes = newChangesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newItem = {
      version: newVersion.trim(),
      releaseDate: newDate,
      title: newTitle.trim(),
      tag: newTag.trim() || `checkpoint-${newDate.replace(/-/g, '')}`,
      isCurrent: true,
      changes: changes.length > 0 ? changes : ['기능 개선 및 안정화']
    };

    const updated = [
      newItem,
      ...versionList.map((v) => ({ ...v, isCurrent: false }))
    ];

    setVersionList(updated);
    setIsAddModalOpen(false);
    setNewVersion('');
    setNewTitle('');
    setNewTag('');
    setNewChangesText('');

    try {
      await fetch('/api/version-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {
      // local state already updated
    }
  };

  const currentVersionItem = versionList.find((v) => v.isCurrent) || versionList[0] || {
    version: CURRENT_SYSTEM_VERSION,
    releaseDate: CURRENT_VERSION_DATE,
    title: '시스템 안정화 버전',
    tag: CURRENT_CHECKPOINT_TAG
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* 1. Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-700/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-indigo-300" />
                내 컴퓨터(호스트) 전용 관리 센터
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                안전 체크포인트 활성화
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-indigo-400" />
              <span>시스템 버전 및 변경 이력 관리</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              시스템 업그레이드 내역을 체계적으로 추적하고, 문제 발생 시 언제든 안전한 기준 시점으로 되돌릴 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {onNavigateBack && (
              <button
                type="button"
                onClick={onNavigateBack}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>업무 화면으로</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>새 버전 기록</span>
            </button>
          </div>
        </div>

        {/* Current Version Highlight Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-700/60">
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">현재 가동 버전</div>
            <div className="text-lg sm:text-xl font-black text-amber-400 mt-0.5 flex items-center gap-1.5">
              <span>{currentVersionItem.version}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Latest
              </span>
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">최종 배포 일자</div>
            <div className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
              {currentVersionItem.releaseDate}
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">안전 복구 Git 태그</div>
            <div className="text-sm sm:text-base font-mono font-bold text-emerald-400 mt-0.5 truncate" title={currentVersionItem.tag}>
              {currentVersionItem.tag || CURRENT_CHECKPOINT_TAG}
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">접속 권한 모드</div>
            <div className="text-sm sm:text-base font-bold text-teal-300 mt-0.5 flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-teal-400" />
              <span>내 PC (호스트 관리자)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Version History Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-800">버전별 주요 업데이트 내역 (Changelog)</h3>
            </div>
            <span className="text-xs text-slate-400">총 {versionList.length}개 릴리즈</span>
          </div>

          <div className="space-y-4">
            {versionList.map((ver, idx) => (
              <div 
                key={ver.version}
                className={`bg-white rounded-xl p-5 border transition shadow-xs ${
                  ver.isCurrent 
                    ? 'border-indigo-300 ring-2 ring-indigo-500/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-black px-2.5 py-0.5 rounded-lg ${
                      ver.isCurrent 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ver.version}
                    </span>

                    {ver.isCurrent && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        현재 가동 중
                      </span>
                    )}

                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {ver.releaseDate}
                    </span>
                  </div>

                  {ver.tag && (
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      🏷️ {ver.tag}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-slate-900 mb-2">
                  {ver.title}
                </h4>

                {/* Changes List */}
                <ul className="space-y-1.5 pl-1">
                  {ver.changes.map((change, cIdx) => (
                    <li key={cIdx} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Rollback & Safety Guide */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-800">이전 상태 안전 복구 가이드</h3>
          </div>

          {/* Quick Rollback Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>작업 중 잘못되었을 때 즉시 복구</span>
              </div>
              업무를 진행하다가 설정이나 코드가 꼬였을 경우, 언제든 <strong>{CURRENT_SYSTEM_VERSION} (10월 23일 기준점)</strong>으로 깨끗하게 되돌릴 수 있습니다.
            </div>

            {/* Action 1: Ask AI */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>1. 가장 쉬운 복구 (AI 채팅창에 입력)</span>
                <button
                  type="button"
                  onClick={() => handleCopy('10월 23일 체크포인트 상태로 되돌려줘', 'ai-prompt')}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'ai-prompt' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'ai-prompt' ? '복사됨!' : '문구 복사'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800">
                "10월 23일 체크포인트 상태로 되돌려줘"
              </div>
            </div>

            {/* Action 2: Terminal Command */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>2. 터미널에서 직접 복구 명령어</span>
                <button
                  type="button"
                  onClick={() => handleCopy(`git reset --hard ${CURRENT_CHECKPOINT_TAG}; npm run build`, 'git-cmd')}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'git-cmd' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'git-cmd' ? '복사됨!' : '명령어 복사'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 text-emerald-300 font-mono text-[11px] leading-relaxed break-all">
                git reset --hard {CURRENT_CHECKPOINT_TAG}; npm run build
              </div>
            </div>

            {/* Action 3: Link to Data Backup/Restore */}
            {onNavigateToBackup && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onNavigateToBackup}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition text-xs font-bold cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <FolderArchive className="w-4 h-4 text-amber-500 group-hover:scale-110 transition" />
                    <span>공사·예산 데이터 백업/복구 바로가기</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1.5">
            <div className="font-bold text-slate-700 flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5 text-slate-600" />
              <span>내 컴퓨터 전용 화면 안내</span>
            </div>
            <p className="leading-relaxed">
              본 버전 관리 화면은 호스트 컴퓨터(localhost)에서 접속했을 때만 표시됩니다. 사내 다른 직원이나 스마트폰으로 접속한 화면에는 노출되지 않으므로 안심하고 관리하실 수 있습니다.
            </p>
          </div>

        </div>

      </div>

      {/* Add New Version Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-800 text-sm">새 버전 업데이트 기록</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewVersion} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">버전명 (예: v1.3.0)</label>
                <input
                  type="text"
                  required
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  placeholder="v1.3.0"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">배포 일자</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Git 태그 (선택)</label>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="checkpoint-..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">주요 업데이트 제목</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 보고서 자동 출력 및 예산 집계 기능 고도화"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">상세 변경 내역 (줄바꿈으로 구분)</label>
                <textarea
                  rows={4}
                  value={newChangesText}
                  onChange={(e) => setNewChangesText(e.target.value)}
                  placeholder="• 기능 1 개선&#10;• 버그 수정 및 최적화"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
                >
                  기록 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
