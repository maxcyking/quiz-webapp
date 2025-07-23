"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useExam } from "@/context/exam-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  BookOpen, 
  Users, 
  Clock, 
  Star,
  TrendingUp,
  ArrowRight,
  Grid3X3,
  List,
  Calendar,
  Award
} from "lucide-react";

function CategoriesContent() {
  const { categories, exams } = useExam();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);

  useEffect(() => {
    // Filter categories based on search query
    if (searchQuery) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [categories, searchQuery]);

  // Calculate stats for each category
  const getCategoryStats = (categoryId: string) => {
    const categoryExams = exams.filter(exam => exam.categoryId === categoryId);
    return {
      totalExams: categoryExams.length,
      activeExams: categoryExams.filter(exam => exam.isActive).length,
      upcomingExams: categoryExams.filter(exam => {
        const startDate = exam.startDate ? new Date(exam.startDate) : new Date();
        return exam.isActive && startDate > new Date();
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30">
              <BookOpen className="h-4 w-4 mr-2" />
              Explore Categories
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect <span className="text-yellow-300">Exam Category</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Choose from our comprehensive collection of exam categories. 
              Each category is carefully curated with practice tests and study materials.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {filteredCategories.length} Categories Available
              </h2>
              <p className="text-gray-600">
                Find the perfect category for your exam preparation
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="px-3"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Categories Grid/List */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? "Try adjusting your search query" : "Categories will appear here"}
              </p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery("")} variant="outline">
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "space-y-6"
              }
            >
              {filteredCategories.map((category, index) => {
                const stats = getCategoryStats(category.id);
                
                return (
                  <motion.div key={category.id} variants={itemVariants}>
                    <Card className={`group hover:shadow-xl transition-all duration-300 border-0 bg-white ${
                      viewMode === "list" ? "flex flex-row items-center" : "h-full"
                    }`}>
                      {viewMode === "grid" ? (
                        <>
                          <CardHeader>
                            <div className="flex items-center justify-between mb-4">
                              <div 
                                className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}
                              >
                                {category.icon}
                              </div>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {stats.totalExams} Exams
                              </Badge>
                            </div>
                            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {category.name}
                            </CardTitle>
                            <CardDescription className="text-gray-600 line-clamp-2">
                              {category.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.activeExams}</div>
                                <div className="text-xs text-gray-500">Active</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">{stats.upcomingExams}</div>
                                <div className="text-xs text-gray-500">Upcoming</div>
                              </div>
                            </div>
                            <Button asChild className="w-full group-hover:bg-blue-600 transition-colors">
                              <Link href={`/exams?category=${category.id}`}>
                                Explore Exams
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                          </CardContent>
                        </>
                      ) : (
                        <>
                          <div className="flex-shrink-0 p-6">
                            <div 
                              className={`w-16 h-16 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}
                            >
                              {category.icon}
                            </div>
                          </div>
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {category.name}
                              </h3>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 ml-4">
                                {stats.totalExams} Exams
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {category.description}
                            </p>
                            <div className="flex items-center gap-6 mb-4">
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-600">{stats.activeExams} Active</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-orange-600" />
                                <span className="text-sm text-gray-600">{stats.upcomingExams} Upcoming</span>
                              </div>
                            </div>
                            <Button asChild className="group-hover:bg-blue-600 transition-colors">
                              <Link href={`/exams?category=${category.id}`}>
                                Explore Exams
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                          </div>
                        </>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of successful students who have achieved their goals with our comprehensive exam preparation platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold" asChild>
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg" asChild>
                <Link href="/exams">
                  Browse All Exams
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  );
} 