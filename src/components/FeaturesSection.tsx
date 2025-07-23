import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, BarChart3, GraduationCap, BookOpen, CheckCircle, Award } from "lucide-react";

export default function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      title: "Personalized Learning",
      description: "Adaptive learning paths tailored to your strengths and weaknesses.",
      icon: <Lightbulb className="h-10 w-10 text-primary" />,
    },
    {
      title: "Real-time Progress Tracking",
      description: "Monitor your performance with detailed analytics and insights.",
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
    },
    {
      title: "Expert-Led Courses",
      description: "Learn from industry professionals with proven success records.",
      icon: <GraduationCap className="h-10 w-10 text-primary" />,
    },
    {
      title: "Comprehensive Resources",
      description: "Access a vast library of study materials, practice tests, and more.",
      icon: <BookOpen className="h-10 w-10 text-primary" />,
    },
    {
      title: "Interactive Practice Tests",
      description: "Test your knowledge with realistic exam simulations.",
      icon: <CheckCircle className="h-10 w-10 text-primary" />,
    },
    {
      title: "Performance Rankings",
      description: "Compare your results with peers and track your improvement.",
      icon: <Award className="h-10 w-10 text-primary" />,
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4">Features</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and resources you need to excel in your exams.
          </p>
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
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <CardTitle className="text-center text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}