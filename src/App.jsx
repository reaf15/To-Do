import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { ExternalLink } from 'lucide-react';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import FilterBar from './components/FilterBar';
import TableView from './components/TableView';
import KanbanView from './components/KanbanView';
import FacilityView from './components/FacilityView';
import StaffView from './components/StaffView';
import CalendarView from './components/CalendarView';
import TaskModal from './components/TaskModal';
import MessengerShareModal from './components/MessengerShareModal';
import PrintReportView from './components/PrintReportView';
import ConnectStaffModal from './components/ConnectStaffModal';
import DatabaseHub from './components/database/DatabaseHub';
import LoginHistoryView from './components/LoginHistoryView';
import OrgDepartmentBar from './components/OrgDepartmentBar';
import FacilityOverviewView from './components/FacilityOverviewView';
import BackupRestoreView from './components/BackupRestoreView';
import VersionManagementView from './components/VersionManagementView';
import DepartmentManagersModal from './components/DepartmentManagersModal';
import { INITIAL_TASKS } from './data/initialTasks';
import { INITIAL_DATABASES } from './data/initialDatabases';
import { INITIAL_LOGIN_HISTORY } from './data/initialLoginHistory';
import { INITIAL_DEPARTMENT_FACILITIES } from './data/initialFacilities';
import { INITIAL_DEPARTMENT_MANAGERS } from './data/initialDepartmentManagers';
import { 
  ORGANIZATION_TREE, 
  DEFAULT_DEPARTMENT, 
  DEFAULT_DIVISION,
  ALL_DEPARTMENTS,
  DEFAULT_SUBMISSION_MAP,
  calculateSubmissionStats 
} from './data/organizationChart';
import { exportToExcel, exportMasterDataToExcel } from './utils/excelExport';

const LOCAL_STORAGE_KEY = 'nyj_tasks_v1';
const LOCAL_STORAGE_USER = 'nyj_current_user_v1';
const LOCAL_STORAGE_DBS = 'nyj_databases_v1';
const LOCAL_STORAGE_HISTORY = 'nyj_login_history_v1';
const LOCAL_STORAGE_SUBMISSIONS = 'nyj_submissions_status_v1';
const LOCAL_STORAGE_BUDGETS = 'nyj_budget_allocations_v1';
const LOCAL_STORAGE_BUDGET_CATEGORIES = 'nyj_budget_categories_v2';
const LOCAL_STORAGE_FACILITIES = 'nyj_facilities_v1';
const LOCAL_STORAGE_DEPT_MANAGERS = 'nyj_dept_managers_v1';

export function flattenFacilities(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    return Object.entries(data).flatMap(([dept, facList]) => {
      if (Array.isArray(facList)) {
        return facList.map(f => ({ ...f, department: f.department || dept }));
      }
      return [];
    });
  }
  return [];
}

export function unflattenFacilities(facArray) {
  const map = {};
  if (Array.isArray(facArray)) {
    facArray.forEach(f => {
      const d = f.department || '남양주체육문화센터';
      map[d] = map[d] || [];
      map[d].push(f);
    });
  }
  return map;
}

export const DEFAULT_BUDGET_CATEGORIES = ['수선유지비'];

export const DEFAULT_BUDGETS = {
  '수선유지비': 150000000
};

