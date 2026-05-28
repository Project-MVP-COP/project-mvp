import { http, HttpResponse, delay } from "msw";
import { db, dbUser } from "./db";
import type { TransactionDto } from "@/features/history/model/types";

const IS_TEST = import.meta.env.MODE === "test";

// mutable: POST /api/transactions/bulk 핸들러에서 push 가능
const MOCK_TRANSACTIONS: TransactionDto[] = [
  { id:1,  transactionDate:'2026-01-02', merchant:'스타벅스',      categoryName:'식음료',    amount:6500,   cardName:'신한카드', installment:1,  status:'승인' },
  { id:2,  transactionDate:'2026-01-03', merchant:'쿠팡',          categoryName:'쇼핑',      amount:38900,  cardName:'국민카드', installment:1,  status:'승인' },
  { id:3,  transactionDate:'2026-01-05', merchant:'카카오택시',     categoryName:'교통',      amount:12300,  cardName:'삼성카드', installment:1,  status:'승인' },
  { id:4,  transactionDate:'2026-01-06', merchant:'맥도날드',       categoryName:'식음료',    amount:9800,   cardName:'신한카드', installment:1,  status:'승인' },
  { id:5,  transactionDate:'2026-01-07', merchant:'CU',            categoryName:'편의점',    amount:3200,   cardName:'현대카드', installment:1,  status:'승인' },
  { id:6,  transactionDate:'2026-01-08', merchant:'넷플릭스',       categoryName:'문화/여가', amount:17000,  cardName:'국민카드', installment:1,  status:'승인' },
  { id:7,  transactionDate:'2026-01-09', merchant:'SKT',           categoryName:'통신',      amount:55000,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:8,  transactionDate:'2026-01-10', merchant:'배달의민족',     categoryName:'식음료',    amount:24500,  cardName:'삼성카드', installment:1,  status:'승인' },
  { id:9,  transactionDate:'2026-01-11', merchant:'이마트',         categoryName:'쇼핑',      amount:67300,  cardName:'현대카드', installment:1,  status:'승인' },
  { id:10, transactionDate:'2026-01-12', merchant:'SK에너지',       categoryName:'주유',      amount:89000,  cardName:'우리카드', installment:1,  status:'승인' },
  { id:11, transactionDate:'2026-01-13', merchant:'세브란스병원',   categoryName:'의료/건강', amount:45000,  cardName:'국민카드', installment:1,  status:'승인' },
  { id:12, transactionDate:'2026-01-14', merchant:'GS25',          categoryName:'편의점',    amount:4700,   cardName:'삼성카드', installment:1,  status:'승인' },
  { id:13, transactionDate:'2026-01-15', merchant:'CGV',           categoryName:'문화/여가', amount:14000,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:14, transactionDate:'2026-01-16', merchant:'KTX',           categoryName:'교통',      amount:53000,  cardName:'현대카드', installment:1,  status:'승인' },
  { id:15, transactionDate:'2026-01-17', merchant:'무신사',         categoryName:'쇼핑',      amount:128000, cardName:'국민카드', installment:3,  status:'승인' },
  { id:16, transactionDate:'2026-01-18', merchant:'스타벅스',       categoryName:'식음료',    amount:13500,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:17, transactionDate:'2026-01-20', merchant:'클래스101',      categoryName:'교육',      amount:39000,  cardName:'삼성카드', installment:1,  status:'승인' },
  { id:18, transactionDate:'2026-01-21', merchant:'GS칼텍스',       categoryName:'주유',      amount:76000,  cardName:'우리카드', installment:1,  status:'승인' },
  { id:19, transactionDate:'2026-01-22', merchant:'쿠팡이츠',       categoryName:'식음료',    amount:18900,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:20, transactionDate:'2026-01-23', merchant:'애플프리미엄',   categoryName:'문화/여가', amount:14900,  cardName:'현대카드', installment:1,  status:'승인' },
  { id:21, transactionDate:'2026-01-24', merchant:'세븐일레븐',     categoryName:'편의점',    amount:5600,   cardName:'국민카드', installment:1,  status:'승인' },
  { id:22, transactionDate:'2026-01-25', merchant:'롯데백화점',     categoryName:'쇼핑',      amount:235000, cardName:'현대카드', installment:6,  status:'승인' },
  { id:23, transactionDate:'2026-01-26', merchant:'티머니',         categoryName:'교통',      amount:50000,  cardName:'우리카드', installment:1,  status:'승인' },
  { id:24, transactionDate:'2026-01-27', merchant:'자라베스',       categoryName:'쇼핑',      amount:43500,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:25, transactionDate:'2026-01-28', merchant:'인프런',         categoryName:'교육',      amount:59000,  cardName:'삼성카드', installment:1,  status:'승인' },
  { id:26, transactionDate:'2026-01-29', merchant:'맥도날드',       categoryName:'식음료',    amount:8700,   cardName:'신한카드', installment:1,  status:'취소' },
  { id:27, transactionDate:'2026-01-30', merchant:'KT',            categoryName:'통신',      amount:49000,  cardName:'국민카드', installment:1,  status:'승인' },
  { id:28, transactionDate:'2026-01-31', merchant:'네이버쇼핑',     categoryName:'쇼핑',      amount:52000,  cardName:'현대카드', installment:2,  status:'승인' },
  { id:29, transactionDate:'2026-02-01', merchant:'스타벅스',       categoryName:'식음료',    amount:7500,   cardName:'신한카드', installment:1,  status:'승인' },
  { id:30, transactionDate:'2026-02-02', merchant:'배달의민족',     categoryName:'식음료',    amount:31000,  cardName:'삼성카드', installment:1,  status:'승인' },
  { id:31, transactionDate:'2026-02-03', merchant:'카카오택시',     categoryName:'교통',      amount:8900,   cardName:'삼성카드', installment:1,  status:'승인' },
  { id:32, transactionDate:'2026-02-05', merchant:'이마트',         categoryName:'쇼핑',      amount:92000,  cardName:'현대카드', installment:1,  status:'승인' },
  { id:33, transactionDate:'2026-02-06', merchant:'CGV',           categoryName:'문화/여가', amount:28000,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:34, transactionDate:'2026-02-07', merchant:'SK에너지',       categoryName:'주유',      amount:95000,  cardName:'우리카드', installment:1,  status:'승인' },
  { id:35, transactionDate:'2026-02-08', merchant:'LG U+',         categoryName:'통신',      amount:62000,  cardName:'삼성카드', installment:1,  status:'승인' },
  { id:36, transactionDate:'2026-02-10', merchant:'쿠팡',          categoryName:'쇼핑',      amount:145000, cardName:'국민카드', installment:3,  status:'승인' },
  { id:37, transactionDate:'2026-02-11', merchant:'스타벅스',       categoryName:'식음료',    amount:12000,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:38, transactionDate:'2026-02-12', merchant:'세브란스병원',   categoryName:'의료/건강', amount:35000,  cardName:'국민카드', installment:1,  status:'승인' },
  { id:39, transactionDate:'2026-02-13', merchant:'GS25',          categoryName:'편의점',    amount:6100,   cardName:'삼성카드', installment:1,  status:'승인' },
  { id:40, transactionDate:'2026-02-14', merchant:'롯데백화점',     categoryName:'쇼핑',      amount:198000, cardName:'현대카드', installment:6,  status:'승인' },
  { id:41, transactionDate:'2026-02-15', merchant:'넷플릭스',       categoryName:'문화/여가', amount:17000,  cardName:'국민카드', installment:1,  status:'승인' },
  { id:42, transactionDate:'2026-02-16', merchant:'쿠팡이츠',       categoryName:'식음료',    amount:22400,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:43, transactionDate:'2026-02-17', merchant:'인프런',         categoryName:'교육',      amount:49000,  cardName:'삼성카드', installment:1,  status:'승인' },
  { id:44, transactionDate:'2026-02-18', merchant:'GS칼텍스',       categoryName:'주유',      amount:82000,  cardName:'우리카드', installment:1,  status:'승인' },
  { id:45, transactionDate:'2026-02-20', merchant:'CU',            categoryName:'편의점',    amount:4200,   cardName:'현대카드', installment:1,  status:'승인' },
  { id:46, transactionDate:'2026-02-21', merchant:'KTX',           categoryName:'교통',      amount:65000,  cardName:'현대카드', installment:1,  status:'승인' },
  { id:47, transactionDate:'2026-02-22', merchant:'자라베스의원',   categoryName:'의료/건강', amount:28000,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:48, transactionDate:'2026-02-23', merchant:'무신사',         categoryName:'쇼핑',      amount:78000,  cardName:'국민카드', installment:2,  status:'승인' },
  { id:49, transactionDate:'2026-02-24', merchant:'애플프리미엄',   categoryName:'문화/여가', amount:14900,  cardName:'현대카드', installment:1,  status:'승인' },
  { id:50, transactionDate:'2026-02-25', merchant:'세븐일레븐',     categoryName:'편의점',    amount:3800,   cardName:'국민카드', installment:1,  status:'승인' },
  { id:51, transactionDate:'2026-02-26', merchant:'네이버쇼핑',     categoryName:'쇼핑',      amount:34500,  cardName:'현대카드', installment:1,  status:'승인' },
  { id:52, transactionDate:'2026-02-27', merchant:'SKT',           categoryName:'통신',      amount:55000,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:53, transactionDate:'2026-02-28', merchant:'배달의민족',     categoryName:'식음료',    amount:28700,  cardName:'삼성카드', installment:1,  status:'취소' },
  { id:54, transactionDate:'2026-03-01', merchant:'스타벅스',       categoryName:'식음료',    amount:9000,   cardName:'신한카드', installment:1,  status:'승인' },
  { id:55, transactionDate:'2026-03-02', merchant:'카카오택시',     categoryName:'교통',      amount:15700,  cardName:'삼성카드', installment:1,  status:'승인' },
  { id:56, transactionDate:'2026-03-03', merchant:'쿠팡',          categoryName:'쇼핑',      amount:234000, cardName:'국민카드', installment:6,  status:'승인' },
  { id:57, transactionDate:'2026-03-04', merchant:'맥도날드',       categoryName:'식음료',    amount:11200,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:58, transactionDate:'2026-03-05', merchant:'SK에너지',       categoryName:'주유',      amount:102000, cardName:'우리카드', installment:1,  status:'승인' },
  { id:59, transactionDate:'2026-03-06', merchant:'세브란스병원',   categoryName:'의료/건강', amount:67000,  cardName:'국민카드', installment:1,  status:'승인' },
  { id:60, transactionDate:'2026-03-07', merchant:'GS25',          categoryName:'편의점',    amount:5100,   cardName:'삼성카드', installment:1,  status:'승인' },
  { id:61, transactionDate:'2026-03-08', merchant:'넷플릭스',       categoryName:'문화/여가', amount:17000,  cardName:'국민카드', installment:1,  status:'승인' },
  { id:62, transactionDate:'2026-03-09', merchant:'배달의민족',     categoryName:'식음료',    amount:35600,  cardName:'삼성카드', installment:1,  status:'승인' },
  { id:63, transactionDate:'2026-03-10', merchant:'이마트',         categoryName:'쇼핑',      amount:118000, cardName:'현대카드', installment:1,  status:'승인' },
  { id:64, transactionDate:'2026-03-11', merchant:'KT',            categoryName:'통신',      amount:49000,  cardName:'국민카드', installment:1,  status:'승인' },
  { id:65, transactionDate:'2026-03-12', merchant:'클래스101',      categoryName:'교육',      amount:55000,  cardName:'삼성카드', installment:1,  status:'승인' },
  { id:66, transactionDate:'2026-03-13', merchant:'GS칼텍스',       categoryName:'주유',      amount:88000,  cardName:'우리카드', installment:1,  status:'승인' },
  { id:67, transactionDate:'2026-03-14', merchant:'CGV',           categoryName:'문화/여가', amount:21000,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:68, transactionDate:'2026-03-15', merchant:'쿠팡이츠',       categoryName:'식음료',    amount:26800,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:69, transactionDate:'2026-03-16', merchant:'자라베스',       categoryName:'쇼핑',      amount:56000,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:70, transactionDate:'2026-03-17', merchant:'티머니',         categoryName:'교통',      amount:50000,  cardName:'우리카드', installment:1,  status:'승인' },
  { id:71, transactionDate:'2026-03-18', merchant:'무신사',         categoryName:'쇼핑',      amount:97000,  cardName:'국민카드', installment:2,  status:'승인' },
  { id:72, transactionDate:'2026-03-19', merchant:'세븐일레븐',     categoryName:'편의점',    amount:4400,   cardName:'국민카드', installment:1,  status:'승인' },
  { id:73, transactionDate:'2026-03-20', merchant:'애플프리미엄',   categoryName:'문화/여가', amount:14900,  cardName:'현대카드', installment:1,  status:'승인' },
  { id:74, transactionDate:'2026-03-21', merchant:'롯데백화점',     categoryName:'쇼핑',      amount:312000, cardName:'현대카드', installment:12, status:'승인' },
  { id:75, transactionDate:'2026-03-22', merchant:'스타벅스',       categoryName:'식음료',    amount:14500,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:76, transactionDate:'2026-03-23', merchant:'SKT',           categoryName:'통신',      amount:55000,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:77, transactionDate:'2026-03-24', merchant:'인프런',         categoryName:'교육',      amount:39000,  cardName:'삼성카드', installment:1,  status:'승인' },
  { id:78, transactionDate:'2026-03-25', merchant:'배달의민족',     categoryName:'식음료',    amount:42000,  cardName:'삼성카드', installment:1,  status:'승인' },
  { id:79, transactionDate:'2026-03-26', merchant:'CU',            categoryName:'편의점',    amount:7800,   cardName:'현대카드', installment:1,  status:'승인' },
  { id:80, transactionDate:'2026-03-27', merchant:'자라베스의원',   categoryName:'의료/건강', amount:32000,  cardName:'신한카드', installment:1,  status:'승인' },
  { id:81, transactionDate:'2026-03-28', merchant:'KTX',           categoryName:'교통',      amount:71000,  cardName:'현대카드', installment:1,  status:'승인' },
  { id:82, transactionDate:'2026-03-29', merchant:'네이버쇼핑',     categoryName:'쇼핑',      amount:45000,  cardName:'현대카드', installment:2,  status:'취소' },
  { id:83, transactionDate:'2026-03-30', merchant:'맥도날드',       categoryName:'식음료',    amount:8200,   cardName:'신한카드', installment:1,  status:'승인' },
];

