import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShieldCheck, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  FileSpreadsheet, 
  FileJson, 
  Plus, 
  RefreshCw, 
  Check, 
  FolderOpen,
  ChevronRight,
  HardDrive,
  Info,
  Layers,
  Building2,
  Hammer
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function BackupRestoreView({
  onRefreshAllData,
  addAuditLog,
  currentUser = '관리자'
}) {
  const [backups, setBackups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'daily' | 'manual' | 'checkpoint'

  // Manual snapshot memo input
  const [manualNote, setManualNote] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  // Restore Modal State
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState(null);

  // File upload state for PC file restore
  const fileInputRef = useRef(null);
  const [uploadFilePayload, setUploadFilePayload] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch backups list
  const fetchBackups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/backups');
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (err) {
      console.error('Failed to fetch backups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  // Filtered backups list
  const filteredBackups = useMemo(() => {
    if (activeFilter === 'ALL') return backups;
    return backups.filter(b => b.type === activeFilter);
  }, [backups, activeFilter]);

  // Create manual snapshot
  const handleCreateSnapshot = async (e) => {
    if (e) e.preventDefault();
    setIsCreatingSnapshot(true);
    try {
      const res = await fetch('/api/backups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'manual',
          note: manualNote.trim() || '관리자 수동 백업'
        })
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`수동 백업이 생성되었습니다: ${data.fileName}`);
        setManualNote('');
        fetchBackups();
        if (addAuditLog) {
          addAuditLog(`수동 데이터 백업 생성 (${data.fileName})`);
        }
      } else {
        showToast('백업 생성에 실패했습니다.', 'error');
      }
    } catch (err) {
      showToast('백업 생성 통신 오류', 'error');
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  // Handle restore confirmation
  const handleExecuteRestore = async () => {
    if (!restoreTarget) return;
    setIsRestoring(true);
    try {
      let bodyPayload = {};
      if (restoreTarget.isUpload) {
        bodyPayload = { backupData: restoreTarget.data };
      } else {
        bodyPayload = { fileName: restoreTarget.fileName };
      }

      const res = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (res.ok) {
        const result = await res.json();
        setRestoreResult(result);
        showToast('데이터가 성공적으로 복구되었습니다! (복구 직전 안전 체크포인트가 보존되었습니다)');
        if (addAuditLog) {
          addAuditLog(`데이터 복구 실행: [${restoreTarget.fileName || '업로드파일'}] 복원 완료`);
        }
        if (onRefreshAllData) {
          await onRefreshAllData();
        }
        fetchBackups();
      } else {
        showToast('데이터 복구에 실패했습니다.', 'error');
      }
    } catch (err) {
      showToast('데이터 복구 중 오류 발생', 'error');
    } finally {
      setIsRestoring(false);
      setRestoreTarget(null);
      setUploadFilePayload(null);
    }
  };

  // Handle file select from PC
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.data || (!parsed.data.tasks && !parsed.data.facilities)) {
          setUploadError('유효한 시스템 백업 JSON 파일이 아닙니다. (data 항목 누락)');
          setUploadFilePayload(null);
          return;
        }
        setUploadFilePayload({
          fileName: file.name,
          data: parsed,
          summary: parsed.summary || {
            tasksCount: (parsed.data.tasks || []).length,
            facilitiesCount: parsed.data.facilities ? Object.values(parsed.data.facilities).flat().length : 0
          }
        });
      } catch (err) {
        setUploadError('JSON 파일 파싱 실패: 파일이 손상되었거나 유효하지 않습니다.');
        setUploadFilePayload(null);
      }
    };
    reader.readAsText(file);
  };

  // Download entire live data as JSON to PC immediately
  const handleDownloadLiveJsonToPc = async () => {
    try {
      const res = await fetch('/api/backups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'manual', note: '내 PC 직접 보관용 백업' })
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = `/api/backups/download?file=${encodeURIComponent(data.fileName)}`;
        showToast('내 PC로 백업 파일이 다운로드되었습니다.');
        fetchBackups();
      }
    } catch (e) {
      showToast('다운로드 처리 오류', 'error');
    }
  };

  return (
    <div className="space-y-6 mb-12 select-none animate-in fade-in duration-200">
      
      {/* Toast message */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom duration-150 ${
          toastMessage.type === 'error'
            ? 'bg-rose-900 text-rose-100 border-rose-700'
            : 'bg-emerald-900 text-emerald-100 border-emerald-700'
        }`}>
          {toastMessage.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* ========================================================
          1. HEADER BANNER: 시스템 관리 > 데이터 백업 및 복구 안전 센터
         ======================================================== */}
      <div className="bg-slate-900 rounded-2xl text-white p-5 sm:p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                시스템 관리
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-amber-400 font-extrabold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                데이터 백업 및 안전 복구 센터
              </span>
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black shadow-inner shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
                  <span>데이터 백업 및 복구 관리</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    24시간 전자동 백업 가동 중
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  매일 자동 정기 백업본이 보관되며, 언제든 원하는 과거 시점으로 1초 만에 안전하게 복구할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Right quick stats */}
          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
            <button
              onClick={fetchBackups}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="백업 목록 새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>새로고침</span>
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================
          2. SAFETY ASSURANCE & ACTIONS CARDS (3대 안전 장치)
         ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: 즉시 수동 백업본 생성 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="text-sm font-black text-slate-900">즉시 수동 백업 생성</h3>
            <p className="text-xs text-slate-500">
              대규모 데이터 입력이나 주요 수정 전, 현재 시점의 스냅샷을 즉시 안전 보관함에 저장합니다.
            </p>
          </div>

          <form onSubmit={handleCreateSnapshot} className="space-y-2 pt-1">
            <input
              type="text"
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              placeholder="백업 메모 (예: 시설 점검 전 백업)"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={isCreatingSnapshot}
              className="w-full py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>{isCreatingSnapshot ? '백업 생성 중...' : '지금 백업본 생성'}</span>
            </button>
          </form>
        </div>

        {/* Card 2: 내 PC로 백업본 파일 다운로드 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900">내 PC로 백업파일 저장</h3>
            <p className="text-xs text-slate-500">
              서버뿐만 아니라 사용자 개인 PC나 USB 등 외부에 백업 원본 파일(.json)을 직접 다운로드해 보관합니다.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={handleDownloadLiveJsonToPc}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              <span>내 PC에 전체 백업 JSON 저장</span>
            </button>
            <a
              href="/master_data.xlsx"
              download="남양주도시공사_시설본부_전체통합데이터.xlsx"
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 block text-center"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>마스터 엑셀(.xlsx) 파일 보관</span>
            </a>
          </div>
        </div>

        {/* Card 3: 외부 파일 업로드 및 복구 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900">PC 보관 백업파일 복구</h3>
            <p className="text-xs text-slate-500">
              서버가 초기화되거나 새 컴퓨터로 이전했을 때, 소지한 백업 파일(.json)을 업로드하여 100% 복구합니다.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center justify-center gap-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>{uploadFilePayload ? `선택됨: ${uploadFilePayload.fileName}` : '내 PC 백업파일(.json) 선택'}</span>
            </button>

            {uploadError && (
              <p className="text-[11px] text-rose-600 font-semibold">{uploadError}</p>
            )}

            {uploadFilePayload && (
              <button
                onClick={() => setRestoreTarget({
                  fileName: uploadFilePayload.fileName,
                  title: `사용자 업로드 백업 (${uploadFilePayload.fileName})`,
                  isUpload: true,
                  data: uploadFilePayload.data,
                  summary: uploadFilePayload.summary
                })}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>이 파일로 데이터 복구 진행</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================
          3. SAFETY MECHANISM BANNER (체크포인트 안심 복구 보장 안내)
         ======================================================== */}
      <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <strong className="font-black text-teal-950 block">🛡️ 데이터 유실 0% 안심 복구 안전장치 (Pre-Restore Safeguard)</strong>
          <p className="text-teal-800">
            복구를 실행할 때마다 시스템이 <strong>복구 직전의 현재 운영 데이터를 '복구 전 안전 체크포인트(Checkpoint)'로 자동 생성하여 보존</strong>합니다. 
            따라서 실수로 이전 날짜를 잘못 선택하여 복구하더라도, 목록 상단의 체크포인트를 클릭 한 번으로 다시 불러와 원상태로 되돌릴 수 있습니다.
          </p>
        </div>
      </div>

      {/* ========================================================
          4. BACKUP ARCHIVES TABLE (서버 보관 백업 이력 목록)
         ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Header & Filter Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900">
              서버 백업 보관함
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-extrabold">
              총 {backups.length}개 보관
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition border ${
                activeFilter === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              전체 ({backups.length})
            </button>
            <button
              onClick={() => setActiveFilter('daily')}
              className={`px-2.5 py-1 rounded-lg font-bold transition border ${
                activeFilter === 'daily'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              일일 정기 ({backups.filter(b => b.type === 'daily').length})
            </button>
            <button
              onClick={() => setActiveFilter('manual')}
              className={`px-2.5 py-1 rounded-lg font-bold transition border ${
                activeFilter === 'manual'
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              수동 백업 ({backups.filter(b => b.type === 'manual').length})
            </button>
            <button
              onClick={() => setActiveFilter('checkpoint')}
              className={`px-2.5 py-1 rounded-lg font-bold transition border ${
                activeFilter === 'checkpoint'
                  ? 'bg-purple-700 text-white border-purple-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              체크포인트 ({backups.filter(b => b.type === 'checkpoint').length})
            </button>
          </div>
        </div>

        {/* Backups Table */}
        <div className="overflow-x-auto">
          {filteredBackups.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <Database className="w-8 h-8 mx-auto text-slate-300" />
              <p>해당 유형의 보관된 백업 파일이 없습니다.</p>
              <button
                onClick={handleCreateSnapshot}
                className="text-teal-600 font-bold hover:underline"
              >
                + 지금 새 백업본 생성하기
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="px-4 py-3">구분 / 유형</th>
                  <th className="px-4 py-3">생성 일시</th>
                  <th className="px-4 py-3">백업 명칭 / 메모</th>
                  <th className="px-4 py-3 text-center">수록 데이터 규모</th>
                  <th className="px-3 py-3 text-right">파일 용량</th>
                  <th className="px-4 py-3 text-center">다운로드</th>
                  <th className="px-4 py-3 text-center">복구 작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBackups.map((b) => {
                  const isDaily = b.type === 'daily';
                  const isCheckpoint = b.type === 'checkpoint';

                  return (
                    <tr key={b.fileName} className="hover:bg-slate-50/80 transition">
                      {/* Type Badge */}
                      <td className="px-4 py-3 font-bold">
                        {isDaily ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-max">
                            <Calendar className="w-3 h-3 text-emerald-600" />
                            일일 정기 백업
                          </span>
                        ) : isCheckpoint ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-800 border border-purple-300 flex items-center gap-1 w-max">
                            <ShieldCheck className="w-3 h-3 text-purple-600" />
                            안전 체크포인트
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-300 flex items-center gap-1 w-max">
                            <HardDrive className="w-3 h-3 text-blue-600" />
                            수동 백업
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                        {b.createdDate}
                      </td>

                      {/* Title & Note */}
                      <td className="px-4 py-3 text-slate-900 font-bold">
                        <div>{b.title}</div>
                        {b.note && b.note !== b.title && (
                          <div className="text-[11px] text-slate-400 font-normal">{b.note}</div>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{b.fileName}</div>
                      </td>

                      {/* Counts */}
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                          <span>공사 <strong>{b.summary?.tasksCount ?? 0}</strong>건</span>
                          <span className="text-slate-300">|</span>
                          <span>시설 <strong>{b.summary?.facilitiesCount ?? 0}</strong>개</span>
                          <span className="text-slate-300">|</span>
                          <span>예산 <strong>{b.summary?.budgetsCount ?? 0}</strong>부서</span>
                        </div>
                      </td>

                      {/* Size */}
                      <td className="px-3 py-3 text-right text-slate-600 font-mono">
                        {Math.round(b.size / 1024)} KB
                      </td>

                      {/* Download Buttons */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={`/api/backups/download?file=${encodeURIComponent(b.fileName)}`}
                            download={b.fileName}
                            title="백업 JSON 파일 다운로드"
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-300 transition flex items-center gap-1"
                          >
                            <FileJson className="w-3 h-3 text-amber-500" />
                            <span>JSON</span>
                          </a>
                          {b.hasExcel && (
                            <a
                              href={`/api/backups/download?file=${encodeURIComponent(b.fileName.replace('.json', '.xlsx'))}`}
                              download={b.fileName.replace('.json', '.xlsx')}
                              title="백업 Excel 파일 다운로드"
                              className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300 transition flex items-center gap-1"
                            >
                              <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                              <span>엑셀</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Restore Button */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => setRestoreTarget(b)}
                          className="px-3 py-1 rounded-lg text-xs font-black bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition active:scale-95 flex items-center gap-1 mx-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>복구하기</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* ========================================================
          5. RESTORE CONFIRMATION MODAL (안심 복구 모달)
         ======================================================== */}
      {restoreTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">데이터 복구 확인 및 안전 장치 안내</h3>
                <p className="text-xs text-slate-500">선택하신 백업 시점으로 시스템 데이터를 되돌립니다.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">복구 대상:</span>
                <strong className="text-slate-900">{restoreTarget.title}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">생성 일시:</span>
                <span className="font-mono text-slate-700">{restoreTarget.createdDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">수록 데이터:</span>
                <span className="font-bold text-teal-800">
                  공사 {restoreTarget.summary?.tasksCount ?? 0}건 / 시설 {restoreTarget.summary?.facilitiesCount ?? 0}개소
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
              <div className="font-black flex items-center gap-1.5 text-purple-950">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                안전 체크포인트 자동 생성
              </div>
              <p className="leading-relaxed text-[11px] text-purple-800">
                복구 시작 직전, <strong>현재 운영 중인 데이터가 [안전 체크포인트]로 자동 백업</strong>됩니다. 복구 후 마음에 들지 않거나 오작동 시 언제든 체크포인트를 통해 즉시 되돌릴 수 있습니다.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRestoreTarget(null)}
                disabled={isRestoring}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleExecuteRestore}
                disabled={isRestoring}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition active:scale-95 flex items-center gap-1.5"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
                <span>{isRestoring ? '데이터 복구 진행 중...' : '안전하게 데이터 복구 실행'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
