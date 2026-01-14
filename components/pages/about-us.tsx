"use client";

import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/lib/dark-mode-context";

export default function AboutUs() {
  const { darkMode } = useDarkMode();

  return (
    <div
      className={`relative min-h-screen overflow-hidden pt-32 md:pt-20 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-white text-gray-900"
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute -top-24 right-0 h-64 w-64 rounded-full blur-3xl ${
            darkMode ? "bg-blue-500/20" : "bg-blue-400/20"
          }`}
        />
        <div
          className={`absolute bottom-0 left-10 h-72 w-72 rounded-full blur-3xl ${
            darkMode ? "bg-indigo-500/20" : "bg-indigo-400/20"
          }`}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 md:py-24">
        <section className="text-center">
          <p
            className={`mb-4 inline-flex items-center rounded-full border px-4 py-1 text-xs font-semibold ${
              darkMode
                ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                : "border-blue-200 bg-blue-100 text-blue-700"
            }`}
          >
            About DITOR
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Focused learning, built for real results
          </h1>
          <p
            className={`mx-auto mt-4 max-w-2xl text-base md:text-lg ${
              darkMode ? "text-slate-300" : "text-gray-600"
            }`}
          >
            DITOR is designed to keep practice simple, fast, and focused. No
            heavy effects or distractions, just the tools you need to build
            confidence and perform your best.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button className="rounded-full bg-blue-600 px-6 py-5 text-sm font-semibold hover:bg-blue-700">
              Start Practicing
            </Button>
            <Button
              variant="outline"
              className={`rounded-full bg-transparent px-6 py-5 text-sm font-semibold ${
                darkMode
                  ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                  : "border-blue-200 text-blue-700 hover:bg-blue-50"
              }`}
            >
              Learn More
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Clear Focus",
              description:
                "Streamlined layouts keep your attention on the content and your progress.",
            },
            {
              title: "Smart Practice",
              description:
                "Pick subjects, track your MCQs, and move through practice without friction.",
            },
            {
              title: "Exam Ready",
              description:
                "Timed sessions and results are optimized to help you improve fast.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className={`rounded-2xl border p-6 shadow-lg ${
                darkMode
                  ? "border-slate-700/70 bg-slate-900/60"
                  : "border-blue-100 bg-white"
              }`}
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

        <section className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Why this approach works
            </h2>
            <p className={`mt-4 ${darkMode ? "text-slate-300" : "text-gray-600"}`}>
              We focus on clarity, speed, and consistency. Everything from the
              navigation to the exam flow is designed to keep you moving forward
              without interruptions.
            </p>
            <div
              className={`mt-6 space-y-3 text-sm ${
                darkMode ? "text-slate-300" : "text-gray-600"
              }`}
            >
              <p>• Minimal UI friction for faster study sessions</p>
              <p>• Consistent visuals across Home, MCQs, and About</p>
              <p>• Reliable performance on mobile and desktop</p>
            </div>
          </div>
          <div
            className={`rounded-3xl border p-8 shadow-xl ${
              darkMode
                ? "border-slate-700/70 bg-gradient-to-br from-slate-800/80 to-slate-900/80"
                : "border-blue-100 bg-gradient-to-br from-white to-blue-50"
            }`}
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
              <li>• Add subject-level progress indicators</li>
              <li>• Save recent practice sessions for quick resume</li>
              <li>• Provide exportable results summaries</li>
            </ul>
          </div>
        </section>

        <section
          className={`rounded-3xl border p-8 text-center ${
            darkMode
              ? "border-slate-700/70 bg-slate-900/70"
              : "border-blue-100 bg-white"
          }`}
        >
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { label: "Practice Modes", value: "3" },
              { label: "Built for Mobile", value: "Yes" },
              { label: "Focus Time", value: "Always" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className={`text-3xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
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
