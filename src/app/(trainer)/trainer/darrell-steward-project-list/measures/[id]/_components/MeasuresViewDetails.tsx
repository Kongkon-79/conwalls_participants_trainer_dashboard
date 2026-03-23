"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

interface MeasureData {
  _id: string;
  stakeholderId: string;
  insightEngineId: string;
  category: string;
  type: string;
  name: string;
  startWeeks: number;
  timing: "pre" | "post";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: MeasureData;
}

export default function MeasuresViewDetails() {
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [startWeeks, setStartWeeks] = useState(0);
  const [timing, setTiming] = useState<"pre" | "post">("post");

  const params = useParams();
  const measureId = params?.id as string;

  const session = useSession();
  const TOKEN = session?.data?.user?.accessToken ?? "";

  const { data: singleMeasureData, isLoading } = useQuery<ApiResponse>({
    queryKey: ["single-measure", measureId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/measure/${measureId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch measure details");
      return res.json();
    },
    enabled: !!measureId && !!TOKEN,
  });


  console.log("dd", singleMeasureData)

  const stakeholderId = singleMeasureData?.data?.stakeholderId
  const insightEngineId = singleMeasureData?.data?.insightEngineId

  // Populate form fields when data loads
  useEffect(() => {
    if (singleMeasureData?.data) {
      const d = singleMeasureData.data;
      setCategory(d.category);
      setType(d.type);
      setName(d.name);
      setStartWeeks(d.startWeeks);
      setTiming(d.timing);
    }
  }, [singleMeasureData]);

  // const handleAdd = () => {
  //   console.log({ category, type, name, startWeeks, timing });
  // };

  return (
    <div className="min-h-screen font-sans">
      {/* Breadcrumb */}
      <div className="py-4">
        <p className="text-lg md:text-xl lg:text-2xl font-semibold text-[#00253E] leading-normal">Project List</p>
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
          <span className="text-lg md:text-xl font-medium text-[#00253E] leading-[120%]">Stakeholder</span>
          <ChevronRight size={20} />
          <span className="text-lg md:text-xl font-medium text-[#00253E] leading-[120%]">Measures</span>
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4 mt-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-[90px] w-full rounded-[8px] bg-[#00253E]/30" />
                    ))}
                  </div>
      ) : (
        <>
          {/* Form */}
          <div className="space-y-4">
            {/* Category */}
            <div className="space-y-4">
              <label className="text-xl md:text-2xl text-[#00253E] leading-[110%] font-normal mb-4">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-[60px] border border-[#00253E] rounded-[8px] px-4 text-xl md:text-2xl text-[#00253E] font-normal leading-[110%]"
              />
            </div>

            {/* Type */}
            <div className="space-y-4">
              <label className="text-xl md:text-2xl text-[#00253E] leading-[110%] font-normal mb-4">
                Type
              </label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-[60px] border border-[#00253E] rounded-[8px] px-4 text-xl md:text-2xl text-[#00253E] font-normal leading-[110%]"
              />
            </div>

            {/* Name */}
            <div className="space-y-4">
              <label className="text-xl md:text-2xl text-[#00253E] leading-[110%] font-normal mb-4">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-[60px] border border-[#00253E] rounded-[8px] px-4 text-xl md:text-2xl text-[#00253E] font-normal leading-[110%]"
              />
            </div>

            {/* Start Weeks */}
            <div className="space-y-4">
             <label className="text-xl md:text-2xl text-[#00253E] leading-[110%] font-normal mb-4">
                Start
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={startWeeks}
                  onChange={(e) => setStartWeeks(Number(e.target.value))}
                  className="w-24 h-[56px] border border-[#00253E] rounded-[8px] px-4 text-xl md:text-2xl text-[#00253E] font-normal leading-[110%] text-center"
                />
                <span className="text-xl md:text-2xl text-[#00253E] font-normal leading-[110%]">Weeks</span>
              </div>
            </div>

            {/* Pre / Post radio + AI button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-48 h-[56px] flex items-center gap-4 border border-[#00253E] rounded-[8px] px-4 text-xl md:text-2xl text-[#00253E] font-normal leading-[110%] text-center">
                  {/* Pre */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setTiming("pre")}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      timing === "pre" ? "border-[#BADA55]" : "border-[#BADA55]"
                    }`}
                  >
                    {timing === "pre" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#BADA55]" />
                    )}
                  </div>
                  <span className="text-xl md:text-2xl text-[#00253E] font-normal leading-[110%]">Pre</span>
                </label>

                {/* Post */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setTiming("post")}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      timing === "post"
                        ? "border-[#c5e84a]"
                        : "border-[#BADA55]"
                    }`}
                  >
                    {timing === "post" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#c5e84a]" />
                    )}
                  </div>
                  <span className="text-xl md:text-2xl text-[#00253E] font-normal leading-[110%]">Post</span>
                </label>
                </div>

                <span className="text-xl md:text-2xl text-[#00253E] font-normal leading-[110%]">kick off</span>
              </div>

              {/* AI Button */}
              {/* <button className="flex items-center gap-2 bg-[#003049] text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-[#1a4a6b] transition-colors">
                <Bot size={14} />
                AI »
              </button> */}
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex items-center justify-between mt-10 ">
            {/* Back */}
            <Link href={`/trainer/darrell-steward-project-list/measures?projectId=${insightEngineId}&stakeholderId=${stakeholderId}`}>
              <button className="h-[48px] flex items-center gap-1.5 border border-[#BADA55] text-[#00253E] text-base font-medium px-5 py-2.5 rounded-[8px]">
                <ChevronLeft size={24} />
                Back 
              </button>
            </Link>

            {/* AI Button */}
              {/* <button className="flex items-center gap-2 bg-[#003049] text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-[#1a4a6b] transition-colors">
                <Bot size={14} />
                AI »
              </button> */}

            {/* Add */}
            {/* <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 bg-[#c5e84a] text-[#2d4a00] text-xs font-semibold px-6 py-2.5 rounded-lg hover:bg-[#b8d93e] transition-colors"
            >
              Add
              <ChevronRight size={13} />
            </button> */}
          </div>
        </>
      )}
    </div>
  );
}
