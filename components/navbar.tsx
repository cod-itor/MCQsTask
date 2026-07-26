"use client";
import { Button } from "@/components/ui/button";
import { useSubjects } from "@/lib/subject-context";
import { Moon, Sun, Menu, Download, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import CreateSubjectModal from "./create-subject-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { logout } from "@/app/(Auth)/login/actions";

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenMobileSidebar?: () => void;
  onCreateSubject?: () => void;
  currentPage?: "home" | "mcqs" | "about";
  isLoggedIn?: boolean;
}

export default function Navbar({
  darkMode,
  onToggleDarkMode,
  onOpenMobileSidebar,
  onCreateSubject,
  currentPage = "home",
  isLoggedIn = false,
}: NavbarProps) {
  const { subjects } = useSubjects();
  const hasSubjects = subjects.length > 0;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setIsScrolledDown(false);
      return;
    }
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 50) {
      setIsScrolledDown(true);
    } else if (latest < previous) {
      setIsScrolledDown(false);
    }
  });

  const handleCreateClick = () => {
    if (onCreateSubject) {
      onCreateSubject();
    } else {
      setShowCreateModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const getNavButtonClass = (page: "home" | "mcqs" | "about") => {
    const isActive = currentPage === page;
    return `px-6 py-2.5 rounded-full text-sm font-medium transition-all ${isActive
        ? darkMode
          ? "bg-slate-800 text-white"
          : "bg-gray-100 text-gray-900"
        : darkMode
          ? "text-gray-400 hover:text-white hover:bg-slate-800/50"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`;
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? "bg-slate-900" : "bg-white"} shadow-sm transition-colors duration-300`}
      >
        <motion.div 
          initial={false}
          animate={{ 
            height: isScrolledDown ? 0 : 80,
            opacity: isScrolledDown ? 0 : 1,
            marginBottom: isScrolledDown ? -1 : 0 // prevent layout gap
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="px-4 md:px-6 flex items-center justify-between max-w-7xl mx-auto overflow-hidden"
        >
          {/* Left: App Name */}
          <div className="flex items-center gap-2">
            <Link
              href="/home"
              className={`font-bold text-xl ${darkMode ? "text-white" : "text-gray-900"
                } hover:opacity-80 transition-opacity`}
            >
              DITOR<sup className="text-sm text-gray-400">v2.2</sup>
            </Link>
          </div>

          {/* Center: Navigation Pills - Desktop */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-full ${darkMode ? "bg-slate-800/50" : "bg-gray-50"
              }`}
          >
            <Link
              href="/home"
              prefetch={true}
              className={getNavButtonClass("home")}
            >
              Home
            </Link>
            <Link
              href="/mcqs"
              prefetch={true}
              className={getNavButtonClass("mcqs")}
            >
              MCQs
            </Link>
            <Link
              href="/about"
              prefetch={true}
              className={getNavButtonClass("about")}
            >
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
              className={`rounded-full w-10 h-10 p-0 hidden md:flex items-center justify-center ${darkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
                }`}
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Auth Actions */}
            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLogoutModal(true)}
                className={`rounded-full w-10 h-10 p-0 flex items-center justify-center text-red-500 hover:text-red-600 ${darkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
                  }`}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className={`rounded-full ${darkMode ? "text-slate-300 hover:text-white" : "text-gray-600"}`}>
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Dark Mode Toggle - Mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDarkMode}
              className={`md:hidden rounded-full w-10 h-10 p-0 flex items-center justify-center ${darkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
                }`}
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Mobile Menu */}
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenMobileSidebar}
                className={`md:hidden rounded-full w-10 h-10 p-0 ${darkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
                  }`}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
          </div>
        </motion.div>

        {/* Mobile Navigation - Bottom Pills */}
        <div
          className={`md:hidden border-t ${darkMode ? "border-slate-800" : "border-gray-200"
            }`}
        >
          <div
            className={`flex items-center justify-center gap-2 px-4 py-3 ${darkMode ? "bg-slate-900" : "bg-white"
              }`}
          >
            <Link
              href="/home"
              prefetch={true}
              className={`flex-1 max-w-[120px] py-2 rounded-full text-sm font-medium transition-all text-center ${currentPage === "home"
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
              prefetch={true}
              className={`flex-1 max-w-[120px] py-2 rounded-full text-sm font-medium transition-all text-center ${currentPage === "mcqs"
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
              prefetch={true}
              className={`flex-1 max-w-[120px] py-2 rounded-full text-sm font-medium transition-all text-center ${currentPage === "about"
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

      {showCreateModal && (
        <CreateSubjectModal onClose={handleCloseModal} darkMode={darkMode} />
      )}

      <AlertDialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <AlertDialogContent className={darkMode ? "bg-slate-900 border-slate-800 text-white" : ""}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription className={darkMode ? "text-slate-400" : ""}>
              You will need to sign in again to access your subjects and MCQs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={darkMode ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-700" : ""}>
              Cancel
            </AlertDialogCancel>
            <form action={logout}>
              <AlertDialogAction type="submit" className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
                Log out
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
