import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const ROOT_DIR = process.cwd();

// Load JSON data
const tasksPath = path.join(ROOT_DIR, 'data/tasks.json');
const facilitiesPath = path.join(ROOT_DIR, 'data/facilities.json');
const budgetsPath = path.join(ROOT_DIR, 'data/budgets.json');

const tasks = fs.existsSync(tasksPath) ? JSON.parse(fs.readFileSync(tasksPath, 'utf8')) : [];
const facilitiesMap = fs.existsSync(facilitiesPath) ? JSON.parse(fs.readFileSync(facilitiesPath, 'utf8')) : {};
const budgetsMap = fs.existsSync(budgetsPath) ? JSON.parse(fs.readFileSync(budgetsPath, 'utf8')) : {};

// Flatten facilities
const allFacilities = [];
Object.entries(facilitiesMap).forEach(([dept, facList]) => {
  if (Array.isArray(facList)) {
    facList.forEach(fac => {
      allFacilities.push({ ...fac, department: fac.department || dept });
    });
  }
});

// Organization divisions & departments
const DIVISIONS = [
  {
    division: '체육문화운영처',
    departments: ['남양주체육문화센터', '호평체육문화센터', '오남체육문화센터', '화도체육문화센터', '별내커뮤니티센터', '와부체육문화센터', '평내체육문화센터', '진접체육문화센터']
  },
  {
    division: '교통환경처',
    departments: ['철도안전부', '철도운영부', '철도지원부', '주차운영부', '주차시설부', '에코랜드운영부', '화도푸른물센터']
  },
  {
    division: '미래청소년처',
    departments: ['남양주시청소년수련관', '정약용 펀그라운드', '펀그라운드 진접', '펀그라운드 수동', '어린이비전센터']
  }
];

const workbook = XLSX.utils.book_new();

// ==========================================
// 1. Sheet 1: 공사 관리대장 (전 부서)
// ==========================================
const tasksSheetData = tasks.map((t, idx) => ({
  '연번': idx + 1,
  '소속부서': t.department || '남양주체육문화센터',
  '예산과목': t.budget || '수선유지비',
  '관리시설(센터)': t.facility || '',
  '상세위치': t.location || '',
  '공사(용역)명': t.title || '',
  '예상비용(원)': t.estimatedCost ? Number(t.estimatedCost) : (t.estimatedCostNote || ''),
  '진행상태': t.status || '접수/대기',
  '견적가(원)': t.quoteAmount ? Number(t.quoteAmount) : '',
  '계약금액(원)': t.contractAmount ? Number(t.contractAmount) : '',
  '시공업체명': t.vendor || '',
  '업체연락처': t.contact || '',
  '담당자': t.manager || '',
  '비고/특이사항': t.memo || '',
  '등록일자': t.createdAt ? t.createdAt.split('T')[0] : '2026-10-15',
  '작업로그수': Array.isArray(t.logs) ? t.logs.length : 0
}));

const totalEstimated = tasks.reduce((sum, t) => sum + (Number(t.estimatedCost) || 0), 0);
const totalQuote = tasks.reduce((sum, t) => sum + (Number(t.quoteAmount) || 0), 0);
const totalContract = tasks.reduce((sum, t) => sum + (Number(t.contractAmount) || 0), 0);

tasksSheetData.push({
  '연번': '합계',
  '소속부서': `총 ${tasks.length}건`,
  '예산과목': '',
  '관리시설(센터)': '',
  '상세위치': '',
  '공사(용역)명': `전체 집행예정: ₩${totalEstimated.toLocaleString('ko-KR')}`,
  '예상비용(원)': totalEstimated,
  '진행상태': '',
  '견적가(원)': totalQuote,
  '계약금액(원)': totalContract,
  '시공업체명': '',
  '업체연락처': '',
  '담당자': '',
  '비고/특이사항': `계약체결액: ₩${totalContract.toLocaleString('ko-KR')}`,
  '등록일자': '',
  '작업로그수': ''
});

const wsTasks = XLSX.utils.json_to_sheet(tasksSheetData);
wsTasks['!cols'] = [
  { wch: 8 },  // 연번
  { wch: 20 }, // 소속부서
  { wch: 18 }, // 예산과목
  { wch: 18 }, // 관리시설
  { wch: 20 }, // 상세위치
  { wch: 42 }, // 공사명
  { wch: 16 }, // 예상비용
  { wch: 12 }, // 진행상태
  { wch: 16 }, // 견적가
  { wch: 16 }, // 계약금액
  { wch: 20 }, // 시공업체
  { wch: 16 }, // 업체연락처
  { wch: 12 }, // 담당자
  { wch: 30 }, // 비고
  { wch: 14 }, // 등록일자
  { wch: 10 }  // 로그수
];
XLSX.utils.book_append_sheet(workbook, wsTasks, '공사관리대장');

