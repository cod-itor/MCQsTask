import type { ReadingValidationResult } from "./reading-validation"
import { validateReadingPassages } from "./reading-validation"

export async function parseReadingJSONFile(file: File): Promise<ReadingValidationResult> {
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    return validateReadingPassages(data)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        isValid: false,
        errors: [{ passageIndex: -1, field: "file", message: `JSON parsing error: ${error.message}` }],
      }
    }
    return {
      isValid: false,
      errors: [{ passageIndex: -1, field: "file", message: "Failed to read file" }],
    }
  }
}

export function exportReadingToJSON(passages: any[], filename = "reading-passages.json") {
  const dataStr = JSON.stringify(passages, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
