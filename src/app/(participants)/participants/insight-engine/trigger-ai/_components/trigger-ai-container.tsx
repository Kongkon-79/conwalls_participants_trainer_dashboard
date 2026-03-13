/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useQuery } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import ai_prompt_image from '../../../../../../../public/assets/images/ai_prompt.png'
import { toast } from 'sonner'
import { ChevronsLeft, Copy } from 'lucide-react'
import {
  FilteredHelpTextsResponse,
  Language,
  SystemSettingsResponse,
} from './trigger-ai-data-type'

const SYSTEM_SETTING_ID = '69a155d6581efd8db0fe3bed'

const TriggerAiContainer = () => {
  const [language, setLanguage] = useState<Language>('en')
  const { data: session } = useSession()
  const accessToken = session?.user?.accessToken

  // Fetch Filtered Help Texts
  const {
    data: filteredData,
    isLoading: isLoadingFiltered,
    isError: isErrorFiltered,
  } = useQuery<FilteredHelpTextsResponse>({
    queryKey: ['filtered-helptexts', SYSTEM_SETTING_ID, accessToken],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/system-setting/${SYSTEM_SETTING_ID}/filtered-helptexts`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      if (!res.ok) throw new Error('Failed to fetch data')
      return res.json()
    },
    enabled: !!accessToken,
  })

  // Fetch Full System Settings (to get triggerAiPrompt)
  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    isError: isSettingsError,
  } = useQuery<SystemSettingsResponse>({
    queryKey: ['system-settings-trigger-ai', accessToken],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/system-setting`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      if (!res.ok) throw new Error('Failed to fetch system settings')
      return res.json()
    },
    enabled: !!accessToken,
  })

  const isLoading = isLoadingFiltered || isLoadingSettings
  const isError = isErrorFiltered || isSettingsError

  // Retrieve data
  const measureTypes = filteredData?.data ?? []
  const slideCount = measureTypes.length

  const systemSettingsItem = settingsData?.data?.items?.[0]
  const triggerAiPrompts = systemSettingsItem?.triggerAiPrompt ?? []

  /* ========= STRING PROMPT (COPY করার জন্য) ========= */
  const generatedPrompt = useMemo(() => {
    if (!measureTypes.length) return ''

    const stepsLine = measureTypes
      .map((item, index) => `${index + 1}. ${item.name}`)
      .join(', ')

    const details = measureTypes
      .map(
        (item, index) =>
          `${index + 1}. ${item.name}: ${item.values?.[language] ?? ''}`,
      )
      .join('\n\n')

    return `Create a presentation based on the following storyline in ${slideCount} Slides. Create one slide for each step in the story:

Steps: ${stepsLine}

${details}
`
  }, [measureTypes, language, slideCount])

  const handleCopy = async () => {
    if (!generatedPrompt) return
    await navigator.clipboard.writeText(generatedPrompt)
    toast.success('Prompt copied successfully!')
  }

  const handleCopyTriggerAi = async (htmlText: string) => {
    // Strip HTML tags for clipboard
    const plainText = htmlText.replace(/<[^>]+>/g, '')
    await navigator.clipboard.writeText(plainText)
    toast.success('Trigger AI Prompt copied successfully!')
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-300 rounded-md" />
        <div className="bg-gray-100 border rounded-lg p-6 space-y-4">
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-5/6" />
          <div className="h-4 bg-gray-300 rounded w-4/6" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="border border-red-200 bg-red-50 rounded-lg p-6 text-center space-y-4">
          <div className="text-red-600 text-3xl">⚠️</div>
          <h2 className="text-lg font-semibold text-red-700">
            Failed to Load Data
          </h2>
          <p className="text-sm text-red-600">
            We couldn’t fetch the required data. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-10">
      {/* Header & Main Prompt Block */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl text-[#00253E] leading-[110%] font-semibold">
              <Image
                src={ai_prompt_image}
                width={32}
                height={32}
                alt="Kick Off Story Icon"
                className="inline mr-2"
              />
              Kick Off Story
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-[#00253E] leading-[110%] pt-4">
              Final Prompt (Ready to copy)
            </p>
          </div>

          {/* Language Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                language === 'en'
                  ? 'bg-[#BADA55] text-[#00253E]'
                  : 'bg-gray-200 text-[#00253E]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('de')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                language === 'de'
                  ? 'bg-[#BADA55] text-[#00253E]'
                  : 'bg-gray-200 text-[#00253E]'
              }`}
            >
              DE
            </button>
          </div>
        </div>

        {/* Existing Prompt Box UI - Commented out as requested
        <div className="bg-[#EDEDED] border-l-[4px] border-[#00253E] rounded-xl p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-lg md:text-xl font-semibold text-[#00253E]">
              Create a presentation based on the following storyline in{' '}
              <span className="font-bold text-[#00253E]">
                {slideCount} slides
              </span>
              .
            </p>
            <p className="text-sm md:text-base font-normal text-[#00253E]">
              Create one slide for each step in the story.
            </p>
          </div>

          <div>
            <h3 className="text-lg md:text-xl font-semibold text-[#00253E] pb-2">
              Steps :
            </h3>

            {slideCount === 0 ? (
              <p className="text-sm text-gray-600">No steps found.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {measureTypes.map((item, index) => (
                  <span
                    key={index}
                    className="bg-white border px-3 py-1 rounded-full text-sm shadow-sm"
                  >
                    {index + 1}. {item.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-sm md:text-base font-normal text-[#00253E]">
            Develop a creative headline and create a modern, creative
            visualization for each slide. Supplement the points from the Insight
            Engine with additional information from the Internet.
          </p>

          <div className="space-y-4">
            {measureTypes.map((item, index) => (
              <div key={index} className="space-y-1">
                <h4 className="font-bold text-[#00253E] text-base md:text-lg">
                  {index + 1}. {item.name} :
                </h4>
                <p className="text-sm md:text-base font-normal text-[#00253E] whitespace-pre-line">
                  {item.values?.[language] ?? ''}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handleCopy}
              className="px-6 py-2.5 bg-[#D0DDE8] hover:bg-[#B8CADB] text-[#00253E] font-semibold rounded-[4px] flex items-center gap-2 transition-all"
            >
              <Copy className="h-4 w-4" />
              Copy Main Prompt
            </button>
          </div>
        </div>
        */}

        {/* Dynamic Trigger AI Prompts from Admin */}
        {triggerAiPrompts.length > 0 && (
          <div className="space-y-6 mt-2">
            <div className="flex flex-col gap-6">
              {triggerAiPrompts.map((prompt, index) => {
                const htmlContent = prompt.values?.[language] || ''

                if (!htmlContent.trim()) return null

                return (
                  <div
                    key={index}
                    className="bg-[#EDEDED] border-l-[4px] border-[#BADA55] rounded-xl p-8 space-y-6 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {prompt.name !== 'trigger Ai Prompt' && (
                        <h3 className="text-lg md:text-xl font-semibold text-[#00253E] pb-2 uppercase tracking-wide">
                          {prompt.name}
                        </h3>
                      )}

                      {/* Rich text container styling matching the previous layout */}
                      <div
                        className="text-sm md:text-base font-normal text-[#00253E] leading-relaxed [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-2 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleCopyTriggerAi(htmlContent)}
                        className="px-6 py-2.5 bg-[#BADA55] hover:bg-[#A9C94D] text-[#00253E] font-semibold rounded-[4px] flex items-center gap-2 transition-all w-fit"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Prompt
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Back Button Footer */}
      <div className="pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="h-[50px] flex items-center gap-2 bg-transparent border border-[#00253E] text-base font-medium leading-normal text-[#00253E] px-7 py-4 rounded-[8px] transition-all duration-200 active:scale-95 hover:bg-gray-50"
        >
          <ChevronsLeft className="h-4 w-4" />
          Back
        </button>
      </div>
    </div>
  )
}

export default TriggerAiContainer
