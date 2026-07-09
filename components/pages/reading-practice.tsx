"use client"

import { useState, useEffect } from "react"
import { useSubjects } from "@/lib/subject-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Menu, ArrowLeft, CheckCircle2, XCircle, ChevronDown, Check } from "lucide-react"
import type { ReadingPassage, ReadingQuestion } from "@/lib/types"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/components/ui/use-mobile"

interface ReadingPracticeProps {
  onBack: () => void
  darkMode: boolean
  onOpenMobileSidebar?: () => void
}

export default function ReadingPractice({ onBack, darkMode, onOpenMobileSidebar }: ReadingPracticeProps) {
  const { activeSubjectId, getReadingPassagesForSubject } = useSubjects()
  const passages = getReadingPassagesForSubject(activeSubjectId)
  const isMobile = useIsMobile()

  const [currentPassageIndex, setCurrentPassageIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)

  const currentPassage = passages[currentPassageIndex]

  // Reset state when changing passages
  useEffect(() => {
    setAnswers({})
    setIsSubmitted(false)
    setOpenPopoverId(null)
  }, [currentPassageIndex])

  if (!currentPassage) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? "bg-slate-900" : "bg-blue-50"}`}>
        <div className="text-center">
          <p className={`text-xl mb-4 ${darkMode ? "text-slate-300" : "text-gray-600"}`}>No reading passages found.</p>
          <Button onClick={onBack} variant="outline" className={darkMode ? "bg-slate-800 text-white" : ""}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    if (isSubmitted) return
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
  }

  const handleNext = () => {
    if (currentPassageIndex < passages.length - 1) {
      setCurrentPassageIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentPassageIndex > 0) {
      setCurrentPassageIndex((prev) => prev - 1)
    }
  }

  // Filter out used options for the top sticky box
  const unusedGlobalOptions = (currentPassage.globalOptions || []).filter(
    (opt) => !Object.values(answers).includes(opt)
  )

  const calculateScore = () => {
    if (!currentPassage) return 0
    let correct = 0
    currentPassage.questions.forEach((q) => {
      const userAnswer = answers[q.id]?.trim().toLowerCase() || ""
      const correctAnswer = q.answer.trim().toLowerCase()
      if (userAnswer === correctAnswer) {
        correct++
      }
    })
    return correct
  }

  const renderQuestion = (q: ReadingQuestion, index: number) => {
    const parts = q.text.split("[blank]")
    const userAnswer = answers[q.id] || ""
    const isCorrect = isSubmitted && userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()
    const isIncorrect = isSubmitted && userAnswer.trim().toLowerCase() !== q.answer.trim().toLowerCase()

    // Determine which options to use for this question (local or global)
    // We filter out options that have been used by OTHER questions
    const usedByOthers = Object.entries(answers)
      .filter(([id, _]) => id !== q.id)
      .map(([_, val]) => val)

    const optionsToUse = (q.options && q.options.length > 0
      ? q.options
      : (currentPassage.globalOptions || []))
      .filter(opt => !usedByOthers.includes(opt))

    let inputClass = `mx-1 md:mx-2 px-2 md:px-3 py-1.5 border rounded-md inline-flex items-center justify-between text-sm min-w-[120px] md:min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${darkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-gray-300 hover:bg-gray-50"
      }`

    let textInputClass = `mx-1 md:mx-2 px-2 md:px-3 py-1.5 border rounded-md inline-block text-sm min-w-[120px] md:min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${darkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-gray-300"
      }`

    if (isSubmitted) {
      if (isCorrect) {
        inputClass += darkMode ? " border-green-500 bg-green-900/30" : " border-green-500 bg-green-50"
        textInputClass += darkMode ? " border-green-500 bg-green-900/30" : " border-green-500 bg-green-50"
      } else {
        inputClass += darkMode ? " border-red-500 bg-red-900/30" : " border-red-500 bg-red-50"
        textInputClass += darkMode ? " border-red-500 bg-red-900/30" : " border-red-500 bg-red-50"
      }
    }

    return (
      <div key={q.id} className="mb-6 leading-8">
        <div className="flex items-start">
          <span className={`font-bold mr-2 mt-1.5 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
            {index + 1}.
          </span>
          <div className="flex-1 items-center flex-wrap mt-1">
            {parts.map((part, i) => (
              <span key={i}>
                {part}
                {i < parts.length - 1 && (
                  <span className="inline-flex items-center align-middle relative">
                    {optionsToUse.length > 0 ? (
                      <Popover
                        open={openPopoverId === q.id}
                        onOpenChange={(open) => {
                          if (!isSubmitted) setOpenPopoverId(open ? q.id : null)
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button
                            className={inputClass}
                            disabled={isSubmitted}
                            onDragOver={(e) => {
                              if (!isSubmitted) e.preventDefault()
                            }}
                            onDrop={(e) => {
                              if (isSubmitted) return
                              e.preventDefault()
                              const droppedData = e.dataTransfer.getData("text/plain")
                              if (droppedData) {
                                handleAnswerChange(q.id, droppedData)
                              }
                            }}
                          >
                            <span className="truncate max-w-[150px]">{userAnswer || "Select..."}</span>
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-0" align="start">
                          <Command filter={(value, search) => {
                            if (value.toLowerCase().includes(search.toLowerCase())) return 1
                            return 0
                          }}>
                            <CommandInput placeholder="Search options..." />
                            <CommandList className="max-h-[160px] md:max-h-[300px]">
                              <CommandEmpty>No option found.</CommandEmpty>
                              <CommandGroup>
                                {optionsToUse.map((opt) => (
                                  <CommandItem
                                    key={opt}
                                    value={opt}
                                    onSelect={() => {
                                      handleAnswerChange(q.id, opt)
                                      setOpenPopoverId(null)
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${userAnswer === opt ? "opacity-100" : "opacity-0"
                                        }`}
                                    />
                                    {opt}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <input
                        type="text"
                        className={textInputClass}
                        value={userAnswer}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        disabled={isSubmitted}
                        placeholder="..."
                        onDragOver={(e) => {
                          if (!isSubmitted) e.preventDefault()
                        }}
                        onDrop={(e) => {
                          if (isSubmitted) return
                          e.preventDefault()
                          const droppedData = e.dataTransfer.getData("text/plain")
                          if (droppedData) {
                            handleAnswerChange(q.id, droppedData)
                          }
                        }}
                      />
                    )}

                    {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 inline ml-2" />}
                    {isSubmitted && isIncorrect && <XCircle className="w-5 h-5 text-red-500 inline ml-2" />}
                  </span>
                )}
              </span>
            ))}
            {isSubmitted && isIncorrect && (
              <div className={`mt-2 text-sm px-3 py-2 rounded-md inline-block w-full ${darkMode ? "bg-red-900/20 text-red-400 border border-red-900/50" : "bg-red-50 text-red-700 border border-red-100"}`}>
                Correct answer: <span className="font-semibold">{q.answer}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const globalOptionsPanel = unusedGlobalOptions.length > 0 ? (
    <div className={`flex-shrink-0 p-4 md:p-6 ${!isMobile ? 'border-b z-10 shadow-sm sticky top-0' : 'mb-2'} ${darkMode ? "bg-slate-800/95 border-slate-700" : "bg-[#f8fcf8]/95 border-emerald-100"} backdrop-blur-sm`}>
      <div className={`border-2 rounded-xl p-4 md:p-5 ${darkMode ? "border-emerald-700/50 bg-emerald-950/20" : "border-emerald-600/30 bg-white"}`}>
        <h4 className={`text-xs md:text-sm font-bold uppercase tracking-wider mb-3 md:mb-4 ${darkMode ? "text-emerald-500" : "text-emerald-700"}`}>
          Available Options <span className="text-[10px] md:text-xs font-normal opacity-70 ml-2 hidden sm:inline">(Drag & drop or use dropdowns)</span>
        </h4>
        <div className="flex flex-wrap gap-x-4 gap-y-3 md:gap-x-6 md:gap-y-4">
          {unusedGlobalOptions.map((opt, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", opt)
                e.dataTransfer.effectAllowed = "copy"
              }}
              className={`cursor-grab active:cursor-grabbing px-2.5 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${darkMode
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-sm"
                }`}
            >
              {opt}
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  const passageContent = (
    <div className={`p-4 md:p-8 ${!isMobile ? 'h-full overflow-y-auto' : ''} ${!isMobile ? (darkMode ? "border-r border-slate-700 bg-slate-900" : "border-r border-gray-200 bg-white") : ""}`}>
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 font-serif leading-tight">{currentPassage.header}</h2>
      <div className={`prose max-w-none font-serif leading-loose text-base md:text-lg whitespace-pre-wrap ${darkMode ? "prose-invert text-slate-300" : "text-gray-800"}`}>
        {currentPassage.content.split('[blank]').map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && <span>_____</span>}
          </span>
        ))}
      </div>
    </div>
  );

  const questionsListContent = (
    <div className={`p-4 md:p-8 ${!isMobile ? 'flex-1 overflow-y-auto' : ''}`}>
      <Card className={`border-0 shadow-none bg-transparent ${darkMode ? "text-slate-200" : ""}`}>
        <CardContent className="p-0">
          <div className="space-y-4">
            {currentPassage.questions.map((q, idx) => renderQuestion(q, idx))}
          </div>

          <div className="mt-8 md:mt-12 flex flex-col gap-4 md:gap-6">
            {isSubmitted && (
              <div className={`p-4 md:p-6 rounded-xl text-center font-bold text-xl md:text-2xl ${darkMode ? "bg-slate-700 text-white" : "bg-white border-2 border-emerald-100 shadow-md text-emerald-900"
                }`}>
                Score: {calculateScore()} / {currentPassage.questions.length}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {!isSubmitted ? (
                <Button onClick={handleSubmit} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-5 md:py-6 text-base md:text-lg rounded-xl shadow-md transition-transform active:scale-[0.98]">
                  Submit Answers
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setAnswers({})
                    setIsSubmitted(false)
                  }}
                  variant="outline"
                  className={`flex-1 py-5 md:py-6 text-base md:text-lg rounded-xl border-2 ${darkMode ? "bg-slate-700 border-slate-600 hover:bg-slate-600" : "hover:bg-gray-50 border-gray-200"}`}
                >
                  Try Again
                </Button>
              )}
            </div>

            <div className="flex gap-4 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200 dark:border-slate-700">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentPassageIndex === 0}
                className={`rounded-lg flex-1 sm:flex-none ${darkMode ? "hover:bg-slate-700" : "hover:bg-gray-200"}`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Previous Passage</span><span className="sm:hidden">Prev</span>
              </Button>
              <div className="hidden sm:block flex-1"></div>
              <Button
                variant="ghost"
                onClick={handleNext}
                disabled={currentPassageIndex === passages.length - 1}
                className={`rounded-lg flex-1 sm:flex-none ${darkMode ? "hover:bg-slate-700" : "hover:bg-gray-200"}`}
              >
                <span className="hidden sm:inline">Next Passage</span><span className="sm:hidden">Next</span> <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`flex flex-col ${!isMobile ? "h-full absolute inset-0 md:static" : "min-h-full"} ${darkMode ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <header
        className={`flex-shrink-0 flex items-center justify-between p-3 md:p-4 border-b ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
          } shadow-sm z-20 sticky top-0`}
      >
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className={darkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-gray-100"}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {onOpenMobileSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenMobileSidebar}
              className={`md:hidden ${darkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-gray-100"}`}
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-lg md:text-xl font-bold font-serif hidden sm:block">Reading Practice</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className={`text-xs md:text-sm font-medium ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
            Passage {currentPassageIndex + 1} of {passages.length}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`flex flex-col flex-1 ${!isMobile ? "overflow-hidden relative" : ""}`}>
        {isMobile ? (
          <div className="flex flex-col flex-1 w-full pb-10">
            {globalOptionsPanel}
            <div className={darkMode ? "bg-slate-900/50" : "bg-white"}>
              {passageContent}
            </div>
            <div className={`mt-2 border-t border-gray-200 dark:border-slate-700/50 ${darkMode ? "bg-slate-800/50" : "bg-gray-50"}`}>
              {questionsListContent}
            </div>
          </div>
        ) : (
          <div className="flex flex-row flex-1 w-full h-full overflow-hidden">
            <div className="flex-1 w-1/2 overflow-hidden">{passageContent}</div>
            <div className="flex-1 w-1/2 overflow-hidden">
               <div className={`w-full h-full relative flex flex-col overflow-hidden ${darkMode ? "bg-slate-800" : "bg-[#f8fcf8]"}`}>
                 {globalOptionsPanel}
                 {questionsListContent}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
