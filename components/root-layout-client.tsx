"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import SubjectSidebar from "@/components/subject-sidebar"
import MobileSidebarDrawer from "@/components/mobile-sidebar-drawer"
import CreateSubjectModal from "@/components/create-subject-modal"
import { useSubjects } from "@/lib/subject-context"
import { usePathname } from "next/navigation"

interface RootLayoutClientProps {
  children: React.ReactNode
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname()
  const { setActiveSubject } = useSubjects()
  const [darkMode, setDarkMode] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("darkMode", String(newDarkMode))
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleCreateSubject = () => {
    if (window.innerWidth < 768) {
      setMobileDrawerOpen(true)
    }
    setTimeout(() => {
      if ((window as any).openCreateSubjectModal) {
        ;(window as any).openCreateSubjectModal()
      }
    }, 100)
  }

  const showSidebar = ["/mcqs", "/mcqs/practice", "/mcqs/exam", "/mcqs/input", "/mcqs/results"].some((route) =>
    pathname.startsWith(route),
  )

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
          <div className="flex" style={{ height: "calc(100vh - 80px)", marginTop: "80px" }}>
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
            />

            {/* Main Content */}
            <div className="flex-1 overflow-auto">{children}</div>
          </div>
        </div>
      </main>

      {showCreateModal && <CreateSubjectModal onClose={() => setShowCreateModal(false)} darkMode={darkMode} />}
    </>
  )
}
