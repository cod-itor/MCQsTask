"use client";

import { useSubjects } from "@/lib/subject-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface HomeProps {
  onStartPractice: () => void;
  onStartExam: () => void;
  onInputMcqs: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenMobileSidebar?: () => void;
  onCreateSubject?: () => void;
}

export default function Home({
  onStartPractice,
  onStartExam,
  onInputMcqs,
  darkMode,
  onToggleDarkMode,
  onOpenMobileSidebar,
  onCreateSubject,
}: HomeProps) {
  const { subjects, activeSubjectId, getMcqsForSubject } = useSubjects();
  const currentSubject = subjects.find((s) => s.id === activeSubjectId);
  const mcqCount = getMcqsForSubject(activeSubjectId).length;

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 pt-20 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-50"
      }`}
    >
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className={`text-4xl font-bold mb-3 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              DITOR<sup className="text-sm text-gray-500">v2</sup>
            </h1>
            <p
              className={`text-xl ${
                darkMode ? "text-slate-300" : "text-gray-600"
              }`}
            >
              Prepare for your exams with our intelligent testing platform
            </p>
          </div>
        </div>

        {subjects.length === 0 ? (
          <Card
            className={`mb-8 border-2 border-dashed ${
              darkMode ? "bg-slate-800 border-slate-600" : "border-gray-300"
            }`}
          >
            <CardContent className="pt-8 pb-8 text-center">
              <p className={darkMode ? "text-slate-300" : "text-gray-600"}>
                No subjects yet. Create your first subject to get started.
              </p>
              {onOpenMobileSidebar && (
                <Button
                  onClick={onCreateSubject || onOpenMobileSidebar}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 mt-4"
                >
                  Create Subject
                </Button>
              )}
            </CardContent>
          </Card>
        ) : !activeSubjectId ? (
          <Card
            className={`mb-8 border-2 border-dashed ${
              darkMode ? "bg-slate-800 border-slate-600" : "border-yellow-300"
            }`}
          >
            <CardContent className="pt-8 pb-8 text-center">
              <p className={darkMode ? "text-slate-300" : "text-gray-600"}>
                Please select a subject from the sidebar to begin.
              </p>
              {onOpenMobileSidebar && (
                <Button
                  onClick={onOpenMobileSidebar}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 mt-4"
                >
                  Choose Subject
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div
              className={`mb-8 p-4 rounded-lg border transition-colors ${
                darkMode
                  ? "bg-blue-900 border-blue-700 text-blue-100"
                  : "bg-blue-50 border-blue-200 text-blue-900"
              }`}
            >
              <p className="text-center font-semibold">
                {mcqCount === 0
                  ? `📁 ${currentSubject?.name} - No MCQs yet. Load some to get started.`
                  : `📁 ${currentSubject?.name} - ${mcqCount} MCQs ready`}
              </p>
            </div>
          </>
        )}

        {activeSubjectId && mcqCount > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className={`hover:shadow-lg transition-all cursor-pointer ${
                darkMode ? "bg-slate-800 border-slate-700" : ""
              }`}
              onClick={onStartPractice}
            >
              <CardHeader>
                <CardTitle
                  className={`text-2xl ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Practice Test
                </CardTitle>
                <CardDescription className={darkMode ? "text-slate-400" : ""}>
                  Learn at your own pace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul
                  className={`space-y-2 text-sm mb-4 ${
                    darkMode ? "text-slate-300" : "text-gray-600"
                  }`}
                >
                  <li>✓ Unlimited attempts</li>
                  <li>✓ Shuffle questions</li>
                  <li>✓ No time limit</li>
                  <li>✓ Instant feedback</li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Start Practicing
                </Button>
              </CardContent>
            </Card>

            <Card
              className={`hover:shadow-lg transition-all cursor-pointer ${
                darkMode ? "bg-slate-800 border-slate-700" : ""
              }`}
              onClick={onStartExam}
            >
              <CardHeader>
                <CardTitle
                  className={`text-2xl ${
                    darkMode ? "text-indigo-400" : "text-indigo-600"
                  }`}
                >
                  Exam Test
                </CardTitle>
                <CardDescription className={darkMode ? "text-slate-400" : ""}>
                  Real exam experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul
                  className={`space-y-2 text-sm mb-4 ${
                    darkMode ? "text-slate-300" : "text-gray-600"
                  }`}
                >
                  <li>✓ Timed exam</li>
                  <li>✓ Question pool</li>
                  <li>✓ Auto-submit</li>
                  <li>✓ Detailed results</li>
                </ul>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Take Exam
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubjectId && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={onInputMcqs}
              className={`${
                darkMode
                  ? "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                  : "text-gray-600 border-gray-300 hover:bg-gray-50 bg-white"
              }`}
            >
              Load MCQs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
