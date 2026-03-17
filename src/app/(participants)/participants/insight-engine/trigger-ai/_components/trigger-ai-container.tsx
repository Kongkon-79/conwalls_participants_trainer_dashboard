/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ai_prompt_image from "../../../../../../../public/assets/images/ai_prompt.png";
import { toast } from "sonner";
import { ChevronsLeft, Copy } from "lucide-react";
import { Language, SystemSettingsResponse } from "./trigger-ai-data-type";
import { useSearchParams } from "next/navigation";
import { ProjectsApiResponse } from "../../../[projectId]/kick-off-story/_components/project-data-type";
import { StakeholderApiResponse } from "../../../[projectId]/kick-off-story/_components/stakeholder-data-type";

const TriggerAiContainer = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const stakeholderId = searchParams.get("stakeholderId");

  const [language, setLanguage] = useState<Language>("en");
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  /* ---------------- SYSTEM SETTINGS ---------------- */

  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    isError: isSettingsError,
  } = useQuery<SystemSettingsResponse>({
    queryKey: ["system-settings-trigger-ai", accessToken],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/system-setting`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch system settings");
      return res.json();
    },
    enabled: !!accessToken,
  });

  /* ---------------- PROJECT DATA ---------------- */

  const { data: projectData } = useQuery<ProjectsApiResponse>({
    queryKey: ["project-data", projectId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/insight-engine/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    enabled: !!accessToken && !!projectId,
  });

  /* ---------------- STAKEHOLDER DATA ---------------- */

  const { data: stakeholderData } = useQuery<StakeholderApiResponse>({
    queryKey: ["stakeholder-data", stakeholderId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stakeholder/single/${stakeholderId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch stakeholder");
      return res.json();
    },
    enabled: !!accessToken && !!stakeholderId,
  });

  const systemSettingsItem = settingsData?.data?.items?.[0];
  const triggerAiPrompts = systemSettingsItem?.triggerAiPrompt ?? [];

  const project = projectData?.data;
  const stakeholder = stakeholderData?.data;

  const isLoading = isLoadingSettings;
  const isError = isSettingsError;

  /* ---------------- COPY PROMPT ---------------- */

  const handleCopyPrompt = async () => {
    const htmlPrompt = triggerAiPrompts
      .map((p) => p.values?.[language] || "")
      .join("\n\n");

    const plainPrompt = htmlPrompt.replace(/<[^>]+>/g, "\n");

    const textToCopy = `
${plainPrompt}

Stakeholder:
${stakeholder?.name || "N/A"}

Project:
${project?.projectTitle || "N/A"}

Vision
${project?.systemForms?.vision || "N/A"}

The past (good old days)
${project?.systemForms?.pastGoodOldDays || "N/A"}

Obstacle / Problem
${project?.systemForms?.obstacleProblem || "N/A"}

Risk of inaction / Consequences
${project?.systemForms?.riskOfInaction || "N/A"}

Solution / Idea
${project?.systemForms?.solutionIdea || "N/A"}
`.trim();

    await navigator.clipboard.writeText(textToCopy);
    toast.success("Prompt copied successfully!");
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load data</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#00253E]">
            <Image
              src={ai_prompt_image}
              width={32}
              height={32}
              alt="ai"
              className="inline mr-2"
            />
            Trigger AI Prompt
          </h1>

          <p className="text-lg text-[#00253E] mt-2">Final Prompt</p>
        </div>

        {/* LANGUAGE SWITCH */}
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 rounded ${
              language === "en" ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
          >
            EN
          </button>

          <button
            onClick={() => setLanguage("de")}
            className={`px-3 py-1 rounded ${
              language === "de" ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
          >
            DE
          </button>
        </div>
      </div>

      {/* PROMPT BOX */}
      {triggerAiPrompts.map((prompt, index) => {
        const htmlContent = prompt.values?.[language] || "";

        if (!htmlContent.trim()) return null;

        return (
          <div
            key={index}
            className="bg-[#EDEDED] border-l-4 border-[#BADA55] rounded-xl p-8 space-y-3 text-sm leading-7"
          >
            <div>
              <div className="text-blue-600 space-y-3">
                {htmlContent
                  .replace(/<[^>]+>/g, "\n")
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <p key={i}>{i === 0 ? line : `${i + 1}. ${line}`}</p>
                  ))}
              </div>
            </div>

            <div>
              <p className="font-semibold">Stakeholder :</p>
              <p className="text-pink-600">{stakeholder?.name || "N/A"}</p>
            </div>

            <div>
              <p className="font-semibold">Project :</p>
              <p className="text-pink-600">{project?.projectTitle || "N/A"}</p>
            </div>

            <div>
              <p className="font-semibold">Vision</p>
              <p className="text-pink-600">
                {project?.systemForms?.vision || "N/A"}
              </p>
            </div>

            <div>
              <p className="font-semibold">The past (good old days)</p>
              <p className="text-pink-600">
                {project?.systemForms?.pastGoodOldDays || "N/A"}
              </p>
            </div>

            <div>
              <p className="font-semibold">Obstacle / Problem</p>
              <p className="text-pink-600">
                {project?.systemForms?.obstacleProblem || "N/A"}
              </p>
            </div>

            <div>
              <p className="font-semibold">Risk of inaction / Consequences</p>
              <p className="text-pink-600">
                {project?.systemForms?.riskOfInaction || "N/A"}
              </p>
            </div>

            <div>
              <p className="font-semibold">Solution / Idea</p>
              <p className="text-pink-600">
                {project?.systemForms?.solutionIdea || "N/A"}
              </p>
            </div>
          </div>
        );
      })}

      {/* BUTTONS */}
      <div className="flex gap-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 border border-[#BADA55] px-6 py-3 rounded"
        >
          <ChevronsLeft size={18} />
          Back
        </button>

        <button
          onClick={handleCopyPrompt}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded"
        >
          <Copy size={18} />
          Copy Prompt
        </button>
      </div>
    </div>
  );
};

export default TriggerAiContainer;