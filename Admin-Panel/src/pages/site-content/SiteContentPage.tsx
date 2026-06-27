import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  deleteSiteContent,
  getSiteContentList,
  upsertSiteContent,
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
import type { SiteContent } from "@/types/api"

export function SiteContentPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<SiteContent | null>(null)
  const [form, setForm] = useState({ key: "", valueJson: "{}" })
  const queryClient = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey: ["site-content"],
    queryFn: getSiteContentList,
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      let parsed: Record<string, unknown>
      try {
        parsed = JSON.parse(form.valueJson)
      } catch {
        throw new Error("Invalid JSON")
      }
      return upsertSiteContent({ key: form.key, value: parsed })
    },
    onSuccess: () => {
      toast.success(editing ? "Content updated" : "Content created")
      queryClient.invalidateQueries({ queryKey: ["site-content"] })
      setOpen(false)
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to save content",
      ),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSiteContent,
    onSuccess: () => {
      toast.success("Content deleted")
      queryClient.invalidateQueries({ queryKey: ["site-content"] })
    },
    onError: () => toast.error("Failed to delete content"),
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ key: "", valueJson: "{}" })
    setOpen(true)
  }

  const openEdit = (item: SiteContent) => {
    setEditing(item)
    setForm({
      key: item.key,
      valueJson: JSON.stringify(item.value, null, 2),
    })
    setOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Site Content"
        description="Manage CMS key-value content blocks"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add Content
          </Button>
        }
      />

      <DataTable
        isLoading={isLoading}
        data={data}
        rowKey={(r) => r.key}
        columns={[
          { key: "key", header: "Key", cell: (r) => <code className="text-sm">{r.key}</code> },
          {
            key: "preview",
            header: "Preview",
            cell: (r) => (
              <span className="line-clamp-1 max-w-md text-sm text-muted-foreground">
                {JSON.stringify(r.value).slice(0, 80)}…
              </span>
            ),
          },
          {
            key: "updated",
            header: "Updated",
            cell: (r) =>
              r.updatedAt
                ? new Date(r.updatedAt).toLocaleDateString("en-IN")
                : "—",
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
                  onClick={() => deleteMutation.mutate(r.key)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit Content" : "New Content"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Field>
              <FieldLabel>Key</FieldLabel>
              <FieldContent>
                <Input
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  disabled={!!editing}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Value (JSON)</FieldLabel>
              <FieldContent>
                <Textarea
                  value={form.valueJson}
                  onChange={(e) =>
                    setForm({ ...form, valueJson: e.target.value })
                  }
                  rows={12}
                  className="font-mono text-xs"
                />
              </FieldContent>
            </Field>
            <Button
              className="w-full"
              onClick={() => saveMutation.mutate()}
              disabled={!form.key || saveMutation.isPending}
            >
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
