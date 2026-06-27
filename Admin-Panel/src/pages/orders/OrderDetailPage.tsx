import type { ReactNode } from "react"
import { Link, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getOrderById, updateOrderStatus } from "@/api/endpoints"
import { LoadingState } from "@/components/LoadingState"
import { PageHeader } from "@/components/PageHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(Number(id)),
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateOrderStatus(Number(id), status),
    onSuccess: () => {
      toast.success("Order status updated")
      queryClient.invalidateQueries({ queryKey: ["order", id] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
    onError: () => toast.error("Failed to update status"),
  })

  if (isLoading) return <LoadingState label="Loading order…" />
  if (!order) return <p className="text-destructive">Order not found</p>

  return (
    <div>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        actions={
          <Button variant="outline" asChild>
            <Link to="/orders">Back to Orders</Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Status">
          <StatusBadge status={order.status} />
        </InfoCard>
        <InfoCard label="Total">{formatCurrency(order.totalAmount)}</InfoCard>
        <InfoCard label="Payment">{order.paymentMethod ?? "—"}</InfoCard>
        <InfoCard label="Date">
          {new Date(order.createdAt).toLocaleString("en-IN")}
        </InfoCard>
      </div>

      <div className="mb-6 rounded-none border border-border bg-card p-4">
        <h3 className="mb-3 font-semibold">Update Status</h3>
        <Select
          value={order.status}
          onValueChange={(v) => statusMutation.mutate(v)}
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {order.user && (
        <div className="mb-6 rounded-none border border-border bg-card p-4">
          <h3 className="mb-2 font-semibold">Customer</h3>
          <p>{order.user.fullName}</p>
          <p className="text-sm text-muted-foreground">{order.user.email}</p>
        </div>
      )}

      {order.shippingAddress && (
        <div className="mb-6 rounded-none border border-border bg-card p-4">
          <h3 className="mb-2 font-semibold">Shipping Address</h3>
          <p className="text-sm">
            {Object.values(order.shippingAddress).filter(Boolean).join(", ")}
          </p>
        </div>
      )}

      <div className="rounded-none border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-semibold">Order Items</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Line Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(order.items ?? []).map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                <TableCell>{formatCurrency(item.lineTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function InfoCard({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="rounded-none border border-border bg-card p-4">
      <p className="text-xs tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-1 font-medium">{children}</div>
    </div>
  )
}
