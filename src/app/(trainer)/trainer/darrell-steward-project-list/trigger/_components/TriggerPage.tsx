"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import penIcon from "../../../../../../../public/assets/images/pen.png"
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface Stakeholder {
  _id: string;
  name: string;
  roleType: string;
  painPoint: string;
  insightEngineId: string;
  benefits: string;
  triggerEvaluation: string;
  objectionsConcerns: string;
  objectionHandling: string;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: Stakeholder;
}

export default function TriggerPage() {
  const params = useParams();
  const stakeholderId = params?.id as string;

  console.log("p", stakeholderId)

  const session = useSession();
  const TOKEN = session.data?.user?.accessToken;

  const { data: triggerData, isLoading } = useQuery<ApiResponse>({
    queryKey: ["trigger-details", stakeholderId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stakeholder/single/${stakeholderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch trigger details");
      return res.json();
    },
    enabled: !!stakeholderId,
  });

  const stakeholder = triggerData?.data;

  const formatTriggerEvaluation = (value: string) => {
    return value
      ?.replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="pb-24 font-sans">
      {/* Page Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-semibold leading-[110%] text-[#00253E]">Project List</h2>
        <p className="flex items-center gap-1 mt-1">
          <span className="text-lg md:text-xl text-[#00253E] font-medium leading-[120%]">Stakeholder</span>
          <ChevronRight size={24} className="text-[#6B6B6B]" />
          <span className="text-lg md:text-xl text-[#00253E] font-medium leading-[120%]">Trigger</span>
        </p>
      </div>

      {isLoading ? (
         <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-[90px] w-full rounded-[8px] bg-[#00253E]/30" />
                    ))}
                  </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Role */}
          <div>
            <p className="text-lg md:text-xl font-normal text-[#00253E] mb-2">Role</p>
            <div className="h-[56px] min-w-[280px] inline-block border border-[#00253E] rounded-[8px] px-4 py-2  text-xl md:text-2xl text-[#00253E] leading-[110%] font-normal ">
              {stakeholder?.roleType ?? "—"}
            </div>
          </div>

          {/* Pain Point */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Image src={penIcon} alt="Pen Icon" width={24} height={24} />
              <span className="text-lg md:text-xl font-normal text-[#00253E]">Pain point</span>
            </div>
            <div className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl">
              {stakeholder?.painPoint ?? "—"}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Image src={penIcon} alt="Pen Icon" width={24} height={24} />
              <span className="text-lg md:text-xl font-normal text-[#00253E]">Benefits</span>
            </div>
            <div className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl">
              {stakeholder?.benefits ?? "—"}
            </div>
          </div>

          {/* Trigger Evaluation */}
          <div>
            <p className="text-lg md:text-xl font-normal text-[#00253E] mb-2">Trigger Evaluation</p>
            <div className="h-[56px] min-w-[280px] inline-block border border-[#00253E] rounded-[8px] px-4 py-2  text-xl md:text-2xl text-[#00253E] leading-[110%] font-normal ">
              {formatTriggerEvaluation(stakeholder?.triggerEvaluation ?? "")}
            </div>
          </div>

          {/* Objections / Concerns */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Image src={penIcon} alt="Pen Icon" width={24} height={24} />
              <span className="text-lg md:text-xl font-normal text-[#00253E]">Objections / Concerns</span>
            </div>
            <div className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl">
              {stakeholder?.objectionsConcerns ?? "—"}
            </div>
          </div>

          {/* Objection Handling */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Image src={penIcon} alt="Pen Icon" width={24} height={24} />
              <span className="text-lg md:text-xl font-normal text-[#00253E]">Objection Handling</span>
            </div>
            <div className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl">
              {stakeholder?.objectionHandling ?? "—"}
            </div>
          </div>
        </div>
      )}

      {/* Go Back */}
      <div className="mt-8">
        <Link
          href={`/trainer/darrell-steward-project-list/continue/${stakeholder?.insightEngineId}`}
         className="inline-flex items-center gap-2 text-base text-[#00253E] font-medium underline leading-[110%]"
        >
          <span className="w-8 h-8 rounded-full border border-[#00253E] flex items-center justify-center">
            <ChevronLeft size={32} />
          </span>
          Go Back
        </Link>
      </div>
    </div>
  );
}
