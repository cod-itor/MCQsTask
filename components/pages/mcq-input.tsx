"use client";
import { MCQEditorPage } from "@/components/MCQEditorPage/mcq-editor-page";

interface MCQInputProps {
  onMcqsLoaded: () => void;
  darkMode: boolean;
}

export default function MCQInput({ onMcqsLoaded, darkMode }: MCQInputProps) {
  return <MCQEditorPage onMcqsLoaded={onMcqsLoaded} darkMode={darkMode} />;
}
