import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { deleteUser, getUsers, updateUser } from "@/api/endpoints"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { TablePagination } from "@/components/TablePagination"
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
import type { User } from "@/types/api"

export function UsersPage() {
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState({ fullName: "", role: "USER", isActive: true })
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["users", page],
    queryFn: () => getUsers({ page, limit: 20 }),
  })

  const updateMutation = useMutation({
    mutationFn: () => updateUser(editing!.id, form),
    onSuccess: () => {
      toast.success("User updated")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setEditing(null)
    },
    onError: () => toast.error("Failed to update user"),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted")
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: () => toast.error("Failed to delete user"),
  })

  const openEdit = (user: User) => {
    setEditing(user)
    setForm({
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive ?? true,
    })
  }

  return (
    <div>
      <PageHeader title="Users" description="Manage customer and admin accounts" />

      <DataTable
        isLoading={isLoading}
        data={data?.data ?? []}
        rowKey={(r) => r.id}
        columns={[
          { key: "name", header: "Name", cell: (r) => r.fullName },
          { key: "email", header: "Email", cell: (r) => r.email },
          { key: "role", header: "Role", cell: (r) => r.role },
          {
            key: "status",
            header: "Status",
            cell: (r) => (
              <StatusBadge status={r.isActive !== false ? "ACTIVE" : "INACTIVE"} />
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

      {data?.meta && (
        <TablePagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
        />
      )}

      <Sheet open={!!editing} onOpenChange={() => setEditing(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit User</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Field>
              <FieldLabel>Full Name</FieldLabel>
              <FieldContent>
                <Input
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Role</FieldLabel>
              <FieldContent>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="VENDOR">Vendor</SelectItem>
                  </SelectContent>
                </Select>
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
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
            >
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
