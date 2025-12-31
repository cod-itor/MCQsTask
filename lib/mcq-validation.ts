import type { MCQ } from "./types"

export interface ValidationError {
  mcqIndex: number
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  mcqs?: MCQ[]
}

/**
 * Validates MCQs with strict rules
 * - Correct answer must exist in options array
 * - Correct answer must be 0-based index
 * - All required fields must be present
 */
export function validateMCQs(data: any[]): ValidationResult {
  const errors: ValidationError[] = []
  const mcqs: MCQ[] = []

  if (!Array.isArray(data)) {
    return {
      isValid: false,
      errors: [{ mcqIndex: -1, field: "root", message: "Input must be an array of MCQs" }],
    }
  }

  if (data.length === 0) {
    return {
      isValid: false,
      errors: [{ mcqIndex: -1, field: "root", message: "Please provide at least one MCQ" }],
    }
  }

  data.forEach((item: any, index: number) => {
    const question = item.q || item.question
    const options = item.opts || item.options
    const correctAnswer = item.answer !== undefined ? item.answer : item.correctAnswer

    // Check required fields
    if (!question) {
      errors.push({
        mcqIndex: index,
        field: "q",
        message: "Question text is required",
      })
    }

    if (!options) {
      errors.push({
        mcqIndex: index,
        field: "opts",
        message: "Options array is required",
      })
    } else if (!Array.isArray(options)) {
      errors.push({
        mcqIndex: index,
        field: "opts",
        message: "Options must be an array",
      })
    } else if (options.length < 2) {
      errors.push({
        mcqIndex: index,
        field: "opts",
        message: "At least 2 options are required",
      })
    }

    if (correctAnswer === undefined) {
      errors.push({
        mcqIndex: index,
        field: "answer",
        message: "Correct answer index is required",
      })
    } else if (!Number.isInteger(correctAnswer)) {
      errors.push({
        mcqIndex: index,
        field: "answer",
        message: "Correct answer must be an integer",
      })
    } else if (options && Array.isArray(options)) {
      if (correctAnswer < 0 || correctAnswer >= options.length) {
        errors.push({
          mcqIndex: index,
          field: "answer",
          message: `Correct answer index (${correctAnswer}) is out of range. Valid range: 0-${options.length - 1}`,
        })
      }
    }

    // If no errors for this MCQ, add it to the array
    if (!errors.some((e) => e.mcqIndex === index)) {
      mcqs.push({
        id: `mcq-${Date.now()}-${Math.random()}`,
        q: question,
        opts: options,
        answer: correctAnswer,
        explanation: item.explanation || "",
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    mcqs: errors.length === 0 ? mcqs : undefined,
  }
}

/**
 * Converts user-friendly 1-based index to internal 0-based index
 */
export function convertUserIndexToInternal(userIndex: number): number {
  return userIndex - 1
}

/**
 * Converts internal 0-based index to user-friendly 1-based index
 */
export function convertInternalIndexToUser(internalIndex: number): number {
  return internalIndex + 1
}
