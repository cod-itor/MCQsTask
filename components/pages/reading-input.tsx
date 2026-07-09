"use client"

import { ReadingEditorPage } from "@/components/ReadingEditorPage/reading-editor-page"

interface ReadingInputProps {
  onReadingLoaded: () => void
  darkMode: boolean
}

export default function ReadingInput(props: ReadingInputProps) {
  return <ReadingEditorPage {...props} />
}
