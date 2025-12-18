"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

// Dynamically import CobeGlobe to avoid SSR issues
const CobeGlobe = dynamic(() => import("./CobeGlobe"), { ssr: false });

// Timeline event data - restructured for proper grouping
// May 2024 California has TWO baptism entries under ONE timeline point
interface BaptismEntry {
  count: string;
  sub?: string;
}

interface TimelineEvent {
  date: string;
  title: string;
  sub?: string;
  baptisms: BaptismEntry[] | null;
}

const timelineEvents: TimelineEvent[] = [
  { date: "May 2022", title: "Dream", baptisms: null },
  { date: "May 2023", title: "SoCal", baptisms: [{ count: "4,166" }] },
  {
    date: "May 2024",
    title: "California",
    baptisms: [
      { count: "6,201", sub: "ACROSS THE STATE" },
      { count: "6,015", sub: "AT HUNTINGTON BEACH" },
    ],
  },
  {
    date: "May 2025",
    title: "California",
    baptisms: [{ count: "7,752", sub: "AT HB, CA" }],
  },
  {
    date: "June 2025",
    title: "America",
    baptisms: [{ count: "27,858", sub: "ACROSS THE NATION" }],
  },
];

export default function MovementSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "center center"],
  });

  const scaleProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      ref={containerRef}
      className="w-full bg-black text-white py-10 md:py-14 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* ========== Header Area ========== */}
        <div className="flex flex-col items-center mb-4 md:mb-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[32px] md:text-[60px] font-bold uppercase tracking-tighter mb-3"
          >
            The Movement
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center mb-4"
          >
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mb-2">
              In 24 months we&apos;ve seen
            </p>
            <p className="text-[18px] md:text-2xl font-bold">
              1,600+ Churches United
            </p>
            <p className="text-[18px] md:text-2xl font-bold">
              50,790+ Baptisms
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              type="button"
              className="bg-gray-600 text-white rounded-full px-6 py-2 text-xs md:text-sm uppercase tracking-wider hover:bg-gray-500 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Join the baptize network →
            </button>
            <button
              type="button"
              className="border border-gray-500 text-white rounded-full px-6 py-2 text-xs md:text-sm uppercase tracking-wider hover:bg-gray-500 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Host at your church →
            </button>
          </motion.div>
        </div>

        {/* ========== Desktop: Timeline + Globe ========== */}
        <div className="hidden md:block">
          <div className="flex items-center gap-8">
            {/* Timeline area - takes remaining space */}
            <div className="flex-1 relative" style={{ height: "180px" }}>
              {/* Timeline horizontal line - positioned at vertical center */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-gray-800"></div>

              {/* Animated Progress Line */}
              <motion.div
                style={{ scaleX: scaleProgress }}
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-white origin-left z-10"
              />

              {/* Arrow at end (animated opacity) */}
              <motion.div
                style={{ opacity: scaleProgress }}
                className="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-l-[10px] border-l-white border-b-[5px] border-b-transparent z-10"
              />

              {/* Timeline points - positioned AT the line (ticks extend down) */}
              <div className="absolute left-0 right-0 top-1/2 flex justify-between px-4 z-20">
                {timelineEvents.map((event, index) => (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                  >
                    {/* ===== ANGLED LABEL (above line with generous spacing for rotation) ===== */}
                    <div
                      className="absolute bottom-8 left-0 origin-bottom-left"
                      style={{ transform: "rotate(-45deg)" }}
                    >
                      <div className="whitespace-nowrap">
                        <p className="text-[11px] text-gray-500 leading-tight">
                          {event.date}
                        </p>
                        <p className="text-base font-bold text-white leading-tight">
                          {event.title}
                        </p>
                        {event.sub && (
                          <p className="text-[9px] text-gray-500 uppercase tracking-wider leading-tight">
                            {event.sub}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ===== TICK MARK (centered on the horizontal line) ===== */}
                    <div className="w-[1px] h-5 bg-gray-500 -translate-y-1/2 transition-colors duration-500 group-hover:bg-white" />

                    {/* ===== BAPTISM COUNTS (below tick mark) ===== */}
                    {event.baptisms && (
                      <div className="absolute top-6 left-0 -translate-x-1/4 whitespace-nowrap">
                        {event.baptisms.map((baptism, bIndex) => (
                          <div
                            key={bIndex}
                            className={bIndex > 0 ? "mt-3" : ""}
                          >
                            <p className="text-[13px] text-gray-300 leading-tight">
                              {baptism.count} Baptisms
                            </p>
                            {baptism.sub && (
                              <p className="text-[9px] text-gray-500 uppercase tracking-wider leading-tight">
                                {baptism.sub}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ===== GLOBE GROUP (text + globe as tightly coupled unit) ===== */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex-shrink-0 flex flex-col items-center"
              style={{ width: "260px" }}
            >
              {/* Label centered above globe */}
              <div className="text-center mb-2">
                <p className="text-[11px] text-gray-400 mb-0.5">
                  What&apos;s Next?
                </p>
                <p className="text-2xl font-black uppercase tracking-tight text-white leading-none">
                  BAPTIZE
                </p>
                <p className="text-[11px] text-gray-400 uppercase tracking-[0.2em] mt-0.5">
                  ALL NATIONS
                </p>
              </div>
              {/* Globe - immediately follows text, both centered */}
              <CobeGlobe size={220} />
            </motion.div>
          </div>
        </div>

        {/* ========== Mobile: Center-Aligned Vertical Timeline ========== */}
        <div className="md:hidden flex flex-col items-center">
          {/* Vertical Timeline - Center Aligned */}
          <div className="relative w-full max-w-sm">
            {/* Central vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-800 -translate-x-1/2"></div>

            {/* Animated Progress Line Vertical */}
            <motion.div
              style={{ scaleY: scaleProgress }}
              className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white -translate-x-1/2 origin-top"
            />

            {/* Arrow at bottom */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[10px] border-t-white" />

            {/* Timeline events */}
            <div className="flex flex-col gap-4 py-4">
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  className="relative flex items-start min-h-[40px]"
                >
                  {/* Left side - Event info */}
                  <div className="flex-1 text-right pr-4">
                    <p className="text-[10px] text-gray-500 leading-tight">
                      {event.date}
                    </p>
                    <p className="text-sm font-bold text-white leading-tight">
                      {event.title}
                    </p>
                    {event.sub && (
                      <p className="text-[8px] text-gray-500 uppercase leading-tight">
                        {event.sub}
                      </p>
                    )}
                  </div>

                  {/* Center - Horizontal tick mark */}
                  <div
                    className="relative flex items-center justify-center pt-1"
                    style={{ width: "20px" }}
                  >
                    {/* Horizontal tick */}
                    <div className="w-2 h-[1px] bg-gray-500" />
                  </div>

                  {/* Right side - Baptism counts */}
                  <div className="flex-1 pl-4">
                    {event.baptisms &&
                      event.baptisms.map((baptism, bIndex) => (
                        <div key={bIndex} className={bIndex > 0 ? "mt-2" : ""}>
                          <p className="text-[11px] text-gray-400 leading-tight">
                            {baptism.count} Baptisms
                          </p>
                          {baptism.sub && (
                            <p className="text-[8px] text-gray-500 uppercase leading-tight">
                              {baptism.sub}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Globe - Centered below timeline */}
          <div className="flex flex-col items-center mt-8">
            <div className="text-center mb-0">
              <p className="text-[10px] text-gray-400 mb-0.5">
                What&apos;s Next?
              </p>
              <p className="text-lg font-black uppercase text-white leading-none">
                BAPTIZE ALL NATIONS
              </p>
            </div>
            <CobeGlobe size={180} />
          </div>
        </div>
      </div>
    </section>
  );
}
