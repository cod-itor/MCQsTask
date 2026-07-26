"use client"

import { ReadingEditorPage } from "@/components/ReadingEditorPage/reading-editor-page"

interface ReadingInputProps {
  onReadingLoaded: () => void;
  darkMode: boolean;
  onBack?: () => void;
}

export default function ReadingInput({
  onReadingLoaded,
  darkMode,
  onBack,
}: ReadingInputProps) {
  return <ReadingEditorPage onReadingLoaded={onReadingLoaded} darkMode={darkMode} onBack={onBack} />;
}
