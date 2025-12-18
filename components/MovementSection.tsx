"use client";

import dynamic from "next/dynamic";

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
      { count: "6,015", sub: "AT HUNTINGTON BEACH" }
    ]
  },
  { date: "May 2025", title: "California", baptisms: [{ count: "7,752", sub: "AT HB, CA" }] },
  { date: "June 2025", title: "America", baptisms: [{ count: "27,858", sub: "ACROSS THE NATION" }] },
];

export default function MovementSection() {
  return (
    <section className="w-full bg-black text-white py-16 md:py-24 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">

        {/* ========== Header Area ========== */}
        <div className="flex flex-col items-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-[60px] font-bold uppercase tracking-tighter mb-6">
            The Movement
          </h2>
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">
              In 24 months we&apos;ve seen
            </p>
            <p className="text-xl md:text-2xl font-bold">1,600+ Churches United</p>
            <p className="text-xl md:text-2xl font-bold">50,790+ Baptisms</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              className="border border-white/30 rounded-full px-6 py-4 sm:py-3 text-sm sm:text-xs uppercase tracking-wider hover:bg-white hover:text-black hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Join the baptize network →
            </button>
            <button
              type="button"
              className="border border-white/30 rounded-full px-6 py-4 sm:py-3 text-sm sm:text-xs uppercase tracking-wider hover:bg-white hover:text-black hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Host at your church →
            </button>
          </div>
        </div>

        {/* ========== Desktop: Timeline + Globe ========== */}
        <div className="hidden md:block">
          <div className="flex items-center gap-8">
            {/* Timeline area - takes remaining space */}
            <div className="flex-1 relative" style={{ height: "280px" }}>
              {/* Timeline horizontal line - positioned at vertical center */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-gray-600">
                {/* Arrow at end */}
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-l-[10px] border-l-gray-600 border-b-[5px] border-b-transparent" />
              </div>

              {/* Timeline points - positioned AT the line (ticks extend down) */}
              <div className="absolute left-0 right-0 top-1/2 flex justify-between px-4">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="relative">
                    {/* ===== ANGLED LABEL (above line with generous spacing for rotation) ===== */}
                    <div
                      className="absolute bottom-8 left-0 origin-bottom-left"
                      style={{ transform: "rotate(-45deg)" }}
                    >
                      <div className="whitespace-nowrap">
                        <p className="text-[11px] text-gray-500 leading-tight">{event.date}</p>
                        <p className="text-base font-bold text-white leading-tight">{event.title}</p>
                        {event.sub && (
                          <p className="text-[9px] text-gray-500 uppercase tracking-wider leading-tight">{event.sub}</p>
                        )}
                      </div>
                    </div>

                    {/* ===== TICK MARK (centered on the horizontal line) ===== */}
                    <div className="w-[1px] h-5 bg-gray-600 -translate-y-1/2" />

                    {/* ===== BAPTISM COUNTS (below tick mark) ===== */}
                    {event.baptisms && (
                      <div className="absolute top-6 left-0 -translate-x-1/4 whitespace-nowrap">
                        {event.baptisms.map((baptism, bIndex) => (
                          <div key={bIndex} className={bIndex > 0 ? "mt-3" : ""}>
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
                  </div>
                ))}
              </div>
            </div>

            {/* ===== GLOBE GROUP (text + globe as tightly coupled unit) ===== */}
            <div className="flex-shrink-0 flex flex-col items-center" style={{ width: "340px" }}>
              {/* Label centered above globe */}
              <div className="text-center mb-2">
                <p className="text-[11px] text-gray-400 mb-0.5">What&apos;s Next?</p>
                <p className="text-2xl font-black uppercase tracking-tight text-white leading-none">
                  BAPTIZE
                </p>
                <p className="text-[11px] text-gray-400 uppercase tracking-[0.2em] mt-0.5">
                  ALL NATIONS
                </p>
              </div>
              {/* Globe - immediately follows text, both centered */}
              <CobeGlobe size={300} />
            </div>
          </div>
        </div>

        {/* ========== Mobile: Center-Aligned Vertical Timeline ========== */}
        <div className="md:hidden flex flex-col items-center">
          {/* Vertical Timeline - Center Aligned */}
          <div className="relative w-full max-w-sm">
            {/* Central vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-700 -translate-x-1/2">
              {/* Arrow at bottom */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[10px] border-t-gray-700" />
            </div>

            {/* Timeline events */}
            <div className="flex flex-col gap-6 py-4">
              {timelineEvents.map((event, index) => (
                <div key={index} className="relative flex items-start min-h-[40px]">
                  {/* Left side - Event info */}
                  <div className="flex-1 text-right pr-5">
                    <p className="text-[11px] text-gray-500 leading-tight">{event.date}</p>
                    <p className="text-base font-bold text-white leading-tight">{event.title}</p>
                    {event.sub && (
                      <p className="text-[10px] text-gray-500 uppercase leading-tight">{event.sub}</p>
                    )}
                  </div>

                  {/* Center - Horizontal tick mark */}
                  <div className="relative flex items-center justify-center pt-1" style={{ width: "20px" }}>
                    {/* Horizontal tick */}
                    <div className="w-3 h-[1px] bg-gray-700" />
                  </div>

                  {/* Right side - Baptism counts */}
                  <div className="flex-1 pl-5">
                    {event.baptisms && event.baptisms.map((baptism, bIndex) => (
                      <div key={bIndex} className={bIndex > 0 ? "mt-3" : ""}>
                        <p className="text-[13px] text-gray-400 leading-tight">
                          {baptism.count} Baptisms
                        </p>
                        {baptism.sub && (
                          <p className="text-[9px] text-gray-500 uppercase leading-tight">
                            {baptism.sub}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Globe - Centered below timeline */}
          <div className="flex flex-col items-center mt-10">
            <div className="text-center mb-0">
              <p className="text-[11px] text-gray-400 mb-0.5">What&apos;s Next?</p>
              <p className="text-xl font-black uppercase text-white leading-none">
                BAPTIZE ALL NATIONS
              </p>
            </div>
            <CobeGlobe size={260} />
          </div>
        </div>

      </div>
    </section>
  );
}
