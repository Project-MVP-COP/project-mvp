# Agile MVP Project

본 프로젝트는 Spring Boot 기반의 백엔드 애플리케이션으로, 개발시 참고할 수 있는 레퍼런스 예시로 `sample` 패키지를 포함하고 있습니다.

## 🛠️ 기술 스택
- **언어**: Java 25
- **프레임워크**: Spring Boot 4
- **ORM / 데이터베이스 접근**: MyBatis
- **데이터베이스**: H2 데이터베이스 (로컬/테스트 환경), 추후 PostgreSQL 적용 예정
- **빌드 툴**: Gradle

## 📦 주요 프로젝트 의존성 (Dependencies)
`build.gradle`에 명시된 주요 라이브러리 및 의존성은 다음과 같습니다.

- **Spring Boot Starter WebMVC** (`spring-boot-starter-webmvc`): 웹 애플리케이션(REST API 등) 개발을 위한 핵심 모듈
- **Spring Boot Starter Validation** (`spring-boot-starter-validation`): 객체 검증(Validation)을 위한 기능 제공
- **MyBatis Spring Boot Starter** (`mybatis-spring-boot-starter:4.0.1`): MyBatis와 Spring Boot 연동을 위한 스타터 모듈
- **H2 Database** (`com.h2database:h2`): 로컬 및 테스트 환경을 위한 인메모리 데이터베이스
  - `spring-boot-h2console`: H2 DB 접근을 위한 웹 콘솔 제공
- **Lombok** (`org.projectlombok:lombok`): 어노테이션 기반 보일러플레이트 코드 자동 생성
- **Spring Boot DevTools** (`spring-boot-devtools`): 개발 편의성(자동 재시작 등) 제공 기능
- **Test 라이브러리**: Validation, WebMVC, MyBatis 전용 테스트 모듈 및 JUnit Platform 지원
- **SpringDoc OpenAPI** (`springdoc-openapi-starter-webmvc-ui:3.0.3`): Swagger UI를 통한 API 문서화 및 테스트 도구 제공

## 🚀 실행 및 테스트 방법

### 1. 애플리케이션 실행
프로젝트 루트 디렉토리에서 다음 명령어를 통해 애플리케이션을 기동합니다.
```bash
./gradlew bootRun
```

### 2. 테스트 실행 및 리포트 확인
전체 단위 및 통합 테스트를 수행하고 결과 리포트를 확인할 수 있습니다.
```bash
# 전체 테스트 실행
./gradlew test

# 테스트 리포트 확인 (명령 실행 후)
# build/reports/tests/test/index.html
```

### 3. API 호출 테스트
API 테스트 도구 (Postman 등) 또는 웹 브라우저를 통해 다음 URL로 요청을 호출하여 동작을 확인할 수 있습니다.
- **Read (목록 조회)**: `GET http://localhost:8080/api/sample/hello?name=사용자`
- **Create (생성)**: `POST http://localhost:8080/api/sample` (Body: `{ "message": "새로운 메세지" }`)
- **Update (수정)**: `PUT http://localhost:8080/api/sample/1` (Body: `{ "message": "수정된 메세지" }`)
- **Delete (삭제)**: `DELETE http://localhost:8080/api/sample/1`
- **전역 예외 처리 테스트**: `GET http://localhost:8080/api/sample/error`

---

## 📂 프로젝트 구조 (Project Structure)

```text
.
├── src
│   ├── main
│   │   ├── java
│   │   │   └── cop.kbds.agilemvp
│   │   │       ├── common (공통 아키텍처 및 유효성 검증)
│   │   │       └── sample (3계층 구조의 레퍼런스 패키지)
│   │   └── resources
│   │       ├── mapper (MyBatis 쿼리 XML)
│   │       ├── application.yml (설정 파일)
│   │       └── schema.sql / data.sql (DB 초기화 스크립트)
│   └── test
│       └── java (단위 및 통합 테스트 코드)
├── build.gradle (빌드 설정 및 의존성)
└── README.md (프로젝트 문서)
```

---

## 📘 API 문서 (Swagger UI)
본 프로젝트는 Swagger(SpringDoc)를 사용하여 API를 문서화하고 있습니다. 애플리케이션 실행 후 아래 URL을 통해 API 명세를 확인하고 직접 테스트해 볼 수 있습니다.

- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI Spec (JSON)**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)


## 🏷️ 공통 API 응답 규격 및 표준 에러 처리 (API Response & Error Code)

클라이언트가 예측 가능하고 일관된 포맷으로 데이터를 받을 수 있도록 `ApiResponse` 구조를 설계하여 제공합니다. 더불어, 단순 HTTP 상태 코드만으로는 알 수 없는 다양한 비즈니스 예외 상황을 세분화하여 다루기 위해 표준 에러 코드(Error Code) 시스템을 도입했습니다.

