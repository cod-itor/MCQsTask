"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EditMcqsWarningModalProps {
  isOpen: boolean;
  darkMode: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isExamActive: boolean;
}

export default function EditMcqsWarningModal({
  isOpen,
  darkMode,
  onConfirm,
  onCancel,
  isExamActive,
}: EditMcqsWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {isExamActive ? (
              <>
                <h3
                  className={`text-2xl font-bold ${
                    darkMode ? "text-red-400" : "text-red-600"
                  }`}
                >
                  Cannot Edit During Exam
                </h3>
                <p
                  className={
                    darkMode ? "text-slate-100 mb-6" : "text-gray-700 mb-6"
                  }
                >
                  Please finish or exit the exam before editing MCQs.
                </p>
                <Button
                  onClick={onCancel}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  OK
                </Button>
              </>
            ) : (
              <>
                <h3
                  className={`text-2xl font-bold ${
                    darkMode ? "text-orange-400" : "text-orange-600"
                  }`}
                >
                  Editing MCQs
                </h3>
                <p
                  className={
                    darkMode ? "text-slate-100 mb-6" : "text-gray-700 mb-6"
                  }
                >
                  This will reset your current practice progress. Are you sure
                  you want to continue?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className={`flex-1 ${
                      darkMode
                        ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                        : ""
                    }`}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={onConfirm}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
