import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { 
  createSnapshot, 
  listBackups, 
  restoreBackup, 
  startAutoBackupSchedule 
} from './backupManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5173;
const DIST_DIR = path.resolve(__dirname, 'dist');
const DATA_FILE = path.resolve(__dirname, 'data/tasks.json');
const DB_FILE = path.resolve(__dirname, 'data/custom_databases.json');
const BUDGET_FILE = path.resolve(__dirname, 'data/budgets.json');
const BUDGET_CATEGORIES_FILE = path.resolve(__dirname, 'data/budget_categories.json');
const FACILITIES_FILE = path.resolve(__dirname, 'data/facilities.json');
const DEPT_MANAGERS_FILE = path.resolve(__dirname, 'data/department_managers.json');
const VERSION_HISTORY_FILE = path.resolve(__dirname, 'data/version_history.json');
const LOGIN_HISTORY_FILE = path.resolve(__dirname, 'data/login_history.json');

// Helper: Extract clean IPv4/IPv6 client IP
function getClientIp(req) {
  let ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  if (ip === '::1') {
    ip = '127.0.0.1';
  }
  return ip || '127.0.0.1';
}

// ============================================================================
// Cloud (GitHub ➔ Render) Auto-Sync Engine
// 내 PC에서 데이터 변경 후 15초 동안 추가 입력이 없으면 백그라운드 자동 Git Push
// ============================================================================
let autoSyncTimer = null;
let isSyncing = false;
let lastCloudSyncTime = null;

export function triggerAutoCloudSync(delayMs = 15000) {
  // Render 환경이거나 git 저장소가 없는 경우 건너뜀
  if (process.env.RENDER || !fs.existsSync(path.resolve(__dirname, '.git'))) {
    return;
  }

  if (autoSyncTimer) {
    clearTimeout(autoSyncTimer);
  }

  autoSyncTimer = setTimeout(() => {
    if (isSyncing) return;
    isSyncing = true;
    console.log('[Cloud Auto-Sync] 데이터 변경 감지 ➔ 클라우드(GitHub ➔ Render) 자동 동기화 시작...');
    
    const now = new Date();
    const timeStr = now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const cmd = `git add data/ && git commit -m "auto: 실시간 데이터 자동 동기화 (${timeStr})" && git push origin main`;
    
    exec(cmd, { cwd: __dirname }, (error, stdout, stderr) => {
      isSyncing = false;
      if (error) {
        if ((stderr && stderr.includes('nothing to commit')) || (stdout && stdout.includes('nothing to commit'))) {
          console.log('[Cloud Auto-Sync] 변경 사항 없음 (최신 상태 유지 중)');
        } else {
          console.warn('[Cloud Auto-Sync] 알림:', stderr || error.message);
        }
      } else {
        lastCloudSyncTime = timeStr;
        console.log(`[Cloud Auto-Sync] ✅ 클라우드(GitHub ➔ Render) 자동 동기화 완료! (${timeStr})`);
      }
    });
  }, delayMs);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.csv': 'text/csv; charset=utf-8',
};

// Get Server LAN IPs
function getLocalIps() {
  const networkInterfaces = os.networkInterfaces();
  const ips = [];
  for (const iface of Object.values(networkInterfaces)) {
    for (const config of iface || []) {
      if (config.family === 'IPv4' && !config.internal && !config.address.startsWith('169.254')) {
        ips.push(config.address);
      }
    }
  }
  return ips;
}


