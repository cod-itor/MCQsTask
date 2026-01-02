"use client"
import { Button } from "@/components/ui/button"
import { useSubjects } from "@/lib/subject-context"
import { Moon, Sun, Menu, Download } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import CreateSubjectModal from "./create-subject-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface NavbarProps {
  darkMode: boolean
  onToggleDarkMode: () => void
  onOpenMobileSidebar?: () => void
  onCreateSubject?: () => void
  currentPage?: "home" | "mcqs" | "about"
}

export default function Navbar({
  darkMode,
  onToggleDarkMode,
  onOpenMobileSidebar,
  onCreateSubject,
  currentPage = "home",
}: NavbarProps) {
  const { subjects } = useSubjects()
  const hasSubjects = subjects.length > 0
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreateClick = () => {
    if (onCreateSubject) {
      onCreateSubject()
    } else {
      setShowCreateModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const getNavButtonClass = (page: "home" | "mcqs" | "about") => {
    const isActive = currentPage === page
    return `px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
      isActive
        ? darkMode
          ? "bg-slate-800 text-white"
          : "bg-gray-100 text-gray-900"
        : darkMode
          ? "text-gray-400 hover:text-white hover:bg-slate-800/50"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }`
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? "bg-slate-900" : "bg-white"} shadow-sm`}>
        <div className="h-20 px-4 md:px-6 flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: App Name */}
          <Link
            href="/home"
            className={`font-bold text-xl ${
              darkMode ? "text-white" : "text-gray-900"
            } hover:opacity-80 transition-opacity`}
          >
            DITOR<sup className="text-sm text-gray-400">v2.1</sup>
          </Link>

          {/* Center: Navigation Pills - Desktop */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-full ${
              darkMode ? "bg-slate-800/50" : "bg-gray-50"
            }`}
          >
            <Link href="/home" className={getNavButtonClass("home")}>
              Home
            </Link>
            <Link href="/mcqs" className={getNavButtonClass("mcqs")}>
              MCQs
            </Link>
            <Link href="/about" className={getNavButtonClass("about")}>
              About Us
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle - Desktop */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDarkMode}
              className={`rounded-full w-10 h-10 p-0 hidden md:flex items-center justify-center ${
                darkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Dark Mode Toggle - Mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDarkMode}
              className={`md:hidden rounded-full w-10 h-10 p-0 flex items-center justify-center ${
                darkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Download/Subjects Button */}
            {hasSubjects ? (
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="rounded-full px-6 py-2.5 font-medium bg-blue-600 hover:bg-blue-700 text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Subjects
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleCreateClick}>+ New Subject</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                onClick={handleCreateClick}
                className="hidden md:flex rounded-full px-6 py-2.5 font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            )}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenMobileSidebar}
              className={`md:hidden rounded-full w-10 h-10 p-0 ${
                darkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
              }`}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Bottom Pills */}
        <div className={`md:hidden border-t ${darkMode ? "border-slate-800" : "border-gray-200"}`}>
          <div className={`flex items-center justify-center gap-2 px-4 py-3 ${darkMode ? "bg-slate-900" : "bg-white"}`}>
            <Link
              href="/home"
              className={`flex-1 max-w-[120px] py-2 rounded-full text-sm font-medium transition-all text-center ${
                currentPage === "home"
                  ? darkMode
                    ? "bg-slate-800 text-white"
                    : "bg-gray-100 text-gray-900"
                  : darkMode
                    ? "text-gray-400 hover:text-white hover:bg-slate-800/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Home
            </Link>
            <Link
              href="/mcqs"
              className={`flex-1 max-w-[120px] py-2 rounded-full text-sm font-medium transition-all text-center ${
                currentPage === "mcqs"
                  ? darkMode
                    ? "bg-slate-800 text-white"
                    : "bg-gray-100 text-gray-900"
                  : darkMode
                    ? "text-gray-400 hover:text-white hover:bg-slate-800/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              MCQs
            </Link>
            <Link
              href="/about"
              className={`flex-1 max-w-[120px] py-2 rounded-full text-sm font-medium transition-all text-center ${
                currentPage === "about"
                  ? darkMode
                    ? "bg-slate-800 text-white"
                    : "bg-gray-100 text-gray-900"
                  : darkMode
                    ? "text-gray-400 hover:text-white hover:bg-slate-800/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              About
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile-only spacer for bottom navigation */}
      <div className="h-16 md:hidden"></div>

      {showCreateModal && <CreateSubjectModal onClose={handleCloseModal} darkMode={darkMode} />}
    </>
  )
}
