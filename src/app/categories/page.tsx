"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useExam } from "@/context/exam-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Target,
  Sparkles,
  Clock,
  Users,
  Star,
  Filter,
  Grid3X3
} from "lucide-react";

function CategoriesContent() {
  const { categories, exams } = useExam();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [popularCategories, setPopularCategories] = useState<any[]>([]);

  useEffect(() => {
    // Filter categories based on search query
    if (searchQuery) {
      const filtered = categories.filter((category: any) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories.filter((cat: any) => cat.isActive !== false));
    }
  }, [categories, searchQuery]);

  useEffect(() => {
    // Get popular categories
    const popular = categories.filter((cat: any) => cat.isPopular && cat.isActive !== false);
    setPopularCategories(popular);
  }, [categories]);

  // Calculate stats for each category
  const getCategoryStats = (categoryId: string) => {
    const categoryExams = exams.filter((exam: any) => exam.categoryId === categoryId && exam.isActive);
    const activeExams = categoryExams.filter((exam: any) => exam.status === 'active').length;
    const upcomingExams = categoryExams.filter((exam: any) => exam.status === 'upcoming').length;

    return {
      totalExams: categoryExams.length,
      activeExams,
      upcomingExams,
      pypCount: categoryExams.filter((exam: any) => exam.examType === 'pyp').length,
      testSeriesCount: categoryExams.filter((exam: any) => exam.examType === 'test-series').length
    };
  };



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

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-canva-gradient">
        {/* Header Section */}
        <section className="py-12 bg-glass border-b">
          <div className="container mx-auto px-4">
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for your exam category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-glass border-0 shadow-canva rounded-xl"
              />
            </div>
          </div>
        </section>

      <div className="container mx-auto px-4 pb-20">
        {/* Popular Categories Section */}
        {popularCategories.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Popular Categories</h2>
                    <p className="text-sm text-muted-foreground">Most sought-after exam categories</p>
                  </div>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  {popularCategories.length} Categories
                </Badge>
              </div>
              
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {popularCategories.map((category: any) => (
                  <motion.div key={category.id} variants={itemVariants}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Card className="group hover:shadow-xl transition-all duration-300 bg-glass border-0 shadow-canva rounded-2xl overflow-hidden h-full cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                              {/* Category Icon/Image */}
                              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                {category.thumbnailUrl ? (
                                  <img
                                    src={category.thumbnailUrl}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <span className="text-white font-bold text-xl">
                                    {category.name.charAt(0)}
                                  </span>
                                )}
                              </div>

                              {/* Category Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold group-hover:text-primary-600 transition-colors truncate">
                                  {category.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    <Users className="h-3 w-3 mr-1" />
                                    Popular
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {category.description || "Explore comprehensive exam preparation materials"}
                            </p>

                            {/* Explore Button */}
                            <Button
                              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-xl font-semibold transition-all duration-300 group-hover:scale-105"
                              asChild
                            >
                              <Link href={`/categories/${category.id}`}>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Explore
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">Click to explore exams</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* All Categories Section */}
        <section className="py-16 bg-glass/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">All Categories</h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredCategories.length} categories available
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {filteredCategories.reduce((total, cat) => total + getCategoryStats(cat.id).totalExams, 0)} Total Exams
                </Badge>
              </div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCategories.map((category: any) => {
                const stats = getCategoryStats(category.id);

                return (
                  <motion.div key={category.id} variants={itemVariants}>
                    <Card className="group hover:shadow-xl transition-all duration-300 bg-glass border-0 shadow-canva h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            {category.thumbnailUrl ? (
                              <img
                                src={category.thumbnailUrl}
                                alt={category.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-white text-lg font-bold">
                                {category.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg group-hover:text-primary-600 transition-colors truncate">
                              {category.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <BookOpen className="h-3 w-3" />
                              <span>{stats.totalExams} Tests</span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {category.description || "Comprehensive exam preparation materials and practice tests"}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center p-2 bg-primary-50 dark:bg-primary-950/50 rounded-lg">
                            <div className="text-sm font-bold text-primary-700 dark:text-primary-300">
                              {stats.activeExams}
                            </div>
                            <div className="text-xs text-muted-foreground">Active</div>
                          </div>
                          <div className="text-center p-2 bg-secondary-50 dark:bg-secondary-950/50 rounded-lg">
                            <div className="text-sm font-bold text-secondary-700 dark:text-secondary-300">
                              {stats.upcomingExams}
                            </div>
                            <div className="text-xs text-muted-foreground">Upcoming</div>
                          </div>
                          <div className="text-center p-2 bg-accent-50 dark:bg-accent-950/50 rounded-lg">
                            <div className="text-sm font-bold text-accent-700 dark:text-accent-300">
                              {stats.pypCount}
                            </div>
                            <div className="text-xs text-muted-foreground">PYP</div>
                          </div>
                        </div>
                        
                        <Button
                          className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white border-0 rounded-xl"
                          asChild
                        >
                          <Link href={`/categories/${category.id}`}>
                            <Target className="h-4 w-4 mr-2" />
                            Explore Category
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {filteredCategories.length === 0 && (
              <Card className="bg-glass border-0 shadow-canva">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/50 dark:to-secondary-900/50 rounded-2xl flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No categories found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {searchQuery 
                      ? "We couldn't find any categories matching your search. Try adjusting your search terms." 
                      : "Categories will appear here once they're available."
                    }
                  </p>
                  {searchQuery && (
                    <Button onClick={() => setSearchQuery("")} variant="outline" className="rounded-xl">
                      <Search className="h-4 w-4 mr-2" />
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white opacity-10"></div>
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Join thousands of successful students who have achieved their goals with our comprehensive exam preparation platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-white/90 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg" asChild>
                  <Link href="/register">
                    <Target className="mr-2 h-5 w-5" />
                    Get Started Free
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl backdrop-blur-sm" asChild>
                  <Link href="/exams">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Browse All Exams
                  </Link>
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto">
                <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="text-2xl font-bold mb-1">{filteredCategories.length}+</div>
                  <div className="text-sm text-white/80">Categories</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="text-2xl font-bold mb-1">
                    {filteredCategories.reduce((total, cat) => total + getCategoryStats(cat.id).totalExams, 0)}+
                  </div>
                  <div className="text-sm text-white/80">Practice Tests</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="text-2xl font-bold mb-1">10K+</div>
                  <div className="text-sm text-white/80">Students</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-canva-gradient flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  );
} 