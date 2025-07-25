"use client";

import { useState, useEffect, Suspense } from "react";
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
  TrendingUp,
  ArrowRight,
  Target,
  FileText,
  Calendar,
  Clock,
  Download,
  Users,
  Star,
  Archive
} from "lucide-react";

function PreviousYearPapersContent() {
  const { categories, exams } = useExam();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [popularCategories, setPopularCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    // Get popular categories that have PYP configuration
    const popular = categories.filter((cat: any) =>
      cat.isPopular &&
      cat.isActive !== false &&
      cat.pypConfig?.hasYearlyPapers
    );
    setPopularCategories(popular);
  }, [categories]);

  // Calculate PYP stats for each category
  const getCategoryPYPStats = (categoryId: string) => {
    const categoryExams = exams.filter((exam: any) =>
      exam.categoryId === categoryId &&
      exam.isActive &&
      exam.examType === 'pyp'
    );

    return {
      totalPapers: categoryExams.length,
      recentPapers: categoryExams.filter((exam: any) => {
        const examDate = new Date(exam.createdAt);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return examDate > oneYearAgo;
      }).length
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

  // Get categories with PYP papers
  const categoriesWithPYP = filteredCategories.filter(cat =>
    getCategoryPYPStats(cat.id).totalPapers > 0
  );

  return (
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
              <Archive className="h-4 w-4 mr-2" />
              Previous Year Papers
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-canva-gray-900 mb-4">
              Access <span className="bg-canva-purple-gradient bg-clip-text text-transparent">Previous Year Papers</span>
            </h1>
            <p className="text-lg text-canva-gray-600 max-w-3xl mx-auto leading-relaxed">
              Practice with authentic previous year question papers to boost your exam preparation
              and understand the exam pattern better.
            </p>
          </motion.div>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-canva-gray-400" />
            <Input
              type="text"
              placeholder="Search for previous year papers..."
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
                    <h2 className="text-2xl font-bold text-canva-gray-900">Popular Previous Year Papers</h2>
                    <p className="text-sm text-canva-gray-600">Most downloaded exam papers</p>
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
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
              >
                {popularCategories.map((category: any) => {
                  const stats = getCategoryPYPStats(category.id);

                  return (
                    <motion.div key={category.id} variants={itemVariants}>
                      <Link
                        href={`/previous-year-papers/${category.slug || category.id}`}
                        className="group block"
                      >
                        <Card className="hover-lift-canva transition-all duration-300 bg-card-gradient border border-canva-blue-200/40 shadow-canva h-full">
                          <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-canva overflow-hidden bg-canva-button-purple flex items-center justify-center shadow-canva-purple">
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
                            <h4 className="font-semibold text-sm mb-2 text-canva-gray-900 group-hover:text-canva-blue-600 transition-colors line-clamp-2">
                              {category.name}
                            </h4>
                            <div className="flex items-center justify-center gap-1 text-xs text-canva-gray-600">
                              <FileText className="h-3 w-3" />
                              {stats.totalPapers} Papers
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>

              {popularCategories.length > 6 && (
                <div className="text-center mt-8">
                  <Button variant="outline" className="bg-canva-blue-50 text-canva-blue-600 border-canva-blue-200 hover:bg-canva-blue-100 rounded-canva">
                    Load more categories
                  </Button>
                </div>
              )}
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
                  <h2 className="text-2xl font-bold text-canva-gray-900">All Previous Year Papers</h2>
                  <p className="text-sm text-canva-gray-600">
                    Get exam-ready with authentic question papers and study notes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1 bg-canva-blue-50 text-canva-blue-700 border-canva-blue-200 rounded-canva">
                  <FileText className="h-3 w-3 mr-1" />
                  {categoriesWithPYP.reduce((total, cat) => total + getCategoryPYPStats(cat.id).totalPapers, 0)} Papers
                </Badge>
              </div>
                         </div>

            {/* Enhanced Two Column Layout */}
            <div className="bg-card-gradient rounded-canva-lg shadow-canva border border-canva-blue-200/40 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                              {/* Enhanced Left Column - Categories List */}
                <div className="lg:col-span-4">
                  <div className="space-y-2">
                    {categoriesWithPYP.map((category: any, index: number) => {
                      const stats = getCategoryPYPStats(category.id);
                      const isActive = selectedCategory === category.id;

                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(isActive ? null : category.id)}
                          className={`w-full text-left p-4 rounded-canva transition-all duration-200 hover-lift-canva ${isActive
                            ? 'bg-canva-blue-100 border-l-3 border-l-canva-blue-500 shadow-canva'
                            : 'bg-white/80 hover:bg-canva-blue-50 border border-canva-gray-200'
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-canva overflow-hidden bg-canva-button-pink flex items-center justify-center flex-shrink-0 shadow-canva-pink">
                              {category.thumbnailUrl ? (
                                <img
                                  src={category.thumbnailUrl}
                                  alt={`${category.name} Previous Year Paper`}
                                  title={`${category.name} Previous Year Paper`}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="text-white font-bold text-lg">
                                  {category.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <span className={`font-semibold text-sm block ${isActive ? 'text-canva-blue-700' : 'text-canva-gray-900'}`}>
                                {category.name}
                              </span>
                              <div className="text-xs text-canva-gray-600 mt-1 flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {stats.totalPapers} Papers
                              </div>
                            </div>
                            <ArrowRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90 text-canva-blue-600' : 'text-canva-gray-400'
                              }`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                              {/* Enhanced Right Column - Papers Content */}
                <div className="lg:col-span-8">
                  <div className="bg-white/50 rounded-canva p-6">
                    {selectedCategory ? (
                      <div>
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                          {(() => {
                            const categoryPapers = exams.filter((exam: any) =>
                              exam.categoryId === selectedCategory &&
                              exam.isActive &&
                              exam.examType === 'pyp'
                            );

                            // Show individual papers for the selected category
                            return categoryPapers.slice(0, 12).map((paper: any) => (
                              <motion.div key={paper.id} variants={itemVariants}>
                                <Link
                                  href={`/exams/${paper.id}`}
                                  className="group block"
                                >
                                  <Card className="hover-lift-canva transition-all duration-300 bg-card-gradient border border-canva-blue-200/40 shadow-canva h-full">
                                    <CardContent className="p-4 text-center">
                                      <div className="w-12 h-12 mx-auto mb-3 rounded-canva overflow-hidden bg-canva-button-blue flex items-center justify-center shadow-canva">
                                        <FileText className="h-6 w-6 text-white" />
                                      </div>
                                      <h4 className="font-semibold text-sm mb-2 text-canva-gray-900 group-hover:text-canva-blue-600 transition-colors line-clamp-2" title={paper.title}>
                                        {paper.title}
                                      </h4>
                                      <div className="text-xs text-canva-gray-600 flex items-center justify-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        {paper.duration}m • {paper.totalQuestions} Questions
                                      </div>
                                    </CardContent>
                                  </Card>
                                </Link>
                              </motion.div>
                            ));
                          })()}
                        </motion.div>

                        {/* Enhanced View All Link */}
                        <div className="text-center mt-8">
                          <Button variant="outline" className="bg-canva-blue-50 text-canva-blue-600 border-canva-blue-200 hover:bg-canva-blue-100 rounded-canva" asChild>
                            <Link href={`/previous-year-papers/${categories.find(cat => cat.id === selectedCategory)?.slug || selectedCategory
                              }`}>
                              View All Papers
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 bg-canva-purple-100 rounded-canva-lg flex items-center justify-center">
                          <Target className="h-8 w-8 text-canva-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-canva-gray-900">Select a Category</h3>
                        <p className="text-canva-gray-600">
                          Choose a category from the left to view available previous year papers
                        </p>
                      </div>
                    )}
                  </div>
                </div>
            </div>

            {/* Enhanced Mobile View - Show all categories in grid */}
            <div className="lg:hidden mt-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {categoriesWithPYP.map((category: any) => {
                  const stats = getCategoryPYPStats(category.id);

                  return (
                    <motion.div key={category.id} variants={itemVariants}>
                      <Link
                        href={`/previous-year-papers/${category.slug || category.id}`}
                        className="group block"
                      >
                        <Card className="hover-lift-canva transition-all duration-300 bg-card-gradient border border-canva-blue-200/40 shadow-canva h-full">
                          <CardContent className="p-4 text-center">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-canva overflow-hidden bg-canva-button-purple flex items-center justify-center shadow-canva-purple">
                              {category.thumbnailUrl ? (
                                <img
                                  src={category.thumbnailUrl}
                                  alt={`${category.name} Previous Year Paper`}
                                  title={`${category.name} Previous Year Paper`}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="text-white font-bold text-xl">
                                  {category.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-base mb-2 text-canva-gray-900 group-hover:text-canva-blue-600 transition-colors">
                              {category.name}
                            </h3>
                            <div className="text-sm text-canva-gray-600 flex items-center justify-center gap-1">
                              <FileText className="h-3 w-3" />
                              {stats.totalPapers} Papers
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                                  })}
                </motion.div>
              </div>
            </div>

            {categoriesWithPYP.length === 0 && (
              <div className="text-center py-16 bg-card-gradient rounded-canva-lg border border-canva-blue-200/40 shadow-canva">
                <div className="w-16 h-16 mx-auto mb-4 bg-canva-purple-100 rounded-canva-lg flex items-center justify-center">
                  <FileText className="h-8 w-8 text-canva-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-canva-gray-900">No previous year papers found</h3>
                <p className="text-canva-gray-600 mb-6">
                  {searchQuery ? "Try adjusting your search query" : "Previous year papers will appear here"}
                </p>
                {searchQuery && (
                  <Button onClick={() => setSearchQuery("")} variant="outline" className="bg-canva-blue-50 text-canva-blue-600 border-canva-blue-200 hover:bg-canva-blue-100 rounded-canva">
                    Clear Search
                  </Button>
                )}
              </div>
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
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="p-3 bg-white/20 rounded-canva backdrop-blur-sm">
                <Archive className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Master Your Exams with Previous Year Papers
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Practice with authentic previous year questions and boost your exam preparation with our comprehensive collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-canva-purple-600 hover:bg-white/90 px-8 py-6 text-lg font-semibold rounded-canva shadow-canva" asChild>
                <Link href="/register">
                  Start Practicing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-canva backdrop-blur-sm" asChild>
                <Link href="/categories">
                  Browse Categories
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function PreviousYearPapersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-canva-gradient flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading previous year papers...</p>
        </div>
      </div>
    }>
      <PreviousYearPapersContent />
    </Suspense>
  );
}