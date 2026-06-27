import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  createDiscountTier,
  deleteDiscountTier,
  getDiscountTiers,
  updateDiscountTier,
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
import type { DiscountTier } from "@/types/api"

export function DiscountTiersPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<DiscountTier | null>(null)
  const [form, setForm] = useState({
    threshold: 0,
    label: "",
    icon: "",
    discountPct: 0,
    shipping: 0,
    sortOrder: 0,
    isActive: true,
  })
  const queryClient = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey: ["discount-tiers"],
    queryFn: getDiscountTiers,
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? updateDiscountTier(editing.id, {
            ...form,
            icon: form.icon || null,
          })
        : createDiscountTier({
            ...form,
            icon: form.icon || null,
          }),
    onSuccess: () => {
      toast.success(editing ? "Tier updated" : "Tier created")
      queryClient.invalidateQueries({ queryKey: ["discount-tiers"] })
      setOpen(false)
    },
    onError: () => toast.error("Failed to save discount tier"),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDiscountTier,
    onSuccess: () => {
      toast.success("Tier deleted")
      queryClient.invalidateQueries({ queryKey: ["discount-tiers"] })
    },
    onError: () => toast.error("Failed to delete tier"),
  })

  const openCreate = () => {
    setEditing(null)
    setForm({
      threshold: 0,
      label: "",
      icon: "",
      discountPct: 0,
      shipping: 0,
      sortOrder: 0,
      isActive: true,
    })
    setOpen(true)
  }

  const openEdit = (tier: DiscountTier) => {
    setEditing(tier)
    setForm({
      threshold: tier.threshold,
      label: tier.label,
      icon: tier.icon ?? "",
      discountPct: tier.discountPct,
      shipping: tier.shipping,
      sortOrder: tier.sortOrder,
      isActive: tier.isActive,
    })
    setOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Discount Tiers"
        description="Cart value thresholds for shipping and discounts"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add Tier
          </Button>
        }
      />

      <DataTable
        isLoading={isLoading}
        data={data}
        rowKey={(r) => r.id}
        columns={[
          { key: "label", header: "Label", cell: (r) => r.label },
          {
            key: "threshold",
            header: "Threshold",
            cell: (r) => `₹${r.threshold}`,
          },
          {
            key: "discount",
            header: "Discount",
            cell: (r) => `${r.discountPct}%`,
          },
          {
            key: "shipping",
            header: "Shipping",
            cell: (r) => (r.shipping === 0 ? "Free" : `₹${r.shipping}`),
          },
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
            <SheetTitle>{editing ? "Edit Tier" : "New Tier"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
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
              <FieldLabel>Threshold (₹)</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  value={form.threshold}
                  onChange={(e) =>
                    setForm({ ...form, threshold: Number(e.target.value) })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Discount %</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  value={form.discountPct}
                  onChange={(e) =>
                    setForm({ ...form, discountPct: Number(e.target.value) })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Shipping (₹)</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  value={form.shipping}
                  onChange={(e) =>
                    setForm({ ...form, shipping: Number(e.target.value) })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Sort Order</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: Number(e.target.value) })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Icon</FieldLabel>
              <FieldContent>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
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
              disabled={!form.label || saveMutation.isPending}
            >
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
