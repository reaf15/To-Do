// notionSync.js - 시설물종합관리시스템 ➔ 노션(Notion) 동기화 모듈
import fs from 'fs';
import path from 'path';

// 노션 데이터베이스 ID: "남양주도시공사 시설관리"
export const NOTION_DATABASE_ID = '408deafa-4bbd-81a1-9467-e7df6fdec5d1';

// 토큰 동적 로드 (하드코딩 방지: 환경변수 또는 mcp_config.json에서 안전하게 조회)
export function getNotionToken() {
  if (process.env.NOTION_TOKEN) return process.env.NOTION_TOKEN;
  try {
    const configPath = path.resolve(process.env.USERPROFILE || 'C:/Users/user', '.gemini/config/mcp_config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.mcpServers?.notion?.env?.NOTION_TOKEN) {
        return config.mcpServers.notion.env.NOTION_TOKEN;
      }
    }
  } catch (e) {
    console.error('[NotionSync] 토큰 읽기 실패:', e.message);
  }
  return null;
}

// 딜레이 헬퍼 (노션 API 초당 요청 제한 3회 준수)
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 특정 데이터베이스의 기존 페이지(시스템ID 기준) 목록 조회
export async function fetchExistingPages(token) {
  const existingMap = new Map(); // systemId -> pageId
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const body = { page_size: 100 };
    if (startCursor) body.start_cursor = startCursor;

    const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[NotionSync] 기존 항목 조회 실패:', err);
      break;
    }

    const data = await res.json();
    for (const page of data.results || []) {
      const sysIdText = page.properties['시스템ID']?.rich_text?.[0]?.plain_text;
      if (sysIdText) {
        existingMap.set(sysIdText, page.id);
      }
    }

    hasMore = data.has_more;
    startCursor = data.next_cursor;
    if (hasMore) await sleep(350);
  }

  return existingMap;
}

// 태스크 객체를 노션 프로퍼티 구조로 변환
export function buildNotionProperties(task) {
  const props = {
    '공사명': {
      title: [{ text: { content: (task.title || '무제 공사').substring(0, 100) } }]
    },
    '시스템ID': {
      rich_text: [{ text: { content: String(task.id || '') } }]
    }
  };

  if (task.department) {
    props['부서'] = { select: { name: task.department.replace(/,/g, ' ') } };
  }
  if (task.facility) {
    props['시설분류'] = { select: { name: task.facility.replace(/,/g, ' ') } };
  }
  if (task.location) {
    props['세부위치'] = { rich_text: [{ text: { content: task.location.substring(0, 1000) } }] };
  }
  if (task.budget) {
    props['예산과목'] = { select: { name: task.budget.replace(/,/g, ' ') } };
  }
  if (task.status) {
    props['진행상태'] = { select: { name: task.status.replace(/,/g, ' ') } };
  }
  if (task.manager) {
    props['담당자'] = { select: { name: task.manager.replace(/,/g, ' ') } };
  }
  if (task.estimatedCost && Number(task.estimatedCost) > 0) {
    props['예상비용'] = { number: Number(task.estimatedCost) };
  }
  if (task.quoteAmount && Number(task.quoteAmount) > 0) {
    props['견적가'] = { number: Number(task.quoteAmount) };
  }
  if (task.contractAmount && Number(task.contractAmount) > 0) {
    props['계약금액'] = { number: Number(task.contractAmount) };
  }
  if (task.vendor) {
    props['시공업체'] = { rich_text: [{ text: { content: task.vendor.substring(0, 100) } }] };
  }
  if (task.startDate && /^\d{4}-\d{2}-\d{2}$/.test(task.startDate)) {
    props['공사시작일'] = { date: { start: task.startDate } };
  }
  if (task.endDate && /^\d{4}-\d{2}-\d{2}$/.test(task.endDate)) {
    props['공사완료일'] = { date: { start: task.endDate } };
  }
  if (task.memo) {
    props['비고'] = { rich_text: [{ text: { content: task.memo.substring(0, 2000) } }] };
  }

  return props;
}

// 전체 태스크를 노션으로 동기화 (생성 또는 업데이트)
export async function syncTasksToNotion(tasks = []) {
  const token = getNotionToken();
  if (!token) {
    return { success: false, error: 'Notion 토큰을 찾을 수 없습니다.' };
  }

  console.log(`[NotionSync] 노션 [남양주도시공사 시설관리] 동기화 시작... (총 ${tasks.length}건)`);
  const existingMap = await fetchExistingPages(token);

  let createdCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const existingPageId = existingMap.get(String(task.id));
    const properties = buildNotionProperties(task);

    try {
      if (existingPageId) {
        // 기존 페이지 업데이트 (PATCH)
        const res = await fetch(`https://api.notion.com/v1/pages/${existingPageId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ properties })
        });
        if (res.ok) {
          updatedCount++;
        } else {
          console.error(`[NotionSync] 업데이트 실패 (${task.title}):`, await res.text());
          errorCount++;
        }
      } else {
        // 새 페이지 생성 (POST)
        const res = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            parent: { database_id: NOTION_DATABASE_ID },
            properties
          })
        });
        if (res.ok) {
          createdCount++;
        } else {
          console.error(`[NotionSync] 생성 실패 (${task.title}):`, await res.text());
          errorCount++;
        }
      }
    } catch (e) {
      console.error(`[NotionSync] 요청 오류 (${task.title}):`, e.message);
      errorCount++;
    }

    // 초당 3회 제한 준수를 위한 딜레이 (350ms)
    await sleep(350);
  }

  console.log(`[NotionSync] ✅ 완료: 생성 ${createdCount}건, 업데이트 ${updatedCount}건, 오류 ${errorCount}건`);
  const result = {
    success: true,
    createdCount,
    updatedCount,
    errorCount,
    total: tasks.length,
    databaseId: NOTION_DATABASE_ID,
    databaseUrl: `https://app.notion.com/p/${NOTION_DATABASE_ID.replace(/-/g, '')}`,
    syncedAt: new Date().toISOString()
  };
  lastSyncStatus = {
    isSyncing: false,
    lastSyncedAt: result.syncedAt,
    lastResult: result
  };
  return result;
}

let autoNotionTimer = null;
let lastSyncStatus = {
  isSyncing: false,
  lastSyncedAt: null,
  lastResult: null
};

export function getLastSyncStatus() {
  return lastSyncStatus;
}

// 데이터 변경 시 30초 후 백그라운드 노션 자동 동기화
export function triggerAutoNotionSync(delayMs = 30000) {
  if (autoNotionTimer) {
    clearTimeout(autoNotionTimer);
  }

  autoNotionTimer = setTimeout(async () => {
    if (lastSyncStatus.isSyncing) return;
    try {
      const dataFile = path.resolve('data/tasks.json');
      if (!fs.existsSync(dataFile)) return;
      const tasks = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      lastSyncStatus.isSyncing = true;
      console.log('[NotionSync] 데이터 변경 감지 ➔ 노션 자동 동기화 시작...');
      const res = await syncTasksToNotion(tasks);
      console.log('[NotionSync] ✅ 노션 자동 동기화 완료:', res.syncedAt);
    } catch (e) {
      console.error('[NotionSync] 자동 동기화 오류:', e.message);
      lastSyncStatus.isSyncing = false;
    }
  }, delayMs);
}

