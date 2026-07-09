"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CTAProps {
  darkMode?: boolean;
}

export function CTA({ darkMode = false }: CTAProps) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  return (
    <section
      ref={ref}
      className={`w-full py-32 px-4 relative overflow-hidden ${
        darkMode ? "bg-slate-900" : "bg-white"
      }`}
    >
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/2 left-1/4 w-96 h-96 rounded-full blur-3xl ${
            darkMode ? "bg-blue-600/20" : "bg-blue-600/10"
          }`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${
            darkMode ? "bg-purple-600/20" : "bg-purple-600/10"
          }`}
        />
      </div>

      <motion.div
        className={`relative z-10 max-w-4xl mx-auto text-center rounded-3xl p-12 md:p-16 ${
          darkMode
            ? "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700"
            : "bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
          }
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2
            className={`text-4xl md:text-6xl font-bold mb-6 text-balance ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Ready to Transform Your Learning?
          </h2>
          <p
            className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Join thousands of students who are already practicing smarter and
            achieving better results.
          </p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
            asChild
            size="lg"
            className={`rounded-full px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all ${
              darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
            }`}
          >
            <Link href="/mcqs">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className={`rounded-full px-8 py-6 text-lg font-medium border-2 ${
              darkMode
                ? "border-slate-700 hover:bg-slate-800 text-white"
                : "bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur"
            }`}
          >
            <Link href="/about">
              View Documentation
            </Link>
          </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
