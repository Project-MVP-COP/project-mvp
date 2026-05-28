import { http, HttpResponse, delay } from "msw";
import { db, dbUser } from "./db";

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

