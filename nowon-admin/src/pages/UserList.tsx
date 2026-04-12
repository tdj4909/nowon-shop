import { Link } from "react-router";
import GenericTable, { Column } from "../components/tables/GenericTable";
import Badge from "../components/ui/badge/Badge";

interface User {
  id: number;
  name: string;
  email: string;
  role: '일반회원' | '관리자';
  joinDate: string;
}

export default function UserList() {
  const userData: User[] = [
    { id: 1, name: "김철수", email: "chulsoo@example.com", role: "일반회원", joinDate: "2026-01-15" },
    { id: 2, name: "관리자", email: "admin@myshop.com", role: "관리자", joinDate: "2025-12-01" },
  ];

  // 회원 테이블을 위한 컬럼 설정
  const columns: Column<User>[] = [
    { header: "ID", key: "id" },
    { header: "이름", key: "name" },
    { header: "이메일", key: "email" },
    {
      header: "역할",
      key: "role",
      render: (item: User) => (
        <Badge color={item.role === "관리자" ? "error" : "success"}>
          {item.role}
        </Badge>
      ),
    },
    { header: "가입일", key: "joinDate" },
    {
      header: "관리",
      key: "actions",
      render: () => (
        <div className="flex gap-2">
          <button className="text-blue-500 hover:underline">수정</button>
          <button className="text-red-500 hover:underline">차단</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">회원 관리</h1>
        <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700">
          <Link
            to="/users/create"
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            <span>+ 회원 등록</span>
          </Link>
        </button>
      </div>
      
      {/* 공통 테이블 사용 */}
      <GenericTable data={userData} columns={columns} />
    </div>
  );
}