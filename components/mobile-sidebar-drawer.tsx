"use client";

import { useEffect, useState } from "react";
import SubjectSidebar from "./subject-sidebar";

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onCreateSubject?: () => void;
}

export default function MobileSidebarDrawer({
  isOpen,
  onClose,
  darkMode,
  onCreateSubject,
}: MobileSidebarDrawerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check if modal is open by looking for the modal element in DOM
    const checkModal = () => {
      const modalElement = document.querySelector('[role="dialog"]');
      setIsModalOpen(!!modalElement);
    };

    // Check immediately
    checkModal();

    // Set up an observer to watch for modal changes
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Don't close drawer if modal is open
    if (isModalOpen) {
      return;
    }
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed left-0 top-[var(--nav-offset)] h-[calc(100vh-var(--nav-offset))] w-64 z-50 transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SubjectSidebar
          isOpen={isOpen}
          onClose={onClose}
          darkMode={darkMode}
          onCreateSubjectClick={onCreateSubject}
        />
      </div>
    </>
  );
}
