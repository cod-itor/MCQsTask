import type { ValidationResult } from "./listening-validation"
import { validateListeningQuestions } from "./listening-validation"

export async function parseListeningJSONFile(file: File): Promise<ValidationResult> {
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    return validateListeningQuestions(data)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        isValid: false,
        errors: [{ questionIndex: -1, field: "file", message: `JSON parsing error: ${error.message}` }],
      }
    }
    return {
      isValid: false,
      errors: [{ questionIndex: -1, field: "file", message: "Failed to read file" }],
    }
  }
}

export function exportListeningToJSON(questions: any[], filename = "listening.json") {
  // Strip out internal IDs before exporting
  const exportData = questions.map((q) => {
    const { id, ...rest } = q
    return rest
  })

  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
