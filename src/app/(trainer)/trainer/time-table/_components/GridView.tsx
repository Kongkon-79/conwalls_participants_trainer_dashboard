"use client";

import React, { useRef } from "react";
import { Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Html2PdfOptions } from "html2pdf.js";
import { type Stakeholder, type Measure } from "./TimeTable";

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

const getSortedMeasures = (measures: Measure[] = []) =>
  [...measures].sort((a, b) => {
    const timingOrder = { post: 0, pre: 1 };
    const timingDiff =
      timingOrder[a.timing as keyof typeof timingOrder] -
      timingOrder[b.timing as keyof typeof timingOrder];

    if (timingDiff !== 0) return timingDiff;

    return (a.startWeeks || 0) - (b.startWeeks || 0);
  });

export default function GridView({ stakeholders, kickOffDate }: GridViewProps) {
  const sectionRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const formattedStartDate = kickOffDate
    ? new Date(kickOffDate)
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, " - ")
    : "08 - 02 - 2026";

  const formatDisplayDate = (date: Date) =>
    date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, ".");

  const formatMeasureDate = (measure: Measure) => {
    if (!kickOffDate) return formattedStartDate;

    const baseDate = new Date(kickOffDate);
    if (Number.isNaN(baseDate.getTime())) return formattedStartDate;

    const weekOffset = (measure.startWeeks || 0) * 7;
    const direction = measure.timing === "pre" ? -1 : 1;

    baseDate.setDate(baseDate.getDate() + direction * weekOffset);

    return formatDisplayDate(baseDate);
  };

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
    clone.style.padding = "20px";
    clone.style.margin = "0";
    clone.style.overflow = "visible";
    clone.style.maxWidth = "none";
    clone.style.boxSizing = "border-box";

    const exportBtn = clone.querySelector('[data-export-btn="true"]');
    if (exportBtn) {
      (exportBtn as HTMLDivElement).style.visibility = "hidden";
      (exportBtn as HTMLDivElement).style.pointerEvents = "none";
    }

    const header = clone.querySelector(
      '[data-header-row="true"]',
    ) as HTMLDivElement | null;
    if (header) {
      header.style.marginBottom = "24px";
    }

    const stakeholderBadge = clone.querySelector(
      '[data-pdf-stakeholder-badge="true"]',
    ) as HTMLDivElement | null;
    if (stakeholderBadge) {
      stakeholderBadge.style.display = "inline-flex";
      stakeholderBadge.style.alignItems = "center";
      stakeholderBadge.style.gap = "12px";
      stakeholderBadge.style.backgroundColor = "#ffffff";
      stakeholderBadge.style.color = "#00253E";
      stakeholderBadge.style.fontSize = "16px";
      stakeholderBadge.style.fontWeight = "700";
      stakeholderBadge.style.lineHeight = "1.1";
      stakeholderBadge.style.padding = "10px 16px";
      stakeholderBadge.style.borderTop = "1px solid #B5CC2E";
      stakeholderBadge.style.borderBottom = "1px solid #B5CC2E";
      stakeholderBadge.style.borderLeft = "4px solid #B5CC2E";
      stakeholderBadge.style.borderRight = "4px solid #B5CC2E";
      stakeholderBadge.style.borderRadius = "8px";
      stakeholderBadge.style.boxSizing = "border-box";
      stakeholderBadge.style.boxShadow = "0 1px 2px rgba(0,0,0,0.06)";
    }

    const stakeholderIcon = clone.querySelector(
      '[data-pdf-stakeholder-icon="true"]',
    ) as HTMLDivElement | null;
    if (stakeholderIcon) {
      stakeholderIcon.style.display = "inline-flex";
      stakeholderIcon.style.alignItems = "center";
      stakeholderIcon.style.justifyContent = "center";
      stakeholderIcon.style.width = "20px";
      stakeholderIcon.style.height = "20px";
      stakeholderIcon.style.flexShrink = "0";
    }

    const gridShell = clone.querySelector(
      '[data-pdf-grid-shell="true"]',
    ) as HTMLDivElement | null;
    const gridViewport = clone.querySelector(
      '[data-pdf-grid-viewport="true"]',
    ) as HTMLDivElement | null;
    const gridCanvas = clone.querySelector(
      '[data-pdf-grid-canvas="true"]',
    ) as HTMLDivElement | null;

    if (gridShell) {
      gridShell.style.overflow = "visible";
      gridShell.style.padding = "24px";
      gridShell.style.borderRadius = "16px";
      gridShell.style.boxSizing = "border-box";
    }

    if (gridViewport) {
      gridViewport.style.overflow = "visible";
    }

    if (gridCanvas) {
      gridCanvas.style.minWidth = "0";
      gridCanvas.style.margin = "0 auto";
    }

    const fullWidth =
      gridShell?.scrollWidth ||
      gridShell?.getBoundingClientRect().width ||
      element.scrollWidth ||
      element.getBoundingClientRect().width;
    const fullHeight =
      gridShell?.scrollHeight ||
      gridShell?.getBoundingClientRect().height ||
      element.scrollHeight ||
      element.getBoundingClientRect().height;

    const paddedWidth = fullWidth + 40;
    const paddedHeight = fullHeight + 40;

    clone.style.width = `${paddedWidth}px`;
    clone.style.minHeight = `${fullHeight}px`;

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-100000px";
    wrapper.style.top = "0";
    wrapper.style.background = "#ffffff";
    wrapper.style.width = `${paddedWidth}px`;
    wrapper.style.minHeight = `${paddedHeight}px`;
    wrapper.style.overflow = "visible";
    wrapper.style.padding = "0";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    const opt = {
      margin: 0,
      filename: `${fileName}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: paddedWidth,
        height: paddedHeight,
        windowWidth: paddedWidth,
        windowHeight: paddedHeight,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: "px" as const,
        format: [Math.ceil(paddedHeight + 24), Math.ceil(paddedWidth + 24)],
        orientation: "landscape" as const,
      },
      pagebreak: { mode: ["avoid-all"] as const },
    };

    try {
      await html2pdf()
        .set(opt as unknown as Html2PdfOptions)
        .from(clone)
        .save();
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  return (
    <div className="space-y-10 pb-10 w-full max-w-full mx-auto font-sans">
      {stakeholders.map((sh) => {
        const sortedMeasures = getSortedMeasures(sh.measures);
        const maxWeeksPre =
          sortedMeasures
            .filter((m) => m.timing === "pre")
            .reduce((mx, m) => Math.max(mx, m.startWeeks || 0), 0) || 0;
        const maxWeeksPost =
          sortedMeasures
            .filter((m) => m.timing === "post")
            .reduce((mx, m) => Math.max(mx, m.startWeeks || 0), 0) || 0;

        const timelineStartBuffer = Math.max(2, maxWeeksPre + 2);
        const timelineEndBuffer = Math.max(2, maxWeeksPost + 2);
        const totalWeeks = timelineStartBuffer + timelineEndBuffer;
        const timelineWidth = Math.max(980, totalWeeks * 70);
        const splitLeft = `${(timelineStartBuffer / totalWeeks) * 100}%`;
        const preCount = sortedMeasures.filter((m) => m.timing === "pre").length;
        const postCount = sortedMeasures.filter((m) => m.timing === "post").length;
        const upperRows = Math.max(1, Math.ceil(preCount / 2), Math.ceil(postCount / 2));
        const lowerRows = Math.max(1, Math.ceil(preCount / 2), Math.ceil(postCount / 2));
        const rowGap = 42;
        const cardHeight = 58;
        const topBase = 12;
        const timelineTop = 182 + Math.max(0, upperRows - 1) * rowGap;
        const bottomBase = timelineTop + 92;
        const canvasHeight =
          bottomBase + cardHeight + Math.max(0, lowerRows - 1) * rowGap + 20;

        return (
          <div
            key={sh._id}
            ref={(el) => {
              sectionRefs.current.set(sh._id, el);
            }}
            className="mb-12 block print:break-inside-avoid"
          >
            <div
              data-header-row="true"
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center">
                <div
                  data-pdf-stakeholder-badge="true"
                  className="h-[44px] px-6 bg-white border border-x-[4px] border-[#B5CC2E] rounded-[8px] flex items-center gap-3 shadow-sm"
                >
                  <div data-pdf-stakeholder-icon="true">
                    <User className="w-5 h-5 text-[#B5CC2E]" />
                  </div>
                  <span className="text-[16px] font-bold text-[#00253E]">
                    {sh.name}
                  </span>
                </div>
              </div>

              <div data-export-btn="true" className="flex items-center gap-3 print:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => exportStakeholderPdf(sh._id, `grid-view-${sh.name}`)}
                  className="h-[44px] px-6 bg-white border border-[#B5CC2E] rounded text-[14px] font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Download className="w-5 h-5" />
                  Export PDF
                </Button>
              </div>
            </div>

            {!sortedMeasures.length ? (
              <p className="text-gray-400 text-center py-12 text-[16px] italic">
                No measures added for this stakeholder.
              </p>
            ) : (
              <div
                data-pdf-grid-shell="true"
                className="relative rounded-xl border border-gray-50 bg-white px-6 py-6 shadow-sm"
              >
                <div
                  data-pdf-grid-viewport="true"
                  className="overflow-x-hidden overflow-y-visible print:overflow-visible"
                >
                  <div
                    data-pdf-grid-canvas="true"
                    className="relative mx-auto min-w-full print:min-w-0"
                    style={{ height: `${canvasHeight}px`, width: `${timelineWidth}px` }}
                  >
                    <div
                      className="absolute left-0 right-0 h-[48px] overflow-hidden border border-[#d7dde3]"
                      style={{ top: `${timelineTop}px` }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 bg-[#DDB3C1]"
                        style={{ width: splitLeft }}
                      ></div>
                      <div
                        className="absolute inset-y-0 right-0 bg-[#9EB7CB]"
                        style={{ width: `calc(100% - ${splitLeft})` }}
                      ></div>
                    </div>

                    <div
                      className="absolute left-0 right-0 h-[78px]"
                      style={{ top: `${timelineTop - 32}px` }}
                    >
                      {Array.from({ length: totalWeeks + 1 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 h-[50px] w-px bg-[#23445f]/65"
                          style={{ left: `${(i / totalWeeks) * 100}%` }}
                        ></div>
                      ))}
                    </div>

                    <div
                      className="absolute z-30 flex -translate-x-1/2 flex-col items-center"
                      style={{ left: splitLeft, top: `${timelineTop - 73}px` }}
                    >
                      <div className="h-[56px] w-[3px] bg-[#A91D54]"></div>
                      <div className="mt-[-1px] flex flex-col items-center bg-white px-2 text-center">
                        <div className="flex items-center gap-1 text-[24px] font-black leading-none text-[#A91D54]">
                          <span className="h-[13px] w-[13px] rounded-full bg-[#A91D54]"></span>
                          <span className="text-[20px] text-[#00253E]">Start</span>
                        </div>
                        <span className="mt-1 text-[12px] font-bold text-[#00253E]">
                          {formattedStartDate}
                        </span>
                      </div>
                      <div className="h-[120px] w-[3px] bg-[#A91D54]"></div>
                    </div>

                    {sortedMeasures.map((m, idx) => {
                      const isPre = m.timing === "pre";
                      const weekPos = isPre
                        ? timelineStartBuffer - (m.startWeeks || 0)
                        : timelineStartBuffer + (m.startWeeks || 0);
                      const xPos = `${(weekPos / totalWeeks) * 100}%`;

                      const orderWithinSide =
                        sortedMeasures
                          .slice(0, idx + 1)
                          .filter((item) => item.timing === m.timing).length - 1;
                      const isNearStart = (m.startWeeks || 0) <= 2;
                      const nearStartCountWithinSide = sortedMeasures
                        .slice(0, idx + 1)
                        .filter(
                          (item) =>
                            item.timing === m.timing &&
                            (item.startWeeks || 0) <= 2,
                        ).length;
                      const adjustedOrder = isPre
                        ? orderWithinSide
                        : Math.max(0, orderWithinSide - nearStartCountWithinSide);
                      const isAbove = isPre
                        ? orderWithinSide % 2 === 0
                        : isNearStart
                          ? false
                          : adjustedOrder % 2 === 0;
                      const rowOffset = Math.floor(orderWithinSide / 2);
                      const yPos = isAbove
                        ? topBase + rowOffset * rowGap
                        : bottomBase + rowOffset * rowGap;
                      const connectorHeight = isAbove
                        ? timelineTop - (yPos + cardHeight)
                        : yPos - (timelineTop + 48);

                      return (
                        <div
                          key={m._id}
                          className="absolute z-20 -translate-x-1/2"
                          style={{ left: xPos, top: `${yPos}px` }}
                        >
                          <div
                            className={`absolute left-1/2 w-px -translate-x-1/2 bg-[#5C7286]/80 ${
                              isAbove ? "top-full" : "bottom-full"
                            }`}
                            style={{ height: `${Math.max(connectorHeight, 24)}px` }}
                          ></div>

                          <div className="flex min-w-[180px] max-w-[210px] gap-3 bg-white px-1 py-1 text-[#00253E]">
                            <div
                              className="mt-1 h-[18px] w-[18px] flex-shrink-0"
                              style={{ backgroundColor: getCategoryColor(m.category) }}
                            ></div>
                            <div className="flex flex-col leading-tight">
                              <span className="text-[15px] font-extrabold">
                                {m.type}
                              </span>
                              <span className="mt-0.5 text-[12px] font-semibold text-[#00253E]">
                                {m.name}
                              </span>
                              <span className="mt-1 text-[11px] font-bold text-[#00253E]">
                                {m.startWeeks} {m.startWeeks === 1 ? "Week" : "Weeks"}
                              </span>
                              <span className="mt-0.5 text-[11px] font-bold text-[#00253E]/80">
                                {formatMeasureDate(m)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
