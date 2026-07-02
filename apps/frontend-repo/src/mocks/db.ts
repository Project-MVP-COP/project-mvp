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
  ledgerId?: number;
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

const INITIAL_WASHING_TRANSACTIONS: WashingTransactionRecord[] = [];

const INITIAL_WASHING_META_BY_LEDGER_ID: Record<
  number,
  Pick<WashingTransactionRecord, "tag" | "matchedRuleLabel" | "source">
> = {
  16: { tag: "??", matchedRuleLabel: "??: ???? -> ??", source: "CARD" },
  17: { tag: "??", matchedRuleLabel: null, source: "CARD" },
  18: { tag: "??", matchedRuleLabel: "??: ?????? -> ??", source: "CARD" },
  19: { tag: "?????", matchedRuleLabel: null, source: "CARD" },
  20: { tag: "OTT", matchedRuleLabel: "??: ???? -> ??", source: "CARD" },
  21: { tag: "PG", matchedRuleLabel: null, source: "BANK" },
  22: { tag: "?????", matchedRuleLabel: null, source: "CARD" },
};

let nextWashingId = 108;
let washingTransactions: WashingTransactionRecord[] = [];
let washingLastImportedAt = "2026-06-06 18:30:00";

const inferWashingSource = (
  cardName: string,
): WashingTransactionRecord["source"] =>
  cardName === "????" ? "BANK" : "CARD";

const isLedgerTransactionClassified = (tx: LedgerTransaction) =>
  tx.categoryId != null || !!tx.categoryName;

const buildWashingTransactionFromLedger = (
  tx: LedgerTransaction,
  previous?: WashingTransactionRecord,
): WashingTransactionRecord => {
  const seed = INITIAL_WASHING_META_BY_LEDGER_ID[tx.id];
  const isClassified = isLedgerTransactionClassified(tx);

  return {
    id: tx.id,
    occurredAt: tx.transactionDate,
    merchantName: tx.merchant,
    description: tx.memo ?? "",
    cardLabel: tx.cardName,
    amount: tx.amount,
    category: tx.categoryName ?? null,
    isClassified,
    matchedRuleLabel: previous?.matchedRuleLabel ?? seed?.matchedRuleLabel ?? null,
    tag:
      previous?.tag ??
      seed?.tag ??
      (isClassified ? "?? ??" : "?? ?? ??"),
    source: previous?.source ?? seed?.source ?? inferWashingSource(tx.cardName),
    ledgerId: tx.id,
  };
};

const syncWashingTransactionsFromLedger = () => {
  const previousByLedgerId = new Map(
    washingTransactions
      .filter(
        (
          transaction,
        ): transaction is WashingTransactionRecord & { ledgerId: number } =>
          transaction.ledgerId != null,
      )
      .map((transaction) => [transaction.ledgerId, transaction]),
  );

  washingTransactions = ledgerTransactions.map((tx) =>
    buildWashingTransactionFromLedger(tx, previousByLedgerId.get(tx.id)),
  );
};

export const resetWashingTransactions = () => {
  washingTransactions = [...INITIAL_WASHING_TRANSACTIONS];
  nextWashingId = 108;
  washingLastImportedAt = "2026-06-06 18:30:00";
  syncWashingTransactionsFromLedger();
};

