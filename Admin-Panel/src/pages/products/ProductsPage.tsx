import { useState } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { toast } from "sonner"
import { deleteProduct, getProducts } from "@/api/endpoints"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { TablePagination } from "@/components/TablePagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Product } from "@/types/api"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function ProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, query],
    queryFn: () => getProducts({ page, limit: 20, q: query || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["products", page, query] })
      const previous = queryClient.getQueryData(["products", page, query])
      queryClient.setQueryData(["products", page, query], (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.filter((p: any) => p.id !== id),
        }
      })
      // Close the dialog immediately for an instant feel
      setDeleteId(null)
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["products", page, query], context.previous)
      }
      toast.error("Failed to delete product")
    },
    onSuccess: () => {
      toast.success("Product deleted")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  const columns = [
    {
      key: "name",
      header: "Product",
      cell: (row: Product) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.sku}</p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (row: Product) => (
        <span>
          {row.salePrice ? (
            <>
              <span className="text-destructive">{formatCurrency(row.salePrice)}</span>
              <span className="ml-1 text-xs text-muted-foreground line-through">
                {formatCurrency(row.price)}
              </span>
            </>
          ) : (
            formatCurrency(row.price)
          )}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      cell: (row: Product) => (
        <span className={row.stockCount < 10 ? "font-medium text-destructive" : ""}>
          {row.stockCount}
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (row: Product) => row.category?.name ?? "—",
    },
    {
      key: "actions",
      header: "",
      className: "w-28 text-right",
      cell: (row: Product) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link to={`/products/${row.slug}/edit`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleteId(row.id)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        actions={
          <Button asChild>
            <Link to="/products/new">
              <Plus className="size-4" />
              Add Product
            </Link>
          </Button>
        }
      />

      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setQuery(search)
          setPage(1)
        }}
      >
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        rowKey={(row) => row.id}
      />

      {data?.meta && (
        <TablePagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete the product from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
