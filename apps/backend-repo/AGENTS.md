# Backend Agent Instructions

> 이 프로젝트의 백엔드 코드를 생성·수정할 때 반드시 준수해야 할 규칙입니다.
> 상세 아키텍처: `README.md`

## Tech Stack

Java 25 · Spring Boot 4 · MyBatis · H2 (로컬) / PostgreSQL (prod) · Spring Security · JWT (JJWT 0.13) · Lombok · SpringDoc OpenAPI 3 · Gradle

Base package: `cop.kbds.agilemvp`

---

## CRITICAL RULES (위반 시 아키텍처 붕괴)

### 1. NEVER use Setter on domain models

```java
// ❌ FORBIDDEN
sample.setMessage("new");
sample.setStatus("INACTIVE");

// ✅ REQUIRED — 정적 팩토리 메서드 또는 도메인 메서드 사용
Sample sample = Sample.create("message");            // 생성
Sample patched = existing.applyPatch(newMsg, newSts); // 부분 수정
```

`@Builder(access = AccessLevel.PRIVATE)` — 외부 빌더 호출 금지.

### 2. NEVER create cross-domain dependencies (역방향)

```java
// ❌ FORBIDDEN — User가 Auth를 참조
import cop.kbds.agilemvp.auth.service.AuthService; // user 패키지에서

// ✅ 허용 방향
// auth → user ✅ (AuthService가 UserService 호출)
// user → auth ❌
// sample → auth ❌
// {domain} → common ✅
// common → {domain} ❌
```

### 3. NEVER return wrapper objects from controllers

```java
// ❌ FORBIDDEN — ResponseEntity 또는 공통 래퍼로 감싸기
return ResponseEntity.ok(new ApiResponse<>(data));
return new CommonResponse<>(200, "success", data);

// ✅ REQUIRED — 순수 DTO 직접 반환 + @ResponseStatus
@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public void create(@RequestBody @Valid CreateRequest req) { ... }

@GetMapping("/{id}")
public SampleResponse getById(@PathVariable("id") Long id) { ... }
```

에러는 `GlobalExceptionHandler`가 RFC 9457 ProblemDetail로 자동 변환합니다.

### 4. NEVER handle exceptions in controllers

```java
// ❌ FORBIDDEN — 컨트롤러에서 try-catch
try { service.create(req); }
catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }

// ✅ REQUIRED — 예외를 던지면 GlobalExceptionHandler가 처리
throw new BusinessException(CommonErrorCode.ENTITY_NOT_FOUND);
throw new BusinessException(SampleErrorCode.SAMPLE_LIMIT_EXCEEDED, "커스텀 메시지");
```

### 5. NEVER use JPA/Hibernate annotations

```java
// ❌ FORBIDDEN
@Entity @Table @Column @Id @GeneratedValue

// ✅ REQUIRED — MyBatis XML 매핑 사용
// src/main/resources/mapper/{domain}/{Domain}Mapper.xml
```

### 6. NEVER bypass the Repository interface pattern

```java
// ❌ FORBIDDEN — Service가 Mapper를 직접 사용
@Autowired private SampleMapper sampleMapper;

// ✅ REQUIRED — Service → Repository(interface) → RepositoryImpl → Mapper
private final SampleRepository sampleRepository; // 인터페이스에만 의존
```

---

## Package Structure

```
cop.kbds.agilemvp/
├── common/                          # 공통 인프라 (모든 도메인이 의존)
│   ├── annotation/                  #   @FeatureToggle
│   ├── config/                      #   FeatureToggleConfig, SwaggerConfig
│   ├── exception/                   #   ErrorCode(I), CommonErrorCode, BusinessException, GlobalExceptionHandler
│   ├── filter/                      #   LoggingFilter (Trace ID + 요청/응답 로깅)
│   └── util/                        #   DateTimeUtil, StringUtil, NumberUtil, CollectionUtil, BusinessValidator
├── {domain}/                        # 도메인별 패키지 (sample, user, auth …)
│   ├── controller/                  #   Controller, Request DTOs (record), Response DTO (record)
│   ├── service/                     #   DomainModel (class), DomainService
│   ├── repository/                  #   Repository(interface), RepositoryImpl, Mapper(interface)
│   └── exception/                   #   DomainErrorCode (enum implements ErrorCode)
resources/
├── mapper/{domain}/                 # MyBatis XML
├── schema.sql / data.sql           # H2 초기화
├── application.yml                  # 기본 (H2)
└── application-prod.yml             # 운영 (PostgreSQL, 환경변수 참조)
```

