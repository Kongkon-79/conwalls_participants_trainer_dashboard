'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import {
  Loader2,
  Download,
  Grid,
  List,
  Clock,
  User,
  ChevronLeft,
} from 'lucide-react'
import { Stakeholder } from './stakeholder-types'
import { Measure } from './measure-types'

interface TimetableProps {
  projectId: string
  projectTitle: string
  kickOffDate: Date
  onBack?: () => void
}

export default function Timetable({
  projectId,
  projectTitle,
  kickOffDate,
  onBack,
}: TimetableProps) {
  const session = useSession()
  const token = (session?.data?.user as { accessToken?: string })?.accessToken

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data, isLoading } = useQuery({
    queryKey: ['stakeholders-measures', projectId],
    queryFn: async () => {
      const stRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stakeholder/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!stRes.ok) throw new Error('Failed to fetch stakeholders')
      const stData = await stRes.json()
      const stakeholders: Stakeholder[] = stData.data || []

      const measuresMap = new Map<string, Measure[]>()

      await Promise.all(
        stakeholders.map(async sh => {
          const mRes = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/measure/${projectId}/stakeholders/${sh._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
          if (mRes.ok) {
            const mData = await mRes.json()
            measuresMap.set(sh._id, mData.data || [])
          }
        }),
      )

      return stakeholders.map(sh => ({
        ...sh,
        measures: measuresMap.get(sh._id) || [],
      }))
    },
    enabled: !!token && !!projectId,
  })

  const getCategoryColor = (category: string) => {
    const cat = category?.toLowerCase() || ''
    if (cat.includes('communication')) return '#B5CC2E'
    if (cat.includes('involvement')) return '#00253E'
    if (cat.includes('recognition')) return '#A91D54'
    return '#9CA3AF'
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const stakeholdersWithMeasures = data || []

  // Calculate timeline bounds
  const maxWeeksPre = stakeholdersWithMeasures.reduce((max, sh) => {
    const shMax =
      sh.measures
        ?.filter(m => m.timing === 'pre')
        .reduce((m, m2) => Math.max(m, m2.startWeeks), 0) || 0
    return Math.max(max, shMax)
  }, 0)

  const maxWeeksPost = stakeholdersWithMeasures.reduce((max, sh) => {
    const shMax =
      sh.measures
        ?.filter(m => m.timing === 'post')
        .reduce((m, m2) => Math.max(m, m2.startWeeks), 0) || 0
    return Math.max(max, shMax)
  }, 0)

  const timelineStartBuffer = Math.max(1, maxWeeksPre + 2)
  const timelineEndBuffer = Math.max(1, maxWeeksPost + 2)
  const totalWeeks = timelineStartBuffer + timelineEndBuffer

  const handlePrint = () => {
    window.print()
  }

  const formattedStartDate = kickOffDate
    ? new Date(kickOffDate)
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      .replace(/\//g, ' - ')
    : '08 - 02 - 2026'

  return (
    <div className="space-y-10 pb-10 w-full max-w-full mx-auto font-sans">
      {/* Header Section */}
      <div className="flex flex-col gap-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <button
              onClick={onBack || (() => window.history.back())}
              className="flex items-center gap-1 text-[14px] text-gray-500 hover:text-[#00253E] transition-colors mb-2 print:hidden"
            >
              <ChevronLeft className="w-4 h-4" />
              Go Back
            </button>
            <h2 className="text-[22px] font-bold text-[#00253E]">
              Project List
            </h2>
            <div className="flex items-center gap-2 text-[15px] text-gray-500">
              <span>{projectTitle || 'New ERP System'}</span>
              <span className="text-gray-400">&gt;</span>
              <span className="text-[#00253E] font-medium">Time Table</span>
            </div>
          </div>

          <div className="flex gap-10">
            <div className="flex bg-gray-100 p-1.5 rounded-lg h-[48px] w-[260px] print:hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 rounded-md text-[14px] font-bold transition-colors flex items-center justify-center gap-2 ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#00253E]' : 'text-gray-500 hover:text-[#00253E]'}`}
              >
                <Grid className="w-5 h-5" />
                Grid View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 rounded-md text-[14px] font-bold transition-colors flex items-center justify-center gap-2 ${viewMode === 'list' ? 'bg-white shadow-sm text-[#00253E]' : 'text-gray-500 hover:text-[#00253E]'}`}
              >
                <List className="w-5 h-5" />
                List View
              </button>
            </div>

            <div className="flex flex-col gap-4 text-[15px] font-bold pt-1">
              <div className="flex items-center gap-4 text-[#00253E]">
                <span className="w-[20px] h-[20px] bg-[#B5CC2E] rounded-sm"></span>{' '}
                Communication
              </div>
              <div className="flex items-center gap-4 text-[#00253E]">
                <span className="w-[20px] h-[20px] bg-[#00253E] rounded-sm"></span>{' '}
                Involvement
              </div>
              <div className="flex items-center gap-4 text-[#00253E]">
                <span className="w-[20px] h-[20px] bg-[#A91D54] rounded-sm"></span>{' '}
                Recognition
              </div>
            </div>
          </div>
        </div>

        <div className="text-[#00253E] font-bold text-[18px] pt-2">
          Start : {formattedStartDate}
        </div>
      </div>

      {/* Content per Stakeholder */}
      {stakeholdersWithMeasures.map(sh => (
        <div key={sh._id} className="mb-12 block print:break-inside-avoid">
          {/* Stakeholder Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-[44px] px-6 bg-white border border-x-[4px] border-[#B5CC2E] rounded-[8px] flex items-center gap-3 shadow-sm">
                <User className="w-5 h-5 text-[#B5CC2E]" />
                <span className="text-[16px] font-bold text-[#00253E]">
                  {sh.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="h-[44px] px-6 bg-white border border-[#B5CC2E] rounded text-[14px] font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Download className="w-5 h-5" />
                Export PDF
              </button>
              {viewMode === 'list' && (
                <button className="h-[44px] px-6 bg-[#B5CC2E] rounded text-[14px] font-bold text-[#00253E] flex items-center gap-2 hover:bg-[#A3B829] transition-colors shadow-sm">
                  <Clock className="w-5 h-5" />
                  Timetable
                </button>
              )}
            </div>
          </div>

          {/* Timeline / List View Rendering */}
          {!sh.measures || sh.measures.length === 0 ? (
            <p className="text-gray-400 text-center py-12 text-[16px] italic">
              No measures added for this stakeholder.
            </p>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col gap-4">
              {sh.measures.map(m => (
                <div
                  key={m._id}
                  className="bg-[#F2F2F2] border-l-[4px]  border-[#BADA55] rounded-xl p-6 flex flex-row items-center relative overflow-hidden shadow-sm "
                >
                  {/* Left colored accent based on category */}
                  {/* <div
                    className="absolute left-0 top-0 bottom-0 w-[6px]"
                    style={{ backgroundColor: getCategoryColor(m.category) }}
                  ></div> */}

                  <div className="w-[140px] text-[16px] text-lg md:text-xl font-semibold text-black">
                    {m.timing === 'pre' ? 'Week' : 'Week'} {m.startWeeks}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-[20px] font-bold text-black">
                      {m.type} - {m.name}
                    </div>
                    <div className="flex">
                      <span
                        className="inline-flex px-5 py-1 rounded-full text-[12px] font-bold text-white tracking-widest"
                        style={{
                          backgroundColor: getCategoryColor(m.category),
                        }}
                      >
                        {m.category?.toUpperCase() || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {/* Ambassador row from image */}
              <div className="bg-[#F8F9FA] border border-gray-100 rounded-xl p-6 mt-2 flex items-center text-[20px] font-bold text-[#00253E] shadow-sm">
                <span className="mr-3">Change Ambassador :</span>
                <span className="text-[#00253E] font-medium text-[16px]">
                  Conwalls_gmbh
                </span>
              </div>
            </div>
          ) : (
            // Grid View (Timeline)
            <div className="relative pt-2 pb-24 px-10 bg-white overflow-x-auto min-w-[80%] print:overflow-visible rounded-xl shadow-sm border border-gray-50">
              <div className="min-w-[80%] relative h-[350px] ">
                {/* Horizontal Timeline Axis */}
                <div className="absolute top-[200px] left-0 right-0 h-[44px] flex shadow-inner rounded-md overflow-hidden border border-gray-200">
                  {/* Split colored bars */}
                  <div
                    className="h-full bg-[#D7A8BA]"
                    style={{
                      width: `${(timelineStartBuffer / totalWeeks) * 100}%`,
                    }}
                  ></div>
                  <div className="h-full bg-[#829DB5] flex-1"></div>

                  {/* Tick marks on the axis */}
                  <div className="absolute inset-0 flex">
                    {[...Array(totalWeeks + 1)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 border-r border-[#00253E]/15 last:border-0 relative"
                      >
                        {/* Start vertical line indicator */}
                        {i === timelineStartBuffer && (
                          <div className="absolute top-[-90px] left-0 -translate-x-1/2 flex flex-col items-center">
                            <div className="bg-white border border-gray-100 shadow-xl px-6 py-3 rounded-lg mb-3 flex flex-col items-center z-30">
                              <span className="text-[15px] font-black text-[#00253E]">
                                Start
                              </span>
                              <span className="text-[12px] text-gray-500 font-bold">
                                {new Date(kickOffDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}
                              </span>
                            </div>
                            <div className="w-[4px] h-[340px] bg-[#A91D54] z-20"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Measure Markers */}
                {sh.measures.map((m, idx) => {
                  const isPre = m.timing === 'pre'
                  const weekPos = isPre
                    ? timelineStartBuffer - m.startWeeks
                    : timelineStartBuffer + m.startWeeks
                  const xPos = (weekPos / totalWeeks) * 100

                  // Vertical positioning: staggered above and below
                  const isAbove = idx % 2 === 0
                  const row = idx % 3
                  const yPos = isAbove ? 30 + row * 50 : 280 + row * 50
                  const lineHeight = isAbove ? 200 - yPos : yPos - 244

                  return (
                    <div
                      key={m._id}
                      className="absolute z-20"
                      style={{
                        left: `${xPos}%`,
                        top: `${yPos}px`,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div className="flex items-start gap-3 bg-white rounded-lg p-2 whitespace-nowrap min-w-[170px] shadow-md border border-gray-100">
                        <div
                          className="w-[20px] h-[20px] mt-1 flex-shrink-0 rounded-sm"
                          style={{
                            backgroundColor: getCategoryColor(m.category),
                          }}
                        ></div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[15px] font-bold text-[#00253E] leading-tight">
                            {m.type}
                          </span>
                          <span className="text-[13px] text-[#00253E] font-medium leading-tight opacity-95 max-w-[140px] truncate">
                            {m.name}
                          </span>
                          <span className="text-[11px] text-[#00253E]/70 font-black mt-0.5">
                            {m.startWeeks} Weeks
                          </span>
                        </div>
                      </div>
                      {/* Connecting line to timeline axis */}
                      <div
                        className={`absolute left-1/2 w-[1px] bg-gray-400/80 z-10 ${isAbove ? 'top-full' : 'bottom-full'}`}
                        style={{ height: `${lineHeight}px` }}
                      ></div>
                    </div>
                  )
                })}

                


              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
