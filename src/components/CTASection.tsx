"use client";

import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    setEmail("");
    toast({
      title: "Success",
      description: "Thank you for subscribing to our newsletter!",
    });
  };

  return (
    <section className="py-20 bg-primary/10 dark:bg-primary/5">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">
            Ready to Achieve Academic Excellence?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            Join thousands of successful students who have transformed their academic journey with PrepForAll.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="rounded-full px-8">
              <Link href="/register">Get Started Today</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full px-8">
              <Link href="/contact">Talk to an Advisor</Link>
            </Button>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-12">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Get the latest updates, study tips, and exclusive offers delivered to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-full"
              />
              <Button type="submit" className="rounded-full">
                Subscribe
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}