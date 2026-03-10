/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { RiInformationFill } from "react-icons/ri";
import { useForm } from "react-hook-form";
import {
  Info,
  ChevronLeft,
  ChevronsRight,
  CalendarDays,
  ChevronsLeft,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useSystemSettings } from "@/hooks/use-system-settings";
import { useSession } from "next-auth/react";
import { parseCookies } from "nookies";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
// import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import penIcon from "../../../../../../public/assets/images/pen.png"
import Image from "next/image";

interface SystemFormsProps {
  projectId: string;
  kickOffDate: Date;
  onBack: () => void;
  onNext: () => void;
  projectTitle: string;
  initialData?: SystemFormValues;
}

type SystemFormValues = {
  vision: string;
  pastGoodOldDays: string;
  obstacleProblem: string;
  riskOfInaction: string;
  solutionIdea: string;
};

const COOKIE_NAME = "googtrans";

export default function SystemForms({
  projectId,
  kickOffDate,
  onBack,
  projectTitle,
  onNext,
  initialData,
}: SystemFormsProps) {
  const cookie = parseCookies()[COOKIE_NAME];
  const lang = cookie?.split("/")?.[2] || "en";
  const session = useSession();
  const token = (session?.data?.user as { accessToken?: string })?.accessToken;
  // const router = useRouter();
  const [language, setLanguage] = useState<"en" | "de">("en");

  useEffect(() => {
    const cookies = parseCookies();
    const googtrans = cookies.googtrans;
    if (googtrans) {
      const lang = googtrans.split("/")[2];
      if (lang === "de" || lang === "en") {
        setLanguage(lang as "en" | "de");
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SystemFormValues>({
    defaultValues: initialData,
  });

  // Pre-fill form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const { data: systemSettings } = useSystemSettings();

  const submitMutation = useMutation({
    mutationFn: async (values: SystemFormValues) => {
      const participantName =
        localStorage.getItem("userName") ||
        session.data?.user?.name ||
        "Anonymous";
      const organization = "Tech Solutions Ltd, Bangladesh";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/insight-engine/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: projectId, // CRITICAL: Pass the ID to prevent duplication
            participantName,
            organization,
            projectTitle,
            kickOffDate: kickOffDate.toISOString(),
            systemForms: {
              vision: values.vision,
              pastGoodOldDays: values.pastGoodOldDays,
              obstacleProblem: values.obstacleProblem,
              riskOfInaction: values.riskOfInaction,
              solutionIdea: values.solutionIdea,
            },
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to submit form");
      return res.json();
    },
    onSuccess: () => {
      toast.success("System forms submitted successfully");
      onNext();
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const getHelpText = (name: string) => {
    const helptexts = systemSettings?.helpTexts || [];
    const help = helptexts.find((h: any) => h.name === name);
    return help?.values?.[language] || help?.values?.en || "";
  };

  const onSubmit = (values: SystemFormValues) => {
    submitMutation.mutate(values);
  };

  return (
    <div className="w-full space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-[32px] notranslate font-semibold text-[#00253E]">
          {projectTitle}
        </h1>
        <div className="flex items-center gap-2 text-[#00253E]">
          <CalendarDays className="w-5 h-5" />
          <span className="notranslate text-[18px] font-medium">
            Kick off :{" "}
            {new Intl.DateTimeFormat(
              language === "de" ? "de-DE" : "en-GB",
            ).format(kickOffDate)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4">
          {/* Vision */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Image src={penIcon} alt="Pen Icon" width={22} height={22} />
              <label className="text-[20px] font-medium text-[#00253E]">
                Vision
              </label>
              <HelpIcon text={getHelpText("Vision")} />
            </div>
            <Textarea
              {...register("vision")}
              placeholder="What will the further look like?"
              className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl"
            />
          </div>

          {/* Past */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <Image src={penIcon} alt="Pen Icon" width={22} height={22} />
              <label className="text-[20px] font-medium text-[#00253E]">
                
                {lang === "de" ? "Vergangenheit" : "The past (good old days)"}
              </label>
              <HelpIcon text={getHelpText("The past (good old days)")} />
            </div>
            <Textarea
              {...register("pastGoodOldDays")}
              placeholder="Describe how this were in the past.."
              className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl"
            />
          </div>

          {/* Obstacle */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <Image src={penIcon} alt="Pen Icon" width={22} height={22} />
              <label className="text-[20px] font-medium text-[#00253E]">
                
                {lang === "de" ? "Hindernis / Problem" : "Obstacle / Problem"}
              </label>
              <HelpIcon text={getHelpText("Obstacle / Problem")} />
            </div>
            <Textarea
              {...register("obstacleProblem")}
              placeholder="what problem are you Facing?"
              className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl"
            />
          </div>

          {/* Risk */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <Image src={penIcon} alt="Pen Icon" width={22} height={22} />
              <label className="text-[20px] font-medium text-[#00253E]">
                
                {lang === "de" ? "Risiko / Konsequenzen" : "Risk of inaction / Consequences"}
              </label>
              <HelpIcon text={getHelpText("Risk of inaction / Consequences")} />
            </div>
            <Textarea
              {...register("riskOfInaction")}
              placeholder="What happens if we don't change?"
              className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl"
            />
          </div>

          {/* Solution */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <Image src={penIcon} alt="Pen Icon" width={22} height={22} />
              <label className="text-[20px] font-medium text-[#00253E]">
                
                {lang === "de" ? "Idee / Lösung" : "Solution / Idea"}
              </label>
              <HelpIcon text={getHelpText("Solution / Idea")} />
            </div>
            <Textarea
              {...register("solutionIdea")}
              placeholder="what's the solutions?"
              className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-[48px] px-8 rounded-[8px] flex items-center gap-2 border-primary font-medium text-[#00253E] hover:bg-gray-50 bg-white"
          >
            <ChevronsLeft className="w-5 h-5" />
             {lang === "de" ? "abbrechen" : "Cancel"}
          </Button>

          <Button
            type="submit"
            disabled={submitMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-[#00253E] px-12 h-[48px] rounded-[8px] flex items-center gap-2 font-semibold transition-all duration-200 active:scale-95"
          >

             {submitMutation.isPending
                    ? lang === "de"
                      ? "Wird hinzugefügt..."
                      : "Adding..."
                    : lang === "de"
                      ? "weiter"
                      : "Continue"}
            <ChevronsRight className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function HelpIcon({ text }: { text: string }) {
  if (!text) return null;

  // Convert "•" text into bullet array (also supports newline)
  const normalized = text.replace(/\r\n/g, "\n");
  const parts = normalized
    .split("•")
    .map((s) => s.trim())
    .filter(Boolean);

  const hasBullets = parts.length > 1;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="outline-none">
            <RiInformationFill className="w-5 h-5 text-[#00253E] cursor-pointer" />
          </button>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          align="start"
          sideOffset={8}
          // 🔥 This forces wrapping (Radix sometimes applies nowrap)
          style={{ whiteSpace: "normal" }}
          className="max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl bg-[#00253E] text-white p-3 rounded-[4px] shadow-2xl border-t-4 border-primary animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />

            {hasBullets ? (
              <div className="text-[14px] leading-relaxed break-words whitespace-normal">
                {/* first part can be intro line */}
                <p className="mb-2 break-words whitespace-normal">{parts[0]}</p>

                <ul className="list-disc pl-5 space-y-1">
                  {parts.slice(1).map((item, idx) => (
                    <li
                      key={idx}
                      className="break-words whitespace-normal"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p
                className="text-[14px] leading-relaxed break-words whitespace-pre-wrap"
                style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
              >
                {text}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
