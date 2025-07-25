"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Users, 
  Trophy, 
  Clock,
  Play,
  CheckCircle,
  Star
} from "lucide-react";

interface HeroSectionProps {
  user: any;
  upcomingExams: any[];
  stats: {
    totalUsers: number;
    totalExams: number;
    successRate: number;
    totalHours: number;
  };
}

export default function HeroSection({ user, upcomingExams, stats }: HeroSectionProps) {
  const [currentExamIndex, setCurrentExamIndex] = useState(0);

  useEffect(() => {
    if (upcomingExams.length > 1) {
      const interval = setInterval(() => {
        setCurrentExamIndex((prev) => (prev + 1) % upcomingExams.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [upcomingExams.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-canva-gradient">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-canva-purple-200/40 to-canva-blue-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-canva-pink-200/40 to-canva-purple-200/40 rounded-full blur-3xl animate-pulse animation-delay-200" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-canva-blue-200/30 to-canva-pink-200/30 rounded-full blur-2xl animate-pulse animation-delay-400" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-12 md:py-20">
        <motion.div 
          className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Content */}
          <div className="space-y-6 md:space-y-8">
            <motion.div variants={itemVariants}>
              <Badge className="mb-4 md:mb-6 px-3 py-1.5 md:px-4 md:py-2 bg-canva-button-blue text-white border-0 rounded-canva canva-button-shimmer" variant="outline">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                <span className="font-medium text-xs md:text-sm">Transform Your Future</span>
              </Badge>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-4 md:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-canva-gray-900">
                Master Your Exams with{" "}
                <span className="bg-canva-purple-gradient bg-clip-text text-transparent">
                  Confidence
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-canva-gray-600 leading-relaxed max-w-2xl">
                Join thousands of students who've transformed their academic journey with our 
                comprehensive exam preparation platform.
              </p>
            </motion.div>

            {/* Enhanced Stats Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="text-center p-2 md:p-4 rounded-canva bg-card-gradient shadow-canva hover-lift-canva">
                <div className="text-xl md:text-2xl font-bold text-canva-blue-600">{stats.totalUsers.toLocaleString()}+</div>
                <div className="text-xs md:text-sm text-canva-gray-500">Active Students</div>
              </div>
              <div className="text-center p-2 md:p-4 rounded-canva bg-card-gradient shadow-canva hover-lift-canva">
                <div className="text-xl md:text-2xl font-bold text-canva-purple-600">{stats.successRate}%</div>
                <div className="text-xs md:text-sm text-canva-gray-500">Success Rate</div>
              </div>
              <div className="text-center p-2 md:p-4 rounded-canva bg-card-gradient shadow-canva hover-lift-canva">
                <div className="text-xl md:text-2xl font-bold text-canva-pink-600">{stats.totalExams}+</div>
                <div className="text-xs md:text-sm text-canva-gray-500">Total Exams</div>
              </div>
              <div className="text-center p-2 md:p-4 rounded-canva bg-card-gradient shadow-canva hover-lift-canva">
                <div className="text-xl md:text-2xl font-bold text-canva-blue-600">{stats.totalHours.toLocaleString()}+</div>
                <div className="text-xs md:text-sm text-canva-gray-500">Hours Saved</div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 md:gap-4">
              <Button 
                size="lg" 
                className="bg-button-blue hover:bg-canva-button-blue-hover text-white border-0 px-6 py-5 md:px-8 md:py-6 text-base md:text-lg shadow-canva rounded-canva hover-lift-canva canva-button-shimmer" 
                asChild
              >
                <Link href={user ? "/dashboard" : "/register"}>
                  <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  {user ? "Continue Learning" : "Start Your Journey"}
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-6 py-5 md:px-8 md:py-6 text-base md:text-lg border-2 border-canva-blue-300 text-canva-blue-600 hover:bg-canva-blue-50 rounded-canva hover-lift-canva" 
                asChild
              >
                <Link href="/exams" className="flex items-center">
                  Browse Exams
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
            </motion.div>

            {/* Enhanced trust indicators */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-2 md:pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white ${
                      i === 1 ? 'bg-canva-blue-400' : 
                      i === 2 ? 'bg-canva-purple-400' : 
                      i === 3 ? 'bg-canva-pink-400' : 'bg-canva-blue-400'
                    }`} />
                  ))}
                </div>
                <span className="text-xs md:text-sm text-canva-gray-600">Join 10,000+ students</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs md:text-sm text-canva-gray-600 ml-1">4.9/5 rating</span>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Enhanced Interactive Dashboard Preview */}
          <motion.div variants={itemVariants} className="relative mt-8 lg:mt-0">
            <div className="relative z-10 bg-glass rounded-canva-lg shadow-canva overflow-hidden border border-canva-blue-200/40 hover-lift-canva">
              {/* Dashboard Header */}
              <div className="bg-canva-button-blue p-3 md:p-4">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1.5 md:space-x-2">
                    <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-yellow-400" />
                    <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="text-xs md:text-sm font-medium text-white/90">Student Dashboard</div>
                  <div className="w-12 md:w-16" />
                </div>
              </div>
              
              {/* Dashboard Content */}
              <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-b from-white/95 to-canva-blue-25/30">
                <div>
                  <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4 flex items-center text-canva-gray-800">
                    <BookOpen className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 text-canva-blue-500" />
                    Upcoming Exams
                  </h3>
                  <div className="space-y-2 md:space-y-3">
                    {upcomingExams.slice(0, 3).map((exam, i) => (
                      <motion.div 
                        key={exam.id}
                        className={`p-2 md:p-3 rounded-canva border transition-all duration-300 ${
                          i === currentExamIndex 
                            ? 'bg-canva-blue-50 border-canva-blue-200 shadow-canva' 
                            : 'bg-white/80 border-canva-gray-200'
                        }`}
                        animate={{
                          scale: i === currentExamIndex ? 1.02 : 1,
                          opacity: i === currentExamIndex ? 1 : 0.7
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-canva flex items-center justify-center text-white text-xs md:text-sm font-semibold ${
                              i === 0 ? 'bg-canva-blue-500' : i === 1 ? 'bg-canva-purple-500' : 'bg-canva-pink-500'
                            }`}>
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-medium text-xs md:text-sm text-canva-gray-800">{exam.title}</p>
                              <p className="text-[10px] md:text-xs text-canva-gray-500 flex items-center">
                                <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                                {exam.startDate?.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-[10px] md:text-xs bg-canva-purple-100 text-canva-purple-700 rounded-canva-sm">
                            {exam.duration}m
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                    
                    {upcomingExams.length === 0 && (
                      <div className="text-center py-3 md:py-4 text-canva-gray-500 text-xs md:text-sm">
                        <BookOpen className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1.5 md:mb-2 opacity-50" />
                        No upcoming exams
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Enhanced Progress Section */}
                <div className="space-y-2 md:space-y-3">
                  <h3 className="font-semibold text-base md:text-lg flex items-center text-canva-gray-800">
                    <Trophy className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 text-yellow-500" />
                    Your Progress
                  </h3>
                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-canva-gray-600">Overall Completion</span>
                      <span className="font-medium text-canva-gray-800">68%</span>
                    </div>
                    <div className="w-full h-1.5 md:h-2 bg-canva-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="bg-canva-button-blue h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '68%' }}
                        transition={{ duration: 2, delay: 1 }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:gap-4 pt-1 md:pt-2">
                    <div className="text-center p-1.5 md:p-2 bg-canva-blue-50 rounded-canva shadow-canva-pink">
                      <div className="text-base md:text-lg font-bold text-canva-blue-600">12</div>
                      <div className="text-[10px] md:text-xs text-canva-gray-500">Completed</div>
                    </div>
                    <div className="text-center p-1.5 md:p-2 bg-canva-purple-50 rounded-canva shadow-canva-purple">
                      <div className="text-base md:text-lg font-bold text-canva-purple-600">5</div>
                      <div className="text-[10px] md:text-xs text-canva-gray-500">In Progress</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 md:w-20 md:h-20 bg-canva-pink-gradient rounded-full blur-xl opacity-60 animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 md:w-24 md:h-24 bg-canva-purple-gradient rounded-full blur-xl opacity-60 animate-pulse animation-delay-200" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}