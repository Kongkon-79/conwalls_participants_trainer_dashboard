/* eslint-disable react-hooks/exhaustive-deps */


"use client";

import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import Image from "next/image";
import ai_prompt_image from "../../../../../../../public/assets/images/ai_prompt.png";
import { toast } from "sonner";
import { ChevronsLeft, Copy } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { AiApiResponse } from "./kick-off-story-ai-data-type";
import { ProjectsApiResponse } from "./project-data-type";
import { StakeholderApiResponse } from "./stakeholder-data-type";

const KickOffStoryAiContainer = () => {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;

  const [language, setLanguage] = useState<"en" | "de">("de");

  const searchParams = useSearchParams();

  const selectedType = searchParams.get("type");
  const projectId = searchParams.get("projectId");
  const stakeholderId = searchParams.get("stakeholderId");

  /* ---------------- AI PROMPT ---------------- */

  const { data } = useQuery<AiApiResponse>({
    queryKey: ["kickOffStory-ai"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/system-setting/69a155d6581efd8db0fe3bed`
      );

      if (!res.ok) throw new Error("Failed to fetch data");

      return res.json();
    },
  });

  const measureTypes = data?.data?.measureTypes || [];

  const filteredMeasureTypes = measureTypes.find(
    (item) => item.name === selectedType
  );

  /* ---------------- PROJECT DATA ---------------- */

  const { data: projectData } = useQuery<ProjectsApiResponse>({
    queryKey: ["project-data", projectId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/insight-engine/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch project");

      return res.json();
    },
    enabled: !!token && !!projectId,
  });


  console.log(projectData)
  /* ---------------- STAKEHOLDER DATA ---------------- */

  const { data: stakeholderData } = useQuery<StakeholderApiResponse>({
    queryKey: ["stakeholder-data", stakeholderId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stakeholder/single/${stakeholderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch stakeholder");

      return res.json();
    },
    enabled: !!token && !!stakeholderId,
  });

  console.log(stakeholderData)

  /* ---------------- COPY PROMPT ---------------- */

  const handleCopy = async () => {
    const stakeholder = stakeholderData?.data;
    const project = projectData?.data;
    const systemForms = project?.systemForms;

    const aiPrompt = filteredMeasureTypes?.values?.[language] ?? "";

    const textToCopy = `
${filteredMeasureTypes?.name}
${aiPrompt}

Stakeholder:
${stakeholder?.name}

Project:
${project?.projectTitle}

Vision
${systemForms?.vision}

The past (good old days)
${systemForms?.pastGoodOldDays}

Obstacle / Problem
${systemForms?.obstacleProblem}

Risk of inaction / Consequences
${systemForms?.riskOfInaction}

Solution / Idea
${systemForms?.solutionIdea}

Role
${stakeholder?.roleType}

Trigger Evaluations
${stakeholder?.triggerEvaluation}

Pain Point
${stakeholder?.painPoint}

Benefits
${stakeholder?.benefits}

Objections / Concerns
${stakeholder?.objectionsConcerns}

Objection Handling
${stakeholder?.objectionHandling}

Call to Action
${stakeholder?.callToAction}
`;

    await navigator.clipboard.writeText(textToCopy);

    toast.success("Prompt copied successfully!");
  };

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
            Kick Off Story
          </h1>

          <p className="text-lg text-[#00253E] mt-2">
            Final Prompt
          </p>
        </div>

        {/* LANGUAGE SWITCH */}

        <div className="flex gap-2">
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 rounded ${
              language === "en"
                ? "bg-green-500 text-white"
                : "bg-gray-200"
            }`}
          >
            EN
          </button>

          <button
            onClick={() => setLanguage("de")}
            className={`px-3 py-1 rounded ${
              language === "de"
                ? "bg-green-500 text-white"
                : "bg-gray-200"
            }`}
          >
            DE
          </button>
        </div>
      </div>

      {/* PROMPT BOX */}

      <div className="bg-[#EDEDED] border-l-4 border-[#BADA55] rounded-xl p-8 space-y-3 text-sm leading-7">

        {/* AI PROMPT FIRST */}

        <div>
          <p className="font-semibold text-black">
            {filteredMeasureTypes?.name}
          </p>

          <p className="text-blue-600 whitespace-pre-line">
            {filteredMeasureTypes?.values?.[language]}
          </p>
        </div>

        {/* Stakeholder */}

        <div>
          <p className="font-semibold">Stakeholder :</p>
          <p className="text-pink-600">
            {stakeholderData?.data?.name || "N/A"}
          </p>
        </div>

        {/* Project */}

        <div>
          <p className="font-semibold">Project :</p>
          <p className="text-pink-600">
            {projectData?.data?.projectTitle || "N/A"}
          </p>
        </div>

        {/* Vision */}

        <div>
          <p className="font-semibold">Vision</p>
          <p className="text-pink-600">
            {projectData?.data?.systemForms?.vision || "N/A"}
          </p>
        </div>

        <div>
          <p className="font-semibold">
            The past (good old days)
          </p>
          <p className="text-pink-600">
            {projectData?.data?.systemForms?.pastGoodOldDays || "N/A"}
          </p>
        </div>

        <div>
          <p className="font-semibold">
            Obstacle / Problem
          </p>
          <p className="text-pink-600">
            {projectData?.data?.systemForms?.obstacleProblem || "N/A"}
          </p>
        </div>

        <div>
          <p className="font-semibold">
            Risk of inaction / Consequences
          </p>
          <p className="text-pink-600">
            {projectData?.data?.systemForms?.riskOfInaction || "N/A"}
          </p>
        </div>

        <div>
          <p className="font-semibold">
            Solution / Idea
          </p>
          <p className="text-pink-600">
            {projectData?.data?.systemForms?.solutionIdea || "N/A"}
          </p>
        </div>

        <div>
          <p className="font-semibold">
            Role
          </p>
          <p className="text-pink-600">
            {stakeholderData?.data?.roleType || "N/A"}
          </p>
        </div>

        <div>
          <p className="font-semibold">
            Trigger Evaluations
          </p>
          <p className="text-pink-600">
            {stakeholderData?.data?.triggerEvaluation || "N/A"}
          </p>
        </div>

        <div>
          <p className="font-semibold">
            Pain Point
          </p>
          <p className="text-pink-600">
            {stakeholderData?.data?.painPoint || "N/A"}
          </p>
        </div>

        <div>
          <p className="font-semibold">
            Benefits
          </p>
          <p className="text-pink-600">
            {stakeholderData?.data?.benefits || "N/A"}
          </p>
        </div>

        <div>
          <p className="font-semibold">
            Objections / Concerns
          </p>
          <p className="text-pink-600">
            {stakeholderData?.data?.objectionsConcerns || "N/A"}
          </p>
        </div>

        <div>
          <p className="font-semibold">
            Objection Handling
          </p>
          <p className="text-pink-600">
            {stakeholderData?.data?.objectionHandling || "N/A"}
          </p>
        </div>

        <div>
          <p className="font-semibold">
            Call to Action
          </p>
          <p className="text-pink-600">
            {stakeholderData?.data?.callToAction || "N/A"}
          </p>
        </div>
      </div>

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
          onClick={handleCopy}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded"
        >
          <Copy size={18} />
          Copy Prompt
        </button>
      </div>
    </div>
  );
};

export default KickOffStoryAiContainer;
