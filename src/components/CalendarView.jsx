import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  User, 
  Plus, 
  Eye, 
  ListFilter, 
  CalendarDays,
  Layers,
  Sparkles
} from 'lucide-react';
import { STATUS_COLORS, STATUS_LIST } from '../data/initialTasks';
import { formatCurrency } from '../utils/formatters';

export default function CalendarView({
  tasks = [],
  onSelectTask,
  onEditTask,
  onNewTask,
  selectedDepartment = '남양주체육문화센터'
}) {
  // Current view date state (Default to October 2026 based on system context date)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 9, 1)); // 0-indexed month: 9 = October
  const [calendarSubMode, setCalendarSubMode] = useState('grid'); // 'grid' | 'timeline'
  const [filterStatus, setFilterStatus] = useState('ALL');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 to 11

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    // Context local time is 2026-10-19
    setCurrentDate(new Date(2026, 9, 1));
  };

  // Format YYYY-MM-DD
  const formatYMD = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Today string
  const todayStr = '2026-10-19';

  // Helper to extract effective dates for task
  const getTaskDates = (task) => {
    let start = task.startDate;
    let end = task.endDate;

    if (!start && !end) {
      // Fallback from logs if available
      if (task.logs && task.logs.length > 0 && task.logs[0].date) {
        start = task.logs[0].date;
        end = task.logs[task.logs.length - 1].date || start;
      } else {
        // Default placeholder fallback
        start = '2026-10-05';
        end = '2026-10-25';
      }
    } else if (start && !end) {
      end = start;
    } else if (!start && end) {
      start = end;
    }

    return { start, end };
  };

  // Filter tasks by status if selected
  const displayTasks = useMemo(() => {
    if (filterStatus === 'ALL') return tasks;
    return tasks.filter(t => t.status === filterStatus);
  }, [tasks, filterStatus]);

  // Tasks enriched with schedule dates
  const scheduledTasks = useMemo(() => {
    return displayTasks.map(t => ({
      ...t,
      ...getTaskDates(t)
    }));
  }, [displayTasks]);

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0: Sunday, 1: Monday, ...
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate(); // e.g. 31
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = formatYMD(prevDate.getFullYear(), prevDate.getMonth(), d);
      days.push({
        date: d,
        dateStr,
        isCurrentMonth: false,
        isPrevMonth: true,
        dayOfWeek: new Date(year, month - 1, d).getDay()
      });
    }

    // Current month days
    for (let d = 1; d <= lastDayOfMonth; d++) {
      const dateStr = formatYMD(year, month, d);
      days.push({
        date: d,
        dateStr,
        isCurrentMonth: true,
        dayOfWeek: new Date(year, month, d).getDay()
      });
    }

    // Next month filler days (to complete 5 or 6 full weeks = multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateStr = formatYMD(nextDate.getFullYear(), nextDate.getMonth(), d);
      days.push({
        date: d,
        dateStr,
        isCurrentMonth: false,
        isNextMonth: true,
        dayOfWeek: new Date(year, month + 1, d).getDay()
      });
    }

    return days;
  }, [year, month]);

  // Map tasks to dates
  const tasksByDate = useMemo(() => {
    const map = {};

    scheduledTasks.forEach(task => {
      const { start, end } = task;
      if (!start) return;

      // Normalize bounds
      const taskStart = start;
      const taskEnd = end || start;

      calendarDays.forEach(day => {
        if (day.dateStr >= taskStart && day.dateStr <= taskEnd) {
          if (!map[day.dateStr]) map[day.dateStr] = [];
          map[day.dateStr].push(task);
        }
      });
    });

    return map;
  }, [scheduledTasks, calendarDays]);

  // Statistics for this month
  const monthStats = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    // Tasks happening this month
    const thisMonthTasks = scheduledTasks.filter(t => {
      const s = t.start || '';
      const e = t.end || '';
      return s.startsWith(monthPrefix) || e.startsWith(monthPrefix) || (s <= `${monthPrefix}-31` && e >= `${monthPrefix}-01`);
    });

    const ongoingCount = thisMonthTasks.filter(t => t.status === '공사진행' || t.status === '계약체결').length;
    const completedCount = thisMonthTasks.filter(t => t.status === '완료').length;
    const pendingCount = thisMonthTasks.filter(t => t.status === '견적의뢰' || t.status === '견적방문' || t.status === '제안서 협의').length;

    return {
      total: thisMonthTasks.length,
      ongoingCount,
      completedCount,
      pendingCount
    };
  }, [scheduledTasks, year, month]);

  const weekDayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      
      {/* 1. Header & Navigation Bar */}
      <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        
        {/* Left: Month Selector & Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <CalendarIcon className="w-4 h-4 text-teal-400" />
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
              {year}년 {month + 1}월
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={handlePrevMonth}
              title="이전 달"
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2 py-1 text-xs font-bold text-teal-300 hover:text-white hover:bg-slate-700 rounded transition"
            >
              오늘 (10월)
            </button>
            <button
              onClick={handleNextMonth}
              title="다음 달"
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Month KPI Summary Pills */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
            이달의 공사: <strong className="text-white font-extrabold">{monthStats.total}건</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-orange-950/60 border border-orange-700/60 text-orange-300">
            공사진행: <strong className="font-extrabold">{monthStats.ongoingCount}건</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
            준공완료: <strong className="font-extrabold">{monthStats.completedCount}건</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-700/60 text-blue-300">
            견적·협의: <strong className="font-extrabold">{monthStats.pendingCount}건</strong>
          </span>
        </div>

        {/* Right: Sub-mode Toggle (월간 달력 vs 일정 타임라인) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-slate-800 rounded-lg border border-slate-700">
            <button
              onClick={() => setCalendarSubMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
                calendarSubMode === 'grid'
                  ? 'bg-teal-600 text-white shadow-xs font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>월간 달력</span>
            </button>
            <button
              onClick={() => setCalendarSubMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
                calendarSubMode === 'timeline'
                  ? 'bg-teal-600 text-white shadow-xs font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>일정 타임라인</span>
            </button>
          </div>

          {onNewTask && (
            <button
              onClick={() => onNewTask()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 shadow transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">일정 등록</span>
            </button>
          )}
        </div>

      </div>

      {/* 2. Status Filter Bar & Guide */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
            <ListFilter className="w-3 h-3 text-teal-600" />
            상태 필터:
          </span>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition border ${
              filterStatus === 'ALL'
                ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            전체 ({tasks.length})
          </button>
          {STATUS_LIST.map(st => {
            const stCount = tasks.filter(t => t.status === st).length;
            if (stCount === 0) return null;
            const isSelected = filterStatus === st;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(isSelected ? 'ALL' : st)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition border flex items-center gap-1 ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[st]?.dot || 'bg-slate-400'}`} />
                <span>{st}</span>
                <span className="text-[10px] opacity-75">({stCount})</span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>날짜를 클릭하면 해당 날짜로 신규 공사 일정을 바로 등록할 수 있습니다.</span>
        </div>
      </div>

      {/* 3-A. View Mode: Monthly Grid View (월간 달력) */}
      {calendarSubMode === 'grid' && (
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Weekday Header Row */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100 text-xs font-bold text-slate-600 text-center py-2">
              {weekDayNames.map((name, idx) => (
                <div 
                  key={name}
                  className={idx === 0 ? 'text-rose-600' : idx === 6 ? 'text-blue-600' : 'text-slate-700'}
                >
                  {name}요일
                </div>
              ))}
            </div>

            {/* Days Grid Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 bg-slate-50">
              {calendarDays.map((day) => {
                const dayTasks = tasksByDate[day.dateStr] || [];
                const isToday = day.dateStr === todayStr;
                const isSunday = day.dayOfWeek === 0;
                const isSaturday = day.dayOfWeek === 6;

                return (
                  <div
                    key={day.dateStr}
                    onClick={() => onNewTask && onNewTask({ startDate: day.dateStr, endDate: day.dateStr })}
                    className={`min-h-[110px] sm:min-h-[125px] p-1.5 transition flex flex-col justify-between cursor-pointer group relative ${
                      !day.isCurrentMonth
                        ? 'bg-slate-100/60 text-slate-400'
                        : isToday
                        ? 'bg-teal-50/50 ring-2 ring-inset ring-teal-500/40'
                        : 'bg-white hover:bg-slate-50/90'
                    }`}
                  >
                    {/* Top Row: Date number & Today tag */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            isToday
                              ? 'bg-teal-600 text-white shadow-2xs font-black'
                              : isSunday
                              ? 'text-rose-600'
                              : isSaturday
                              ? 'text-blue-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {day.date}
                        </span>
                        {isToday && (
                          <span className="text-[9px] px-1 rounded bg-teal-200 text-teal-900 font-extrabold">
                            오늘
                          </span>
                        )}
                      </div>

                      {/* Day task count badge & Hover Plus */}
                      <div className="flex items-center gap-1">
                        {dayTasks.length > 0 && (
                          <span className="text-[10px] font-extrabold px-1.5 rounded-full bg-slate-200 text-slate-700">
                            {dayTasks.length}건
                          </span>
                        )}
                        <span 
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-teal-600 hover:bg-teal-100 transition text-[10px]"
                          title="이 날짜에 새 공사 등록"
                        >
                          <Plus className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {/* Task Chips Container (max 3, plus more counter) */}
                    <div className="space-y-1 flex-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                      {dayTasks.slice(0, 3).map((task) => {
                        const isStartDay = task.start === day.dateStr;
                        const isEndDay = task.end === day.dateStr;
                        const stStyle = STATUS_COLORS[task.status] || {
                          bg: 'bg-slate-100',
                          text: 'text-slate-700',
                          border: 'border-slate-300',
                          dot: 'bg-slate-500'
                        };

                        return (
                          <div
                            key={task.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTask(task);
                            }}
                            title={`[${task.status}] ${task.title} (담당: ${task.manager || '미정'}, ${task.facility})`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border truncate cursor-pointer transition shadow-2xs hover:scale-[1.02] flex items-center justify-between gap-1 ${stStyle.bg} ${stStyle.text} ${stStyle.border}`}
                          >
                            <span className="truncate flex-1">
                              {task.title}
                            </span>
                            <span className="text-[9px] opacity-80 shrink-0 font-normal">
                              {task.manager || ''}
                            </span>
                          </div>
                        );
                      })}

                      {dayTasks.length > 3 && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Select first overflow task for inspection
                            if (dayTasks[3]) onSelectTask(dayTasks[3]);
                          }}
                          className="text-[10px] text-teal-700 font-extrabold text-center hover:underline cursor-pointer bg-teal-50/70 rounded py-0.5"
                        >
                          +{dayTasks.length - 3}건 더보기
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3-B. View Mode: Timeline / Schedule List View (일정 타임라인) */}
      {calendarSubMode === 'timeline' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-teal-600" />
              <span>{year}년 {month + 1}월 공사 일정 타임라인 ({scheduledTasks.length}건)</span>
            </h3>
            <span className="text-xs text-slate-400">착공일 기준 정렬</span>
          </div>

          {scheduledTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              등록된 공사 일정이 없습니다.
            </div>
          ) : (
            <div className="space-y-2.5">
              {scheduledTasks
                .slice()
                .sort((a, b) => (a.start || '').localeCompare(b.start || ''))
                .map((task) => {
                  const stStyle = STATUS_COLORS[task.status] || {
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                    border: 'border-slate-300',
                    dot: 'bg-slate-400'
                  };

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="bg-slate-50/60 hover:bg-teal-50/40 p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs group"
                    >
                      {/* Left: Task Info */}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold border ${stStyle.bg} ${stStyle.text} ${stStyle.border}`}>
                            {task.status}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            [{task.budget}]
                          </span>
                          <span className="text-xs text-slate-500">
                            {task.facility} {task.location && `• ${task.location}`}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition">
                          {task.title}
                        </h4>
                      </div>

                      {/* Middle: Schedule Dates & Duration */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-right">
                          <div className="text-[10px] text-slate-400 font-semibold">공사 기간</div>
                          <div className="text-xs font-black text-teal-800 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            <span>{task.start} ~ {task.end}</span>
                          </div>
                        </div>

                        {/* Manager Badge */}
                        <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-center min-w-[70px]">
                          <div className="text-[10px] text-slate-400 font-medium">담당자</div>
                          <div className="text-xs font-bold text-slate-800">
                            {task.manager || '미정'}
                          </div>
                        </div>

                        {/* Cost if present */}
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-right min-w-[90px]">
                          <div className="text-[10px] text-slate-400 font-medium">예상금액</div>
                          <div className="text-xs font-extrabold text-slate-800">
                            {task.estimatedCost ? formatCurrency(task.estimatedCost) : '-'}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(task);
                          }}
                          className="p-2 rounded-lg bg-white group-hover:bg-teal-600 group-hover:text-white text-slate-400 border border-slate-200 transition"
                          title="상세보기"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* 4. Footer Legend */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-700">진행상태 범례:</span>
          {STATUS_LIST.map(st => (
            <div key={st} className="flex items-center gap-1 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[st]?.dot || 'bg-slate-400'}`} />
              <span>{st}</span>
            </div>
          ))}
        </div>

        <div className="text-[11px] font-medium text-slate-400">
          * 공사 일정은 각 공사 상세 또는 [수정] 모달에서 시작일과 완료일을 설정할 수 있습니다.
        </div>
      </div>

    </div>
  );
}
