import { useState } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { uploadImage } from "@/api/endpoints"
import { Button } from "@/components/ui/button"

interface SingleImageUploaderProps {
  label?: string
  value?: string | null
  onChange: (url: string) => void
  onRemove?: () => void
  folder?: string
}

export function SingleImageUploader({
  label = "Image",
  value,
  onChange,
  onRemove,
  folder = "categories",
}: SingleImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    try {
      setIsUploading(true)
      const res = await uploadImage(file, folder)
      onChange(res.url)
      toast.success("Image uploaded successfully")
    } catch (err) {
      console.error("Upload error:", err)
      toast.error("Failed to upload image")
    } finally {
      setIsUploading(false)
      // reset file input
      e.target.value = ""
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      {value ? (
        <div className="relative inline-block w-40 h-40 group">
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover rounded-md border"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (onRemove) onRemove()
                else onChange("")
              }}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full max-w-sm border-2 border-dashed rounded-md h-32 bg-muted/20 hover:bg-muted/40 transition-colors relative cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
            <span className="text-sm">
              {isUploading ? "Uploading..." : "Click or drag to upload"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