### 1. 표준 에러 코드 규격 (`ErrorCode`)
도메인별로 확장 가능한 에러 처리를 위해 `ErrorCode` 인터페이스를 제공하고 구현체(Enum)를 통해 일관된 에러 정보를 강제합니다.
- **위치**: `cop.kbds.agilemvp.common.exception.ErrorCode`
- **강제 스펙**:
  - `getHttpStatus()`: 통신 규격을 위한 `HttpStatus` 객체
  - `getCode()`: 클라이언트에게 노출될 비즈니스 에러 식별 코드 (예: `"COM001"`, `"USR001"`)
  - `getMessage()`: 에러에 대한 상세 메시지 (로깅 및 클라이언트 노출용)

### 2. API 응답 규격 (`ApiResponse`)
- **위치**: `cop.kbds.agilemvp.common.api.ApiResponse`
- **응답 구조**:
  - `success` (`boolean`): API 호출 성공 여부 (`true`/`false`)
  - `errorCode` (`String`): 비즈니스 에러 식별 코드 (성공 시 `null`, 실패 시 에러 코드 문자열)
  - `message` (`String`): 클라이언트에게 전달할 메시지 (성공 기본 메시지, 에러 상세 원인 등)
  - `data` (`T`): 실제 비즈니스 응답 데이터 (제네릭 타입 지원)
    - **성공 시**: 요청한 결과 데이터가 포함됩니다.
    - **실패 시**: `traceId`를 포함한 객체가 기본으로 반환되며, 유효성 검사 실패 시 상세 에러 내역(`details`)이 포함될 수 있습니다.
- **주요 특징**: 상태나 정보의 무분별한 조작을 막기 위해 완전한 불변 객체(Java `record`)로 구현되었습니다.
- **아키텍처 규칙**: 의존성 역전 원칙(DIP)을 준수하기 위해 데이터베이스 로직(Mapper)이나 도메인 영역에 종속시키지 않고, 오직 웹 계층(Controller)의 최종 응답 반환 단계에서만 데이터를 감싸는(Wrapping) 용도로 제한하여 사용합니다.

#### 📝 JSON 응답 예시 (클라이언트 전달 포맷)
프론트엔드/모바일 클라이언트는 항상 아래와 같이 예측 가능한 형태의 JSON을 전달받게 됩니다.
```json
// 정상 호출 (성공)
{
  "success": true,
  "errorCode": null,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": [
    { "message": "사용자님, Hello World" },
    { "message": "사용자님, [URGENT] System Down ASAP!" }
  ]
}

// 비즈니스 예외 발생 (에러)
{
  "success": false,
  "errorCode": "COM003",
  "message": "요청한 데이터를 찾을 수 없습니다.",
  "data": {
    "traceId": "550e8400-e29b-41d4-a716-446655440000"
  }
}

// 유효성 검사 실패 (에러 상세 포함)
{
  "success": false,
  "errorCode": "COM001",
  "message": "입력 값이 올바르지 않습니다.",
  "data": {
    "traceId": "550e8400-e29b-41d4-a716-446655440000",
    "details": {
      "email": "올바른 이메일 형식이 아닙니다.",
      "name": "이름은 필수입니다."
    }
  }
}
```

### 3. 👩‍💻 개발자 가이드 (단위 업무 개발 시)
AOP 기반 전역 처리가 적용되어 있으므로, 개발 시 핵심 비즈니스 로직에만 집중하시면 됩니다!
- **정상 응답 시**: 컨트롤러(`Controller`)에서 별도의 포장 객체(`ApiResponse`) 생성 없이 **순수한 데이터 타입(DTO, List 등)만 반환**하세요. (알아서 공통 포맷으로 변환됩니다)
- **예외 발생 시**: 로직 처리 중 통제 가능한 에러 상황에 직면하면 예외만 던지세요. (`throw new BusinessException(CommonErrorCode.COM001);`) 나머지는 전역 예외 처리기가 담당합니다.

## 🛠️ 공통 유틸리티 사용 가이드

모든 유틸리티는 순수 Java 25 API를 기반으로 작성되었습니다.

### 1. DateTimeUtil
다양한 날짜/시간 입력을 `LocalDateTime`으로 변환하거나 포맷팅합니다.
```java
// String to LocalDateTime
LocalDateTime ldt = DateTimeUtil.toLocalDateTime("2026-04-17 22:00:00");

// Date Range 체크 (Record 활용)
DateTimeUtil.DateRange range = new DateTimeUtil.DateRange(start, end);
boolean isInside = range.contains(target);
```

### 2. StringUtil
문자열 조작 및 마스킹 처리를 제공합니다.
```java
// 문자열 마스킹
String masked = StringUtil.mask("010-1234-5678", 4, 8); // "010-****-5678"

// 안전한 자르기
String truncated = StringUtil.truncate("Too long text here", 10); // "Too lon..."
```

### 3. NumberUtil
안전한 BigDecimal 연산 및 포맷팅을 제공합니다.
```java
// 안전한 나눗셈 (기본 소수점 2자리, 반올림)
BigDecimal result = NumberUtil.divide(new BigDecimal("10"), new BigDecimal("3"));

// 통화 포맷팅
String krw = NumberUtil.formatCurrency(1500); // "₩1,500"
```