**계층 의존 방향**: `controller` → `service` → `repository` (역방향 금지)

---

## New Domain Boilerplate

새 도메인 추가 시 `sample` 패키지를 참조합니다. 아래 파일들을 생성하세요.

### controller/{Domain}Controller.java

```java
@Tag(name = "{domain}", description = "{domain} API")
@RestController
@RequestMapping("/api/{domain}")
@RequiredArgsConstructor
public class {Domain}Controller {
    private final {Domain}Service {domain}Service;

    @GetMapping
    public List<{Domain}Response> getAll() { ... }

    @GetMapping("/{id}")
    public {Domain}Response getById(@PathVariable("id") Long id) { ... }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void create(@RequestBody @Valid {Domain}CreateRequest request) { ... }

    @PutMapping("/{id}")
    public {Domain}Response update(@PathVariable("id") Long id,
                                   @RequestBody @Valid {Domain}UpdateRequest request) { ... }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") Long id) { ... }
}
```

### controller/{Domain}CreateRequest.java (record)

```java
public record {Domain}CreateRequest(
    @NotBlank(message = "필수 입력값입니다.")
    String name
) {}
```

### controller/{Domain}Response.java (record)

```java
public record {Domain}Response(
    Long id,
    String name,
    @Schema(allowableValues = {"ACTIVE", "INACTIVE"})
    String status,
    String createdAt
) {
    public static {Domain}Response from({Domain} entity) {
        return new {Domain}Response(entity.getId(), entity.getName(), ...);
    }
}
```

### service/{Domain}.java (Domain Model)

```java
@Getter
@Builder(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class {Domain} {
    @Setter(AccessLevel.PRIVATE)
    private Long id;
    private String name;
    private String status;

    // 정적 팩토리 메서드 (유일한 생성 경로)
    public static {Domain} create(String name) {
        validate(name);
        return {Domain}.builder().name(name).status("ACTIVE").build();
    }

    // MyBatis <constructor> 매핑용 생성자
    public {Domain}(Long id, String name, String status, ...) { ... }

    // 부분 수정 (PATCH)
    public {Domain} applyPatch(String newName, String newStatus) { ... }

    // Self-validation
    private static void validate(String name) {
        if (name == null || name.isBlank())
            throw new BusinessException({Domain}ErrorCode.INVALID_NAME);
    }
}
```

### repository/{Domain}Repository.java (Interface)

```java
public interface {Domain}Repository {
    List<{Domain}> findAll();
    {Domain} findById(Long id);
    void save({Domain} entity);
    void update({Domain} entity);
    void patch({Domain} entity);
    void deleteById(Long id);
}
```

### repository/{Domain}RepositoryImpl.java

```java
@Repository
@RequiredArgsConstructor
public class {Domain}RepositoryImpl implements {Domain}Repository {
    private final {Domain}Mapper {domain}Mapper;
    // 각 메서드에서 Mapper 위임
}
```

### exception/{Domain}ErrorCode.java

```java
@Getter
@RequiredArgsConstructor
public enum {Domain}ErrorCode implements ErrorCode {
    // DOMAIN_ERROR_NAME(HttpStatus, "CODE", "메시지");
    INVALID_NAME(HttpStatus.BAD_REQUEST, "DOM001", "유효하지 않은 이름입니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public String getName() { return this.name(); }
}
```

### resources/mapper/{domain}/{Domain}Mapper.xml

```xml
<mapper namespace="cop.kbds.agilemvp.{domain}.repository.{Domain}Mapper">
    <resultMap id="{Domain}ResultMap" type="cop.kbds.agilemvp.{domain}.service.{Domain}">
        <constructor>
            <arg column="id"   javaType="long"/>
            <arg column="name" javaType="string"/>
            <arg column="status" javaType="string"/>
        </constructor>
    </resultMap>

    <select id="findAll" resultMap="{Domain}ResultMap">
        SELECT id, name, status FROM {table}
    </select>

    <!-- PATCH: Dynamic SQL -->
    <update id="patch">
        UPDATE {table}
        <set>
            <if test="name != null">name = #{name},</if>
            <if test="status != null">status = #{status},</if>
            updated_at = CURRENT_TIMESTAMP
        </set>
        WHERE id = #{id}
    </update>
</mapper>
```

---

## Error Handling (RFC 9457)

