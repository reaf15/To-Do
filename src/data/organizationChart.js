// 남양주도시공사 시설본부 조직도 구조 정의
export const ORGANIZATION_TREE = [
  {
    id: 'div-sports',
    code: 'SPORTS',
    name: '체육문화운영처',
    icon: 'Building2',
    color: 'teal',
    departments: [
      { id: 'dept-nyj', name: '남양주체육문화센터', isPrimary: true, taskCount: 35 },
      { id: 'dept-hopyeong', name: '호평체육문화센터', taskCount: 0 },
      { id: 'dept-onam', name: '오남체육문화센터', taskCount: 0 },
      { id: 'dept-hwado', name: '화도체육문화센터', taskCount: 0 },
      { id: 'dept-byeolnae', name: '별내커뮤니티센터', taskCount: 0 },
      { id: 'dept-wabu', name: '와부체육문화센터', taskCount: 0 },
      { id: 'dept-pyeongnae', name: '평내체육문화센터', taskCount: 0 },
      { id: 'dept-jinjeop', name: '진접체육문화센터', taskCount: 0 }
    ]
  },
  {
    id: 'div-traffic',
    code: 'TRAFFIC',
    name: '교통환경처',
    icon: 'Train',
    color: 'blue',
    departments: [
      { id: 'dept-rail-safety', name: '철도안전부', taskCount: 0 },
      { id: 'dept-rail-ops', name: '철도운영부', taskCount: 0 },
      { id: 'dept-rail-support', name: '철도지원부', taskCount: 0 },
      { id: 'dept-parking-ops', name: '주차운영부', taskCount: 0 },
      { id: 'dept-parking-fac', name: '주차시설부', taskCount: 0 },
      { id: 'dept-ecoland', name: '에코랜드운영부', taskCount: 0 },
      { id: 'dept-water', name: '화도푸른물센터', taskCount: 0 }
    ]
  },
  {
    id: 'div-youth',
    code: 'YOUTH',
    name: '미래청소년처',
    icon: 'Sparkles',
    color: 'indigo',
    departments: [
      { id: 'dept-youth-center', name: '남양주시청소년수련관', taskCount: 0 },
      { id: 'dept-funground-jya', name: '정약용 펀그라운드', taskCount: 0 },
      { id: 'dept-funground-jinjeop', name: '펀그라운드 진접', taskCount: 0 },
      { id: 'dept-funground-sudong', name: '펀그라운드 수동', taskCount: 0 },
      { id: 'dept-child-vision', name: '어린이비전센터', taskCount: 0 }
    ]
  }
];

// Flat lookup helpers
export const ALL_DEPARTMENTS = ORGANIZATION_TREE.flatMap(div => 
  div.departments.map(dept => ({
    ...dept,
    divisionId: div.id,
    divisionName: div.name,
    divisionColor: div.color
  }))
);

export const DEFAULT_DEPARTMENT = '남양주체육문화센터';
export const DEFAULT_DIVISION = '체육문화운영처';

// 기본 제출 상태 맵 (취합 포털 3001 연동 및 로컬 캐시)
export const DEFAULT_SUBMISSION_MAP = {
  '남양주체육문화센터': { status: '제출완료', submittedAt: '2026-10-16 02:37:24', writer: '체육문화운영처', memo: '세부 실태 작성 완료' }
};

// 부서명으로 소속 처 찾기
export function getDepartmentDivision(deptName) {
  return ALL_DEPARTMENTS.find(d => d.name === deptName) || ALL_DEPARTMENTS[0];
}

// 제출 통계 계산 헬퍼
export function calculateSubmissionStats(submissionMap = {}) {
  const totalCount = ALL_DEPARTMENTS.length; // 20
  const submittedDepts = [];
  const unsubmittedDepts = [];

  ALL_DEPARTMENTS.forEach(dept => {
    const sub = submissionMap[dept.name];
    if (sub && (sub.status === '제출완료' || sub.status === '완료')) {
      submittedDepts.push({
        ...dept,
        ...sub
      });
    } else {
      unsubmittedDepts.push({
        ...dept,
        status: '미제출',
        memo: sub?.memo || '미작성'
      });
    }
  });

  const submittedCount = submittedDepts.length;
  const unsubmittedCount = unsubmittedDepts.length;
  const rate = totalCount > 0 ? ((submittedCount / totalCount) * 100).toFixed(1) : '0.0';

  return {
    totalCount,
    submittedCount,
    unsubmittedCount,
    rate,
    submittedDepts,
    unsubmittedDepts
  };
}
