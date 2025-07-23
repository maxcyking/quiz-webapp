import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Users, BarChart3, BookOpen, GraduationCap } from "lucide-react";

export default function StatsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const stats = [
    { label: "Students", value: "10,000+", icon: <Users className="h-6 w-6 text-primary" /> },
    { label: "Success Rate", value: "94%", icon: <BarChart3 className="h-6 w-6 text-primary" /> },
    { label: "Courses", value: "50+", icon: <BookOpen className="h-6 w-6 text-primary" /> },
    { label: "Expert Instructors", value: "25+", icon: <GraduationCap className="h-6 w-6 text-primary" /> },
  ];

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="flex justify-center mb-4">{stat.icon}</div>
              <motion.div
                className="text-4xl font-bold text-slate-900 dark:text-white mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-slate-600 dark:text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}