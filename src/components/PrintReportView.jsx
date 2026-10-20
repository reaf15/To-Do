import React from 'react';
import { Printer, ArrowLeft, Building2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function PrintReportView({
  tasks,
  onClose
}) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalCost = tasks.reduce((sum, t) => sum + (Number(t.estimatedCost) || 0), 0);
  const totalQuote = tasks.reduce((sum, t) => sum + (Number(t.quoteAmount) || 0), 0);
  const totalContract = tasks.reduce((sum, t) => sum + (Number(t.contractAmount) || 0), 0);
  
  // 집행 예정금액 (우선순위: 1.계약금액 > 2.견적가 > 3.예상비용)
  const totalPlannedCost = tasks.reduce((sum, t) => {
    const c = Number(t.contractAmount) || 0;
    if (c > 0) return sum + c;
    const q = Number(t.quoteAmount) || 0;
    if (q > 0) return sum + q;
    const e = Number(t.estimatedCost) || 0;
    if (e > 0) return sum + e;
    return sum;
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      {/* Top action bar (hidden when printing) */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>업무 화면으로 돌아가기</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            인쇄 시 A4 가로 방향(Landscape) 설정을 권장합니다.
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>즉시 인쇄 (Ctrl+P)</span>
          </button>
        </div>
      </div>

      {/* Official Printable Sheet Container */}
      <div className="max-w-7xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-slate-300 table-print-container">
        
        {/* Document Header & Approval Box */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-slate-900 pb-6 mb-6">
          <div>
            <div className="text-xs font-bold text-teal-700 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>남양주도시공사 시설관리 시스템</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              시설·수선유지 공사 추진 현황 보고서
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              작성일자: {today} | 기준: 시설관리팀 업무 추진 현황
            </p>
          </div>

          {/* 결재란 (Official Signatures) */}
          <table className="border-collapse border border-slate-400 text-center text-xs self-end">
            <tbody>
              <tr>
                <td rowSpan={2} className="border border-slate-400 bg-slate-100 px-2 font-bold text-[11px] w-8">
                  결<br/>재
                </td>
                <td className="border border-slate-400 bg-slate-50 px-3 py-1 font-bold text-[11px] w-16">
                  담 당
                </td>
                <td className="border border-slate-400 bg-slate-50 px-3 py-1 font-bold text-[11px] w-16">
                  팀 장
                </td>
                <td className="border border-slate-400 bg-slate-50 px-3 py-1 font-bold text-[11px] w-16">
                  본부장
                </td>
              </tr>
              <tr>
                <td className="border border-slate-400 h-12"></td>
                <td className="border border-slate-400 h-12"></td>
                <td className="border border-slate-400 h-12"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Table */}
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-4 gap-4 text-center text-xs">
          <div>
            <span className="text-slate-500 block font-medium">총 추진건수</span>
            <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{tasks.length}건</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">총 예상비용 합계</span>
            <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{formatCurrency(totalCost)}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">집행 예정금액</span>
            <span className="text-base font-extrabold text-indigo-700 mt-0.5 block">{formatCurrency(totalPlannedCost)}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">진행 상태 요약</span>
            <span className="text-xs font-bold text-teal-700 mt-1 block">
              완료 {tasks.filter(t => t.status === '완료').length}건 / 진행 {tasks.filter(t => t.status !== '완료').length}건
            </span>
          </div>
        </div>

        {/* Detailed Official Table */}
        <table className="w-full border-collapse border border-slate-400 text-xs">
          <thead className="bg-slate-100 font-bold text-slate-800 text-[11px]">
            <tr>
              <th className="border border-slate-400 p-1.5 w-8 text-center">연번</th>
              <th className="border border-slate-400 p-1.5 w-16 text-center">예산</th>
              <th className="border border-slate-400 p-1.5 w-20 text-center">분류</th>
              <th className="border border-slate-400 p-1.5 w-24 text-center">위치</th>
              <th className="border border-slate-400 p-1.5 text-left">공사명</th>
              <th className="border border-slate-400 p-1.5 w-24 text-right">예상비용</th>
              <th className="border border-slate-400 p-1.5 w-14 text-center">담당자</th>
              <th className="border border-slate-400 p-1.5 w-20 text-center">진행</th>
              <th className="border border-slate-400 p-1.5 w-20 text-right">견적가</th>
              <th className="border border-slate-400 p-1.5 w-20 text-right">계약금액</th>
              <th className="border border-slate-400 p-1.5 w-24 text-left">업체명</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {tasks.map((t, idx) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="border border-slate-400 p-1.5 text-center text-slate-500 font-medium">
                  {idx + 1}
                </td>
                <td className="border border-slate-400 p-1.5 text-center">
                  {t.budget}
                </td>
                <td className="border border-slate-400 p-1.5 text-center font-bold">
                  {t.facility}
                </td>
                <td className="border border-slate-400 p-1.5 text-center">
                  {t.location || '-'}
                </td>
                <td className="border border-slate-400 p-1.5 font-bold">
                  {t.title}
                </td>
                <td className="border border-slate-400 p-1.5 text-right font-semibold">
                  {t.estimatedCost ? formatCurrency(t.estimatedCost) : (t.estimatedCostNote || '-')}
                </td>
                <td className="border border-slate-400 p-1.5 text-center font-bold">
                  {t.manager || '-'}
                </td>
                <td className="border border-slate-400 p-1.5 text-center font-medium">
                  {t.status}
                </td>
                <td className="border border-slate-400 p-1.5 text-right font-bold text-indigo-700">
                  {t.quoteAmount ? formatCurrency(t.quoteAmount) : '-'}
                </td>
                <td className="border border-slate-400 p-1.5 text-right font-bold text-emerald-700">
                  {t.contractAmount ? formatCurrency(t.contractAmount) : '-'}
                </td>
                <td className="border border-slate-400 p-1.5">
                  {t.vendor || '-'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 font-extrabold text-xs">
            <tr>
              <td colSpan={5} className="border border-slate-400 p-2 text-center">
                합계 (총 {tasks.length}건)
              </td>
              <td className="border border-slate-400 p-2 text-right font-black text-slate-900">
                {formatCurrency(totalCost)}
              </td>
              <td colSpan={2} className="border border-slate-400 p-2 text-center text-slate-400">
                -
              </td>
              <td className="border border-slate-400 p-2 text-right font-black text-indigo-800">
                {formatCurrency(totalQuote)}
              </td>
              <td className="border border-slate-400 p-2 text-right font-black text-emerald-800">
                {totalContract > 0 ? formatCurrency(totalContract) : '-'}
              </td>
              <td colSpan={2} className="border border-slate-400 p-2 text-right text-slate-400">
                남양주체육문화센터
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Footer notes */}
        <div className="mt-6 text-xs text-slate-500 flex justify-between items-center border-t border-slate-200 pt-4">
          <span>남양주체육문화센터 시설·공사 업무 공유 시스템 출력본</span>
          <span>출력자: {today}</span>
        </div>

      </div>
    </div>
  );
}
