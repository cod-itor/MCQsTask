"use client";

import { motion, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  BookMarked,
  Upload,
  Layers,
  Zap,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const featuresList = [
  {
    icon: BookMarked,
    title: "Create & Edit MCQs",
    description:
      "Build questions easily with full control and customization options for any subject or topic.",
  },
  {
    icon: Upload,
    title: "Import Questions",
    description:
      "Upload MCQs from files or collections. Organize everything in seconds.",
  },
  {
    icon: Layers,
    title: "Organized Management",
    description:
      "Categories, subjects, and filters keep your questions perfectly structured.",
  },
  {
    icon: Zap,
    title: "Test-Like Practice",
    description:
      "Simulate real exams with timed practice modes for better exam readiness.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Visualize your improvement and identify areas that need more focus.",
  },
  {
    icon: Lightbulb,
    title: "Stress-Free Learning",
    description:
      "Designed to reduce anxiety and improve understanding one question at a time.",
  },
];

interface FeaturesProps {
  darkMode?: boolean;
}

export function Features({ darkMode = false }: FeaturesProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section
      ref={ref}
      className={`w-full py-20 px-4 ${
        darkMode
          ? "bg-gradient-to-b from-slate-900 to-slate-800"
          : "bg-gradient-to-b from-white to-gray-50"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className={`text-4xl md:text-5xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Powerful Features for Smart Learning
          </h2>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Everything you need to master MCQs and excel in your exams
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {featuresList.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card
                  className={`h-full hover:shadow-lg transition-shadow duration-300 ${
                    darkMode
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <CardContent className="pt-8">
                    <div className="mb-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          darkMode ? "bg-blue-600/20" : "bg-blue-600/10"
                        }`}
                      >
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`leading-relaxed ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
