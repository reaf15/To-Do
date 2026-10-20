import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const BACKUP_DIR = path.resolve(DATA_DIR, 'backups');

const TASKS_FILE = path.resolve(DATA_DIR, 'tasks.json');
const FACILITIES_FILE = path.resolve(DATA_DIR, 'facilities.json');
const BUDGETS_FILE = path.resolve(DATA_DIR, 'budgets.json');
const BUDGET_CATEGORIES_FILE = path.resolve(DATA_DIR, 'budget_categories.json');
const CUSTOM_DB_FILE = path.resolve(DATA_DIR, 'custom_databases.json');

// Ensure backup dir exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function getFormattedDate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return {
    dateOnly: `${year}-${month}-${day}`,
    dateTimeStr: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
    fileTimestamp: `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
  };
}

/**
 * Read current live data
 */
export function getCurrentLiveData() {
  const tasks = fs.existsSync(TASKS_FILE) ? JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8')) : [];
  const facilities = fs.existsSync(FACILITIES_FILE) ? JSON.parse(fs.readFileSync(FACILITIES_FILE, 'utf-8')) : {};
  const budgets = fs.existsSync(BUDGETS_FILE) ? JSON.parse(fs.readFileSync(BUDGETS_FILE, 'utf-8')) : {};
  const budgetCategories = fs.existsSync(BUDGET_CATEGORIES_FILE) ? JSON.parse(fs.readFileSync(BUDGET_CATEGORIES_FILE, 'utf-8')) : [];
  const customDatabases = fs.existsSync(CUSTOM_DB_FILE) ? JSON.parse(fs.readFileSync(CUSTOM_DB_FILE, 'utf-8')) : [];

  // Count facilities
  let facCount = 0;
  if (Array.isArray(facilities)) {
    facCount = facilities.length;
  } else if (typeof facilities === 'object') {
    Object.values(facilities).forEach(list => {
      if (Array.isArray(list)) facCount += list.length;
    });
  }

  const totalCost = Array.isArray(tasks) 
    ? tasks.reduce((sum, t) => sum + (Number(t.estimatedCost) || 0), 0)
    : 0;

  return {
    tasks,
    facilities,
    budgets,
    budgetCategories,
    customDatabases,
    summary: {
      tasksCount: tasks.length,
      facilitiesCount: facCount,
      budgetsCount: Object.keys(budgets).length,
      totalEstimatedCost: totalCost
    }
  };
}

/**
 * Create a new backup snapshot
 * @param {Object} options - { type: 'daily' | 'manual' | 'checkpoint', note: string }
 */
export function createSnapshot({ type = 'daily', note = '' } = {}) {
  const live = getCurrentLiveData();
  const { dateOnly, dateTimeStr, fileTimestamp } = getFormattedDate();

  let fileName = '';
  let title = '';

  if (type === 'daily') {
    fileName = `backup_daily_${dateOnly}.json`;
    title = `${dateOnly} 일일 정기 자동 백업`;
  } else if (type === 'checkpoint') {
    fileName = `checkpoint_pre_restore_${fileTimestamp}.json`;
    title = `복구 전 안전 체크포인트 (${dateTimeStr})`;
  } else {
    fileName = `backup_manual_${fileTimestamp}.json`;
    title = note ? `수동 백업: ${note}` : `관리자 수동 백업 (${dateTimeStr})`;
  }

  const backupId = `BKP-${fileTimestamp}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const payload = {
    backupId,
    type,
    title,
    note: note || '',
    createdAt: new Date().toISOString(),
    createdDate: dateTimeStr,
    summary: live.summary,
    data: {
      tasks: live.tasks,
      facilities: live.facilities,
      budgets: live.budgets,
      budgetCategories: live.budgetCategories,
      customDatabases: live.customDatabases
    }
  };

  const targetPath = path.resolve(BACKUP_DIR, fileName);
  fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2), 'utf-8');

  // Also create a matching Excel workbook for daily & manual backups
  if (type === 'daily' || type === 'manual') {
    try {
      const xlsxName = fileName.replace('.json', '.xlsx');
      createExcelBackupFromData(live, path.resolve(BACKUP_DIR, xlsxName));
    } catch (err) {
      console.error('Failed to create matching Excel backup:', err);
    }
  }

  // Cleanup old backups to prevent infinite disk growth
  cleanupOldBackups();

  return {
    success: true,
    fileName,
    backupId,
    type,
    title,
    createdDate: dateTimeStr,
    summary: live.summary,
    size: fs.statSync(targetPath).size
  };
}

