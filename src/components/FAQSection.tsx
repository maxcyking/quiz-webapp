import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle } from "lucide-react";

export default function FAQSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const faqs = [
    {
      question: "How do I get started with PrepForAll?",
      answer: "Getting started is easy! Simply create an account, browse our course catalog, and enroll in the courses that match your academic goals. You'll immediately gain access to all course materials and practice exams.",
    },
    {
      question: "Are the courses self-paced or scheduled?",
      answer: "Most of our courses are self-paced, allowing you to learn on your own schedule. However, we do offer some structured courses with specific start and end dates for those who prefer a more traditional learning experience.",
    },
    {
      question: "How are the practice exams structured?",
      answer: "Our practice exams are designed to simulate the actual exam experience. They include a variety of question types, timed sections, and detailed explanations for each answer to help you understand the concepts better.",
    },
    {
      question: "Can I track my progress over time?",
      answer: "Our platform provides detailed analytics and progress tracking. You can see your performance trends, identify areas for improvement, and track your ranking compared to other students.",
    },
    {
      question: "Do you offer any guarantees?",
      answer: "We're confident in our teaching methods and materials. If you don't see improvement in your test scores after completing our recommended courses, we offer a 30-day money-back guarantee.",
    },
    {
      question: "How can I contact instructors if I have questions?",
      answer: "Each course includes a discussion forum where you can ask questions and interact with instructors and fellow students. For premium courses, you also get direct messaging access to your instructors.",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4">FAQ</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Find answers to common questions about our platform and courses.
          </p>
        </div>

        <motion.div
          ref={ref}
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 dark:text-slate-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Still have questions? We're here to help.
          </p>
          <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}