import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  createBundle,
  deleteBundle,
  getBundles,
  updateBundle,
} from "@/api/endpoints"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Bundle } from "@/types/api"

export function BundlesPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Bundle | null>(null)
  const [form, setForm] = useState({
    slug: "",
    label: "",
    tagline: "",
    itemCount: 1,
    price: 0,
    isActive: true,
  })
  const queryClient = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey: ["bundles"],
    queryFn: getBundles,
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? updateBundle(editing.id, {
            ...form,
            tagline: form.tagline || null,
          })
        : createBundle({
            ...form,
            tagline: form.tagline || null,
          }),
    onSuccess: () => {
      toast.success(editing ? "Bundle updated" : "Bundle created")
      queryClient.invalidateQueries({ queryKey: ["bundles"] })
      setOpen(false)
    },
    onError: () => toast.error("Failed to save bundle"),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBundle,
    onSuccess: () => {
      toast.success("Bundle deleted")
      queryClient.invalidateQueries({ queryKey: ["bundles"] })
    },
    onError: () => toast.error("Failed to delete bundle"),
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ slug: "", label: "", tagline: "", itemCount: 1, price: 0, isActive: true })
    setOpen(true)
  }

  const openEdit = (bundle: Bundle) => {
    setEditing(bundle)
    setForm({
      slug: bundle.slug,
      label: bundle.label,
      tagline: bundle.tagline ?? "",
      itemCount: bundle.itemCount,
      price: bundle.price,
      isActive: bundle.isActive,
    })
    setOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Bundles"
        description="Manage product bundle offers"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add Bundle
          </Button>
        }
      />

      <DataTable
        isLoading={isLoading}
        data={data}
        rowKey={(r) => r.id}
        columns={[
          { key: "label", header: "Label", cell: (r) => r.label },
          { key: "slug", header: "Slug", cell: (r) => r.slug },
          { key: "items", header: "Items", cell: (r) => r.itemCount },
          { key: "price", header: "Price", cell: (r) => `₹${r.price}` },
          {
            key: "status",
            header: "Status",
            cell: (r) => (
              <StatusBadge status={r.isActive ? "ACTIVE" : "INACTIVE"} />
            ),
          },
          {
            key: "actions",
            header: "",
            className: "w-24 text-right",
            cell: (r) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(r)}>
                  <Pencil className="size-4" />
                </Button>
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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Bundle" : "New Bundle"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Field>
              <FieldLabel>Slug</FieldLabel>
              <FieldContent>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Label</FieldLabel>
              <FieldContent>
                <Input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Tagline</FieldLabel>
              <FieldContent>
                <Input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Item Count</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  value={form.itemCount}
                  onChange={(e) =>
                    setForm({ ...form, itemCount: Number(e.target.value) })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Price (₹)</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                />
              </FieldContent>
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
              Active
            </label>
            <Button
              className="w-full"
              onClick={() => saveMutation.mutate()}
              disabled={!form.slug || !form.label || saveMutation.isPending}
            >
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
