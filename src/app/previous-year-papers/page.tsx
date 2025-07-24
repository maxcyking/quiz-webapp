"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useExam } from "@/context/exam-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Target,
  FileText,
  Calendar
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
      {/* Search Bar Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Previous Year Papers
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Access comprehensive collection of previous year question papers
            </p>
          </div>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for exam papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg bg-glass border-0 shadow-canva"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-20">
        {/* Popular Categories Section - Your Enrolled Exams Style */}
        {popularCategories.length > 0 && (
          <section className="mb-16">
            <div className="wrapper">
              <div className="card-caption mb-8">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Popular Previous Year Papers</h2>
                  <TrendingUp className="h-6 w-6 text-canva-orange-500" />
                </div>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="card-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
              >
                {popularCategories.map((category: any) => {
                  const stats = getCategoryPYPStats(category.id);

                  return (
                    <motion.div key={category.id} variants={itemVariants}>
                      <Link
                        href={`/previous-year-papers/${category.slug || category.id}`}
                        className="card card--explore group block"
                      >
                        <Card className="hover:shadow-xl transition-all duration-300 bg-glass border-0 shadow-canva h-full">
                          <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-lg overflow-hidden bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center">
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
                            <h4 className="font-semibold text-sm mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                              {category.name}
                            </h4>
                            <div className="count text-xs text-gray-600 dark:text-gray-400">
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
                  <Button variant="outline" className="view-all btn-anchor">
                    Load more exams
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* All Categories Section */}
        <section className="wrapper target-list">
          <div className="lms-custom-style mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Explore Previous Year Paper of all Exams
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Get exam-ready with concepts, questions and study notes as per the latest pattern
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="exams-card">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Categories List */}
              <div className="lg:col-span-4">
                <div className="exams-card__list space-y-2">
                  {categoriesWithPYP.map((category: any, index: number) => {
                    const stats = getCategoryPYPStats(category.id);
                    const isActive = selectedCategory === category.id;

                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(isActive ? null : category.id)}
                        className={`tab tab-grid w-full text-left p-4 rounded-lg transition-all duration-200 ${isActive
                          ? 'active bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 border-l-4 border-primary-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center flex-shrink-0">
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
                            <span className="tab__text font-semibold text-sm block">
                              {category.name}
                            </span>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {stats.totalPapers} Papers
                            </div>
                          </div>
                          <ArrowRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90' : ''
                            }`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column - Subcategories/Exams Content */}
              <div className="lg:col-span-8">
                <div className="exams-card__content">
                  {selectedCategory ? (
                    <div className="card-grid--explore">
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
                                className="card card--explore group block"
                              >
                                <Card className="hover:shadow-lg transition-all duration-300 bg-glass border-0 shadow-canva h-full">
                                  <CardContent className="p-4 text-center">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-lg overflow-hidden bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center">
                                      <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <h4 className="h4 font-semibold text-sm mb-2 group-hover:text-primary-600 transition-colors line-clamp-2" title={paper.title}>
                                      {paper.title}
                                    </h4>
                                    <div className="count text-xs text-gray-600 dark:text-gray-400">
                                      {paper.duration}m • {paper.totalQuestions} Questions
                                    </div>
                                  </CardContent>
                                </Card>
                              </Link>
                            </motion.div>
                          ));
                        })()}
                      </motion.div>

                      {/* View All Link */}
                      <div className="text-center mt-8">
                        <Button variant="outline" asChild>
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
                      <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">Select a Category</h3>
                      <p className="text-muted-foreground">
                        Choose a category from the left to view available previous year papers
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile View - Show all categories in grid */}
            <div className="exams-card-mweb lg:hidden">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="card-grid card-grid--explore grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {categoriesWithPYP.map((category: any) => {
                  const stats = getCategoryPYPStats(category.id);

                  return (
                    <motion.div key={category.id} variants={itemVariants}>
                      <Link
                        href={`/previous-year-papers/${category.slug || category.id}`}
                        className="card card--explore group block"
                      >
                        <Card className="hover:shadow-lg transition-all duration-300 bg-glass border-0 shadow-canva h-full">
                          <CardContent className="p-4 text-center">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-lg overflow-hidden bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center exams-card-mweb__img">
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
                            <h3 className="h3 font-semibold text-base mb-2 group-hover:text-primary-600 transition-colors">
                              {category.name}
                            </h3>
                            <div className="count text-sm text-gray-600 dark:text-gray-400">
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

            {categoriesWithPYP.length === 0 && (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No previous year papers found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? "Try adjusting your search query" : "Previous year papers will appear here"}
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Master Your Exams with Previous Year Papers
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Practice with authentic previous year questions and boost your exam preparation with our comprehensive collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold" asChild>
                <Link href="/register">
                  Start Practicing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg" asChild>
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