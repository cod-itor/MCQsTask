"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
  useAnimation,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function AboutMe() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  const { scrollYProgress } = useScroll();
  const intensity = useTransform(scrollYProgress, [0, 1], [1, 1.6]);

  useEffect(() => {
    // Handle SSR and window dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const bgX = useTransform(mouseX, [0, dimensions.width], [-60, 60]);
  const bgY = useTransform(mouseY, [0, dimensions.height], [-60, 60]);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* NOISE */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay" />

      {/* ANIMATED GRID */}
      <AnimatedGrid />

      {/* SPOTLIGHT */}
      <motion.div
        className="pointer-events-none absolute w-[500px] h-[500px] rounded-full bg-orange-500/20 blur-[160px]"
        style={{ x: bgX, y: bgY, scale: intensity }}
      />

      {/* FLOATING GLOWS */}
      <FloatingGlow className="bg-purple-600/30 -top-40 -left-40" delay={0} />
      <FloatingGlow className="bg-pink-600/30 top-1/2 -right-40" delay={2} />
      <FloatingGlow className="bg-blue-600/30 bottom-20 left-1/3" delay={4} />

      {/* FLOATING SYMBOLS */}
      <FloatingSymbol symbol="💰" top="20%" left="10%" delay={0} />
      <FloatingSymbol symbol="🚀" top="40%" right="15%" delay={1} />
      <FloatingSymbol symbol="⚡" bottom="30%" left="20%" delay={2} />
      <FloatingSymbol symbol="💎" top="60%" right="25%" delay={3} />

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
            I'm{" "}
            <motion.span
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent bg-[length:200%_auto]"
            >
              Dita Rector
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-6"
          >
            Designing intelligent systems that feel alive, human, and
            inevitable.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-orange-400 mb-14 font-semibold"
          >
            Building wealth through innovation, one line of code at a time
          </motion.p>

          <div className="flex flex-wrap justify-center gap-8">
            <MagneticButton text="Let's Connect" />
            <MagneticButton text="My Vision" outlined />
          </div>
        </motion.div>
      </section>

      {/* MILLIONAIRE MINDSET */}
      <section className="py-36 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-bold text-center mb-20"
          >
            The{" "}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              Millionaire
            </span>{" "}
            Mindset
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            <MindsetCard
              icon="🎯"
              title="Vision"
              description="See opportunities where others see obstacles. Every problem is a million-dollar solution waiting to be built."
              delay={0}
            />
            <MindsetCard
              icon="⚡"
              title="Execution"
              description="Ideas are worthless without execution. I turn concepts into reality with precision and speed."
              delay={0.2}
            />
            <MindsetCard
              icon="📈"
              title="Scale"
              description="Think big, build bigger. Systems that grow exponentially and create lasting value."
              delay={0.4}
            />
          </div>
        </div>
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
            <p className="text-gray-300 mb-4 text-lg">
              Technology is leverage. I build systems that magnify ideas and
              collapse complexity into elegance.
            </p>
            <p className="text-gray-400 mb-6">
              Every interaction should feel intentional — like it belongs.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/20"
            >
              <p className="text-orange-400 font-semibold mb-2">
                💡 My Philosophy
              </p>
              <p className="text-gray-300">
                "Wealth isn't just money—it's freedom, impact, and the ability
                to turn vision into reality."
              </p>
            </motion.div>
          </motion.div>

          <TiltCard />
        </div>
      </section>

      {/* WEALTH METRICS */}
      <section className="py-36 px-6 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-center mb-20"
          >
            Building My Empire
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-8">
            <CounterCard end={10} suffix="+" label="Projects Launched" />
            <CounterCard end={50} suffix="K+" label="Lines of Code" />
            <CounterCard end={100} suffix="%" label="Commitment" />
            <CounterCard end={1} suffix="M" label="Target (Soon)" prefix="$" />
          </div>
        </div>
      </section>

      {/* TECH */}
      <section className="py-36 px-6">
        <h2 className="text-5xl font-bold text-center mb-24">
          Technology I{" "}
          <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Master
          </span>
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { name: "Next.js", color: "from-gray-400 to-gray-600" },
            { name: "Spring Boot", color: "from-green-400 to-green-600" },
            { name: "JAVA", color: "from-red-400 to-red-600" },
            { name: "Python", color: "from-blue-400 to-blue-600" },
            { name: "AI Systems", color: "from-purple-400 to-purple-600" },
            { name: "AWS", color: "from-orange-400 to-orange-600" },
            { name: "UX Engineering", color: "from-pink-400 to-pink-600" },
            {
              name: "High-Performance",
              color: "from-yellow-400 to-yellow-600",
            },
          ].map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1, rotateX: 6, rotateY: -6 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 250 }}
              className="group p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl
                         hover:shadow-2xl hover:shadow-orange-500/30 cursor-pointer relative overflow-hidden"
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity`}
              />
              <p className="font-semibold text-center relative z-10">
                {tech.name}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-40 text-center relative">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.h3 className="text-5xl md:text-6xl font-extrabold mb-6">
            Let's Build Something
          </motion.h3>
          <motion.h3
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl md:text-6xl font-extrabold mb-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent"
          >
            Legendary 🚀
          </motion.h3>

          <p className="text-xl text-gray-400 mb-12">
            Ready to turn vision into millions? Let's connect.
          </p>

          <MagneticButton text="Start the Journey" />
        </motion.div>
      </section>
    </div>
  );
}

/* ANIMATED GRID */
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full">
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <motion.path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
              animate={{ opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

/* FLOATING SYMBOL */
function FloatingSymbol({ symbol, top, left, right, bottom, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0],
        scale: [0.5, 1, 0.5],
        y: [0, -100, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      className="absolute text-4xl pointer-events-none"
      style={{ top, left, right, bottom }}
    >
      {symbol}
    </motion.div>
  );
}

/* MINDSET CARD */
function MindsetCard({ icon, title, description, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, scale: 1.02 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 
                 backdrop-blur-xl hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/20
                 transition-all duration-300"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-5xl mb-4"
      >
        {icon}
      </motion.div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}

/* COUNTER CARD */
function CounterCard({ end, suffix, label, prefix }: any) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;
          const increment = end / (duration / 16);

          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, hasAnimated]);

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.05, y: -5 }}
      className="p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 
                 border border-orange-500/20 text-center"
    >
      <motion.div
        className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-orange-400 to-pink-400 
                   bg-clip-text text-transparent"
      >
        {prefix}
        {count}
        {suffix}
      </motion.div>
      <p className="text-gray-400 text-sm">{label}</p>
    </motion.div>
  );
}

/* FLOATING GLOW */
function FloatingGlow({ className, delay }: any) {
  return (
    <motion.div
      animate={{
        y: [0, 60, 0],
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
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
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{ x, y }}
      className={`px-12 py-5 rounded-2xl font-semibold relative overflow-hidden
        transition-all duration-300
        ${
          outlined
            ? "border-2 border-white/30 hover:bg-white/10 hover:border-orange-500/50"
            : "bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 shadow-lg shadow-orange-500/30"
        }`}
    >
      <span className="relative z-10">{text}</span>
      {!outlined && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 hover:opacity-20"
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}

/* ADVANCED TILT */
function TiltCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ rotateX: 12, rotateY: -12, scale: 1.05 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 200 }}
      className="p-12 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl 
                 border border-white/10 shadow-2xl hover:border-orange-500/30 relative overflow-hidden"
    >
      <motion.div
        className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <h3 className="text-2xl font-bold mb-4 relative z-10">What Drives Me</h3>
      <ul className="space-y-3 text-gray-300 relative z-10">
        <motion.li whileHover={{ x: 10 }} className="flex items-center gap-3">
          <span className="text-2xl">🚀</span> Designing the future
        </motion.li>
        <motion.li whileHover={{ x: 10 }} className="flex items-center gap-3">
          <span className="text-2xl">🌍</span> Connecting minds
        </motion.li>
        <motion.li whileHover={{ x: 10 }} className="flex items-center gap-3">
          <span className="text-2xl">🧠</span> Intelligent systems
        </motion.li>
        <motion.li whileHover={{ x: 10 }} className="flex items-center gap-3">
          <span className="text-2xl">⚡</span> Turning vision into reality
        </motion.li>
        <motion.li whileHover={{ x: 10 }} className="flex items-center gap-3">
          <span className="text-2xl">💰</span> Building generational wealth
        </motion.li>
      </ul>
    </motion.div>
  );
}