// Check if client is connecting from the host machine (내 컴퓨터)
function isLocalClient(req) {
  const remote = req.socket?.remoteAddress || '';
  if (remote === '127.0.0.1' || remote === '::1' || remote.includes('127.0.0.1')) {
    return true;
  }
  const localIps = getLocalIps();
  for (const ip of localIps) {
    if (remote === ip || remote === `::ffff:${ip}` || remote.endsWith(ip)) {
      return true;
    }
  }
  return false;
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. API: Server Info
  if (req.url === '/api/server-info' && req.method === 'GET') {
    const ips = getLocalIps();
    const isHost = isLocalClient(req);
    const isRender = Boolean(process.env.RENDER || req.headers.host?.includes('onrender.com'));
    const clientIp = getClientIp(req);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      ip: ips[0] || 'localhost',
      allIps: ips,
      port: PORT,
      isHost,
      isRender,
      lastSyncTime: lastCloudSyncTime,
      renderUrl: 'https://to-do-hxmd.onrender.com/',
      localHostUrl: `http://${ips[0] || '192.168.101.96'}:${PORT}`,
      clientIp: clientIp
    }));
    return;
  }

  // 1-1. Guard: Render 클라우드는 원격 열람 전용(Read-Only)으로 작동 (쓰기 요청 차단, 단 접속 이력 저장은 허용)
  const isRenderRequest = Boolean(process.env.RENDER || req.headers.host?.includes('onrender.com'));
  if (isRenderRequest && req.method === 'POST' && req.url !== '/api/login-history') {
    res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ 
      error: 'Render 클라우드는 안전한 열람 전용(Read-Only) 모드입니다. 데이터 추가/수정은 사내 메인 PC에서만 가능합니다.',
      readOnly: true 
    }));
    return;
  }

  // 2. API: GET tasks
  if (req.url === '/api/tasks' && req.method === 'GET') {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(data);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify([]));
    }
    return;
  }

  // 3. API: POST tasks (Save data)
  if (req.url === '/api/tasks' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        triggerAutoCloudSync(15000);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, count: parsed.length, updatedAt: Date.now() }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 4. API: GET custom databases
  if (req.url === '/api/databases' && req.method === 'GET') {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(data);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify([]));
    }
    return;
  }

  // 5. API: POST custom databases (Save custom databases & rows)
  if (req.url === '/api/databases' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        triggerAutoCloudSync(15000);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, count: parsed.length, updatedAt: Date.now() }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 5-1. API: GET budget categories
  if (req.url === '/api/budget-categories' && req.method === 'GET') {
    if (fs.existsSync(BUDGET_CATEGORIES_FILE)) {
      const data = fs.readFileSync(BUDGET_CATEGORIES_FILE, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(data);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(['수선유지비', '시설비', '운영경비']));
    }
    return;
  }

  // 5-2. API: POST budget categories
  if (req.url === '/api/budget-categories' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        fs.writeFileSync(BUDGET_CATEGORIES_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        triggerAutoCloudSync(15000);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, count: parsed.length, updatedAt: Date.now() }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 6. API: GET budgets
  if (req.url === '/api/budgets' && req.method === 'GET') {
    if (fs.existsSync(BUDGET_FILE)) {
      const data = fs.readFileSync(BUDGET_FILE, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(data);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        '수선유지비': 200000000,
        '시설비': 50000000,
        '사무관리비': 10000000
      }));
    }
    return;
  }

  // 7. API: POST budgets (Save budget allocations)
  if (req.url === '/api/budgets' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        fs.writeFileSync(BUDGET_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        triggerAutoCloudSync(15000);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, updatedAt: Date.now() }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 7-1. API: GET facilities
  if (req.url === '/api/facilities' && req.method === 'GET') {
    if (fs.existsSync(FACILITIES_FILE)) {
      const data = fs.readFileSync(FACILITIES_FILE, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(data);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({}));
    }
    return;
  }

  // 7-2. API: POST facilities (Save department facilities)
  if (req.url === '/api/facilities' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        fs.writeFileSync(FACILITIES_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        triggerAutoCloudSync(15000);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, updatedAt: Date.now() }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 7-2b. API: GET /api/department-managers
  if (req.url === '/api/department-managers' && req.method === 'GET') {
    if (fs.existsSync(DEPT_MANAGERS_FILE)) {
      const data = fs.readFileSync(DEPT_MANAGERS_FILE, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(data);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({}));
    }
    return;
  }

  // 7-2c. API: POST /api/department-managers
  if (req.url === '/api/department-managers' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        fs.writeFileSync(DEPT_MANAGERS_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        triggerAutoCloudSync(15000);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, updatedAt: Date.now() }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 7-2d. API: GET /api/version-history
  if (req.url === '/api/version-history' && req.method === 'GET') {
    if (fs.existsSync(VERSION_HISTORY_FILE)) {
      const data = fs.readFileSync(VERSION_HISTORY_FILE, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(data);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify([]));
    }
    return;
  }

  // 7-2e. API: POST /api/version-history
  if (req.url === '/api/version-history' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        fs.writeFileSync(VERSION_HISTORY_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        triggerAutoCloudSync(15000);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, count: parsed.length, updatedAt: Date.now() }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 7-2. API: GET /api/login-history (통합 접속 및 감사 이력 조회)
  if (req.url === '/api/login-history' && req.method === 'GET') {
    if (fs.existsSync(LOGIN_HISTORY_FILE)) {
      try {
        const data = fs.readFileSync(LOGIN_HISTORY_FILE, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(data);
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify([]));
      }
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify([]));
    }
    return;
  }

  // 7-2-B. API: POST /api/login-history (다른 PC/관리자 실시간 접속 및 작업 로그 중앙 기록)
  if (req.url === '/api/login-history' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const clientIp = getClientIp(req);

        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        // Parse user-agent if device string not provided
        const userAgent = req.headers['user-agent'] || '';
        let device = payload.device;
        if (!device && userAgent) {
          const isMobile = /Android|iPhone|iPad/i.test(userAgent);
          const isEdge = /Edg\//i.test(userAgent);
          const isChrome = /Chrome\//i.test(userAgent) && !isEdge;
          const isWhale = /Whale\//i.test(userAgent);
          const browserName = isWhale ? 'Whale' : isEdge ? 'Edge' : isChrome ? 'Chrome' : isMobile ? 'Mobile Safari' : 'Browser';
          const osName = /Windows NT 10/i.test(userAgent) ? 'Windows 10/11' : /Macintosh/i.test(userAgent) ? 'macOS' : isMobile ? 'Mobile OS' : 'PC';
          device = `${browserName} / ${osName}`;
        }

        const newEntry = {
          id: payload.id || `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: payload.timestamp || timeStr,
          userId: payload.userId || 'guest',
          userName: payload.userName || '접속자',
          role: payload.role || '직원',
          dept: payload.dept || '체육문화센터 시설팀',
          ip: clientIp,
          device: device || 'Chrome / Windows',
          action: payload.action || '시스템 접속',
          status: payload.status || '성공'
        };

        let logs = [];
        if (fs.existsSync(LOGIN_HISTORY_FILE)) {
          try {
            logs = JSON.parse(fs.readFileSync(LOGIN_HISTORY_FILE, 'utf-8'));
          } catch {
            logs = [];
          }
        }
        if (!Array.isArray(logs)) logs = [];

        // Prepend new entry
        logs.unshift(newEntry);
        if (logs.length > 500) {
          logs = logs.slice(0, 500);
        }

        fs.writeFileSync(LOGIN_HISTORY_FILE, JSON.stringify(logs, null, 2), 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, entry: newEntry, count: logs.length }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 7-3. API: Dedicated Master Excel File Download
  if (req.url.startsWith('/api/download-excel') || req.url.startsWith('/api/download/master-excel') || req.url.startsWith('/master_data.xlsx')) {
    const candidates = [
      path.resolve(__dirname, '남양주도시공사_시설본부_전체통합데이터.xlsx'),
      path.resolve(DIST_DIR, '남양주도시공사_시설본부_전체통합데이터.xlsx'),
      path.resolve(__dirname, 'master_data.xlsx')
    ];
    const targetFile = candidates.find(f => fs.existsSync(f));
    if (targetFile) {
      const stat = fs.statSync(targetFile);
      const encodedFilename = encodeURIComponent('남양주도시공사_시설본부_전체통합데이터.xlsx');
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Length': stat.size,
        'Content-Disposition': `attachment; filename="namyangju_fms_all_data.xlsx"; filename*=UTF-8''${encodedFilename}`
      });
      fs.createReadStream(targetFile).pipe(res);
      return;
    }
  }

  // 7-4. API: GET /api/backups (List all backups)
  if (req.url === '/api/backups' && req.method === 'GET') {
    try {
      const list = listBackups();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(list));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 7-5. API: POST /api/backups/create (Create new snapshot)
  if (req.url === '/api/backups/create' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const result = createSnapshot({
          type: parsed.type || 'manual',
          note: parsed.note || '사용자 수동 백업'
        });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 7-6. API: POST /api/backups/restore (Restore from backup)
  if (req.url === '/api/backups/restore' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const source = parsed.fileName || parsed.backupData;
        if (!source) {
          throw new Error('복구할 대상 백업 파일명(fileName) 또는 데이터가 없습니다.');
        }
        const result = restoreBackup(source);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 7-7. API: GET /api/backups/download?file=... (Download backup file)
  if (req.url.startsWith('/api/backups/download') && req.method === 'GET') {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const file = urlObj.searchParams.get('file');
    if (!file || file.includes('..') || file.includes('/') || file.includes('\\')) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('잘못된 백업 파일 요청입니다.');
      return;
    }
    const target = path.resolve(__dirname, 'data/backups', file);
    if (fs.existsSync(target)) {
      const stat = fs.statSync(target);
      const ext = path.extname(target).toLowerCase();
      const contentType = ext === '.xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/json; charset=utf-8';
      const enc = encodeURIComponent(file);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stat.size,
        'Content-Disposition': `attachment; filename="${enc}"; filename*=UTF-8''${enc}`
      });
      fs.createReadStream(target).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('백업 파일을 찾을 수 없습니다.');
      return;
    }
  }

  // 8. Static File Serving (dist)
  let rawPath = req.url.split('?')[0];
  let reqPath = rawPath;
  try {
    reqPath = decodeURIComponent(rawPath);
  } catch (e) {
    reqPath = rawPath;
  }
  if (reqPath === '/') reqPath = '/index.html';

  let filePath = path.join(DIST_DIR, reqPath);

  // If path doesn't exist in DIST_DIR, check in root if it's an excel or data file
  if (!fs.existsSync(filePath) && (reqPath.endsWith('.xlsx') || reqPath.endsWith('.xls'))) {
    const rootCandidate = path.join(__dirname, reqPath);
    if (fs.existsSync(rootCandidate)) {
      filePath = rootCandidate;
    }
  }

  // If path doesn't exist or is a directory, handle SPA routing or 404
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const ext = path.extname(reqPath).toLowerCase();
    // Do NOT fallback to index.html if a specific file format was requested!
    if (ext && ext !== '.html') {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found - 요청한 파일을 찾을 수 없습니다.');
      return;
    }
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Headers
    const headers = { 'Content-Type': contentType };
    if (ext === '.html') {
      headers['Cache-Control'] = 'no-cache';
    } else {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    }

    if (ext === '.xlsx' || ext === '.xls') {
      const baseName = path.basename(filePath);
      const encName = encodeURIComponent(baseName);
      headers['Content-Disposition'] = `attachment; filename="export.xlsx"; filename*=UTF-8''${encName}`;
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found - 빌드가 필요합니다: npm run build');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIps();
  console.log('================================================================');
  console.log('  남양주도시공사 시설물종합관리시스템 서버 실행 중');
  console.log('================================================================');
  console.log(`  ▶ 내 컴퓨터 접속:    http://localhost:${PORT}`);
  ips.forEach(ip => {
    console.log(`  ▶ 다른 직원 접속:    http://${ip}:${PORT}`);
  });
  console.log('================================================================');

  // Start automated daily backup schedule
  startAutoBackupSchedule();
});
