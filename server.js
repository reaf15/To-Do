import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { 
  createSnapshot, 
  listBackups, 
  restoreBackup, 
  startAutoBackupSchedule 
} from './backupManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5173;
const DIST_DIR = path.resolve(__dirname, 'dist');
const DATA_FILE = path.resolve(__dirname, 'data/tasks.json');
const DB_FILE = path.resolve(__dirname, 'data/custom_databases.json');
const BUDGET_FILE = path.resolve(__dirname, 'data/budgets.json');
const BUDGET_CATEGORIES_FILE = path.resolve(__dirname, 'data/budget_categories.json');
const FACILITIES_FILE = path.resolve(__dirname, 'data/facilities.json');

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
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      ip: ips[0] || 'localhost',
      allIps: ips,
      port: PORT
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
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, updatedAt: Date.now() }));
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
  console.log('  남양주체육문화센터 시설·공사 업무 공유 서버 실행 중');
  console.log('================================================================');
  console.log(`  ▶ 내 컴퓨터 접속:    http://localhost:${PORT}`);
  ips.forEach(ip => {
    console.log(`  ▶ 다른 직원 접속:    http://${ip}:${PORT}`);
  });
  console.log('================================================================');

  // Start automated daily backup schedule
  startAutoBackupSchedule();
});
