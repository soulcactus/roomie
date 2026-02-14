# CLAUDE.md

이 문서는 Roomie 프로젝트의 로컬 작업 메모이자 협업 규칙 기록용입니다.

## 작업 원칙

- 프론트/백엔드 계약(응답 포맷, DTO 검증, 에러 코드) 우선 정합성 유지
- 기능 추가보다 실행 가능 상태(타입/빌드/테스트 통과) 우선
- 인증/보안 관련 변경은 흐름도와 함께 검토
- 커밋은 작업 단위로 작게 나누고, 한국어 메시지 + 본문 설명 유지
- 배포 환경(Render/Vercel)과 로컬 환경(Docker/pnpm) 설정 차이를 문서에 함께 기록

## 최근 아키텍처 결정

### 1) 인증 BFF 전환

- Frontend는 백엔드 직접 호출 대신 Next Route Handler 프록시 경유
- 파일: `apps/frontend/src/app/api/v1/[...path]/route.ts`
- 목적: 배포 도메인 분리(Vercel/Render) 상황에서 쿠키 인증 안정화
- 비고: 인증 실패/재발급/로그아웃은 BFF 경유 요청 + 클라이언트 `httpClient` 재발급 로직이 협업

### 2) 라우팅 가드 서버화

- 클라이언트 `useEffect` 기반 인증 가드를 최소화
- `middleware.ts` + 서버 레이아웃(`(auth)`, `dashboard`)에서 선제 처리
- 유효성 판별은 `session-server.ts`의 `/users/me` 확인 기준

### 3) 예약 충돌 방지 전략

- 클라이언트에서 1차 시간 겹침 검증
- 서버/DB에서 최종 충돌 차단
- PostgreSQL EXCLUDE 제약(`booking_no_overlap`) + 409 응답 매핑

### 4) 환경변수 정책 강화

- 백엔드/프론트의 주요 env fallback 제거
- 필수 env 누락 시 부팅 단계에서 즉시 실패하도록 변경
- 쿠키 `domain` 지정 제거(호스트 기본 정책 사용)

### 5) Swagger/Fastify 구성

- `@fastify/static` 설치 후 Swagger UI 정상 구동
- `ENABLE_SWAGGER_UI`로 환경별 토글

### 6) 타임라인 빈 상태 UX

- 시드/룸 데이터가 없을 때 타임라인 라인/행 렌더링 생략
- 흰색 패널 + 중앙 안내 메시지 노출

## 로컬 운영 체크리스트 (pnpm)

- Postgres 실행: `docker compose up -d postgres`
- DB 리셋/시드:  
  `pnpm --filter backend exec prisma db push --force-reset`  
  `pnpm --filter backend run prisma:seed`
- Frontend 타입 체크: `pnpm --filter frontend exec tsc --noEmit`
- Backend 테스트: `pnpm --filter backend test`

## 로컬 운영 체크리스트 (Docker Compose)

- 전체 기동: `docker compose up --build -d`
- 시드 주입: `docker compose exec backend pnpm --filter backend run prisma:seed`
- 참고:
  - backend 컨테이너는 `prisma db push` 기반으로 개발 DB 동기화
  - frontend 컨테이너 API 대상은 `http://backend:3001`

## 배포 메모 (Render)

- Build Command 하이픈은 반드시 ASCII `-` 사용
- Prisma CLI 필요 시 설치 옵션: `pnpm install --frozen-lockfile --prod=false`
- 초기 1회 빌드 예시:
  `pnpm install --frozen-lockfile --prod=false && pnpm --filter backend build && pnpm --filter backend exec prisma migrate deploy && pnpm --filter backend run prisma:seed`
- Keep-alive는 `.github/workflows/render-keepalive.yml` + `/api/v1/health` 기준

## 문서 관리

- README는 외부 공유용(실행/배포/기술 스택)
- CLAUDE.md는 내부 작업 메모용(의사결정/규칙/맥락)
