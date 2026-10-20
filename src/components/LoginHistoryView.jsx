import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  ShieldCheck, 
  Search, 
  Calendar, 
  FileSpreadsheet, 
  UserCheck, 
  Monitor, 
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Filter,
  Users
} from 'lucide-react';

export default function LoginHistoryView({ history = [], onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | '7DAYS' | '30DAYS'

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return history.filter(item => {
      // User filter
      if (selectedUser !== 'ALL' && item.userName !== selectedUser) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'ALL') {
        const itemDate = new Date(item.timestamp.split(' ')[0]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === 'TODAY') {
          const itemDay = new Date(item.timestamp.split(' ')[0]);
          if (itemDay.getTime() !== today.getTime()) return false;
        } else if (dateFilter === '7DAYS') {
          const diffDays = (today - itemDate) / (1000 * 60 * 60 * 24);
          if (diffDays > 7) return false;
        } else if (dateFilter === '30DAYS') {
          const diffDays = (today - itemDate) / (1000 * 60 * 60 * 24);
          if (diffDays > 30) return false;
        }
      }

      // Keyword search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const match = 
          (item.userName || '').toLowerCase().includes(query) ||
          (item.userId || '').toLowerCase().includes(query) ||
          (item.ip || '').toLowerCase().includes(query) ||
          (item.action || '').toLowerCase().includes(query) ||
          (item.device || '').toLowerCase().includes(query);
        if (!match) return false;
      }

      return true;
    });
  }, [history, searchQuery, selectedUser, dateFilter]);

  // Excel Export
  const handleExportExcel = () => {
    const exportData = filteredLogs.map((log, index) => ({
      'No': index + 1,
      '접속일시': log.timestamp,
      '사용자ID': log.userId,
      '성명': log.userName,
      '직급/역할': log.role,
      '소속': log.dept,
      '접속IP': log.ip,
      '접속환경(OS/브라우저)': log.device,
      '수행작업내역': log.action,
      '처리상태': log.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '로그인이력조회');
    XLSX.writeFile(wb, `FMS_로그인이력조회_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const todayCount = history.filter(h => h.timestamp.startsWith('2026-10-19')).length;
  const uniqueUsers = Array.from(new Set(history.map(h => h.userName)));

  return (
    <div className="space-y-4 mb-8">
      
      {/* 1. Breadcrumb & Title Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <span>홈</span>
            <span>&gt;</span>
            <span>시스템관리</span>
            <span>&gt;</span>
            <span className="text-teal-700 font-bold">로그인이력조회</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                시스템관리 &gt; 로그인이력조회
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  보안감사 표준
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                사내 직원 및 관리자의 시스템 접속 기록, IP 주소 및 주요 업무 처리 내역을 실시간으로 추적·조회합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs transition shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>새로고침</span>
            </button>
          )}

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>이력 엑셀 다운로드</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400">전체 누적 이력</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{history.length}건</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-teal-600">오늘 접속 및 작업</div>
            <div className="text-lg font-black text-teal-700 mt-0.5">{todayCount}건</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400">등록 접속자 수</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{uniqueUsers.length}명</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400">현재 호스트 IP</div>
            <div className="text-sm font-black text-slate-800 mt-1">192.168.101.96</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Monitor className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        
        {/* Left Search input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="사용자명, 아이디, 접속IP, 작업내역 검색..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {/* Right Filter Selects */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* User Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">전체 사용자</option>
              {uniqueUsers.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">전체 기간</option>
              <option value="TODAY">오늘</option>
              <option value="7DAYS">최근 7일</option>
              <option value="30DAYS">최근 30일</option>
            </select>
          </div>

          <span className="text-xs font-bold text-slate-500 ml-1">
            총 <strong className="text-teal-700">{filteredLogs.length}</strong>건 표시 중
          </span>
        </div>

      </div>

      {/* 4. Login History Grid Table (Full Width) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200 shadow-xs">
              <tr>
                <th className="py-3 px-3 w-12 text-center text-slate-400">#</th>
                <th className="py-3 px-3 whitespace-nowrap">접속일시</th>
                <th className="py-3 px-3 whitespace-nowrap">사용자 ID</th>
                <th className="py-3 px-3 whitespace-nowrap">성명</th>
                <th className="py-3 px-3 whitespace-nowrap">소속 / 역할</th>
                <th className="py-3 px-3 whitespace-nowrap">접속 IP</th>
                <th className="py-3 px-3 whitespace-nowrap">접속 환경 (OS/브라우저)</th>
                <th className="py-3 px-4 min-w-[260px]">수행 작업 내역</th>
                <th className="py-3 px-3 text-center whitespace-nowrap w-20">상태</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>조건에 맞는 로그인이력이 없습니다.</span>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                      {index + 1}
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {log.userId}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        log.userName === '김일호'
                          ? 'bg-teal-50 text-teal-700 border-teal-200'
                          : log.userName === '권병학'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : log.userName === '조현호'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {log.userName}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{log.dept}</span>
                      <span className="text-slate-400 text-[11px] ml-1">({log.role})</span>
                    </td>

                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {log.ip}
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {log.device}
                    </td>

                    <td className="py-2.5 px-4 font-semibold text-slate-800 group-hover:text-teal-700 transition">
                      {log.action}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Status bar */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>💡 시스템관리자 전용: 공공기관 정보보안 감사 지침에 따라 모든 사용자의 접속 일시와 IP를 기록합니다.</span>
          <span>남양주도시공사 시설물종합관리시스템</span>
        </div>
      </div>

    </div>
  );
}
