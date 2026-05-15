# schedule-svc

E-ON 프로젝트의 학사일정(Schedule) 마이크로서비스입니다.

NEIS Open API 기반 학사일정 데이터를 관리하며,  
학교/지역/학사일정/평균 학사일정 기능을 담당합니다.

---

# 역할

`schedule-svc`는 다음 책임을 가집니다.

- 학교 정보 관리
- 지역 정보 관리
- 학사일정 조회
- 평균 학사일정 계산 및 제공
- NEIS API 데이터 캐싱
- NEIS 기반 학사일정 동기화 배치 작업
- 내부 서비스용 school validation API 제공

---

# 주요 특징

## 1. NEIS API 캐싱 구조

기존에는 사용자가 학사일정을 조회할 때마다 NEIS API를 직접 호출했습니다.

현재는 다음 구조로 변경되었습니다.

```text
Frontend
→ Gateway
→ schedule-svc
→ DB 캐시 조회
```

- NEIS API 데이터는 batch/cron 기반으로 주기적으로 동기화
- 외부 API 호출 감소
- 응답 속도 개선
- NEIS 장애 영향 감소
- 반복 요청 최소화

---

## 2. MSA 기반 독립 서비스

`schedule-svc`는 독립적인 데이터베이스와 비즈니스 로직을 가집니다.

다른 서비스 DB를 직접 JOIN하거나 FK로 참조하지 않습니다.

서비스 간 통신 방식:

- REST internal API
- Gateway 기반 인증 헤더 전달

---

## 3. 데이터 Ownership

`schedule-svc`가 소유하는 데이터:

- Region
- School
- AcademicSchedule
- AverageAcademicSchedule

사용자 관련 데이터(`my_school` 등)는 user-svc가 소유

---

# 프로젝트 구조

```text
schedule-svc/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   ├── jobs/
│   └── utils/
│
├── config/
│   └── config.js
├── models/
├── migrations/
├── seeders/
│
├── Dockerfile
├── package.json
├── .env
├── .env.example
└── README.md
```

---

# 실행 방법

## 1. 패키지 설치

```bash
npm install
```

---

## 2. 환경변수 설정

`.env` 파일 작성:

```env
PORT=8082

DB_HOST=localhost
DB_PORT=3306
DB_NAME=schedule_db
DB_USER=root
DB_PASSWORD=password

NEIS_API_KEY=YOUR_NEIS_API_KEY
```

---

## 3. Migration 실행

```bash
npx sequelize-cli db:migrate
```

---

## 4. 개발 서버 실행

```bash
npm run dev
```

---

# 기본 포트

| 서비스 | 포트 |
|---|---:|
| schedule-svc | 8082 |

---

# 주요 API

## Public API

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/schedules` | 학사일정 조회 |
| GET | `/api/schools/:schoolCode` | 학교 조회 |
| GET | `/api/regions` | 지역 조회 |
| GET | `/api/average-schedules` | 평균 학사일정 조회 |

---

## Internal API

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/internal/schools/:schoolCode` | 학교 유효성 검증 |

Internal API는 서비스 간 통신 전용이며, Gateway 외부 요청에서는 접근이 제한됩니다.

---

# 배치 작업

`schedule-svc`는 cron 기반 배치 작업을 통해:

- NEIS 데이터 동기화
- 평균 학사일정 계산
- 일정 캐시 갱신

을 수행합니다.

관련 코드는:

```text
src/jobs/
```

에 위치합니다.

---

# Docker

## 이미지 빌드

```bash
docker build -t schedule-svc .
```

---

## 컨테이너 실행

```bash
docker run -p 8082:8082 schedule-svc
```

---

# 기술 스택

- Node.js
- Express
- Sequelize
- MySQL
- Docker
- Kubernetes
- NEIS Open API

---

# 관련 서비스

| 서비스 | 역할 |
|---|---|
| gateway-svc | 인증/라우팅 |
| user-svc | 사용자 및 my_school 관리 |
| frontend | 사용자 UI |

```