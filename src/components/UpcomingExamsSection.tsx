import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";

export default function UpcomingExamsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const exams = [
    {
      id: 1,
      title: "Mathematics Final",
      date: "May 15, 2025",
      time: "10:00 AM - 12:00 PM",
      registrationDeadline: "May 10, 2025",
      category: "Mathematics",
    },
    {
      id: 2,
      title: "Physics Midterm",
      date: "April 20, 2025",
      time: "2:00 PM - 3:30 PM",
      registrationDeadline: "April 15, 2025",
      category: "Science",
    },
    {
      id: 3,
      title: "Computer Science Quiz",
      date: "March 10, 2025",
      time: "9:00 AM - 10:00 AM",
      registrationDeadline: "March 5, 2025",
      category: "Technology",
    },
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4">Upcoming Exams</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">
            Prepare for These Upcoming Exams
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Stay ahead with our comprehensive exam preparation resources.
          </p>
        </div>

        <motion.div
          ref={ref}
          className="grid md:grid-cols-3 gap-8"
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
          {exams.map((exam, index) => (
            <motion.div
              key={exam.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="h-full border-none shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{exam.title}</CardTitle>
                    <Badge>{exam.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm">{exam.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm">{exam.time}</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm">Registration Deadline: {exam.registrationDeadline}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={`/exams/${exam.id}`}>Register Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
            <Link href="/exams">View All Exams</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}