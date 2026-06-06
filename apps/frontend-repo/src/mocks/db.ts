export interface Sample {
  id: number;
  message: string;
  status: string;
  urgent: boolean;
  updatedAt: string;
}

const INITIAL_SAMPLES: Sample[] = [
  {
    id: 1,
    message: "Hello World",
    status: "ACTIVE",
    urgent: false,
    updatedAt: "2026-04-23 21:23:20",
  },
  {
    id: 2,
    message: "System Down ASAP!",
    status: "ACTIVE",
    urgent: true,
    updatedAt: "2026-04-23 21:23:20",
  },
  {
    id: 3,
    message: "Scheduled Maintenance",
    status: "INACTIVE",
    urgent: false,
    updatedAt: "2026-04-23 21:23:20",
  },
];

let nextSampleId = 4;
let samples: Sample[] = [...INITIAL_SAMPLES];

const getCurrentTime = () =>
  new Date().toISOString().replace("T", " ").substring(0, 19);

export const resetSamples = () => {
  samples = [...INITIAL_SAMPLES];
  nextSampleId = 4;
};

export const db = {
  getAll: () => samples,

  getById: (id: number) => samples.find((sample) => sample.id === id),

  create: (data: { message: string }) => {
    const newSample: Sample = {
      id: nextSampleId++,
      message: data.message,
      status: "ACTIVE",
      urgent: false,
      updatedAt: getCurrentTime(),
    };
    samples.push(newSample);
    return newSample;
  },

  update: (id: number, data: { message: string }) => {
    const index = samples.findIndex((sample) => sample.id === id);
    if (index === -1) {
      return null;
    }

    samples[index] = {
      ...samples[index],
      message: data.message,
      updatedAt: getCurrentTime(),
    };
    return samples[index];
  },

  patch: (id: number, data: Partial<Sample>) => {
    const index = samples.findIndex((sample) => sample.id === id);
    if (index === -1) {
      return null;
    }

    samples[index] = {
      ...samples[index],
      ...data,
      updatedAt: getCurrentTime(),
    };
    return samples[index];
  },

  delete: (id: number) => {
    const index = samples.findIndex((sample) => sample.id === id);
    if (index === -1) {
      return false;
    }

    samples.splice(index, 1);
    return true;
  },
};

export interface User {
  id: number;
  loginId: string;
  nickname: string;
  password?: string;
  status: "active" | "suspended" | "deleted";
  lastLoginAt?: string;
  createdAt: string;
}

const INITIAL_USERS: User[] = [
  {
    id: 1,
    loginId: "testuser",
    nickname: "테스터",
    password: "password123!",
    status: "active",
    lastLoginAt: "2026-05-25 13:00:00",
    createdAt: "2026-05-25 10:00:00",
  },
];

let nextUserId = 2;
let users: User[] = [...INITIAL_USERS];

export const resetUsers = () => {
  users = [...INITIAL_USERS];
  nextUserId = 2;
};

export const dbUser = {
  getAll: () => users,

  findByLoginId: (loginId: string) =>
    users.find((user) => user.loginId === loginId),

  create: (data: {
    loginId: string;
    nickname: string;
    password?: string;
  }) => {
    const newUser: User = {
      id: nextUserId++,
      loginId: data.loginId,
      nickname: data.nickname,
      password: data.password,
      status: "active",
      createdAt: getCurrentTime(),
    };
    users.push(newUser);
    return newUser;
  },

  delete: (loginId: string) => {
    const index = users.findIndex((user) => user.loginId === loginId);
    if (index === -1) {
      return false;
    }

    users[index] = {
      ...users[index],
      status: "deleted",
    };
    return true;
  },
};

export interface WashingTransactionRecord {
  id: number;
  occurredAt: string;
  merchantName: string;
  description: string;
  cardLabel: string;
  amount: number;
  category: string | null;
  isClassified: boolean;
  matchedRuleLabel: string | null;
  tag: string;
  source: "CARD" | "BANK" | "CASH";
}

const WASHING_CATEGORIES = [
  "식비",
  "교통",
  "생활",
  "구독",
  "의료",
  "여가",
  "업무",
];

