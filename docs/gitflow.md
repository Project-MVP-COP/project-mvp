# Git 협업 규칙

## 브랜치 전략

| 브랜치         | 용도                                   |   직접 push    |
| -------------- | -------------------------------------- | :------------: |
| main           | 운영 배포용. 항상 안정적인 코드만 존재 | 불가 (PR 필수) |
| CI/CD          | CI/CD 설정 전용 브랜치                 |      가능      |
| feature/기능명 | 새 기능 개발                           |      가능      |
| fix/버그명     | 버그 수정                              |      가능      |

## 커밋 메시지 규칙 (Angular Convention)

### 형식

```
타입(범위): 요약
```

### 타입 목록

| 타입     | 사용 상황                            |
| -------- | ------------------------------------ |
| feat     | 새로운 기능 추가                     |
| fix      | 버그 수정                            |
| docs     | 문서 수정                            |
| chore    | 빌드, 배포 설정 등 코드 외부 작업    |
| refactor | 기능 변화 없는 코드 구조 개선        |
| test     | 테스트 코드 추가/수정                |
| style    | 코드 포맷, 세미콜론 등 스타일만 변경 |

### 예시

```
feat(auth): JWT 로그인 기능 추가
fix(user): 회원가입 유효성 검사 오류 수정
docs: API 명세서 업데이트
chore(ci): GitHub Actions 배포 워크플로우 추가
refactor(user): 서비스 레이어 분리

# 기능 추가
git commit -m "feat(auth): JWT 로그인 기능 추가"
git commit -m "feat(user): 회원가입 API 구현"
git commit -m "feat: 메인 페이지 레이아웃 구성"

# 버그 수정
git commit -m "fix(auth): 토큰 만료 시 무한 리다이렉트 오류 수정"
git commit -m "fix(db): 유저 조회 시 NPE 발생 수정"

# CI/CD 작업 (주로 본인이 쓸 타입)
git commit -m "chore(ci): GitHub Actions 배포 워크플로우 추가"
git commit -m "chore(ci): deploy.sh /opt 경로로 변경"
git commit -m "chore(ci): Slack 알림 스텝 추가"

# 문서
git commit -m "docs: Git 협업 규칙 문서 추가"
git commit -m "docs: README 프로젝트 실행 방법 추가"

# 리팩토링
git commit -m "refactor(user): UserService 의존성 분리"

```

## PR 규칙

- main 브랜치는 PR + 승인 1개 이상 필수
- PR 제목도 커밋 메시지 규칙과 동일하게 작성
- PR 본문에 작업 내용, 변경 이유 간략히 작성

커밋 후 push

git add docs/gitflow.md
git commit -m "docs: Git 협업 규칙 및 커밋 컨벤션 문서 추가"
git push origin CI/CD
