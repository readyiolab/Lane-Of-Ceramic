import { useState } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { uploadImage, addProductImage, deleteProductImage } from "@/api/endpoints"
import { Button } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query"

export interface ProductImage {
  id: number
  url: string
  isPrimary: boolean
}

interface ImageGalleryProps {
  productId?: number
  images?: ProductImage[]
  onImagesChange?: (urls: string[]) => void
  localImages?: string[]
}

export function ImageGallery({
  productId,
  images = [],
  onImagesChange,
  localImages = [],
}: ImageGalleryProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set())
  const [optimisticUploads, setOptimisticUploads] = useState<string[]>([])
  const queryClient = useQueryClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    let currentLocalImages = [...localImages];
    let didUploadNew = false;

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`)
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB.`)
        continue
      }
      
      try {
        setIsUploading(true)
        const res = await uploadImage(file, "products")
        
        if (productId) {
          // If editing an existing product, associate image immediately
          setOptimisticUploads(prev => [...prev, res.url])
          await addProductImage(productId, { url: res.url, isPrimary: images.length === 0 })
        } else if (onImagesChange) {
          // If creating a new product, accumulate URLs
          currentLocalImages.push(res.url)
          didUploadNew = true;
        }
        
      } catch (err) {
        console.error("Upload error:", err)
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    
    setIsUploading(false)
    e.target.value = "" // reset file input

    if (!productId && didUploadNew && onImagesChange) {
      onImagesChange(currentLocalImages);
    }

    if (productId) {
      // Refresh product data to fetch new images
      await queryClient.invalidateQueries({ queryKey: ["product"] })
      setOptimisticUploads([]) // Clear optimistic uploads once real data is fetched
      toast.success("Images uploaded successfully")
    }
  }

  const handleDelete = async (imageId: number) => {
    if (!productId) return
    
    // Optimistic deletion
    setDeletedIds(prev => new Set(prev).add(imageId))
    
    try {
      await deleteProductImage(productId, imageId)
      await queryClient.invalidateQueries({ queryKey: ["product"] })
      toast.success("Image deleted")
    } catch (err) {
      setDeletedIds(prev => {
        const next = new Set(prev)
        next.delete(imageId)
        return next
      })
      toast.error("Failed to delete image")
    }
  }

  const handleLocalDelete = (index: number) => {
    if (onImagesChange) {
      const newImages = [...localImages]
      newImages.splice(index, 1)
      onImagesChange(newImages)
    }
  }



  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Product Images</label>
      
      <div className="flex flex-wrap gap-4">
        {/* Render existing images from server (excluding optimistically deleted ones) */}
        {productId && images.filter(img => !deletedIds.has(img.id)).map((img) => (
          <div key={img.id} className="relative inline-block w-32 h-32 group border rounded-md overflow-hidden bg-muted">
            <img src={img.url} alt="Product view" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleDelete(img.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            {img.isPrimary && (
              <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">
                Primary
              </div>
            )}
          </div>
        ))}

        {/* Render optimistic uploads (while waiting for server refetch) */}
        {productId && optimisticUploads.map((url, index) => (
          <div key={`opt-${index}`} className="relative inline-block w-32 h-32 group border rounded-md overflow-hidden bg-muted opacity-70">
            <img src={url} alt="Uploading..." className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          </div>
        ))}
        
        {/* Render local images (for new products) */}
        {!productId && localImages.map((url, index) => (
          <div key={index} className="relative inline-block w-32 h-32 group border rounded-md overflow-hidden bg-muted">
            <img src={url} alt="Product view local" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleLocalDelete(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        {/* Upload Button */}
        <div className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-md bg-muted/20 hover:bg-muted/40 transition-colors relative cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground text-center px-2">Add Images</span>
              <span className="text-[10px] text-muted-foreground text-center px-2 mt-1">Max 5MB each</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