// ==========================================
// 2. Sheet 2: 부서별 시설 현황 및 제원
// ==========================================
const facSheetData = allFacilities.map((f, idx) => ({
  '연번': idx + 1,
  '소속부서': f.department || '',
  '시설약칭': f.name || '',
  '정식명칭': f.fullName || '',
  '시설분류': f.category || '',
  '소재지/주소': f.location || '',
  '규모/층수': f.scale || '',
  '준공/개관일': f.completionDate || '',
  '관리책임자': f.manager ? `${f.manager} (담당)` : '담당자 지정',
  '대표연락처': f.contact || '',
  '주요구성설비': f.majorFacilities || '',
  '세부관리구역': Array.isArray(f.zones) ? f.zones.join(', ') : '',
  '관련공사건수': tasks.filter(t => t.facility === f.name).length,
  '시설개요': f.description || ''
}));

const wsFacilities = XLSX.utils.json_to_sheet(facSheetData);
wsFacilities['!cols'] = [
  { wch: 8 },  // 연번
  { wch: 20 }, // 소속부서
  { wch: 16 }, // 시설약칭
  { wch: 28 }, // 정식명칭
  { wch: 16 }, // 시설분류
  { wch: 38 }, // 소재지
  { wch: 32 }, // 규모/층수
  { wch: 16 }, // 준공일
  { wch: 14 }, // 책임자
  { wch: 16 }, // 연락처
  { wch: 45 }, // 주요설비
  { wch: 35 }, // 세부구역
  { wch: 12 }, // 공사건수
  { wch: 50 }  // 개요
];
XLSX.utils.book_append_sheet(workbook, wsFacilities, '부서별시설현황');

// ==========================================
// 3. Sheet 3: 부서별 예산 및 집행 현황
// ==========================================
const budgetSheetData = [];
let totalBudgetSum = 0;
let totalExecutedSum = 0;

Object.entries(budgetsMap).forEach(([dept, catObj]) => {
  if (catObj && typeof catObj === 'object') {
    Object.entries(catObj).forEach(([cat, amount]) => {
      const budgetNum = Number(amount) || 0;
      // Calculate estimated cost for tasks in this dept & budget category
      const deptTasks = tasks.filter(t => (t.department || '남양주체육문화센터') === dept && (t.budget || '수선유지비') === cat);
      const executed = deptTasks.reduce((s, t) => s + (Number(t.estimatedCost) || 0), 0);
      const remain = budgetNum - executed;
      const rate = budgetNum > 0 ? ((executed / budgetNum) * 100).toFixed(1) : '0.0';

      totalBudgetSum += budgetNum;
      totalExecutedSum += executed;

      budgetSheetData.push({
        '소속부서': dept,
        '예산과목': cat,
        '배정예산액(원)': budgetNum,
        '집행예정액(원)': executed,
        '잔여예산액(원)': remain,
        '집행률(%)': `${rate}%`,
        '관련공사건수': `${deptTasks.length}건`,
        '비고': remain < 0 ? '⚠️ 예산초과' : '정상 집행 중'
      });
    });
  }
});

const totalRemainSum = totalBudgetSum - totalExecutedSum;
const totalRate = totalBudgetSum > 0 ? ((totalExecutedSum / totalBudgetSum) * 100).toFixed(1) : '0.0';

budgetSheetData.push({
  '소속부서': '합계',
  '예산과목': '전체 예산 총계',
  '배정예산액(원)': totalBudgetSum,
  '집행예정액(원)': totalExecutedSum,
  '잔여예산액(원)': totalRemainSum,
  '집행률(%)': `${totalRate}%`,
  '관련공사건수': `${tasks.length}건`,
  '비고': totalRemainSum < 0 ? '전체 초과' : '총괄 잔액'
});

