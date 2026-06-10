# Agent Instructions — myproject

> 이 프로젝트의 코드를 생성·수정할 때 반드시 준수해야 할 규칙입니다.

## Tech Stack

Java 21 · Spring Boot 4 · MyBatis · H2 (로컬) / PostgreSQL (prod) · Spring Security · JWT (JJWT 0.13) · Lombok · Gradle

Base package: `com.example.demo`

---

## CRITICAL RULES (위반 시 아키텍처 붕괴)

### 1. NEVER use Setter on domain models

```java
// ❌ FORBIDDEN
user.setStatus("deleted");

// ✅ REQUIRED — 도메인 메서드 사용
User deleted = user.delete();
User loggedIn = user.login();
```

`@Builder(access = AccessLevel.PRIVATE)` — 외부 빌더 호출 금지.
DTOs(`TransactionDto` 등 웹 계층 객체)는 Setter 허용.

### 2. NEVER create cross-domain dependencies (역방향)

```
auth → user ✅
user → auth ❌
transaction → common ✅
common → transaction ❌
```

### 3. NEVER return ResponseEntity from controllers

```java
// ❌ FORBIDDEN
return ResponseEntity.ok(data);
return ResponseEntity.notFound().build();

// ✅ REQUIRED — 순수 DTO 직접 반환 + @ResponseStatus
@GetMapping("/{id}")
public TransactionDto findById(@PathVariable Long id) { ... }

@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public TransactionDto add(...) { ... }
```

에러는 `GlobalExceptionHandler`가 RFC 9457 ProblemDetail로 자동 변환합니다.

### 4. NEVER handle exceptions in controllers

```java
// ❌ FORBIDDEN
try { service.update(id, dto); }
catch (Exception e) { return ResponseEntity.badRequest().build(); }

// ✅ REQUIRED
throw new BusinessException(CommonErrorCode.ENTITY_NOT_FOUND);
```

### 5. NEVER use JPA/Hibernate annotations

```java
// ❌ FORBIDDEN
@Entity @Table @Column @Id @GeneratedValue

// ✅ REQUIRED — MyBatis XML 매핑
// src/main/resources/mapper/{domain}/{Domain}Mapper.xml
```

### 6. NEVER bypass the Repository interface pattern

```java
// ❌ FORBIDDEN — Service가 Mapper 직접 사용
@Autowired private TransactionMapper transactionMapper;

// ✅ REQUIRED — Service → Repository(interface) → RepositoryImpl → Mapper
// (단, transaction 도메인은 현재 Mapper 직접 사용 중 — 추후 리팩토링 대상)
```

### 7. ALWAYS extract userId from @AuthenticationPrincipal

```java
// ❌ FORBIDDEN
private static final Long DUMMY_USER_ID = 1L;

// ✅ REQUIRED
@GetMapping
public List<TransactionDto> findAll(@AuthenticationPrincipal User currentUser) {
    return service.findAll(currentUser.getId());
}
```

---

## Package Structure

```
com.example.demo/
├── common/
│   └── exception/       # ErrorCode(I), CommonErrorCode, BusinessException, GlobalExceptionHandler
├── user/
│   ├── controller/      # UserController (향후)
│   ├── service/         # User (도메인 모델), UserService
│   ├── repository/      # UserRepository(I), UserRepositoryImpl, UserMapper
│   └── exception/       # UserErrorCode
├── auth/
│   ├── config/          # SecurityConfig
│   ├── controller/      # AuthController, RegisterRequest, LoginRequest, AuthResponse
│   ├── service/         # AuthService, JwtProvider, JwtAuthenticationFilter
│   └── exception/       # AuthErrorCode
├── transaction/         # TransactionController, TransactionService, TransactionMapper
├── category/            # CategoryController, CategoryMapper
├── chart/               # ChartController, ChartMapper
└── excel/               # ExcelController, ExcelService
resources/
├── mapper/
│   ├── user/UserMapper.xml
│   ├── TransactionMapper.xml
│   └── ChartMapper.xml
├── schema.sql / data.sql
├── application.yml      # 기본 설정 (jwt.secret 환경변수 참조)
└── application-local.yml # H2 로컬 설정
```

**계층 의존 방향**: `controller` → `service` → `repository` (역방향 금지)

---

## Auth Architecture

- JWT는 `Authorization: Bearer <token>` 헤더로 전달
- `JwtAuthenticationFilter`가 토큰 검증 후 `SecurityContextHolder`에 `User` 객체 세팅
- Controller에서 `@AuthenticationPrincipal User currentUser`로 현재 사용자 추출
- `currentUser.getId()`를 Service에 전달 — Service는 Security 레이어에 의존하지 않음

```java
// 회원가입
POST /api/auth/register  { loginId, nickname, password }  → 201

// 로그인
POST /api/auth/login     { loginId, password }  → { accessToken, nickname }

// 인증 필요 API
Authorization: Bearer <accessToken>
```

---

## Error Handling (RFC 9457)

| 상황 | 처리 방법 |
|:-----|:----------|
| 비즈니스 예외 | `throw new BusinessException(ErrorCode)` |
| 404 | `throw new BusinessException(CommonErrorCode.ENTITY_NOT_FOUND)` |
| Validation 실패 | `@Valid` → `GlobalExceptionHandler`가 자동 변환 |
| 새 에러 코드 | 도메인별 `{Domain}ErrorCode` enum에 `ErrorCode` 인터페이스 구현 |

---

## MyBatis Rules

- **결과 매핑**: 불변 도메인(User)은 `<constructor>` 매핑 사용 (Setter 주입 금지)
- **SQL 위치**: `resources/mapper/{domain}/{Domain}Mapper.xml`
- **사용자 필터**: 모든 조회 쿼리는 반드시 `WHERE ... user_id = #{userId}` 포함

---

## HTTP Method & Status Code Convention

| 작업 | Method | 상태 코드 | 응답 |
|:-----|:-------|:----------|:-----|
| 목록/단건 조회 | `GET` | `200 OK` | DTO / List |
| 생성 | `POST` | `201 Created` | DTO 또는 void |
| 수정 | `PUT /{id}` | `200 OK` | DTO |
| 삭제 | `DELETE /{id}` | `204 No Content` | void |

---

## Commands

```bash
./gradlew bootRun   # H2 로컬 서버 실행 (http://localhost:8080)
./gradlew test      # 전체 테스트
./gradlew build     # 빌드
```
