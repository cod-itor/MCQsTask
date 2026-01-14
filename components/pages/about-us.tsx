"use client";

import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/lib/dark-mode-context";
import { useEffect, useState } from "react";

export default function AboutUs() {
  const { darkMode } = useDarkMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`relative page-bleed min-h-screen overflow-hidden ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-white text-gray-900"
      }`}
    >
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute -top-24 right-0 h-64 w-64 rounded-full blur-3xl transition-all duration-[3000ms] ${
            darkMode ? "bg-blue-500/20" : "bg-blue-400/20"
          } ${mounted ? "animate-pulse" : ""}`}
          style={{
            animation: mounted ? "float 8s ease-in-out infinite" : "none",
          }}
        />
        <div
          className={`absolute bottom-0 left-10 h-72 w-72 rounded-full blur-3xl transition-all duration-[3000ms] ${
            darkMode ? "bg-indigo-500/20" : "bg-indigo-400/20"
          }`}
          style={{
            animation: mounted
              ? "float 10s ease-in-out infinite reverse"
              : "none",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
      `}</style>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 md:py-24">
        {/* Hero Section */}
        <section className="text-center">
          <p
            className={`mb-4 inline-flex items-center rounded-full border px-4 py-1 text-xs font-semibold transition-all duration-300 hover:scale-105 ${
              darkMode
                ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                : "border-blue-200 bg-blue-100 text-blue-700"
            } ${mounted ? "animate-fade-in" : "opacity-0"}`}
          >
            About DITOR
          </p>
          <h1
            className={`text-4xl font-bold tracking-tight md:text-6xl transition-all duration-500 ${
              mounted ? "animate-slide-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.1s" }}
          >
            Focused learning, built for real results
          </h1>
          <p
            className={`mx-auto mt-4 max-w-2xl text-base md:text-lg ${
              darkMode ? "text-slate-300" : "text-gray-600"
            } ${mounted ? "animate-slide-up" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            DITOR is designed by Dita Rector to keep practice simple, fast, and
            focused. No heavy effects or distractions, just the tools you need
            to build confidence and perform your best.
          </p>
          <div
            className={`mt-8 flex flex-wrap items-center justify-center gap-4 ${
              mounted ? "animate-slide-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.3s" }}
          >
            <Button className="rounded-full bg-blue-600 px-6 py-5 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-lg">
              Start Practicing
            </Button>
            <Button
              variant="outline"
              className={`rounded-full bg-transparent px-6 py-5 text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                  : "border-blue-200 text-blue-700 hover:bg-blue-50"
              }`}
            >
              Learn More
            </Button>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Clear Focus",
              description:
                "Streamlined layouts keep your attention on the content and your progress.",
              delay: "0.4s",
            },
            {
              title: "Smart Practice",
              description:
                "Pick subjects, track your MCQs, and move through practice without friction.",
              delay: "0.5s",
            },
            {
              title: "Exam Ready",
              description:
                "Timed sessions and results are optimized to help you improve fast.",
              delay: "0.6s",
            },
          ].map((item) => (
            <div
              key={item.title}
              className={`rounded-2xl border p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                darkMode
                  ? "border-slate-700/70 bg-slate-900/60 hover:bg-slate-900/80"
                  : "border-blue-100 bg-white hover:border-blue-200"
              } ${mounted ? "animate-scale-in" : "opacity-0"}`}
              style={{ animationDelay: item.delay }}
            >
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p
                className={`mt-3 text-sm ${
                  darkMode ? "text-slate-300" : "text-gray-600"
                }`}
              >
                {item.description}
              </p>
            </div>
          ))}
        </section>

        {/* Why Section */}
        <section className="grid gap-10 md:grid-cols-2 md:items-center">
          <div
            className={`${mounted ? "animate-slide-up" : "opacity-0"}`}
            style={{ animationDelay: "0.7s" }}
          >
            <h2 className="text-3xl font-semibold md:text-4xl">
              Why this approach works
            </h2>
            <p
              className={`mt-4 ${
                darkMode ? "text-slate-300" : "text-gray-600"
              }`}
            >
              We focus on clarity, speed, and consistency. Everything from the
              navigation to the exam flow is designed to keep you moving forward
              without interruptions.
            </p>
            <div
              className={`mt-6 space-y-3 text-sm ${
                darkMode ? "text-slate-300" : "text-gray-600"
              }`}
            >
              <p className="transition-all duration-300 hover:translate-x-2">
                • Minimal UI friction for faster study sessions
              </p>
              <p className="transition-all duration-300 hover:translate-x-2">
                • Consistent visuals across Home, MCQs, and About
              </p>
              <p className="transition-all duration-300 hover:translate-x-2">
                • Reliable performance on mobile and desktop
              </p>
            </div>
          </div>
          <div
            className={`rounded-3xl border p-8 shadow-xl transition-all duration-300 hover:shadow-2xl ${
              darkMode
                ? "border-slate-700/70 bg-gradient-to-br from-slate-800/80 to-slate-900/80"
                : "border-blue-100 bg-gradient-to-br from-white to-blue-50"
            } ${mounted ? "animate-scale-in" : "opacity-0"}`}
            style={{ animationDelay: "0.8s" }}
          >
            <h3 className="text-2xl font-semibold">Recommended next steps</h3>
            <p
              className={`mt-3 text-sm ${
                darkMode ? "text-slate-300" : "text-gray-600"
              }`}
            >
              Want to go even further? Here are a few ideas that pair well with
              the current experience.
            </p>
            <ul
              className={`mt-5 space-y-3 text-sm ${
                darkMode ? "text-slate-200" : "text-gray-700"
              }`}
            >
              <li className="transition-all duration-300 hover:translate-x-2">
                • Add subject-level progress indicators
              </li>
              <li className="transition-all duration-300 hover:translate-x-2">
                • Save recent practice sessions for quick resume
              </li>
              <li className="transition-all duration-300 hover:translate-x-2">
                • Provide exportable results summaries
              </li>
            </ul>
          </div>
        </section>

        {/* Stats Section */}
        <section
          className={`rounded-3xl border p-8 text-center transition-all duration-300 hover:shadow-xl ${
            darkMode
              ? "border-slate-700/70 bg-slate-900/70"
              : "border-blue-100 bg-white"
          } ${mounted ? "animate-scale-in" : "opacity-0"}`}
          style={{ animationDelay: "0.9s" }}
        >
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { label: "Practice Modes", value: "3", delay: "1s" },
              { label: "Built for Mobile", value: "Yes", delay: "1.1s" },
              { label: "Focus Time", value: "Always", delay: "1.2s" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`transition-all duration-300 hover:scale-110 ${
                  mounted ? "animate-fade-in" : "opacity-0"
                }`}
                style={{ animationDelay: stat.delay }}
              >
                <p
                  className={`text-3xl font-bold ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {stat.value}
                </p>
                <p
                  className={`mt-1 text-xs uppercase tracking-widest ${
                    darkMode ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
