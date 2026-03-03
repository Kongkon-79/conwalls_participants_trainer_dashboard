"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronsRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSystemSettings } from "@/hooks/use-system-settings";
import { Stakeholder } from "./stakeholder-types";
import aiIcon from "../../../../../../public/assets/images/ai.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import Image from "next/image";

interface TriggerFormProps {
  stakeholder: Stakeholder;
  onBack: () => void;
}

type TriggerFormValues = {
  roleType: string;
  painPoint: string;
  benefits: string;
  triggerEvaluation: string;
  objectionsConcerns: string;
  objectionHandling: string;
};

export default function TriggerForm({ stakeholder, onBack }: TriggerFormProps) {
  const session = useSession();
  const token = (session?.data?.user as { accessToken?: string })?.accessToken;
  const queryClient = useQueryClient();

  // Use the same helpText fetching logic based on global language/cookie if needed
  const { data: systemSettings } = useSystemSettings();

  console.log(systemSettings)

  const getHelpText = (name: string) => {
    const helptexts = systemSettings?.helpTexts || [];

    const help = helptexts.find(
      (h: { name: string; values?: { en?: string } }) => h.name === name,
    );
    return help?.values?.en || "";
  };

  const { register, handleSubmit, setValue, watch } =
    useForm<TriggerFormValues>({
      defaultValues: {
        roleType: stakeholder.roleType || "",
        painPoint: stakeholder.painPoint || "",
        benefits: stakeholder.benefits || "",
        triggerEvaluation: stakeholder.triggerEvaluation || "",
        objectionsConcerns: stakeholder.objectionsConcerns || "",
        objectionHandling: stakeholder.objectionHandling || "",
      },
    });

  const roleValue = watch("roleType");
  const triggerEvalValue = watch("triggerEvaluation");

  const updateMutation = useMutation({
    mutationFn: async (values: TriggerFormValues) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stakeholder/single/${stakeholder._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        },
      );
      if (!res.ok) throw new Error("Failed to update trigger info");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Trigger info saved successfully");
      queryClient.invalidateQueries({
        queryKey: ["stakeholders", stakeholder.insightEngineId],
      });
      onBack();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  const onSubmit = (values: TriggerFormValues) => {
    updateMutation.mutate(values);
  };

  const roleTypes = systemSettings?.roleTypes || [];

  return (
    <div className="w-full space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-[32px] font-semibold text-[#00253E]">
          Trigger Details for {stakeholder.name}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Role Type */}
        <div className="space-y-3">
          <label className="text-[20px] font-medium text-[#00253E]">Role</label>
          <Select
            value={roleValue}
            onValueChange={(v) => setValue("roleType", v)}
          >
            <SelectTrigger className="w-full max-w-sm h-[48px] border-[#00253E]/20 text-[18px]">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {roleTypes.map((r) => (
                <SelectItem key={r.name} value={r.name}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pain Point */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-[20px] font-medium text-[#00253E]">
              Pain point
            </label>
            <HelpIcon text={getHelpText("Pain point")} />
          </div>
          <Textarea
            {...register("painPoint")}
            placeholder="What's their Pain point?"
            className="min-h-[100px] border-[#00253E]/20 rounded-[4px] focus-visible:ring-primary shadow-sm text-[16px]"
          />
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-[20px] font-medium text-[#00253E]">
              Benefits
            </label>
            <HelpIcon text={getHelpText("Benefits")} />
          </div>
          <Textarea
            {...register("benefits")}
            placeholder="What's benefits they will get"
            className="min-h-[100px] border-[#00253E]/20 rounded-[4px] focus-visible:ring-primary shadow-sm text-[16px]"
          />
        </div>

        <div className="space-y-3 pt-4">
          <label className="text-[20px] font-medium text-[#00253E]">
            Trigger Evaluation
          </label>
          <RadioGroup
            className="flex gap-6 pt-2"
            value={triggerEvalValue}
            onValueChange={(v: string) => setValue("triggerEvaluation", v)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="LOW_POINTS"
                id="low"
                className="text-primary border-primary w-5 h-5"
              />
              <label
                htmlFor="low"
                className="text-[18px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Low points
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="HIGH_POINTS"
                id="high"
                className="text-primary border-primary w-5 h-5"
              />
              <label
                htmlFor="high"
                className="text-[18px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                High points
              </label>
            </div>
          </RadioGroup>
        </div>

        {/* Objections */}
        <div className="space-y-3 pt-4">
          {/* <div className="flex items-center gap-2">
            <label className="text-[20px] font-medium text-[#00253E]">
              Objections / Concerns
            </label>
            <HelpIcon text={getHelpText("Objections / Concerns")} />
          </div> */}

          <div className="flex items-center gap-2">
            <label className="text-[20px] font-medium text-[#00253E]">
              Objections / Concerns
            </label>
            <HelpIcon text={getHelpText("Objections/Concerns")} />
          </div>
          <Textarea
            {...register("objectionsConcerns")}
            placeholder="What are their concerns?"
            className="min-h-[100px] border-[#00253E]/20 rounded-[4px] focus-visible:ring-primary shadow-sm text-[18px]"
          />
        </div>

        {/* Objection Handling */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <label className="text-[20px] font-medium text-[#00253E]">
              Objection Handling
            </label>
            <HelpIcon text={getHelpText("Objection Handling")} />
          </div>
          <Textarea
            {...register("objectionHandling")}
            placeholder="How will you address their concerns?"
            className="min-h-[100px] border-[#00253E]/20 rounded-[4px] focus-visible:ring-primary shadow-sm text-[18px]"
          />
        </div>

        <div className="w-full flex items-center justify-end">
          <Link
            href={`/participants/insight-engine/trigger-ai`}
          >
            <button className="flex items-center gap-1 bg-[#00253E] rounded-[8px] py-4 px-6 text-base text-white leading-[110%] font-medium">
              <Image
                src={aiIcon}
                alt="AI Icon"
                className="w-5 h-5 mr-2 object-contain"
              />{" "}
              AI <ChevronsRight className="w-5 h-5" />
            </button>
          </Link>
        </div>

        <div className="flex items-center gap-4 pt-0">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-[48px] px-8 rounded-[8px] flex items-center gap-2 border-[#00253E]/20 text-[#00253E] hover:bg-gray-50 bg-white"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </Button>

          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-[#B5CC2E] hover:bg-[#A3B829] text-[#00253E] px-8 h-[48px] rounded-[8px] flex items-center gap-2 font-semibold transition-all duration-200"
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// function HelpIcon({ text }: { text: string }) {
//   if (!text) return null;
//   return (
//     <TooltipProvider delayDuration={0}>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <button type="button" className="outline-none">
//             <Info className="w-5 h-5 text-[#00253E]/60 hover:text-[#00253E] cursor-pointer" />
//           </button>
//         </TooltipTrigger>
//         <TooltipContent
//           side="top"
//           align="start"
//           className="max-w-[400px] bg-[#00253E] text-white p-3 rounded-[4px] shadow-2xl border-t-4 border-primary animate-in fade-in slide-in-from-bottom-2"
//         >
//           <div className="flex gap-3">
//             <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
//             <p className="text-[14px] leading-relaxed">{text}</p>
//           </div>
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   );
// }



function HelpIcon({ text }: { text: string }) {
  if (!text) return null;

  // Handle both bullets "•" and line breaks "\n"
  const normalized = text.replace(/\r\n/g, "\n").trim();

  // Split by bullet symbol
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
            <Info className="w-5 h-5 text-[#00253E]/60 hover:text-[#00253E] cursor-pointer" />
          </button>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          align="start"
          sideOffset={8}
          // ✅ Force wrap (Radix tooltip uses nowrap by default sometimes)
          style={{ whiteSpace: "normal" }}
          className="max-w-[400px] bg-[#00253E] text-white p-3 rounded-[4px] shadow-2xl border-t-4 border-primary animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />

            {hasBullets ? (
              <div className="text-[14px] leading-relaxed whitespace-normal break-words">
                {/* Intro text before first bullet */}
                <p className="mb-2 whitespace-normal break-words">
                  {parts[0]}
                </p>

                <ul className="list-disc pl-5 space-y-1">
                  {parts.slice(1).map((item, idx) => (
                    <li
                      key={idx}
                      className="whitespace-normal break-words"
                      style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p
                className="text-[14px] leading-relaxed whitespace-pre-wrap break-words"
                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
              >
                {normalized}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
