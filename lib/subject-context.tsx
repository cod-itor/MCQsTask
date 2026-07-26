"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { Subject, MCQ, ReadingPassage, MCQSet, ReadingSet, ListeningSet, ListeningQuestion } from "./types";
import { 
  getSubjects as fetchDbSubjects, 
  createSubject as createDbSubject,
  deleteSubject as deleteDbSubject,
  renameSubject as renameDbSubject,
  toggleFavoriteSubject as toggleDbFavoriteSubject,
  savePracticeSet,
  updatePracticeSet,
  deletePracticeSet
} from "./actions/db";
import { toast } from "sonner";

interface SubjectContextType {
  subjects: Subject[];
  activeSubjectId: string | null;
  activeMcqSetId: string | null;
  activeReadingSetId: string | null;
  activeListeningSetId: string | null;
  mcqSets: Record<string, MCQSet[]>;
  readingSets: Record<string, ReadingSet[]>;
  listeningSets: Record<string, ListeningSet[]>;
  isLoading: boolean;
  
  setActiveSubject: (id: string | null) => void;
  setActiveMcqSet: (id: string | null) => void;
  setActiveReadingSet: (id: string | null) => void;
  setActiveListeningSet: (id: string | null) => void;
  
  createSubject: (name: string) => Promise<string>;
  renameSubject: (id: string, newName: string) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  
  createMcqSet: (subjectId: string, name: string, initialMcqs?: MCQ[]) => Promise<string>;
  updateMcqSet: (subjectId: string, setId: string, mcqs: MCQ[]) => Promise<void>;
  deleteMcqSet: (subjectId: string, setId: string) => Promise<void>;
  getMcqSet: (subjectId: string | null, setId: string | null) => MCQSet | null;
  
  createReadingSet: (subjectId: string, name: string, initialPassages?: ReadingPassage[]) => Promise<string>;
  updateReadingSet: (subjectId: string, setId: string, passages: ReadingPassage[]) => Promise<void>;
  deleteReadingSet: (subjectId: string, setId: string) => Promise<void>;
  getReadingSet: (subjectId: string | null, setId: string | null) => ReadingSet | null;

  createListeningSet: (subjectId: string, name: string, initialQuestions?: ListeningQuestion[]) => Promise<string>;
  updateListeningSet: (subjectId: string, setId: string, questions: ListeningQuestion[]) => Promise<void>;
  deleteListeningSet: (subjectId: string, setId: string) => Promise<void>;
  getListeningSet: (subjectId: string | null, setId: string | null) => ListeningSet | null;

  getMcqsForSubject: (subjectId: string | null) => MCQ[];
  getReadingPassagesForSubject: (subjectId: string | null) => ReadingPassage[];
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

function processDbSubjects(initialDbSubjects: any[]) {
  const newSubjects: Subject[] = [];
  const newMcqSets: Record<string, MCQSet[]> = {};
  const newReadingSets: Record<string, ReadingSet[]> = {};
  const newListeningSets: Record<string, ListeningSet[]> = {};

  initialDbSubjects.forEach(s => {
    let mcqCount = 0;
    newMcqSets[s.id] = [];
    newReadingSets[s.id] = [];
    newListeningSets[s.id] = [];

    if (s.practiceSets) {
      s.practiceSets.forEach((ps: any) => {
        if (ps.type === 'mcq') {
          const mcqs = (ps.content as any) || [];
          mcqCount += mcqs.length;
          newMcqSets[s.id].push({
            id: ps.id,
            subjectId: s.id,
            name: ps.title,
            createdAt: new Date(ps.createdAt).getTime(),
            mcqs
          });
        } else if (ps.type === 'reading') {
          newReadingSets[s.id].push({
            id: ps.id,
            subjectId: s.id,
            name: ps.title,
            createdAt: new Date(ps.createdAt).getTime(),
            passages: (ps.content as any) || []
          });
        } else if (ps.type === 'listening') {
          newListeningSets[s.id].push({
            id: ps.id,
            subjectId: s.id,
            name: ps.title,
            createdAt: new Date(ps.createdAt).getTime(),
            questions: (ps.content as any) || []
          });
        }
      });
    }

    newSubjects.push({
      id: s.id,
      name: s.name,
      isFavorite: s.isFavorite ?? false,
      createdAt: new Date(s.createdAt).getTime(),
      mcqCount
    });
  });

  return { newSubjects, newMcqSets, newReadingSets, newListeningSets };
}

export function SubjectProvider({ 
  children,
  initialDbSubjects = []
}: { 
  children: React.ReactNode
  initialDbSubjects?: any[]
}) {
  const initialData = processDbSubjects(initialDbSubjects);

  const [subjects, setSubjects] = useState<Subject[]>(initialData.newSubjects);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeMcqSetId, setActiveMcqSetId] = useState<string | null>(null);
  const [activeReadingSetId, setActiveReadingSetId] = useState<string | null>(null);
  const [activeListeningSetId, setActiveListeningSetId] = useState<string | null>(null);
  
