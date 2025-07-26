import type { Category } from "@/types/category";

/**
 * Smart thumbnail inheritance utility for categories
 * If creating/editing a subcategory without a thumbnail, use parent's thumbnail
 */
export function getSmartThumbnailUrl(
  formData: {
    type: "main" | "sub";
    parentCategoryId?: string;
    thumbnailUrl?: string;
  },
  categories: Category[]
): string {
  // If it's a main category or already has a thumbnail, return as is
  if (formData.type === "main" || formData.thumbnailUrl) {
    return formData.thumbnailUrl || "";
  }

  // If it's a subcategory without thumbnail, inherit from parent
  if (formData.type === "sub" && formData.parentCategoryId && !formData.thumbnailUrl) {
    const parentCategory = categories.find(cat => cat.id === formData.parentCategoryId);
    if (parentCategory?.thumbnailUrl) {
      console.log(`🎯 Smart Inheritance: Using parent thumbnail from "${parentCategory.name}" for subcategory`);
      return parentCategory.thumbnailUrl;
    }
  }

  return formData.thumbnailUrl || "";
}

/**
 * Check if thumbnail should be inherited from parent
 */
export function shouldInheritThumbnail(
  formData: {
    type: "main" | "sub";
    parentCategoryId?: string;
    thumbnailUrl?: string;
  },
  categories: Category[]
): boolean {
  return (
    formData.type === "sub" && 
    !!formData.parentCategoryId && 
    !formData.thumbnailUrl &&
    categories.some(cat => cat.id === formData.parentCategoryId && cat.thumbnailUrl)
  );
}

/**
 * Get parent category information for display purposes
 */
export function getParentCategoryInfo(
  parentCategoryId: string,
  categories: Category[]
): { name: string; thumbnailUrl?: string } | null {
  const parent = categories.find(cat => cat.id === parentCategoryId);
  return parent ? { name: parent.name, thumbnailUrl: parent.thumbnailUrl } : null;
} 