/**
 * Create Excel file backup
 */
function createExcelBackupFromData(live, outPath) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: tasks
  const tasksData = (live.tasks || []).map((t, idx) => ({
    '연번': idx + 1,
    '소속부서': t.department || '남양주체육문화센터',
    '예산과목': t.budget || '수선유지비',
    '관리시설': t.facility || '',
    '상세위치': t.location || '',
    '공사명': t.title || '',
    '예상비용(원)': t.estimatedCost ? Number(t.estimatedCost) : (t.estimatedCostNote || ''),
    '진행상태': t.status || '접수/대기',
    '견적가(원)': t.quoteAmount ? Number(t.quoteAmount) : '',
    '계약금액(원)': t.contractAmount ? Number(t.contractAmount) : '',
    '시공업체명': t.vendor || '',
    '업체연락처': t.contact || '',
    '담당자': t.manager || '',
    '비고': t.memo || ''
  }));
  const wsTasks = XLSX.utils.json_to_sheet(tasksData);
  XLSX.utils.book_append_sheet(workbook, wsTasks, '공사관리대장');

  // Sheet 2: facilities
  const facList = [];
  if (Array.isArray(live.facilities)) {
    facList.push(...live.facilities);
  } else if (typeof live.facilities === 'object') {
    Object.entries(live.facilities).forEach(([dept, list]) => {
      if (Array.isArray(list)) {
        list.forEach(f => facList.push({ ...f, department: f.department || dept }));
      }
    });
  }

  const facData = facList.map((f, idx) => ({
    '연번': idx + 1,
    '소속부서': f.department || '',
    '시설약칭': f.name || '',
    '정식명칭': f.fullName || '',
    '시설분류': f.category || '',
    '소재지': f.location || '',
    '규모/층수': f.scale || '',
    '준공일자': f.completionDate || '',
    '관리책임자': f.manager || '',
    '대표연락처': f.contact || '',
    '주요설비': f.majorFacilities || '',
    '세부구역': Array.isArray(f.zones) ? f.zones.join(', ') : '',
    '개요': f.description || ''
  }));
  const wsFac = XLSX.utils.json_to_sheet(facData);
  XLSX.utils.book_append_sheet(workbook, wsFac, '부서별시설현황');

  XLSX.writeFile(workbook, outPath);
}

/**
 * Cleanup old backups (keep last 30 daily, 20 manual, 10 checkpoints)
 */
function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const groups = { daily: [], manual: [], checkpoint: [] };

    files.forEach(file => {
      if (!file.endsWith('.json')) return;
      const filePath = path.resolve(BACKUP_DIR, file);
      const stat = fs.statSync(filePath);
      const item = { file, filePath, mtime: stat.mtimeMs };

      if (file.startsWith('backup_daily_')) groups.daily.push(item);
      else if (file.startsWith('backup_manual_')) groups.manual.push(item);
      else if (file.startsWith('checkpoint_pre_restore_')) groups.checkpoint.push(item);
    });

    const removeExcess = (list, limit) => {
      list.sort((a, b) => b.mtime - a.mtime); // Newest first
      if (list.length > limit) {
        list.slice(limit).forEach(item => {
          try {
            fs.unlinkSync(item.filePath);
            const xlsxFile = item.filePath.replace('.json', '.xlsx');
            if (fs.existsSync(xlsxFile)) fs.unlinkSync(xlsxFile);
          } catch (e) {}
        });
      }
    };

    removeExcess(groups.daily, 30);
    removeExcess(groups.manual, 20);
    removeExcess(groups.checkpoint, 10);
  } catch (err) {
    console.error('Error in cleanupOldBackups:', err);
  }
}

/**
 * List all available backups
 */