export const dbWashing = {
  getOverview: () => {
    syncWashingTransactionsFromLedger();
    return {
      categories: [...WASHING_CATEGORIES],
      transactions: [...washingTransactions],
      lastImportedAt: washingLastImportedAt,
    };
  },

  bulkClassify: (ids: number[], category: string) => {
    washingTransactions = washingTransactions.map((transaction) =>
      ids.includes(transaction.id)
        ? {
            ...transaction,
            category,
            isClassified: true,
            matchedRuleLabel: null,
            tag: "?? ?? ??",
          }
        : transaction,
    );

    ledgerTransactions = ledgerTransactions.map((transaction) =>
      ids.includes(transaction.id)
        ? {
            ...transaction,
            categoryName: category,
          }
        : transaction,
    );

    syncWashingTransactionsFromLedger();
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
        category === null ? null : washingTransactions[index].matchedRuleLabel,
      tag: category === null ? "?? ?? ??" : washingTransactions[index].tag,
    };

    const ledgerId = washingTransactions[index].ledgerId;
    if (ledgerId != null) {
      const ledgerIndex = ledgerTransactions.findIndex((tx) => tx.id == ledgerId);
      if (ledgerIndex !== -1) {
        ledgerTransactions[ledgerIndex] = {
          ...ledgerTransactions[ledgerIndex],
          categoryId:
            category === null ? null : ledgerTransactions[ledgerIndex].categoryId,
          categoryName: category,
        };
      }
    }

    syncWashingTransactionsFromLedger();
    washingLastImportedAt = getCurrentTime();
    return washingTransactions.find((transaction) => transaction.id === id) ?? null;
  },

  addFromLedger: (tx: LedgerTransaction) => {
    syncWashingTransactionsFromLedger();
    return (
      washingTransactions.find((transaction) => transaction.ledgerId === tx.id) ??
      buildWashingTransactionFromLedger(tx)
    );
  },

  importMockBatch: () => {
    const today = new Date().toISOString().slice(0, 10);
    const imported: WashingTransactionRecord[] = [
      {
        id: nextWashingId++,
        occurredAt: `${today} 08:08`,
        merchantName: "??MGC??",
        description: "??? ??",
        cardLabel: "?? Zero",
        amount: 3900,
        category: null,
        isClassified: false,
        matchedRuleLabel: null,
        tag: "?? ??",
        source: "CARD",
      },
      {
        id: nextWashingId++,
        occurredAt: `${today} 19:48`,
        merchantName: "????",
        description: "?? ?? ??",
        cardLabel: "????",
        amount: 78200,
        category: null,
        isClassified: false,
        matchedRuleLabel: null,
        tag: "?? ??",
        source: "BANK",
      },
    ];

    washingTransactions = [...imported, ...washingTransactions];
    washingLastImportedAt = getCurrentTime();
    return dbWashing.getOverview();
  },
};

export interface LedgerCategory {
  id: number;
  name: string;
  color: string;
  displayOrder: number;
  isDefault: boolean;
}

export interface LedgerTransaction {
  id: number;
  userId: number;
  transactionDate: string;
  merchant: string;
  categoryId: number | null;
  categoryName: string | null;
  amount: number;
  cardName: string;
  installment: number;
  status: "승인" | "취소";
  memo: string | null;
}

const LEDGER_CATEGORIES: LedgerCategory[] = [
  { id: 1, name: "식음료", color: "#f97316", displayOrder: 10, isDefault: true },
  { id: 2, name: "쇼핑", color: "#8b5cf6", displayOrder: 20, isDefault: true },
  { id: 3, name: "교통", color: "#3b82f6", displayOrder: 30, isDefault: true },
  { id: 4, name: "의료/건강", color: "#ef4444", displayOrder: 40, isDefault: true },
  { id: 5, name: "문화/여가", color: "#ec4899", displayOrder: 50, isDefault: true },
  { id: 6, name: "편의점", color: "#10b981", displayOrder: 60, isDefault: true },
  { id: 7, name: "주유", color: "#6b7280", displayOrder: 70, isDefault: true },
  { id: 8, name: "통신", color: "#06b6d4", displayOrder: 80, isDefault: true },
  { id: 9, name: "교육", color: "#f59e0b", displayOrder: 90, isDefault: true },
  { id: 10, name: "기타", color: "#64748b", displayOrder: 100, isDefault: true },
];