export default function App() {
  // Top-level module: 'databases' (업무 데이터베이스 - 시설·공사 관리 포함) vs 'login-history' (로그인이력조회)
  const [currentModule, setCurrentModule] = useState('databases');

  // Organization hierarchy state (조직도: 시설본부 > 처 > 부서/센터)
  const [selectedDivision, setSelectedDivision] = useState(() => {
    try {
      return localStorage.getItem('nyj_selected_division') || 'div-sports';
    } catch {
      return 'div-sports';
    }
  });

  const [selectedDepartment, setSelectedDepartment] = useState(() => {
    try {
      return localStorage.getItem('nyj_selected_dept') || '남양주체육문화센터';
    } catch {
      return '남양주체육문화센터';
    }
  });

  // Selected Database ID: 'facility' (시설·공사 관리대장) or custom database IDs
  const [selectedDbId, setSelectedDbId] = useState('facility');

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

  // Custom Databases state with LocalStorage persistence (strictly 시설민원 접수대장)
  const [customDatabases, setCustomDatabases] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DBS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = Array.isArray(parsed) 
          ? parsed.filter(d => d.id !== 'db-equipment' && d.id !== 'db-vehicles') 
          : [];
        if (filtered.length > 0) return filtered;
      }
    } catch (e) {
      console.error('Failed to load custom databases from local storage', e);
    }
    return INITIAL_DATABASES;
  });

  // Login History & Audit Log state
  const [loginHistory, setLoginHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_LOGIN_HISTORY;
  });

  // Real-time submission status map for all 20 departments (취합 포털 3001 연동)
  const [submissionMap, setSubmissionMap] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_SUBMISSION_MAP;
  });

  // Calculate live submission statistics (진행률 및 미제출 부서 목록)
  const submissionStats = useMemo(() => {
    return calculateSubmissionStats(submissionMap);
  }, [submissionMap]);

  // Budget allocations per department (기본: 수선유지비, 부서별 개별 과목 및 금액 관리)
  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BUDGETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {}
    return {
      '남양주체육문화센터': { '수선유지비': 150000000 }
    };
  });

  // Current selected department budget allocations dynamically keyed by department
  const currentDeptBudgets = useMemo(() => {
    if (budgets && typeof budgets === 'object') {
      const deptData = budgets[selectedDepartment] || (selectedDepartment === '남양주체육문화센터' ? budgets['남양주체육문화센터'] : null);
      if (deptData && typeof deptData === 'object' && Object.keys(deptData).length > 0) {
        return deptData;
      }
    }
    return { '수선유지비': selectedDepartment === '남양주체육문화센터' ? 150000000 : 100000000 };
  }, [budgets, selectedDepartment]);

  // Current selected department budget categories (기본: 수선유지비)
  const currentDeptCategories = useMemo(() => {
    const keys = Object.keys(currentDeptBudgets);
    return keys.length > 0 ? keys : ['수선유지비'];
  }, [currentDeptBudgets]);

  // Facilities state with LocalStorage & Central Server API persistence
  const [facilities, setFacilities] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_FACILITIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        const flat = flattenFacilities(parsed);
        if (flat.length > 0) return flat;
      }
    } catch (e) {}
    return flattenFacilities(INITIAL_DEPARTMENT_FACILITIES);
  });

  // Current selected department's facilities
  const currentDeptFacilities = useMemo(() => {
    return facilities.filter(f => (f.department || '남양주체육문화센터') === selectedDepartment);
  }, [facilities, selectedDepartment]);

  // Department Managers state with LocalStorage & Central Server API persistence
  const [departmentManagers, setDepartmentManagers] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DEPT_MANAGERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return { ...INITIAL_DEPARTMENT_MANAGERS, ...parsed };
        }
      }
    } catch (e) {}
    return INITIAL_DEPARTMENT_MANAGERS;
  });

  // Current selected department's active managers list
  const currentDeptManagers = useMemo(() => {
    const list = departmentManagers[selectedDepartment];
    if (Array.isArray(list) && list.length > 0) return list;
    return INITIAL_DEPARTMENT_MANAGERS[selectedDepartment] || ['담당자1', '담당자2'];
  }, [departmentManagers, selectedDepartment]);

  const [isDeptManagersModalOpen, setIsDeptManagersModalOpen] = useState(false);

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

  // Method 1: Staff view preview mode
  const [previewAsStaff, setPreviewAsStaff] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('preview') === 'staff';
    }
    return false;
  });

  // Check if current browser is physically on the host computer
  const isActualHost = useMemo(() => {
    if (typeof window === 'undefined') return true;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return true;
    }
    if (serverInfo && typeof serverInfo.isHost === 'boolean') {
      return serverInfo.isHost;
    }
    return true; // default optimistic
  }, [serverInfo]);

  // Read-Only mode detection: When accessed on Render cloud
  const isRenderEnvironment = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(
      window.location.hostname.includes('onrender.com') ||
      window.location.hostname.includes('render') ||
      serverInfo?.isRender
    );
  }, [serverInfo]);

  // Render cloud operates strictly in safe Read-Only mode
  const isReadOnly = isRenderEnvironment;

  // Update browser tab title dynamically whenever selected department or module changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const dept = selectedDepartment || '남양주체육문화센터';
      if (currentModule === 'login-history') {
        document.title = `로그인이력조회 | ${dept} | NCUC-FMS`;
      } else if (currentModule === 'backup-restore') {
        document.title = `데이터 백업 및 복구 | ${dept} | NCUC-FMS`;
      } else if (currentModule === 'version-history') {
        document.title = `버전 및 변경 이력 | ${dept} | NCUC-FMS`;
      } else if (currentModule === 'facility-overview') {
        document.title = `${dept} 시설 개요 | NCUC-FMS`;
      } else {
        document.title = `${dept} | 시설물종합관리 (NCUC-FMS)`;
      }
    }
  }, [selectedDepartment, currentModule]);

  // isHostClient is false when simulating staff mode or on Render
  const isHostClient = isActualHost && !previewAsStaff && !isReadOnly;

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

  // Fetch centralized login & access history from server
  const fetchLoginHistory = async (showNotification = false) => {
    try {
      const res = await fetch('/api/login-history');
      if (res.ok) {
        const remoteHist = await res.json();
        if (Array.isArray(remoteHist) && remoteHist.length > 0) {
          setLoginHistory(remoteHist);
          try {
            localStorage.setItem(LOCAL_STORAGE_HISTORY, JSON.stringify(remoteHist));
          } catch {}
          if (showNotification) {
            showToast('최신 접속 및 로그인이력을 불러왔습니다.');
          }
          return;
        }
      }
    } catch (e) {
      if (showNotification) {
        showToast('로그인이력 조회 실패 (오프라인 상태)', 'info');
      }
    }
  };

  // Add real-time audit log entry and sync to central server
  const addAuditLog = async (action) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isMobile = /Android|iPhone|iPad/i.test(ua);
    const isEdge = /Edg\//i.test(ua);
    const isWhale = /Whale\//i.test(ua);
    const isChrome = /Chrome\//i.test(ua) && !isEdge;
    const browserName = isWhale ? 'Whale' : isEdge ? 'Edge' : isChrome ? 'Chrome' : isMobile ? 'Mobile' : 'Web';
    const osName = /Windows NT 10/i.test(ua) ? 'Windows 10/11' : /Macintosh/i.test(ua) ? 'macOS' : isMobile ? 'Mobile' : 'PC';
    const deviceStr = `${browserName} / ${osName}`;

    const newEntry = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timeStr,
      userId: currentUser === '김일호' ? 'kim_ilho' : currentUser === '권병학' ? 'kwon_bh' : currentUser === '조현호' ? 'cho_hh' : 'admin_fms',
      userName: currentUser !== 'ALL' ? currentUser : '관리자',
      role: currentUser === '권병학' ? '시설담당 (대리)' : currentUser === 'ALL' ? '시스템 관리자' : '시설담당 (주임)',
      dept: selectedDepartment || '체육문화센터 시설팀',
      ip: serverInfo?.clientIp || serverInfo?.ip || '127.0.0.1',
      device: deviceStr,
      action: action,
      status: '성공'
    };

    const updated = [newEntry, ...loginHistory];
    setLoginHistory(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY, JSON.stringify(updated));
    } catch (e) {}

    try {
      await fetch('/api/login-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
    } catch {}
  };

  // Re-fetch login history whenever switching to login-history module
  useEffect(() => {
    if (currentModule === 'login-history') {
      fetchLoginHistory();
    }
  }, [currentModule]);

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
      console.warn('Network sync failed, saved locally:', e.message);
    }
  };

  // Sync custom databases to LocalStorage & Central Server API
  const persistDatabases = async (newDatabases) => {
    setCustomDatabases(newDatabases);
    try {
      localStorage.setItem(LOCAL_STORAGE_DBS, JSON.stringify(newDatabases));
      await fetch('/api/databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDatabases)
      });
    } catch (e) {
      console.warn('Network sync for databases failed, saved locally:', e.message);
    }
  };

  // Sync budgets to LocalStorage & Central Server API
  const persistBudgets = async (newBudgets) => {
    setBudgets(newBudgets);
    try {
      localStorage.setItem(LOCAL_STORAGE_BUDGETS, JSON.stringify(newBudgets));
      await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBudgets)
      });
    } catch (e) {
      console.warn('Network sync for budgets failed, saved locally:', e.message);
    }
  };

  // Sync facilities to LocalStorage & Central Server API
  const persistFacilities = async (newFacilities) => {
    setFacilities(newFacilities);
    try {
      localStorage.setItem(LOCAL_STORAGE_FACILITIES, JSON.stringify(newFacilities));
      const grouped = unflattenFacilities(newFacilities);
      await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grouped)
      });
    } catch (e) {
      console.warn('Network sync for facilities failed, saved locally:', e.message);
    }
  };

  // Handle create or update facility for a department
  const handleSaveFacility = (facilityData, isEdit) => {
    let updated;
    if (isEdit) {
      const prevFac = facilities.find(f => f.id === facilityData.id);
      updated = facilities.map(f => f.id === facilityData.id ? facilityData : f);
      // Cascade facility name change to tasks in the same department
      if (prevFac && prevFac.name && facilityData.name && prevFac.name !== facilityData.name) {
        const targetDept = facilityData.department || selectedDepartment;
        let tasksUpdated = false;
        const syncedTasks = tasks.map(t => {
          if ((t.department || '남양주체육문화센터') === targetDept && t.facility === prevFac.name) {
            tasksUpdated = true;
            return { ...t, facility: facilityData.name };
          }
          return t;
        });
        if (tasksUpdated) {
          persistTasks(syncedTasks);
        }
      }
      showToast(`'${facilityData.name}' 시설 정보가 저장되었습니다.`);
      addAuditLog(`시설 정보 수정: [${selectedDepartment}] ${facilityData.name}`);
    } else {
      updated = [...facilities, facilityData];
      showToast(`'${facilityData.name}' 시설이 새로 등록되었습니다!`);
      addAuditLog(`시설 신규 등록: [${selectedDepartment}] ${facilityData.name}`);
    }
    persistFacilities(updated);
  };

  // Handle delete facility
  const handleDeleteFacility = (facilityId) => {
    const target = facilities.find(f => f.id === facilityId);
    const updated = facilities.filter(f => f.id !== facilityId);
    persistFacilities(updated);
    showToast(`'${target?.name || ''}' 시설이 삭제되었습니다.`, 'info');
    addAuditLog(`시설 삭제: [${selectedDepartment}] ${target?.name || ''}`);
  };

  // Sync department managers to LocalStorage & Central Server API
  const persistDepartmentManagers = async (newMap) => {
    setDepartmentManagers(newMap);
    try {
      localStorage.setItem(LOCAL_STORAGE_DEPT_MANAGERS, JSON.stringify(newMap));
      await fetch('/api/department-managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMap)
      });
    } catch (e) {
      console.warn('Network sync for department-managers failed, saved locally:', e.message);
    }
  };

  const handleSaveDepartmentManagers = async (updatedMap, explicitRenames = []) => {
    const prevMap = { ...INITIAL_DEPARTMENT_MANAGERS, ...departmentManagers };
    const deptReplacementMap = {};

    // 1. Apply explicit inline renames from DepartmentManagersModal
    if (Array.isArray(explicitRenames)) {
      explicitRenames.forEach(({ dept, oldName, newName }) => {
        if (!dept || !oldName || !newName) return;
        if (!deptReplacementMap[dept]) deptReplacementMap[dept] = {};
        deptReplacementMap[dept][oldName] = newName;
      });
    }

    // 2. Detect positional or 1-to-1 replacements per department
    Object.keys(updatedMap).forEach((dept) => {
      const oldList = prevMap[dept] || [];
      const newList = updatedMap[dept] || [];
      if (!deptReplacementMap[dept]) deptReplacementMap[dept] = {};

      const removed = oldList.filter((m) => !newList.includes(m));
      const added = newList.filter((m) => !oldList.includes(m));

      if (removed.length === 1 && added.length === 1) {
        deptReplacementMap[dept][removed[0]] = added[0];
      } else if (oldList.length === newList.length) {
        oldList.forEach((oldM, idx) => {
          const newM = newList[idx];
          if (oldM !== newM && !newList.includes(oldM) && !oldList.includes(newM)) {
            deptReplacementMap[dept][oldM] = newM;
          }
        });
      }
    });

    // 3. Cascade manager updates to tasks so '담당자 업무 현황' stays in sync
    let tasksChanged = false;
    const syncedTasks = tasks.map((t) => {
      const dept = t.department || '남양주체육문화센터';
      const newList = updatedMap[dept] || [];
      const replacements = deptReplacementMap[dept] || {};
      if (!t.manager) return t;

      if (replacements[t.manager]) {
        tasksChanged = true;
        return { ...t, manager: replacements[t.manager] };
      }
      if (newList.length > 0 && !newList.includes(t.manager)) {
        tasksChanged = true;
        return { ...t, manager: '' };
      }
      return t;
    });

    if (tasksChanged) {
      persistTasks(syncedTasks);
    }

    // 4. Sync currentUser and selectedManager filter if affected in selectedDepartment
    const currentDeptReplacements = deptReplacementMap[selectedDepartment] || {};
    const currentDeptNewList = updatedMap[selectedDepartment] || [];
    if (currentUser !== 'ALL') {
      if (currentDeptReplacements[currentUser]) {
        handleUserChange(currentDeptReplacements[currentUser]);
      } else if (currentDeptNewList.length > 0 && !currentDeptNewList.includes(currentUser)) {
        handleUserChange('ALL');
      }
    }
    if (selectedManager && selectedManager !== 'unassigned') {
      if (currentDeptReplacements[selectedManager]) {
        setSelectedManager(currentDeptReplacements[selectedManager]);
      } else if (currentDeptNewList.length > 0 && !currentDeptNewList.includes(selectedManager)) {
        setSelectedManager('');
      }
    }

    await persistDepartmentManagers(updatedMap);
    showToast(`부서별 담당자 정보 및 업무 현황이 업데이트되었습니다.`, 'success');
    addAuditLog(`[부서 담당자 변경] ${selectedDepartment} 등 부서별 담당자 목록 업데이트`);
  };

  // Handle register a new task pre-filled with a specific facility
  const handleNewTaskForFacility = (facilityName) => {
    setEditingTask({
      department: selectedDepartment,
      facility: facilityName,
      budget: currentDeptCategories[0] || '수선유지비',
      status: '검토',
      manager: currentUser !== 'ALL' ? currentUser : ''
    });
    setIsTaskModalOpen(true);
  };

  // Add budget category to a specific department
  const handleAddDeptCategory = (newCategoryName, targetDept = selectedDepartment) => {
    const trimmed = (newCategoryName || '').trim();
    if (!trimmed) {
      showToast('추가할 예산과목명을 입력해주세요.', 'info');
      return;
    }
    const currentDeptObj = budgets[targetDept] || { '수선유지비': 100000000 };
    if (currentDeptObj[trimmed] !== undefined) {
      showToast(`'${trimmed}'은(는) 이미 [${targetDept}]에 존재하는 예산과목입니다.`, 'info');
      return;
    }
    const updated = {
      ...(budgets && typeof budgets === 'object' ? budgets : {}),
      [targetDept]: {
        ...currentDeptObj,
        [trimmed]: 0
      }
    };
    persistBudgets(updated);
    showToast(`[${targetDept}]에 새 예산과목 '[${trimmed}]'이(가) 추가되었습니다!`);
    addAuditLog(`부서 예산과목 추가: [${targetDept}] -> [${trimmed}]`);
  };

  // Rename budget category in a specific department (cascades to targetDept tasks)
  const handleRenameDeptCategory = (oldName, newName, targetDept = selectedDepartment) => {
    const trimmed = (newName || '').trim();
    if (!trimmed || trimmed === oldName) return;
    const currentDeptObj = budgets[targetDept] || {};
    if (currentDeptObj[trimmed] !== undefined) {
      showToast(`'${trimmed}'은(는) 이미 [${targetDept}]에 존재하는 예산과목명입니다.`, 'info');
      return;
    }

    // 1. Rename key in targetDept budget
    const updatedDept = {};
    Object.keys(currentDeptObj).forEach(key => {
      if (key === oldName) {
        updatedDept[trimmed] = currentDeptObj[oldName];
      } else {
        updatedDept[key] = currentDeptObj[key];
      }
    });
    const updated = {
      ...(budgets && typeof budgets === 'object' ? budgets : {}),
      [targetDept]: updatedDept
    };
    persistBudgets(updated);

    // 2. Cascade rename to targetDept tasks
    let affectedTasksCount = 0;
    const updatedTasks = tasks.map(t => {
      if ((t.department || '남양주체육문화센터') === targetDept && t.budget === oldName) {
        affectedTasksCount++;
        return { ...t, budget: trimmed };
      }
      return t;
    });
    if (affectedTasksCount > 0) {
      persistTasks(updatedTasks);
    }

    if (selectedDepartment === targetDept && selectedBudget === oldName) {
      setSelectedBudget(trimmed);
    }

    showToast(`[${targetDept}] 예산과목이 '[${oldName}]'에서 '[${trimmed}]'(으)로 변경되었습니다. (공사 ${affectedTasksCount}건 반영)`);
    addAuditLog(`부서 예산과목 변경: [${targetDept}] [${oldName}] -> [${trimmed}] (${affectedTasksCount}건)`);
  };

  // Delete budget category from a specific department (reassigns targetDept tasks to default)
  const handleDeleteDeptCategory = (categoryToDelete, targetDept = selectedDepartment) => {
    const currentDeptObj = budgets[targetDept] || {};
    const keys = Object.keys(currentDeptObj);
    if (keys.length <= 1) {
      alert('최소 1개 이상의 예산과목이 유지되어야 하므로 삭제할 수 없습니다.');
      return;
    }

    const fallbackCategory = keys.find(c => c !== categoryToDelete && c === '수선유지비') || 
      keys.find(c => c !== categoryToDelete) || 
      '수선유지비';

    const affectedTasks = tasks.filter(t => (t.department || '남양주체육문화센터') === targetDept && t.budget === categoryToDelete);
    const confirmMessage = affectedTasks.length > 0
      ? `[${targetDept}]의 '${categoryToDelete}' 예산과목을 삭제하시겠습니까?\n현재 이 과목으로 지정된 공사 ${affectedTasks.length}건은 기본 항목인 '${fallbackCategory}'(으)로 일괄 변경됩니다.`
      : `[${targetDept}]의 '${categoryToDelete}' 예산과목을 삭제하시겠습니까?`;

    if (!window.confirm(confirmMessage)) return;

    // 1. Remove category from targetDept budget
    const updatedDept = { ...currentDeptObj };
    delete updatedDept[categoryToDelete];
    const updated = {
      ...(budgets && typeof budgets === 'object' ? budgets : {}),
      [targetDept]: updatedDept
    };
    persistBudgets(updated);

    // 2. Cascade reassignment to targetDept tasks
    if (affectedTasks.length > 0) {
      const updatedTasks = tasks.map(t => {
        if ((t.department || '남양주체육문화센터') === targetDept && t.budget === categoryToDelete) {
          return { ...t, budget: fallbackCategory };
        }
        return t;
      });
      persistTasks(updatedTasks);
    }

    if (selectedDepartment === targetDept && selectedBudget === categoryToDelete) {
      setSelectedBudget('');
    }

    showToast(`[${targetDept}]의 '${categoryToDelete}' 예산과목이 삭제되었습니다.${affectedTasks.length > 0 ? ` (공사 ${affectedTasks.length}건이 '${fallbackCategory}'(으)로 변경됨)` : ''}`);
    addAuditLog(`부서 예산과목 삭제: [${targetDept}] [${categoryToDelete}] (공사 ${affectedTasks.length}건 -> ${fallbackCategory})`);
  };

  // Save budget allocations for a specific department
  const handleSaveDepartmentBudgets = (newDeptBudgets, targetDept = selectedDepartment) => {
    const updatedAllBudgets = {
      ...(budgets && typeof budgets === 'object' ? budgets : {}),
      [targetDept]: newDeptBudgets
    };
    persistBudgets(updatedAllBudgets);
    showToast(`[${targetDept}] 예산금액이 저장되었습니다.`);
    addAuditLog(`부서 예산 설정: [${targetDept}]`);
  };

  // Fetch initial tasks, databases & server info on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const infoRes = await fetch('/api/server-info');
        if (infoRes.ok) {
          const info = await infoRes.json();
          setServerInfo(info);
        }
      } catch (e) {}

      try {
        const tasksRes = await fetch('/api/tasks');
        if (tasksRes.ok) {
          const remoteTasks = await tasksRes.json();
          if (Array.isArray(remoteTasks) && remoteTasks.length > 0) {
            setTasks(remoteTasks);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteTasks));
          }
        }
      } catch (e) {}

      try {
        const dbRes = await fetch('/api/databases');
        if (dbRes.ok) {
          const remoteDbs = await dbRes.json();
          if (Array.isArray(remoteDbs) && remoteDbs.length > 0) {
            const filtered = remoteDbs.filter(d => d.id !== 'db-equipment' && d.id !== 'db-vehicles');
            setCustomDatabases(filtered);
            localStorage.setItem(LOCAL_STORAGE_DBS, JSON.stringify(filtered));
          }
        }
      } catch (e) {}

      try {
        const budgetRes = await fetch('/api/budgets');
        if (budgetRes.ok) {
          const remoteBudgets = await budgetRes.json();
          if (remoteBudgets && typeof remoteBudgets === 'object') {
            setBudgets(remoteBudgets);
            localStorage.setItem(LOCAL_STORAGE_BUDGETS, JSON.stringify(remoteBudgets));
          }
        }
      } catch (e) {}

      try {
        const catRes = await fetch('/api/budget-categories');
        if (catRes.ok) {
          const remoteCats = await catRes.json();
          if (Array.isArray(remoteCats) && remoteCats.length > 0) {
            setBudgetCategories(remoteCats);
            localStorage.setItem(LOCAL_STORAGE_BUDGET_CATEGORIES, JSON.stringify(remoteCats));
          }
        }
      } catch (e) {}

      try {
        const facRes = await fetch('/api/facilities');
        if (facRes.ok) {
          const remoteFacs = await facRes.json();
          const flat = flattenFacilities(remoteFacs);
          if (flat.length > 0) {
            setFacilities(flat);
            localStorage.setItem(LOCAL_STORAGE_FACILITIES, JSON.stringify(flat));
          }
        }
      } catch (e) {}

      try {
        const mgrRes = await fetch('/api/department-managers');
        if (mgrRes.ok) {
          const remoteMgrs = await mgrRes.json();
          if (remoteMgrs && typeof remoteMgrs === 'object' && Object.keys(remoteMgrs).length > 0) {
            const merged = { ...INITIAL_DEPARTMENT_MANAGERS, ...remoteMgrs };
            setDepartmentManagers(merged);
            localStorage.setItem(LOCAL_STORAGE_DEPT_MANAGERS, JSON.stringify(merged));
          }
        }
      } catch (e) {}

      // Fetch centralized login & access history
      try {
        const histRes = await fetch('/api/login-history');
        if (histRes.ok) {
          const remoteHist = await histRes.json();
          if (Array.isArray(remoteHist) && remoteHist.length > 0) {
            setLoginHistory(remoteHist);
            localStorage.setItem(LOCAL_STORAGE_HISTORY, JSON.stringify(remoteHist));
          }
        }
      } catch (e) {}

      // Record this client's connection in central login history
      try {
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        const isMobile = /Android|iPhone|iPad/i.test(ua);
        const isEdge = /Edg\//i.test(ua);
        const isWhale = /Whale\//i.test(ua);
        const isChrome = /Chrome\//i.test(ua) && !isEdge;
        const browserName = isWhale ? 'Whale' : isEdge ? 'Edge' : isChrome ? 'Chrome' : isMobile ? 'Mobile' : 'Web';
        const osName = /Windows NT 10/i.test(ua) ? 'Windows 10/11' : /Macintosh/i.test(ua) ? 'macOS' : isMobile ? 'Mobile' : 'PC';
        const deviceStr = `${browserName} / ${osName}`;

        const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const accessDesc = isLocalHost 
          ? '메인 컴퓨터 시스템 접속' 
          : window.location.hostname.includes('render') 
          ? 'Render 클라우드 원격 접속'
          : `사내 다른 PC 접속 (${window.location.hostname})`;

        const res = await fetch('/api/login-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser === '김일호' ? 'kim_ilho' : currentUser === '권병학' ? 'kwon_bh' : currentUser === '조현호' ? 'cho_hh' : 'staff',
            userName: currentUser !== 'ALL' ? currentUser : '접속자',
            role: currentUser === '권병학' ? '시설담당 (대리)' : currentUser === 'ALL' ? '직원/방문자' : '시설담당 (주임)',
            dept: selectedDepartment || '체육문화센터 시설팀',
            action: accessDesc,
            device: deviceStr
          })
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData.entry) {
            setLoginHistory(prev => [resData.entry, ...prev.filter(x => x.id !== resData.entry.id)]);
          }
        }
      } catch (e) {}
    };

    fetchInitialData();
  }, []);

  // Global refresh function called after restore or bulk operations
  const refreshAllData = async () => {
    try {
      const [tasksRes, dbRes, budgetRes, catRes, facRes, mgrRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/databases'),
        fetch('/api/budgets'),
        fetch('/api/budget-categories'),
        fetch('/api/facilities'),
        fetch('/api/department-managers')
      ]);

      if (tasksRes.ok) {
        const remoteTasks = await tasksRes.json();
        if (Array.isArray(remoteTasks)) {
          setTasks(remoteTasks);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteTasks));
        }
      }

      if (dbRes.ok) {
        const remoteDbs = await dbRes.json();
        if (Array.isArray(remoteDbs)) {
          const filtered = remoteDbs.filter(d => d.id !== 'db-equipment' && d.id !== 'db-vehicles');
          setCustomDatabases(filtered);
          localStorage.setItem(LOCAL_STORAGE_DBS, JSON.stringify(filtered));
        }
      }

      if (budgetRes.ok) {
        const remoteBudgets = await budgetRes.json();
        if (remoteBudgets && typeof remoteBudgets === 'object') {
          setBudgets(remoteBudgets);
          localStorage.setItem(LOCAL_STORAGE_BUDGETS, JSON.stringify(remoteBudgets));
        }
      }

      if (catRes.ok) {
        const remoteCats = await catRes.json();
        if (Array.isArray(remoteCats)) {
          setBudgetCategories(remoteCats);
          localStorage.setItem(LOCAL_STORAGE_BUDGET_CATEGORIES, JSON.stringify(remoteCats));
        }
      }

      if (facRes.ok) {
        const remoteFacs = await facRes.json();
        const flat = flattenFacilities(remoteFacs);
        if (flat.length > 0) {
          setFacilities(flat);
          localStorage.setItem(LOCAL_STORAGE_FACILITIES, JSON.stringify(flat));
        }
      }

      if (mgrRes && mgrRes.ok) {
        const remoteMgrs = await mgrRes.json();
        if (remoteMgrs && typeof remoteMgrs === 'object' && Object.keys(remoteMgrs).length > 0) {
          const merged = { ...INITIAL_DEPARTMENT_MANAGERS, ...remoteMgrs };
          setDepartmentManagers(merged);
          localStorage.setItem(LOCAL_STORAGE_DEPT_MANAGERS, JSON.stringify(merged));
        }
      }

      await fetchLoginHistory();
    } catch (e) {
      console.error('refreshAllData error:', e);
    }
  };

  // Real-time synchronization polling (every 4 seconds)
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const mgrRes = await fetch('/api/department-managers');
        if (mgrRes.ok) {
          const latestMgrs = await mgrRes.json();
          if (latestMgrs && typeof latestMgrs === 'object' && Object.keys(latestMgrs).length > 0) {
            setDepartmentManagers(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(latestMgrs)) {
                localStorage.setItem(LOCAL_STORAGE_DEPT_MANAGERS, JSON.stringify(latestMgrs));
                return { ...INITIAL_DEPARTMENT_MANAGERS, ...latestMgrs };
              }
              return prev;
            });
          }
        }
      } catch (e) {}

      try {
        const catRes = await fetch('/api/budget-categories');
        if (catRes.ok) {
          const latestCats = await catRes.json();
          if (Array.isArray(latestCats) && latestCats.length > 0) {
            setBudgetCategories(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(latestCats)) {
                localStorage.setItem(LOCAL_STORAGE_BUDGET_CATEGORIES, JSON.stringify(latestCats));
                return latestCats;
              }
              return prev;
            });
          }
        }
      } catch (e) {}

      try {
        const facRes = await fetch('/api/facilities');
        if (facRes.ok) {
          const latestFacs = await facRes.json();
          const flat = flattenFacilities(latestFacs);
          if (flat.length > 0) {
            setFacilities(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(flat)) {
                localStorage.setItem(LOCAL_STORAGE_FACILITIES, JSON.stringify(flat));
                return flat;
              }
              return prev;
            });
          }
        }
      } catch (e) {}

      try {
        const tasksRes = await fetch('/api/tasks');
        if (tasksRes.ok) {
          const latestTasks = await tasksRes.json();
          if (Array.isArray(latestTasks)) {
            setTasks(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(latestTasks)) {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(latestTasks));
                return latestTasks;
              }
              return prev;
            });
          }
        }
      } catch (e) {}

      try {
        const dbRes = await fetch('/api/databases');
        if (dbRes.ok) {
          const latestDbs = await dbRes.json();
          if (Array.isArray(latestDbs)) {
            setCustomDatabases(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(latestDbs)) {
                localStorage.setItem(LOCAL_STORAGE_DBS, JSON.stringify(latestDbs));
                return latestDbs;
              }
              return prev;
            });
          }
        }
      } catch (e) {}

      // Real-time live sync with Cowork Data Collection Portal (port 3001)
      try {
        const coworkHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const coworkRes = await fetch(`http://${coworkHost}:3001/api/submissions`);
        if (coworkRes.ok) {
          const json = await coworkRes.json();
          if (json.success && Array.isArray(json.data)) {
            const liveMap = {};
            json.data.forEach(item => {
              liveMap[item.facility_name] = {
                status: item.status === '제출완료' ? '제출완료' : '미제출',
                submittedAt: item.submitted_at || null,
                writer: item.writer_name || item.writer_dept || '',
                memo: item.memo || item.submission_note || ''
              };
            });
            setSubmissionMap(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(liveMap)) {
                localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS, JSON.stringify(liveMap));
                return liveMap;
              }
              return prev;
            });
          }
        }
      } catch (e) {
        // Cowork server might be initializing or unreachable, gracefully ignore
      }
    }, 4000);

  
    return () => clearInterval(pollInterval);
  }, []);

  // Guard system modules for non-host
  useEffect(() => {
    if (!isHostClient && (currentModule === 'login-history' || currentModule === 'backup-restore' || currentModule === 'version-history')) {
      setCurrentModule('databases');
    }
  }, [isHostClient, currentModule]);

  // Toggle submission status for a department (수동 제출 완료/미제출 처리 및 연동)
  const handleToggleSubmission = (deptName, targetStatus) => {
    setSubmissionMap(prev => {
      const currentStatus = prev[deptName]?.status === '제출완료' ? '제출완료' : '미제출';
      const nextStatus = targetStatus || (currentStatus === '제출완료' ? '미제출' : '제출완료');
      const updated = {
        ...prev,
        [deptName]: {
          ...prev[deptName],
          status: nextStatus,
          submittedAt: nextStatus === '제출완료' ? new Date().toISOString().replace('T', ' ').slice(0, 19) : null,
          writer: currentUser !== 'ALL' ? currentUser : '관리자'
        }
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const isNowDone = targetStatus === '제출완료' || (!targetStatus && submissionMap[deptName]?.status !== '제출완료');
    if (isNowDone) {
      showToast(`🟢 [${deptName}] 자료가 제출완료 처리되었습니다!`);
    } else {
      showToast(`⏳ [${deptName}] 자료가 미제출 상태로 변경되었습니다.`, 'info');
    }
    addAuditLog(`부서 제출상태 변경: [${deptName}] -> [${isNowDone ? '제출완료' : '미제출'}]`);
  };

  // Switch persona / current user
  const handleUserChange = (newUser) => {
    setCurrentUser(newUser);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER, newUser);
    } catch (e) {}
    addAuditLog(`사용자 변경: [${newUser}] 계정으로 전환`);
    showToast(`접속자가 [${newUser === 'ALL' ? '전체 보기 (관리자)' : newUser + ' 담당자'}](으)로 변경되었습니다.`, 'info');
  };

  // Quick filter for 'My Tasks'
  const handleQuickFilterMyTasks = () => {
    if (isMyTasksActive) {
      setSelectedManager('');
      setIsMyTasksActive(false);
      showToast('전체 담당자 업무로 전환되었습니다.', 'info');
    } else {
      setSelectedManager(currentUser);
      setIsMyTasksActive(true);
      showToast(`'${currentUser}' 님의 담당 업무만 필터링합니다.`);
    }
  };

  // Filter tasks strictly by selectedDepartment
  const departmentTasks = useMemo(() => {
    return tasks.filter((t) => (t.department || '남양주체육문화센터') === selectedDepartment);
  }, [tasks, selectedDepartment]);

  // Filter tasks for the active department
  const filteredTasks = useMemo(() => {
    return departmentTasks.filter((task) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = (task.title || '').toLowerCase().includes(query);
        const matchesFacility = (task.facility || '').toLowerCase().includes(query);
        const matchesLocation = (task.location || '').toLowerCase().includes(query);
        const matchesVendor = (task.vendor || '').toLowerCase().includes(query);
        const matchesContact = (task.contact || '').toLowerCase().includes(query);
        const matchesNote = (task.estimatedCostNote || '').toLowerCase().includes(query);

        if (!matchesTitle && !matchesFacility && !matchesLocation && !matchesVendor && !matchesContact && !matchesNote) {
          return false;
        }
      }

      // Facility filter
      if (selectedFacility && task.facility !== selectedFacility) {
        return false;
      }

      // Budget filter
      if (selectedBudget && task.budget !== selectedBudget) {
        return false;
      }

      // Status filter
      if (selectedStatus && task.status !== selectedStatus) {
        return false;
      }

      // Manager filter
      if (selectedManager) {
        if (selectedManager === 'unassigned') {
          if (task.manager) return false;
        } else if (task.manager !== selectedManager) {
          return false;
        }
      }

      return true;
    });
  }, [departmentTasks, searchQuery, selectedFacility, selectedBudget, selectedStatus, selectedManager]);

  // Reset all filters
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

  const handleStatusFilterClick = (status) => {
    setSelectedStatus((prev) => (prev === status ? '' : status));
    setViewMode('table');
  };

  // Add / Edit Task
  const handleSaveTask = (taskData) => {
    const taskToSave = {
      ...taskData,
      department: taskData.department || selectedDepartment || '남양주체육문화센터'
    };
    let updated;
    const exists = tasks.some((t) => t.id === taskToSave.id);
    if (exists) {
      updated = tasks.map((t) => (t.id === taskToSave.id ? taskToSave : t));
      showToast(`'${taskToSave.title}' 정보가 수정되었습니다.`);
      addAuditLog(`공사 업무 수정: [${taskToSave.title}] (${taskToSave.department})`);
    } else {
      updated = [taskToSave, ...tasks];
      showToast(`'${taskToSave.title}' 신규 공사가 등록되었습니다.`);
      addAuditLog(`공사 업무 신규등록: [${taskToSave.title}] (${taskToSave.department})`);
    }
    persistTasks(updated);

    if (selectedTask && selectedTask.id === taskToSave.id) {
      setSelectedTask(taskToSave);
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
      addAuditLog(`공사 업무 삭제: [${title}]`);
    }
  };

  // Quick Inline Status Change
  const handleQuickStatusChange = (id, newStatus) => {
    let targetTitle = '';
    const updated = tasks.map((t) => {
      if (t.id === id) {
        targetTitle = t.title;
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
    addAuditLog(`상태 변경: [${targetTitle}] -> [${newStatus}]`);
  };


  // Quick Inline Task Field Update (스프레드시트에서 바로 수정)
  const handleQuickFieldChange = (id, field, value) => {
    let targetTitle = '';
    const updated = tasks.map((t) => {
      if (t.id === id) {
        targetTitle = t.title;
        const item = {
          ...t,
          [field]: value,
          logs: [
            ...(t.logs || []),
            {
              date: new Date().toISOString().split('T')[0],
              author: currentUser !== 'ALL' ? currentUser : '관리자',
              message: `[${field}] 직접 수정: ${value !== null && value !== undefined && value !== '' ? (typeof value === 'number' ? value.toLocaleString() + '원' : value) : '삭제'}`
            }
          ]
        };
        if (selectedTask?.id === id) {
          setSelectedTask(item);
        }
        return item;
      }
      return t;
    });
    persistTasks(updated);
    addAuditLog(`스프레드시트 셀 수정: [${targetTitle}] ${field} = ${value}`);
  };

  // Quick Inline Manager Change
  const handleQuickManagerChange = (id, newManager) => {
    let targetTitle = '';
    const updated = tasks.map((t) => {
      if (t.id === id) {
        targetTitle = t.title;
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
        showToast(`담당자가 [${newManager || '미정'}](으)로 변경되었습니다.`);
        if (selectedTask?.id === id) {
          setSelectedTask(item);
        }
        return item;
      }
      return t;
    });
    persistTasks(updated);
    addAuditLog(`담당자 변경: [${targetTitle}] -> [${newManager || '미정'}]`);
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
    addAuditLog(`업무일지 등록: [${selectedTask?.title || '공사'}]`);
  };

  // Custom Database Handlers (Create, Update, Delete Database)
  const handleSaveDatabase = (dbData) => {
    const exists = customDatabases.some(d => d.id === dbData.id);
    let updated;
    if (exists) {
      updated = customDatabases.map(d => d.id === dbData.id ? dbData : d);
      showToast(`'${dbData.name}' 데이터베이스가 저장되었습니다.`);
      addAuditLog(`데이터베이스 수정: [${dbData.name}]`);
    } else {
      updated = [...customDatabases, dbData];
      showToast(`'${dbData.name}' 새 데이터베이스가 생성되었습니다!`);
      addAuditLog(`데이터베이스 신규생성: [${dbData.name}]`);
    }
    persistDatabases(updated);
  };

  const handleDeleteDatabase = (dbId) => {
    const target = customDatabases.find(d => d.id === dbId);
    const updated = customDatabases.filter(d => d.id !== dbId);
    persistDatabases(updated);
    showToast(`'${target?.name || ''}' 데이터베이스가 삭제되었습니다.`, 'info');
    addAuditLog(`데이터베이스 삭제: [${target?.name || ''}]`);
  };

  // Reset to default original 35 tasks
  const handleResetData = () => {
    if (window.confirm('초기 데이터 35건으로 복원하시겠습니까? (직접 추가하거나 수정한 내용이 초기화됩니다)')) {
      persistTasks(INITIAL_TASKS);
      resetFilters();
      setSelectedTask(null);
      showToast('초기 35건의 공사 데이터로 복원되었습니다.');
      addAuditLog('초기 35건 시설보수 데이터 전체 복원');
    }
  };

  // Excel Export: Current Department Tasks
  const handleExportExcel = () => {
    const targetTasks = (filteredTasks && filteredTasks.length > 0) 
      ? filteredTasks 
      : (departmentTasks && departmentTasks.length > 0) 
      ? departmentTasks 
      : tasks;
    exportToExcel(targetTasks || [], `${selectedDepartment || '남양주체육문화센터'}_공사업무현황_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast(`[${selectedDepartment || '전체'}] 공사 목록(${targetTasks?.length || 0}건)이 Excel로 다운로드되었습니다.`);
    addAuditLog(`공사현황 엑셀 다운로드: [${selectedDepartment}] (총 ${targetTasks?.length || 0}건)`);
  };

  // Excel Export: Master All Data (전 부서 공사 + 시설현황 + 예산 종합)
  const handleExportAllExcel = () => {
    exportMasterDataToExcel({
      allTasks: tasks,
      facilities: facilities,
      budgets: budgets,
      loginHistory: loginHistory,
      fileName: `남양주도시공사_시설본부_전체통합데이터_${new Date().toISOString().split('T')[0]}.xlsx`
    });
    showToast('시설본부 전체 통합 데이터(5개 시트)가 Excel로 다운로드되었습니다.');
    addAuditLog(`전체 통합 엑셀 다운로드 (공사 ${tasks.length}건, 시설 ${facilities.length}개소)`);
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

  const myTasksCount = departmentTasks.filter((t) => t.manager === currentUser).length;
  const hasActiveFilters = Boolean(searchQuery || selectedFacility || selectedBudget || selectedStatus || selectedManager);

  return (
    <div className={`min-h-screen flex bg-slate-100 font-sans ${(previewAsStaff || isReadOnly) ? 'pt-9' : ''}`}>
      
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

      {/* 0-A. Render Cloud Read-Only Mode Banner */}
      {isReadOnly && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white px-4 py-2 text-xs font-bold shadow-lg flex items-center justify-between animate-fade-in border-b border-blue-400/50">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-white/20 text-white animate-pulse text-sm">
              ☁️
            </span>
            <span>
              [클라우드 안전 열람 모드] Render 클라우드에 접속 중입니다. 메인 PC 데이터의 안전한 보호를 위해 <strong>열람 전용(Read-Only)</strong>으로 동작합니다. (도면/사진/엑셀 다운로드 가능)
            </span>
          </div>
          {serverInfo?.localHostUrl && (
            <a
              href={serverInfo.localHostUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 text-[11px]"
            >
              <span>메인 PC 접속</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-700" />
            </a>
          )}
        </div>
      )}

      {/* 0. Staff Screen Preview Mode Banner (다른 PC / 직원 시점 미리보기 바) */}
      {previewAsStaff && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 text-xs font-bold shadow-lg flex items-center justify-between animate-fade-in border-b border-amber-400/50">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-white/20 text-white animate-pulse text-sm">
              👁️
            </span>
            <span>
              [직원 화면 미리보기 모드] 다른 PC나 스마트폰으로 접속했을 때 보이는 화면입니다. (시스템 관리 메뉴가 완벽히 숨겨집니다)
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setPreviewAsStaff(false);
              showToast('관리자 모드로 복귀했습니다.');
            }}
            className="px-3.5 py-1 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-black shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>관리자 모드로 돌아가기</span>
            <span className="text-[11px] text-amber-700 font-bold">✕</span>
          </button>
        </div>
      )}

      {/* 1. Left Frame: Collapsible Sidebar with Organization Tree */}
      <Sidebar
        currentModule={currentModule}
        onModuleChange={setCurrentModule}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedDbId="facility"
        selectedDivision={selectedDivision}
        onSelectDivision={(divId) => {
          setSelectedDivision(divId);
          localStorage.setItem('nyj_selected_division', divId);
        }}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={(deptName) => {
          setSelectedDepartment(deptName);
          localStorage.setItem('nyj_selected_dept', deptName);
          addAuditLog(`사이드바 조직도 이동: [${deptName}]`);
        }}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        currentUser={currentUser}
        tasksCount={departmentTasks.length}
        facilitiesCount={currentDeptFacilities.length}
        serverInfo={serverInfo}
        submissionStats={submissionStats}
        submissionMap={submissionMap}
        onOpenDeptManagersModal={() => setIsDeptManagersModalOpen(true)}
        isHost={isHostClient}
        isActualHost={isActualHost}
        onToggleStaffPreview={setPreviewAsStaff}
      />

      {/* 2. Right Work Frame: Full Screen Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Main Work Area (Screen-filling full width) */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5">
          
          {/* Module 1: 시스템관리 > 로그인이력조회 */}
          {currentModule === 'login-history' && (
            <LoginHistoryView
              history={loginHistory}
              onRefresh={() => fetchLoginHistory(true)}
              serverInfo={serverInfo}
            />
          )}

          {/* Module 1-B: 시스템관리 > 데이터 백업 및 복구 안전 센터 */}
          {currentModule === 'backup-restore' && (
            <BackupRestoreView
              onRefreshAllData={refreshAllData}
              addAuditLog={addAuditLog}
              currentUser={currentUser}
            />
          )}

          {/* Module 1-C: 시스템관리 > 시스템 버전 및 변경 이력 관리 (내 컴퓨터 전용) */}
          {currentModule === 'version-history' && (
            <VersionManagementView
              onNavigateToBackup={() => setCurrentModule('backup-restore')}
              onNavigateBack={() => {
                setCurrentModule('databases');
                setSelectedDbId('facility');
              }}
              currentUser={currentUser}
            />
          )}

          {/* Module 2: 부서별 시설 현황 및 개요 */}
          {currentModule === 'facility-overview' && (
            <FacilityOverviewView
              facilities={facilities}
              selectedDepartment={selectedDepartment}
              tasks={tasks}
              onSaveFacility={handleSaveFacility}
              onDeleteFacility={handleDeleteFacility}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onNewTaskForFacility={handleNewTaskForFacility}
              onNavigateToTasks={() => {
                setCurrentModule('databases');
                setSelectedDbId('facility');
                setViewMode('table');
              }}
              currentUser={currentUser}
              onOpenDeptManagersModal={() => setIsDeptManagersModalOpen(true)}
            />
          )}

          {/* Module 3: 업무 데이터베이스 (조직도 토글 및 하위 시설·공사 관리 통합) */}
          {(currentModule === 'databases' || currentModule === 'facility') && (
            <>
              {/* Organization Department Bar with Toggles & Actions */}
              <OrgDepartmentBar
                selectedDivision={selectedDivision}
                selectedDepartment={selectedDepartment}
                currentUser={currentUser}
                onUserChange={handleUserChange}
                managers={currentDeptManagers}
                onOpenDeptManagersModal={() => setIsDeptManagersModalOpen(true)}
                isHost={isHostClient}
                onOpenVersion={() => setCurrentModule('version-history')}
                isActualHost={isActualHost}
                onToggleStaffPreview={setPreviewAsStaff}
              />

              {/* Sub-item A: 시설·공사 관리 (Maintenance Management Suite) */}
              {selectedDbId === 'facility' && (
                <>
                  {/* KPI Summary Cards */}
                  <StatsCards
                    tasks={departmentTasks}
                    allTasks={tasks}
                    selectedDepartment={selectedDepartment}
                    budgets={currentDeptBudgets}
                    allBudgets={budgets}
                    onFilterClick={handleStatsFilterClick}
                    onStatusFilterClick={handleStatusFilterClick}
                    selectedStatus={selectedStatus}
                    onSaveBudgets={handleSaveDepartmentBudgets}
                    onSaveDepartmentBudget={handleSaveDepartmentBudgets}
                    budgetCategories={currentDeptCategories}
                    onAddCategory={handleAddDeptCategory}
                    onRenameCategory={handleRenameDeptCategory}
                    onDeleteCategory={handleDeleteDeptCategory}
                    managers={currentDeptManagers}
                    onOpenDeptManagersModal={() => setIsDeptManagersModalOpen(true)}
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
                    isReadOnly={isReadOnly}
                    onNewTask={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    onExportExcel={handleExportExcel}
                    onExportAllExcel={handleExportAllExcel}
                    budgetCategories={currentDeptCategories}
                    facilities={Array.from(new Set([...currentDeptFacilities.map(f => f.name), ...departmentTasks.map(t => t.facility).filter(Boolean)]))}
                    managers={currentDeptManagers}
                  />

                  {/* Dynamic Views */}
                  {viewMode === 'table' && (
                    <TableView
                      tasks={filteredTasks}
                      onEditTask={(task) => {
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                      }}
                      onDeleteTask={handleDeleteTask}
                      onQuickStatusChange={handleQuickStatusChange}
                      onQuickManagerChange={handleQuickManagerChange}
                      onQuickFieldChange={handleQuickFieldChange}
                      managers={currentDeptManagers}
                      facilities={currentDeptFacilities.map(f => f.name)}
                      budgetCategories={currentDeptCategories}
                      isReadOnly={isReadOnly}
                    />
                  )}

                  {viewMode === 'kanban' && (
                    <KanbanView
                      tasks={filteredTasks}
                      onSelectTask={(task) => {
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                      }}
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
                      facilities={currentDeptFacilities}
                      onSelectTask={(task) => {
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                      }}
                      onNewTask={() => {
                        setEditingTask(null);
                        setIsTaskModalOpen(true);
                      }}
                    />
                  )}

                  {viewMode === 'staff' && (
                    <StaffView
                      tasks={filteredTasks}
                      onSelectTask={(task) => {
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                      }}
                      onQuickManagerChange={handleQuickManagerChange}
                      managers={currentDeptManagers}
                      selectedDepartment={selectedDepartment}
                      onOpenDeptManagersModal={() => setIsDeptManagersModalOpen(true)}
                    />
                  )}

                  {viewMode === 'calendar' && (
                    <CalendarView
                      tasks={filteredTasks}
                      onSelectTask={(task) => {
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                      }}
                      onEditTask={(task) => {
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                      }}
                      onNewTask={(initialDateObj) => {
                        setEditingTask(initialDateObj || null);
                        setIsTaskModalOpen(true);
                      }}
                      selectedDepartment={selectedDepartment}
                    />
                  )}
                </>
              )}
            </>
          )}

        </main>
      </div>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
        task={editingTask}
        selectedDepartment={selectedDepartment}
        currentUser={currentUser}
        budgetCategories={currentDeptCategories}
        facilityOptions={currentDeptFacilities.map(f => f.name)}
        allFacilities={facilities}
        allBudgets={budgets}
        allDepartmentManagers={departmentManagers}
        managers={currentDeptManagers}
        isReadOnly={isReadOnly}
      />

      {/* Department Managers Modal */}
      <DepartmentManagersModal
        isOpen={isDeptManagersModalOpen}
        onClose={() => setIsDeptManagersModalOpen(false)}
        departmentManagers={departmentManagers}
        selectedDepartment={selectedDepartment}
        onSaveManagers={handleSaveDepartmentManagers}
      />

      {/* Messenger / KakaoTalk Share Modal */}
      <MessengerShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        tasks={filteredTasks}
        totalCost={tasks.reduce((sum, t) => sum + (Number(t.estimatedCost) || 0), 0)}
        currentUser={currentUser}
      />

      {/* Other Staff Connection Modal */}
      <ConnectStaffModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        serverInfo={serverInfo}
      />

    </div>
  );
}
