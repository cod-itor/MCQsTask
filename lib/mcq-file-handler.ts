import type { ValidationResult } from "./mcq-validation"
import { validateMCQs } from "./mcq-validation"

export async function parseJSONFile(file: File): Promise<ValidationResult> {
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    return validateMCQs(data)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        isValid: false,
        errors: [{ mcqIndex: -1, field: "file", message: `JSON parsing error: ${error.message}` }],
      }
    }
    return {
      isValid: false,
      errors: [{ mcqIndex: -1, field: "file", message: "Failed to read file" }],
    }
  }
}

export function exportMCQsToJSON(mcqs: any[], filename = "mcqs.json") {
  const dataStr = JSON.stringify(mcqs, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
