"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/exam-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Grid3X3,
  Folder,
  FolderPlus,
  Eye,
  EyeOff
} from "lucide-react";
import type { Category } from "@/types/category";
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "@/lib/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminCategoriesPage() {
  const { categories, user } = useExam();
  const { toast } = useToast();
  const router = useRouter();

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "from-blue-500 to-cyan-500",
    parentCategoryId: "",
    type: "main" as "main" | "sub",
    slug: "",
    thumbnailUrl: "",
    isActive: true,
    isPopular: false,
    isFeatured: false,
    pypConfig: {
      hasYearlyPapers: false,
      availableYears: [] as number[],
      paperTypes: [] as string[]
    }
  });

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push("/dashboard");
      return;
    }
    loadCategories();
  }, [user, router]);

  // Update categories list when context categories change
  useEffect(() => {
    // Map context categories to ensure they have required fields
    const mappedCategories = categories.map(cat => {
      console.log("Category from context:", cat.name, "thumbnailUrl:", cat.thumbnailUrl);
      return {
        ...cat,
        type: (cat as any).type || 'main',
        slug: (cat as any).slug || cat.name?.toLowerCase().replace(/\s+/g, '-') || cat.id,
        parentCategoryId: (cat as any).parentCategoryId,
        pypConfig: (cat as any).pypConfig
      };
    }) as Category[];
    setCategoriesList(mappedCategories);
    setLoading(false);
  }, [categories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      // Use categories from context which are loaded via Firebase listener
      const mappedCategories = categories.map(cat => ({
        ...cat,
        type: (cat as any).type || 'main',
        slug: (cat as any).slug || cat.name?.toLowerCase().replace(/\s+/g, '-') || cat.id,
        parentCategoryId: (cat as any).parentCategoryId,
        pypConfig: (cat as any).pypConfig
      })) as Category[];
      setCategoriesList(mappedCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      icon: "",
      color: "from-blue-500 to-cyan-500",
      parentCategoryId: "",
      type: "main",
      slug: "",
      thumbnailUrl: "",
      isActive: true,
      isPopular: false,
      isFeatured: false,
      pypConfig: {
        hasYearlyPapers: false,
        availableYears: [],
        paperTypes: []
      }
    });
    setDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      parentCategoryId: category.parentCategoryId || "",
      type: category.type || "main",
      slug: category.slug || "",
      thumbnailUrl: category.thumbnailUrl || "",
      isActive: category.isActive,
      isPopular: (category as any).isPopular || false,
      isFeatured: (category as any).isFeatured || false,
      pypConfig: category.pypConfig || {
        hasYearlyPapers: false,
        availableYears: [],
        paperTypes: []
      }
    });
    setDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      // Validate form
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "Category name is required",
          variant: "destructive"
        });
        return;
      }

      // Generate slug if not provided
      const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const categoryData = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        type: formData.type,
        slug: slug,
        thumbnailUrl: formData.thumbnailUrl,
        isActive: formData.isActive,
        isPopular: formData.isPopular,
        isFeatured: formData.isFeatured,
        order: categoriesList.length + 1,
        ...(formData.type === 'sub' && formData.parentCategoryId && { parentCategoryId: formData.parentCategoryId }),
        ...(formData.pypConfig && { pypConfig: formData.pypConfig }),
        updatedAt: serverTimestamp()
      };

      // Debug log to check if thumbnailUrl is being saved
      console.log("Saving category with data:", categoryData);
      console.log("Thumbnail URL:", formData.thumbnailUrl);

      if (editingCategory) {
        // Update existing category
        await updateDoc(doc(db, "categories", editingCategory.id), categoryData);
        console.log("Category updated successfully");
      } else {
        // Create new category
        const docRef = await addDoc(collection(db, "categories"), {
          ...categoryData,
          createdAt: serverTimestamp()
        });
        console.log("Category created successfully with ID:", docRef.id);
      }

      toast({
        title: "Success",
        description: `Category ${editingCategory ? "updated" : "created"} successfully`,
      });

      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      // Delete from Firebase
      await deleteDoc(doc(db, "categories", categoryId));

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `categories/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setFormData(prev => ({ ...prev, thumbnailUrl: downloadURL }));
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    }
  };

  const mainCategories = categoriesList.filter(cat => cat.type === "main");
  const getSubcategories = (parentId: string) => 
    categoriesList.filter(cat => cat.parentCategoryId === parentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600 mt-2">Manage exam categories and subcategories</p>
        </div>
        <Button onClick={handleCreateCategory} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6">
        {mainCategories.map((category) => {
          const subcategories = getSubcategories(category.id);
          
          return (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                      {category.thumbnailUrl ? (
                        <img 
                          src={category.thumbnailUrl} 
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-r ${category.color} flex items-center justify-center text-2xl`}>
                          {category.icon}
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {(category as any).isPopular && (
                      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                        Popular
                      </Badge>
                    )}
                    {(category as any).isFeatured && (
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                        Featured
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Subcategories */}
              {subcategories.length > 0 && (
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Folder className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Subcategories</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subcategories.map((subcat) => (
                      <div
                        key={subcat.id}
                        className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                              {subcat.thumbnailUrl ? (
                                <img 
                                  src={subcat.thumbnailUrl} 
                                  alt={subcat.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-sm">{subcat.icon}</span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">{subcat.name}</h4>
                              <p className="text-sm text-gray-600">{subcat.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCategory(subcat)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(subcat.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? "Update the category information below"
                : "Fill in the details to create a new category"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Engineering"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g., engineering"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the category"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="⚙️"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color Theme</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="from-blue-500 to-cyan-500">Blue to Cyan</SelectItem>
                    <SelectItem value="from-red-500 to-pink-500">Red to Pink</SelectItem>
                    <SelectItem value="from-green-500 to-emerald-500">Green to Emerald</SelectItem>
                    <SelectItem value="from-purple-500 to-indigo-500">Purple to Indigo</SelectItem>
                    <SelectItem value="from-yellow-500 to-orange-500">Yellow to Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Category Type</Label>
                <Select value={formData.type} onValueChange={(value: "main" | "sub") => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Category</SelectItem>
                    <SelectItem value="sub">Subcategory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.type === "sub" && (
                <div className="space-y-2">
                  <Label htmlFor="parentCategory">Parent Category</Label>
                  <Select value={formData.parentCategoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, parentCategoryId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>Thumbnail Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                {formData.thumbnailUrl && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border">
                    <img 
                      src={formData.thumbnailUrl} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPopular"
                  checked={formData.isPopular}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPopular: checked }))}
                />
                <Label htmlFor="isPopular">Popular Category</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                />
                <Label htmlFor="isFeatured">Featured Category</Label>
              </div>
            </div>

            {/* PYP Configuration */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasYearlyPapers"
                  checked={formData.pypConfig.hasYearlyPapers}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    pypConfig: { ...prev.pypConfig, hasYearlyPapers: checked }
                  }))}
                />
                <Label htmlFor="hasYearlyPapers">Has Previous Year Papers</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? "Update" : "Create"} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 