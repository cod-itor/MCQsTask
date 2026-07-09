import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import type { ReadingPassage } from "@/lib/types"

interface ReadingJSONEditorProps {
  passages: ReadingPassage[]
  onChange: (passages: ReadingPassage[]) => void
  darkMode: boolean
}

export function ReadingJSONEditor({ passages, onChange, darkMode }: ReadingJSONEditorProps) {
  const [jsonText, setJsonText] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only update if the text is empty or matches previous state to avoid losing unapplied edits
    const formatted = JSON.stringify(passages, null, 2)
    if (!jsonText || error === null) {
      setJsonText(formatted)
    }
  }, [passages])

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText)
      
      // Basic validation
      if (!Array.isArray(parsed)) {
        throw new Error("Root must be an array of Passages")
      }

      onChange(parsed)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
    }
  }

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText)
      setJsonText(JSON.stringify(parsed, null, 2))
      setError(null)
    } catch (err) {
      setError("Cannot format invalid JSON")
    }
  }

  return (
    <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
            Directly edit the raw JSON data. Be careful to maintain the correct structure.
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleFormat}
              className={darkMode ? "border-slate-600 hover:bg-slate-700" : ""}
            >
              Format JSON
            </Button>
            <Button onClick={handleApply}>
              Apply Changes
            </Button>
          </div>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded flex items-center gap-2 ${
            darkMode ? "bg-red-900/30 text-red-200" : "bg-red-50 text-red-700"
          }`}>
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value)
            setError(null)
          }}
          className={`w-full h-[600px] font-mono text-sm p-4 rounded-md border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            darkMode 
              ? "bg-slate-900 border-slate-700 text-slate-300" 
              : "bg-gray-50 border-gray-300 text-gray-800"
          }`}
          spellCheck={false}
        />
      </CardContent>
    </Card>
  )
}
