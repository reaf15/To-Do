export const FACILITIES = [
  '남양주센터',
  '다산멀티',
  '도농공원',
  '삼패야구장',
  '컨퍼런스',
  '파크골프',
];

export const BUDGET_TYPES = [
  '수선유지비',
  '시설비',
  '운영경비',
];

export const MANAGERS = [
  '김일호',
  '권병학',
  '조현호',
];

export const STATUS_LIST = [
  '접수/대기',
  '검토중',
  '견적의뢰',
  '견적방문',
  '제안서 협의',
  '계약체결',
  '공사진행',
  '완료',
];

export const STATUS_COLORS = {
  '접수/대기': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', dot: 'bg-slate-400' },
  '검토중': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', dot: 'bg-amber-500' },
  '견적의뢰': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' },
  '견적방문': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300', dot: 'bg-indigo-500' },
  '제안서 협의': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', dot: 'bg-purple-500' },
  '계약체결': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-300', dot: 'bg-cyan-500' },
  '공사진행': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
  '완료': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', dot: 'bg-emerald-500' },
};

export const INITIAL_TASKS = [
  {
    "department": "남양주체육문화센터",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "",
    "title": "화단 통행로 이동",
    "estimatedCost": 3000000,
    "estimatedCostNote": "",
    "manager": "",
    "status": "접수/대기",
    "startDate": "",
    "endDate": "",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "memo": "",
    "id": "TASK-1792459522047",
    "logs": [
      {
        "date": "2026-10-20",
        "author": "시스템",
        "message": "신규 공사 업무 등록"
      }
    ]
  },
  {
    "id": "TASK-01",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "옥상",
    "title": "체육관 옥상 방수(콘크리트면)",
    "estimatedCost": 10000000,
    "estimatedCostNote": "",
    "manager": "김일호",
    "status": "견적의뢰",
    "quoteAmount": 13185000,
    "contractAmount": null,
    "vendor": "진산종합환경",
    "contact": "010-4529-2649",
    "memo": "체육관 옥상 콘크리트면 우레탄 방수 견적 의뢰 중",
    "logs": [
      {
        "date": "2026-10-10",
        "author": "김일호",
        "message": "진산종합환경 현장 실측 및 견적서 제출 요청"
      }
    ],
    "startDate": "2026-10-01",
    "endDate": "2026-10-06",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-02",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "게이트볼장",
    "title": "게이트볼장 옥상 방수",
    "estimatedCost": null,
    "estimatedCostNote": "",
    "manager": "",
    "status": "접수/대기",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "우천 시 누수 여부 점검 후 보수 계획 수립 필요",
    "logs": [],
    "startDate": "2026-10-03",
    "endDate": "2026-10-09",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-03",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "야외공연장 주차장",
    "title": "화단 난간대 설치",
    "estimatedCost": null,
    "estimatedCostNote": "",
    "manager": "",
    "status": "접수/대기",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "안전사고 예방을 위한 화단 안전 펜스 난간대 ���치",
    "logs": [],
    "startDate": "2026-10-05",
    "endDate": "2026-10-12",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-04",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "청수관 교차로",
    "title": "회전교차로 사고석 보수",
    "estimatedCost": 10000000,
    "estimatedCostNote": "",
    "manager": "김일호",
    "status": "견적의뢰",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "에스엠",
    "contact": "",
    "memo": "교차로 차량 충돌로 인한 사고석 이탈 및 파손 보수",
    "logs": [
      {
        "date": "2026-10-12",
        "author": "김일호",
        "message": "에스엠에 사고석 규격 및 시공 견적 문의"
      }
    ],
    "startDate": "2026-10-07",
    "endDate": "2026-10-15",
    "department": "남양주체육문화센터"
  },
  {
    "department": "남양주체육문화센터",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "야구장 3면",
    "title": "야구장 그물망 및 주루베이스 교체",
    "estimatedCost": 15000000,
    "estimatedCostNote": "",
    "manager": "김일호",
    "status": "견적의뢰",
    "startDate": "2026-10-09",
    "endDate": "2026-10-18",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "현 eng",
    "memo": "야구장 3면 정규 투수마운드 흙 교체 및 레벨링 평탄화 작업",
    "id": "TASK-05",
    "logs": [
      {
        "date": "2026-10-11",
        "author": "김일호",
        "message": "현 eng 업체에 현장 답사 및 견적 요청"
      }
    ]
  },
  {
    "id": "TASK-06",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "3층 방송실",
    "title": "방송실 천정재 설치",
    "estimatedCost": 10000000,
    "estimatedCostNote": "",
    "manager": "",
    "status": "접수/대기",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "방송실 텍스 천정재 노후 교체 및 방음재 보강",
    "logs": [],
    "startDate": "2026-10-11",
    "endDate": "2026-10-21",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-07",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "각층 화장실",
    "title": "화장실 대변기 커버 교체",
    "estimatedCost": 5000000,
    "estimatedCostNote": "",
    "manager": "권병학",
    "status": "접수/대기",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "센터 각 층 남녀 화장실 변기 커버 전수 교체 조사",
    "logs": [
      {
        "date": "2026-10-13",
        "author": "권병학",
        "message": "각 층별 필요 수량(남 18개, 여 24개) 파악 중"
      }
    ],
    "startDate": "2026-10-13",
    "endDate": "2026-10-24",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-08",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "남녀 탈의실",
    "title": "탈의실 락커 수직 칸막이 공사",
    "estimatedCost": null,
    "estimatedCostNote": "",
    "manager": "",
    "status": "접수/대기",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "이용객 프라이버시 보호를 위한 락커 칸막이 증설",
    "logs": [],
    "startDate": "2026-10-15",
    "endDate": "2026-10-27",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-09",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "3층 로비",
    "title": "체육관 3층 로비 난간 증설 공사(1.2m 까지)",
    "estimatedCost": null,
    "estimatedCostNote": "",
    "manager": "",
    "status": "접수/대기",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "추락 방지 안전기준 1.2m 상향에 따른 난간 증설",
    "logs": [],
    "startDate": "2026-10-17",
    "endDate": "2026-10-22",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-10",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "A구장",
    "title": "CCTV 증설",
    "estimatedCost": null,
    "estimatedCostNote": "",
    "manager": "",
    "status": "제안서 협의",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "A구장 사각지대 해소를 위한 감시카메라 4대 제안서 검토",
    "logs": [
      {
        "date": "2026-10-08",
        "author": "조현호",
        "message": "CCTV 설치 제안서 접수되어 설치 위치 조율 중"
      }
    ],
    "startDate": "2026-10-19",
    "endDate": "2026-10-25",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-11",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "A구장 데크 계단",
    "title": "데크 계단 철거",
    "estimatedCost": 5000000,
    "estimatedCostNote": "",
    "manager": "",
    "status": "견적의뢰",
    "quoteAmount": 2255000,
    "contractAmount": null,
    "vendor": "고려안전",
    "contact": "",
    "memo": "노후 부식 데크 계단 철거 및 안전통로 확보 (견적 2,255,000원 접수)",
    "logs": [
      {
        "date": "2026-10-14",
        "author": "김일호",
        "message": "고려안전 견적서 수령 완료: 2,255,000원"
      }
    ],
    "startDate": "2026-10-01",
    "endDate": "2026-10-08",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-12",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "B,C 축구장",
    "title": "B,C축구장 와이어 파단 보수",
    "estimatedCost": 10000000,
    "estimatedCostNote": "",
    "manager": "권병학",
    "status": "견적의뢰",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "대신이엔지",
    "contact": "",
    "memo": "안전 그물망 지지 와이어 파단 부위 긴급 보수 검토",
    "logs": [
      {
        "date": "2026-10-14",
        "author": "권병학",
        "message": "현장 와이어 규격 12mm 확인"
      }
    ],
    "startDate": "2026-10-03",
    "endDate": "2026-10-11",
    "department": "남양주체육문화센터"
  },
  {
    "department": "남양주체육문화센터",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "B,C 축구장",
    "title": "관람석 데크 들뜸 보수",
    "estimatedCost": 5000000,
    "estimatedCostNote": "다목적잔디광장 화장실 배관 공사 포함",
    "manager": "조현호",
    "status": "견적방문",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "세한이앤지",
    "contact": "010-6397-1914",
    "memo": "10월 15일 견적방문 (다목적잔디광장 화장실 배관 공사 포함)",
    "id": "TASK-13",
    "logs": [
      {
        "date": "2026-10-13",
        "author": "조현호",
        "message": "세한이앤지 담당자와 10월 15일 14시 현장 실측 약속"
      },
      {
        "date": "2026-10-15",
        "author": "조현호",
        "message": "현장 실측 완료. 견적서 금주 내 제출 ���정"
      },
      {
        "date": "2026-10-19",
        "author": "조현호",
        "message": "다목적잔디광장 화장실 배관 공사와 동시 진행"
      }
    ],
    "startDate": "2026-10-15",
    "endDate": "2026-10-15"
  },
  {
    "department": "남양주체육문화센터",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "야외공연장 주차장",
    "title": "주차장 조명탑 조명보수 및 회로분리 공사",
    "estimatedCost": 5000000,
    "estimatedCostNote": "",
    "manager": "조현호",
    "status": "견적의뢰",
    "quoteAmount": 9634900,
    "contractAmount": null,
    "vendor": "서진전력",
    "contact": "010-9175-7701",
    "memo": "조명탑 서치라이트 교체 및 회로 개별 제어 분리 공사 / 야구장 조명공사 동시 진행",
    "id": "TASK-14",
    "logs": [
      {
        "date": "2026-10-12",
        "author": "조현호",
        "message": "서진전력 견적 접수 (9,634,900원). 예상비용(5,000,000원) 대비 상향되어 범위 조정 협의 예정"
      },
      {
        "date": "2026-10-19",
        "author": "조현호",
        "message": "야구장 조명 보수 동시 진행(합 9,634,900원)"
      },
      {
        "date": "2026-10-19",
        "author": "조현호",
        "message": "진행 상태를 [견적방문](으)로 변경"
      }
    ],
    "startDate": "2026-10-07",
    "endDate": "2026-10-17"
  },
  {
    "department": "남양주체육문화센터",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "야구장 3면",
    "title": "야구장 조명 보수",
    "estimatedCost": 15000000,
    "estimatedCostNote": "",
    "manager": "조현호",
    "status": "견적의뢰",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "서��전력",
    "contact": "010-9175-7701",
    "memo": "야구장 메��할라이드 투광기 점검 및 불량 안정기/램프 ���� / 야외공연장 조명탑 공사와 동시 진행",
    "id": "TASK-15",
    "logs": [
      {
        "date": "2026-10-13",
        "author": "조현호",
        "message": "서진전력 크레인 작업 견적 산출 중"
      },
      {
        "date": "2026-10-19",
        "author": "조현호",
        "message": "야외공연장 조명탑 보수 동시 진행(합 9,634,900원)"
      },
      {
        "date": "2026-10-19",
        "author": "조현호",
        "message": "진행 상태를 [견적방문](으)로 변경"
      }
    ],
    "startDate": "2026-10-09",
    "endDate": "2026-10-20"
  },
  {
    "id": "TASK-16",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "야구장(성인)",
    "title": "야구장 더그아웃 평탄화",
    "estimatedCost": null,
    "estimatedCostNote": "",
    "manager": "",
    "status": "완료",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "더그아웃 1루/3루 바닥 흙 다짐 및 평탄화 시공 완료",
    "logs": [
      {
        "date": "2026-10-05",
        "author": "김일호",
        "message": "공사 시공 및 바닥 레벨 검수 완료"
      }
    ],
    "startDate": "2026-10-11",
    "endDate": "2026-10-23",
    "department": "남양주체육문화센터"
  },
  {
    "department": "남양주체육문화센터",
    "budget": "시설비",
    "facility": "남양주센터",
    "location": "야구장(성인)",
    "title": "성인야구장 관람석 보수",
    "estimatedCost": 13900000,
    "estimatedCostNote": "",
    "manager": "권병학",
    "status": "견적의뢰",
    "startDate": "2026-10-13",
    "endDate": "2026-10-18",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "memo": "관람석 의자 균열 및 페인트 박리 보수",
    "id": "TASK-17",
    "logs": [
      {
        "date": "2026-10-19",
        "author": "관리자",
        "message": "진행 상태를 [검토중](으)로 변경"
      },
      {
        "date": "2026-10-19",
        "author": "관리자",
        "message": "진행 상태를 [견적의뢰](으)로 변경"
      },
      {
        "date": "2026-10-19",
        "author": "관리자",
        "message": "담당자를 [김일호](으)로 지정"
      },
      {
        "date": "2026-10-20",
        "author": "관리자",
        "message": "담당자를 [권병학](으)로 지정"
      }
    ]
  },
  {
    "id": "TASK-18",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "B,C 축구장",
    "title": "B,C축구장 주차장 배수로 플륨관 교체",
    "estimatedCost": 15000000,
    "estimatedCostNote": "",
    "manager": "",
    "status": "접수/대기",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "주차장 차량 하중으로 침하 및 파손된 콘크리트 플륨관 전면 교체",
    "logs": [],
    "startDate": "2026-10-15",
    "endDate": "2026-10-21",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-19",
    "budget": "운영경비",
    "facility": "남양주센터",
    "location": "남양주센터",
    "title": "정보통신유지관리자 성능점검",
    "estimatedCost": 5000000,
    "estimatedCostNote": "",
    "manager": "조현호",
    "status": "접수/대기",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "정보통신공사업법에 따른 연간 통신설비 성능점검 용역 발주",
    "logs": [
      {
        "date": "2026-10-14",
        "author": "조현호",
        "message": "법정 점검 대상 장비 목록 작성"
      }
    ],
    "startDate": "2026-10-17",
    "endDate": "2026-10-24",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-20",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "주차장 배면 옹벽",
    "title": "보강토 옹벽 보수",
    "estimatedCost": 15000000,
    "estimatedCostNote": "",
    "manager": "김일호",
    "status": "견적의뢰",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "에스엠",
    "contact": "",
    "memo": "배면 옹벽 블록 균열 및 토압에 의한 배부름 현상 안전진단 및 보강",
    "logs": [
      {
        "date": "2026-10-12",
        "author": "김일호",
        "message": "에스엠과 구조 안전 보강 공법 협의 중"
      }
    ],
    "startDate": "2026-10-19",
    "endDate": "2026-10-27",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-21",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "정문 구내도로",
    "title": "정문 통행로 주차규제봉 설치 및 풋살 그물망 고정",
    "estimatedCost": 5000000,
    "estimatedCostNote": "",
    "manager": "조현호",
    "status": "견적의뢰",
    "quoteAmount": 3300000,
    "contractAmount": null,
    "vendor": "고려안전",
    "contact": "",
    "memo": "정문 불법주차 방지 탄력봉 20개소 신설 및 풋살장 그물망 텐션 재고정 (고려안전 견적 3,300,000원 접수)",
    "logs": [
      {
        "date": "2026-10-15",
        "author": "조현호",
        "message": "고려안전 상세 내역서 접수 (3,300,000원)"
      },
      {
        "date": "2026-10-19",
        "author": "조현호",
        "message": "진행 상태를 [제안서 협의](으)로 변경"
      }
    ],
    "startDate": "2026-10-01",
    "endDate": "2026-10-10",
    "department": "남양주체육문화센터"
  },
  {
    "department": "남양주체육문화센터",
    "budget": "수선유지비",
    "facility": "남양주센터",
    "location": "인공암벽장",
    "title": "등기구 교체",
    "estimatedCost": 0,
    "estimatedCostNote": "",
    "manager": "",
    "status": "완료",
    "startDate": "2026-10-03",
    "endDate": "2026-10-13",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "memo": "인공암벽장 고천정 LED 투광등 불량품 교체",
    "id": "TASK-22",
    "logs": [
      {
        "date": "2026-10-20",
        "author": "관리자",
        "message": "진행 상태를 [완료](으)로 변경"
      }
    ]
  },
  {
    "id": "TASK-23",
    "budget": "수선유지비",
    "facility": "다산멀티",
    "location": "남녀 탈의실",
    "title": "다산멀티스포츠센터 탈의실 환풍기 설치 및 전기공사",
    "estimatedCost": 5000000,
    "estimatedCostNote": "",
    "manager": "권병학",
    "status": "접수/대기",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "습기 배출을 위한 고풍량 시로코팬 환풍기 신설 및 전원 배선 작업",
    "logs": [
      {
        "date": "2026-10-11",
        "author": "권병학",
        "message": "다산센터 현장 분전반 여유 용량 확인"
      }
    ],
    "startDate": "2026-10-05",
    "endDate": "2026-10-16",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-24",
    "budget": "수선유지비",
    "facility": "도농공원",
    "location": "옥상",
    "title": "도농공원 옥상 방수",
    "estimatedCost": null,
    "estimatedCostNote": "",
    "manager": "",
    "status": "접수/대기",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "도농공원 관리동 옥상 바닥 크랙 보수 및 탑코팅",
    "logs": [],
    "startDate": "2026-10-07",
    "endDate": "2026-10-19",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-25",
    "budget": "수선유지비",
    "facility": "도농공원",
    "location": "탁구장",
    "title": "바닥 매트 설치",
    "estimatedCost": null,
    "estimatedCostNote": "",
    "manager": "",
    "status": "검토중",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "탁구장 전용 탄성 렉스코트 또는 충격흡수 고무매트 제품군 비교 검토",
    "logs": [
      {
        "date": "2026-10-10",
        "author": "김일호",
        "message": "타 시설 시공사례 및 샘플 단가 취합"
      }
    ],
    "startDate": "2026-10-09",
    "endDate": "2026-10-14",
    "department": "남양주체육문화센터"
  },
  {
    "department": "남양주체육문화센터",
    "budget": "수선유지비",
    "facility": "삼패야구장",
    "location": "야구장 3면",
    "title": "삼패야구장 바닥 정지 작업",
    "estimatedCost": 15000000,
    "estimatedCostNote": "",
    "manager": "김일호",
    "status": "견적의뢰",
    "startDate": "2026-10-11",
    "endDate": "2026-10-17",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "에스엠",
    "memo": "한강 둔치 삼패야구장 그라운드 침하 정비 및 마사토 쇄석 포설 정지 작업",
    "id": "TASK-26",
    "logs": [
      {
        "date": "2026-10-13",
        "author": "김일호",
        "message": "에스엠 중장비 투입 일정 및 토사 물량 산출 협의"
      }
    ]
  },
  {
    "id": "TASK-27",
    "budget": "수선유지비",
    "facility": "컨퍼런스",
    "location": "컨퍼런스장",
    "title": "컨퍼런스장, 장애인 체육관 전기 공사",
    "estimatedCost": 5000000,
    "estimatedCostNote": "",
    "manager": "권병학",
    "status": "접수/대기",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "컨퍼런스룸 음향·조명 콘���트 추가 및 장애인 체육관 조명 컨트롤러 정비",
    "logs": [
      {
        "date": "2026-10-14",
        "author": "권병학",
        "message": "공사 범위 도면 표기 작업 중"
      }
    ],
    "startDate": "2026-10-13",
    "endDate": "2026-10-20",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-28",
    "budget": "수선유지비",
    "facility": "컨퍼런스",
    "location": "컨퍼런스장",
    "title": "컨퍼런스장 주차장 잡석 포설",
    "estimatedCost": 8000000,
    "estimatedCostNote": "",
    "manager": "권병학",
    "status": "접수/대기",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "우천 시 진흙탕 방지를 위한 25mm 쇄석 골재 50톤 포설 및 다짐",
    "logs": [],
    "startDate": "2026-10-15",
    "endDate": "2026-10-23",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-30",
    "budget": "운영경비",
    "facility": "컨퍼런스",
    "location": "장애인체육관",
    "title": "신발장 구매 설치",
    "estimatedCost": null,
    "estimatedCostNote": "",
    "manager": "",
    "status": "검토중",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "수선유지비가 아닌 사무관리비 예산으로 100켤레 수납 신발장 일괄 구매 예정",
    "logs": [
      {
        "date": "2026-10-19",
        "author": "관리자",
        "message": "진행 상태를 [검토중](으)로 변경"
      }
    ],
    "startDate": "2026-10-19",
    "endDate": "2026-10-29",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-31",
    "budget": "수선유지비",
    "facility": "컨퍼런스",
    "location": "장애인체육관",
    "title": "컨퍼런스장 방풍비닐 설치",
    "estimatedCost": 5000000,
    "estimatedCostNote": "",
    "manager": "권병학",
    "status": "접수/대기",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "동절기 외풍 차단 투명 방풍비닐 커튼(지퍼식) 제작 설치",
    "logs": [
      {
        "date": "2026-10-15",
        "author": "권병학",
        "message": "출입구 치수 실측: 가로 4.2m x 높이 3.5m"
      }
    ],
    "startDate": "2026-10-01",
    "endDate": "2026-10-12",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-32",
    "budget": "수선유지비",
    "facility": "컨퍼런스",
    "location": "장애인체육관",
    "title": "장애인체육관 에어 컴푸레서 설치",
    "estimatedCost": 5000000,
    "estimatedCostNote": "",
    "manager": "권병학",
    "status": "접수/대기",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "휠체어 바퀴 공기압 주입 및 먼지 털이용 저소음 콤프레샤 설치",
    "logs": [],
    "startDate": "2026-10-03",
    "endDate": "2026-10-15",
    "department": "남양주체육문화센터"
  },
  {
    "id": "TASK-33",
    "budget": "수선유지비",
    "facility": "컨퍼런스",
    "location": "장애인체육관",
    "title": "장애인체육관 장애인 주차장 스토퍼 설치, 주차구역 표시",
    "estimatedCost": 5000000,
    "estimatedCostNote": "",
    "manager": "권병학",
    "status": "접수/대기",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "contact": "",
    "memo": "장애인 전용 주차구역 4면 청색 재도색 및 카스토퍼 신설",
    "logs": [
      {
        "date": "2026-10-14",
        "author": "권���학",
        "message": "도색 도료 및 스토퍼 8개 구매 품의 준비"
      }
    ],
    "startDate": "2026-10-05",
    "endDate": "2026-10-10",
    "department": "남양주체육문화센터"
  },
  {
    "department": "남양주체육문화센터",
    "budget": "시설비",
    "facility": "파크골프",
    "location": "화장실",
    "title": "다목적잔디광장 화장실 배관 공사",
    "estimatedCost": 5000000,
    "estimatedCostNote": "",
    "manager": "조현호",
    "status": "견적방문",
    "quoteAmount": 2754000,
    "contractAmount": null,
    "vendor": "세한이앤지",
    "contact": "010-6397-1914",
    "memo": "10월 15일 견적방문",
    "id": "TASK-34",
    "logs": [
      {
        "date": "2026-10-13",
        "author": "조현호",
        "message": "세한이앤지 담당자와 현장 미팅 일정 조율"
      },
      {
        "date": "2026-10-15",
        "author": "조현호",
        "message": "현장 배관 동파부위 확인. 배관 교체 견적 접수 예정"
      },
      {
        "date": "2026-10-19",
        "author": "조현호",
        "message": "B,C 축구장 데크 들뜸 공사와 동시 진행"
      }
    ],
    "startDate": "2026-10-15",
    "endDate": "2026-10-15"
  },
  {
    "department": "남양주체육문화센터",
    "budget": "시설비",
    "facility": "파크골프",
    "location": "",
    "title": "조명 각도 조정",
    "estimatedCost": null,
    "estimatedCostNote": "",
    "manager": "",
    "status": "계약체결",
    "startDate": "2026-10-09",
    "endDate": "2026-10-16",
    "quoteAmount": null,
    "contractAmount": null,
    "vendor": "",
    "memo": "야간 이용객 눈부심 방지 및 코스 조도 확보를 위한 투광등 각도 재조정 (시설비 과목 집행 검토)",
    "id": "TASK-35",
    "logs": [
      {
        "date": "2026-10-19",
        "author": "관리자",
        "message": "진행 상태를 [계약체결](으)로 변경"
      }
    ]
  }
];
