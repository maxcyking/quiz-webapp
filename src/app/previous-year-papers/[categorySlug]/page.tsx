"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useExam } from "@/context/exam-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Download,
  Eye,
  Star,
  Filter,
  SortAsc
} from "lucide-react";

function CategoryPYPContent() {
  const params = useParams();
  const router = useRouter();
  const { categories, exams } = useExam();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPapers, setFilteredPapers] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'alphabetical'>('recent');

  const categorySlug = params.categorySlug as string;

  useEffect(() => {
    // Find category by slug or ID
    const foundCategory = categories.find(cat => 
      cat.slug === categorySlug || cat.id === categorySlug
    );
    
    if (foundCategory) {
      setCategory(foundCategory);
    } else if (categories.length > 0) {
      // Category not found, redirect to main PYP page
      router.push('/previous-year-papers');
      return;
    }
    
    setLoading(false);
  }, [categories, categorySlug, router]);

  useEffect(() => {
    if (!category) return;

    // Get all PYP papers for this category
    let categoryPapers = exams.filter((exam: any) => 
      exam.categoryId === category.id && 
      exam.isActive && 
      exam.examType === 'pyp'
    );

    // Apply search filter
    if (searchQuery) {
      categoryPapers = categoryPapers.filter((paper: any) =>
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        categoryPapers.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'popular':
        categoryPapers.sort((a: any, b: any) => 
          (b.attemptCount || 0) - (a.attemptCount || 0)
        );
        break;
      case 'alphabetical':
        categoryPapers.sort((a: any, b: any) => 
          a.title.localeCompare(b.title)
        );
        break;
    }

    setFilteredPapers(categoryPapers);
  }, [category, exams, searchQuery, sortBy]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canva-gradient flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading papers...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-canva-gradient">
      {/* Header Section */}
      <section className="py-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/previous-year-papers" className="hover:text-canva-purple-600 transition-colors">
              Previous Year Papers
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">{category.name}</span>
          </div>

          {/* Category Header */}
          <div className="flex items-center gap-6 mb-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-r from-canva-purple-400 to-canva-blue-400 flex items-center justify-center">
                {category.thumbnailUrl ? (
                  <img
                    src={category.thumbnailUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {category.name.charAt(0)}
                  </span>
                )}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {category.name} Previous Year Papers
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {category.description || `Access previous year question papers for ${category.name}`}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">
                    {filteredPapers.length} Papers Available
                  </Badge>
                  {category.pypConfig?.availableYears?.length > 0 && (
                    <Badge variant="outline">
                      Years: {category.pypConfig.availableYears.join(', ')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search papers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-canva"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('recent')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Recent
              </Button>
              <Button
                variant={sortBy === 'popular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('popular')}
              >
                <Star className="h-4 w-4 mr-2" />
                Popular
              </Button>
              <Button
                variant={sortBy === 'alphabetical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('alphabetical')}
              >
                <SortAsc className="h-4 w-4 mr-2" />
                A-Z
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Papers Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredPapers.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredPapers.map((paper: any) => (
                <motion.div key={paper.id} variants={itemVariants}>
                  <Card className="group hover:shadow-xl transition-all duration-300 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-0 shadow-canva h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-canva-purple-600 transition-colors line-clamp-2">
                            {paper.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {paper.description}
                          </p>
                        </div>
                        {paper.year && (
                          <Badge variant="outline" className="ml-2">
                            {paper.year}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{paper.duration}m</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{paper.totalQuestions} Questions</span>
                        </div>
                        {paper.attemptCount && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{paper.attemptCount}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-gradient-to-r from-canva-purple-500 to-canva-blue-500 hover:from-canva-purple-600 hover:to-canva-blue-600 text-white border-0"
                          asChild
                        >
                          <Link href={`/exams/${paper.id}`}>
                            <FileText className="h-4 w-4 mr-2" />
                            Attempt
                          </Link>
                        </Button>
                        {paper.downloadUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={paper.downloadUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No papers found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? "Try adjusting your search query" 
                  : `No previous year papers available for ${category.name} yet`
                }
              </p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery("")} variant="outline">
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function CategoryPYPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-canva-gradient flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading papers...</p>
        </div>
      </div>
    }>
      <CategoryPYPContent />
    </Suspense>
  );
}