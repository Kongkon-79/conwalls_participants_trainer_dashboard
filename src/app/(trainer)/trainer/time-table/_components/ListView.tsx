"use client";

import React, { useRef } from "react";
import { Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Stakeholder } from "./TimeTable";

interface ListViewProps {
  stakeholders: Stakeholder[];
}

export default function ListView({ stakeholders }: ListViewProps) {
  const sectionRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const exportStakeholderPdf = async (
    stakeholderId: string,
    fileName: string,
  ) => {
    if (typeof window === "undefined") return;

    const element = sectionRefs.current.get(stakeholderId);
    if (!element) return;

    const fonts = (document as unknown as { fonts?: { ready: Promise<void> } })
      .fonts;
    if (fonts?.ready) await fonts.ready;

    const { default: html2pdf } = await import("html2pdf.js");

    const clone = element.cloneNode(true) as HTMLDivElement;
    clone.style.background = "#ffffff";
    clone.style.padding = "16px";
    clone.style.margin = "0";
    clone.style.overflow = "visible";
    clone.style.maxWidth = "none";
    clone.style.width = `${element.scrollWidth || element.offsetWidth}px`;

    const exportBtn = clone.querySelector('[data-export-btn="true"]');
    if (exportBtn) exportBtn.remove();

    const header = clone.querySelector(
      '[data-header-row="true"]',
    ) as HTMLDivElement | null;
    if (header) {
      header.style.justifyContent = "flex-start";
      header.style.alignItems = "center";
      header.style.gap = "12px";
      header.style.marginBottom = "16px";
    }

    // ✅ Fix stakeholder badge style in PDF
    const stakeholderBadge = clone.querySelector(
      '[data-pdf-stakeholder-badge="true"]',
    ) as HTMLDivElement | null;

    if (stakeholderBadge) {
      stakeholderBadge.style.display = "inline-flex";
      stakeholderBadge.style.alignItems = "center";
      stakeholderBadge.style.gap = "12px";
      stakeholderBadge.style.backgroundColor = "#ffffff";
      stakeholderBadge.style.color = "#00253E";
      stakeholderBadge.style.fontSize = "22px";
      stakeholderBadge.style.fontWeight = "600";
      stakeholderBadge.style.lineHeight = "1.1";
      stakeholderBadge.style.padding = "10px 16px";
      stakeholderBadge.style.borderTop = "1px solid #BADA55";
      stakeholderBadge.style.borderBottom = "1px solid #BADA55";
      stakeholderBadge.style.borderLeft = "4px solid #BADA55";
      stakeholderBadge.style.borderRight = "4px solid #BADA55";
      stakeholderBadge.style.borderRadius = "8px";
      stakeholderBadge.style.boxSizing = "border-box";
    }

    // ✅ Fix icon box inside stakeholder badge
    const stakeholderIcon = clone.querySelector(
      '[data-pdf-stakeholder-icon="true"]',
    ) as HTMLDivElement | null;

    if (stakeholderIcon) {
      stakeholderIcon.style.display = "inline-flex";
      stakeholderIcon.style.alignItems = "center";
      stakeholderIcon.style.justifyContent = "center";
      stakeholderIcon.style.width = "28px";
      stakeholderIcon.style.height = "28px";
      stakeholderIcon.style.backgroundColor = "#BADA55";
      stakeholderIcon.style.borderRadius = "8px";
      stakeholderIcon.style.flexShrink = "0";
    }

    // ✅ Fix all category pills in PDF
    const categoryPills = clone.querySelectorAll(
      '[data-pdf-category-pill="true"]',
    );

    categoryPills.forEach((pill) => {
      const el = pill as HTMLSpanElement;
      const category = (
        el.getAttribute("data-category-name") || ""
      ).toLowerCase();

      el.style.display = "inline-flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.padding = "6px 14px";
      el.style.borderRadius = "9999px";
      el.style.fontSize = "16px";
      el.style.fontWeight = "600";
      el.style.lineHeight = "1.1";
      el.style.whiteSpace = "nowrap";
      el.style.marginTop = "8px";

      if (category === "communication") {
        el.style.backgroundColor = "#BADA55";
        el.style.color = "#00253E";
      } else if (category === "involvement") {
        el.style.backgroundColor = "#00253E";
        el.style.color = "#ffffff";
      } else if (category === "recognition") {
        el.style.backgroundColor = "#9E1F62";
        el.style.color = "#ffffff";
      } else {
        el.style.backgroundColor = "#9CA3AF";
        el.style.color = "#ffffff";
      }
    });

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-100000px";
    wrapper.style.top = "0";
    wrapper.style.background = "#ffffff";
    wrapper.style.width = `${element.scrollWidth || element.offsetWidth}px`;
    wrapper.style.overflow = "visible";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    const fullWidth = element.scrollWidth || element.offsetWidth;

    const opt = {
      margin: 8,
      filename: `${fileName}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: fullWidth,
        windowWidth: fullWidth,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
      pagebreak: { mode: ["css", "legacy"] as const },
    };

    try {
      await html2pdf().set(opt).from(clone).save();
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  const getCategoryClasses = (category?: string) => {
    const cat = category?.toLowerCase() || "";

    if (cat === "communication") {
      return "bg-[#BADA55] text-[#00253E]";
    }

    if (cat === "involvement") {
      return "bg-[#00253E] text-white";
    }

    if (cat === "recognition") {
      return "bg-[#9E1F62] text-white";
    }

    return "bg-gray-400 text-white";
  };

  return (
    <div className="space-y-6">
      {stakeholders.map((stakeholder) => (
        <div
          key={stakeholder._id}
          ref={(el) => {
            sectionRefs.current.set(stakeholder._id, el);
          }}
        >
          <div
            data-header-row="true"
            className="flex items-center justify-between mb-6"
          >
            <div
              data-pdf-stakeholder-badge="true"
              className="inline-flex items-center gap-3 bg-transparent text-[#00253E] text-lg md:text-xl lg:text-[22px] font-semibold px-4 py-2 rounded-[8px] border-y border-x-[4px] border-[#BADA55]"
            >
              <div
                data-pdf-stakeholder-icon="true"
                className="inline-flex items-center justify-center"
              >
                <User size={18} className="text-[#00253E]" />
              </div>
              <span>{stakeholder.name}</span>
            </div>

            <div data-export-btn="true" className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  exportStakeholderPdf(
                    stakeholder._id,
                    `list-view-${stakeholder.name}`,
                  )
                }
                className="h-[46px] flex items-center gap-1.5 border border-[#BADA55] text-[#00253E] text-base font-medium px-5 py-1.5 rounded-[8px] hover:bg-gray-50"
              >
                <Download size={12} />
                Export PDF
              </Button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-[16px] overflow-hidden bg-white">
            {stakeholder.measures.length === 0 ? (
              <div className="px-5 py-4 text-xs text-gray-400 bg-white">
                No measures found.
              </div>
            ) : (
              stakeholder.measures.map((measure, idx) => (
                <div
                  key={measure._id}
                  className={`bg-[#F2F2F2] border-l-[6px] border-[#BADA55] flex items-stretch ${
                    idx !== stakeholder.measures.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >
                  <div className="w-28 md:w-36 flex items-center px-4 py-4">
                    <span className="text-lg md:text-xl text-black font-semibold leading-[110%]">
                      Week {measure.startWeeks}
                    </span>
                  </div>

                  <div className="flex-1 px-5 py-4">
                    <p className="text-xl md:text-2xl lg:text-3xl text-black font-semibold leading-[110%] pb-1">
                      {measure.name}
                    </p>

                    <span
                      data-pdf-category-pill="true"
                      data-category-name={measure?.category || ""}
                      className={`inline-block mt-1.5 text-base md:text-lg font-semibold leading-[110%] rounded-full px-3 py-1 ${getCategoryClasses(
                        measure?.category,
                      )}`}
                    >
                      {measure.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="min-h-[75px] bg-[#F2F2F2] px-4 py-4 rounded-[16px] mt-6 border">
            <p className="text-xl md:text-2xl lg:text-3xl text-black font-semibold leading-[110%]">
              Change Ambassador :{" "}
              <span className="text-[#00253E] font-semibold text-lg md:text-xl leading-[110%]">
                {stakeholder.name}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// import { Download, User } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { type Stakeholder } from "./TimeTable";

// interface ListViewProps {
//   stakeholders: Stakeholder[];
// }

// export default function ListView({ stakeholders }: ListViewProps) {
//   console.log("Rendering ListView with stakeholders:", stakeholders);
//   return (
//     <div className="space-y-6">
//       {stakeholders.map((stakeholder) => (
//         <div key={stakeholder._id}>
//           {/* Group header row */}
//           <div className="flex items-center justify-between mb-6">
//             <button className="flex items-center gap-3 bg-transparent text-[#00253E] text-lg md:text-xl lg:text-[22px] font-semibold px-4 py-2 rounded-[8px] border-y border-x-[4px] border-[#BADA55]">
//               <User size={24} className="bg-[#BADA55] p-1 rounded-[8px]" />
//               {stakeholder.name}
//             </button>
//             <div className="flex items-center gap-4">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="h-[46px] flex items-center gap-1.5 border border-[#BADA55] text-[#00253E] text-base font-medium px-5 py-1.5 rounded-[8px] hover:bg-gray-50"
//               >
//                 <Download size={12} />
//                 Export PDF
//               </Button>
//               {/* <Button
//                 size="sm"
//                 className="h-[46px] bg-[#BADA55] flex items-center gap-1.5 border border-[#BADA55] text-[#00253E] text-base font-medium px-5 py-1.5 rounded-[8px] "
//               >
//                 <Clock size={12} />
//                 Timetable
//               </Button> */}
//             </div>
//           </div>

//           {/* Measures table */}
//           <div className="border border-gray-200 rounded-[16px] overflow-hidden">
//             {stakeholder.measures.length === 0 ? (
//               <div className="px-5 py-4 text-xs text-gray-400 bg-white">
//                 No measures found.
//               </div>
//             ) : (
//               stakeholder.measures.map((measure, idx) => (
//                 <div
//                   key={measure._id}
//                   className={`bg-[#F2F2F2] border-l-[6px] border-[#BADA55] rounded-[16px] flex items-stretch ${
//                     idx !== stakeholder.measures.length - 1
//                       ? "border-b border-gray-200"
//                       : ""
//                   }`}
//                 >
//                   {/* Week cell */}
//                   <div className="w-28 flex items-center px-4">
//                     <span className="text-lg md:text-xl text-black font-semibold leading-[110%] ">
//                       Week {measure.startWeeks}
//                     </span>
//                   </div>

//                   {/* Content cell */}
//                   <div className="flex-1  px-5 py-3">
//                     <p className="text-xl md:text-2xl lg:text-3xl text-black font-semibold leading-[110%] pb-1">
//                       {measure.name}
//                     </p>
//                     <span
//                       className={`inline-block mt-1.5 text-base md:text-lg font-semibold leading-[110%] rounded-full px-3 py-1 ${measure?.category === "communication" ? "bg-[#BADA55] text-[#00253E]" : measure?.category === "involvement" ? "bg-[#00253E] text-white" : "bg-[#9E1F62] text-white"}`}
//                     >
//                       {measure.category}
//                     </span>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>

//           {/* Change Ambassador */}
//           <div className="h-[75px] bg-[#F2F2F2] px-4  rounded-[16px] mt-6 border">
//             <p className="text-xl md:text-2xl lg:text-3xl text-black font-semibold leading-[110%] mt-4">
//               Change Ambassador :{" "}
//               <span className="text-[#00253E] font-semibold text-lg md:text-xl leading-[110%]">
//                 {stakeholder.name}
//               </span>
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
