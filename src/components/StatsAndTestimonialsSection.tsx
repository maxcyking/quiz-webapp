"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Award, 
  BookOpen, 
  Clock, 
  Star,
  Quote,
  TrendingUp,
  Target,
  Zap,
  Heart
} from "lucide-react";

interface StatsAndTestimonialsSectionProps {
  stats: {
    totalUsers: number;
    totalExams: number;
    successRate: number;
    totalHours: number;
  };
}

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Medical Student",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    content: "PrepForAll transformed my study routine completely. The personalized learning paths and detailed analytics helped me improve my scores by 40%. The exam simulation is incredibly realistic!",
    rating: 5,
    exam: "Medical Entrance Exam",
    improvement: "+40%"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Engineering Student",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    content: "The variety of questions and real-time feedback made all the difference. I went from struggling with physics to scoring in the top 10% of my class. Highly recommend!",
    rating: 5,
    exam: "Engineering Entrance",
    improvement: "Top 10%"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Business Student",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    content: "What I love most is the mobile-friendly interface. I could practice during my commute and the offline mode was a lifesaver during my final preparations.",
    rating: 5,
    exam: "MBA Entrance",
    improvement: "+35%"
  },
  {
    id: 4,
    name: "David Kumar",
    role: "Computer Science Student",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content: "The coding challenges and algorithm questions are spot-on. PrepForAll helped me land my dream job at a top tech company. The investment was worth every penny!",
    rating: 5,
    exam: "Technical Interview Prep",
    improvement: "Dream Job"
  },
  {
    id: 5,
    name: "Lisa Wang",
    role: "Language Learner",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    content: "The multi-language support and cultural context in language exams is exceptional. I passed my proficiency test with flying colors thanks to the comprehensive preparation.",
    rating: 5,
    exam: "Language Proficiency",
    improvement: "Passed with Honors"
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Graduate Student",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    content: "The detailed explanations and step-by-step solutions helped me understand concepts I'd been struggling with for months. My confidence skyrocketed!",
    rating: 5,
    exam: "Graduate Entrance",
    improvement: "+50%"
  }
];

const additionalStats = [
  {
    icon: TrendingUp,
    value: "94%",
    label: "Success Rate",
    description: "Students improve their scores",
    color: "text-green-600"
  },
  {
    icon: Target,
    value: "2.5x",
    label: "Faster Learning",
    description: "Compared to traditional methods",
    color: "text-blue-600"
  },
  {
    icon: Zap,
    value: "24/7",
    label: "Available",
    description: "Study anytime, anywhere",
    color: "text-purple-600"
  },
  {
    icon: Heart,
    value: "98%",
    label: "Satisfaction",
    description: "Student satisfaction rate",
    color: "text-red-600"
  }
];

export default function StatsAndTestimonialsSection({ stats }: StatsAndTestimonialsSectionProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [visibleStats, setVisibleStats] = useState([0, 0, 0, 0]);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animate stats counting
  useEffect(() => {
    const animateStats = () => {
      const targets = [stats.totalUsers, stats.successRate, stats.totalExams, stats.totalHours];
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setVisibleStats([
          Math.floor(targets[0] * progress),
          Math.floor(targets[1] * progress),
          Math.floor(targets[2] * progress),
          Math.floor(targets[3] * progress)
        ]);

        if (currentStep >= steps) {
          clearInterval(interval);
          setVisibleStats(targets);
        }
      }, stepDuration);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateStats();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById('stats-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [stats]);

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
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        {/* Stats Section */}
        <motion.div 
          id="stats-section"
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white border-0" variant="outline">
              Our Impact
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Trusted by Students Worldwide
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of successful students who have achieved their academic goals with our platform.
            </p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <motion.div 
              className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {visibleStats[0].toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </motion.div>

            <motion.div 
              className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {visibleStats[1]}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </motion.div>

            <motion.div 
              className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {visibleStats[2]}+
              </div>
              <div className="text-sm text-muted-foreground">Total Exams</div>
            </motion.div>

            <motion.div 
              className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {visibleStats[3].toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">Hours Saved</div>
            </motion.div>
          </div>

          {/* Additional Stats */}
          <motion.div 
            className="grid md:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {additionalStats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600"
              >
                <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="font-medium text-sm mb-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0" variant="outline">
              Student Success Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              What Our Students Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Real stories from real students who achieved their dreams with our platform.
            </p>
          </div>

          {/* Featured Testimonial */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0 shadow-xl">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage src={testimonials[currentTestimonial].avatar} />
                      <AvatarFallback>{testimonials[currentTestimonial].name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <Quote className="h-8 w-8 text-blue-500 mb-4 mx-auto md:mx-0" />
                    <p className="text-lg leading-relaxed mb-6 italic">
                      "{testimonials[currentTestimonial].content}"
                    </p>
                    
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="font-semibold text-lg">
                          {testimonials[currentTestimonial].name}
                        </div>
                        <div className="text-muted-foreground">
                          {testimonials[currentTestimonial].role}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex">
                          {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {testimonials[currentTestimonial].improvement}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Testimonial Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full p-6 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                    
                    <p className="text-sm leading-relaxed mb-4 line-clamp-4">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {testimonial.exam}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Testimonial Navigation Dots */}
          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                aria-label={`View testimonial ${index + 1}`}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial 
                    ? 'bg-blue-500 w-8' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}