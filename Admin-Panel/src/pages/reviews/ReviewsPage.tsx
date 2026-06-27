import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { approveReview, deleteReview, getReviews } from "@/api/endpoints"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { TablePagination } from "@/components/TablePagination"
import { Button } from "@/components/ui/button"
import type { Review } from "@/types/api"

export function ReviewsPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", page],
    queryFn: () => getReviews({ page, limit: 20 }),
  })

  const approveMutation = useMutation({
    mutationFn: approveReview,
    onSuccess: () => {
      toast.success("Review approved")
      queryClient.invalidateQueries({ queryKey: ["reviews"] })
    },
    onError: () => toast.error("Failed to approve review"),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      toast.success("Review deleted")
      queryClient.invalidateQueries({ queryKey: ["reviews"] })
    },
    onError: () => toast.error("Failed to delete review"),
  })

  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Moderate product reviews"
      />

      <DataTable
        isLoading={isLoading}
        data={data?.data ?? []}
        rowKey={(r) => r.id}
        columns={[
          {
            key: "product",
            header: "Product",
            cell: (r: Review) => r.productName ?? `#${r.productId}`,
          },
          {
            key: "user",
            header: "User",
            cell: (r) => r.userName ?? r.userId.slice(0, 8),
          },
          {
            key: "rating",
            header: "Rating",
            cell: (r) => `${r.rating} ★`,
          },
          {
            key: "comment",
            header: "Comment",
            cell: (r) => (
              <span className="line-clamp-2 max-w-xs text-sm">
                {r.comment ?? r.title ?? "—"}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (r) => (
              <StatusBadge
                status={r.isApproved ? "APPROVED" : "PENDING_REVIEW"}
              />
            ),
          },
          {
            key: "actions",
            header: "",
            className: "w-28 text-right",
            cell: (r) => (
              <div className="flex justify-end gap-1">
                {!r.isApproved && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => approveMutation.mutate(r.id)}
                    title="Approve"
                  >
                    <Check className="size-4 text-emerald-600" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => deleteMutation.mutate(r.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ),
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
