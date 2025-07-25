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
        {/* Enhanced Header Section */}
        <section className="py-12 bg-glass border-b border-canva-blue-200/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <Badge className="mb-4 px-4 py-2 bg-canva-button-blue text-white border-0 rounded-canva canva-button-shimmer">
                <Grid3X3 className="h-4 w-4 mr-2" />
                Explore Categories
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-canva-gray-900 mb-4">
                Choose Your <span className="bg-canva-purple-gradient bg-clip-text text-transparent">Learning Path</span>
              </h1>
              <p className="text-lg text-canva-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover comprehensive exam categories designed to help you excel in your chosen field.
                From competitive exams to professional certifications.
              </p>
            </motion.div>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-canva-gray-400" />
              <Input
                type="text"
                placeholder="Search for your exam category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-card-gradient border border-canva-blue-200/40 shadow-canva rounded-canva-lg hover-lift-canva"
              />
            </div>
          </div>
        </section>

      <div className="container mx-auto px-4 pb-20">
        {/* Enhanced Popular Categories Section */}
        {popularCategories.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-canva-button-blue rounded-canva shadow-canva">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-canva-gray-900">Popular Categories</h2>
                    <p className="text-sm text-canva-gray-600">Most sought-after exam categories</p>
                  </div>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-canva-pink-50 text-canva-pink-700 border-canva-pink-200 rounded-canva">
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
                        <Card className="group hover-lift-canva transition-all duration-300 bg-card-gradient border border-canva-blue-200/40 shadow-canva rounded-canva-lg overflow-hidden h-full cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                              {/* Enhanced Category Icon/Image */}
                              <div className="w-16 h-16 rounded-canva overflow-hidden bg-canva-button-blue flex items-center justify-center flex-shrink-0 shadow-canva group-hover:scale-110 transition-transform duration-300">
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

                              {/* Enhanced Category Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-canva-gray-900 group-hover:text-canva-blue-600 transition-colors truncate">
                                  {category.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs bg-canva-purple-100 text-canva-purple-700 rounded-canva-sm">
                                    <Users className="h-3 w-3 mr-1" />
                                    Popular
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <p className="text-sm text-canva-gray-600 mb-4 line-clamp-2">
                              {category.description || "Explore comprehensive exam preparation materials"}
                            </p>

                            {/* Enhanced Explore Button */}
                            <Button
                              className="w-full bg-button-blue hover:bg-canva-button-blue-hover text-white rounded-canva font-semibold transition-all duration-300 group-hover:scale-105 canva-button-shimmer shadow-canva"
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
                        <p className="font-medium text-canva-gray-900">{category.name}</p>
                        <p className="text-xs text-canva-gray-600">Click to explore exams</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* Enhanced All Categories Section */}
        <section className="py-16 bg-glass/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-canva-button-purple rounded-canva shadow-canva">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-canva-gray-900">All Categories</h2>
                  <p className="text-sm text-canva-gray-600">
                    {filteredCategories.length} categories available
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1 bg-canva-blue-50 text-canva-blue-700 border-canva-blue-200 rounded-canva">
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
                    <Card className="group hover-lift-canva transition-all duration-300 bg-card-gradient border border-canva-blue-200/40 shadow-canva h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-canva overflow-hidden bg-canva-button-pink flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-canva-pink">
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
                            <CardTitle className="text-lg text-canva-gray-900 group-hover:text-canva-blue-600 transition-colors truncate">
                              {category.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-canva-gray-600">
                              <BookOpen className="h-3 w-3" />
                              <span>{stats.totalExams} Tests</span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-canva-gray-400 group-hover:text-canva-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <p className="text-sm text-canva-gray-600 mb-4 line-clamp-2">
                          {category.description || "Comprehensive exam preparation materials and practice tests"}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center p-2 bg-canva-blue-50 rounded-canva shadow-canva">
                            <div className="text-sm font-bold text-canva-blue-700">
                              {stats.activeExams}
                            </div>
                            <div className="text-xs text-canva-gray-500">Active</div>
                          </div>
                          <div className="text-center p-2 bg-canva-purple-50 rounded-canva shadow-canva">
                            <div className="text-sm font-bold text-canva-purple-700">
                              {stats.upcomingExams}
                            </div>
                            <div className="text-xs text-canva-gray-500">Upcoming</div>
                          </div>
                          <div className="text-center p-2 bg-canva-pink-50 rounded-canva shadow-canva">
                            <div className="text-sm font-bold text-canva-pink-700">
                              {stats.pypCount}
                            </div>
                            <div className="text-xs text-canva-gray-500">PYP</div>
                          </div>
                        </div>
                        
                        <Button
                          className="w-full bg-button-blue hover:bg-canva-button-blue-hover text-white border-0 rounded-canva canva-button-shimmer shadow-canva hover-lift-canva"
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
              <Card className="bg-card-gradient border border-canva-blue-200/40 shadow-canva">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-canva-blue-100 rounded-canva-lg flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-canva-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-canva-gray-900">No categories found</h3>
                  <p className="text-canva-gray-600 mb-6 max-w-md mx-auto">
                    {searchQuery 
                      ? "We couldn't find any categories matching your search. Try adjusting your search terms." 
                      : "Categories will appear here once they're available."
                    }
                  </p>
                  {searchQuery && (
                    <Button onClick={() => setSearchQuery("")} variant="outline" className="rounded-canva border-canva-blue-300 text-canva-blue-600 hover:bg-canva-blue-50">
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

        {/* Enhanced CTA Section */}
        <section className="py-20 bg-canva-purple-gradient text-white relative overflow-hidden">
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
                <div className="p-3 bg-white/20 rounded-canva backdrop-blur-sm">
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
                <Button size="lg" className="bg-white text-canva-purple-600 hover:bg-white/90 px-8 py-6 text-lg font-semibold rounded-canva shadow-canva" asChild>
                  <Link href="/register">
                    <Target className="mr-2 h-5 w-5" />
                    Get Started Free
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-canva backdrop-blur-sm" asChild>
                  <Link href="/exams">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Browse All Exams
                  </Link>
                </Button>
              </div>
              
              {/* Enhanced Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto">
                <div className="text-center p-4 bg-white/10 rounded-canva backdrop-blur-sm hover-lift-canva">
                  <div className="text-2xl font-bold mb-1">{filteredCategories.length}+</div>
                  <div className="text-sm text-white/80">Categories</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-canva backdrop-blur-sm hover-lift-canva">
                  <div className="text-2xl font-bold mb-1">
                    {filteredCategories.reduce((total, cat) => total + getCategoryStats(cat.id).totalExams, 0)}+
                  </div>
                  <div className="text-sm text-white/80">Practice Tests</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-canva backdrop-blur-sm hover-lift-canva">
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
          <div className="w-16 h-16 border-4 border-canva-blue-500 border-t-transparent rounded-canva animate-spin mx-auto mb-4"></div>
          <p className="text-canva-gray-600 text-lg font-medium">Loading categories...</p>
        </div>
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  );
} 