const wsBudgets = XLSX.utils.json_to_sheet(budgetSheetData);
wsBudgets['!cols'] = [
  { wch: 22 }, // 부서
  { wch: 20 }, // 예산과목
  { wch: 18 }, // 배정예산
  { wch: 18 }, // 집행예정
  { wch: 18 }, // 잔여예산
  { wch: 12 }, // 집행률
  { wch: 14 }, // 건수
  { wch: 14 }  // 비고
];
XLSX.utils.book_append_sheet(workbook, wsBudgets, '부서별예산현황');

// ==========================================
// 4. Sheet 4: 조직도 및 제출 현황
// ==========================================
const orgSheetData = [];
DIVISIONS.forEach(div => {
  div.departments.forEach(dept => {
    const facCount = (facilitiesMap[dept] || []).length;
    const deptTaskCount = tasks.filter(t => (t.department || '남양주체육문화센터') === dept).length;
    const deptBudget = budgetsMap[dept] ? Object.values(budgetsMap[dept]).reduce((s, v) => s + (Number(v) || 0), 0) : 100000000;
    
    orgSheetData.push({
      '총괄본부': '남양주도시공사 시설본부',
      '소속처': div.division,
      '부서명': dept,
      '관리시설수': `${facCount}개소`,
      '등록공사수': `${deptTaskCount}건`,
      '배정예산합계(원)': deptBudget,
      '예산제출상태': dept === '남양주체육문화센터' ? '제출완료' : '작성중'
    });
  });
});

const wsOrg = XLSX.utils.json_to_sheet(orgSheetData);
wsOrg['!cols'] = [
  { wch: 24 }, // 총괄본부
  { wch: 18 }, // 소속처
  { wch: 22 }, // 부서명
  { wch: 14 }, // 관리시설수
  { wch: 14 }, // 등록공사수
  { wch: 20 }, // 배정예산
  { wch: 16 }  // 제출상태
];
XLSX.utils.book_append_sheet(workbook, wsOrg, '조직도및부서현황');

// ==========================================
// 5. Sheet 5: 시스템 접속 및 감사 이력
// ==========================================
const historyPath = path.join(ROOT_DIR, 'src/data/initialLoginHistory.js');
let loginHistory = [];
if (fs.existsSync(historyPath)) {
  const content = fs.readFileSync(historyPath, 'utf8');
  const match = content.match(/export const INITIAL_LOGIN_HISTORY = (\[[\s\S]*?\]);/);
  if (match) {
    try {
      // eval in safe context
      const fn = new Function(`return ${match[1]};`);
      loginHistory = fn();
    } catch (e) {}
  }
}

if (loginHistory.length > 0) {
  const historySheetData = loginHistory.map((item, idx) => ({
    '연번': idx + 1,
    '이력ID': item.id || '',
    '접속일시': item.timestamp || '',
    '계정ID': item.userId || '',
    '작업자명': item.userName || '',
    '직책/역할': item.role || '',
    '소속부서': item.dept || '',
    '접속IP': item.ip || '',
    '기기/브라우저': item.device || '',
    '수행작업내용': item.action || '',
    '처리결과': item.status || '성공'
  }));

  const wsHistory = XLSX.utils.json_to_sheet(historySheetData);
  wsHistory['!cols'] = [
    { wch: 8 },  // 연번
    { wch: 18 }, // 이력ID
    { wch: 20 }, // 일시
    { wch: 14 }, // 계정
    { wch: 12 }, // 성명
    { wch: 18 }, // 직책
    { wch: 22 }, // 부서
    { wch: 16 }, // IP
    { wch: 28 }, // 기기
    { wch: 42 }, // 작업내용
    { wch: 12 }  // 상태
  ];
  XLSX.utils.book_append_sheet(workbook, wsHistory, '접속및작업감사이력');
}

// Write to files
const outFileName = '남양주도시공사_시설본부_전체통합데이터_2026-10-20.xlsx';
const genericFileName = '남양주도시공사_시설본부_전체통합데이터.xlsx';

const pathsToWrite = [
  path.join(ROOT_DIR, outFileName),
  path.join(ROOT_DIR, genericFileName),
  path.join(ROOT_DIR, 'public', outFileName),
  path.join(ROOT_DIR, 'public', genericFileName),
  path.join(ROOT_DIR, 'dist', outFileName),
  path.join(ROOT_DIR, 'dist', genericFileName)
];

pathsToWrite.forEach(targetPath => {
  const dir = path.dirname(targetPath);
  if (fs.existsSync(dir)) {
    XLSX.writeFile(workbook, targetPath);
    console.log(`Saved: ${targetPath}`);
  }
});

console.log('Master Excel generation finished successfully!');
