import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  PAID: "bg-blue-100 text-blue-800 border-blue-200",
  PROCESSING: "bg-indigo-100 text-indigo-800 border-indigo-200",
  PACKED: "bg-purple-100 text-purple-800 border-purple-200",
  SHIPPED: "bg-cyan-100 text-cyan-800 border-cyan-200",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  REFUNDED: "bg-orange-100 text-orange-800 border-orange-200",
  ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  INACTIVE: "bg-gray-100 text-gray-700 border-gray-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  PENDING_REVIEW: "bg-amber-100 text-amber-800 border-amber-200",
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, "_")
  const style =
    STATUS_STYLES[normalized] ??
    "bg-secondary text-secondary-foreground border-border"

  return (
    <Badge
      variant="outline"
      className={cn("font-medium capitalize", style, className)}
    >
      {status.replace(/_/g, " ").toLowerCase()}
    </Badge>
  )
}
