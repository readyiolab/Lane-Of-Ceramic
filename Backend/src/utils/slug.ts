/**
 * Generate a URL-safe slug from a string. Handles collision via optional suffix.
 */
export function slugify(text: string, suffix?: string): string {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")      // Remove non-word chars (except spaces/hyphens)
    .replace(/[\s_]+/g, "-")        // Replace spaces/underscores with hyphens
    .replace(/-+/g, "-")            // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, "");       // Trim leading/trailing hyphens

  if (suffix) {
    slug = `${slug}-${suffix}`;
  }

  return slug;
}

/**
 * Generate slug with random suffix for uniqueness.
 */
export function uniqueSlug(text: string): string {
  const rand = Math.random().toString(36).substring(2, 7);
  return slugify(text, rand);
}
