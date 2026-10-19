export const INITIAL_DATABASES = [
  {
    id: 'db-complaints',
    name: '시설민원 접수대장',
    description: '체육문화센터 시설 이용 시민 불편 접수 및 조치 결과 공유',
    icon: 'MessageSquare',
    color: 'amber',
    createdAt: '2026-10-19',
    updatedAt: '2026-10-19',
    columns: [
      { id: 'receiveDate', name: '접수일자', type: 'date', required: true },
      { id: 'complainant', name: '민원인(성함/연락처)', type: 'text' },
      { id: 'facility', name: '시설구역', type: 'select', options: ['남양주센터', '다산멀티', '도농공원', '삼패야구장', '컨퍼런스', '파크골프'] },
      { id: 'content', name: '민원 내용', type: 'textarea', required: true },
      { id: 'status', name: '처리상태', type: 'select', options: ['접수', '현장확인', '보수진행중', '완료(회신완료)'] },
      { id: 'manager', name: '처리담당자', type: 'select', options: ['김일호', '권병학', '조현호'] },
      { id: 'actionResult', name: '조치 결과', type: 'textarea' }
    ],
    records: [
      {
        id: 'c-1',
        receiveDate: '2026-10-12',
        complainant: '이** (010-****-1234)',
        facility: '남양주센터',
        content: 'B축구장 관람석 데크 바닥이 들떠 있어서 발이 걸릴 뻔했습니다.',
        status: '보수진행중',
        manager: '조현호',
        actionResult: '10/15 세한이앤지 견적 방문 완료. 들뜸 피스 고정 및 교체 공사 예정 안내 회신'
      },
      {
        id: 'c-2',
        receiveDate: '2026-10-14',
        complainant: '박** (010-****-5678)',
        facility: '다산멀티',
        content: '남녀 탈의실 내 습기 배출이 잘 안 되어 환풍기 점검 바랍니다.',
        status: '접수',
        manager: '권병학',
        actionResult: '고풍량 시로코팬 환풍기 신설 공사 품의 준비 중'
      }
    ]
  }
];

export const COLUMN_TYPES = [
  { value: 'text', label: '단문 텍스트 (이름, 위치 등)' },
  { value: 'textarea', label: '장문 메모 (내용, 결과 등)' },
  { value: 'number', label: '숫자 (수량, 거리 등)' },
  { value: 'currency', label: '금액 / 비용 (원화 ₩)' },
  { value: 'date', label: '날짜 (연-월-일)' },
  { value: 'select', label: '선택형 태그 (상태, 분류, 담당자 등)' }
];