export const handlers = [
  // ── 전체 조회 ──────────────────────────────────────────────────
  http.get('/api/transactions', async () => {
    if (!IS_TEST) await delay();
    return HttpResponse.json([...MOCK_TRANSACTIONS].sort(
      (a, b) => b.transactionDate.localeCompare(a.transactionDate),
    ));
  }),

  // ── 검색·필터·정렬·페이징 (서버사이드) ──────────────────────────
  http.get('/api/transactions/search', async ({ request }) => {
    if (!IS_TEST) await delay();
    const url = new URL(request.url);
    const p = Object.fromEntries(url.searchParams);

    let result = [...MOCK_TRANSACTIONS];

    if (p.dateStart) result = result.filter(t => t.transactionDate >= p.dateStart);
    if (p.dateEnd)   result = result.filter(t => t.transactionDate <= p.dateEnd);
    if (p.categoryName) result = result.filter(t => t.categoryName === p.categoryName);
    if (p.amountMin) result = result.filter(t => t.amount >= Number(p.amountMin));
    if (p.amountMax) result = result.filter(t => t.amount <= Number(p.amountMax));
    if (p.cardName)  result = result.filter(t => t.cardName === p.cardName);
    if (p.status)    result = result.filter(t => t.status === p.status);
    if (p.search)    result = result.filter(t => t.merchant.includes(p.search));

    const approved   = result.filter(t => t.status === '승인');
    const totalCount = result.length;
    const approvedCount  = approved.length;
    const cancelledCount = result.length - approvedCount;
    const totalAmount = approved.reduce((s, t) => s + t.amount, 0);

    const sortField = p.sortField ?? 'date';
    const sortOrder = p.sortOrder ?? 'desc';
    result.sort((a, b) => {
      let va: string | number, vb: string | number;
      if (sortField === 'amount')   { va = a.amount;          vb = b.amount; }
      else if (sortField === 'merchant') { va = a.merchant;   vb = b.merchant; }
      else                          { va = a.transactionDate; vb = b.transactionDate; }
      if (va < vb) return sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return sortOrder === 'asc' ? 1  : -1;
      return 0;
    });

    const page = Number(p.page ?? 0);
    const size = Number(p.size ?? 20);
    const pageData = result.slice(page * size, page * size + size);
    const hasMore  = page * size + size < totalCount;

    return HttpResponse.json({ totalCount, approvedCount, cancelledCount, totalAmount, hasMore, data: pageData });
  }),

  // ── 엑셀 업로드 (Step 1: 파싱) ──────────────────────────────────
  http.post('/api/excel/upload', async () => {
    if (!IS_TEST) await delay();
    const mockParsed: TransactionDto[] = [
      { id: 0, transactionDate: '2026-04-01', merchant: '스타벅스',  categoryName: '식음료', amount: 7500,  cardName: '신한카드', installment: 1, status: '승인' },
      { id: 0, transactionDate: '2026-04-02', merchant: '쿠팡',      categoryName: '쇼핑',   amount: 52000, cardName: '국민카드', installment: 1, status: '승인' },
      { id: 0, transactionDate: '2026-04-03', merchant: '카카오택시', categoryName: '교통',   amount: 9800,  cardName: '삼성카드', installment: 1, status: '승인' },
      { id: 0, transactionDate: '2026-04-04', merchant: 'GS25',      categoryName: '편의점', amount: 4200,  cardName: '현대카드', installment: 1, status: '승인' },
      { id: 0, transactionDate: '2026-04-05', merchant: '배달의민족', categoryName: '식음료', amount: 31000, cardName: '삼성카드', installment: 1, status: '승인' },
    ];
    return HttpResponse.json(mockParsed);
  }),

  // ── 일괄 추가 (Step 2: 저장, 중복 제거) ─────────────────────────
  http.post('/api/transactions/bulk', async ({ request }) => {
    if (!IS_TEST) await delay();
    const body = await request.json() as TransactionDto[];
    const maxId = MOCK_TRANSACTIONS.reduce((m, t) => Math.max(m, t.id), 0);
    let nextId = maxId + 1;
    const added: TransactionDto[] = [];

    for (const row of body) {
      const isDup = MOCK_TRANSACTIONS.some(
        t => t.transactionDate === row.transactionDate &&
             t.merchant === row.merchant &&
             t.amount === row.amount &&
             t.cardName === row.cardName,
      );
      if (isDup) continue;
      const newItem = { ...row, id: nextId++ };
      MOCK_TRANSACTIONS.push(newItem);
      added.push(newItem);
    }
    return HttpResponse.json(added);
  }),

  http.patch('/api/transactions/:id', async ({ params, request }) => {
    if (!IS_TEST) await delay();
    const id = Number(params.id);
    const body = await request.json() as Partial<TransactionDto>;
    const index = MOCK_TRANSACTIONS.findIndex(transaction => transaction.id === id);

    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const updated = {
      ...MOCK_TRANSACTIONS[index],
      ...body,
      id,
    };

    MOCK_TRANSACTIONS[index] = updated;
    return HttpResponse.json(updated);
  }),



  http.get("/api/sample", async () => {
    if (!IS_TEST) await delay();
    return HttpResponse.json(db.getAll());
  }),

  http.get("/api/sample/error", async () => {
    if (!IS_TEST) await delay();
    return HttpResponse.json(
      {
        type: "about:blank",
        title: "Bad Request",
        status: 400,
        detail: "강제로 발생시킨 비즈니스 예외 테스트입니다.",
        instance: "/api/sample/error",
        errorCode: "SAMPLE_LIMIT_EXCEEDED",
      },
      { status: 400 }
    );
  }),

  http.get("/api/sample/:id", async ({ params }) => {
    if (!IS_TEST) await delay();
    const id = Number(params.id);
    const sample = db.getById(id);
    if (!sample) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(sample);
  }),

  http.post("/api/sample", async ({ request }) => {
    if (!IS_TEST) await delay();
    const data = await request.json() as Record<string, unknown>;
    const newSample = db.create({ message: data.message as string });
    return HttpResponse.json(newSample, { status: 201 });
  }),

  http.put("/api/sample/:id", async ({ params, request }) => {
    if (!IS_TEST) await delay();
    const id = Number(params.id);
    const data = await request.json() as Record<string, unknown>;
    const updated = db.update(id, { message: data.message as string });
    
    if (!updated) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(updated);
  }),

  http.patch("/api/sample/:id", async ({ params, request }) => {
    if (!IS_TEST) await delay();
    const id = Number(params.id);
    const data = await request.json() as Record<string, unknown>;
    const updated = db.patch(id, data);
    
    if (!updated) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(updated);
  }),

  http.delete("/api/sample/:id", async ({ params }) => {
    if (!IS_TEST) await delay();
    const id = Number(params.id);
    const success = db.delete(id);
    
    if (!success) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return new HttpResponse(null, { status: 204 });
  }),

  // [POST] 회원 가입
  http.post("/api/auth/register", async ({ request }) => {
    if (!IS_TEST) await delay();
    const body = await request.json() as { loginId: string; nickname: string; password?: string };
    
    const existing = dbUser.findByLoginId(body.loginId);
    if (existing) {
      return HttpResponse.json(
        {
          type: "about:blank",
          title: "Bad Request",
          status: 400,
          detail: "이미 존재하거나 등록된 아이디입니다.",
          instance: "/api/auth/register",
          errorCode: "ATH004",
        },
        { status: 400 }
      );
    }

    const created = dbUser.create({
      loginId: body.loginId,
      nickname: body.nickname,
      password: body.password,
    });
    
    return HttpResponse.json(created, { status: 201 });
  }),

  // [POST] 로그인
  http.post("/api/auth/login", async ({ request }) => {
    if (!IS_TEST) await delay();
    const body = await request.json() as { loginId: string; password?: string };
    
    const user = dbUser.findByLoginId(body.loginId);
    if (!user || user.password !== body.password || user.status === "deleted") {
      return HttpResponse.json(
        {
          type: "about:blank",
          title: "Unauthorized",
          status: 401,
          detail: "잘못된 아이디 또는 비밀번호입니다.",
          instance: "/api/auth/login",
          errorCode: "ATH001",
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      accessToken: "mock-jwt-token-for-" + user.loginId,
      nickname: user.nickname,
    }, { status: 200 });
  }),

  // [GET] 본인 상세 정보 조회
  http.get("/api/user/me", async ({ request }) => {
    if (!IS_TEST) await delay();
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer mock-jwt-token-for-")) {
      return HttpResponse.json(
        {
          type: "about:blank",
          title: "Unauthorized",
          status: 401,
          detail: "인증 토큰이 누락되었거나 유효하지 않습니다.",
          instance: "/api/user/me",
          errorCode: "ATH003",
        },
        { status: 401 }
      );
    }

    const loginId = authHeader.replace("Bearer mock-jwt-token-for-", "");
    const user = dbUser.findByLoginId(loginId);
    
    if (!user || user.status === "deleted") {
      return HttpResponse.json(
        {
          type: "about:blank",
          title: "Unauthorized",
          status: 401,
          detail: "사용자를 찾을 수 없거나 탈퇴되었습니다.",
          instance: "/api/user/me",
          errorCode: "ATH002",
        },
        { status: 401 }
      );
    }

    // 비밀번호 필드를 제거한 순수 사용자 응답 객체 반환
    const userResponse = {
      id: user.id,
      loginId: user.loginId,
      nickname: user.nickname,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
    return HttpResponse.json(userResponse, { status: 200 });
  }),

  // [DELETE] 회원 탈퇴 (본인)
  http.delete("/api/user", async ({ request }) => {
    if (!IS_TEST) await delay();
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer mock-jwt-token-for-")) {
      return HttpResponse.json(
        {
          type: "about:blank",
          title: "Unauthorized",
          status: 401,
          detail: "인증 토큰이 유효하지 않습니다.",
          instance: "/api/user",
          errorCode: "ATH003",
        },
        { status: 401 }
      );
    }

    const loginId = authHeader.replace("Bearer mock-jwt-token-for-", "");
    const success = dbUser.delete(loginId);
    
    if (!success) {
      return HttpResponse.json(
        {
          type: "about:blank",
          title: "Not Found",
          status: 404,
          detail: "존재하지 않는 회원 정보입니다.",
          instance: "/api/user",
          errorCode: "USR001",
        },
        { status: 404 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),
];

