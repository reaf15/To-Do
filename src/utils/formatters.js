/**
 * 금액을 한국어 원화 포맷으로 변환 (예: 10,000,000원)
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount) || amount === '') {
    return '-';
  }
  return Number(amount).toLocaleString('ko-KR') + '원';
}

/**
 * 큰 금액을 억/만 단위로 간략 표시 (예: 1억 9,300만원, 1,500만원)
 */
export function formatCurrencyShort(amount) {
  if (amount === null || amount === undefined || isNaN(amount) || amount === '') {
    return '-';
  }
  const num = Number(amount);
  if (num >= 100000000) {
    const eok = Math.floor(num / 100000000);
    const man = Math.floor((num % 100000000) / 10000);
    return man > 0 ? `${eok}억 ${man.toLocaleString('ko-KR')}만원` : `${eok}억원`;
  }
  if (num >= 10000) {
    const man = Math.floor(num / 10000);
    const rest = num % 10000;
    return rest > 0 ? `${man.toLocaleString('ko-KR')}만 ${rest.toLocaleString('ko-KR')}원` : `${man.toLocaleString('ko-KR')}만원`;
  }
  return num.toLocaleString('ko-KR') + '원';
}

/**
 * 날짜 문자열 포맷
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * 클립보드 복사 헬퍼
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (e) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * 사내 메신저 / 카카오톡 공유용 업무 텍스트 포맷 생성
 */
export function generateShareText(tasks, filterTitle = '전체 공사 현황') {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });

  const totalCost = tasks.reduce((sum, t) => sum + (Number(t.estimatedCost) || 0), 0);
  const totalQuote = tasks.reduce((sum, t) => sum + (Number(t.quoteAmount) || 0), 0);

  let text = `📢 [남양주체육문화센터 시설·공사 업무 공유]\n`;
  text += `📅 기준일자: ${today}\n`;
  text += `📌 구분: ${filterTitle} (${tasks.length}건)\n`;
  text += `💰 총 예상비용: ${formatCurrency(totalCost)} | 견적확정: ${formatCurrency(totalQuote)}\n`;
  text += `───────────────────────\n`;

  tasks.forEach((t, index) => {
    const cost = t.estimatedCost ? formatCurrency(t.estimatedCost) : (t.estimatedCostNote || '미정');
    const quote = t.quoteAmount ? ` | 견적: ${formatCurrency(t.quoteAmount)}` : '';
    const vendor = t.vendor ? ` [${t.vendor}${t.contact ? ` (${t.contact})` : ''}]` : '';
    const manager = t.manager ? `@${t.manager}` : '(담당자미정)';

    text += `${index + 1}. [${t.facility} ${t.location}] ${t.title}\n`;
    text += `   - 상태: ${t.status} | 담당: ${manager} | 예상: ${cost}${quote}${vendor}\n`;
    if (t.memo) {
      text += `   - 비고: ${t.memo}\n`;
    }
  });

  text += `───────────────────────\n`;
  text += `남양주체육문화센터 직원간 업무 공유 시스템`;
  return text;
}
