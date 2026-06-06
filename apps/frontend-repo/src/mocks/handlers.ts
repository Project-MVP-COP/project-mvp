import { delay, http, HttpResponse } from "msw";
import { db, dbUser, dbWashing } from "./db";

const IS_TEST = import.meta.env.MODE === "test";

export const handlers = [
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
        detail: "강제로 발생시키는 비즈니스 예외 테스트입니다.",
        instance: "/api/sample/error",
        errorCode: "SAMPLE_LIMIT_EXCEEDED",
      },
      { status: 400 },
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
    const data = (await request.json()) as Record<string, unknown>;
    const newSample = db.create({ message: data.message as string });
    return HttpResponse.json(newSample, { status: 201 });
  }),

  http.put("/api/sample/:id", async ({ params, request }) => {
    if (!IS_TEST) await delay();
    const id = Number(params.id);
    const data = (await request.json()) as Record<string, unknown>;
    const updated = db.update(id, { message: data.message as string });

    if (!updated) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(updated);
  }),

  http.patch("/api/sample/:id", async ({ params, request }) => {
    if (!IS_TEST) await delay();
    const id = Number(params.id);
    const data = (await request.json()) as Record<string, unknown>;
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

  http.get("/api/washing/overview", async () => {
    if (!IS_TEST) await delay();
    return HttpResponse.json(dbWashing.getOverview());
  }),

  http.post("/api/washing/bulk-classify", async ({ request }) => {
    if (!IS_TEST) await delay();
    const body = (await request.json()) as {
      ids?: number[];
      category?: string;
    };

    if (!body.category || !Array.isArray(body.ids) || body.ids.length === 0) {
      return HttpResponse.json(
        {
          type: "about:blank",
          title: "Bad Request",
          status: 400,
          detail: "일괄 세척 대상과 카테고리가 필요합니다.",
          instance: "/api/washing/bulk-classify",
          errorCode: "WASH001",
        },
        { status: 400 },
      );
    }

    return HttpResponse.json(dbWashing.bulkClassify(body.ids, body.category));
  }),

  http.patch(
    "/api/washing/transactions/:id/category",
    async ({ params, request }) => {
      if (!IS_TEST) await delay();
      const id = Number(params.id);
      const body = (await request.json()) as { category?: string | null };
      const updated = dbWashing.updateCategory(id, body.category ?? null);

      if (!updated) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json(updated);
    },
  ),

  http.post("/api/washing/import-mock", async () => {
    if (!IS_TEST) await delay();
    return HttpResponse.json(dbWashing.importMockBatch(), { status: 201 });
  }),

  http.post("/api/auth/register", async ({ request }) => {
    if (!IS_TEST) await delay();
    const body = (await request.json()) as {
      loginId: string;
      nickname: string;
      password?: string;
    };

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
        { status: 400 },
      );
    }

    const created = dbUser.create({
      loginId: body.loginId,
      nickname: body.nickname,
      password: body.password,
    });

    return HttpResponse.json(created, { status: 201 });
  }),

  http.post("/api/auth/login", async ({ request }) => {
    if (!IS_TEST) await delay();
    const body = (await request.json()) as {
      loginId: string;
      password?: string;
    };

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
        { status: 401 },
      );
    }

    return HttpResponse.json(
      {
        accessToken: `mock-jwt-token-for-${user.loginId}`,
        nickname: user.nickname,
      },
      { status: 200 },
    );
  }),

  http.get("/api/user/me", async ({ request }) => {
    if (!IS_TEST) await delay();
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer mock-jwt-token-for-")) {
      return HttpResponse.json(
        {
          type: "about:blank",
          title: "Unauthorized",
          status: 401,
          detail: "인증 토큰이 없거나 유효하지 않습니다.",
          instance: "/api/user/me",
          errorCode: "ATH003",
        },
        { status: 401 },
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
          detail: "사용자를 찾을 수 없거나 탈퇴했습니다.",
          instance: "/api/user/me",
          errorCode: "ATH002",
        },
        { status: 401 },
      );
    }

    return HttpResponse.json(
      {
        id: user.id,
        loginId: user.loginId,
        nickname: user.nickname,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      { status: 200 },
    );
  }),

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
        { status: 401 },
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
        { status: 404 },
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
