import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function optimizeImage(url: string, width: number): string {
  if (!url) return url;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
  }
  if (url.includes("images.unsplash.com")) {
    const urlObj = new URL(url);
    urlObj.searchParams.set("w", String(width));
    urlObj.searchParams.set("q", "80");
    urlObj.searchParams.set("auto", "format");
    return urlObj.toString();
  }
  return url;
}
