"use client";

import { useState } from "react";
import { useSubjects } from "@/lib/subject-context";
import { Button } from "@/components/ui/button";
import { SelectSetModal } from "@/components/select-set-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface MCQsPageProps {
  onStartPractice: () => void;
  onStartExam: () => void;
  onInputMcqs: () => void;
  onStartReadingPractice: () => void;
  onInputReading: () => void;
  onStartListeningPractice: () => void;
  onInputListening: () => void;
  darkMode: boolean;
  onCreateSubject?: () => void;
  onOpenMobileSidebar?: () => void;
}

export default function MCQsPage({
  onStartPractice,
  onStartExam,
  onInputMcqs,
  onStartReadingPractice,
  onInputReading,
  onStartListeningPractice,
  onInputListening,
  darkMode,
  onCreateSubject,
  onOpenMobileSidebar,
}: MCQsPageProps) {
  const { subjects, activeSubjectId, getMcqsForSubject, getReadingPassagesForSubject, listeningSets } = useSubjects();
  const currentSubject = subjects.find((s) => s.id === activeSubjectId);
  const mcqCount = getMcqsForSubject(activeSubjectId).length;
  const readingCount = getReadingPassagesForSubject(activeSubjectId).length;
  const listeningCount = (listeningSets[activeSubjectId || ""] || []).flatMap(set => set.questions).length;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<"mcq" | "reading" | "Audio Flashcard">("mcq");
  const [modalAction, setModalAction] = useState<"practice" | "exam" | "edit">("practice");

  const openModal = (category: "mcq" | "reading" | "Audio Flashcard", action: "practice" | "exam" | "edit") => {
    setModalCategory(category);
    setModalAction(action);
    setModalOpen(true);
  };

  const handleModalSelect = () => {
    if (modalAction === "practice") {
      if (modalCategory === "mcq") onStartPractice();
      else if (modalCategory === "reading") onStartReadingPractice();
      else onStartListeningPractice();
    } else if (modalAction === "exam") {
      onStartExam();
    } else if (modalAction === "edit") {
      if (modalCategory === "mcq") onInputMcqs();
      else if (modalCategory === "reading") onInputReading();
      else onInputListening();
    }
  };

  return (
    <div
      className={`min-h-screen pt-32 transition-colors duration-300 md:pt-20 ${darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
        }`}
    >
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <div
            className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-4 ${darkMode
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}
          >
            ✨ Intelligent Testing Platform
          </div>
          <h1
            className={`text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 ${darkMode ? "text-white bg-clip-text" : "text-gray-900"
              }`}
          >
            Master Your Exams
          </h1>
          <p
            className={`text-base md:text-xl max-w-2xl mx-auto ${darkMode ? "text-slate-400" : "text-gray-600"
              }`}
          >
            Practice smarter, perform better with adaptive learning
          </p>
        </div>

        {/* Empty States */}
        {subjects.length === 0 ? (
          <div className="max-w-md mx-auto">
            <div
              className={`rounded-2xl p-8 md:p-12 text-center border-2 border-dashed ${darkMode
                  ? "bg-slate-800/50 border-slate-700"
                  : "bg-white border-gray-300 shadow-lg"
                }`}
            >
              <div className="text-5xl mb-4">📚</div>
              <h3
                className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"
                  }`}
              >
                Start Your Journey
              </h3>
              <p
                className={`mb-6 ${darkMode ? "text-slate-400" : "text-gray-600"
                  }`}
              >
                Create your first subject to begin practicing
              </p>
              <Button
                onClick={onCreateSubject || onOpenMobileSidebar}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Create Subject
              </Button>
            </div>
          </div>
        ) : !activeSubjectId ? (
          <div className="max-w-md mx-auto">
            <div
              className={`rounded-2xl p-8 md:p-12 text-center border-2 border-dashed ${darkMode
                  ? "bg-slate-800/50 border-slate-700"
                  : "bg-white border-yellow-300 shadow-lg"
                }`}
            >
              <div className="text-5xl mb-4">👆</div>
              <h3
                className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"
                  }`}
              >
                Choose a Subject
              </h3>
              <p
                className={`mb-6 ${darkMode ? "text-slate-400" : "text-gray-600"
                  }`}
              >
                Select a subject from the sidebar to get started
              </p>
              {onOpenMobileSidebar && (
                <Button
                  onClick={onOpenMobileSidebar}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Choose Subject
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Subject Info Banner */}
            <div
              className={`max-w-2xl mx-auto mb-8 rounded-2xl p-4 md:p-6 text-center border backdrop-blur-sm ${darkMode
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-900 shadow-md"
                }`}
            >
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="text-2xl">📁</span>
                <span className="font-bold text-lg md:text-xl">
                  {currentSubject?.name}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${darkMode
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-blue-200 text-blue-800"
                    }`}
                >
                  {mcqCount} MCQs
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${darkMode
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-emerald-200 text-emerald-800"
                    }`}
                >
                  {readingCount} Reading Passages
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${darkMode
                      ? "bg-purple-500/20 text-purple-300"
                      : "bg-purple-200 text-purple-800"
                    }`}
                >
                  {listeningCount} Listening Words
                </span>
              </div>
            </div>

            {/* Test Mode Cards */}
            {(mcqCount > 0 || readingCount > 0 || listeningCount > 0) && (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-8"
              >
                {/* MCQ Practice Test Card */}
                {mcqCount > 0 && (
                  <motion.div variants={item} className="h-full">
                    <Card
                      className={`group cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] flex flex-col h-full ${darkMode
                        ? "bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500/30 hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-500/20"
                        : "bg-gradient-to-br from-white to-blue-50 border-blue-200 hover:border-blue-400 hover:shadow-2xl shadow-lg"
                      } rounded-2xl`}
                    onClick={() => openModal("mcq", "practice")}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <CardHeader className="relative pb-4 flex-none">
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${darkMode ? "bg-blue-500/20" : "bg-blue-100"
                            }`}
                        >
                          🎯
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-bold ${darkMode
                              ? "bg-green-500/20 text-green-400"
                              : "bg-green-100 text-green-700"
                            }`}
                        >
                          RECOMMENDED
                        </div>
                      </div>
                      <CardTitle
                        className={`text-2xl md:text-3xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"
                          }`}
                      >
                        Practice Mode
                      </CardTitle>
                      <CardDescription
                        className={`text-base ${darkMode ? "text-slate-400" : "text-gray-600"
                          }`}
                      >
                        Learn at your own pace
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative flex-1 flex flex-col space-y-4">
                      <div className="space-y-3 flex-1">
                        {[
                          { icon: "🔄", text: "Unlimited attempts" },
                          { icon: "🎲", text: "Shuffle questions" },
                          { icon: "⏱️", text: "No time pressure" },
                          { icon: "⚡", text: "Instant feedback" },
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xl">{feature.icon}</span>
                            <span
                              className={`${darkMode ? "text-slate-300" : "text-gray-700"
                                } font-medium`}
                            >
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-base font-semibold rounded-xl shadow-lg group-hover:shadow-xl transition-all mt-auto">
                        Start Practicing →
                      </Button>
                    </CardContent>
                  </Card>
                  </motion.div>
                )}

                {/* Exam Test Card */}
                {mcqCount > 0 && (
                  <motion.div variants={item} className="h-full">
                    <Card
                      className={`group cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] flex flex-col h-full ${darkMode
                        ? "bg-gradient-to-br from-slate-800 to-slate-900 border-indigo-500/30 hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-500/20"
                        : "bg-gradient-to-br from-white to-indigo-50 border-indigo-200 hover:border-indigo-400 hover:shadow-2xl shadow-lg"
                      } rounded-2xl`}
                    onClick={() => openModal("mcq", "exam")}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <CardHeader className="relative pb-4 flex-none">
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${darkMode ? "bg-indigo-500/20" : "bg-indigo-100"
                            }`}
                        >
                          🏆
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-bold ${darkMode
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-purple-100 text-purple-700"
                            }`}
                        >
                          CHALLENGE
                        </div>
                      </div>
                      <CardTitle
                        className={`text-2xl md:text-3xl font-bold ${darkMode ? "text-indigo-400" : "text-indigo-600"
                          }`}
                      >
                        Exam Mode
                      </CardTitle>
                      <CardDescription
                        className={`text-base ${darkMode ? "text-slate-400" : "text-gray-600"
                          }`}
                      >
                        Test your knowledge
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative flex-1 flex flex-col space-y-4">
                      <div className="space-y-3 flex-1">
                        {[
                          { icon: "⏰", text: "Timed exam" },
                          { icon: "🎯", text: "Random questions" },
                          { icon: "📊", text: "Auto-submit" },
                          { icon: "📈", text: "Performance analytics" },
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xl">{feature.icon}</span>
                            <span
                              className={`${darkMode ? "text-slate-300" : "text-gray-700"
                                } font-medium`}
                            >
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-6 text-base font-semibold rounded-xl shadow-lg group-hover:shadow-xl transition-all mt-auto">
                        Take Exam →
                      </Button>
                    </CardContent>
                  </Card>
                  </motion.div>
                )}

                {/* Reading Test Mode Card */}
                {readingCount > 0 && (
                  <motion.div variants={item} className="h-full">
                    <Card
                      className={`group cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] flex flex-col h-full ${darkMode
                        ? "bg-gradient-to-br from-slate-800 to-slate-900 border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-2xl hover:shadow-emerald-500/20"
                        : "bg-gradient-to-br from-white to-emerald-50 border-emerald-200 hover:border-emerald-400 hover:shadow-2xl shadow-lg"
                      } rounded-2xl`}
                    onClick={() => openModal("reading", "practice")}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                    <CardHeader className="relative pb-4 flex-none">
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${darkMode ? "bg-emerald-500/20" : "bg-emerald-100"
                            }`}
                        >
                          📖
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-bold ${darkMode
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-emerald-100 text-emerald-700"
                            }`}
                        >
                          IELTS STYLE
                        </div>
                      </div>
                      <CardTitle
                        className={`text-2xl md:text-3xl font-bold ${darkMode ? "text-emerald-400" : "text-emerald-600"
                          }`}
                      >
                        Reading Practice
                      </CardTitle>
                      <CardDescription
                        className={`text-base ${darkMode ? "text-slate-400" : "text-gray-600"
                          }`}
                      >
                        Master reading comprehension
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative flex-1 flex flex-col space-y-4">
                      <div className="space-y-3 flex-1">
                        {[
                          { icon: "📝", text: "Fill-in-the-blank format" },
                          { icon: "🔍", text: "Split-screen reading" },
                          { icon: "⚡", text: "Instant scoring" },
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xl">{feature.icon}</span>
                            <span
                              className={`${darkMode ? "text-slate-300" : "text-gray-700"
                                } font-medium`}
                            >
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-6 text-base font-semibold rounded-xl shadow-lg group-hover:shadow-xl transition-all mt-auto">
                        Start Reading Practice →
                      </Button>
                    </CardContent>
                  </Card>
                  </motion.div>
                )}

                {/* Listening Practice Card */}
                {listeningCount > 0 && (
                  <motion.div variants={item} className="h-full">
                    <Card
                      className={`group cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] flex flex-col h-full ${darkMode
                        ? "bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/30 hover:border-purple-500/60 hover:shadow-2xl hover:shadow-purple-500/20"
                        : "bg-gradient-to-br from-white to-purple-50 border-purple-200 hover:border-purple-400 hover:shadow-2xl shadow-lg"
                      } rounded-2xl`}
                    onClick={() => openModal("Audio Flashcard", "practice")}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                    <CardHeader className="relative pb-4 flex-none">
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${darkMode ? "bg-purple-500/20" : "bg-purple-100"
                            }`}
                        >
                          🎧
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-bold ${darkMode
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-purple-100 text-purple-700"
                            }`}
                        >
                          NEW
                        </div>
                      </div>
                      <CardTitle
                        className={`text-2xl md:text-3xl font-bold ${darkMode ? "text-purple-400" : "text-purple-600"
                          }`}
                      >
                        Flashcard Practice
                      </CardTitle>
                      <CardDescription
                        className={`text-base leading-snug mt-2 ${darkMode ? "text-slate-400" : "text-gray-600"
                          }`}
                      >
                        Active recall and spaced repetition flashcards for rapid memorization and listening skills.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative flex-1 flex flex-col space-y-4">
                      <div className="space-y-3 flex-1">
                        {[
                          { icon: "🧠", text: "Active recall testing" },
                          { icon: "🔊", text: "Auto-speak pronunciation" },
                          { icon: "⏱️", text: "Spaced repetition" },
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xl">{feature.icon}</span>
                            <span
                              className={`${darkMode ? "text-slate-300" : "text-gray-700"
                                } font-medium`}
                            >
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 text-base font-semibold rounded-xl shadow-lg group-hover:shadow-xl transition-all mt-auto">
                        Start Flashcard Practice →
                      </Button>
                    </CardContent>
                  </Card>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Load Data Section */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 text-center">
              <Button
                variant="outline"
                onClick={() => openModal("mcq", "edit")}
                className={`px-8 py-6 text-base font-semibold rounded-xl transition-all ${darkMode
                    ? "bg-slate-800 border-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                    : "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
                  }`}
              >
                {mcqCount === 0
                  ? "📥 Load Your First MCQs"
                  : "📥 Load More MCQs"}
              </Button>
              <Button
                variant="outline"
                onClick={() => openModal("reading", "edit")}
                className={`px-8 py-6 text-base font-semibold rounded-xl transition-all ${darkMode
                    ? "bg-slate-800 border-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                    : "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
                  }`}
              >
                {readingCount === 0
                  ? "📥 Load Reading Passages"
                  : "📥 Load More Passages"}
              </Button>
              <Button
                variant="outline"
                onClick={() => openModal("Audio Flashcard", "edit")}
                className={`px-8 py-6 text-base font-semibold rounded-xl transition-all ${darkMode
                    ? "bg-slate-800 border-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                    : "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg"
                  }`}
              >
                {listeningCount === 0
                  ? "📥 Load Listening Sets"
                  : "📥 Load More Words"}
              </Button>
            </div>

            {/* Stats Footer */}
            {mcqCount === 0 && (
              <div className="max-w-md mx-auto mt-8">
                <div
                  className={`rounded-xl p-6 text-center ${darkMode
                      ? "bg-yellow-500/10 border border-yellow-500/30"
                      : "bg-yellow-50 border border-yellow-200"
                    }`}
                >
                  <span className="text-3xl mb-2 block">💡</span>
                  <p
                    className={`text-sm ${darkMode ? "text-yellow-400" : "text-yellow-800"
                      }`}
                  >
                    Load some MCQs to start practicing and track your progress!
                  </p>
                </div>
              </div>
            )}

            <SelectSetModal
              open={modalOpen}
              onOpenChange={setModalOpen}
              category={modalCategory}
              onSelect={handleModalSelect}
              darkMode={darkMode}
            />
          </>
        )}
      </div>
    </div>
  );
}
