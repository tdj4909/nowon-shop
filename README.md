# 🛒 Nowon Shop

React와 Spring Boot를 기반으로 한 쇼핑몰 통합 관리 시스템입니다.
유저 쇼핑몰(`nowon-user`)과 관리자 대시보드(`nowon-admin`), REST API 서버(`nowon-server`)로 구성된 멀티 모듈 프로젝트입니다.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP**: Axios (인터셉터 기반 JWT 자동 첨부)
- **UI**: TailAdmin 기반 커스텀 컴포넌트

### Backend
- **Framework**: Spring Boot 3.4.x
- **Language**: Java 17
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA + JPA Auditing
- **Security**: Spring Security + JWT (Stateless)
- **Library**: Lombok, Validation

---

## ✨ Key Features

### 🔐 인증 / 권한
- JWT 기반 Stateless 인증
- `USER` / `ADMIN` 권한 분리 (RBAC)
- Spring Security 필터 체인으로 API별 접근 제어

### 📦 상품 관리
- 상품 등록 / 목록 조회
- 재고 상태(`SELL` / `SOLD_OUT` / `HIDE`) Enum 관리
- JPA Auditing으로 등록일 / 수정일 자동 기록

### 👥 회원 관리
- 회원 등록 / 목록 조회
- 회원 상태(`ACTIVE` / `BANNED` / `WITHDRAWN`) Enum 관리
- BCrypt 패스워드 암호화

### 🧾 주문 관리
- 상품 주문 생성 / 취소
- 주문 상태(`PENDING` → `PAID` → `SHIPPED` → `DELIVERED` / `CANCELLED`) 흐름 관리
- **비관적 락(Pessimistic Lock)** 으로 동시 주문 시 재고 정합성 보장
- 주문 취소 시 재고 자동 복구
- `OrderItem`에 주문 당시 가격 별도 저장 (상품 가격 변동과 무관하게 주문 기록 보존)
- `JOIN FETCH`로 N+1 문제 방지

---

## 🗂 프로젝트 구조

```
nowon-shop/
├── nowon-admin     # 관리자 대시보드 (React + TypeScript)
├── nowon-user      # 유저 쇼핑몰 (React + TypeScript)
└── nowon-server    # REST API 서버 (Spring Boot)
    └── src/main/java/com/nowon/shop/
        ├── api/
        │   ├── admin/          # 관리자 API (상품, 회원, 주문)
        │   ├── user/           # 유저 API (주문)
        │   └── auth/           # 인증 API (로그인)
        ├── domain/
        │   ├── member/         # 회원 도메인
        │   ├── product/        # 상품 도메인
        │   └── order/          # 주문 도메인
        └── global/
            └── security/       # JWT 필터 / Security 설정
```

---

## 🚀 시작하기

### 사전 준비
- Java 17
- Node.js 18+
- MySQL 8.0

### Backend 실행
```bash
# 1. MySQL에 데이터베이스 생성
CREATE DATABASE shop;

# 2. 설정 파일 생성
# nowon-server/src/main/resources/application.yaml.sample 복사 후
# application.yaml 생성하여 DB 정보 입력

# 3. 서버 실행
./gradlew bootRun
```

### Frontend 실행
```bash
# 관리자 대시보드
cd nowon-admin
npm install
npm run dev

# 유저 쇼핑몰
cd nowon-user
npm install
npm run dev
```

---

## 📅 개발 히스토리

### 2026-05-05
- **[SERVER]**: 주문(Order) 도메인 구축
  - `Order` / `OrderItem` / `OrderStatus` 엔티티 설계
  - 비관적 락(`PESSIMISTIC_WRITE`)으로 재고 동시성 문제 처리
  - `JOIN FETCH`로 N+1 문제 방지
  - 주문 생성 / 취소 / 상태 변경 API 구현
  - 어드민용(`/api/admin/orders`), 유저용(`/api/orders`) API 분리

### 2026-04-22
- **[FRONT-ADMIN]**: 상품 등록, 상품 목록 수정
- **[SERVER]**: 상품 등록, 상품 목록 API 구현

### 2026-04-16
- **[FRONT-ADMIN]**: JWT 적용
- **[SERVER]**: JWT 구현

### 2026-04-15
- **[FRONT-ADMIN]**: 회원 등록, 회원 목록 수정
- **[SERVER]**: 회원 등록, 회원 목록 API 구현

### 2026-04-14
- **[SERVER]**: 상품(Product) 및 회원(Member) 도메인 구축
- **[DOCS]**: `application.yaml.sample` 구조 설계 및 README 작성

### 2026-04-13
- **[FRONT-ADMIN]**: TailAdmin 기반 레이아웃 통합, 공통 제네릭 테이블 및 등록 폼 UI 제작

### 2026-04-06
- **[START]**: 프로젝트 초기 기획 및 아키텍처 설계

---

## ⚖️ 저작권 및 출처 명시
본 프로젝트는 학습 목적으로 [TailAdmin](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard) 오픈소스 템플릿을 기반으로 제작되었습니다. 기초 레이아웃과 UI 시스템을 활용하였으며, 백엔드 API 연동, 데이터베이스 설계 및 비즈니스 로직은 직접 개발하였습니다.
