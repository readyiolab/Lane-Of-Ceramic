import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/api/endpoints"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { SingleImageUploader } from "@/components/SingleImageUploader"
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
import type { Category } from "@/types/api"

export function CategoriesPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: "", description: "", sortOrder: 0, image: null as string | null, heroImage: null as string | null })
  const queryClient = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? updateCategory(editing.id, form)
        : createCategory(form),
    onSuccess: () => {
      toast.success(editing ? "Category updated" : "Category created")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setOpen(false)
      setEditing(null)
    },
    onError: () => toast.error("Failed to save category"),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] })
      const previous = queryClient.getQueryData(["categories"])
      queryClient.setQueryData(["categories"], (old: any) => {
        if (!Array.isArray(old)) return old
        return old.filter((c: any) => c.id !== id)
      })
      return { previous }
    },
    onError: (...args) => {
      const context = args[2] as any;
      if (context?.previous) {
        queryClient.setQueryData(["categories"], context.previous)
      }
      toast.error("Failed to delete category")
    },
    onSuccess: () => {
      toast.success("Category deleted")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", description: "", sortOrder: 0, image: null, heroImage: null })
    setOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({
      name: cat.name,
      description: cat.description ?? "",
      sortOrder: cat.sortOrder ?? 0,
      image: cat.image ?? null,
      heroImage: cat.heroImage ?? null,
    })
    setOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize products into categories"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add Category
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
            key: "order",
            header: "Sort Order",
            cell: (r) => r.sortOrder ?? 0,
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
            <SheetTitle>{editing ? "Edit Category" : "New Category"}</SheetTitle>
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
            
            <div className="grid grid-cols-2 gap-4">
              <SingleImageUploader
                label="Thumbnail Image"
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                onRemove={() => setForm({ ...form, image: null })}
                folder="categories"
              />
              <SingleImageUploader
                label="Hero Image"
                value={form.heroImage}
                onChange={(url) => setForm({ ...form, heroImage: url })}
                onRemove={() => setForm({ ...form, heroImage: null })}
                folder="categories"
              />
            </div>
            
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
