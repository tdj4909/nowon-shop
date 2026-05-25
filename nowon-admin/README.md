# 🚀 Nowon Shop Admin

`nowon-shop` 프로젝트의 **관리자 대시보드**입니다. 상품 / 주문 / 회원을 관리하기 위한 React + TypeScript 기반 SPA로, [TailAdmin](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard) 오픈소스 템플릿을 기반으로 시작하여 프로젝트에 필요한 기능만 남기고 정리했습니다.

---

## 📌 주요 기능
- **인증**: JWT 기반 로그인, 토큰 만료 시 자동 로그아웃, `PrivateRoute`로 ADMIN 권한 보호
- **대시보드**: 회원 / 상품 / 주문 요약 카드, 최근 주문 5건 표시
- **상품 관리**: 등록 · 수정 · 삭제, Cloudinary 이미지 업로드 + 미리보기
- **주문 관리**: 주문 상태 변경 (PENDING → PAID → SHIPPED → DELIVERED), 주문 취소
- **회원 관리**: 회원 목록, 활성/차단 상태 변경, 신규 회원 등록 (USER/ADMIN 권한 지정)
- **다크 모드** 지원

## 🛠 기술 스택
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **HTTP**: Axios (응답 인터셉터로 `ApiResponse<T>` 자동 언래핑)
- **Deployment**: Vercel

## 📂 디렉토리 구조
```
src/
├── api/             ← axios 인스턴스 + 인터셉터
├── components/
│   ├── common/      ← PrivateRoute, ScrollToTop, ThemeToggleButton 등
│   ├── tables/      ← GenericTable (재사용 테이블)
│   └── ui/          ← Badge, Table 등 공통 UI
├── context/         ← SidebarContext, ThemeContext
├── icons/           ← 사이드바 메뉴용 SVG 아이콘
├── layout/          ← AppLayout, AppHeader, AppSidebar, Backdrop
└── pages/           ← Dashboard, ProductList/Create/Edit, OrderList, UserList/Create, SignIn
```

## 🔗 백엔드 연동
- API Base URL: `VITE_API_URL` 환경변수 (기본값 `http://localhost:8080`)
- 모든 요청은 `axiosInstance`를 통해 전송되며, 토큰 자동 첨부와 `ApiResponse` 언래핑이 인터셉터에서 처리됩니다.

## ⚖️ 저작권 및 출처
본 프로젝트는 [TailAdmin](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard) 오픈소스 템플릿을 기반으로 시작하였습니다. 프로젝트에서 사용하지 않는 의존성과 컴포넌트(차트, 캘린더, 지도, 드래그앤드롭 등)는 모두 제거하였고, 비즈니스 로직과 페이지는 직접 구현했습니다.
