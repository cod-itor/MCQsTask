"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSubjects } from "@/lib/subject-context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, Play, Pause, Settings, RefreshCw, Shuffle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ListeningPracticeProps {
  onBack: () => void;
  darkMode: boolean;
  onOpenMobileSidebar?: () => void;
}

export default function ListeningPractice({
  onBack,
  darkMode,
  onOpenMobileSidebar,
}: ListeningPracticeProps) {
  const { activeSubjectId, activeListeningSetId, getListeningSet } = useSubjects();
  const currentSet = getListeningSet(activeSubjectId, activeListeningSetId);
  
  const questions = currentSet?.questions || [];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [repeatDelay, setRepeatDelay] = useState(5); // in seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [displayQuestions, setDisplayQuestions] = useState([...questions]);
  
  useEffect(() => {
    if (isShuffled) {
      setDisplayQuestions([...questions].sort(() => Math.random() - 0.5));
    } else {
      setDisplayQuestions([...questions]);
    }
    setCurrentIndex(0);
  }, [isShuffled, questions]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentQuestion = displayQuestions[currentIndex];

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!("speechSynthesis" in window)) {
      if (onEnd) setTimeout(onEnd, 100);
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Auto-detect Korean language
    const hasKorean = /[\u3131-\uD79D]/ugi.test(text);
    utterance.lang = hasKorean ? "ko-KR" : "en-US";
    
    // Explicitly set the voice to match the language if possible
    const voices = window.speechSynthesis.getVoices();
    if (hasKorean) {
      const koreanVoice = voices.find(v => v.lang.startsWith('ko'));
      if (koreanVoice) utterance.voice = koreanVoice;
    } else {
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) utterance.voice = englishVoice;
    }
    
    utterance.rate = playbackSpeed;
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  }, [playbackSpeed]);

  const handleManualSpeak = () => {
    if (currentQuestion) {
      speak(currentQuestion.q);
    }
  };

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    let isActive = true;

    const playLoop = () => {
      if (!isActive || !isPlaying || !autoSpeak || !currentQuestion) return;
      
      speak(currentQuestion.q, () => {
        if (!isActive || !isPlaying || !autoSpeak) return;
        timerRef.current = setTimeout(() => {
          if (!isActive || !isPlaying || !autoSpeak) return;
          playLoop();
        }, repeatDelay * 1000);
      });
    };

    if (isPlaying && autoSpeak && currentQuestion) {
      playLoop();
    } else {
      window.speechSynthesis.cancel();
    }

    return () => {
      isActive = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      window.speechSynthesis.cancel();
    };
  }, [isPlaying, autoSpeak, currentQuestion, repeatDelay, speak]);

  // Auto-speak timer logic is fully contained above; removed redundant currentIndex useEffect.

  const handleNext = () => {
    if (currentIndex < displayQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className={`min-h-screen pt-20 transition-colors duration-300 ${darkMode ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="container mx-auto px-4 max-w-4xl py-8">
          <Button onClick={onBack} variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Listening Practice Data</h2>
            <p className="text-gray-500 mb-6">Please load a Listening JSON file first.</p>
            <Button onClick={onBack}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = ((currentIndex + 1) / displayQuestions.length) * 100;

  return (
    <div className={`min-h-screen pt-32 md:pt-20 transition-colors duration-300 ${darkMode ? "bg-slate-900" : "bg-gray-50"}`}>
      {/* Header */}
      <header className={`fixed top-0 w-full z-40 transition-colors duration-300 ${darkMode ? "bg-slate-900/90 border-slate-700" : "bg-white/90 border-gray-200"} backdrop-blur-md border-b h-16 flex items-center md:hidden`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={onOpenMobileSidebar} className={darkMode ? "text-slate-300" : "text-gray-600"}>
            <span className="text-xl">☰</span>
          </Button>
          <span className={`font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Listening Practice</span>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-5xl py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="ghost" className={darkMode ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShuffled(!isShuffled)}
              className={isShuffled ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800" : (darkMode ? "border-slate-700 bg-slate-800 text-slate-300" : "")}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              {isShuffled ? "Shuffled" : "Shuffle"}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={darkMode ? "border-slate-700 bg-slate-800 text-slate-300" : ""}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`w-56 p-2 ${darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : ""}`}>
                <div className="mb-2 px-2 pb-2 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Speed</span>
                    <span className="text-sm font-medium">{playbackSpeed.toFixed(1)}x</span>
                  </div>
                  <div className="px-1 py-2">
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none dark:bg-slate-700"
                    />
                  </div>
                </div>
                
                <div className="mb-2 px-2 py-2 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Auto Speak</span>
                    <Switch checked={autoSpeak} onCheckedChange={setAutoSpeak} />
                  </div>
                  {autoSpeak && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Delay (sec)</span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setRepeatDelay(Math.max(1, repeatDelay - 1))}>-</Button>
                        <span className="w-4 text-center">{repeatDelay}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setRepeatDelay(Math.min(20, repeatDelay + 1))}>+</Button>
                      </div>
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className={darkMode ? "text-slate-400" : "text-gray-500"}>Word {currentIndex + 1} of {displayQuestions.length}</span>
            <span className={darkMode ? "text-blue-400" : "text-blue-600"}>{Math.round(progressPercentage)}%</span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-gray-200"}`}>
            <div 
              className="h-full bg-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Main Card */}
        <Card className={`mb-8 border-2 w-full mx-auto ${darkMode ? "bg-slate-800 border-slate-700 shadow-xl" : "bg-white border-purple-100 shadow-xl shadow-purple-900/5"}`}>
          <CardContent className="p-6 md:p-12 flex flex-col items-center min-h-[400px]">
            
            <div className="flex-1 flex items-center justify-center w-full min-h-[200px]">
              <h1 className={`text-2xl sm:text-3xl md:text-5xl font-bold break-words w-full text-center ${darkMode ? "text-white" : "text-gray-900"}`}>
                {currentQuestion?.q}
              </h1>
            </div>

            <div className="flex items-center gap-6 mt-auto">
              <Button 
                onClick={handleManualSpeak}
                variant="outline"
                size="lg"
                className={`rounded-full w-16 h-16 ${darkMode ? "border-purple-500/30 text-purple-400 hover:bg-purple-500/20" : "border-purple-200 text-purple-600 hover:bg-purple-50"}`}
              >
                <Volume2 className="w-8 h-8" />
              </Button>
              
              {autoSpeak && (
                <Button
                  onClick={togglePlayPause}
                  className={`rounded-full w-20 h-20 shadow-lg ${isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-purple-600 hover:bg-purple-700"} text-white`}
                >
                  {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
                </Button>
              )}
            </div>
            
            {autoSpeak && isPlaying && (
              <div className={`mt-6 text-sm flex items-center gap-2 ${darkMode ? "text-purple-400" : "text-purple-600"} animate-pulse`}>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Auto-repeating every {repeatDelay}s
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center gap-4">
          <Button 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
            variant="outline"
            className={`flex-1 py-6 ${darkMode ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-white" : "bg-white hover:bg-gray-50"}`}
          >
            Previous
          </Button>
          <Button 
            onClick={currentIndex === displayQuestions.length - 1 ? onBack : handleNext} 
            className={`flex-1 py-6 ${currentIndex === displayQuestions.length - 1 ? (darkMode ? "bg-slate-600 hover:bg-slate-700 text-white" : "bg-gray-600 hover:bg-gray-700 text-white") : "bg-purple-600 hover:bg-purple-700 text-white"}`}
          >
            {currentIndex === displayQuestions.length - 1 ? "Choose different passage" : "Next"}
          </Button>
        </div>

      </div>
    </div>
  );
}