const INITIAL_LEDGER_TRANSACTIONS: LedgerTransaction[] = [
  // 2026-05
  { id: 1,  userId: 1, transactionDate: "2026-05-02", merchant: "GS25 역삼점",        categoryId: 6,    categoryName: "편의점",   amount: 3800,  cardName: "신한 Deep",   installment: 1, status: "승인", memo: "간식" },
  { id: 2,  userId: 1, transactionDate: "2026-05-05", merchant: "현대자동차 주유소",   categoryId: 7,    categoryName: "주유",     amount: 82000, cardName: "현대 Zero",   installment: 1, status: "승인", memo: "주유 풀탱크" },
  { id: 3,  userId: 1, transactionDate: "2026-05-07", merchant: "에이블리",           categoryId: null, categoryName: null,       amount: 34500, cardName: "삼성 taptap", installment: 1, status: "승인", memo: null },
  { id: 4,  userId: 1, transactionDate: "2026-05-09", merchant: "서울아산병원",       categoryId: 4,    categoryName: "의료/건강", amount: 15000, cardName: "KB국민카드",  installment: 1, status: "승인", memo: "외래 진료" },
  { id: 5,  userId: 1, transactionDate: "2026-05-12", merchant: "메가박스 코엑스",    categoryId: 5,    categoryName: "문화/여가", amount: 28000, cardName: "현대 Zero",   installment: 1, status: "승인", memo: "영화 2인" },
  { id: 6,  userId: 1, transactionDate: "2026-05-14", merchant: "KT 통신요금",        categoryId: 8,    categoryName: "통신",     amount: 55000, cardName: "토스뱅크",    installment: 1, status: "승인", memo: "5월 통신비" },
  { id: 7,  userId: 1, transactionDate: "2026-05-16", merchant: "배달의민족",         categoryId: null, categoryName: null,       amount: 31500, cardName: "신한 Deep",   installment: 1, status: "승인", memo: "저녁 배달" },
  { id: 8,  userId: 1, transactionDate: "2026-05-19", merchant: "이마트 역삼점",      categoryId: 1,    categoryName: "식음료",   amount: 74200, cardName: "삼성 taptap", installment: 1, status: "승인", memo: "주간 장보기" },
  { id: 9,  userId: 1, transactionDate: "2026-05-21", merchant: "카카오택시",         categoryId: 3,    categoryName: "교통",     amount: 8900,  cardName: "토스뱅크",    installment: 1, status: "승인", memo: null },
  { id: 10, userId: 1, transactionDate: "2026-05-22", merchant: "유데미",             categoryId: 9,    categoryName: "교육",     amount: 19800, cardName: "KB국민카드",  installment: 1, status: "승인", memo: "React 강의" },
  { id: 11, userId: 1, transactionDate: "2026-05-24", merchant: "다이소 강남점",      categoryId: null, categoryName: null,       amount: 12000, cardName: "신한 Deep",   installment: 1, status: "승인", memo: null },
  { id: 12, userId: 1, transactionDate: "2026-05-26", merchant: "스타벅스 선릉점",    categoryId: 1,    categoryName: "식음료",   amount: 9500,  cardName: "현대 Zero",   installment: 1, status: "승인", memo: "카페 미팅" },
  { id: 13, userId: 1, transactionDate: "2026-05-28", merchant: "쿠팡",              categoryId: null, categoryName: null,       amount: 56300, cardName: "삼성 taptap", installment: 1, status: "승인", memo: "생활용품" },
  { id: 14, userId: 1, transactionDate: "2026-05-29", merchant: "롯데시네마 건대",    categoryId: 5,    categoryName: "문화/여가", amount: 14000, cardName: "KB국민카드",  installment: 1, status: "승인", memo: null },
  { id: 15, userId: 1, transactionDate: "2026-05-30", merchant: "서울교통공사",       categoryId: 3,    categoryName: "교통",     amount: 1450,  cardName: "신한 Deep",   installment: 1, status: "승인", memo: "후불 교통" },
  // 2026-06
  { id: 16, userId: 1, transactionDate: "2026-06-01", merchant: "스타벅스 성수역점",  categoryId: 1,    categoryName: "식음료",   amount: 11200, cardName: "현대 Zero",   installment: 1, status: "승인", memo: "아메리카노 외 1건" },
  { id: 17, userId: 1, transactionDate: "2026-06-01", merchant: "배달의민족",         categoryId: null, categoryName: null,       amount: 26800, cardName: "신한 Deep",   installment: 1, status: "승인", memo: "저녁 주문" },
  { id: 18, userId: 1, transactionDate: "2026-06-02", merchant: "서울교통공사",       categoryId: 3,    categoryName: "교통",     amount: 1450,  cardName: "신한 Deep",   installment: 1, status: "승인", memo: "후불 교통" },
  { id: 19, userId: 1, transactionDate: "2026-06-02", merchant: "쿠팡",              categoryId: null, categoryName: null,       amount: 38700, cardName: "삼성 taptap", installment: 1, status: "승인", memo: "생활용품 구매" },
  { id: 20, userId: 1, transactionDate: "2026-06-03", merchant: "넷플릭스",          categoryId: 5,    categoryName: "문화/여가", amount: 17000, cardName: "현대 Zero",   installment: 1, status: "승인", memo: "정기결제" },
  { id: 21, userId: 1, transactionDate: "2026-06-03", merchant: "네이버페이",         categoryId: null, categoryName: null,       amount: 53000, cardName: "토스뱅크",    installment: 1, status: "승인", memo: "결제대행" },
  { id: 22, userId: 1, transactionDate: "2026-06-04", merchant: "올리브영",          categoryId: 2,    categoryName: "쇼핑",     amount: 21400, cardName: "삼성 taptap", installment: 1, status: "승인", memo: "건강용품" },
  { id: 23, userId: 1, transactionDate: "2026-06-05", merchant: "GS주유소 강남",      categoryId: 7,    categoryName: "주유",     amount: 91000, cardName: "현대 Zero",   installment: 1, status: "승인", memo: null },
  { id: 24, userId: 1, transactionDate: "2026-06-06", merchant: "당근마켓",           categoryId: null, categoryName: null,       amount: 45000, cardName: "토스뱅크",    installment: 1, status: "승인", memo: "중고 거래" },
  { id: 25, userId: 1, transactionDate: "2026-06-07", merchant: "교보문고 강남점",    categoryId: 9,    categoryName: "교육",     amount: 27500, cardName: "KB국민카드",  installment: 1, status: "승인", memo: "개발 서적" },
  { id: 26, userId: 1, transactionDate: "2026-06-08", merchant: "맥도날드 역삼점",    categoryId: 1,    categoryName: "식음료",   amount: 9800,  cardName: "신한 Deep",   installment: 1, status: "승인", memo: "점심" },
  { id: 27, userId: 1, transactionDate: "2026-06-09", merchant: "무신사",            categoryId: null, categoryName: null,       amount: 62000, cardName: "삼성 taptap", installment: 3, status: "승인", memo: "봄 의류" },
  { id: 28, userId: 1, transactionDate: "2026-06-10", merchant: "세브란스병원",       categoryId: 4,    categoryName: "의료/건강", amount: 22000, cardName: "KB국민카드",  installment: 1, status: "승인", memo: "치과 치료" },
  { id: 29, userId: 1, transactionDate: "2026-06-11", merchant: "CU 선릉역점",       categoryId: 6,    categoryName: "편의점",   amount: 5200,  cardName: "토스뱅크",    installment: 1, status: "승인", memo: null },
  { id: 30, userId: 1, transactionDate: "2026-06-11", merchant: "T머니",             categoryId: 3,    categoryName: "교통",     amount: 50000, cardName: "신한 Deep",   installment: 1, status: "취소", memo: "충전 취소" },
];