| 상황 | 처리 방법 |
|:-----|:----------|
| 비즈니스 예외 | `throw new BusinessException(ErrorCode)` 또는 `throw new BusinessException(ErrorCode, "커스텀 메시지")` |
| Validation 실패 | `@Valid` + `@NotBlank` 등 → `GlobalExceptionHandler`가 `errors` 맵으로 자동 변환 |
| 404 Not Found | `throw new BusinessException(CommonErrorCode.ENTITY_NOT_FOUND)` |
| 새 에러 코드 | 도메인별 `{Domain}ErrorCode` enum에 추가 (`ErrorCode` 인터페이스 구현) |

**ProblemDetail 응답 필드**: `type`(URN) · `title`(에러 이름) · `status` · `detail`(메시지) · `instance`(요청 URI) · `traceId` · `errors`(Validation 시)

---

## DTO Rules

| 구분 | 규칙 |
|:-----|:-----|
| **타입** | Java `record` 사용 |
| **Request DTO** | `@NotBlank` 등 Bean Validation 적극 사용, 한글 에러 메시지 필수 |
| **Response DTO** | `from(DomainModel)` 정적 팩토리 메서드 필수, 날짜는 `String` 포맷팅 |
| **Enum 전달** | `@Schema(allowableValues = {"ACTIVE", "INACTIVE"})` 명시 (프론트엔드 타입 생성 연동) |
| **PATCH DTO** | 모든 필드 nullable, `@Valid` 없이 사용 |
| **위치** | `controller` 패키지 내 (DTO는 웹 계층 소속) |

---

## HTTP Method & Status Code Convention

| 작업 | Method | 상태 코드 | 응답 |
|:-----|:-------|:----------|:-----|
| 목록 조회 | `GET` | `200 OK` | DTO List |
| 단건 조회 | `GET /{id}` | `200 OK` | DTO |
| 생성 | `POST` | `201 Created` | void |
| 전체 수정 | `PUT /{id}` | `200 OK` | DTO |
| 부분 수정 | `PATCH /{id}` | `200 OK` | DTO |
| 삭제 | `DELETE /{id}` | `204 No Content` | void |

> **MVP 기본 전략**: `PUT`을 기본 수정 메서드로 사용. `PATCH`는 단일 상태 변경 등 제한적으로 사용.

---

## MyBatis Rules

- **결과 매핑**: 불변 도메인 유지를 위해 `<constructor>` 매핑 사용 (Setter 주입 금지)
- **SQL 위치**: `resources/mapper/{domain}/{Domain}Mapper.xml`
- **PATCH SQL**: `<if test="field != null">` Dynamic SQL로 null이 아닌 필드만 UPDATE
- **Camel Case**: `application.yml`의 `map-underscore-to-camel-case: true` 설정 적용

---

## Database Migration & Schema Modification Rules (Flyway)

데이터베이스의 모든 스키마 변경(테이블 추가, 컬럼 변경, 인덱스 추가 등) 및 공통 참조 데이터 변경은 **Flyway 마이그레이션 파일**을 통해서만 수행해야 합니다. **기존 마이그레이션 파일의 내용을 절대 임의로 수정하거나 삭제하지 마십시오.**

### 1. 새 마이그레이션 파일 작성 규칙
- **위치**: `src/main/resources/db/migration/` 하위에 작성합니다.
- **파일명 형식**: `V{Version}__{Description}.sql` 
  - 버전 번호와 설명 사이에는 반드시 **두 개의 언더스코어(`__`)**를 사용해야 합니다.
  - 버전 번호는 순차적으로 증가해야 합니다 (예: `V3__add_user_age_column.sql`, `V4__create_orders_table.sql`).
- **SQL 작성 유의사항**:
  - **기존 데이터 보존**: 기존 데이터를 파괴하는 `DROP TABLE`, `DROP COLUMN` 등은 원칙적으로 금지하며, 불가피한 경우 이전/백업 대책을 마련해야 합니다.
  - **멱등성 및 충돌 방지**: 데이터를 삽입할 경우 중복 키 오류가 나지 않도록 `WHERE NOT EXISTS` 등을 활용하십시오.
    - 예: `INSERT INTO table_name (col1) SELECT 'val1' WHERE NOT EXISTS (SELECT 1 FROM table_name WHERE col1 = 'val1');`
  - **종결 문자**: SQL 구문의 마지막에는 세미콜론(`;`)을 누락하지 마십시오.

