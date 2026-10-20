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
  Server,
  QrCode,
  Globe,
  Cloud
} from 'lucide-react';
import { copyToClipboard } from '../utils/formatters';

export default function ConnectStaffModal({
  isOpen,
  onClose,
  serverInfo
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('wifi'); // 'wifi' | 'cloud'

  if (!isOpen) return null;

  const serverIp = serverInfo?.ip || '192.168.101.96';
  const port = serverInfo?.port || 5173;
  const accessUrl = `http://${serverIp}:${port}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=2&data=${encodeURIComponent(accessUrl)}`;

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
        className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">스마트폰 및 직원 접속 안내</h3>
              <p className="text-xs text-teal-300">스마트폰 카메라로 QR 코드를 찍거나 주소를 입력하여 접속합니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('wifi')}
            className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'wifi'
                ? 'border-teal-600 text-teal-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>1. 사내 Wi-Fi 즉시 접속 (QR코드)</span>
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'cloud'
                ? 'border-teal-600 text-teal-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>2. 외부/LTE 24시간 배포 안내</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB 1: 사내 Wi-Fi 및 QR 코드 접속 */}
          {activeTab === 'wifi' && (
            <>
              {/* QR Code & Main URL Box */}
              <div className="bg-teal-50/90 border-2 border-teal-500/40 rounded-2xl p-4 text-center">
                <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider block mb-2">
                  스마트폰 카메라로 아래 QR 코드를 비추면 즉시 열립니다
                </span>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-2">
                  {/* QR Image */}
                  <div className="bg-white p-2.5 rounded-xl border border-teal-200 shadow-sm flex flex-col items-center shrink-0">
                    <img 
                      src={qrUrl} 
                      alt="접속용 QR코드" 
                      className="w-32 h-32 rounded-lg"
                    />
                    <span className="text-[10px] text-teal-800 font-extrabold mt-1.5 flex items-center gap-1">
                      <QrCode className="w-3 h-3" />
                      카메라로 스캔
                    </span>
                  </div>

                  {/* Direct URL */}
                  <div className="flex-1 text-left w-full sm:w-auto">
                    <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                      또는 스마트폰 주소창에 직접 입력:
                    </span>
                    <div className="text-sm sm:text-base font-black text-slate-900 select-all font-mono bg-white py-2 px-3 rounded-lg border border-teal-200 shadow-inner truncate">
                      {accessUrl}
                    </div>

                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? '주소 복사됨!' : '주소 복사하기'}</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-teal-700 font-bold block mt-1.5">
                      ※ 스마트폰이 센터 사무실 Wi-Fi에 연결되어 있어야 합니다.
                    </span>
                  </div>
                </div>
              </div>

              {/* Home Screen App Icon Tip (PWA) */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900 mb-1">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <span>스마트폰 홈 화면에 '진짜 앱'처럼 추가하는 방법</span>
                </div>
                <div className="space-y-1 text-slate-600 text-[11px] leading-relaxed">
                  <p>• <strong>아이폰 (Safari)</strong>: 하단 공유 버튼(<span className="font-bold">↑</span>) 터치 후 <code className="bg-indigo-100 text-indigo-800 font-bold px-1 rounded">[홈 화면에 추가]</code></p>
                  <p>• <strong>안드로이드 (Chrome)</strong>: 우측 상단 메뉴(<span className="font-bold">⋮</span>) 터치 후 <code className="bg-indigo-100 text-indigo-800 font-bold px-1 rounded">[홈 화면에 추가]</code> 또는 <code className="bg-indigo-100 text-indigo-800 font-bold px-1 rounded">[앱 설치]</code></p>
                  <p className="text-indigo-800 font-semibold pt-1">👉 스마트폰 바탕화면에 앱 아이콘이 생성되어 터치 한 번으로 바로 열립니다!</p>
                </div>
              </div>

              {/* Check Requirements */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 space-y-1.5 text-[11px]">
                <strong className="text-slate-800 block font-bold">💡 접속 전 확인사항</strong>
                <p>1. 현재 이 컴퓨터가 켜져 있어야 합니다. (화면 절전모드는 '안함' 설정 권장)</p>
                <p>2. 스마트폰의 Wi-Fi가 사무실 내부 Wi-Fi로 켜져 있는지 확인하세요.</p>
              </div>
            </>
          )}

          {/* TAB 2: 외부 / LTE 24시간 배포 안내 */}
          {activeTab === 'cloud' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  <span>사무실 밖(LTE/5G)에서도 24시간 언제나 접속하려면?</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  현재는 사내 Wi-Fi 상태에서만 접속됩니다. 현장 출장이나 외부에서도 PC를 끈 채로 스마트폰에서 상시 사용하려면 <strong>인터넷 클라우드 무료 배포</strong>를 진행하시면 됩니다.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong className="text-slate-900 block font-bold text-xs">방법 1: 클라우드타입(Cloudtype) 또는 Render (가장 추천)</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    • 내 PC를 꺼도 24시간 상시 가동<br/>
                    • 스마트폰 LTE로 전 세계 어디서든 <code className="bg-slate-200 text-slate-800 px-1 rounded">https://nyj-fms.cloudtype.app</code> 같은 인터넷 보안 주소로 접속 가능<br/>
                    • 무료 플랜으로 간편하게 시작 가능
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong className="text-slate-900 block font-bold text-xs">방법 2: Cloudflare Tunnel (PC를 켜두는 경우)</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    • 공유기 포트포워딩 없이 내 PC의 5173 포트를 외부 인터넷 주소로 즉시 연결<br/>
                    • 무료 HTTPS 인터넷 도메인이 발급되어 LTE 스마트폰에서 바로 접속
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong className="text-slate-900 block font-bold text-xs">방법 3: 공사 전산망 서버 또는 모바일 VPN</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    • 공공기관 보안 규정에 따라 공사 전산실 내부 서버에 설치<br/>
                    • 직원들은 공사 업무용 VPN 앱을 켜고 안전하게 내부 접속
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
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
