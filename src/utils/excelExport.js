import * as XLSX from 'xlsx';

/**
 * 업무 목록을 Excel (.xlsx) 파일로 내보내기
 */
export function exportToExcel(tasks, fileName = '남양주체육문화센터_공사업무현황.xlsx') {
  const exportData = tasks.map((t) => ({
    '예산': t.budget || '',
    '분류': t.facility || '',
    '위치': t.location || '',
    '공사명': t.title || '',
    '예상비용': t.estimatedCost ? Number(t.estimatedCost) : (t.estimatedCostNote || ''),
    '담당자': t.manager || '',
    '진행': t.status || '',
    '견적가': t.quoteAmount ? Number(t.quoteAmount) : '',
    '계약금액': t.contractAmount ? Number(t.contractAmount) : '',
    '업체명': t.vendor || '',
    '비고/메모': t.memo || '',
  }));

  // 합계 행 추가
  const totalCost = tasks.reduce((sum, t) => sum + (Number(t.estimatedCost) || 0), 0);
  const totalQuote = tasks.reduce((sum, t) => sum + (Number(t.quoteAmount) || 0), 0);
  const totalContract = tasks.reduce((sum, t) => sum + (Number(t.contractAmount) || 0), 0);

  exportData.push({
    '예산': '',
    '분류': '',
    '위치': '',
    '공사명': '합계',
    '예상비용': totalCost,
    '담당자': '',
    '진행': '',
    '견적가': totalQuote,
    '계약금액': totalContract,
    '업체명': '',
    '비고/메모': `총 ${tasks.length}건`,
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // 컬럼 너비 설정
  worksheet['!cols'] = [
    { wch: 12 }, // 예산
    { wch: 14 }, // 분류
    { wch: 18 }, // 위치
    { wch: 36 }, // 공사명
    { wch: 16 }, // 예상비용
    { wch: 10 }, // 담당자
    { wch: 14 }, // 진행
    { wch: 16 }, // 견적가
    { wch: 16 }, // 계약금액
    { wch: 16 }, // 업체명
    { wch: 30 }, // 메모
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '공사업무현황');

  XLSX.writeFile(workbook, fileName);
}

/**
 * 시설본부 전체 데이터 통합 Excel (.xlsx) 파일로 내보내기 (멀티 시트)
 * 시트 1: 전 부서 공사 관리대장 (부서명 포함)
 * 시트 2: 부서별 시설 현황 및 개요
 * 시트 3: 부서별 예산 현황
 */
export function exportMasterDataToExcel({
  allTasks = [],
  facilities = [],
  budgets = {},
  fileName = `남양주도시공사_시설본부_전체통합데이터_${new Date().toISOString().split('T')[0]}.xlsx`
}) {
  const workbook = XLSX.utils.book_new();

  // 1. Sheet 1: 공사 관리대장
  const tasksSheetData = allTasks.map((t) => ({
    '소속부서': t.department || '남양주체육문화센터',
    '예산과목': t.budget || '수선유지비',
    '시설(센터)': t.facility || '',
    '상세위치': t.location || '',
    '공사명': t.title || '',
    '예상비용': t.estimatedCost ? Number(t.estimatedCost) : (t.estimatedCostNote || ''),
    '진행상태': t.status || '',
    '견적가': t.quoteAmount ? Number(t.quoteAmount) : '',
    '계약금액': t.contractAmount ? Number(t.contractAmount) : '',
    '시공업체': t.vendor || '',
    '업체연락처': t.contact || '',
    '담당자': t.manager || '',
    '비고/메모': t.memo || '',
  }));

  const totalCost = allTasks.reduce((sum, t) => sum + (Number(t.estimatedCost) || 0), 0);
  const totalQuote = allTasks.reduce((sum, t) => sum + (Number(t.quoteAmount) || 0), 0);
  const totalContract = allTasks.reduce((sum, t) => sum + (Number(t.contractAmount) || 0), 0);

  tasksSheetData.push({
    '소속부서': '합계',
    '예산과목': '',
    '시설(센터)': '',
    '상세위치': '',
    '공사명': `총 ${allTasks.length}건`,
    '예상비용': totalCost,
    '진행상태': '',
    '견적가': totalQuote,
    '계약금액': totalContract,
    '시공업체': '',
    '업체연락처': '',
    '담당자': '',
    '비고/메모': '',
  });

  const wsTasks = XLSX.utils.json_to_sheet(tasksSheetData);
  wsTasks['!cols'] = [
    { wch: 18 }, // 소속부서
    { wch: 14 }, // 예산과목
    { wch: 16 }, // 시설
    { wch: 18 }, // 위치
    { wch: 38 }, // 공사명
    { wch: 16 }, // 예상비용
    { wch: 12 }, // 진행상태
    { wch: 16 }, // 견적가
    { wch: 16 }, // 계약금액
    { wch: 18 }, // 업체명
    { wch: 15 }, // 연락처
    { wch: 10 }, // 담당자
    { wch: 25 }, // 메모
  ];
  XLSX.utils.book_append_sheet(workbook, wsTasks, '공사관리대장');

  // 2. Sheet 2: 부서별 시설 현황
  if (Array.isArray(facilities) && facilities.length > 0) {
    const facSheetData = facilities.map((f) => ({
      '소속부서': f.department || '',
      '시설명': f.name || '',
      '정식명칭': f.fullName || '',
      '시설분류': f.category || '',
      '소재지/주소': f.location || '',
      '규모/층수': f.scale || '',
      '준공/개관일': f.completionDate || '',
      '관리책임자': f.manager || '',
      '대표연락처': f.contact || '',
      '주요설비': f.majorFacilities || '',
      '세부구역': Array.isArray(f.zones) ? f.zones.join(', ') : '',
      '시설개요': f.description || '',
    }));
    const wsFacilities = XLSX.utils.json_to_sheet(facSheetData);
    wsFacilities['!cols'] = [
      { wch: 18 },
      { wch: 16 },
      { wch: 24 },
      { wch: 14 },
      { wch: 32 },
      { wch: 25 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 40 },
      { wch: 30 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsFacilities, '부서별시설현황');
  }

  // 3. Sheet 3: 부서별 예산 현황
  if (budgets && typeof budgets === 'object') {
    const budgetSheetData = [];
    let totalBudget = 0;
    let totalExecuted = 0;

    Object.entries(budgets).forEach(([dept, catMap]) => {
      if (catMap && typeof catMap === 'object') {
        Object.entries(catMap).forEach(([cat, amount]) => {
          const bAmount = Number(amount) || 0;
          const deptTasks = allTasks.filter(t => (t.department || '남양주체육문화센터') === dept && (t.budget || '수선유지비') === cat);
          const executed = deptTasks.reduce((s, t) => s + (Number(t.estimatedCost) || 0), 0);
          const remain = bAmount - executed;
          const rate = bAmount > 0 ? ((executed / bAmount) * 100).toFixed(1) : '0.0';

          totalBudget += bAmount;
          totalExecuted += executed;

          budgetSheetData.push({
            '소속부서': dept,
            '예산과목': cat,
            '배정예산액(원)': bAmount,
            '집행예정액(원)': executed,
            '잔여예산액(원)': remain,
            '집행률(%)': `${rate}%`,
            '공사건수': `${deptTasks.length}건`,
            '비고': remain < 0 ? '⚠️ 예산초과' : '정상 집행 중'
          });
        });
      }
    });

    if (budgetSheetData.length > 0) {
      budgetSheetData.push({
        '소속부서': '합계',
        '예산과목': '전체 예산 총계',
        '배정예산액(원)': totalBudget,
        '집행예정액(원)': totalExecuted,
        '잔여예산액(원)': totalBudget - totalExecuted,
        '집행률(%)': totalBudget > 0 ? `${((totalExecuted / totalBudget) * 100).toFixed(1)}%` : '0.0%',
        '공사건수': `${allTasks.length}건`,
        '비고': '총괄'
      });

      const wsBudgets = XLSX.utils.json_to_sheet(budgetSheetData);
      wsBudgets['!cols'] = [
        { wch: 22 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 12 },
        { wch: 12 },
        { wch: 16 }
      ];
      XLSX.utils.book_append_sheet(workbook, wsBudgets, '부서별예산현황');
    }
  }

  // 4. Sheet 4: 조직도 및 제출 현황
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

  const orgSheetData = [];
  DIVISIONS.forEach(div => {
    div.departments.forEach(dept => {
      const facCount = facilities.filter(f => (f.department || '남양주체육문화센터') === dept).length;
      const deptTasks = allTasks.filter(t => (t.department || '남양주체육문화센터') === dept).length;
      const deptBudget = budgets[dept] ? Object.values(budgets[dept]).reduce((s, v) => s + (Number(v) || 0), 0) : 100000000;
      orgSheetData.push({
        '총괄본부': '남양주도시공사 시설본부',
        '소속처': div.division,
        '부서명': dept,
        '관리시설수': `${facCount}개소`,
        '등록공사수': `${deptTasks}건`,
        '배정예산합계(원)': deptBudget,
        '예산제출상태': dept === '남양주체육문화센터' ? '제출완료' : '작성중'
      });
    });
  });

  const wsOrg = XLSX.utils.json_to_sheet(orgSheetData);
  wsOrg['!cols'] = [
    { wch: 24 },
    { wch: 18 },
    { wch: 22 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsOrg, '조직도및부서현황');

  // 5. Sheet 5: 감사 및 작업 이력
  if (Array.isArray(loginHistory) && loginHistory.length > 0) {
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
      { wch: 8 },
      { wch: 18 },
      { wch: 20 },
      { wch: 14 },
      { wch: 12 },
      { wch: 18 },
      { wch: 22 },
      { wch: 16 },
      { wch: 28 },
      { wch: 40 },
      { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(workbook, wsHistory, '접속및작업감사이력');
  }

  XLSX.writeFile(workbook, fileName);
}

/**
 * 엑셀 파일(.xlsx, .xls) 읽어들이기
 */
export function importFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const importedTasks = json
          .filter((row) => row['공사명'] && row['공사명'] !== '합계')
          .map((row, index) => {
            const rawCost = row['예상비용'];
            const isNumericCost = !isNaN(Number(rawCost)) && rawCost !== '' && rawCost !== null;

            return {
              id: `TASK-IMP-${Date.now()}-${index + 1}`,
              budget: row['예산'] || '일상경비',
              facility: row['분류'] || '남양주센터',
              location: row['위치'] || '',
              title: row['공사명'] || '',
              estimatedCost: isNumericCost ? Number(rawCost) : null,
              estimatedCostNote: !isNumericCost && rawCost ? String(rawCost) : '',
              manager: row['담당자'] || '',
              status: row['진행'] || '접수/대기',
              quoteAmount: !isNaN(Number(row['견적가'])) && row['견적가'] ? Number(row['견적가']) : null,
              contractAmount: !isNaN(Number(row['계약금액'])) && row['계약금액'] ? Number(row['계약금액']) : null,
              vendor: row['업체명'] || '',
              contact: row['업체 연락처'] || '',
              memo: row['비고/메모'] || '',
              logs: []
            };
          });

        resolve(importedTasks);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
