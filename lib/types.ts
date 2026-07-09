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
  mcqSets: Record<string, MCQSet[]> 
  readingSets: Record<string, ReadingSet[]> 
  activeSubjectId: string | null
  activeMcqSetId: string | null
  activeReadingSetId: string | null
}

export interface MCQSet {
  id: string
  subjectId: string
  name: string
  createdAt: number
  mcqs: MCQ[]
}

export interface ReadingSet {
  id: string
  subjectId: string
  name: string
  createdAt: number
  passages: ReadingPassage[]
}

export interface ReadingQuestion {
  id: string
  text: string
  answer: string
  options?: string[]
}

export interface ReadingPassage {
  id: string
  header: string
  content: string
  globalOptions?: string[]
  questions: ReadingQuestion[]
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
