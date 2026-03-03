

"use client";

import React, { useRef } from "react";
import { Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Measure {
  _id: string;
  name: string;
  type: string;
  category: string;
  timing: "pre" | "post";
  startWeeks: number;
}

export interface Stakeholder {
  _id: string;
  name: string;
  measures: Measure[];
}

interface GridViewProps {
  stakeholders: Stakeholder[];
  kickOffDate?: string;
}

const getCategoryColor = (category: string) => {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("communication")) return "#B5CC2E";
  if (cat.includes("involvement")) return "#00253E";
  if (cat.includes("recognition")) return "#A91D54";
  return "#9CA3AF";
};

export default function GridView({ stakeholders }: GridViewProps) {
  // ✅ per stakeholder section ref
  const sectionRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const exportStakeholderPdf = async (
    stakeholderId: string,
    fileName: string,
  ) => {
    if (typeof window === "undefined") return;

    const element = sectionRefs.current.get(stakeholderId);
    if (!element) return;

    // wait for fonts (safe)
    const fonts = (document as unknown as { fonts?: { ready: Promise<void> } })
      .fonts;
    if (fonts?.ready) await fonts.ready;

    const { default: html2pdf } = await import("html2pdf.js");

    // ✅ Clone for PDF so we can safely modify layout (remove button / overflow)
    const clone = element.cloneNode(true) as HTMLDivElement;
    clone.style.background = "#ffffff";
    clone.style.padding = "16px";
    clone.style.margin = "0";
    clone.style.overflow = "visible";
    clone.style.maxWidth = "none";

    // ✅ Remove Export button from PDF only
    // We tag export wrapper with data-export-btn="true"
    const exportBtn = clone.querySelector('[data-export-btn="true"]');
    if (exportBtn) exportBtn.remove();

    // ✅ Ensure header stays left aligned (stakeholder button only)
    const header = clone.querySelector(
      '[data-header-row="true"]',
    ) as HTMLDivElement | null;
    if (header) {
      header.style.justifyContent = "flex-start";
      header.style.gap = "12px";
    }

    // ✅ Important: capture full scroll width (timeline might overflow on screen)
    const fullWidth =
      element.scrollWidth || element.getBoundingClientRect().width;
    clone.style.width = `${fullWidth}px`;

    // ✅ Hidden wrapper for rendering
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-100000px";
    wrapper.style.top = "0";
    wrapper.style.background = "#ffffff";
    wrapper.style.width = `${fullWidth}px`;
    wrapper.style.overflow = "visible";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    const opt = {
      margin: 6,
      filename: `${fileName}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: fullWidth,
        windowWidth: fullWidth,
        scrollX: 0,
        scrollY: 0,
      },
      // ✅ better for wide timeline
      jsPDF: { unit: "mm", format: "a3", orientation: "landscape" as const },
      pagebreak: { mode: ["css", "legacy"] as const },
    };

    try {
      await html2pdf().set(opt).from(clone).save();
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  return (
    <div className="space-y-10 pb-10 w-full max-w-full mx-auto font-sans">
      {stakeholders?.map((sh) => {
        const measures = sh.measures || [];

        const maxWeeksPre =
          measures
            .filter((m) => m.timing === "pre")
            .reduce((mx, m) => Math.max(mx, m.startWeeks || 0), 0) || 0;

        const maxWeeksPost =
          measures
            .filter((m) => m.timing === "post")
            .reduce((mx, m) => Math.max(mx, m.startWeeks || 0), 0) || 0;

        const timelineStartBuffer = Math.max(1, maxWeeksPre + 2);
        const timelineEndBuffer = Math.max(1, maxWeeksPost + 2);
        const totalWeeks = timelineStartBuffer + timelineEndBuffer;

        return (
          <div
            key={sh._id}
            ref={(el) => {
              sectionRefs.current.set(sh._id, el);
            }}
            className="mb-12 block"
          >
            {/* ✅ header row: left stakeholder button + right export button (UI only) */}
            <div
              data-header-row="true"
              className="flex items-center justify-between mb-6"
            >
              {/* left button (must appear in PDF) */}
              <div className="flex items-center">
                <div className="h-[44px] px-6 bg-white border border-x-[4px] border-[#B5CC2E] rounded-[8px] flex items-center gap-3 shadow-sm">
                  <User className="w-5 h-5 text-[#B5CC2E]" />
                  <span className="text-[16px] font-bold text-[#00253E]">
                    {sh.name}
                  </span>
                </div>
              </div>

              {/* right export button (should NOT appear in PDF) */}
              <div data-export-btn="true" className="print:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    exportStakeholderPdf(sh._id, `timetable-${sh.name}`)
                  }
                  className="h-[44px] px-6 bg-white border border-[#B5CC2E] rounded text-[14px] font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Download className="w-5 h-5" />
                  Export PDF
                </Button>
              </div>
            </div>

            {!measures.length ? (
              <p className="text-gray-400 text-center py-12 text-[16px] italic">
                No measures added for this stakeholder.
              </p>
            ) : (
              <div className="relative pt-2 pb-24 px-10 bg-white overflow-x-auto min-w-[80%] rounded-xl shadow-sm border border-gray-50">
                <div className="min-w-[80%] relative h-[350px]">
                  {/* timeline bar */}
                  <div className="absolute top-[200px] left-0 right-0 h-[44px] flex shadow-inner rounded-md overflow-hidden border border-gray-200">
                    <div
                      className="h-full bg-[#D7A8BA]"
                      style={{
                        width: `${(timelineStartBuffer / totalWeeks) * 100}%`,
                      }}
                    />
                    <div className="h-full bg-[#829DB5] flex-1" />
                  </div>

                  {/* markers */}
                  {measures.map((m, idx) => {
                    const isPre = m.timing === "pre";
                    const weekPos = isPre
                      ? timelineStartBuffer - (m.startWeeks || 0)
                      : timelineStartBuffer + (m.startWeeks || 0);

                    const xPos = (weekPos / totalWeeks) * 100;
                    const isAbove = idx % 2 === 0;
                    const row = idx % 3;
                    const yPos = isAbove ? 30 + row * 50 : 280 + row * 50;
                    const lineHeight = isAbove ? 200 - yPos : yPos - 244;

                    return (
                      <div
                        key={m._id}
                        className="absolute z-20"
                        style={{
                          left: `${xPos}%`,
                          top: `${yPos}px`,
                          transform: "translateX(-50%)",
                        }}
                      >
                        <div className="flex items-start gap-3 bg-white rounded-lg p-2 whitespace-nowrap min-w-[170px] shadow-md border border-gray-100">
                          <div
                            className="w-[20px] h-[20px] mt-1 flex-shrink-0 rounded-sm"
                            style={{
                              backgroundColor: getCategoryColor(m.category),
                            }}
                          />
                          <div className="flex flex-col gap-1">
                            <span className="text-[15px] font-bold text-[#00253E] leading-tight">
                              {m.type}
                            </span>
                            <span className="text-[13px] text-[#00253E] font-medium leading-tight opacity-95 max-w-[140px] truncate">
                              {m.name}
                            </span>
                            <span className="text-[11px] text-[#00253E]/70 font-black mt-0.5">
                              {m.startWeeks} Weeks
                            </span>
                          </div>
                        </div>

                        <div
                          className={`absolute left-1/2 w-[1px] bg-gray-400/80 z-10 ${
                            isAbove ? "top-full" : "bottom-full"
                          }`}
                          style={{ height: `${lineHeight}px` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// import { Download, User } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { categoryStyles, type Stakeholder } from "./TimeTable";

// interface GridViewProps {
//   stakeholders: Stakeholder[];
//   kickOffDate?: string;
// }

// const TOTAL_WEEKS = 16;

// export default function GridView({ stakeholders }: GridViewProps) {
//   return (
//     <div className="space-y-8">
//       {stakeholders?.map((stakeholder) => (
//         <div key={stakeholder._id}>
//           {/* Group Header */}
//           <div className="flex items-center justify-between mb-8">
//             <button className="flex items-center gap-3 bg-transparent text-[#00253E] text-lg md:text-xl lg:text-[22px] font-semibold px-4 py-2 rounded-[8px] border-y border-x-[4px] border-[#BADA55]">
//               <User size={24} className="bg-[#BADA55] p-1 rounded-[8px]" />
//               {stakeholder.name}
//             </button>
//             <Button
//                 variant="ghost"
//                 size="sm"
//                 className="h-[46px] flex items-center gap-1.5 border border-[#BADA55] text-[#00253E] text-base font-medium px-5 py-1.5 rounded-[8px] hover:bg-gray-50"
//               >
//                 <Download size={12} />
//                 Export PDF
//               </Button>
//           </div>

//           {/* Gantt Chart */}
//           <div className="border border-gray-100 rounded-xl overflow-hidden bg-[#f7f9fb] p-4 ">
//             {/* Week ruler */}
//             <div
//               className="grid mb-4"
//               style={{ gridTemplateColumns: `repeat(${TOTAL_WEEKS}, 1fr)` }}
//             >
//               {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
//                 <div
//                   key={i}
//                   className="text-center text-[9px] text-gray-400 border-l border-gray-200 py-0.5"
//                 >
//                   {i + 1}
//                 </div>
//               ))}
//             </div>

//             {/* Measure rows */}
//             <div className="space-y-4">
//               {stakeholder.measures.length === 0 ? (
//                 <div className="text-xs text-gray-400 py-2">No measures found.</div>
//               ) : (
//                 stakeholder.measures.map((measure) => {
//                   const style = categoryStyles[measure.category];
//                   const leftPct = ((measure.startWeeks - 1) / TOTAL_WEEKS) * 100;
//                   const duration = 3; // default visual duration in weeks
//                   const widthPct = (duration / TOTAL_WEEKS) * 100;

//                   return (
//                     <div key={measure._id} className="relative h-10">
//                       {/* Grid lines */}
//                       <div
//                         className="absolute inset-0 grid"
//                         style={{
//                           gridTemplateColumns: `repeat(${TOTAL_WEEKS}, 1fr)`,
//                         }}
//                       >
//                         {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
//                           <div key={i} className="border-l border-gray-200 h-full" />
//                         ))}
//                       </div>

//                       {/* Label above bar */}
//                       <div
//                         className="absolute -top-4 text-[9px] text-gray-500 whitespace-nowrap font-medium"
//                         style={{ left: `${leftPct}%` }}
//                       >
//                         {measure.name}
//                       </div>

//                       {/* Dot marker */}
//                       <div
//                         className={`absolute top-2.5 w-3 h-3 rounded-sm ${style?.dot ?? "bg-gray-400"} border-2 border-white shadow-sm z-10`}
//                         style={{ left: `calc(${leftPct}% - 6px)` }}
//                       />

//                       {/* Bar */}
//                       <div
//                         className={`absolute top-1.5 h-7 rounded ${style?.bar ?? "bg-gray-300"} flex items-center px-2`}
//                         style={{ left: `${leftPct}%`, width: `${widthPct}%`, minWidth: "40px" }}
//                       >
//                         <span className="text-[10px] font-semibold text-gray-700 truncate">
//                           {measure.type}
//                         </span>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}

//               {/* Change Ambassador row */}
//               {stakeholder.measures.length > 0 && (
//                 <div className="relative h-10 mt-2">
//                   <div
//                     className="absolute inset-0 grid"
//                     style={{ gridTemplateColumns: `repeat(${TOTAL_WEEKS}, 1fr)` }}
//                   >
//                     {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
//                       <div key={i} className="border-l border-gray-200 h-full" />
//                     ))}
//                   </div>
//                   <div
//                     className="absolute -top-4 text-[9px] text-gray-500 whitespace-nowrap"
//                     style={{ left: "20%" }}
//                   >
//                     {stakeholder.name}
//                   </div>
//                   <div
//                     className="absolute top-1.5 h-7 rounded bg-[#003049]/20 flex items-center px-2"
//                     style={{ left: "20%", width: "20%" }}
//                   >
//                     <span className="text-[10px] font-semibold text-[#003049] truncate">
//                       Change Ambassador
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
