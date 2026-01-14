"use client"

import { useState } from "react"
import { useSubjects } from "@/lib/subject-context"
import type { Subject } from "@/lib/types"

interface SubjectItemProps {
  subject: Subject
  isActive: boolean
  onClick: () => void
  darkMode: boolean
}

export default function SubjectItem({ subject, isActive, onClick, darkMode }: SubjectItemProps) {
  const { toggleFavorite, renameSubject, deleteSubject } = useSubjects()
  const [showMenu, setShowMenu] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(subject.name)

  const handleRename = () => {
    if (newName.trim() && newName !== subject.name) {
      renameSubject(subject.id, newName.trim())
    }
    setIsRenaming(false)
  }

  return (
    <div
      className={`relative group px-3 py-2 rounded-lg cursor-pointer transition-all ${
        isActive
          ? darkMode
            ? "bg-blue-900 text-blue-100"
            : "bg-blue-100 text-blue-900"
          : darkMode
            ? "hover:bg-slate-700 text-slate-300"
            : "hover:bg-gray-100 text-gray-700"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg">📁</span>
          {isRenaming ? (
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename()
                if (e.key === "Escape") setIsRenaming(false)
              }}
              onClick={(e) => e.stopPropagation()}
              className={`flex-1 px-2 py-1 rounded text-sm ${
                darkMode ? "bg-slate-700 text-white" : "bg-white text-gray-900 border border-gray-300"
              }`}
            />
          ) : (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{subject.name}</p>
              <p className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{subject.mcqCount} MCQs</p>
            </div>
          )}
        </div>

        {/* Menu Button */}
        <div
          className="opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
        >
          <button className={`p-1 rounded ${darkMode ? "hover:bg-slate-600" : "hover:bg-gray-200"}`}>⋯</button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <div
          className={`absolute right-0 mt-1 w-40 rounded-lg shadow-lg z-50 ${darkMode ? "bg-slate-700" : "bg-white border border-gray-200"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(subject.id)
              setShowMenu(false)
            }}
            className={`w-full text-left px-4 py-2 text-sm rounded-t-lg ${
              darkMode ? "hover:bg-slate-600 text-slate-100" : "hover:bg-gray-100 text-gray-900"
            }`}
          >
            {subject.isFavorite ? "⭐ Unfavorite" : "☆ Favorite"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsRenaming(true)
              setShowMenu(false)
            }}
            className={`w-full text-left px-4 py-2 text-sm ${
              darkMode ? "hover:bg-slate-600 text-slate-100" : "hover:bg-gray-100 text-gray-900"
            }`}
          >
            ✏️ Rename
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Delete "${subject.name}" and all its MCQs?`)) {
                deleteSubject(subject.id)
              }
              setShowMenu(false)
            }}
            className={`w-full text-left px-4 py-2 text-sm rounded-b-lg text-red-600 ${
              darkMode ? "hover:bg-slate-600" : "hover:bg-gray-100"
            }`}
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  )
}
