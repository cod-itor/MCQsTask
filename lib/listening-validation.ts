import type { ListeningQuestion } from "./types"

export interface ValidationError {
  questionIndex: number
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  questions?: ListeningQuestion[]
}

/**
 * Validates Listening JSON format
 */
export function validateListeningQuestions(data: any[]): ValidationResult {
  const errors: ValidationError[] = []
  const questions: ListeningQuestion[] = []

  if (!Array.isArray(data)) {
    return {
      isValid: false,
      errors: [{ questionIndex: -1, field: "root", message: "Input must be an array of questions" }],
    }
  }

  if (data.length === 0) {
    return {
      isValid: false,
      errors: [{ questionIndex: -1, field: "root", message: "Please provide at least one question" }],
    }
  }

  data.forEach((item: any, index: number) => {
    const word = item.q || item.word || item.question

    if (!word) {
      errors.push({
        questionIndex: index,
        field: "q",
        message: "Question/Word text is required",
      })
    }

    // Reject MCQs to prevent cross-import
    if (item.opts || item.options) {
      errors.push({
        questionIndex: index,
        field: "root",
        message: "This file is for MCQs. Please import it in the MCQ editor.",
      })
    }

    if (item.header || item.content) {
      errors.push({
        questionIndex: index,
        field: "root",
        message: "This file is for Reading Passages. Please import it in the Reading editor.",
      })
    }

    const answer = item.a || item.answer
    const imageUrl = item.imageUrl || item.image

    if (!errors.some((e) => e.questionIndex === index)) {
      questions.push({
        id: `listening-${Date.now()}-${Math.random()}`,
        q: word,
        ...(answer && { a: answer }),
        ...(imageUrl && { imageUrl }),
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    questions: errors.length === 0 ? questions : undefined,
  }
}
