import { useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useAuth } from "@/auth/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  if (isAuthenticated && isAdmin) {
    return <Navigate to={from} replace />
  }

  const onSubmit = async (values: LoginForm) => {
    setSubmitting(true)
    try {
      await login(values.email, values.password)
      toast.success("Welcome back!")
      navigate(from, { replace: true })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid credentials"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh">
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Ceramic Studio</h1>
          <p className="mt-2 text-sm tracking-widest uppercase opacity-80">
            Admin Console
          </p>
        </div>
        <p className="max-w-md text-sm leading-relaxed opacity-90">
          Manage products, orders, promotions, and storefront content from one
          place. Handcrafted dinnerware, curated with care.
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden">
            <h1 className="font-heading text-2xl font-semibold text-primary">
              Ceramic Studio Admin
            </h1>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use your admin account credentials
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@ceramicstudio.com"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </FieldContent>
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <FieldContent>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </FieldContent>
            </Field>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Spinner className="size-4" /> : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
