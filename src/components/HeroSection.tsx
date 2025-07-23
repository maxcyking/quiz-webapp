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
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse animation-delay-200" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl animate-pulse animation-delay-400" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20">
        <motion.div 
          className="grid lg:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Content */}
          <div className="space-y-8">
            <motion.div variants={itemVariants}>
              <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0" variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="font-medium">Transform Your Future</span>
              </Badge>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Master Your Exams with{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Confidence
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Join thousands of students who've transformed their academic journey with our 
                comprehensive exam preparation platform featuring AI-powered insights and 
                personalized learning paths.
              </p>
            </motion.div>

            {/* Stats Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}+</div>
                <div className="text-sm text-muted-foreground">Active Students</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-purple-600">{stats.successRate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-indigo-600">{stats.totalExams}+</div>
                <div className="text-sm text-muted-foreground">Total Exams</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-600">{stats.totalHours.toLocaleString()}+</div>
                <div className="text-sm text-muted-foreground">Hours Saved</div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg" asChild>
                <Link href={user ? "/dashboard" : "/register"}>
                  <Play className="mr-2 h-5 w-5" />
                  {user ? "Continue Learning" : "Start Your Journey"}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2 hover:bg-white/10" asChild>
                <Link href="/exams" className="flex items-center">
                  Browse Exams
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={itemVariants} className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-2 border-white dark:border-gray-800" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">Join 10,000+ students</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-muted-foreground ml-1">4.9/5 rating</span>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Interactive Dashboard Preview */}
          <motion.div variants={itemVariants} className="relative">
            <div className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Dashboard Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="text-sm font-medium text-white/90">Student Dashboard</div>
                  <div className="w-16" />
                </div>
              </div>
              
              {/* Dashboard Content */}
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                    Upcoming Exams
                  </h3>
                  <div className="space-y-3">
                    {upcomingExams.slice(0, 3).map((exam, i) => (
                      <motion.div 
                        key={exam.id}
                        className={`p-3 rounded-lg border transition-all duration-300 ${
                          i === currentExamIndex 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                        animate={{
                          scale: i === currentExamIndex ? 1.02 : 1,
                          opacity: i === currentExamIndex ? 1 : 0.7
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                              i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-purple-500' : 'bg-indigo-500'
                            }`}>
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{exam.title}</p>
                              <p className="text-xs text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {exam.startDate?.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {exam.duration}m
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                    
                    {upcomingExams.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        No upcoming exams
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    Your Progress
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Completion</span>
                      <span className="font-medium">68%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '68%' }}
                        transition={{ duration: 2, delay: 1 }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-lg font-bold text-green-600">12</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">5</div>
                      <div className="text-xs text-muted-foreground">In Progress</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-xl opacity-60 animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-xl opacity-60 animate-pulse animation-delay-200" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}