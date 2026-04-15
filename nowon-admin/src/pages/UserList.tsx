import { Link } from "react-router";
import GenericTable, { Column } from "../components/tables/GenericTable";
import Badge from "../components/ui/badge/Badge";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdDate: string;
}

export default function UserList() {
  const [userData, setUserData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // API 호출 함수
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("http://localhost:8080/api/admin/members");
        setUserData(response.data); // 데이터 설정
      } catch (error) {
        console.error("회원 목록 로딩 중 에러:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 회원 테이블을 위한 컬럼 설정
  const columns: Column<User>[] = [
    { header: "ID", key: "id" },
    { header: "이름", key: "name" },
    { header: "이메일", key: "email" },
    {
      header: "역할",
      key: "role",
      render: (item: User) => (
        <Badge color={item.role === "ADMIN" ? "error" : "success"}>
          {item.role === "ADMIN" ? "관리자" : "일반회원"}
        </Badge>
      ),
    },
    { header: "가입일", key: "createdDate" },
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

  if (loading) return <div className="p-10 text-center">데이터를 불러오는 중입니다...</div>;

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
      
      {/* API로 받아온 실제 데이터 연동 */}
      <GenericTable data={userData} columns={columns} />
    </div>
  );
}