"use client";

export default function AboutUs({ darkMode }: { darkMode: boolean }) {
  return (
    <div
      className={`min-h-screen page-enter ${
        darkMode ? "bg-slate-950 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Smart Exam <span className="text-orange-600">Preparation</span>
          </h1>
          <p
            className={`text-lg md:text-xl mb-8 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Built to help students master their exams with intelligent, adaptive
            learning technology
          </p>
          <button
            className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg ${
              darkMode
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-orange-600 text-white hover:bg-orange-700"
            }`}
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
            {[
              {
                title: "Adaptive Practice",
                desc: "Personalized questions based on your level",
              },
              {
                title: "Performance Analytics",
                desc: "Track progress with detailed insights",
              },
              {
                title: "Timed Exams",
                desc: "Real exam conditions and time management",
              },
              {
                title: "Expert Content",
                desc: "Curated by experienced educators",
              },
              {
                title: "Instant Feedback",
                desc: "Learn from every question attempted",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                  darkMode
                    ? "bg-slate-900 border-slate-800"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section with Timeline */}
      <section
        className={`py-20 px-4 ${darkMode ? "bg-slate-900" : "bg-gray-50"}`}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">
            How DITOR v2 Works
          </h2>
          <p
            className={`text-center mb-16 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            A complete platform designed from the ground up for exam success
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Subjects",
                desc: "Organize your study material by subject or exam topic",
              },
              {
                step: "2",
                title: "Upload MCQs",
                desc: "Add multiple choice questions with instant validation",
              },
              {
                step: "3",
                title: "Practice & Test",
                desc: "Take timed exams and track your progress over time",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto font-bold text-lg bg-orange-600 text-white">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">
            What's Included
          </h2>
          <p
            className={`text-center mb-16 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Everything you need to prepare effectively
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "📚",
                title: "Subject Management",
                desc: "Create and organize multiple subjects",
              },
              {
                icon: "❓",
                title: "MCQ Database",
                desc: "Store unlimited multiple choice questions",
              },
              {
                icon: "⏱️",
                title: "Timed Sessions",
                desc: "Practice under exam conditions",
              },
              {
                icon: "📊",
                title: "Analytics",
                desc: "Detailed performance metrics",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:border-orange-600 ${
                  darkMode
                    ? "bg-slate-900 border-slate-800"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        className={`py-20 px-4 ${darkMode ? "bg-slate-900" : "bg-gray-50"}`}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">
            Questions or Feedback?
          </h2>
          <p
            className={`text-center mb-8 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            We'd love to hear from you. Send us your thoughts and we'll get back
            to you soon.
          </p>

          <form className="space-y-4">
            {[
              { type: "text", placeholder: "Your name" },
              { type: "email", placeholder: "Your email" },
            ].map((field, i) => (
              <input
                key={i}
                type={field.type}
                placeholder={field.placeholder}
                className={`w-full px-4 py-3 rounded-2xl border transition-all duration-200 ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-white placeholder-gray-500 focus:border-orange-600 focus:ring-orange-600"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-600 focus:ring-orange-600"
                }`}
              />
            ))}
            <textarea
              placeholder="Your message"
              rows={5}
              className={`w-full px-4 py-3 rounded-2xl border resize-none transition-all duration-200 ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-white placeholder-gray-500 focus:border-orange-600 focus:ring-orange-600"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-600 focus:ring-orange-600"
              }`}
            />
            <button
              type="submit"
              className="w-full py-3 rounded-2xl font-semibold transition-all duration-200 hover:shadow-lg bg-orange-600 text-white hover:bg-orange-700"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
