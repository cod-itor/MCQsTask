import type { ReadingPassage, ReadingQuestion } from "./types"

export interface ReadingValidationError {
  passageIndex: number
  questionIndex?: number
  field: string
  message: string
}

export interface ReadingValidationResult {
  isValid: boolean
  errors: ReadingValidationError[]
  passages?: ReadingPassage[]
}

export function validateReadingPassages(data: any[]): ReadingValidationResult {
  const errors: ReadingValidationError[] = []
  const passages: ReadingPassage[] = []

  if (!Array.isArray(data)) {
    return {
      isValid: false,
      errors: [{ passageIndex: -1, field: "root", message: "Input must be an array of Reading Passages" }],
    }
  }

  if (data.length === 0) {
    return {
      isValid: false,
      errors: [{ passageIndex: -1, field: "root", message: "Please provide at least one Reading Passage" }],
    }
  }

  data.forEach((item: any, index: number) => {
    if (!item.header || !item.content || !Array.isArray(item.questions)) {
      errors.push({
        passageIndex: index,
        field: "passage",
        message: "Missing required fields (header, content, questions array)",
      })
      return
    }

    const questions: ReadingQuestion[] = []
    
    item.questions.forEach((q: any, qIndex: number) => {
      if (!q.id || !q.text || !q.answer) {
        errors.push({
          passageIndex: index,
          questionIndex: qIndex,
          field: "question",
          message: "Missing required fields (id, text, answer)",
        })
      } else if (!q.text.includes("[blank]")) {
        errors.push({
          passageIndex: index,
          questionIndex: qIndex,
          field: "text",
          message: 'Question text must contain "[blank]" marker',
        })
      } else {
        questions.push({
          id: String(q.id),
          text: q.text,
          answer: q.answer,
          options: q.options && Array.isArray(q.options) ? q.options : undefined,
        })
      }
    })

    if (!errors.some((e) => e.passageIndex === index)) {
      passages.push({
        id: item.id || `reading-${Date.now()}-${Math.random()}`,
        header: item.header,
        content: item.content,
        questions: questions,
        globalOptions: item.globalOptions && Array.isArray(item.globalOptions) ? item.globalOptions : undefined,
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    passages: errors.length === 0 ? passages : undefined,
  }
}
