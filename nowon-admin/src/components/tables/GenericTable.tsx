import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

// T는 데이터의 타입을 의미합니다 (Generic)
export interface Column<T> {
  header: string;
  key: keyof T | "actions"; // 데이터의 키 값 또는 작업(버튼) 버튼용 키
  render?: (item: T) => React.ReactNode; // 커스텀 렌더링이 필요한 경우 사용 (Badge, 금액 등)
}

interface GenericTableProps<T> {
  data: T[];
  columns: Column<T>[];
}

export default function GenericTable<T>({
  data,
  columns,
}: GenericTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((item, index) => (
              <TableRow key={index}>
                {columns.map((col) => (
                  <TableCell key={String(col.key)} className="px-5 py-4 text-start text-theme-sm">
                    {/* render 함수가 있으면 사용하고, 없으면 기본 데이터 출력 */}
                    {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}