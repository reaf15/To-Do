import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import FilterBar from './components/FilterBar';
import TableView from './components/TableView';
import KanbanView from './components/KanbanView';
import FacilityView from './components/FacilityView';
import StaffView from './components/StaffView';
import TaskModal from './components/TaskModal';
import TaskDetailDrawer from './components/TaskDetailDrawer';
import MessengerShareModal from './components/MessengerShareModal';
import PrintReportView from './components/PrintReportView';
import ConnectStaffModal from './components/ConnectStaffModal';
import DatabaseHub from './components/database/DatabaseHub';
import { INITIAL_TASKS } from './data/initialTasks';
import { INITIAL_DATABASES } from './data/initialDatabases';
import { exportToExcel } from './utils/excelExport';

const LOCAL_STORAGE_KEY = 'nyj_tasks_v1';
const LOCAL_STORAGE_USER = 'nyj_current_user_v1';
const LOCAL_STORAGE_DBS = 'nyj_databases_v1';

export default function App() {
  // Top-level module: 'facility' (시설·공사 관리) vs 'databases' (업무 데이터베이스 관리)
  const [currentModule, setCurrentModule] = useState('facility');

  // Tasks state with LocalStorage persistence
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load tasks from local storage', e);
    }
    return INITIAL_TASKS;
  });

  // Custom Databases state with LocalStorage persistence
  const [customDatabases, setCustomDatabases] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DBS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load custom databases from local storage', e);
    }
    return INITIAL_DATABASES;
  });

  // Current persona / logged in user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_USER) || '김일호';
    } catch {
      return '김일호';
    }
  });

  // Server network info (for other staff connection)
  const [serverInfo, setServerInfo] = useState({ ip: '192.168.101.96', port: 5173 });

  // UI state
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban' | 'facility' | 'staff'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [isMyTasksActive, setIsMyTasksActive] = useState(false);

  // Modals & Drawers
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPrintViewActive, setIsPrintViewActive] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Toast alert
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync tasks to LocalStorage & Central Server API
  const persistTasks = async (newTasks) => {
    setTasks(newTasks);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTasks));
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTasks)
      });
    } catch (e) {
      console.error('Failed to save tasks to server', e);
    }
  };

  // Sync custom databases to LocalStorage & Central Server API
  const persistDatabases = async (newDbs) => {
    setCustomDatabases(newDbs);
    try {
      localStorage.setItem(LOCAL_STORAGE_DBS, JSON.stringify(newDbs));
      await fetch('/api/databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDbs)
      });
    } catch (e) {
      console.error('Failed to save databases to server', e);
    }
  };

  // Initial load from server and live multi-user polling
  useEffect(() => {
    // 1. Fetch server info for LAN IP
    fetch('/api/server-info')
      .then(res => res.json())
      .then(info => setServerInfo(info))
      .catch(() => {});

    // 2. Fetch latest shared tasks
    fetch('/api/tasks')
      .then(res => res.json())
      .then(serverTasks => {
        if (Array.isArray(serverTasks) && serverTasks.length > 0) {
          setTasks(serverTasks);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverTasks));
          } catch (e) {}
        }
      })
      .catch(() => {});

    // 3. Fetch latest shared custom databases
    fetch('/api/databases')
      .then(res => res.json())
      .then(serverDbs => {
        if (Array.isArray(serverDbs) && serverDbs.length > 0) {
          setCustomDatabases(serverDbs);
          try {
            localStorage.setItem(LOCAL_STORAGE_DBS, JSON.stringify(serverDbs));
          } catch (e) {}
        }
      })
      .catch(() => {});

    // 4. Real-time background sync polling every 4 seconds for both tasks & databases
    const interval = setInterval(() => {
      // Sync tasks
      fetch('/api/tasks')
        .then(res => res.json())
        .then(latestTasks => {
          if (Array.isArray(latestTasks) && latestTasks.length > 0) {
            setTasks(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(latestTasks)) {
                return latestTasks;
              }
              return prev;
            });
          }
        })
        .catch(() => {});

      // Sync databases
      fetch('/api/databases')
        .then(res => res.json())
        .then(latestDbs => {
          if (Array.isArray(latestDbs) && latestDbs.length > 0) {
            setCustomDatabases(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(latestDbs)) {
                return latestDbs;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Sync user to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USER, currentUser);
    } catch (e) {
      console.error('Failed to save user', e);
    }
  }, [currentUser]);

  // Persona change handler
  const handleUserChange = (user) => {
    setCurrentUser(user);
    if (user === 'ALL') {
      setIsMyTasksActive(false);
      setSelectedManager('');
    } else {
      showToast(`접속자가 [${user}] 님으로 변경되었습니다.`, 'info');
    }
  };

  // Quick filter for current user's tasks
  const handleQuickFilterMyTasks = () => {
    if (isMyTasksActive) {
      setIsMyTasksActive(false);
      setSelectedManager('');
    } else {
      setIsMyTasksActive(true);
      setSelectedManager(currentUser);
    }
  };

  // Filter tasks based on all active criteria
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title?.toLowerCase().includes(query);
        const matchesLoc = t.location?.toLowerCase().includes(query);
        const matchesFacility = t.facility?.toLowerCase().includes(query);
        const matchesVendor = t.vendor?.toLowerCase().includes(query);
        const matchesContact = t.contact?.includes(query);
        const matchesManager = t.manager?.toLowerCase().includes(query);
        const matchesMemo = t.memo?.toLowerCase().includes(query);

        if (!matchesTitle && !matchesLoc && !matchesFacility && !matchesVendor && !matchesContact && !matchesManager && !matchesMemo) {
          return false;
        }
      }

      // Facility
      if (selectedFacility && t.facility !== selectedFacility) {
        return false;
      }

      // Budget
      if (selectedBudget && t.budget !== selectedBudget) {
        return false;
      }

      // Status
      if (selectedStatus && t.status !== selectedStatus) {
        return false;
      }

      // Manager
      if (selectedManager) {
        if (selectedManager === 'unassigned') {
          if (t.manager) return false;
        } else if (t.manager !== selectedManager) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, searchQuery, selectedFacility, selectedBudget, selectedStatus, selectedManager]);

  const hasActiveFilters = Boolean(
    searchQuery || selectedFacility || selectedBudget || selectedStatus || selectedManager || isMyTasksActive
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedFacility('');
    setSelectedBudget('');
    setSelectedStatus('');
    setSelectedManager('');
    setIsMyTasksActive(false);
    showToast('검색 및 필터 조건이 초기화되었습니다.', 'info');
  };

  // Quick stats card click handler
  const handleStatsFilterClick = (managerName) => {
    if (managerName === 'unassigned') {
      setSelectedManager('unassigned');
    } else {
      setSelectedManager(managerName);
    }
    setIsMyTasksActive(managerName === currentUser);
    setViewMode('table');
  };

  // Add / Edit Task
  const handleSaveTask = (taskData) => {
    let updated;
    const exists = tasks.some((t) => t.id === taskData.id);
    if (exists) {
      updated = tasks.map((t) => (t.id === taskData.id ? taskData : t));
      showToast(`'${taskData.title}' 정보가 수정되었습니다.`);
    } else {
      updated = [taskData, ...tasks];
      showToast(`'${taskData.title}' 신규 공사가 등록되었습니다.`);
    }
    persistTasks(updated);

    if (selectedTask && selectedTask.id === taskData.id) {
      setSelectedTask(taskData);
    }
  };

  // Delete Task
  const handleDeleteTask = (id, title) => {
    if (window.confirm(`'${title}' 공사 업무를 정말 삭제하시겠습니까?`)) {
      const updated = tasks.filter((t) => t.id !== id);
      persistTasks(updated);
      if (selectedTask?.id === id) {
        setSelectedTask(null);
      }
      showToast(`'${title}' 업무가 삭제되었습니다.`, 'info');
    }
  };

  // Quick Inline Status Change
  const handleQuickStatusChange = (id, newStatus) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const item = {
          ...t,
          status: newStatus,
          logs: [
            ...(t.logs || []),
            {
              date: new Date().toISOString().split('T')[0],
              author: currentUser !== 'ALL' ? currentUser : '관리자',
              message: `진행 상태를 [${newStatus}](으)로 변경`
            }
          ]
        };

        if (newStatus === '완료') {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 }
          });
          showToast(`🎉 '${t.title}' 공사가 완료 처리되었습니다!`);
        } else {
          showToast(`상태가 [${newStatus}] 변경되었습니다.`);
        }

        if (selectedTask?.id === id) {
          setSelectedTask(item);
        }
        return item;
      }
      return t;
    });
    persistTasks(updated);
  };

  // Quick Inline Manager Change
  const handleQuickManagerChange = (id, newManager) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const item = {
          ...t,
          manager: newManager,
          logs: [
            ...(t.logs || []),
            {
              date: new Date().toISOString().split('T')[0],
              author: currentUser !== 'ALL' ? currentUser : '관리자',
              message: newManager ? `담당자를 [${newManager}](으)로 지정` : '담당자 지정 해제'
            }
          ]
        };
        showToast(`담당자가 [${newManager || '미배정'}](으)로 변경되었습니다.`);
        if (selectedTask?.id === id) {
          setSelectedTask(item);
        }
        return item;
      }
      return t;
    });
    persistTasks(updated);
  };

  // Add Log / Note to Task
  const handleAddLog = (taskId, newLog) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const item = {
          ...t,
          logs: [...(t.logs || []), newLog]
        };
        if (selectedTask?.id === taskId) {
          setSelectedTask(item);
        }
        return item;
      }
      return t;
    });
    persistTasks(updated);
    showToast('새 업무 일지가 등록되었습니다.');
  };

  // Custom Database Handlers (Create, Update, Delete Database)
  const handleSaveDatabase = (dbData) => {
    const exists = customDatabases.some(d => d.id === dbData.id);
    let updated;
    if (exists) {
      updated = customDatabases.map(d => d.id === dbData.id ? dbData : d);
      showToast(`'${dbData.name}' 데이터베이스가 저장되었습니다.`);
    } else {
      updated = [...customDatabases, dbData];
      showToast(`'${dbData.name}' 새 데이터베이스가 생성되었습니다!`);
    }
    persistDatabases(updated);
  };

  const handleDeleteDatabase = (dbId) => {
    const target = customDatabases.find(d => d.id === dbId);
    const updated = customDatabases.filter(d => d.id !== dbId);
    persistDatabases(updated);
    showToast(`'${target?.name || ''}' 데이터베이스가 삭제되었습니다.`, 'info');
  };

  // Reset to default original 35 tasks
  const handleResetData = () => {
    if (window.confirm('초기 데이터 35건으로 복원하시겠습니까? (직접 추가하거나 수정한 내용이 초기화됩니다)')) {
      persistTasks(INITIAL_TASKS);
      resetFilters();
      setSelectedTask(null);
      showToast('초기 35건의 공사 데이터로 복원되었습니다.');
    }
  };

  // Excel Export
  const handleExportExcel = () => {
    exportToExcel(filteredTasks, `남양주체육문화센터_공사업무현황_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Excel 파일이 다운로드되었습니다.');
  };

  // If Print View is active
  if (isPrintViewActive) {
    return (
      <PrintReportView
        tasks={filteredTasks}
        onClose={() => setIsPrintViewActive(false)}
      />
    );
  }

  const myTasksCount = tasks.filter((t) => t.manager === currentUser).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-xl border text-xs font-bold transition animate-in slide-in-from-bottom duration-300 flex items-center gap-2 ${
          toast.type === 'info'
            ? 'bg-slate-900 text-white border-slate-700'
            : 'bg-teal-600 text-white border-teal-500'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onNewTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onExportExcel={handleExportExcel}
        onResetData={handleResetData}
        onOpenConnect={() => setIsConnectModalOpen(true)}
        serverInfo={serverInfo}
        totalTasksCount={tasks.length}
        myTasksCount={myTasksCount}
        currentModule={currentModule}
        onModuleChange={setCurrentModule}
        dbCount={customDatabases.length}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {currentModule === 'databases' ? (
          <DatabaseHub
            databases={customDatabases}
            onSaveDatabase={handleSaveDatabase}
            onDeleteDatabase={handleDeleteDatabase}
            currentUser={currentUser}
          />
        ) : (
          <>
            {/* KPI Summary Cards */}
            <StatsCards
              tasks={tasks}
              onFilterClick={handleStatsFilterClick}
            />

            {/* Filter and View mode Toolbar */}
            <FilterBar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedFacility={selectedFacility}
              onFacilityChange={setSelectedFacility}
              selectedBudget={selectedBudget}
              onBudgetChange={setSelectedBudget}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedManager={selectedManager}
              onManagerChange={setSelectedManager}
              onResetFilters={resetFilters}
              hasActiveFilters={hasActiveFilters}
              currentUser={currentUser}
              onQuickFilterMyTasks={handleQuickFilterMyTasks}
              isMyTasksActive={isMyTasksActive}
            />

            {/* Dynamic Views */}
            {viewMode === 'table' && (
              <TableView
                tasks={filteredTasks}
                onSelectTask={(task) => setSelectedTask(task)}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onQuickStatusChange={handleQuickStatusChange}
                onQuickManagerChange={handleQuickManagerChange}
              />
            )}

            {viewMode === 'kanban' && (
              <KanbanView
                tasks={filteredTasks}
                onSelectTask={(task) => setSelectedTask(task)}
                onQuickStatusChange={handleQuickStatusChange}
                onNewTask={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
              />
            )}

            {viewMode === 'facility' && (
              <FacilityView
                tasks={filteredTasks}
                onSelectTask={(task) => setSelectedTask(task)}
                onNewTask={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
              />
            )}

            {viewMode === 'staff' && (
              <StaffView
                tasks={filteredTasks}
                onSelectTask={(task) => setSelectedTask(task)}
                onQuickManagerChange={handleQuickManagerChange}
              />
            )}
          </>
        )}

      </main>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
      />

      {/* Task Detail & Collaboration Drawer */}
      <TaskDetailDrawer
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        currentUser={currentUser}
        onEdit={(task) => {
          setEditingTask(task);
          setIsTaskModalOpen(true);
        }}
        onAddLog={handleAddLog}
        onQuickStatusChange={handleQuickStatusChange}
      />

      {/* Messenger Sharing Modal */}
      <MessengerShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        tasks={filteredTasks}
        currentUser={currentUser}
      />

      {/* Connect Other Staff Modal */}
      <ConnectStaffModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        serverInfo={serverInfo}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>남양주체육문화센터 시설·공사 업무 공유 시스템 v1.0</span>
          <span>담당자: 김일호, 권병학, 조현호 | 남양주도시공사 시설관리팀</span>
        </div>
      </footer>

    </div>
  );
}