### 2. 스키마 변경 절차
1. **버전 결정**: `db/migration` 폴더 내의 가장 마지막 버전 번호를 확인하고, 그 다음 번호를 부여합니다. (예: 최신 파일이 `V2`이면 `V3`으로 작성)
2. **SQL 작성**: DDL 또는 DML 구문을 작성합니다.
3. **로컬 검증**: `./gradlew test` 및 `./gradlew bootRun`을 실행하여 Flyway가 마이그레이션을 정상적으로 적용하는지 로그를 확인합니다.
4. **PR / Merge**: 메인 브랜치에 병합되면 배포 시 자동으로 운영 환경에 반영됩니다. (운영 환경에 테이블이 이미 가동 중이어도 `baseline-on-migrate: true`에 의해 안전하게 신규 버전만 순차 적용됩니다.)

### 3. 로컬 전용 테스트 시드 데이터 추가
- 개발 혹은 로컬 테스트에만 필요한 데이터(더미 계정, 목업 레코드 등)는 `src/main/resources/db/migration_dev/` 하위에 `V999__dev_seeds.sql` 등 900번대 이후의 큰 버전 번호로 관리합니다. 이 경로의 파일은 운영 배포 환경에서는 절대 실행되지 않습니다.

---

## Feature Flag

미완성 엔드포인트는 `@FeatureToggle`로 숨기고 main에 병합합니다.

```java
@FeatureToggle("domain.endpoint-name")  // feature.toggle.domain.endpoint-name
@GetMapping("/new-feature")
public void newFeature() { ... }
```

```yaml
# application.yml
feature:
  toggle:
    domain:
      endpoint-name: false  # true일 때만 활성화, 아니면 404
```

---

## Swagger / OpenAPI

- 컨트롤러에 `@Tag(name = "domain")` 필수 (프론트엔드 코드 생성 연동)
- Enum은 `@Schema(allowableValues = {...})` 필수
- 필수값은 `@NotBlank`, `@NotNull` 등으로 명세 반영
- 문서 확인: `http://localhost:8080/swagger-ui.html`

---

## Test Patterns

| 테스트 대상 | 방법 | 집중도 |
|:------------|:-----|:-------|
| Domain Model | 순수 단위 테스트 (JUnit) | **높음** (100% 커버리지 목표) |
| Service | 단위 테스트 + Mock Repository | 중간 |
| Controller | `@WebMvcTest` + MockMvc | 핵심 시나리오만 |
| Util | 순수 단위 테스트 | 높음 |

```java
// Domain 테스트 예시
@Test
void create_정상_생성() {
    Sample sample = Sample.create("Hello");
    assertThat(sample.getStatus()).isEqualTo("ACTIVE");
}

@Test
void create_빈_메시지_예외() {
    assertThatThrownBy(() -> Sample.create(""))
        .isInstanceOf(BusinessException.class);
}
```

---

## Common Utilities

| 유틸 | 주요 기능 |
|:-----|:----------|
| `DateTimeUtil` | `toLocalDateTime(String)`, `DateRange.contains()` |
| `StringUtil` | `mask()`, `truncate()` |
| `NumberUtil` | `divide()` (BigDecimal 안전), `formatCurrency()` |
| `CollectionUtil` | `getFirst()`, `getLast()`, `emptyIfNull()` |
| `BusinessValidator` | `validate(condition).throwIfFalse(ErrorCode)`, `validateNonNull()` |

---

## Key File Paths

| 파일 | 역할 |
|:-----|:-----|
| `common/exception/ErrorCode.java` | 에러 코드 표준 인터페이스 |
| `common/exception/CommonErrorCode.java` | 시스템 공통 에러 (COM001~006) |
| `common/exception/GlobalExceptionHandler.java` | RFC 9457 전역 예외 처리 |
| `common/exception/BusinessException.java` | 비즈니스 예외 클래스 |
| `common/filter/LoggingFilter.java` | Trace ID + 요청/응답 로깅 |
| `common/annotation/FeatureToggle.java` | Feature Flag 어노테이션 |
| `common/config/SwaggerConfig.java` | OpenAPI 설정 |
| `resources/application.yml` | 기본 설정 (H2) |
| `resources/application-prod.yml` | 운영 설정 (PostgreSQL, 환경변수) |
| `resources/schema.sql` | DDL 스크립트 |
| `build.gradle` | 의존성 및 빌드 설정 |

## Commands

```
./gradlew bootRun     # 개발 서버 실행 (H2)
./gradlew test        # 전체 테스트 실행
./gradlew build       # 빌드 (테스트 포함)
```
