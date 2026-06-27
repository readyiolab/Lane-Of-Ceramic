import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from "@/api/endpoints"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { StatusBadge } from "@/components/StatusBadge"
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
import type { Announcement } from "@/types/api"

export function AnnouncementsPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState({
    text: "",
    sortOrder: 0,
    isActive: true,
  })
  const queryClient = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: getAnnouncements,
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? updateAnnouncement(editing.id, form)
        : createAnnouncement(form),
    onSuccess: () => {
      toast.success(editing ? "Announcement updated" : "Announcement created")
      queryClient.invalidateQueries({ queryKey: ["announcements"] })
      setOpen(false)
    },
    onError: () => toast.error("Failed to save announcement"),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      toast.success("Announcement deleted")
      queryClient.invalidateQueries({ queryKey: ["announcements"] })
    },
    onError: () => toast.error("Failed to delete announcement"),
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ text: "", sortOrder: 0, isActive: true })
    setOpen(true)
  }

  const openEdit = (item: Announcement) => {
    setEditing(item)
    setForm({
      text: item.text,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    })
    setOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Storefront banner messages"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add Announcement
          </Button>
        }
      />

      <DataTable
        isLoading={isLoading}
        data={data}
        rowKey={(r) => r.id}
        columns={[
          { key: "text", header: "Message", cell: (r) => r.text },
          { key: "order", header: "Sort", cell: (r) => r.sortOrder },
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
            <SheetTitle>
              {editing ? "Edit Announcement" : "New Announcement"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Field>
              <FieldLabel>Message</FieldLabel>
              <FieldContent>
                <Textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  rows={3}
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
              disabled={!form.text || saveMutation.isPending}
            >
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
