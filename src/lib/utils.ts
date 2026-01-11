import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert relative image path to full Supabase storage URL
 * Handles paths like "/images/vocab/baju.png" -> full Supabase URL
 */
export function getImageUrl(path: string | undefined | null): string | undefined {
  if (!path) return undefined;

  // Already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Convert relative path to Supabase storage URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return path;

  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
}
