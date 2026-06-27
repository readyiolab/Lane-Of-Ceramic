import { useQuery } from "@tanstack/react-query"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Link } from "react-router-dom"
import { getDashboardStats } from "@/api/endpoints"
import { LoadingState } from "@/components/LoadingState"
import { PageHeader } from "@/components/PageHeader"
import { StatusBadge } from "@/components/StatusBadge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-none border border-border bg-card p-5 shadow-sm">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 font-heading text-3xl font-semibold text-primary">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardStats,
  })

  if (isLoading) return <LoadingState label="Loading dashboard…" />
  if (error || !data) {
    return (
      <p className="text-destructive">
        Failed to load dashboard. Ensure the backend is running.
      </p>
    )
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of store performance and recent activity"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Revenue" value={formatCurrency(data.revenue)} />
        <KpiCard label="Orders" value={String(data.ordersCount)} />
        <KpiCard label="Active Users" value={String(data.usersCount)} />
        <KpiCard
          label="Low Stock Items"
          value={String(data.lowStockProducts.length)}
          sub="Products below 10 units"
        />
      </div>

      <div className="mb-6 rounded-none border border-border bg-card p-5">
        <h2 className="mb-4 font-heading text-lg font-semibold">
          Monthly Revenue
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d4" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                formatter={(value) =>
                  formatCurrency(Number(value ?? 0))
                }
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar dataKey="revenue" fill="#3e3a06" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-none border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-heading text-lg font-semibold">Recent Orders</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      to={`/orders/${order.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{order.customerName}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-none border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-heading text-lg font-semibold">Low Stock</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lowStockProducts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className="font-medium text-destructive">
                    {p.stockCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
