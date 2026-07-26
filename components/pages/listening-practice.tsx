"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSubjects } from "@/lib/subject-context";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Volume2, X, Check, Lightbulb, 
  RotateCcw, Maximize, Minimize, Keyboard,
  Play, Pause, Settings, RefreshCw, Shuffle 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence, useAnimation, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
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
  
  // Flashcard State
  const [queue, setQueue] = useState([...questions]);
  const [knownCount, setKnownCount] = useState(0);
  const [learningCount, setLearningCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTrackProgress, setIsTrackProgress] = useState(true);
  const [history, setHistory] = useState<{ card: any, action: "know" | "learning" }[]>([]);
  
  // Old Audio Settings State
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [repeatDelay, setRepeatDelay] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const x = useMotionValue(0);
  
  const knowOpacity = useTransform(x, [20, 100], [0, 1]);
  const learningOpacity = useTransform(x, [-20, -100], [0, 1]);
  
  const borderColor = useTransform(
    x,
    [-100, 0, 100],
    [
      "rgba(249, 115, 22, 1)", // Orange
      darkMode ? "rgba(51, 65, 85, 1)" : "rgba(243, 232, 255, 1)", // Normal
      "rgba(34, 197, 94, 1)" // Green
    ]
  );
  
  const boxShadow = useTransform(
    x,
    [-100, 0, 100],
    [
      "0 0 40px rgba(249, 115, 22, 0.4)",
      darkMode ? "0 25px 50px -12px rgba(15, 23, 42, 0.5)" : "0 25px 50px -12px rgba(126, 34, 206, 0.05)",
      "0 0 40px rgba(34, 197, 94, 0.4)"
    ]
  );

  const currentCard = queue[0];

  // Shuffle effect
  useEffect(() => {
    if (isShuffled) {
      setQueue([...questions].sort(() => Math.random() - 0.5));
    } else {
      setQueue([...questions]);
    }
    setKnownCount(0);
    setLearningCount(0);
    setHistory([]);
  }, [isShuffled, questions]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!("speechSynthesis" in window)) {
      if (onEnd) setTimeout(onEnd, 100);
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const hasKorean = /[\u3131-\uD79D]/ugi.test(text);
    utterance.lang = hasKorean ? "ko-KR" : "en-US";
    
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

  const handleManualSpeak = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    if (currentCard) {
      speak(currentCard.q);
    }
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  // Auto-speak loop
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    let isActive = true;

    const playLoop = () => {
      if (!isActive || !isPlaying || !autoSpeak || !currentCard) return;
      
      speak(currentCard.q, () => {
        if (!isActive || !isPlaying || !autoSpeak) return;
        timerRef.current = setTimeout(() => {
          if (!isActive || !isPlaying || !autoSpeak) return;
          playLoop();
        }, repeatDelay * 1000);
      });
    };

    if (isPlaying && autoSpeak && currentCard) {
      playLoop();
    } else {
      window.speechSynthesis.cancel();
    }

    return () => {
      isActive = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      window.speechSynthesis.cancel();
    };
  }, [isPlaying, autoSpeak, currentCard, repeatDelay, speak]);

  const handleGrade = async (action: "know" | "learning") => {
    if (!currentCard || queue.length === 0) return;
    
    // Stop playing when moving to next
    window.speechSynthesis.cancel();

    // Animate out
    await controls.start({
      x: action === "know" ? 500 : -500,
      opacity: 0,
      rotate: action === "know" ? 20 : -20,
      transition: { duration: 0.3 }
    });

    // Update state
    if (isTrackProgress) {
      if (action === "know") {
        setKnownCount(prev => prev + 1);
      } else {
        setLearningCount(prev => prev + 1);
      }
    }

    setHistory(prev => [...prev, { card: currentCard, action }]);
    
    if (action === "learning" && isTrackProgress) {
      setQueue(prev => {
        const newQueue = [...prev];
        newQueue.shift();
        newQueue.push(currentCard);
        return newQueue;
      });
    } else {
      setQueue(prev => prev.slice(1));
    }

    setIsFlipped(false);
    setShowHint(false);
    controls.set({ x: 0, opacity: 1, rotate: 0 });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    window.speechSynthesis.cancel();
    const lastAction = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    
    if (isTrackProgress) {
      if (lastAction.action === "know") {
        setKnownCount(prev => Math.max(0, prev - 1));
      } else {
        setLearningCount(prev => Math.max(0, prev - 1));
        setQueue(prev => {
          const newQueue = [...prev];
          newQueue.pop();
          return newQueue;
        });
      }
    }
    
    setQueue(prev => [lastAction.card, ...prev]);
    setIsFlipped(false);
    setShowHint(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (queue.length === 0) return;
      
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === "ArrowLeft") {
        handleGrade("learning");
      } else if (e.code === "ArrowRight") {
        handleGrade("know");
      } else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [queue, isFlipped, isTrackProgress, history]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleGrade("know");
    } else if (info.offset.x < -threshold) {
      handleGrade("learning");
    } else {
      controls.start({ x: 0, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className={`min-h-screen pt-20 transition-colors duration-300 ${darkMode ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="container mx-auto px-4 max-w-4xl py-8">
          <Button onClick={onBack} variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Flashcard Practice Data</h2>
            <p className="text-gray-500 mb-6">Please load a Listening JSON file first.</p>
            <Button onClick={onBack}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  // Progress logic
  const originalLength = questions.length;
  // Progress is based on known cards. Wait, if we shuffle or reset, we should track how many are known vs total.
  // We can just calculate percentage based on (knownCount + (originalLength - queue.length - knownCount))
  // A simpler way is: (total answered) / total * 100
  const answeredCount = originalLength - queue.length;
  // Wait, if learningCount increases, queue length doesn't change! 
  // Let's use (knownCount + learningCount) as the total actions, but it could exceed originalLength.
  // Actually, standard progress is `(originalLength - queue.length + knownCount) / (originalLength) `? No.
  // Let's just say progress = knownCount / originalLength * 100
  const progressPercentage = (knownCount / originalLength) * 100;

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-[100] flex flex-col transition-colors duration-300 overflow-y-auto ${darkMode ? "bg-slate-900" : "bg-gray-50"} ${isFullscreen ? "p-0" : "pt-4 md:pt-8"}`}
    >


      {/* Main Content Area */}
      <div className="flex-1 container mx-auto px-4 max-w-5xl py-6 flex flex-col relative h-full">
        
        {/* Settings Bar & Back Button */}
        <div className="flex items-center justify-between mb-6">
          {!isFullscreen ? (
            <Button onClick={onBack} variant="ghost" className={darkMode ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          ) : <div />}
          
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
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className={darkMode ? "text-slate-400" : "text-gray-500"}>
              Remaining: {queue.length} card{queue.length !== 1 ? 's' : ''}
            </span>
            <span className={darkMode ? "text-blue-400" : "text-blue-600"}>{Math.round(progressPercentage)}% Known</span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-gray-200"}`}>
            <div 
              className="h-full bg-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex justify-end items-center gap-2 w-full max-w-3xl mx-auto mb-2">
          <Button variant="ghost" size="icon" onClick={handleUndo} disabled={history.length === 0} title="Undo (Ctrl+Z)" className={darkMode ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}>
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        {/* Score Counters (Quizlet style) */}
        <div className="flex justify-between items-center w-full max-w-3xl mx-auto mb-4 px-2">
          {/* Still learning (Left) */}
          <motion.div 
            key={`learning-${learningCount}`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-3 font-bold text-lg"
          >
            <div className={`flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-full border-2 ${darkMode ? "border-orange-500 text-orange-400" : "border-orange-500 text-orange-600"}`}>
              {learningCount}
            </div>
            <span className={darkMode ? "text-orange-400" : "text-orange-600"}>Still learning</span>
          </motion.div>

          {/* Known (Right) */}
          <motion.div 
            key={`known-${knownCount}`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-3 font-bold text-lg"
          >
            <span className={darkMode ? "text-emerald-400" : "text-emerald-600"}>Know</span>
            <div className={`flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-full border-2 ${darkMode ? "border-emerald-500 text-emerald-400" : "border-emerald-500 text-emerald-600"}`}>
              {knownCount}
            </div>
          </motion.div>
        </div>

        {/* 3D Flashcard Container */}
        <div className="flex-1 flex flex-col items-center justify-center relative perspective-1000 mb-8 w-full min-h-[400px]">
          <AnimatePresence mode="wait">
            {queue.length > 0 ? (
              <motion.div
                key={currentCard?.q || "empty"}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={handleDragEnd}
                animate={controls}
                className="w-full max-w-3xl h-[400px] sm:h-[450px] md:h-[500px] relative cursor-pointer group"
                onClick={() => !isFlipped && setIsFlipped(true)}
                style={{ x, transformStyle: "preserve-3d" }}
              >
                {/* Flipping wrapper */}
                <motion.div
                  className="w-full h-full relative"
                  initial={false}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  
                  {/* FRONT FACE (Merged UI) */}
                  <motion.div 
                    className={`absolute inset-0 backface-hidden rounded-3xl p-6 md:p-10 flex flex-col border-2 ${
                      darkMode ? "bg-slate-800" : "bg-white"
                    }`}
                    style={{ backfaceVisibility: "hidden", borderColor, boxShadow }}
                  >
                    {/* Drag Overlays */}
                    <motion.div 
                      className={`absolute inset-0 z-50 flex items-center justify-center rounded-3xl pointer-events-none ${darkMode ? "bg-slate-800" : "bg-white"}`}
                      style={{ opacity: knowOpacity }}
                    >
                      <span className="text-6xl md:text-8xl font-black text-emerald-500 drop-shadow-md tracking-tighter">Know</span>
                    </motion.div>
                    <motion.div 
                      className={`absolute inset-0 z-50 flex items-center justify-center rounded-3xl pointer-events-none ${darkMode ? "bg-slate-800" : "bg-white"}`}
                      style={{ opacity: learningOpacity }}
                    >
                      <span className="text-5xl md:text-7xl font-black text-orange-500 drop-shadow-md tracking-tighter text-center leading-tight">Still<br/>learning</span>
                    </motion.div>
                    <div className="flex justify-between items-start mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setShowHint(!showHint); }}
                        className={darkMode ? "text-yellow-500 hover:bg-yellow-500/10" : "text-yellow-600 hover:bg-yellow-50"}
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Hint
                      </Button>
                    </div>

                    <div className="flex-1 flex flex-col items-center text-center overflow-y-auto mb-6 px-2">
                      <div className="my-auto w-full py-4">
                        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold break-words w-full text-center ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {currentCard?.q}
                        </h1>
                        
                        {showHint && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-6 mx-auto p-4 rounded-xl text-sm max-w-sm shrink-0 ${darkMode ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-600"}`}
                          >
                            {currentCard?.a ? `Hint: ${currentCard.a.substring(0, Math.max(3, Math.floor(currentCard.a.length / 3)))}...` : "Hint: Try listening to the audio again slowly, or focus on the main verb."}
                          </motion.div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-6 mt-auto">
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
                      <div className={`mt-6 text-sm flex items-center justify-center gap-2 ${darkMode ? "text-purple-400" : "text-purple-600"} animate-pulse`}>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Auto-repeating every {repeatDelay}s
                      </div>
                    )}
                    
                  </motion.div>

                  {/* BACK FACE */}
                  <motion.div 
                    className={`absolute inset-0 backface-hidden rounded-3xl p-8 flex flex-col border-2 ${
                      darkMode ? "bg-slate-800" : "bg-white"
                    }`}
                    style={{ 
                      backfaceVisibility: "hidden", 
                      transform: "rotateY(180deg)",
                      borderColor, 
                      boxShadow 
                    }}
                    onClick={() => setIsFlipped(false)}
                  >
                    {/* Drag Overlays */}
                    <motion.div 
                      className={`absolute inset-0 z-50 flex items-center justify-center rounded-3xl pointer-events-none ${darkMode ? "bg-slate-800" : "bg-white"}`}
                      style={{ opacity: knowOpacity }}
                    >
                      <span className="text-6xl md:text-8xl font-black text-emerald-500 drop-shadow-md tracking-tighter">Know</span>
                    </motion.div>
                    <motion.div 
                      className={`absolute inset-0 z-50 flex items-center justify-center rounded-3xl pointer-events-none ${darkMode ? "bg-slate-800" : "bg-white"}`}
                      style={{ opacity: learningOpacity }}
                    >
                      <span className="text-5xl md:text-7xl font-black text-orange-500 drop-shadow-md tracking-tighter text-center leading-tight">Still<br/>learning</span>
                    </motion.div>
                    <div className="text-center opacity-50 text-sm mb-4">Answer</div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <p className={`text-xl font-medium ${currentCard?.a ? (darkMode ? "text-white" : "text-gray-900") : `italic ${darkMode ? "text-slate-400" : "text-gray-500"}`}`}>
                        {currentCard?.a || "No answer provided"}
                      </p>
                    </div>
                    <div className="mt-auto text-center text-sm font-medium opacity-50 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                      <span className="flex items-center gap-1">Swipe <ArrowLeft className="w-3 h-3"/> for Still Learning</span>
                      <span className="flex items-center gap-1">Swipe <ArrowLeft className="w-3 h-3 rotate-180"/> for Know</span>
                    </div>
                  </motion.div>

                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`w-full max-w-lg p-12 rounded-3xl text-center shadow-2xl border flex flex-col items-center ${
                  darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
                }`}
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h2 className={`text-3xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Session Complete!</h2>
                <p className={`mb-8 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>You've successfully reviewed all cards in this set.</p>
                <Button 
                  onClick={() => {
                    setQueue([...questions]);
                    setKnownCount(0);
                    setLearningCount(0);
                    setHistory([]);
                  }} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-xl"
                >
                  Review Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-3 w-full justify-center">
              <Button
                variant="outline"
                size="lg"
                disabled={queue.length === 0}
                onClick={() => handleGrade("learning")}
                className={`flex-1 max-w-[200px] h-16 rounded-2xl text-lg font-bold border-2 transition-all ${
                  darkMode ? "border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500" : "border-orange-200 text-orange-600 hover:bg-orange-50"
                }`}
              >
                <X className="w-6 h-6 mr-2" /> Still learning
              </Button>
              
              <Button
                size="lg"
                disabled={queue.length === 0}
                onClick={() => handleGrade("know")}
                className={`flex-1 max-w-[200px] h-16 rounded-2xl text-lg font-bold transition-all bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20`}
              >
                <Check className="w-6 h-6 mr-2" /> Know
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-6 mt-8">
             <div className="flex items-center gap-2">
                <Switch 
                  id="track-progress" 
                  checked={isTrackProgress}
                  onCheckedChange={setIsTrackProgress}
                />
                <label htmlFor="track-progress" className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  Track progress
                </label>
             </div>
             <div className={`text-xs flex items-center gap-2 opacity-50 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
               <Keyboard className="w-4 h-4" /> Use ← and → keys
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
