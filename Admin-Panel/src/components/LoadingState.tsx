import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  label?: string
  fullScreen?: boolean
  className?: string
}

export function LoadingState({
  label = "Loading…",
  fullScreen = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-muted-foreground",
        fullScreen ? "min-h-svh" : "py-16",
        className,
      )}
    >
      <Spinner className="size-6" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
