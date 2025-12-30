"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Subject, MCQ } from "./types"

interface SubjectContextType {
  subjects: Subject[]
  activeSubjectId: string | null
  mcqs: Record<string, MCQ[]>
  setActiveSubject: (id: string | null) => void
  createSubject: (name: string) => void
  renameSubject: (id: string, newName: string) => void
  deleteSubject: (id: string) => void
  toggleFavorite: (id: string) => void
  addMcqsToSubject: (subjectId: string, mcqs: MCQ[]) => void
  getMcqsForSubject: (subjectId: string | null) => MCQ[]
  deleteMcqFromSubject: (subjectId: string, mcqId: string) => void
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined)

const SUBJECT_STORAGE_KEY = "mcq_subjects"
const MCQS_STORAGE_KEY = "mcq_data"
const ACTIVE_SUBJECT_KEY = "active_subject"

export function SubjectProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null)
  const [mcqs, setMcqs] = useState<Record<string, MCQ[]>>({})

  // Load from localStorage on mount
  useEffect(() => {
    const savedSubjects = localStorage.getItem(SUBJECT_STORAGE_KEY)
    const savedMcqs = localStorage.getItem(MCQS_STORAGE_KEY)
    const savedActiveSubject = localStorage.getItem(ACTIVE_SUBJECT_KEY)

    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects))
    }
    if (savedMcqs) {
      setMcqs(JSON.parse(savedMcqs))
    }
    if (savedActiveSubject) {
      setActiveSubjectId(savedActiveSubject)
    }
  }, [])

  // Save subjects to localStorage
  useEffect(() => {
    localStorage.setItem(SUBJECT_STORAGE_KEY, JSON.stringify(subjects))
  }, [subjects])

  // Save MCQs to localStorage
  useEffect(() => {
    localStorage.setItem(MCQS_STORAGE_KEY, JSON.stringify(mcqs))
  }, [mcqs])

  // Save active subject to localStorage
  useEffect(() => {
    if (activeSubjectId) {
      localStorage.setItem(ACTIVE_SUBJECT_KEY, activeSubjectId)
    }
  }, [activeSubjectId])

  const createSubject = (name: string) => {
    const newSubject: Subject = {
      id: `subject-${Date.now()}`,
      name,
      isFavorite: false,
      createdAt: Date.now(),
      mcqCount: 0,
    }
    setSubjects([...subjects, newSubject])
    setMcqs({ ...mcqs, [newSubject.id]: [] })
  }

  const renameSubject = (id: string, newName: string) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, name: newName } : s)))
  }

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id))
    const newMcqs = { ...mcqs }
    delete newMcqs[id]
    setMcqs(newMcqs)
    if (activeSubjectId === id) {
      setActiveSubjectId(null)
    }
  }

  const toggleFavorite = (id: string) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s)))
  }

  const addMcqsToSubject = (subjectId: string, newMcqs: MCQ[]) => {
    const existingMcqs = mcqs[subjectId] || []
    setMcqs({
      ...mcqs,
      [subjectId]: [...existingMcqs, ...newMcqs],
    })

    // Update MCQ count in subject
    setSubjects(
      subjects.map((s) =>
        s.id === subjectId ? { ...s, mcqCount: (mcqs[subjectId]?.length || 0) + newMcqs.length } : s,
      ),
    )
  }

  const getMcqsForSubject = (subjectId: string | null) => {
    if (!subjectId) return []
    return mcqs[subjectId] || []
  }

  const deleteMcqFromSubject = (subjectId: string, mcqId: string) => {
    setMcqs({
      ...mcqs,
      [subjectId]: mcqs[subjectId].filter((m) => m.id !== mcqId),
    })
    setSubjects(subjects.map((s) => (s.id === subjectId ? { ...s, mcqCount: (mcqs[subjectId]?.length || 0) - 1 } : s)))
  }

  return (
    <SubjectContext.Provider
      value={{
        subjects,
        activeSubjectId,
        mcqs,
        setActiveSubject: setActiveSubjectId,
        createSubject,
        renameSubject,
        deleteSubject,
        toggleFavorite,
        addMcqsToSubject,
        getMcqsForSubject,
        deleteMcqFromSubject,
      }}
    >
      {children}
    </SubjectContext.Provider>
  )
}

export function useSubjects() {
  const context = useContext(SubjectContext)
  if (!context) {
    throw new Error("useSubjects must be used within SubjectProvider")
  }
  return context
}
