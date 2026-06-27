import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createProduct,
  getBrands,
  getCategories,
  getProductBySlug,
  updateProduct,
} from "@/api/endpoints"
import { LoadingState } from "@/components/LoadingState"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  sku: z.string().min(2, "SKU is required"),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  categoryId: z.number({ error: "Category is required" }).positive("Category is required"),
  brandId: z.number().optional(),
  price: z.number({ error: "Price is required" }).positive("Price must be positive"),
  salePrice: z.number().optional(),
  stockCount: z.number().int().min(0),
  isFeatured: z.boolean(),
  isTrending: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export function ProductFormPage() {
  const { slug } = useParams<{ slug: string }>()
  const isEdit = slug !== "new"
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: isEdit && !!slug,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stockCount: 0,
      isFeatured: false,
      isTrending: false,
    },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        shortDescription: product.shortDescription ?? "",
        longDescription: product.longDescription ?? "",
        material: product.material ?? "",
        dimensions: product.dimensions ?? "",
        weight: product.weight ?? "",
        categoryId: product.categoryId,
        brandId: product.brandId ?? undefined,
        price: product.price,
        salePrice: product.salePrice ?? undefined,
        stockCount: product.stockCount,
        isFeatured: product.isFeatured ?? false,
        isTrending: product.isTrending ?? false,
        seoTitle: product.seoTitle ?? "",
        seoDescription: product.seoDescription ?? "",
      })
    }
  }, [product, reset])

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const payload = {
        ...values,
        brandId: values.brandId || undefined,
        salePrice: values.salePrice || undefined,
      }
      return isEdit && product
        ? updateProduct(product.id, payload)
        : createProduct(payload)
    },
    onSuccess: () => {
      toast.success(isEdit ? "Product updated" : "Product created")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      navigate("/products")
    },
    onError: () => toast.error("Failed to save product"),
  })

  if (isEdit && loadingProduct) {
    return <LoadingState label="Loading product…" />
  }

  const categoryId = watch("categoryId")
  const brandId = watch("brandId")

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Product" : "New Product"}
        actions={
          <Button variant="outline" asChild>
            <Link to="/products">Cancel</Link>
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        className="max-w-3xl space-y-6 rounded-none border border-border bg-card p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.name}>
            <FieldLabel>Name</FieldLabel>
            <FieldContent>
              <Input {...register("name")} />
              <FieldError errors={[errors.name]} />
            </FieldContent>
          </Field>
          <Field data-invalid={!!errors.sku}>
            <FieldLabel>SKU</FieldLabel>
            <FieldContent>
              <Input {...register("sku")} />
              <FieldError errors={[errors.sku]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel>Short Description</FieldLabel>
          <FieldContent>
            <Textarea rows={2} {...register("shortDescription")} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Long Description</FieldLabel>
          <FieldContent>
            <Textarea rows={4} {...register("longDescription")} />
          </FieldContent>
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel>Material</FieldLabel>
            <FieldContent>
              <Input {...register("material")} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Dimensions</FieldLabel>
            <FieldContent>
              <Input {...register("dimensions")} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Weight</FieldLabel>
            <FieldContent>
              <Input {...register("weight")} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.categoryId}>
            <FieldLabel>Category</FieldLabel>
            <FieldContent>
              <Select
                value={categoryId ? String(categoryId) : undefined}
                onValueChange={(v) => setValue("categoryId", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.categoryId]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Brand</FieldLabel>
            <FieldContent>
              <Select
                value={brandId ? String(brandId) : "none"}
                onValueChange={(v) =>
                  setValue("brandId", v === "none" ? undefined : Number(v))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field data-invalid={!!errors.price}>
            <FieldLabel>Price (₹)</FieldLabel>
            <FieldContent>
              <Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
              <FieldError errors={[errors.price]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Sale Price (₹)</FieldLabel>
            <FieldContent>
              <Input type="number" step="0.01" {...register("salePrice", { valueAsNumber: true })} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Stock Count</FieldLabel>
            <FieldContent>
              <Input type="number" {...register("stockCount", { valueAsNumber: true })} />
            </FieldContent>
          </Field>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isFeatured")} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isTrending")} />
            Trending
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>SEO Title</FieldLabel>
            <FieldContent>
              <Input {...register("seoTitle")} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>SEO Description</FieldLabel>
            <FieldContent>
              <Input {...register("seoDescription")} />
            </FieldContent>
          </Field>
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Spinner className="size-4" />
          ) : isEdit ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </Button>
      </form>
    </div>
  )
}
