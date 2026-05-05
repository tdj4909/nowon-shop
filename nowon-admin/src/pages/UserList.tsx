import { Link } from "react-router";
import GenericTable, { Column } from "../components/tables/GenericTable";
import Badge from "../components/ui/badge/Badge";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BANNED" | "WITHDRAWN";
  createdDate: string;
}

const STATUS_BADGE_COLOR: Record<string, "success" | "error" | "warning"> = {
  ACTIVE: "success",
  BANNED: "error",
  WITHDRAWN: "warning",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "정상",
  BANNED: "차단",
  WITHDRAWN: "탈퇴",
};

export default function UserList() {
  const [userData, setUserData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/api/admin/members");
      setUserData(res.data);
    } catch (err) {
      console.error("회원 목록 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (memberId: number, status: string) => {
    const label = STATUS_LABEL[status];
    if (!confirm(`해당 회원을 "${label}" 상태로 변경하시겠습니까?`)) return;
    try {
      await axiosInstance.patch(`/api/admin/members/${memberId}/status?status=${status}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "상태 변경에 실패했습니다.");
    }
  };

  const columns: Column<User>[] = [
    { header: "ID", key: "id" },
    { header: "이름", key: "name" },
    { header: "이메일", key: "email" },
    {
      header: "역할",
      key: "role",
      render: (item) => (
        <Badge color={item.role === "ADMIN" ? "error" : "success"}>
          {item.role === "ADMIN" ? "관리자" : "일반회원"}
        </Badge>
      ),
    },
    {
      header: "상태",
      key: "status",
      render: (item) => (
        <Badge color={STATUS_BADGE_COLOR[item.status] ?? "warning"}>
          {STATUS_LABEL[item.status] ?? item.status}
        </Badge>
      ),
    },
    {
      header: "가입일",
      key: "createdDate",
      render: (item) => item.createdDate?.slice(0, 10) ?? "-",
    },
    {
      header: "관리",
      key: "actions",
      render: (item) => (
        <div className="flex gap-2">
          {item.status === "ACTIVE" ? (
            <button
              className="text-red-500 hover:underline text-sm"
              onClick={() => handleStatusChange(item.id, "BANNED")}
            >
              차단
            </button>
          ) : (
            <button
              className="text-blue-500 hover:underline text-sm"
              onClick={() => handleStatusChange(item.id, "ACTIVE")}
            >
              활성화
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <div className="p-10 text-center">데이터를 불러오는 중입니다...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">회원 관리</h1>
        <Link
          to="/users/create"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          + 회원 등록
        </Link>
      </div>
      <GenericTable data={userData} columns={columns} />
    </div>
  );
}
