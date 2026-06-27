import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
} from "@/api/endpoints"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Coupon } from "@/types/api"

const emptyForm: {
  code: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  minOrderValue: string
  maxDiscount: string
  usageLimit: string
  isFirstOrderOnly: boolean
  isActive: boolean
} = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 10,
  minOrderValue: "",
  maxDiscount: "",
  usageLimit: "",
  isFirstOrderOnly: false,
  isActive: true,
}

export function CouponsPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState(emptyForm)
  const queryClient = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: getCoupons,
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: form.discountValue,
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : null,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        isFirstOrderOnly: form.isFirstOrderOnly,
        isActive: form.isActive,
      }
      return editing
        ? updateCoupon(editing.id, payload)
        : createCoupon(payload)
    },
    onSuccess: () => {
      toast.success(editing ? "Coupon updated" : "Coupon created")
      queryClient.invalidateQueries({ queryKey: ["coupons"] })
      setOpen(false)
    },
    onError: () => toast.error("Failed to save coupon"),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      toast.success("Coupon deleted")
      queryClient.invalidateQueries({ queryKey: ["coupons"] })
    },
    onError: () => toast.error("Failed to delete coupon"),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon)
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue?.toString() ?? "",
      maxDiscount: coupon.maxDiscount?.toString() ?? "",
      usageLimit: coupon.usageLimit?.toString() ?? "",
      isFirstOrderOnly: coupon.isFirstOrderOnly,
      isActive: coupon.isActive,
    })
    setOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Coupons"
        description="Manage promotional discount codes"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add Coupon
          </Button>
        }
      />

      <DataTable
        isLoading={isLoading}
        data={data}
        rowKey={(r) => r.id}
        columns={[
          { key: "code", header: "Code", cell: (r) => <span className="font-mono font-medium">{r.code}</span> },
          {
            key: "discount",
            header: "Discount",
            cell: (r) =>
              r.discountType === "PERCENTAGE"
                ? `${r.discountValue}%`
                : `₹${r.discountValue}`,
          },
          {
            key: "usage",
            header: "Usage",
            cell: (r) =>
              r.usageLimit
                ? `${r.usageCount ?? 0} / ${r.usageLimit}`
                : (r.usageCount ?? 0).toString(),
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
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Coupon" : "New Coupon"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Field>
              <FieldLabel>Code</FieldLabel>
              <FieldContent>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="uppercase"
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Discount Type</FieldLabel>
              <FieldContent>
                <Select
                  value={form.discountType}
                  onValueChange={(v: "PERCENTAGE" | "FIXED") =>
                    setForm({ ...form, discountType: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Discount Value</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) =>
                    setForm({ ...form, discountValue: Number(e.target.value) })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Min Order Value</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  value={form.minOrderValue}
                  onChange={(e) =>
                    setForm({ ...form, minOrderValue: e.target.value })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Max Discount</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) =>
                    setForm({ ...form, maxDiscount: e.target.value })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Usage Limit</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) =>
                    setForm({ ...form, usageLimit: e.target.value })
                  }
                />
              </FieldContent>
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFirstOrderOnly}
                onChange={(e) =>
                  setForm({ ...form, isFirstOrderOnly: e.target.checked })
                }
              />
              First order only
            </label>
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
              disabled={!form.code || saveMutation.isPending}
            >
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