let ledgerTransactions: LedgerTransaction[] = [...INITIAL_LEDGER_TRANSACTIONS];
let nextLedgerId = 31;
syncWashingTransactionsFromLedger();

export const resetLedgerTransactions = () => {
  ledgerTransactions = [...INITIAL_LEDGER_TRANSACTIONS];
  nextLedgerId = 31;
  syncWashingTransactionsFromLedger();
};

export const dbLedger = {
  getAll: () => [...ledgerTransactions],

  getById: (id: number) => ledgerTransactions.find((tx) => tx.id === id) ?? null,

  update: (id: number, data: Partial<LedgerTransaction>) => {
    const index = ledgerTransactions.findIndex((tx) => tx.id === id);
    if (index === -1) return null;
    ledgerTransactions[index] = { ...ledgerTransactions[index], ...data };
    syncWashingTransactionsFromLedger();
    return ledgerTransactions[index];
  },

  reset: () => {
    resetLedgerTransactions();
    return [...ledgerTransactions];
  },

  delete: (id: number) => {
    const index = ledgerTransactions.findIndex((tx) => tx.id === id);
    if (index === -1) return false;
    ledgerTransactions.splice(index, 1);
    syncWashingTransactionsFromLedger();
    return true;
  },

  bulkAdd: (items: Omit<LedgerTransaction, "id">[]) => {
    const added: LedgerTransaction[] = [];
    for (const item of items) {
      const isDuplicate = ledgerTransactions.some(
        (tx) =>
          tx.userId === item.userId &&
          tx.transactionDate === item.transactionDate &&
          tx.merchant === item.merchant &&
          tx.amount === item.amount &&
          tx.cardName === item.cardName,
      );
      if (!isDuplicate) {
        const newTx: LedgerTransaction = { ...item, id: nextLedgerId++ };
        ledgerTransactions.push(newTx);
        added.push(newTx);
      }
    }
    syncWashingTransactionsFromLedger();
    return added;
  },

  getCategories: () => [...LEDGER_CATEGORIES].sort((a, b) => a.displayOrder - b.displayOrder),
};

export const resetAllMocks = () => {
  resetSamples();
  resetUsers();
  resetWashingTransactions();
  resetLedgerTransactions();
};
