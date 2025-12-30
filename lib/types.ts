export interface MCQ {
  id: string
  q: string
  opts: string[]
  answer: number
  explanation?: string
}

export interface Subject {
  id: string
  name: string
  isFavorite: boolean
  createdAt: number
  mcqCount: number
}

export interface SubjectData {
  subjects: Subject[]
  mcqs: Record<string, MCQ[]> // subjectId -> MCQs
  activeSubjectId: string | null
}

export interface ExamState {
  questions: MCQ[]
  currentQuestion: number
  answers: Record<number, number>
  timeRemaining: number
  isActive: boolean
  sessionId: string
  startTime: number
  questionStartTimes: Record<number, number>
}

export interface ExamResult {
  sessionId: string
  score: number
  totalQuestions: number
  timeSpent: number
  date: number
  answers: Record<number, number>
  questionTimes: Record<number, number>
  questions: MCQ[]
}

export interface PracticeSession {
  questionIndex: number
  isCorrect: boolean
  selectedAnswer: number
  timeSpent: number
}
