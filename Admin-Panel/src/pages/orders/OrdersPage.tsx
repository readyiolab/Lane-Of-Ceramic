import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getOrders } from "@/api/endpoints"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { TablePagination } from "@/components/TablePagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Order } from "@/types/api"

const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function OrdersPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>("all")

  const { data, isLoading } = useQuery({
    queryKey: ["orders", page, status],
    queryFn: () =>
      getOrders({
        page,
        limit: 20,
        status: status === "all" ? undefined : status,
      }),
  })

  return (
    <div>
      <PageHeader
        title="Orders"
        description="View and manage customer orders"
      />

      <div className="mb-4 w-48">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        isLoading={isLoading}
        data={data?.data ?? []}
        rowKey={(r) => r.id}
        columns={[
          {
            key: "order",
            header: "Order #",
            cell: (r: Order) => (
              <Link
                to={`/orders/${r.id}`}
                className="font-medium text-primary hover:underline"
              >
                {r.orderNumber}
              </Link>
            ),
          },
          {
            key: "customer",
            header: "Customer",
            cell: (r) => r.user?.fullName ?? "—",
          },
          {
            key: "amount",
            header: "Total",
            cell: (r) => formatCurrency(r.totalAmount),
          },
          {
            key: "status",
            header: "Status",
            cell: (r) => <StatusBadge status={r.status} />,
          },
          {
            key: "date",
            header: "Date",
            cell: (r) => new Date(r.createdAt).toLocaleDateString("en-IN"),
          },
        ]}
      />

      {data?.meta && (
        <TablePagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
