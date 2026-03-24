/* eslint-disable @typescript-eslint/no-unused-vars */
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
import penIcon from "../../../../../../public/assets/images/pen.png";
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
import { RiInformationFill } from "react-icons/ri";
import { parseCookies } from "nookies";

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
  callToAction: string;
};

const COOKIE_NAME = "googtrans";

export default function TriggerForm({ stakeholder, onBack }: TriggerFormProps) {
  const session = useSession();
  const token = (session?.data?.user as { accessToken?: string })?.accessToken;
  const queryClient = useQueryClient();

  const cookie = parseCookies()[COOKIE_NAME];
  const lang = cookie?.split("/")?.[2] || "de";

  const projectId = stakeholder?.insightEngineId;
  const stakeholderId = stakeholder?._id;

  const { data: systemSettings } = useSystemSettings();

  const { register, handleSubmit, setValue, watch } =
    useForm<TriggerFormValues>({
      defaultValues: {
        roleType: stakeholder.roleType || "",
        painPoint: stakeholder.painPoint || "",
        benefits: stakeholder.benefits || "",
        triggerEvaluation: stakeholder.triggerEvaluation || "",
        objectionsConcerns: stakeholder.objectionsConcerns || "",
        objectionHandling: stakeholder.objectionHandling || "",
        callToAction: stakeholder.callToAction || "",
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update trigger info");
      }

      return data;
    },
    onSuccess: () => {
      toast.success(
        lang === "de"
          ? "Trigger-Informationen erfolgreich gespeichert"
          : "Trigger info saved successfully",
      );
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
  const stakeholderHelpTexts = systemSettings?.stakeholderHelpTexts || [];

  const getLocalizedLabel = (item?: {
    name: string;
    labels?: { en: string; de: string };
  }) => {
    if (!item) return "";
    return lang === "de"
      ? item.labels?.de || item.labels?.en || item.name
      : item.labels?.en || item.name;
  };

  const getStakeholderHelpText = (name: string) => {
    const helpText = stakeholderHelpTexts.find((item) => item.name === name);
    return helpText?.values?.[lang as "en" | "de"] || helpText?.values?.en || "";
  };

  return (
    <div
      key={lang}
      className="w-full space-y-8 pb-10 notranslate"
      translate="no"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 notranslate"
        translate="no"
      >
        {/* Role Type */}
        <div className="space-y-3 notranslate" translate="no">
          <label className="text-[20px] font-medium text-[#00253E]">
            <span>{lang === "de" ? "Rolle" : "Role"}</span>
          </label>

          <Select
            value={roleValue}
            onValueChange={(v) => setValue("roleType", v)}
          >
            <SelectTrigger className="w-[280px] !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[54px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl">
              <SelectValue
                placeholder={lang === "de" ? "Typ auswählen" : "Select Type"}
              />
            </SelectTrigger>

            <SelectContent className="bg-white">
              {roleTypes.map((r: { name: string; labels?: { en: string; de: string } }) => (
                <SelectItem key={r.name} value={r.name}>
                  <span>{getLocalizedLabel(r)}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pain Point */}
        <div className="space-y-3 notranslate" translate="no">
          <div className="flex items-center gap-2">
            <Image src={penIcon} alt="Pen Icon" width={22} height={22} />
            <label className="text-[20px] font-medium text-[#00253E]">
              <span>{lang === "de" ? "Schmerzpunkt" : "Pain point"}</span>
            </label>
            <HelpIcon text={getStakeholderHelpText("Pain point")} />
          </div>

          <Textarea
            {...register("painPoint")}
            placeholder={
              lang === "de"
                ? "Was ist ihr Schmerzpunkt?"
                : "What's their Pain point?"
            }
            className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] placeholder:text-[#616161] font-normal leading-[110%] text-lg md:text-xl"
          />
        </div>

        {/* Benefits */}
        <div className="space-y-3 notranslate" translate="no">
          <div className="flex items-center gap-2">
            <Image src={penIcon} alt="Pen Icon" width={22} height={22} />
            <label className="text-[20px] font-medium text-[#00253E]">
              <span>{lang === "de" ? "Vorteile" : "Benefits"}</span>
            </label>
            <HelpIcon text={getStakeholderHelpText("Benefits")} />
          </div>

          <Textarea
            {...register("benefits")}
            placeholder={
              lang === "de"
                ? "Welche Vorteile erhalten sie?"
                : "What benefits they will get"
            }
            className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] placeholder:text-[#616161] font-normal leading-[110%] text-lg md:text-xl"
          />
        </div>

        {/* Trigger Evaluation */}
        <div className="space-y-3 notranslate" translate="no">
          <div className="flex items-center gap-2">
            <label className="text-[20px] font-medium text-[#00253E]">
              <span>
                {lang === "de" ? "Trigger-Bewertung" : "Trigger Evaluations"}
              </span>
            </label>
            <HelpIcon text={getStakeholderHelpText("Trigger Evaluations")} />
          </div>

          <RadioGroup
            className={`${lang === "de" ? "w-[355px]" : "w-[300px]"} h-[54px]  flex gap-6 border border-primary rounded-[8px] px-4`}
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
                <span>{lang === "de" ? "Niedrige Punkte" : "Low points"}</span>
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
                <span>{lang === "de" ? "Hohe Punkte" : "High points"}</span>
              </label>
            </div>
          </RadioGroup>
        </div>

        {/* Objections / Concerns */}
        <div className="space-y-3 notranslate" translate="no">
          <div className="flex items-center gap-2">
            <Image src={penIcon} alt="Pen Icon" width={22} height={22} />
            <label className="text-[20px] font-medium text-[#00253E]">
              <span>
                {lang === "de"
                  ? "Einwände / Bedenken"
                  : "Objections / Concerns"}
              </span>
            </label>
            <HelpIcon text={getStakeholderHelpText("Objections / Concerns")} />
          </div>

          <Textarea
            {...register("objectionsConcerns")}
            placeholder={
              lang === "de"
                ? "Was sind ihre Bedenken?"
                : "What are their concerns?"
            }
            className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] placeholder:text-[#616161] font-normal leading-[110%] text-lg md:text-xl"
          />
        </div>

        {/* Objection Handling */}
        <div className="space-y-3 notranslate" translate="no">
          <div className="flex items-center gap-2">
            <Image src={penIcon} alt="Pen Icon" width={22} height={22} />
            <label className="text-[20px] font-medium text-[#00253E]">
              <span>
                {lang === "de" ? "Einspruchsbearbeitung" : "Objection Handling"}
              </span>
            </label>
            <HelpIcon text={getStakeholderHelpText("Objection Handling")} />
          </div>

          <Textarea
            {...register("objectionHandling")}
            placeholder={
              lang === "de"
                ? "Wie werden Sie auf ihre Bedenken eingehen?"
                : "How will you address their concerns?"
            }
            className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] placeholder:text-[#616161] font-normal leading-[110%] text-lg md:text-xl"
          />
        </div>

        {/* Call to Action */}
        <div className="space-y-3 notranslate" translate="no">
          <div className="flex items-center gap-2">
            <Image src={penIcon} alt="Pen Icon" width={22} height={22} />
            <label className="text-[20px] font-medium text-[#00253E]">
              <span>
                {lang === "de" ? "Aufruf zum Handeln" : "Call to Action"}
              </span>
            </label>
            <HelpIcon text={getStakeholderHelpText("Call to Action")} />
          </div>

          <Textarea
            {...register("callToAction")}
            placeholder={
              lang === "de"
                ? "Was ist der nächste Schritt?"
                : "How will you address their concerns?"
            }
            className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] placeholder:text-[#616161] font-normal leading-[110%] text-lg md:text-xl"
          />
        </div>

        {/* AI Button */}
        <div
          className="w-full flex items-center justify-end notranslate"
          translate="no"
        >
          <Link
            href={{
              pathname: `/participants/insight-engine/trigger-ai`,
              query: {
                projectId,
                stakeholderId,
              },
            }}
            className="flex items-center gap-1 bg-[#00253E] rounded-[8px] py-4 px-6 text-base text-white leading-[110%] font-medium"
            translate="no"
          >
            <Image
              src={aiIcon}
              alt="AI Icon"
              className="w-5 h-5 mr-2 object-contain"
            />
            <span>AI</span>
            <ChevronsRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Bottom Buttons */}
        <div
          className="flex items-center gap-4 pt-0 notranslate"
          translate="no"
        >
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-[48px] px-8 rounded-[8px] flex items-center gap-2 border-primary font-medium text-[#00253E] hover:bg-gray-50 bg-white"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>{lang === "de" ? "Zurück" : "Back"}</span>
          </Button>

          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-[#B5CC2E] hover:bg-[#A3B829] text-[#00253E] px-8 h-[48px] rounded-[8px] flex items-center gap-2 font-semibold transition-all duration-200"
          >
            <span>
              {updateMutation.isPending
                ? lang === "de"
                  ? "Speichern..."
                  : "Saving..."
                : lang === "de"
                  ? "Speichern"
                  : "Save"}
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}

function HelpIcon({ text }: { text: string }) {
  if (!text) return null;

  const normalized = text.replace(/\r\n/g, "\n").trim();

  const parts = normalized
    .split("•")
    .map((s) => s.trim())
    .filter(Boolean);

  const hasBullets = parts.length > 1;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="outline-none notranslate"
            translate="no"
          >
            <RiInformationFill className="w-5 h-5 text-[#00253E] cursor-pointer" />
          </button>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          align="start"
          sideOffset={8}
          style={{ whiteSpace: "normal" }}
          className="max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl bg-[#00253E] text-white p-3 rounded-[4px] shadow-2xl border-t-4 border-primary animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />

            {hasBullets ? (
              <div className="text-[14px] leading-relaxed whitespace-normal break-words">
                <p className="mb-2 whitespace-normal break-words">{parts[0]}</p>

                <ul className="list-disc pl-5 space-y-1">
                  {parts.slice(1).map((item, idx) => (
                    <li
                      key={idx}
                      className="whitespace-normal break-words"
                      style={{
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                      }}
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

// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";

// import React from "react";
// import { useForm } from "react-hook-form";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useSession } from "next-auth/react";
// import { ChevronLeft, ChevronsRight, Info } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "sonner";
// import { useSystemSettings } from "@/hooks/use-system-settings";
// import { Stakeholder } from "./stakeholder-types";
// import penIcon from "../../../../../../public/assets/images/pen.png";
// import aiIcon from "../../../../../../public/assets/images/ai.png";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import Link from "next/link";
// import Image from "next/image";
// import { RiInformationFill } from "react-icons/ri";
// import { parseCookies } from "nookies";

// interface TriggerFormProps {
//   stakeholder: Stakeholder;
//   onBack: () => void;
// }

// type TriggerFormValues = {
//   roleType: string;
//   painPoint: string;
//   benefits: string;
//   triggerEvaluation: string;
//   objectionsConcerns: string;
//   objectionHandling: string;
//   callToAction: string;
// };

// const COOKIE_NAME = "googtrans";

// export default function TriggerForm({ stakeholder, onBack }: TriggerFormProps) {
//   const session = useSession();
//   const token = (session?.data?.user as { accessToken?: string })?.accessToken;
//   const queryClient = useQueryClient();

//   const cookie = parseCookies()[COOKIE_NAME];
//   const lang = cookie?.split("/")?.[2] || "en";

//   const projectId = stakeholder?.insightEngineId;
//   const stakeholderId = stakeholder?._id;

//   // Use the same helpText fetching logic based on global language/cookie if needed
//   const { data: systemSettings } = useSystemSettings();

//   console.log(systemSettings);

//   // const getHelpText = (name: string) => {
//   //   const helptexts = systemSettings?.helpTexts || [];

//   //   const help = helptexts.find(
//   //     (h: { name: string; values?: { en?: string } }) => h.name === name,
//   //   );
//   //   return help?.values?.en || "";
//   // };

//   const { register, handleSubmit, setValue, watch } =
//     useForm<TriggerFormValues>({
//       defaultValues: {
//         roleType: stakeholder.roleType || "",
//         painPoint: stakeholder.painPoint || "",
//         benefits: stakeholder.benefits || "",
//         triggerEvaluation: stakeholder.triggerEvaluation || "",
//         objectionsConcerns: stakeholder.objectionsConcerns || "",
//         objectionHandling: stakeholder.objectionHandling || "",
//         callToAction: stakeholder.callToAction || "",
//       },
//     });

//   const roleValue = watch("roleType");
//   const triggerEvalValue = watch("triggerEvaluation");

//   const updateMutation = useMutation({
//     mutationFn: async (values: TriggerFormValues) => {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/stakeholder/single/${stakeholder._id}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(values),
//         },
//       );
//       if (!res.ok) throw new Error("Failed to update trigger info");
//       return res.json();
//     },
//     onSuccess: () => {
//       toast.success("Trigger info saved successfully");
//       queryClient.invalidateQueries({
//         queryKey: ["stakeholders", stakeholder.insightEngineId],
//       });
//       onBack();
//     },
//     onError: (err: Error) => {
//       toast.error(err.message || "Something went wrong");
//     },
//   });

//   const onSubmit = (values: TriggerFormValues) => {
//     updateMutation.mutate(values);
//   };

//   const roleTypes = systemSettings?.roleTypes || [];

//   return (
//     <div
//       key={lang}
//       className="w-full space-y-8 pb-10 notranslate"
//       translate="no"
//     >
//       {/* <div className="space-y-2">
//         <h1 className="text-[32px] font-semibold text-[#00253E]">
//           Trigger Details for {stakeholder.name}
//         </h1>
//       </div> */}

//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="space-y-4 notranslate"
//         translate="no"
//       >
//         {/* Role Type */}
//         {/* <div className="space-y-3">
//           <label className="text-[20px] font-medium text-[#00253E]">Role</label>
//           <Select
//             value={roleValue}
//             onValueChange={(v) => setValue("roleType", v)}
//           >
//             <SelectTrigger className="w-[280px] !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[54px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl">
//               <SelectValue placeholder="Select Type" />
//             </SelectTrigger>
//             <SelectContent className="bg-white">
//               {roleTypes.map((r) => (
//                 <SelectItem key={r.name} value={r.name}>
//                   {r.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div> */}

//         <div className="space-y-3 notranslate" translate="no">
//           <label className="text-[20px] font-medium text-[#00253E]">
//             {lang === "de" ? "Rolle" : "Role"}
//           </label>
//           <Select
//             value={roleValue}
//             onValueChange={(v) => setValue("roleType", v)}
//           >
//             <SelectTrigger className="w-[280px] !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[54px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl">
//               <SelectValue
//                 placeholder={lang === "de" ? "Typ auswählen" : "Select Type"}
//               />
//             </SelectTrigger>
//             <SelectContent className="bg-white">
//               {roleTypes.map((r) => (
//                 <SelectItem key={r.name} value={r.name}>
//                   <span>{r.name}</span>
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Pain Point */}
//         <div className="space-y-3">
//           <div className="flex items-center gap-2">
//             <Image src={penIcon} alt="Pen Icon" width={22} height={22} />
//             <label className="text-[20px] font-medium text-[#00253E]">
//               <span>{lang === "de" ? "Schmerzpunkt" : "Pain point"}</span>
//             </label>
//             {/* <HelpIcon text={getHelpText("Pain point")} /> */}
//           </div>
//           <Textarea
//             {...register("painPoint")}
//             placeholder="What's their Pain point?"
//             className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] placeholder:text-[#616161] font-normal leading-[110%] text-lg md:text-xl"
//           />
//         </div>

//         {/* Benefits */}
//         <div className="space-y-3">
//           <div className="flex items-center gap-2">
//             <Image src={penIcon} alt="Pen Icon" width={22} height={22} />
//             <label className="text-[20px] font-medium text-[#00253E]">
//               Benefits
//             </label>
//             {/* <HelpIcon text={getHelpText("Benefits")} /> */}
//           </div>
//           <Textarea
//             {...register("benefits")}
//             placeholder="What's benefits they will get"
//             className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] placeholder:text-[#616161] font-normal leading-[110%] text-lg md:text-xl"
//           />
//         </div>

//         <div className="space-y-3">
//           <label className="notranslate text-[20px] font-medium text-[#00253E]">
//             Trigger Evaluations
//           </label>
//           <RadioGroup
//             className="h-[54px] w-[300px] flex gap-6 border border-primary rounded-[8px] px-4"
//             value={triggerEvalValue}
//             onValueChange={(v: string) => setValue("triggerEvaluation", v)}
//           >
//             <div className="flex items-center space-x-2">
//               <RadioGroupItem
//                 value="LOW_POINTS"
//                 id="low"
//                 className="text-primary border-primary w-5 h-5"
//               />
//               <label
//                 htmlFor="low"
//                 className="notranslate text-[18px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//               >
//                 Low points
//               </label>
//             </div>
//             <div className="flex items-center space-x-2">
//               <RadioGroupItem
//                 value="HIGH_POINTS"
//                 id="high"
//                 className="text-primary border-primary w-5 h-5"
//               />
//               <label
//                 htmlFor="high"
//                 className="notranslate text-[18px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//               >
//                 High points
//               </label>
//             </div>
//           </RadioGroup>
//         </div>

//         {/* Objections */}
//         <div className="space-y-3">
//           {/* <div className="flex items-center gap-2">
//             <label className="text-[20px] font-medium text-[#00253E]">
//               Objections / Concerns
//             </label>
//             <HelpIcon text={getHelpText("Objections / Concerns")} />
//           </div> */}

//           <div className="flex items-center gap-2">
//             <Image src={penIcon} alt="Pen Icon" width={22} height={22} />
//             <label className="text-[20px] font-medium text-[#00253E]">
//               Objections / Concerns
//             </label>
//             {/* <HelpIcon text={getHelpText("Objections/Concerns")} /> */}
//           </div>
//           <Textarea
//             {...register("objectionsConcerns")}
//             placeholder="What are their concerns?"
//             className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] placeholder:text-[#616161] font-normal leading-[110%] text-lg md:text-xl"
//           />
//         </div>

//         {/* Objection Handling */}
//         <div className="space-y-3 ">
//           <div className="flex items-center gap-2">
//             <Image src={penIcon} alt="Pen Icon" width={22} height={22} />
//             <label className="text-[20px] font-medium text-[#00253E]">
//               Objection Handling
//             </label>
//             {/* <HelpIcon text={getHelpText("Objection Handling")} /> */}
//           </div>
//           <Textarea
//             {...register("objectionHandling")}
//             placeholder="How will you address their concerns?"
//             className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] placeholder:text-[#616161] font-normal leading-[110%] text-lg md:text-xl"
//           />
//         </div>

//         {/* call to action Handling */}
//         <div className="space-y-3 ">
//           <div className="flex items-center gap-2">
//             <Image src={penIcon} alt="Pen Icon" width={22} height={22} />
//             <label className="text-[20px] font-medium text-[#00253E]">
//               Call to Action
//             </label>
//             {/* <HelpIcon text={getHelpText("callToAction")} /> */}
//           </div>
//           <Textarea
//             {...register("callToAction")}
//             placeholder="How will you address their concerns?"
//             className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[90px] text-[#00253E] placeholder:text-[#616161] font-normal leading-[110%] text-lg md:text-xl"
//           />
//         </div>

//         {/* <div className="w-full flex items-center justify-end">
//           <Link
//             //  href={`/participants/insight-engine/trigger-ai`}

//             href={{
//               pathname: `/participants/insight-engine/trigger-ai`,
//               query: {
//                 projectId: projectId,
//                 stakeholderId: stakeholderId,
//                 // type: typeValue,
//               },
//             }}
//           >
//             <button className="flex items-center gap-1 bg-[#00253E] rounded-[8px] py-4 px-6 text-base text-white notranslate leading-[110%] font-medium">
//               <Image
//                 src={aiIcon}
//                 alt="AI Icon"
//                 className="w-5 h-5 mr-2 object-contain"
//               />{" "}
//               AI <ChevronsRight className="w-5 h-5" />
//             </button>
//           </Link>
//         </div> */}

//         <div
//           className="w-full flex items-center justify-end notranslate"
//           translate="no"
//         >
//           <Link
//             href={{
//               pathname: `/participants/insight-engine/trigger-ai`,
//               query: {
//                 projectId,
//                 stakeholderId,
//               },
//             }}
//             className="flex items-center gap-1 bg-[#00253E] rounded-[8px] py-4 px-6 text-base text-white leading-[110%] font-medium"
//             translate="no"
//           >
//             <Image
//               src={aiIcon}
//               alt="AI Icon"
//               className="w-5 h-5 mr-2 object-contain"
//             />
//             <span>AI</span>
//             <ChevronsRight className="w-5 h-5" />
//           </Link>
//         </div>

//         {/* <div className="flex items-center gap-4 pt-0">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={onBack}
//             className="h-[48px] px-8 rounded-[8px] flex items-center gap-2 border-primary font-medium text-[#00253E] hover:bg-gray-50 bg-white notranslate"
//           >
//             <ChevronLeft className="w-5 h-5" />

//              {lang === "de" ? "Zurück" : "Back"}
//           </Button>

//           <Button
//             type="submit"
//             disabled={updateMutation.isPending}
//             className="bg-[#B5CC2E] hover:bg-[#A3B829] text-[#00253E] px-8 h-[48px] rounded-[8px] flex items-center gap-2 font-semibold transition-all duration-200"
//           >
//             {updateMutation.isPending ? "Saving..." : "Save"}
//           </Button>
//         </div> */}

//         <div
//           className="flex items-center gap-4 pt-0 notranslate"
//           translate="no"
//         >
//           <Button
//             type="button"
//             variant="outline"
//             onClick={onBack}
//             className="h-[48px] px-8 rounded-[8px] flex items-center gap-2 border-primary font-medium text-[#00253E] hover:bg-gray-50 bg-white"
//           >
//             <ChevronLeft className="w-5 h-5" />
//             <span>{lang === "de" ? "Zurück" : "Back"}</span>
//           </Button>

//           <Button
//             type="submit"
//             disabled={updateMutation.isPending}
//             className="bg-[#B5CC2E] hover:bg-[#A3B829] text-[#00253E] px-8 h-[48px] rounded-[8px] flex items-center gap-2 font-semibold transition-all duration-200"
//           >
//             <span>
//               {updateMutation.isPending
//                 ? lang === "de"
//                   ? "Speichern..."
//                   : "Saving..."
//                 : lang === "de"
//                   ? "Speichern"
//                   : "Save"}
//             </span>
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }

// function HelpIcon({ text }: { text: string }) {
//   if (!text) return null;

//   // Handle both bullets "•" and line breaks "\n"
//   const normalized = text.replace(/\r\n/g, "\n").trim();

//   // Split by bullet symbol
//   const parts = normalized
//     .split("•")
//     .map((s) => s.trim())
//     .filter(Boolean);

//   const hasBullets = parts.length > 1;

//   return (
//     <TooltipProvider delayDuration={0}>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <button type="button" className="outline-none">
//             <RiInformationFill className="w-5 h-5 text-[#00253E] cursor-pointer" />
//           </button>
//         </TooltipTrigger>

//         <TooltipContent
//           side="top"
//           align="start"
//           sideOffset={8}
//           // ✅ Force wrap (Radix tooltip uses nowrap by default sometimes)
//           style={{ whiteSpace: "normal" }}
//           className="max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl bg-[#00253E] text-white p-3 rounded-[4px] shadow-2xl border-t-4 border-primary animate-in fade-in slide-in-from-bottom-2"
//         >
//           <div className="flex gap-3">
//             <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />

//             {hasBullets ? (
//               <div className="text-[14px] leading-relaxed whitespace-normal break-words">
//                 {/* Intro text before first bullet */}
//                 <p className="mb-2 whitespace-normal break-words">{parts[0]}</p>

//                 <ul className="list-disc pl-5 space-y-1">
//                   {parts.slice(1).map((item, idx) => (
//                     <li
//                       key={idx}
//                       className="whitespace-normal break-words"
//                       style={{
//                         overflowWrap: "anywhere",
//                         wordBreak: "break-word",
//                       }}
//                     >
//                       {item}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             ) : (
//               <p
//                 className="text-[14px] leading-relaxed whitespace-pre-wrap break-words"
//                 style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
//               >
//                 {normalized}
//               </p>
//             )}
//           </div>
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   );
// }
