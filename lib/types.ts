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
export interface ExamState {
  questions: MCQ[]
  currentQuestion: number
  answers: { [key: number]: number }
  timeRemaining: number
  isActive: boolean
  sessionId: string
  startTime: number
  questionStartTimes: { [key: number]: number }
  shuffledOptions?: { [key: number]: { shuffled: string[]; mapping: number[] } }
}

export interface PracticeSession {
  questionIndex: number
  isCorrect: boolean
  selectedAnswer: number
  timeSpent: number
}
