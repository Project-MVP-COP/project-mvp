/**
 * [가상 데이터베이스]
 * 
 * MSW 핸들러와 테스트 코드에서 공유하는 인메모리 데이터 저장소입니다.
 * 핸들러(인터셉터)와 상태 관리 로직을 분리하여 구조적 명확성을 확보합니다.
 */

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

let nextId = 4;
let samples: Sample[] = [...INITIAL_SAMPLES];

const getCurrentTime = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

/**
 * DB 상태를 초기화합니다. (테스트의 beforeEach 등에서 사용)
 */
export const resetSamples = () => {
  samples = [...INITIAL_SAMPLES];
  nextId = 4;
};

/**
 * 데이터 접근 및 조작 메서드
 */
export const db = {
  getAll: () => samples,
  
  getById: (id: number) => samples.find((s) => s.id === id),
  
  create: (data: { message: string }) => {
    const newSample: Sample = {
      id: nextId++,
      message: data.message,
      status: "ACTIVE",
      urgent: false,
      updatedAt: getCurrentTime(),
    };
    samples.push(newSample);
    return newSample;
  },
  
  update: (id: number, data: { message: string }) => {
    const index = samples.findIndex((s) => s.id === id);
    if (index === -1) return null;
    
    samples[index] = {
      ...samples[index],
      message: data.message,
      updatedAt: getCurrentTime(),
    };
    return samples[index];
  },
  
  patch: (id: number, data: Partial<Sample>) => {
    const index = samples.findIndex((s) => s.id === id);
    if (index === -1) return null;
    
    samples[index] = {
      ...samples[index],
      ...data,
      updatedAt: getCurrentTime(),
    };
    return samples[index];
  },
  
  delete: (id: number) => {
    const index = samples.findIndex((s) => s.id === id);
    if (index === -1) return false;
    samples.splice(index, 1);
    return true;
  },
};

/**
 * [가상 사용자 데이터베이스]
 */
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

// 기존 resetSamples에 사용자 목록 초기화도 결합
const originalResetSamples = resetSamples;
export const resetAllMocks = () => {
  originalResetSamples();
  resetUsers();
};

export const dbUser = {
  getAll: () => users,
  
  findByLoginId: (loginId: string) => users.find((u) => u.loginId === loginId),
  
  create: (data: { loginId: string; nickname: string; password?: string }) => {
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
    const index = users.findIndex((u) => u.loginId === loginId);
    if (index === -1) return false;
    users[index] = {
      ...users[index],
      status: "deleted",
    };
    return true;
  },
};

