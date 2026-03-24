"use client";

import { useState } from "react";
import { ChevronRight, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ListView from "./ListView";
import GridView from "./GridView";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface Measure {
  _id: string;
  stakeholderId: string;
  insightEngineId: string;
  category: string;
  type: string;
  name: string;
  startWeeks: number;
  timing: "pre" | "post";
  createdAt?: string;
  updatedAt?: string;
}

export interface Stakeholder {
  _id: string;
  insightEngineId: string;
  name: string;
  roleType: string;
  measures: Measure[];
}

export interface InsightEngine {
  _id: string;
  projectTitle: string;
  kickOffDate: string;
  participantName: string;
  organization: string;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    insightEngine: InsightEngine;
    stakeholders: Stakeholder[];
  };
}

// ─── Category style map ────────────────────────────────────────────────────────
export const categoryStyles: Record<
  string,
  { badge: string; dot: string; bar: string; border: string }
> = {
  Communication: {
    badge: "bg-[#c5e84a] text-[#2d4a00]",
    dot: "bg-[#c5e84a]",
    bar: "bg-[#c5e84a]/60",
    border: "border-l-[#c5e84a]",
  },
  Involvement: {
    badge: "bg-[#003049] text-white",
    dot: "bg-[#003049]",
    bar: "bg-[#003049]/50",
    border: "border-l-[#003049]",
  },
  Recognition: {
    badge: "bg-[#c0405a] text-white",
    dot: "bg-[#c0405a]",
    bar: "bg-[#c0405a]/40",
    border: "border-l-[#c0405a]",
  },
};

// ─── Legend ────────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div className="flex flex-col gap-8">
      {Object.entries(categoryStyles).map(([cat, style]) => (
        <div key={cat} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-sm ${style.dot}`} />
          <span className="text-lg md:text-xl lg:text-[22px] text-black font-semibold leading-[110%]">{cat}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TimeTable() {
  const [view, setView] = useState<"list" | "grid">("list");

  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") as string;

  const session = useSession();
  const TOKEN = session?.data?.user?.accessToken ?? "";

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ["timetable", projectId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/insight-engine/stakeholders-measures/${projectId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch timetable data");
      return res.json();
    },
    enabled: !!projectId && !!TOKEN,
  });

  const insightEngine = data?.data?.insightEngine;
  const stakeholders = data?.data?.stakeholders ?? [];

  // Format kickoff date for display
  const kickOffFormatted = insightEngine?.kickOffDate
    ? new Date(insightEngine.kickOffDate).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen font-sans">
      {/* Top bar */}
      <div className="flex items-start justify-between mb-4">
        <div className="pt-3">
          <p className="text-lg md:text-xl lg:text-2xl font-semibold text-[#00253E] leading-normal">Project List</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <span className="text-lg md:text-xl font-medium text-[#00253E] leading-[120%]">{insightEngine?.projectTitle ?? "New ERP System"}</span>
            <ChevronRight size={20} />
            <span className="text-lg md:text-xl font-medium text-[#00253E] leading-[120%]">Time Table</span>
          </p>
        </div>

        <div className="flex items-start gap-5">
          {/* View Toggle */}
          <div className="bg-[#EEEEEE] p-2 flex items-center gap-4 rounded-[4px] overflow-hidden">
            <Button
              // variant="ghost"
              size="sm"
              onClick={() => setView("grid")}
              className={`flex items-center gap-1.5 text-[#00253E] ${
                view === "grid"
                  ? "bg-white rounded-[8px] p-2"
                  : "bg-transparent shadow-none border-none"
              }`}
            >
              <LayoutGrid size={13} />
              Grid View
            </Button>
            <Button
              // variant="ghost"
              size="sm"
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 text-[#00253E] ${
                view === "list"
                  ? "bg-white rounded-[8px] p-2"
                  : "bg-transparent shadow-none border-none"
              }`}
            >
              <List size={13} />
              List View
            </Button>
          </div>

          {/* Legend */}
          <Legend />
        </div>
      </div>

      {/* Start Date */}
      <p className="text-lg md:text-xl lg:text-2xl font-semibold text-[#00253E] leading-normal pb-6">
        Start : {kickOffFormatted}
      </p>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4 mt-4">
                            {[...Array(4)].map((_, i) => (
                              <Skeleton key={i} className="h-[90px] w-full rounded-[8px] bg-[#00253E]/30" />
                            ))}
                          </div>
      ) : view === "list" ? (
        <ListView
          stakeholders={stakeholders}
          kickOffDate={insightEngine?.kickOffDate}
        />
      ) : (
        <GridView
          stakeholders={stakeholders}
          kickOffDate={insightEngine?.kickOffDate}
        />
      )}
    </div>
  );
}
