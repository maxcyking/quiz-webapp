"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useExam } from "@/context/exam-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight,
  Rocket,
  BookOpen,
  Users,
  Award,
  Clock,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Target,
  CheckCircle,
  PlayCircle,
  Calendar,
  BarChart3,
  Globe,
  Sparkles
} from "lucide-react";

// Import enhanced components
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedExamsSection from "@/components/FeaturedExamsSection";
import StatsAndTestimonialsSection from "@/components/StatsAndTestimonialsSection";
import UpcomingExamsSection from "@/components/UpcomingExamsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";

export default function HomePage() {
  const { exams, categories, user } = useExam();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for animations
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced exam filtering
  const upcomingExams = exams
    .filter(exam => {
      const now = new Date();
      const startDate = exam.startDate ? new Date(exam.startDate) : new Date();
      return exam.isActive && startDate > now;
    })
    .sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate) : new Date();
      const dateB = b.startDate ? new Date(b.startDate) : new Date();
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 6);

  const featuredExams = exams
    .filter(exam => exam.isActive)
    .slice(0, 6);

  // Enhanced stats
  const stats = {
    totalUsers: 15000,
    totalExams: exams.length || 25,
    successRate: 96,
    totalHours: 180000,
    categoriesCount: categories.length || 8,
    avgRating: 4.8
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading amazing content...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <HeroSection 
        user={user} 
        upcomingExams={upcomingExams} 
        stats={stats} 
      />

      {/* Trust Indicators Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Badge className="mb-4 px-4 py-2 bg-green-100 text-green-800 border-green-300">
              Trusted by Thousands
            </Badge>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalUsers.toLocaleString()}+</div>
                <div className="text-gray-600">Active Students</div>
            </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.successRate}%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalExams}+</div>
                <div className="text-gray-600">Practice Exams</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold text-yellow-600">{stats.avgRating}</span>
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-400 ml-1" />
                </div>
                <div className="text-gray-600">Average Rating</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Category Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2 bg-blue-100 text-blue-800 border-blue-300">
              <Globe className="h-4 w-4 mr-2" />
              Explore Categories
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Path to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Success</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover comprehensive exam categories designed to help you excel in your chosen field. 
              From competitive exams to professional certifications.
            </p>
          </motion.div>
          <CategorySection categories={categories} exams={exams} />
              </div>
      </section>

      {/* Featured Exams Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2 bg-purple-100 text-purple-800 border-purple-300">
              <Star className="h-4 w-4 mr-2" />
              Most Popular
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Examinations</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Hand-picked examinations that are trending among students. Start with these popular choices.
            </p>
          </motion.div>
          <FeaturedExamsSection exams={featuredExams} categories={categories} />
                </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2 bg-indigo-100 text-indigo-800 border-indigo-300">
              <Sparkles className="h-4 w-4 mr-2" />
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Excellence</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Personalized Learning",
                description: "AI-powered recommendations based on your performance and goals",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: BarChart3,
                title: "Detailed Analytics",
                description: "Track your progress with comprehensive performance insights",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                description: "Your data is protected with enterprise-grade security",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Zap,
                title: "Instant Results",
                description: "Get immediate feedback and detailed explanations",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: Users,
                title: "Community Support",
                description: "Join thousands of students in our supportive community",
                color: "from-indigo-500 to-blue-500"
              },
              {
                icon: Clock,
                title: "24/7 Availability",
                description: "Study anytime, anywhere with our cloud-based platform",
                color: "from-red-500 to-pink-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-6 w-6 text-white" />
                </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
                </div>
              </div>
      </section>

      {/* Upcoming Exams Section */}
      {upcomingExams.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 px-4 py-2 bg-orange-100 text-orange-800 border-orange-300">
                <Calendar className="h-4 w-4 mr-2" />
                Coming Soon
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Examinations</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Don't miss out on these upcoming examinations. Register now to secure your spot.
              </p>
            </motion.div>
                         <UpcomingExamsSection />
            </div>
        </section>
      )}

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Stats and Testimonials */}
      <StatsAndTestimonialsSection stats={stats} />

      {/* FAQ Section */}
      <FAQSection />

      {/* Enhanced CTA Section */}
      <CTASection />

      {/* Success Stories Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30">
              <TrendingUp className="h-4 w-4 mr-2" />
              Success Stories
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Your Success is Our Mission
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of successful students who have achieved their dreams with our platform
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  metric: "10,000+",
                  label: "Students Placed",
                  icon: Users
                },
                {
                  metric: "95%",
                  label: "Pass Rate",
                  icon: Award
                },
                {
                  metric: "500+",
                  label: "Mock Tests",
                  icon: BookOpen
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                    <stat.icon className="h-8 w-8 text-white" />
              </div>
                  <div className="text-4xl font-bold mb-2">{stat.metric}</div>
                  <div className="text-white/80 text-lg">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12">
              <Button 
                size="lg" 
                className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
                asChild
              >
                <Link href={user ? "/dashboard" : "/register"}>
                  <PlayCircle className="mr-2 h-5 w-5" />
                  {user ? "Continue Your Journey" : "Start Your Success Story"}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}