### 4. CollectionUtil
컬렉션 조작 및 null-safe한 처리를 제공합니다.
```java
// SequencedCollection (첫 번째/마지막 요소)
String first = CollectionUtil.getFirst(list);
String last = CollectionUtil.getLast(list);

// null-safe 리스트
List<String> safeList = CollectionUtil.emptyIfNull(maybeNullList);
```

### 5. BusinessValidator
서비스 계층에서 비즈니스 로직을 가독성 있게 검증합니다.
```java
// Fluent API 스타일 검증
BusinessValidator.validate(user.isActive())
    .throwIfFalse(CommonErrorCode.INVALID_INPUT_VALUE, "활성화된 사용자만 접근 가능합니다.");

// 원샷 검증
BusinessValidator.validateNonNull(order, CommonErrorCode.ENTITY_NOT_FOUND);
```

## 🔍 로깅 및 트레이싱 (Logging & Tracing)

애플리케이션의 가시성을 높이고 문제 생성을 추적하기 위해 모든 요청에 고유한 **Trace ID**를 부여하고 요청/응답 시점을 자동 로깅합니다.

### 1. Trace ID 활용 전략
- **생성 방식**: 요청당 1개의 고유한 UUID를 생성합니다.
- **MDC (Mapped Diagnostic Context)**: 생성된 ID는 SLF4J MDC에 `traceId`라는 키로 저장되어, 해당 요청 내에서 발생하는 모든 로그에 자동으로 포함됩니다.
- **응답 헤더**: 클라이언트가 로그를 조회하거나 문의할 때 활용할 수 있도록 응답 헤더(`X-Trace-Id`)에 해당 ID를 포함시켜 반환합니다.

### 2. 요청/응답 자동 로깅
`LoggingFilter`를 통해 다음과 같이 표준화된 로깅을 수행합니다.
- **[REQUEST]**: HTTP 메서드, 요청 URI, 클라이언트 IP
- **[RESPONSE]**: HTTP 메서드, 요청 URI, 상태 코드, 실행 시간(ms)

#### 📝 로그 출력 예시
실제 콘솔에는 다음과 같은 형식으로 출력됩니다.
```text
2026-04-17 12:00:00.001  INFO [22c3da25-...] --- [nio-8080-exec-1] c.k.a.common.filter.LoggingFilter : [REQUEST] GET /api/sample/hello from 127.0.0.1
2026-04-17 12:00:00.015  DEBUG [22c3da25-...] --- [nio-8080-exec-1] c.k.a.sample.service.SampleService : Hello messages retrieved.
2026-04-17 12:00:00.020  INFO [22c3da25-...] --- [nio-8080-exec-1] c.k.a.common.filter.LoggingFilter : [RESPONSE] GET /api/sample/hello status:200 (19ms)
```

## 📂 Sample 패키지 구조 및 상세 아키텍처

`cop.kbds.agilemvp.sample` 패키지는 관습적인 3계층(웹, 애플리케이션, 인프라) 구조로 구성된 레퍼런스 코드입니다.

### 1. 웹 계층 (`controller`)
*   **`SampleController`**: HTTP 요청 매핑 및 응답 반환. `GlobalResponseAdvice`에 의해 `ApiResponse`로 자동 래핑됩니다.
*   **`SampleRequest` / `SampleResponse`**: 데이터 전송 객체(DTO). Java **`record`**를 활용한 불변 객체입니다.

### 2. 애플리케이션 / 도메인 계층 (`service`)
*   **`SampleService`**: 비즈니스 로직 조율. `SampleRepository` 인터페이스에만 의존하여 기술 환경 변화에 대응(DIP)합니다.
*   **`Sample` (Domain Model)**:
    *   초기에는 `record`였으나 ID 자동 생성 및 생명주기 관리를 위해 **일반 Class**로 전환되었습니다.
    *   **Self-Validation**: 생성 시점에 유효성을 스스로 검증합니다.
    *   **Anemic Model 방지**: `isUrgent()`, `getFormattedMessage()` 등 도메인 로직을 내부에 캡슐화하고 있습니다.

### 3. 인프라 / DB 계층 (`repository`)
*   **`SampleRepository`**: 애플리케이션 계층에서 정의한 영속성 인터페이스.
*   **`SampleRepositoryImpl`**: MyBatis(`SampleMapper`)를 사용하는 실제 구현체(Adapter).
*   **`SampleMapper.java` & `SampleMapper.xml`**: SQL 매핑 및 실행.
    *   `Sample`이 불변 속성을 유지할 수 있도록 `<constructor>` 매핑을 통해 결과를 주입합니다.

    ```xml
    <mapper namespace="cop.kbds.agilemvp.sample.repository.SampleMapper">
        <resultMap id="SampleResultMap" type="cop.kbds.agilemvp.sample.service.Sample">
            <constructor>
                <arg column="id" javaType="long"/>
                <arg column="message" javaType="string"/>
            </constructor>
        </resultMap>

        <select id="getHelloMessages" resultMap="SampleResultMap">
            SELECT id, message FROM temp
        </select>
    </mapper>
    ```

