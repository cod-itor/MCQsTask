"use client";
import { MCQEditorPage } from "@/components/MCQEditorPage/mcq-editor-page";

interface MCQInputProps {
  onMcqsLoaded: () => void;
  darkMode: boolean;
  onBack?: () => void;
}

export default function MCQInput({ onMcqsLoaded, darkMode, onBack }: MCQInputProps) {
  return <MCQEditorPage onMcqsLoaded={onMcqsLoaded} darkMode={darkMode} onBack={onBack} />;
}
