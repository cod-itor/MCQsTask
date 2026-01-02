"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
} from "framer-motion";
import { useEffect, useRef } from "react";

export default function AboutMe() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll();
  const intensity = useTransform(scrollYProgress, [0, 1], [1, 1.6]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const bgX = useTransform(mouseX, [0, window.innerWidth], [-60, 60]);
  const bgY = useTransform(mouseY, [0, window.innerHeight], [-60, 60]);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* NOISE */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay" />

      {/* SPOTLIGHT */}
      <motion.div
        className="pointer-events-none absolute w-[500px] h-[500px] rounded-full bg-orange-500/20 blur-[160px]"
        style={{ x: bgX, y: bgY, scale: intensity }}
      />

      {/* FLOATING GLOWS */}
      <FloatingGlow className="bg-purple-600/30 -top-40 -left-40" />
      <FloatingGlow className="bg-pink-600/30 top-1/2 -right-40" />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center max-w-5xl"
        >
          <motion.h1
            whileHover={{ letterSpacing: "0.04em" }}
            className="text-6xl md:text-8xl font-extrabold mb-8"
          >
            I’m{" "}
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Dita Rector
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-14"
          >
            Designing intelligent systems that feel alive, human, and
            inevitable.
          </motion.p>

          <div className="flex justify-center gap-8">
            <MagneticButton text="Let’s Connect" />
            <MagneticButton text="My Vision" outlined />
          </div>
        </motion.div>
      </section>

      {/* STORY */}
      <section className="py-36 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -120 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-5xl font-bold mb-6">Why I Build</h2>
            <p className="text-gray-300 mb-4">
              Technology is leverage. I build systems that magnify ideas and
              collapse complexity into elegance.
            </p>
            <p className="text-gray-400">
              Every interaction should feel intentional — like it belongs.
            </p>
          </motion.div>

          <TiltCard />
        </div>
      </section>

      {/* TECH */}
      <section className="py-36 px-6">
        <h2 className="text-5xl font-bold text-center mb-24">
          Technology I Live In
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            "Next.js",
            "Spring Boot",
            "JAVA",
            "Python",
            "AI Systems",
            "AWS",
            "UX Engineering",
            "High-Performance Apps",
          ].map((tech, i) => (
            <motion.div
              key={tech}
              whileHover={{ scale: 1.1, rotateX: 6, rotateY: -6 }}
              transition={{ type: "spring", stiffness: 250 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl
                         hover:shadow-2xl hover:shadow-orange-500/30"
            >
              <p className="font-semibold text-center">{tech}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-40 text-center">
        <motion.h3
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-5xl font-extrabold mb-8"
        >
          Let’s Build Something Legendary
        </motion.h3>

        <MagneticButton text="Start the Journey" />
      </section>
    </div>
  );
}

/* FLOATING GLOW */
function FloatingGlow({ className }: { className: string }) {
  return (
    <motion.div
      animate={{ y: [0, 60, 0], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute w-[600px] h-[600px] rounded-full blur-[180px] ${className}`}
    />
  );
}

/* MAGNETIC BUTTON */
function MagneticButton({ text, outlined }: any) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(0, { stiffness: 300, damping: 20 });
  const y = useSpring(0, { stiffness: 300, damping: 20 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={(e) => {
        const rect = ref.current!.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x, y }}
      className={`px-12 py-5 rounded-2xl font-semibold relative overflow-hidden
        ${
          outlined
            ? "border border-white/30 hover:bg-white/10"
            : "bg-orange-600 hover:bg-orange-700"
        }`}
    >
      {text}
    </motion.button>
  );
}

/* ADVANCED TILT */
function TiltCard() {
  return (
    <motion.div
      whileHover={{ rotateX: 12, rotateY: -12, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="p-12 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
    >
      <h3 className="text-2xl font-bold mb-4">What Drives Me</h3>
      <ul className="space-y-3 text-gray-300">
        <li>🚀 Designing the future</li>
        <li>🌍 Connecting minds</li>
        <li>🧠 Intelligent systems</li>
        <li>⚡ Turning vision into reality</li>
      </ul>
    </motion.div>
  );
}
