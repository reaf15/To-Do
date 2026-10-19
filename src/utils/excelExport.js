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
    '업체 연락처': t.contact || '',
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
    '업체 연락처': '',
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
    { wch: 18 }, // 연락처
    { wch: 30 }, // 메모
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '공사업무현황');

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
              budget: row['예산'] || '수선유지비',
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