const INITIAL_WASHING_TRANSACTIONS: WashingTransactionRecord[] = [
  {
    id: 101,
    occurredAt: "2026-06-01 08:12",
    merchantName: "스타벅스 성수역점",
    description: "아메리카노 외 1건",
    cardLabel: "현대 Zero",
    amount: 11200,
    category: "식비",
    isClassified: true,
    matchedRuleLabel: "규칙: 스타벅스 -> 식비",
    tag: "카페",
    source: "CARD",
  },
  {
    id: 102,
    occurredAt: "2026-06-01 18:22",
    merchantName: "배달의민족",
    description: "저녁 주문",
    cardLabel: "신한 Deep",
    amount: 26800,
    category: null,
    isClassified: false,
    matchedRuleLabel: null,
    tag: "배달",
    source: "CARD",
  },
  {
    id: 103,
    occurredAt: "2026-06-02 07:50",
    merchantName: "서울교통공사",
    description: "후불 교통",
    cardLabel: "신한 Deep",
    amount: 1450,
    category: "교통",
    isClassified: true,
    matchedRuleLabel: "규칙: 서울교통공사 -> 교통",
    tag: "지하철",
    source: "CARD",
  },
  {
    id: 104,
    occurredAt: "2026-06-02 12:40",
    merchantName: "쿠팡",
    description: "생활용품 구매",
    cardLabel: "삼성 taptap",
    amount: 38700,
    category: null,
    isClassified: false,
    matchedRuleLabel: null,
    tag: "온라인쇼핑",
    source: "CARD",
  },
  {
    id: 105,
    occurredAt: "2026-06-03 09:30",
    merchantName: "넷플릭스",
    description: "정기결제",
    cardLabel: "현대 Zero",
    amount: 17000,
    category: "구독",
    isClassified: true,
    matchedRuleLabel: "규칙: 넷플릭스 -> 구독",
    tag: "OTT",
    source: "CARD",
  },
  {
    id: 106,
    occurredAt: "2026-06-03 21:18",
    merchantName: "네이버페이",
    description: "결제대행",
    cardLabel: "토스뱅크",
    amount: 53000,
    category: null,
    isClassified: false,
    matchedRuleLabel: null,
    tag: "PG",
    source: "BANK",
  },
  {
    id: 107,
    occurredAt: "2026-06-04 14:12",
    merchantName: "올리브영",
    description: "건강용품",
    cardLabel: "삼성 taptap",
    amount: 21400,
    category: "생활",
    isClassified: true,
    matchedRuleLabel: null,
    tag: "드럭스토어",
    source: "CARD",
  },
];

let nextWashingId = 108;
let washingTransactions: WashingTransactionRecord[] = [
  ...INITIAL_WASHING_TRANSACTIONS,
];
let washingLastImportedAt = "2026-06-06 18:30:00";

export const resetWashingTransactions = () => {
  washingTransactions = [...INITIAL_WASHING_TRANSACTIONS];
  nextWashingId = 108;
  washingLastImportedAt = "2026-06-06 18:30:00";
};

export const dbWashing = {
  getOverview: () => ({
    categories: [...WASHING_CATEGORIES],
    transactions: washingTransactions,
    lastImportedAt: washingLastImportedAt,
  }),

  bulkClassify: (ids: number[], category: string) => {
    washingTransactions = washingTransactions.map((transaction) =>
      ids.includes(transaction.id)
        ? {
            ...transaction,
            category,
            isClassified: true,
            matchedRuleLabel: null,
            tag: "수동 일괄 세척",
          }
        : transaction,
    );
    washingLastImportedAt = getCurrentTime();
    return dbWashing.getOverview();
  },

  updateCategory: (id: number, category: string | null) => {
    const index = washingTransactions.findIndex(
      (transaction) => transaction.id === id,
    );
    if (index === -1) {
      return null;
    }

    washingTransactions[index] = {
      ...washingTransactions[index],
      category,
      isClassified: category !== null,
      matchedRuleLabel:
        category === null
          ? null
          : washingTransactions[index].matchedRuleLabel,
      tag: category === null ? "수동 검토 필요" : washingTransactions[index].tag,
    };
    washingLastImportedAt = getCurrentTime();
    return washingTransactions[index];
  },

  importMockBatch: () => {
    const imported: WashingTransactionRecord[] = [
      {
        id: nextWashingId++,
        occurredAt: "2026-06-05 08:08",
        merchantName: "메가MGC커피",
        description: "출근길 커피",
        cardLabel: "현대 Zero",
        amount: 3900,
        category: null,
        isClassified: false,
        matchedRuleLabel: null,
        tag: "신규 유입",
        source: "CARD",
      },
      {
        id: nextWashingId++,
        occurredAt: "2026-06-05 19:48",
        merchantName: "오늘의집",
        description: "소형 가구 결제",
        cardLabel: "토스뱅크",
        amount: 78200,
        category: null,
        isClassified: false,
        matchedRuleLabel: null,
        tag: "신규 유입",
        source: "BANK",
      },
    ];

    washingTransactions = [...imported, ...washingTransactions];
    washingLastImportedAt = getCurrentTime();
    return dbWashing.getOverview();
  },
};

export const resetAllMocks = () => {
  resetSamples();
  resetUsers();
  resetWashingTransactions();
};
