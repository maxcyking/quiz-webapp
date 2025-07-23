"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  Star, 
  TrendingUp,
  ArrowRight,
  Award,
  Target,
  Zap
} from "lucide-react";

interface FeaturedExamsSectionProps {
  exams: any[];
  categories: any[];
}

export default function FeaturedExamsSection({ exams, categories }: FeaturedExamsSectionProps) {
  const [activeTab, setActiveTab] = useState("upcoming");

  const now = new Date();
  
  // Filter exams by different criteria
  const upcomingExams = exams
    .filter(exam => {
      const startDate = exam.startDate instanceof Date ? exam.startDate : new Date(exam.startDate);
      return exam.isActive && startDate > now;
    })
    .sort((a, b) => {
      const dateA = a.startDate instanceof Date ? a.startDate : new Date(a.startDate);
      const dateB = b.startDate instanceof Date ? b.startDate : new Date(b.startDate);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 6);

  const popularExams = exams
    .filter(exam => exam.isActive)
    .sort((a, b) => (b.totalQuestions || 0) - (a.totalQuestions || 0))
    .slice(0, 6);

  const featuredExams = exams
    .filter(exam => exam.isActive && exam.featured)
    .slice(0, 6);

  // If no featured exams, use a mix of upcoming and popular
  const displayFeaturedExams = featuredExams.length > 0 
    ? featuredExams 
    : [...upcomingExams.slice(0, 3), ...popularExams.slice(0, 3)];

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (date: any): string => {
    if (!date) return "Date TBA";
    const examDate = date instanceof Date ? date : new Date(date);
    return examDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ExamCard = ({ exam, index }: { exam: any; index: number }) => {
    const category = categories.find(cat => cat.id === exam.categoryId);
    
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden border-0 shadow-md">
          {/* Exam Header with Gradient */}
          <div className="relative h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 overflow-hidden">
            {exam.thumbnailUrl ? (
              <img 
                src={exam.thumbnailUrl} 
                alt={exam.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-white/80" />
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {exam.difficulty && (
                <Badge className={`${getDifficultyColor(exam.difficulty)} border-0 text-xs font-medium`}>
                  {exam.difficulty}
                </Badge>
              )}
              {category && (
                <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                  {category.name}
                </Badge>
              )}
            </div>

            {/* Featured badge */}
            {exam.featured && (
              <div className="absolute top-4 right-4">
                <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </div>
              </div>
            )}

            {/* Stats overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex justify-between items-end text-white">
                <div>
                  <div className="text-2xl font-bold">{exam.totalQuestions || 0}</div>
                  <div className="text-xs opacity-90">Questions</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{exam.duration}m</div>
                  <div className="text-xs opacity-90">Duration</div>
                </div>
              </div>
            </div>
          </div>

          <CardHeader className="pb-4">
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                {exam.title}
              </CardTitle>
            </div>
            <CardDescription className="line-clamp-2 text-sm leading-relaxed">
              {exam.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Exam Details */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(exam.startDate)}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>{exam.duration} minutes</span>
              </div>
              {exam.subjects && exam.subjects.length > 0 && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>{exam.subjects.length} subjects</span>
                </div>
              )}
            </div>

            {/* Progress or Status */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              {exam.isCompleted ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600 font-medium flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    Completed
                  </span>
                  {exam.isResultReleased && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Results Available
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600 font-medium flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    Available
                  </span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    <span>1.2k enrolled</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="pt-0">
            <Button 
              asChild 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 group-hover:shadow-lg transition-all duration-300"
            >
              <Link href={`/exams/${exam.id}`} className="flex items-center justify-center">
                {exam.isCompleted ? 'View Results' : 'Start Exam'}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0" variant="outline">
            Featured Exams
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Test Your Knowledge?
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose from our carefully curated selection of exams designed to challenge 
            and enhance your skills across various subjects and difficulty levels.
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="upcoming" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Featured
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam, index) => (
                  <ExamCard key={exam.id} exam={exam} index={index} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">No upcoming exams available at the moment.</p>
                  <p className="text-sm">Check back later or explore other categories.</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="popular">
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {popularExams.map((exam, index) => (
                <ExamCard key={exam.id} exam={exam} index={index} />
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="featured">
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {displayFeaturedExams.map((exam, index) => (
                <ExamCard key={exam.id} exam={exam} index={index} />
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* View All Exams Button */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button variant="outline" size="lg" asChild className="px-8 py-6 text-lg border-2">
            <Link href="/exams" className="flex items-center">
              Browse All Exams
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}