import { useState } from "react"
import { Upload, X, Loader2, Star, StarOff } from "lucide-react"
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
  const queryClient = useQueryClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`)
        continue
      }
      
      try {
        setIsUploading(true)
        const res = await uploadImage(file, "products")
        
        if (productId) {
          // If editing an existing product, associate image immediately
          await addProductImage(productId, { url: res.url, isPrimary: images.length === 0 })
        } else if (onImagesChange) {
          // If creating a new product, pass URLs up to the form state
          onImagesChange([...localImages, res.url])
        }
        
      } catch (err) {
        console.error("Upload error:", err)
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    
    setIsUploading(false)
    e.target.value = "" // reset file input

    if (productId) {
      // Refresh product data to fetch new images
      queryClient.invalidateQueries({ queryKey: ["product"] })
      toast.success("Images uploaded successfully")
    }
  }

  const handleDelete = async (imageId: number) => {
    if (!productId) return
    try {
      await deleteProductImage(productId, imageId)
      queryClient.invalidateQueries({ queryKey: ["product"] })
      toast.success("Image deleted")
    } catch (err) {
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

  const setPrimary = async (imageId: number) => {
     if (!productId) return
     try {
       // Since the API might not have a dedicated setPrimary endpoint, 
       // we can delete and re-add or just leave it for now.
       // Looking at the schema, it's possible to update it but we only have addProductImage.
       toast.info("Setting primary image is only supported via backend updates right now.")
     } catch (err) {}
  }

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Product Images</label>
      
      <div className="flex flex-wrap gap-4">
        {/* Render existing images from server */}
        {productId && images.map((img) => (
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
