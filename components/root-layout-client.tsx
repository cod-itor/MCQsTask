"use client"

import type React from "react"

import { useState } from "react"
import Navbar from "@/components/navbar"
import SubjectSidebar from "@/components/subject-sidebar"
import MobileSidebarDrawer from "@/components/mobile-sidebar-drawer"
import CreateSubjectModal from "@/components/create-subject-modal"
import { useSubjects } from "@/lib/subject-context"
import { usePathname } from "next/navigation"
import { useDarkMode } from "@/lib/dark-mode-context"

interface RootLayoutClientProps {
  children: React.ReactNode
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname()
  const { setActiveSubject } = useSubjects()
  const { darkMode, toggleDarkMode } = useDarkMode()
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreateSubject = () => {
    if (window.innerWidth < 768) {
      setMobileDrawerOpen(false)
    }
    setShowCreateModal(true)
  }

  const showSidebar = ["/mcqs", "/mcqs/practice", "/mcqs/exam", "/mcqs/input", "/mcqs/results"].some((route) =>
    pathname.startsWith(route),
  )
  const isFullBleedPage = pathname === "/" || pathname === "/home"

  const getCurrentPage = (): "home" | "mcqs" | "about" => {
    if (pathname.startsWith("/mcqs")) return "mcqs"
    if (pathname === "/about") return "about"
    return "home"
  }

  return (
    <>
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenMobileSidebar={() => setMobileDrawerOpen(true)}
        onCreateSubject={handleCreateSubject}
        currentPage={getCurrentPage()}
      />

      <main className={`min-h-screen ${darkMode ? "dark" : ""}`}>
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-950" : "bg-gray-50"}`}>
          <div
            className={`flex min-h-[calc(100vh-var(--nav-offset))] ${
              isFullBleedPage ? "" : "pt-[var(--nav-offset)]"
            }`}
          >
            {/* Desktop Sidebar */}
            {showSidebar && (
              <div className="hidden md:block w-64 border-r">
                <SubjectSidebar darkMode={darkMode} onCreateSubjectClick={handleCreateSubject} />
              </div>
            )}

            {/* Mobile Drawer */}
            <MobileSidebarDrawer
              isOpen={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
              darkMode={darkMode}
              onCreateSubject={handleCreateSubject}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-x-hidden">{children}</div>
          </div>
        </div>
      </main>

      {showCreateModal && <CreateSubjectModal onClose={() => setShowCreateModal(false)} darkMode={darkMode} />}
    </>
  )
}
