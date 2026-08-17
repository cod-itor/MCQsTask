"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Copy, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

interface HowToImportModalProps {
  category: "mcq" | "reading" | "Audio Flashcard";
  darkMode: boolean;
}

export function HowToImportModal({ category, darkMode }: HowToImportModalProps) {
  const [copied, setCopied] = useState(false);
  const [showAIInstructions, setShowAIInstructions] = useState(false);

  const getFormatDetails = () => {
    switch (category) {
      case "mcq":
        return {
          title: "MCQ Format",
          format: `[\n  {\n    "q": "What is the chemical formula for water?",\n    "options": ["H<sub>2</sub>O", "CO<sub>2</sub>", "O<sub>2</sub>", "NaCl"],\n    "answer": "H<sub>2</sub>O",\n    "explanation": "Water is two hydrogen atoms and one oxygen atom.<br><br><b>Note:</b> Easy to remember!"\n  }\n]`,
          prompt: `Please generate a set of multiple choice questions based on the following text. Format the output strictly as a JSON array where each object has the properties: "q" (the question string), "options" (an array of 4 string options), "answer" (the correct string option which must exactly match one of the items in the options array), and optionally "explanation" (string). You can use standard HTML tags like <b>, <i>, <br>, <sub>, and <sup> directly inside the strings for rich formatting. Text: [paste your text here]`
        };
      case "reading":
        return {
          title: "Reading Format",
          format: `[\n  {\n    "title": "Passage Title",\n    "content": "Paragraph 1...\\n\\nParagraph 2...",\n    "questions": [\n      {\n        "q": "What does <b>HTML</b> stand for?",\n        "options": ["A", "B", "C"],\n        "answer": "A"\n      }\n    ]\n  }\n]`,
          prompt: `Please format the following reading passage and its questions strictly as a JSON array. Each object in the array should represent a passage with properties: "title" (string), "content" (string, use \\n\\n for paragraphs), and "questions" (an array of question objects). Each question object must have: "q" (string), "options" (array of strings), and "answer" (the correct option as a string). You can use standard HTML tags like <b>, <i>, <br>, <sub>, and <sup> directly inside the strings for rich formatting. Text: [paste your text here]`
        };
      case "Audio Flashcard":
        return {
          title: "Audio Flashcard Format",
          format: `[\n  {\n    "q": "Water",\n    "a": "<b>H<sub>2</sub>O</b><br><br><b>Note:</b> Essential for life."\n  },\n  {\n    "q": "Benevolent",\n    "a": "Well meaning and kindly"\n  }\n]`,
          prompt: `Please extract the key vocabulary words from the following text and format them strictly as a JSON array. Each object in the array should have a property "q" whose value is the word string, and an optional property "a" whose value is the definition or translation. You can use standard HTML tags like <b>, <i>, <br>, <sub>, and <sup> directly inside the strings for rich formatting (e.g. for chemistry or to append a <b>Note:</b> section to the answer). Text: [paste your text here]`
        };
    }
  };

  const details = getFormatDetails();

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(details.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${darkMode ? "text-blue-400 hover:text-blue-300 hover:bg-slate-800" : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"}`}
        >
          <HelpCircle className="w-4 h-4" />
          How to Import
        </Button>
      </DialogTrigger>
      <DialogContent className={`w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto ${darkMode ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white text-gray-900"}`}>
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            How to Import JSON
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="font-semibold mb-2">Example JSON Format</h3>
            <p className={`text-sm mb-3 ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
              Your JSON file must strictly follow this structure for {details.title}:
            </p>
            <div className={`p-4 rounded-lg font-mono text-sm overflow-x-auto ${darkMode ? "bg-slate-950 text-emerald-400" : "bg-gray-100 text-emerald-600"}`}>
              <pre>{details.format}</pre>
            </div>
          </div>

          <div className={`rounded-xl border ${darkMode ? "border-slate-700 bg-slate-800/50" : "border-gray-200 bg-gray-50"}`}>
            <button
              className="w-full flex items-center justify-between p-4 font-semibold text-left focus:outline-none"
              onClick={() => setShowAIInstructions(!showAIInstructions)}
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                What do I do with the JSON format?
              </span>
              {showAIInstructions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showAIInstructions && (
              <div className={`p-4 pt-0 text-sm ${darkMode ? "text-slate-300" : "text-gray-600"}`}>
                <p className="mb-4 leading-relaxed">
                  You don't have to write the JSON manually! You can use an AI like Google Gemini or ChatGPT to automatically convert your study materials into the correct format. Just copy the prompt below, paste it into the AI along with your text, and save the AI's response as a <code className="bg-slate-500/20 px-1 py-0.5 rounded">.json</code> file.
                </p>

                <div className="relative">
                  <div className={`p-4 pr-12 rounded-lg text-sm leading-relaxed ${darkMode ? "bg-slate-950 text-slate-300 border border-slate-800" : "bg-white text-gray-700 border border-gray-200"}`}>
                    {details.prompt}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCopyPrompt}
                    className={`absolute top-2 right-2 h-8 w-8 ${darkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"}`}
                    title="Copy AI Prompt"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className={`w-4 h-4 ${darkMode ? "text-slate-400" : "text-gray-500"}`} />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
