import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
} from "@/api/endpoints"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Brand } from "@/types/api"

export function BrandsPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [form, setForm] = useState({ name: "", description: "", logo: "" })
  const queryClient = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? updateBrand(editing.id, {
            ...form,
            logo: form.logo || null,
          })
        : createBrand({
            ...form,
            logo: form.logo || null,
          }),
    onSuccess: () => {
      toast.success(editing ? "Brand updated" : "Brand created")
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      setOpen(false)
    },
    onError: () => toast.error("Failed to save brand"),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      toast.success("Brand deleted")
      queryClient.invalidateQueries({ queryKey: ["brands"] })
    },
    onError: () => toast.error("Failed to delete brand"),
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", description: "", logo: "" })
    setOpen(true)
  }

  const openEdit = (brand: Brand) => {
    setEditing(brand)
    setForm({
      name: brand.name,
      description: brand.description ?? "",
      logo: brand.logo ?? "",
    })
    setOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Brands"
        description="Manage product brands"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add Brand
          </Button>
        }
      />

      <DataTable
        isLoading={isLoading}
        data={data}
        rowKey={(r) => r.id}
        columns={[
          { key: "name", header: "Name", cell: (r) => r.name },
          { key: "slug", header: "Slug", cell: (r) => r.slug },
          {
            key: "desc",
            header: "Description",
            cell: (r) => r.description ?? "—",
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
            <SheetTitle>{editing ? "Edit Brand" : "New Brand"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <FieldContent>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Description</FieldLabel>
              <FieldContent>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Logo URL</FieldLabel>
              <FieldContent>
                <Input
                  value={form.logo}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  placeholder="https://…"
                />
              </FieldContent>
            </Field>
            <Button
              className="w-full"
              onClick={() => saveMutation.mutate()}
              disabled={!form.name || saveMutation.isPending}
            >
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
