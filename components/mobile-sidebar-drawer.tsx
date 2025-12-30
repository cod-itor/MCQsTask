"use client";

import SubjectSidebar from "./subject-sidebar";

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function MobileSidebarDrawer({
  isOpen,
  onClose,
  darkMode,
}: MobileSidebarDrawerProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SubjectSidebar isOpen={isOpen} onClose={onClose} darkMode={darkMode} />
      </div>
    </>
  );
}
