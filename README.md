# 🛒 Nowon Shop (Integrated Logistics & Member Management)

React와 Spring Boot를 기반으로 한 통합 쇼핑몰 관리 시스템입니다. 
단순한 CRUD를 넘어 **JPA Auditing을 활용한 데이터 추적**과 **Spring Security 기반의 권한 관리**를 학습하고 적용하는 것을 목표로 합니다.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **UI Components**: Custom Generic Table, Form Elements (TailAdmin 기반)

### Backend
- **Framework**: Spring Boot 3.4.x
- **Language**: Java 17
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA
- **Security**: Spring Security (Session-based Auth 적용 예정)
- **Library**: Lombok, Validation, JPA Auditing

---

## ✨ Key Features

### 📦 Product Management
- **Generic Table**: TypeScript 제네릭을 활용하여 재사용성을 극대화한 테이블 컴포넌트 구현.
- **Inventory Tracking**: 재고 상태에 따른 실시간 배지(Badge) UI 업데이트.
- **Data Persistence**: MySQL을 활용한 상품 정보 및 상세 설명의 영구 저장.

### 👥 Member Management
- **RBAC (Role-Based Access Control)**: `USER`, `ADMIN` 권한 분리 및 접근 제어.
- **Account Lifecycle**: 회원의 상태(정상, 차단, 탈퇴)를 Enum으로 관리하여 운영 효율성 증대.
- **Automated Auditing**: 가입일 및 정보 수정일을 JPA Auditing으로 자동 관리.

---

## 📅 개발 히스토리

### 2026-04-22
- **[FRONT-ADMIN]**: 상품 등록, 상품 목록 수정
- **[SERVER]**: 상품 등록, 상품 목록 api 구현

### 2026-04-16
- **[FRONT-ADMIN]**: JWT 적용
- **[SERVER]**: JWT 구현

### 2026-04-15
- **[FRONT-ADMIN]**: 회원 등록, 회원 목록 수정
- **[SERVER]**: 회원 등록, 회원 목록 api 구현

### 2026-04-14
- **[SERVER]**:
  - 상품(Product) 및 회원(Member) 도메인 구축 (Entity, Repository, Service)
  - MySQL 연동 및 JPA Auditing 설정 (CreatedDate, LastModifiedDate)
- **[DOCS]**: 보안을 고려한 `application.yaml.sample` 구조 설계 및 README 작성

### 2026-04-13
- **[FRONT-ADMIN]**:
  - TailAdmin 기반 레이아웃 통합 및 관리자 메인 UI 제작
  - 상품/주문/회원 관리를 위한 공통 제네릭 테이블 및 등록 폼 UI 제작

### 2026-04-06
- **[START]**: 프로젝트 초기 기획 및 아키텍처 설계

---

## 🚀 시작하기 (Environment Setup)

1. **Database**: MySQL에 `shop` 데이터베이스를 생성합니다.
2. **Configuration**: `src/main/resources/application.yaml.sample` 파일을 복사하여 `application.yaml`을 생성하고 본인의 DB 정보를 입력합니다. (해당 파일은 `.gitignore`에 의해 보호됩니다.)
3. **Run**: Backend(`bootRun`)와 Frontend(`npm run dev`)를 각각 실행합니다.

---

## ⚖️ 저작권 및 출처 명시
본 프로젝트는 학습 목적으로 [TailAdmin](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard) 오픈소스 템플릿을 기반으로 제작되었습니다. 기초 레이아웃과 UI 시스템을 활용하였으며, 백엔드 API 연동, 데이터베이스 설계 및 세부 비즈니스 로직은 직접 개발 중입니다.