  const [mcqSets, setMcqSets] = useState<Record<string, MCQSet[]>>(initialData.newMcqSets);
  const [readingSets, setReadingSets] = useState<Record<string, ReadingSet[]>>(initialData.newReadingSets);
  const [listeningSets, setListeningSets] = useState<Record<string, ListeningSet[]>>(initialData.newListeningSets);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state from server initialDbSubjects if it changes
  useEffect(() => {
    try {
      const data = processDbSubjects(initialDbSubjects);
      setSubjects(data.newSubjects);
      setMcqSets(data.newMcqSets);
      setReadingSets(data.newReadingSets);
      setListeningSets(data.newListeningSets);
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync subjects from database");
    }
  }, [initialDbSubjects]);

  const updateSubjectMcqCount = (subjectId: string, currentMcqSets: Record<string, MCQSet[]>) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== subjectId) return s;
      const sets = currentMcqSets[subjectId] || [];
      const totalCount = sets.reduce((sum, set) => sum + (set.mcqs?.length || 0), 0);
      return { ...s, mcqCount: totalCount };
    }));
  };

  const createSubject = async (name: string) => {
    const dbSub = await createDbSubject(name);
    const newSubject: Subject = {
      id: dbSub.id,
      name: dbSub.name,
      isFavorite: false,
      createdAt: new Date(dbSub.createdAt).getTime(),
      mcqCount: 0,
    };
    setSubjects(prev => [...prev, newSubject]);
    setMcqSets(prev => ({ ...prev, [dbSub.id]: [] }));
    setReadingSets(prev => ({ ...prev, [dbSub.id]: [] }));
    setListeningSets(prev => ({ ...prev, [dbSub.id]: [] }));
    return dbSub.id;
  };

  const renameSubject = async (id: string, newName: string) => {
    await renameDbSubject(id, newName);
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, name: newName } : s)));
  };

  const deleteSubject = async (id: string) => {
    await deleteDbSubject(id);
    setSubjects(subjects.filter((s) => s.id !== id));
    
    const newMcqs = { ...mcqSets };
    delete newMcqs[id];
    setMcqSets(newMcqs);
    
    const newRP = { ...readingSets };
    delete newRP[id];
    setReadingSets(newRP);
    
    const newLS = { ...listeningSets };
    delete newLS[id];
    setListeningSets(newLS);
    
    if (activeSubjectId === id) setActiveSubjectId(null);
  };

  const toggleFavorite = async (id: string) => {
    const subject = subjects.find(s => s.id === id);
    if (!subject) return;
    
    await toggleDbFavoriteSubject(id, !subject.isFavorite);
    setSubjects(subjects.map((s) => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
  };

  const createMcqSet = async (subjectId: string, name: string, initialMcqs: MCQ[] = []) => {
    const dbSet = await savePracticeSet(subjectId, name, 'mcq', initialMcqs);
    const newSet: MCQSet = {
      id: dbSet.id,
      subjectId,
      name,
      createdAt: new Date(dbSet.createdAt).getTime(),
      mcqs: initialMcqs
    };
    
    setMcqSets(prev => ({
      ...prev,
      [subjectId]: [...(prev[subjectId] || []), newSet]
    }));
    return dbSet.id;
  };

  const updateMcqSet = async (subjectId: string, setId: string, mcqs: MCQ[]) => {
    const set = mcqSets[subjectId]?.find(s => s.id === setId);
    if (!set) return;
    
    await updatePracticeSet(setId, set.name, mcqs);
    const updated = {
      ...mcqSets,
      [subjectId]: (mcqSets[subjectId] || []).map(s => 
        s.id === setId ? { ...s, mcqs } : s
      )
    };
    setMcqSets(updated);
    updateSubjectMcqCount(subjectId, updated);
  };

  const deleteMcqSet = async (subjectId: string, setId: string) => {
    await deletePracticeSet(setId);
    const updated = {
      ...mcqSets,
      [subjectId]: (mcqSets[subjectId] || []).filter(set => set.id !== setId)
    };
    setMcqSets(updated);
    updateSubjectMcqCount(subjectId, updated);
    if (activeMcqSetId === setId) setActiveMcqSetId(null);
  };

  const getMcqSet = (subjectId: string | null, setId: string | null) => {
    if (!subjectId || !setId) return null;
    return (mcqSets[subjectId] || []).find(s => s.id === setId) || null;
  };

  const createReadingSet = async (subjectId: string, name: string, initialPassages: ReadingPassage[] = []) => {
    const dbSet = await savePracticeSet(subjectId, name, 'reading', initialPassages);
    const newSet: ReadingSet = {
      id: dbSet.id,
      subjectId,
      name,
      createdAt: new Date(dbSet.createdAt).getTime(),
      passages: initialPassages
    };
    setReadingSets(prev => ({
      ...prev,
      [subjectId]: [...(prev[subjectId] || []), newSet]
    }));
    return dbSet.id;
  };

  const updateReadingSet = async (subjectId: string, setId: string, passages: ReadingPassage[]) => {
    const set = readingSets[subjectId]?.find(s => s.id === setId);
    if (!set) return;
    
    await updatePracticeSet(setId, set.name, passages);
    setReadingSets(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || []).map(s => 
        s.id === setId ? { ...s, passages } : s
      )
    }));
  };

  const deleteReadingSet = async (subjectId: string, setId: string) => {
    await deletePracticeSet(setId);
    setReadingSets(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || []).filter(set => set.id !== setId)
    }));
    if (activeReadingSetId === setId) setActiveReadingSetId(null);
  };

  const getReadingSet = (subjectId: string | null, setId: string | null) => {
    if (!subjectId || !setId) return null;
    return (readingSets[subjectId] || []).find(s => s.id === setId) || null;
  };

  const createListeningSet = async (subjectId: string, name: string, initialQuestions: ListeningQuestion[] = []) => {
    const dbSet = await savePracticeSet(subjectId, name, 'listening', initialQuestions);
    const newSet: ListeningSet = {
      id: dbSet.id,
      subjectId,
      name,
      createdAt: new Date(dbSet.createdAt).getTime(),
      questions: initialQuestions
    };
    setListeningSets(prev => ({
      ...prev,
      [subjectId]: [...(prev[subjectId] || []), newSet]
    }));
    return dbSet.id;
  };

  const updateListeningSet = async (subjectId: string, setId: string, questions: ListeningQuestion[]) => {
    const set = listeningSets[subjectId]?.find(s => s.id === setId);
    if (!set) return;
    
    await updatePracticeSet(setId, set.name, questions);
    setListeningSets(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || []).map(s => 
        s.id === setId ? { ...s, questions } : s
      )
    }));
  };

  const deleteListeningSet = async (subjectId: string, setId: string) => {
    await deletePracticeSet(setId);
    setListeningSets(prev => ({
      ...prev,
      [subjectId]: (prev[subjectId] || []).filter(set => set.id !== setId)
    }));
    if (activeListeningSetId === setId) setActiveListeningSetId(null);
  };

  const getListeningSet = (subjectId: string | null, setId: string | null) => {
    if (!subjectId || !setId) return null;
    return (listeningSets[subjectId] || []).find(s => s.id === setId) || null;
  };

  const getMcqsForSubject = (subjectId: string | null) => {
    if (!subjectId) return [];
    return (mcqSets[subjectId] || []).flatMap(set => set.mcqs);
  };

  const getReadingPassagesForSubject = (subjectId: string | null) => {
    if (!subjectId) return [];
    return (readingSets[subjectId] || []).flatMap(set => set.passages);
  };

  return (
    <SubjectContext.Provider
      value={{
        subjects,
        activeSubjectId,
        activeMcqSetId,
        activeReadingSetId,
        activeListeningSetId,
        mcqSets,
        readingSets,
        listeningSets,
        isLoading,
        setActiveSubject: setActiveSubjectId,
        setActiveMcqSet: setActiveMcqSetId,
        setActiveReadingSet: setActiveReadingSetId,
        setActiveListeningSet: setActiveListeningSetId,
        createSubject,
        renameSubject,
        deleteSubject,
        toggleFavorite,
        createMcqSet,
        updateMcqSet,
        deleteMcqSet,
        getMcqSet,
        createReadingSet,
        updateReadingSet,
        deleteReadingSet,
        getReadingSet,
        createListeningSet,
        updateListeningSet,
        deleteListeningSet,
        getListeningSet,
        getMcqsForSubject,
        getReadingPassagesForSubject
      }}
    >
      {children}
    </SubjectContext.Provider>
  );
}

export function useSubjects() {
  const context = useContext(SubjectContext);
  if (!context) {
    throw new Error("useSubjects must be used within SubjectProvider");
  }
  return context;
}
