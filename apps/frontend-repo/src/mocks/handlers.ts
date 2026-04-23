import { http, HttpResponse } from "msw";

interface Sample {
  id: number;
  message: string;
  status: string;
  urgent: boolean;
  updatedAt: string;
}

let nextId = 4;
let samples: Sample[] = [
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

const getCurrentTime = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

export const handlers = [
  http.get("/api/sample", () => {
    return HttpResponse.json(samples);
  }),

  http.get("/api/sample/error", () => {
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

  http.get("/api/sample/:id", ({ params }) => {
    const id = Number(params.id);
    const sample = samples.find(s => s.id === id);
    if (!sample) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(sample);
  }),

  http.post("/api/sample", async ({ request }) => {
    const data = await request.json() as any;
    const newSample: Sample = {
      id: nextId++,
      message: data.message,
      status: "ACTIVE",
      urgent: false,
      updatedAt: getCurrentTime(),
    };
    samples.push(newSample);
    return new HttpResponse(null, { status: 201 });
  }),

  http.put("/api/sample/:id", async ({ params, request }) => {
    const id = Number(params.id);
    const data = await request.json() as any;
    const index = samples.findIndex(s => s.id === id);
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    samples[index] = {
      ...samples[index],
      message: data.message,
      updatedAt: getCurrentTime(),
    };
    return HttpResponse.json(samples[index]);
  }),

  http.patch("/api/sample/:id", async ({ params, request }) => {
    const id = Number(params.id);
    const data = await request.json() as any;
    const index = samples.findIndex(s => s.id === id);
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    samples[index] = {
      ...samples[index],
      ...(data.message !== undefined && { message: data.message }),
      ...(data.status !== undefined && { status: data.status }),
      updatedAt: getCurrentTime(),
    };
    return HttpResponse.json(samples[index]);
  }),

  http.delete("/api/sample/:id", ({ params }) => {
    const id = Number(params.id);
    const index = samples.findIndex(s => s.id === id);
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    samples.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
