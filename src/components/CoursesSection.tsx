import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Users } from "lucide-react";

interface CoursesSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function CoursesSection({ activeTab, setActiveTab }: CoursesSectionProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const courses = [
    {
      id: 1,
      title: "Mathematics Mastery",
      category: "mathematics",
      level: "Advanced",
      rating: 4.9,
      students: 1245,
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
      instructor: "Dr. Sarah Johnson",
      price: "$89",
    },
    {
      id: 2,
      title: "Physics Fundamentals",
      category: "science",
      level: "Intermediate",
      rating: 4.7,
      students: 987,
      image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa",
      instructor: "Prof. Michael Chen",
      price: "$79",
    },
    {
      id: 3,
      title: "Computer Science Essentials",
      category: "technology",
      level: "Beginner",
      rating: 4.8,
      students: 1532,
      image: "https://images.unsplash.com/photo-1623479322729-28b25c16b011",
      instructor: "Dr. James Wilson",
      price: "$99",
    },
    {
      id: 4,
      title: "Biology Advanced Concepts",
      category: "science",
      level: "Advanced",
      rating: 4.6,
      students: 876,
      image: "https://images.unsplash.com/photo-1576086213369-97a306d36557",
      instructor: "Dr. Emily Rodriguez",
      price: "$85",
    },
    {
      id: 5,
      title: "Calculus Masterclass",
      category: "mathematics",
      level: "Advanced",
      rating: 4.9,
      students: 1089,
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
      instructor: "Prof. David Thompson",
      price: "$95",
    },
    {
      id: 6,
      title: "Web Development Bootcamp",
      category: "technology",
      level: "Intermediate",
      rating: 4.8,
      students: 2145,
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479",
      instructor: "Sarah Davis",
      price: "$129",
    },
  ];

  const filteredCourses = activeTab === "all" 
    ? courses 
    : courses.filter(course => course.category === activeTab);

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4">Courses</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">
            Explore Our Popular Courses
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Comprehensive courses designed by experts to help you excel in your exams and beyond.
          </p>
        </div>

        <div className="mb-12 flex justify-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="mathematics">Math</TabsTrigger>
              <TabsTrigger value="science">Science</TabsTrigger>
              <TabsTrigger value="technology">Tech</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <motion.div
          ref={ref}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <AnimatePresence>
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                exit={{ opacity: 0, y: -20 }}
                layout
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white text-primary hover:bg-white">
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-amber-500 mr-1" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                    </div>
                    <CardDescription>
                      <span className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{course.instructor}</span>
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{course.students} students</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <div className="text-lg font-bold text-primary">{course.price}</div>
                    <Button size="sm" className="rounded-full">
                      Enroll Now
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
            <Link href="/exams">View All Courses</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}