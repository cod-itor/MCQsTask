"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
              size="lg"
              className="rounded-full px-8 py-6 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={`rounded-full px-8 py-6 text-base font-semibold transition-all ${
                darkMode
                  ? "border-2 border-slate-600 hover:bg-slate-800 text-white hover:border-slate-500"
                  : "border-2 border-gray-300 hover:bg-white text-gray-900 hover:border-gray-400 shadow-sm"
              }`}
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
