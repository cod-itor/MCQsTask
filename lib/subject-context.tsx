"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { Subject, MCQ, ReadingPassage, MCQSet, ReadingSet } from "./types";

interface SubjectContextType {
  subjects: Subject[];
  activeSubjectId: string | null;
  activeMcqSetId: string | null;
  activeReadingSetId: string | null;
  mcqSets: Record<string, MCQSet[]>;
  readingSets: Record<string, ReadingSet[]>;
  
  setActiveSubject: (id: string | null) => void;
  setActiveMcqSet: (id: string | null) => void;
  setActiveReadingSet: (id: string | null) => void;
  
  createSubject: (name: string) => string;
  renameSubject: (id: string, newName: string) => void;
  deleteSubject: (id: string) => void;
  toggleFavorite: (id: string) => void;
  
  createMcqSet: (subjectId: string, name: string) => string;
  updateMcqSet: (subjectId: string, setId: string, mcqs: MCQ[]) => void;
  deleteMcqSet: (subjectId: string, setId: string) => void;
  getMcqSet: (subjectId: string | null, setId: string | null) => MCQSet | null;
  
  createReadingSet: (subjectId: string, name: string) => string;
  updateReadingSet: (subjectId: string, setId: string, passages: ReadingPassage[]) => void;
  deleteReadingSet: (subjectId: string, setId: string) => void;
  getReadingSet: (subjectId: string | null, setId: string | null) => ReadingSet | null;

