"use client";

import { Hero } from "@/components/ui/hero";
import { Features } from "@/components/ui/feature";
import { LearningFlow } from "@/components/ui/learning-flow";
import { CTA } from "@/components/ui/cta";

interface HomeLandingProps {
  darkMode?: boolean;
}

export default function HomeLanding({ darkMode = false }: HomeLandingProps) {
  return (
    <main className="w-full overflow-hidden">
      <Hero darkMode={darkMode} />
      <Features darkMode={darkMode} />
      <LearningFlow darkMode={darkMode} />
      <CTA darkMode={darkMode} />
    </main>
  );
}
