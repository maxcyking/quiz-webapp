"use client";

import { useState, useEffect } from "react";
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
  Award,
  FileText,
  Download,
  Eye
} from "lucide-react";
import type { Category } from "@/types/category";

// Mock PYP data - replace with actual Firebase data
const mockPYPCategories = [
  {
    id: "ssc",
    name: "SSC Exams",
    icon: "🏛️",
    examCount: 724,
    description: "Staff Selection Commission Papers",
    thumbnail: "/images/ssc-thumb.jpg"
  },
  {
    id: "banking",
    name: "Banking Exams", 
    icon: "🏦",
    examCount: 433,
    description: "Banking and Financial Services Papers",
    thumbnail: "/images/banking-thumb.jpg"
  },
  {
    id: "railway",
    name: "Railway Exams",
    icon: "🚂", 
    examCount: 330,
    description: "Indian Railways Recruitment Papers",
    thumbnail: "/images/railway-thumb.jpg"
  },
  {
    id: "civil-services",
    name: "Civil Services",
    icon: "⚖️",
    examCount: 250,
    description: "UPSC and State Civil Services Papers",
    thumbnail: "/images/civil-thumb.jpg"
  }
];

const mockPYPExams = [
  { id: "ssc-cgl-2023", title: "SSC CGL 2023", category: "ssc", papers: 433, year: 2023 },
  { id: "ssc-chsl-2023", title: "SSC CHSL 2023", category: "ssc", papers: 724, year: 2023 },
  { id: "ssc-mts-2023", title: "SSC MTS 2023", category: "ssc", papers: 652, year: 2023 },
  { id: "sbi-po-2023", title: "SBI PO 2023", category: "banking", papers: 125, year: 2023 },
  { id: "ibps-clerk-2023", title: "IBPS Clerk 2023", category: "banking", papers: 200, year: 2023 },
  { id: "rrb-ntpc-2023", title: "RRB NTPC 2023", category: "railway", papers: 180, year: 2023 },
];

export default function PreviousYearPapersPage() {
  const { categories } = useExam();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filteredExams, setFilteredExams] = useState(mockPYPExams);

  useEffect(() => {
    let filtered = mockPYPExams;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(exam => exam.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredExams(filtered);
  }, [selectedCategory, searchQuery]);

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
              <FileText className="h-4 w-4 mr-2" />
              Previous Year Papers
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Explore Previous Year <span className="text-yellow-300">Question Papers</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Practice with authentic previous year papers from various competitive exams. 
              Boost your preparation with real exam patterns and difficulty levels.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search previous year papers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Selection */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              All Categories
            </Button>
            {mockPYPCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <span>{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Your Enrolled Exams
              </h2>
              <p className="text-gray-600">
                Quick access to your enrolled exam papers
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

          {/* Enrolled Exams Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16"
          >
            {filteredExams.slice(0, 8).map((exam, index) => (
              <motion.div key={exam.id} variants={itemVariants}>
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        <Calendar className="h-3 w-3 mr-1" />
                        {exam.year}
                      </Badge>
                      <Badge variant="outline">
                        {exam.papers} Papers
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {exam.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between gap-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/pyp/${exam.id}`} className="flex items-center gap-2">
                          <Eye className="h-3 w-3" />
                          View Papers
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Load More Button */}
          <div className="text-center">
            <Button variant="outline" size="lg" className="px-8">
              Load more exams
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Explore Previous Year Paper of all <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Exams</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get exam-ready with concepts, questions and study notes as per the latest pattern
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {mockPYPCategories.map((category, index) => (
              <motion.div key={category.id} variants={itemVariants}>
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {category.examCount} Papers
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full group-hover:bg-blue-600 transition-colors">
                      <Link href={`/pyp?category=${category.id}`} className="flex items-center justify-center gap-2">
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        View Papers
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
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
              Start Your Preparation Today
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of successful candidates who have cracked their exams with our previous year papers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold" asChild>
                <Link href="/register">
                  Get Started Free
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