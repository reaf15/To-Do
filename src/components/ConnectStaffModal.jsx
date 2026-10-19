import React, { useState } from 'react';
import { 
  X, 
  Wifi, 
  Copy, 
  Check, 
  Monitor, 
  Smartphone, 
  ShieldAlert, 
  Users, 
  ExternalLink,
  Sparkles,
  Server
} from 'lucide-react';
import { copyToClipboard } from '../utils/formatters';

export default function ConnectStaffModal({
  isOpen,
  onClose,
  serverInfo
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const serverIp = serverInfo?.ip || '192.168.101.96';
  const port = serverInfo?.port || 5173;
  const accessUrl = `http://${serverIp}:${port}`;

  const handleCopy = async () => {
    const ok = await copyToClipboard(accessUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">다른 직원 접속 안내</h3>
              <p className="text-xs text-teal-300">사내망(Wi-Fi/유선랜)을 통해 모든 직원이 동시 접속 가능</p>
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
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Main URL Box */}
          <div className="bg-teal-50/80 border-2 border-teal-500/40 rounded-xl p-4 text-center">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block mb-1">
              다른 직원 PC 및 스마트폰 접속 주소
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 select-all my-2 font-mono bg-white py-2 px-3 rounded-lg border border-teal-200 shadow-inner inline-block max-w-full truncate">
              {accessUrl}
            </div>

            <div className="mt-2 flex items-center justify-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition active:scale-95"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '주소 복사 완료!' : '접속 주소 복사하기'}</span>
              </button>
            </div>
          </div>

          {/* Real-time Sync Feature Note */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex items-start gap-2.5">
            <Server className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-slate-700 leading-relaxed">
              <strong className="text-blue-900 block font-bold mb-0.5">실시간 데이터 자동 동기화 적용됨</strong>
              어떤 직원이 업무 상태를 바꾸거나 새 일지/견적가를 입력하면, 이 컴퓨터의 중앙 데이터에 자동 저장되어 **모든 직원의 화면에 실시간으로 반영**됩니다.
            </div>
          </div>

          {/* Step by Step Guide */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-600" />
              <span>접속 방법 (3초 요약)</span>
            </h4>

            <div className="space-y-2">
              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-slate-900">사내 네트워크 확인:</strong>
                  <p className="text-slate-500 mt-0.5">접속할 직원의 PC 또는 스마트폰이 센터 내 동일한 Wi-Fi나 유선 LAN에 연결되어 있는지 확인합니다.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-slate-900">브라우저(Chrome/Edge) 주소창에 입력:</strong>
                  <p className="text-slate-500 mt-0.5">
                    주소창에 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-800">{accessUrl}</code> 을 입력하고 접속합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-900">담당자 선택 후 바로 사용:</strong>
                  <p className="text-slate-500 mt-0.5">상단 접속자에서 본인 이름(김일호, 권병학, 조현호)을 선택하면 내 담당 업무만 모아서 보거나 업무 일지를 남길 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting Tips */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-slate-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>접속이 안 될 때 (체크사항)</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 pl-1">
              <li>현재 호스트 PC에서 <code className="bg-amber-100 px-1 rounded">실행하기.bat</code> 검은색 콘솔 창이 켜져 있어야 합니다.</li>
              <li>윈도우 방화벽 알림창이 떴을 때 <strong>[액세스 허용]</strong>을 눌러주셔야 외부 접속이 가능합니다.</li>
              <li>모바일 접속 시 LTE/5G가 아닌 센터 사무실 Wi-Fi에 연결되어 있어야 합니다.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
}