  // Legacy for compatibility if needed elsewhere
  getMcqsForSubject: (subjectId: string | null) => MCQ[];
  getReadingPassagesForSubject: (subjectId: string | null) => ReadingPassage[];
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

const SUBJECT_STORAGE_KEY = "mcq_subjects";
const MCQS_STORAGE_KEY = "mcq_data";
const ACTIVE_SUBJECT_KEY = "active_subject";
const READING_PASSAGES_STORAGE_KEY = "mcq_reading_passages";
const ACTIVE_MCQ_SET_KEY = "active_mcq_set";
const ACTIVE_READING_SET_KEY = "active_reading_set";

export function SubjectProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeMcqSetId, setActiveMcqSetId] = useState<string | null>(null);
  const [activeReadingSetId, setActiveReadingSetId] = useState<string | null>(null);
  
  const [mcqSets, setMcqSets] = useState<Record<string, MCQSet[]>>({});
  const [readingSets, setReadingSets] = useState<Record<string, ReadingSet[]>>({});

  useEffect(() => {
    const savedSubjects = localStorage.getItem(SUBJECT_STORAGE_KEY);
    const savedMcqs = localStorage.getItem(MCQS_STORAGE_KEY);
    const savedReadingPassages = localStorage.getItem(READING_PASSAGES_STORAGE_KEY);
    const savedActiveSubject = localStorage.getItem(ACTIVE_SUBJECT_KEY);
    const savedActiveMcqSet = localStorage.getItem(ACTIVE_MCQ_SET_KEY);
    const savedActiveReadingSet = localStorage.getItem(ACTIVE_READING_SET_KEY);

    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
    
    if (savedMcqs) {
      const parsed = JSON.parse(savedMcqs);
      const newMcqSets: Record<string, MCQSet[]> = {};
      let migrated = false;
      for (const [subjectId, data] of Object.entries(parsed)) {
        if (Array.isArray(data) && data.length > 0 && !('mcqs' in data[0])) {
          newMcqSets[subjectId] = [{
            id: `mcqset-${Date.now()}-${Math.random()}`,
            subjectId,
            name: "Default MCQ Set",
            createdAt: Date.now(),
            mcqs: data as unknown as MCQ[]
          }];
          migrated = true;
        } else {
          newMcqSets[subjectId] = data as MCQSet[];
        }
      }
      setMcqSets(migrated ? newMcqSets : parsed);
    }
    
    if (savedReadingPassages) {
      const parsed = JSON.parse(savedReadingPassages);
      const newReadingSets: Record<string, ReadingSet[]> = {};
      let migrated = false;
      for (const [subjectId, data] of Object.entries(parsed)) {
        if (Array.isArray(data) && data.length > 0 && !('passages' in data[0])) {
          newReadingSets[subjectId] = [{
            id: `readingset-${Date.now()}-${Math.random()}`,
            subjectId,
            name: "Default Reading Set",
            createdAt: Date.now(),
            passages: data as unknown as ReadingPassage[]
          }];
          migrated = true;
        } else {
          newReadingSets[subjectId] = data as ReadingSet[];
        }
      }
      setReadingSets(migrated ? newReadingSets : parsed);
    }
    
    if (savedActiveSubject) setActiveSubjectId(savedActiveSubject);
    if (savedActiveMcqSet) setActiveMcqSetId(savedActiveMcqSet);
    if (savedActiveReadingSet) setActiveReadingSetId(savedActiveReadingSet);
  }, []);

  useEffect(() => {
    localStorage.setItem(SUBJECT_STORAGE_KEY, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(MCQS_STORAGE_KEY, JSON.stringify(mcqSets));
  }, [mcqSets]);

  useEffect(() => {
    localStorage.setItem(READING_PASSAGES_STORAGE_KEY, JSON.stringify(readingSets));
  }, [readingSets]);

  useEffect(() => {
    if (activeSubjectId) localStorage.setItem(ACTIVE_SUBJECT_KEY, activeSubjectId);
    else localStorage.removeItem(ACTIVE_SUBJECT_KEY);
  }, [activeSubjectId]);

  useEffect(() => {
    if (activeMcqSetId) localStorage.setItem(ACTIVE_MCQ_SET_KEY, activeMcqSetId);
    else localStorage.removeItem(ACTIVE_MCQ_SET_KEY);
  }, [activeMcqSetId]);

  useEffect(() => {
    if (activeReadingSetId) localStorage.setItem(ACTIVE_READING_SET_KEY, activeReadingSetId);
    else localStorage.removeItem(ACTIVE_READING_SET_KEY);
  }, [activeReadingSetId]);

  const updateSubjectMcqCount = (subjectId: string, currentMcqSets: Record<string, MCQSet[]>) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== subjectId) return s;
      const sets = currentMcqSets[subjectId] || [];
      const totalCount = sets.reduce((sum, set) => sum + set.mcqs.length, 0);
      return { ...s, mcqCount: totalCount };
    }));
  };

  const createSubject = (name: string) => {
    const newSubject: Subject = {
      id: `subject-${Date.now()}`,
      name,
      isFavorite: false,
      createdAt: Date.now(),
      mcqCount: 0,
    };
    setSubjects([...subjects, newSubject]);
    setMcqSets({ ...mcqSets, [newSubject.id]: [] });
    setReadingSets({ ...readingSets, [newSubject.id]: [] });
    return newSubject.id;
  };

  const renameSubject = (id: string, newName: string) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, name: newName } : s)));
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
    
    const newMcqs = { ...mcqSets };
    delete newMcqs[id];
    setMcqSets(newMcqs);
    
    const newRP = { ...readingSets };
    delete newRP[id];
    setReadingSets(newRP);
    
    if (activeSubjectId === id) setActiveSubjectId(null);
  };

  const toggleFavorite = (id: string) => {
    setSubjects(subjects.map((s) => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
  };

  const createMcqSet = (subjectId: string, name: string) => {
    const newSetId = `mcqset-${Date.now()}`;
    const newSet: MCQSet = {
      id: newSetId,
      subjectId,
      name,
      createdAt: Date.now(),
      mcqs: []
    };
    
    const updated = {
      ...mcqSets,
      [subjectId]: [...(mcqSets[subjectId] || []), newSet]
    };
    setMcqSets(updated);
    return newSetId;
  };

  const updateMcqSet = (subjectId: string, setId: string, mcqs: MCQ[]) => {
    const updated = {
      ...mcqSets,
      [subjectId]: (mcqSets[subjectId] || []).map(set => 
        set.id === setId ? { ...set, mcqs } : set
      )
    };
    setMcqSets(updated);
    updateSubjectMcqCount(subjectId, updated);
  };

  const deleteMcqSet = (subjectId: string, setId: string) => {
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

  const createReadingSet = (subjectId: string, name: string) => {
    const newSetId = `readingset-${Date.now()}`;
    const newSet: ReadingSet = {
      id: newSetId,
      subjectId,
      name,
      createdAt: Date.now(),
      passages: []
    };
    
    setReadingSets({
      ...readingSets,
      [subjectId]: [...(readingSets[subjectId] || []), newSet]
    });
    return newSetId;
  };

  const updateReadingSet = (subjectId: string, setId: string, passages: ReadingPassage[]) => {
    setReadingSets({
      ...readingSets,
      [subjectId]: (readingSets[subjectId] || []).map(set => 
        set.id === setId ? { ...set, passages } : set
      )
    });
  };

  const deleteReadingSet = (subjectId: string, setId: string) => {
    setReadingSets({
      ...readingSets,
      [subjectId]: (readingSets[subjectId] || []).filter(set => set.id !== setId)
    });
    if (activeReadingSetId === setId) setActiveReadingSetId(null);
  };

  const getReadingSet = (subjectId: string | null, setId: string | null) => {
    if (!subjectId || !setId) return null;
    return (readingSets[subjectId] || []).find(s => s.id === setId) || null;
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
        mcqSets,
        readingSets,
        setActiveSubject: setActiveSubjectId,
        setActiveMcqSet: setActiveMcqSetId,
        setActiveReadingSet: setActiveReadingSetId,
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
