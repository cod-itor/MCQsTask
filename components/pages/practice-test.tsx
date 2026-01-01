"use client";

import { useState, useEffect } from "react";
import { useSubjects } from "@/lib/subject-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EditMcqsWarningModal from "@/components/edit-mcqs-warning-modal";
import { QuestionEditor } from "@/components/MCQEditorPage/question-editor";

interface PracticeTestProps {
  onBack: () => void;
  darkMode: boolean;
  onOpenMobileSidebar?: () => void;
}

interface ShuffledQuestion {
  id: string;
  q: string;
  opts: string[];
  answer: number;
  explanation?: string;
  originalOpts: string[];
  originalAnswer: number;
}

interface MCQ {
  id: string;
  q: string;
  opts: string[];
  answer: number;
  explanation?: string;
}

export default function PracticeTest({
  onBack,
  darkMode,
  onOpenMobileSidebar,
}: PracticeTestProps) {
  const { activeSubjectId, getMcqsForSubject, subjects, updateMcqsForSubject } =
    useSubjects();
  const mcqs = getMcqsForSubject(activeSubjectId);
  const currentSubject = subjects.find((s) => s.id === activeSubjectId);

  const [displayQuestions, setDisplayQuestions] = useState<ShuffledQuestion[]>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [mixOptions, setMixOptions] = useState(false);
  const [retryMode, setRetryMode] = useState(false);

  const [showEditWarning, setShowEditWarning] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);

  // Shuffle array helper
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  // Initialize or update questions based on shuffle/mix settings
  useEffect(() => {
    let questions = [...mcqs];

    // Shuffle questions if enabled
    if (shuffle) {
      questions = shuffleArray(questions);
    }

    // Mix options if enabled
    const processedQuestions = questions.map((q) => {
      if (mixOptions) {
        // Create array of [option, originalIndex] pairs
        const optionsWithIndex = q.opts.map((opt, idx) => ({ opt, idx }));
        const shuffledOptions = shuffleArray(optionsWithIndex);

        // Find new position of correct answer
        const newAnswerIndex = shuffledOptions.findIndex(
          (item) => item.idx === q.answer
        );

        return {
          id: q.id,
          q: q.q,
          opts: shuffledOptions.map((item) => item.opt),
          answer: newAnswerIndex,
          explanation: q.explanation,
          originalOpts: q.opts,
          originalAnswer: q.answer,
        };
      }

      return {
        id: q.id,
        q: q.q,
        opts: q.opts,
        answer: q.answer,
        explanation: q.explanation,
        originalOpts: q.opts,
        originalAnswer: q.answer,
      };
    });

    setDisplayQuestions(processedQuestions);
    setCurrentIndex(0);
    setAnswers({});
    setShowAnswer(false);
  }, [shuffle, mixOptions, mcqs]);

  const handleToggleShuffle = () => {
    setShuffle(!shuffle);
  };

  const handleToggleMix = () => {
    setMixOptions(!mixOptions);
  };

  const handleRetryIncorrect = () => {
    const incorrectQuestions = displayQuestions.filter((q, idx) => {
      const selected = answers[idx];
      return selected !== undefined && selected !== q.answer;
    });

    if (incorrectQuestions.length === 0) {
      alert("No incorrect questions to retry!");
      return;
    }

    setRetryMode(true);
    setDisplayQuestions(incorrectQuestions);
    setCurrentIndex(0);
    setAnswers({});
    setShowAnswer(false);
  };

  const handleExitRetry = () => {
    setRetryMode(false);
    setShuffle(false);
    setMixOptions(false);
  };

  const handleEditMcqs = () => {
    setEditingQuestionIndex(currentIndex);
    setShowEditWarning(false);
  };

  const handleSaveQuestion = (updatedMcq: MCQ) => {
    if (activeSubjectId) {
      const updated = [...mcqs];
      updated[currentIndex] = updatedMcq;
      updateMcqsForSubject(activeSubjectId, updated);
      setEditingQuestionIndex(null);
    }
  };

  const handleJumpTo = (questionNumber: number) => {
    const newIndex = questionNumber - 1;
    if (newIndex >= 0 && newIndex < displayQuestions.length) {
      setEditingQuestionIndex(newIndex);
    }
  };

  const current = displayQuestions[currentIndex];
  if (!current) return null;

  const selectedAnswer = answers[currentIndex];
  const isCorrect = selectedAnswer === current.answer;

  const incorrectCount = Object.entries(answers).filter(([idx, selected]) => {
    const idxNum = Number.parseInt(idx);
    return selected !== displayQuestions[idxNum].answer;
  }).length;

  return (
    <div
      className={`min-h-screen p-4 py-8 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-50"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h1
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {retryMode
              ? "Retry Incorrect Questions"
              : currentSubject?.name || "Practice Test"}
          </h1>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={handleEditMcqs}
              className={`${
                darkMode
                  ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                  : ""
              }`}
            >
              Edit Question
            </Button>
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            {onOpenMobileSidebar && (
              <Button variant="outline" onClick={onOpenMobileSidebar}>
                Menu
              </Button>
            )}
          </div>
        </div>

        {editingQuestionIndex !== null ? (
          <QuestionEditor
            key={`edit-${editingQuestionIndex}`}
            mode="edit"
            initialData={displayQuestions[editingQuestionIndex]}
            onSave={handleSaveQuestion}
            onCancel={() => setEditingQuestionIndex(null)}
            darkMode={darkMode}
            questionNumber={editingQuestionIndex + 1}
            totalQuestions={displayQuestions.length}
            onNext={() => {
              if (editingQuestionIndex < displayQuestions.length - 1) {
                setEditingQuestionIndex(editingQuestionIndex + 1);
              }
            }}
            onPrevious={() => {
              if (editingQuestionIndex > 0) {
                setEditingQuestionIndex(editingQuestionIndex - 1);
              }
            }}
            onJumpTo={handleJumpTo}
          />
        ) : (
          <>
            <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-semibold ${
                      darkMode ? "text-slate-300" : "text-gray-600"
                    }`}
                  >
                    Question {currentIndex + 1} / {displayQuestions.length}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={shuffle ? "default" : "outline"}
                      onClick={handleToggleShuffle}
                      className="text-xs"
                    >
                      {shuffle ? "Shuffled" : "Ordered"}
                    </Button>
                    <Button
                      size="sm"
                      variant={mixOptions ? "default" : "outline"}
                      onClick={handleToggleMix}
                      className="text-xs"
                    >
                      {mixOptions ? "Mixed" : "Original"}
                    </Button>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border ${
                    darkMode
                      ? "bg-slate-900 border-slate-600 text-slate-100"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <h2
                    className={`text-lg font-semibold ${
                      darkMode ? "text-slate-100" : "text-gray-900"
                    }`}
                  >
                    {current.q}
                  </h2>
                </div>

                <div className="space-y-4">
                  {current.opts.map((option, index) => {
                    const selected = selectedAnswer === index;
                    const label = String.fromCharCode(65 + index); // A B C D

                    return (
                      <button
                        key={index}
                        disabled={showAnswer}
                        onClick={() =>
                          !showAnswer &&
                          setAnswers({ ...answers, [currentIndex]: index })
                        }
                        className={`
                      w-full flex items-center justify-between
                      px-5 py-4 rounded-xl border
                      transition-all
                      ${
                        darkMode
                          ? "bg-slate-700 border-slate-600 hover:bg-slate-600"
                          : "bg-white border-gray-300 hover:bg-gray-50"
                      }
                      ${selected ? "ring-2 ring-blue-500" : ""}
                    `}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`
                          w-9 h-9 flex items-center justify-center
                          rounded-md font-semibold text-sm
                          ${
                            darkMode
                              ? "bg-slate-600 text-slate-100"
                              : "bg-gray-200 text-gray-800"
                          }
                        `}
                          >
                            {label}
                          </div>

                          <span
                            className={
                              darkMode ? "text-slate-100" : "text-gray-900"
                            }
                          >
                            {option}
                          </span>
                        </div>

                        <div
                          className={`
                        w-5 h-5 rounded-full border-2
                        flex items-center justify-center
                        ${
                          selected
                            ? "border-blue-500"
                            : darkMode
                            ? "border-slate-400"
                            : "border-gray-400"
                        }
                      `}
                        >
                          {selected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedAnswer !== undefined && !showAnswer && (
                  <Button
                    onClick={() => setShowAnswer(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    Show Answer
                  </Button>
                )}

                {showAnswer && (
                  <>
                    <div
                      className={`p-4 rounded-lg ${
                        isCorrect
                          ? darkMode
                            ? "bg-green-900 border border-green-700 text-green-100"
                            : "bg-green-50 border border-green-200"
                          : darkMode
                          ? "bg-red-900 border border-red-700 text-red-100"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <p
                        className={`font-semibold ${
                          isCorrect
                            ? darkMode
                              ? "text-green-100"
                              : "text-green-900"
                            : darkMode
                            ? "text-red-100"
                            : "text-red-900"
                        }`}
                      >
                        {isCorrect ? "Correct!" : "Incorrect"}
                      </p>
                      <p
                        className={`text-sm mt-1 ${
                          darkMode ? "text-slate-200" : "text-gray-700"
                        }`}
                      >
                        Correct answer:{" "}
                        <span className="font-semibold">
                          {current.opts[current.answer]}
                        </span>
                      </p>
                      {current.explanation && (
                        <p
                          className={`text-sm mt-2 italic ${
                            darkMode ? "text-slate-200" : "text-gray-700"
                          }`}
                        >
                          <strong>Explanation:</strong> {current.explanation}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentIndex(Math.max(0, currentIndex - 1));
                      setShowAnswer(false);
                    }}
                    disabled={currentIndex === 0}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentIndex(
                        Math.min(displayQuestions.length - 1, currentIndex + 1)
                      );
                      setShowAnswer(false);
                    }}
                    disabled={currentIndex === displayQuestions.length - 1}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentIndex(0);
                      setAnswers({});
                      setShowAnswer(false);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div
              className={`text-center text-sm mb-4 mt-4 ${
                darkMode ? "text-slate-400" : "text-gray-600"
              }`}
            >
              Answered: {Object.keys(answers).length} /{" "}
              {displayQuestions.length}
              {incorrectCount > 0 && (
                <span
                  className={`block font-semibold mt-1 ${
                    darkMode ? "text-orange-400" : "text-red-600"
                  }`}
                >
                  {incorrectCount} incorrect so far
                </span>
              )}
            </div>

            {Object.keys(answers).length === displayQuestions.length && (
              <div className="flex gap-3">
                {!retryMode && incorrectCount > 0 && (
                  <Button
                    onClick={handleRetryIncorrect}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    Retry Incorrect ({incorrectCount})
                  </Button>
                )}
                {retryMode && (
                  <Button
                    onClick={handleExitRetry}
                    className={`flex-1 ${
                      darkMode
                        ? "bg-slate-700 hover:bg-slate-600"
                        : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    Exit Retry Mode
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        <EditMcqsWarningModal
          isOpen={showEditWarning}
          darkMode={darkMode}
          onConfirm={handleEditMcqs}
          onCancel={() => setShowEditWarning(false)}
          isExamActive={false}
        />
      </div>
    </div>
  );
}
