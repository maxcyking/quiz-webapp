'use client'

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Calculator,
  Atom,
  Code,
  Globe,
  Palette,
  Briefcase,
  Heart,
  Gavel,
  Star,
  Clock,
  Award,
  Target,
  Zap,
  Shield,
  Sparkles
} from "lucide-react";
import type { Category } from "@/types/category";

interface CategorySectionProps {
  categories: Category[];
  exams: any[];
}

const iconMap: { [key: string]: any } = {
  calculator: Calculator,
  atom: Atom,
  code: Code,
  globe: Globe,
  palette: Palette,
  briefcase: Briefcase,
  heart: Heart,
  gavel: Gavel,
  star: Star,
  clock: Clock,
  award: Award,
  target: Target,
  zap: Zap,
  shield: Shield,
  sparkles: Sparkles
};

// Default categories with enhanced design

const defaultCategories: Category[] = [
  {
    id: "engineering",
    name: "Engineering",
    description: "Comprehensive preparation for all engineering entrance exams including JEE, GATE, and more",
    icon: "⚙️",
    color: "from-blue-500 to-cyan-500",
    isActive: true,
    order: 1,
    createdAt: new Date(),
    thumbnailUrl: "/images/engineering.jpg",
    type: "main",
    slug: "engineering"
  },
  {
    id: "medical",
    name: "Medical",
    description: "Complete medical entrance exam preparation for NEET, AIIMS, and other medical colleges",
    icon: "🏥",
    color: "from-red-500 to-pink-500",
    isActive: true,
    order: 2,
    createdAt: new Date(),
    thumbnailUrl: "/images/medical.jpg",
    type: "main",
    slug: "medical"
  },
  {
    id: "management",
    name: "Management",
    description: "MBA entrance exam preparation including CAT, XAT, SNAP, and other management tests",
    icon: "💼",
    color: "from-purple-500 to-indigo-500",
    isActive: true,
    order: 3,
    createdAt: new Date(),
    thumbnailUrl: "/images/management.jpg",
    type: "main",
    slug: "management"
  },
  {
    id: "government",
    name: "Government Jobs",
    description: "Civil services, SSC, Banking, Railway and other government job exam preparation",
    icon: "🏛️",
    color: "from-green-500 to-emerald-500",
    isActive: true,
    order: 4,
    createdAt: new Date(),
    thumbnailUrl: "/images/government.jpg",
    type: "main",
    slug: "government-jobs"
  },
  {
    id: "law",
    name: "Law",
    description: "Law entrance exams including CLAT, AILET, and other legal studies examinations",
    icon: "⚖️",
    color: "from-amber-500 to-orange-500",
    isActive: true,
    order: 5,
    createdAt: new Date(),
    thumbnailUrl: "/images/law.jpg",
    type: "main",
    slug: "law"
  },
  {
    id: "it",
    name: "Information Technology",
    description: "IT certifications, programming contests, and technology-related competitive exams",
    icon: "💻",
    color: "from-cyan-500 to-blue-500",
    isActive: true,
    order: 6,
    createdAt: new Date(),
    thumbnailUrl: "/images/it.jpg",
    type: "main",
    slug: "information-technology"
  },
  {
    id: "finance",
    name: "Finance & Banking",
    description: "Financial sector exams including CFA, FRM, banking, and insurance examinations",
    icon: "💰",
    color: "from-emerald-500 to-teal-500",
    isActive: true,
    order: 7,
    createdAt: new Date(),
    thumbnailUrl: "/images/finance.jpg",
    type: "main",
    slug: "finance-banking"
  },
  {
    id: "competitive",
    name: "Competitive Exams",
    description: "General competitive exams, aptitude tests, and skill assessment examinations",
    icon: "🎯",
    color: "from-violet-500 to-purple-500",
    isActive: true,
    order: 8,
    createdAt: new Date(),
    thumbnailUrl: "/images/competitive.jpg",
    type: "main",
    slug: "competitive-exams"
  }
];

export default function CategorySection({ categories, exams }: CategorySectionProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Use provided categories or fall back to defaults
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  // Calculate category statistics
  const getCategoryStats = (categoryId: string) => {
    const categoryExams = exams.filter(exam => exam.categoryId === categoryId);
    const activeExams = categoryExams.filter(exam => exam.isActive);
    const upcomingExams = categoryExams.filter(exam => {
      const startDate = exam.startDate ? new Date(exam.startDate) : new Date();
      return exam.isActive && startDate > new Date();
    });

    return {
      totalExams: categoryExams.length,
      activeExams: activeExams.length,
      upcomingExams: upcomingExams.length,
      students: Math.floor(Math.random() * 1000) + 100, // Simulated data
      avgRating: (4.0 + Math.random() * 1).toFixed(1)
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <div className="relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full opacity-20 blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
      >
        {displayCategories.slice(0, 8).map((category, index) => {
          const stats = getCategoryStats(category.id);
          
          return (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              onHoverStart={() => setHoveredCategory(category.id)}
              onHoverEnd={() => setHoveredCategory(null)}
              className="group"
            >
              <Card className="h-full group-hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm overflow-hidden relative">
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <CardHeader className="relative">
                  {/* Category Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                      <span className="text-white text-2xl">{category.icon}</span>
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
                    </div>
                    
                    {/* Stats Badge */}
                    <Badge 
                      variant="secondary" 
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {stats.totalExams} Exams
                    </Badge>
                  </div>

                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    {category.name}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-600 line-clamp-3 group-hover:text-gray-700 transition-colors">
                    {category.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 group-hover:from-blue-100 group-hover:to-cyan-100 transition-all duration-300">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-blue-600 mr-1" />
                        <span className="text-lg font-bold text-blue-600">{stats.students}</span>
                      </div>
                      <div className="text-xs text-blue-600/80">Students</div>
                    </div>
                    
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 group-hover:from-emerald-100 group-hover:to-teal-100 transition-all duration-300">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="h-4 w-4 text-emerald-600 mr-1 fill-current" />
                        <span className="text-lg font-bold text-emerald-600">{stats.avgRating}</span>
                      </div>
                      <div className="text-xs text-emerald-600/80">Rating</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{stats.activeExams} Active</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{stats.upcomingExams} Upcoming</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    asChild 
                    className={`w-full group-hover:shadow-lg transition-all duration-300 bg-gradient-to-r ${category.color} hover:scale-105 border-0`}
                  >
                    <Link href={`/exams?category=${category.id}`} className="flex items-center justify-center font-semibold">
                      Explore Exams
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </Button>
                </CardContent>

                {/* Hover Effect Overlay */}
                {hoveredCategory === category.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"
                  />
                )}
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* View All Categories Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center mt-12"
      >
        <Button 
          size="lg" 
          variant="outline" 
          asChild 
          className="px-8 py-6 text-lg border-2 hover:shadow-lg transition-all duration-300 group"
        >
          <Link href="/categories" className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 group-hover:text-purple-600 transition-colors" />
            View All Categories
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}