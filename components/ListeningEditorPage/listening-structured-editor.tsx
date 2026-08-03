"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, ImagePlus, X, Crop } from "lucide-react";
import type { ListeningQuestion } from "@/lib/types";
import { ImageCropperModal } from "./image-cropper-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ListeningStructuredEditorProps {
  questions: ListeningQuestion[];
  onChange: (questions: ListeningQuestion[]) => void;
  displayedQuestions?: ListeningQuestion[];
  darkMode: boolean;
}

export function ListeningStructuredEditor({
  questions,
  onChange,
  displayedQuestions,
  darkMode,
}: ListeningStructuredEditorProps) {
  // States for confirmations
  const [confirmReplaceId, setConfirmReplaceId] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  
  const [confirmDeleteImageId, setConfirmDeleteImageId] = useState<string | null>(null);
  
  // States for cropper
  const [croppingImageId, setCroppingImageId] = useState<string | null>(null);
  const [croppingImageSrc, setCroppingImageSrc] = useState<string | null>(null);

  const handleUpdateWord = (id: string, newWord: string) => {
    onChange(questions.map((q) => (q.id === id ? { ...q, q: newWord } : q)));
  };

  const handleUpdateAnswer = (id: string, newAnswer: string) => {
    onChange(questions.map((q) => (q.id === id ? { ...q, a: newAnswer } : q)));
  };

  const processFile = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      // If the file is > 5MB, auto trigger cropper
      if (file.size > 5 * 1024 * 1024) {
        onChange(questions.map((q) => (q.id === id ? { ...q, originalImageUrl: base64 } : q)));
        setCroppingImageSrc(base64);
        setCroppingImageId(id);
      } else {
        // Check dimensions
        const img = new Image();
        img.onload = () => {
          if (img.width > 1200) {
            // Automatically prompt to crop if very wide
            onChange(questions.map((q) => (q.id === id ? { ...q, originalImageUrl: base64 } : q)));
            setCroppingImageSrc(base64);
            setCroppingImageId(id);
          } else {
            // Otherwise just save it
            onChange(questions.map((q) => (q.id === id ? { ...q, imageUrl: base64, originalImageUrl: base64 } : q)));
          }
        };
        img.src = base64;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const q = questions.find((item) => item.id === id);
    if (q?.imageUrl) {
      setPendingFile(file);
      setConfirmReplaceId(id);
    } else {
      processFile(id, file);
    }
    e.target.value = ''; // Reset input
  };

  const confirmReplace = () => {
    if (confirmReplaceId && pendingFile) {
      processFile(confirmReplaceId, pendingFile);
    }
    setConfirmReplaceId(null);
    setPendingFile(null);
  };

  const cancelReplace = () => {
    setConfirmReplaceId(null);
    setPendingFile(null);
  };

  const confirmDeleteImage = () => {
    if (confirmDeleteImageId) {
      onChange(questions.map((q) => {
        if (q.id === confirmDeleteImageId) {
          const { imageUrl, originalImageUrl, ...rest } = q;
          return rest;
        }
        return q;
      }));
    }
    setConfirmDeleteImageId(null);
  };

  const handleCropComplete = (croppedBase64: string) => {
    if (croppingImageId) {
      onChange(questions.map((q) => (q.id === croppingImageId ? { ...q, imageUrl: croppedBase64 } : q)));
    }
  };

  const handleDeleteWord = (id: string) => {
    onChange(questions.filter((q) => q.id !== id));
  };

  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const renderList = displayedQuestions || questions;

  return (
    <div className="space-y-3">
      {renderList.map((q, i) => {
        const actualIndex = questions.findIndex(orig => orig.id === q.id);
        const displayNum = actualIndex >= 0 ? actualIndex + 1 : i + 1;

        return (
          <div
            key={q.id}
            className={`flex flex-col md:flex-row md:items-start gap-3 p-3 rounded-lg border ${
              darkMode
                ? "bg-slate-900/50 border-slate-700"
                : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${
                  darkMode
                    ? "bg-slate-800 text-slate-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {displayNum}
              </div>
              {/* Only on mobile: Action buttons at the top right next to number */}
              <div className="md:hidden flex-1 flex justify-end gap-2">
                <div>
                  <input 
                    type="file" 
                    id={`file-upload-mobile-${q.id}`} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleFileInput(q.id, e)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className={`flex-shrink-0 cursor-pointer ${
                      darkMode ? "text-blue-400 hover:bg-blue-900/20" : "text-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <label htmlFor={`file-upload-mobile-${q.id}`}>
                      <ImagePlus className="w-4 h-4" />
                    </label>
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteWord(q.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2 w-full min-w-0">
              <Textarea
                value={q.q}
                onChange={(e) => handleUpdateWord(q.id, e.target.value)}
                onInput={handleAutoResize}
                placeholder="Enter word or phrase"
                rows={1}
                className={`w-full min-h-[44px] resize-y overflow-hidden ${
                  darkMode ? "bg-slate-800 border-slate-600 text-white" : ""
                }`}
              />
              <Textarea
                value={q.a || ""}
                onChange={(e) => handleUpdateAnswer(q.id, e.target.value)}
                onInput={handleAutoResize}
                placeholder="Enter answer / translation (optional)"
                rows={1}
                className={`w-full min-h-[44px] resize-y overflow-hidden ${
                  darkMode ? "bg-slate-800 border-slate-600 text-white" : ""
                }`}
              />
              {q.imageUrl && (
                <div className={`relative mt-2 w-full rounded-md p-2 border flex justify-center ${
                  darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-gray-200"
                }`}>
                  <img src={q.imageUrl} alt="Flashcard attachment" className="max-w-full max-h-[400px] object-contain rounded-md" />
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      onClick={() => setConfirmDeleteImageId(q.id)}
                      className={`rounded-full shadow-md w-8 h-8 ${darkMode ? "bg-slate-900/80 hover:bg-slate-800 text-red-400" : "bg-white/90 hover:bg-white text-red-500"}`}
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      onClick={() => {
                        setCroppingImageSrc(q.originalImageUrl || q.imageUrl!);
                        setCroppingImageId(q.id);
                      }}
                      className={`rounded-full shadow-md w-8 h-8 ${darkMode ? "bg-slate-900/80 hover:bg-slate-800 text-blue-400" : "bg-white/90 hover:bg-white text-blue-500"}`}
                      title="Adjust / Crop"
                    >
                      <Crop className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Desktop Action Buttons */}
            <div className="hidden md:flex flex-col gap-2">
              <div>
                <input 
                  type="file" 
                  id={`file-upload-desktop-${q.id}`} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleFileInput(q.id, e)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className={`flex-shrink-0 cursor-pointer ${
                    darkMode ? "text-blue-400 hover:bg-blue-900/20" : "text-blue-500 hover:bg-blue-50"
                  }`}
                  title={q.imageUrl ? "Replace Image" : "Upload Image"}
                >
                  <label htmlFor={`file-upload-desktop-${q.id}`}>
                    <ImagePlus className="w-4 h-4" />
                  </label>
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteWord(q.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                title="Delete Flashcard"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}

      {/* Confirmation Modals */}
      <AlertDialog open={!!confirmReplaceId} onOpenChange={(open) => !open && cancelReplace()}>
        <AlertDialogContent className={darkMode ? "bg-slate-900 border-slate-800 text-white" : ""}>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace Image?</AlertDialogTitle>
            <AlertDialogDescription className={darkMode ? "text-slate-400" : ""}>
              Are you sure you want to replace the current picture? The old image will be permanently overwritten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={darkMode ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-700" : ""}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmReplace} className="bg-blue-600 hover:bg-blue-700 text-white">
              Yes, Replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmDeleteImageId} onOpenChange={(open) => !open && setConfirmDeleteImageId(null)}>
        <AlertDialogContent className={darkMode ? "bg-slate-900 border-slate-800 text-white" : ""}>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Image?</AlertDialogTitle>
            <AlertDialogDescription className={darkMode ? "text-slate-400" : ""}>
              Are you sure you want to remove the image from this flashcard?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={darkMode ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-700" : ""}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteImage} className="bg-red-600 hover:bg-red-700 text-white">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cropper Modal */}
      {croppingImageSrc && (
        <ImageCropperModal
          isOpen={!!croppingImageId}
          onClose={() => {
            setCroppingImageId(null);
            setCroppingImageSrc(null);
          }}
          imageSrc={croppingImageSrc}
          onCropComplete={handleCropComplete}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