export function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];

  const files = fs.readdirSync(BACKUP_DIR);
  const backups = [];

  files.forEach(file => {
    if (!file.endsWith('.json')) return;
    const filePath = path.resolve(BACKUP_DIR, file);
    try {
      const stat = fs.statSync(filePath);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);

      backups.push({
        fileName: file,
        backupId: parsed.backupId || file,
        type: parsed.type || (file.startsWith('backup_daily') ? 'daily' : file.startsWith('checkpoint') ? 'checkpoint' : 'manual'),
        title: parsed.title || file,
        note: parsed.note || '',
        createdAt: parsed.createdAt || new Date(stat.mtimeMs).toISOString(),
        createdDate: parsed.createdDate || file,
        summary: parsed.summary || { tasksCount: (parsed.data?.tasks || []).length },
        size: stat.size,
        hasExcel: fs.existsSync(path.resolve(BACKUP_DIR, file.replace('.json', '.xlsx')))
      });
    } catch (err) {
      console.warn(`Failed to parse backup ${file}:`, err.message);
    }
  });

  // Sort descending by date
  backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return backups;
}

/**
 * Restore data from a backup snapshot
 * Creates a safety checkpoint first before modifying any files!
 */
export function restoreBackup(backupSource) {
  let payload = null;

  if (typeof backupSource === 'string') {
    // Treat as filename
    const filePath = path.resolve(BACKUP_DIR, backupSource);
    if (!fs.existsSync(filePath)) {
      throw new Error(`백업 파일을 찾을 수 없습니다: ${backupSource}`);
    }
    payload = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } else if (typeof backupSource === 'object') {
    payload = backupSource;
  }

  if (!payload || !payload.data) {
    throw new Error('올바른 백업 파일 형식이 아닙니다 (data 필드 부재).');
  }

  const { tasks, facilities, budgets, budgetCategories, customDatabases } = payload.data;

  // 1. CREATE PRE-RESTORE SAFETY CHECKPOINT FIRST!
  const checkpoint = createSnapshot({
    type: 'checkpoint',
    note: `복구 실행 전 안전 자동 보관 (복구 대상: ${payload.title || payload.backupId})`
  });

  // 2. ATOMIC RESTORE OF FILES
  if (Array.isArray(tasks)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  }

  if (facilities && typeof facilities === 'object') {
    fs.writeFileSync(FACILITIES_FILE, JSON.stringify(facilities, null, 2), 'utf-8');
  }

  if (budgets && typeof budgets === 'object') {
    fs.writeFileSync(BUDGETS_FILE, JSON.stringify(budgets, null, 2), 'utf-8');
  }

  if (Array.isArray(budgetCategories)) {
    fs.writeFileSync(BUDGET_CATEGORIES_FILE, JSON.stringify(budgetCategories, null, 2), 'utf-8');
  }

  if (Array.isArray(customDatabases)) {
    fs.writeFileSync(CUSTOM_DB_FILE, JSON.stringify(customDatabases, null, 2), 'utf-8');
  }

  // 3. REGENERATE MASTER EXCEL
  try {
    const genScript = path.resolve(__dirname, 'scripts/generate_master_excel.js');
    if (fs.existsSync(genScript)) {
      import(`file://${genScript}?t=${Date.now()}`).catch(() => {});
    }
  } catch (e) {}

  return {
    success: true,
    restoredFrom: payload.title || payload.backupId,
    restoredAt: new Date().toISOString(),
    checkpointCreated: checkpoint.fileName,
    summary: {
      tasksCount: Array.isArray(tasks) ? tasks.length : 0,
      facilitiesCount: facilities ? Object.values(facilities).flat().length : 0,
      budgetsCount: budgets ? Object.keys(budgets).length : 0
    }
  };
}

/**
 * Auto daily backup runner: runs once at startup if needed, then every 1 hour
 */
export function startAutoBackupSchedule() {
  const checkAndRun = () => {
    try {
      const { dateOnly } = getFormattedDate();
      const todayFile = `backup_daily_${dateOnly}.json`;
      const todayPath = path.resolve(BACKUP_DIR, todayFile);

      if (!fs.existsSync(todayPath)) {
        console.log(`[AutoBackup] 오늘(${dateOnly})의 일일 정기 백업을 생성합니다...`);
        const result = createSnapshot({ type: 'daily', note: '일일 정기 자동 백업' });
        console.log(`[AutoBackup] 완료: ${result.fileName} (공사 ${result.summary.tasksCount}건, 시설 ${result.summary.facilitiesCount}개소)`);
      }
    } catch (err) {
      console.error('[AutoBackup] 자동 백업 실행 중 오류:', err);
    }
  };

  // Run on startup
  checkAndRun();

  // Run every 1 hour (3600000 ms)
  setInterval(checkAndRun, 60 * 60 * 1000);
}
