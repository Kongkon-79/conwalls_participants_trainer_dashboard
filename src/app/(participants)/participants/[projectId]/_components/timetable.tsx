'use client'

import React, { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import {
  Loader2,
  Download,
  Grid,
  List,
  User,
  ChevronLeft,
} from 'lucide-react'
import { Stakeholder } from './stakeholder-types'
import { Measure } from './measure-types'
import { parseCookies } from 'nookies'

interface TimetableProps {
  projectId: string
  projectTitle: string
  kickOffDate: Date
  onBack?: () => void
}

const COOKIE_NAME = "googtrans";

export default function Timetable({
  projectId,
  projectTitle,
  kickOffDate,
  onBack,
}: TimetableProps) {
  const cookie = parseCookies()[COOKIE_NAME]
  const lang = cookie?.split('/')?.[2] || 'de'
  const session = useSession()
  const token = (session?.data?.user as { accessToken?: string })?.accessToken

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const sectionRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())

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

  const getCategoryTextColor = (category: string) => {
    const cat = category?.toLowerCase() || ''
    if (cat.includes('communication')) return '#00253E'
    return '#FFFFFF'
  }

  const getSortedMeasures = (measures: Measure[] = []) =>
    [...measures].sort((a, b) => {
      const timingOrder = { post: 0, pre: 1 }
      const timingDiff =
        timingOrder[a.timing as keyof typeof timingOrder] -
        timingOrder[b.timing as keyof typeof timingOrder]

      if (timingDiff !== 0) return timingDiff

      return (a.startWeeks || 0) - (b.startWeeks || 0)
    })

  const formatDisplayDate = (date: Date) =>
    date
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      .replace(/\//g, '.')

  const formatMeasureDate = (measure: Measure) => {
    if (!kickOffDate) return formattedStartDate

    const baseDate = new Date(kickOffDate)
    if (Number.isNaN(baseDate.getTime())) return formattedStartDate

    const weekOffset = (measure.startWeeks || 0) * 7
    const direction = measure.timing === 'pre' ? -1 : 1

    baseDate.setDate(baseDate.getDate() + direction * weekOffset)

    return formatDisplayDate(baseDate)
  }

  const exportStakeholderPdf = async (
    stakeholderId: string,
    fileName: string,
    mode: 'grid' | 'list',
  ) => {
    if (typeof window === 'undefined') return

    const element = sectionRefs.current.get(stakeholderId)
    if (!element) return

    const fonts = (document as unknown as { fonts?: { ready: Promise<void> } })
      .fonts
    if (fonts?.ready) await fonts.ready

    const { default: html2pdf } = await import('html2pdf.js')

    const clone = element.cloneNode(true) as HTMLDivElement
    clone.style.background = '#ffffff'
    clone.style.padding = '0'
    clone.style.margin = '0'
    clone.style.overflow = 'visible'
    clone.style.maxWidth = 'none'
    clone.style.boxSizing = 'border-box'

    const exportBtn = clone.querySelector('[data-export-btn="true"]')
    if (exportBtn) {
      ;(exportBtn as HTMLDivElement).style.visibility = 'hidden'
      ;(exportBtn as HTMLDivElement).style.pointerEvents = 'none'
    }

    const pdfProjectHeader = document.createElement('div')
    pdfProjectHeader.style.display = 'block'
    pdfProjectHeader.style.margin = mode === 'grid' ? '0 0 24px' : '0 0 20px'
    pdfProjectHeader.style.padding = '0 0 16px'
    pdfProjectHeader.style.borderBottom = '1px solid #d7dde3'

    const pdfProjectTitle = document.createElement('span')
    pdfProjectTitle.textContent = projectTitle || 'Untitled Project'
    pdfProjectTitle.style.fontSize = mode === 'grid' ? '24px' : '22px'
    pdfProjectTitle.style.fontWeight = '800'
    pdfProjectTitle.style.lineHeight = '1.2'
    pdfProjectTitle.style.color = '#00253E'
    pdfProjectHeader.appendChild(pdfProjectTitle)
    clone.insertBefore(pdfProjectHeader, clone.firstChild)

    const header = clone.querySelector(
      '[data-header-row="true"]',
    ) as HTMLDivElement | null

    if (header) {
      header.style.marginBottom = '24px'
    }

    const stakeholderBadge = clone.querySelector(
      '[data-pdf-stakeholder-badge="true"]',
    ) as HTMLDivElement | null

    if (stakeholderBadge) {
      stakeholderBadge.style.display = 'inline-flex'
      stakeholderBadge.style.alignItems = 'center'
      stakeholderBadge.style.gap = '12px'
      stakeholderBadge.style.backgroundColor = '#ffffff'
      stakeholderBadge.style.color = '#00253E'
      stakeholderBadge.style.fontSize = '16px'
      stakeholderBadge.style.fontWeight = '700'
      stakeholderBadge.style.lineHeight = '1.1'
      stakeholderBadge.style.padding = '10px 16px'
      stakeholderBadge.style.borderTop = '1px solid #B5CC2E'
      stakeholderBadge.style.borderBottom = '1px solid #B5CC2E'
      stakeholderBadge.style.borderLeft = '4px solid #B5CC2E'
      stakeholderBadge.style.borderRight = '4px solid #B5CC2E'
      stakeholderBadge.style.borderRadius = '8px'
      stakeholderBadge.style.boxSizing = 'border-box'
      stakeholderBadge.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)'
    }

    const stakeholderIcon = clone.querySelector(
      '[data-pdf-stakeholder-icon="true"]',
    ) as HTMLDivElement | null

    if (stakeholderIcon) {
      stakeholderIcon.style.display = 'inline-flex'
      stakeholderIcon.style.alignItems = 'center'
      stakeholderIcon.style.justifyContent = 'center'
      stakeholderIcon.style.width = '20px'
      stakeholderIcon.style.height = '20px'
      stakeholderIcon.style.flexShrink = '0'
    }

    const pills = clone.querySelectorAll('[data-pdf-category-pill="true"]')
    pills.forEach(node => {
      const pill = node as HTMLSpanElement
      const category = (pill.getAttribute('data-category-name') || '').toLowerCase()

      pill.style.display = 'inline-flex'
      pill.style.alignItems = 'center'
      pill.style.justifyContent = 'center'
      pill.style.padding = '4px 14px'
      pill.style.borderRadius = '9999px'
      pill.style.fontSize = mode === 'list' ? '12px' : '11px'
      pill.style.fontWeight = '700'
      pill.style.lineHeight = '1.1'
      pill.style.letterSpacing = mode === 'list' ? '0.04em' : '0'
      pill.style.whiteSpace = 'nowrap'
      pill.style.marginTop = mode === 'list' ? '8px' : '2px'

      if (category.includes('communication')) {
        pill.style.backgroundColor = '#B5CC2E'
        pill.style.color = '#00253E'
      } else if (category.includes('involvement')) {
        pill.style.backgroundColor = '#00253E'
        pill.style.color = '#FFFFFF'
      } else if (category.includes('recognition')) {
        pill.style.backgroundColor = '#A91D54'
        pill.style.color = '#FFFFFF'
      } else {
        pill.style.backgroundColor = '#9CA3AF'
        pill.style.color = '#FFFFFF'
      }
    })

    if (mode === 'grid') {
      const gridShell = clone.querySelector(
        '[data-pdf-grid-shell="true"]',
      ) as HTMLDivElement | null
      const gridViewport = clone.querySelector(
        '[data-pdf-grid-viewport="true"]',
      ) as HTMLDivElement | null
      const gridCanvas = clone.querySelector(
        '[data-pdf-grid-canvas="true"]',
      ) as HTMLDivElement | null

      if (gridShell) {
        gridShell.style.overflow = 'visible'
        gridShell.style.width = 'fit-content'
        gridShell.style.minWidth = '100%'
      }

      if (gridViewport) {
        gridViewport.style.overflow = 'visible'
      }

      if (gridCanvas) {
        gridCanvas.style.minWidth = '0'
        gridCanvas.style.margin = '0 auto'
      }
    }

    const fullWidth =
      mode === 'grid'
        ? (() => {
            const gridShell = clone.querySelector(
              '[data-pdf-grid-shell="true"]',
            ) as HTMLDivElement | null

            return (
              gridShell?.scrollWidth ||
              gridShell?.getBoundingClientRect().width ||
              element.scrollWidth ||
              element.getBoundingClientRect().width
            )
          })()
        : element.scrollWidth ||
          element.offsetWidth ||
          element.getBoundingClientRect().width

    clone.style.width = `${fullWidth}px`

    const wrapper = document.createElement('div')
    wrapper.style.position = 'fixed'
    wrapper.style.left = '-100000px'
    wrapper.style.top = '0'
    wrapper.style.background = '#ffffff'
    wrapper.style.width = `${fullWidth}px`
    wrapper.style.overflow = 'visible'
    wrapper.appendChild(clone)
    document.body.appendChild(wrapper)

    const pdfUnit = 'mm' as const
    const pdfFormat: 'a3' | 'a4' = mode === 'grid' ? 'a3' : 'a4'
    const orientation: 'landscape' | 'portrait' =
      mode === 'grid' ? 'landscape' : 'portrait'

    const opt = {
      margin: mode === 'grid' ? 6 : 8,
      filename: `${fileName}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: mode === 'grid' ? 3 : 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: fullWidth,
        windowWidth: fullWidth,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: pdfUnit,
        format: pdfFormat,
        orientation,
      },
      pagebreak: { mode: ['css', 'legacy'] as const },
    }

    try {
      await html2pdf().set(opt).from(clone).save()
    } finally {
      document.body.removeChild(wrapper)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const stakeholdersWithMeasures = data || []

  const formattedStartDate = kickOffDate
    ? new Date(kickOffDate)
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        .replace(/\//g, '.')
    : '08.02.2026'

  return (
    <div className="space-y-10 pb-10 w-full max-w-full mx-auto overflow-x-hidden font-sans">
      <div className="flex flex-col gap-6 pb-4">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex flex-col gap-1">
            <button
              onClick={onBack || (() => window.history.back())}
              className="flex items-center gap-1 text-[14px] text-gray-500 hover:text-[#00253E] transition-colors mb-2 print:hidden"
            >
              <ChevronLeft className="w-4 h-4" />
              {lang === 'de' ? 'Zurück' : 'Go Back'}
            </button>
            <h2 className="text-[22px] font-bold text-[#00253E]">
              {lang === 'de' ? 'Projektliste' : 'Project List'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-[15px] text-gray-500">
              <span className="notranslate">
                {projectTitle || 'New ERP System'}
              </span>
              <span className="text-gray-400">&gt;</span>
              <span className="text-[#00253E] font-medium notranslate">
                {lang === 'de' ? 'Timetable' : 'Time Table'}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:justify-end xl:w-auto">
            <div className="flex bg-gray-100 p-1.5 rounded-lg h-auto min-h-[48px] w-full sm:w-[260px] print:hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 rounded-md text-[14px] font-bold transition-colors px-2 flex items-center justify-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-[#00253E]'
                    : 'text-gray-500 hover:text-[#00253E]'
                }`}
              >
                <Grid className="w-5 h-5" />
                {lang === 'de' ? 'Rasteransicht' : 'Grid View'}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 rounded-md text-[14px] font-bold px-2 transition-colors flex items-center justify-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-[#00253E]'
                    : 'text-gray-500 hover:text-[#00253E]'
                }`}
              >
                <List className="w-5 h-5" />

                {lang === 'de' ? 'Listenansicht' : 'List View'}
              </button>
            </div>

            <div className="grid gap-4 text-[15px] font-bold pt-1 sm:grid-cols-2 lg:grid-cols-1 xl:min-w-[220px]">
              <div className="flex items-center gap-4 text-[#00253E] notranslate">
                <span className="w-[20px] h-[20px] bg-[#B5CC2E] rounded-sm"></span>

                {lang === 'de' ? 'Kommunikation' : 'Communication'}
              </div>
              <div className="flex items-center gap-4 text-[#00253E] notranslate">
                <span className="w-[20px] h-[20px] bg-[#00253E] rounded-sm"></span>

                {lang === 'de' ? 'Einbindung' : 'Involvement'}
              </div>
              <div className="flex items-center gap-4 text-[#00253E] notranslate">
                <span className="w-[20px] h-[20px] bg-[#A91D54] rounded-sm"></span>

                {lang === 'de' ? 'Anerkennung' : 'Recognition'}
              </div>
            </div>
          </div>
        </div>

        <div className="text-[#00253E] font-bold text-[18px] pt-2">
          Start : {formattedStartDate}
        </div>
      </div>

      {stakeholdersWithMeasures.map(sh => (
        <div
          key={sh._id}
          ref={el => {
            sectionRefs.current.set(sh._id, el)
          }}
          className="mb-12 block w-full max-w-full overflow-hidden print:break-inside-avoid"
        >
          <div
            data-header-row="true"
            className="mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center">
              <div
                data-pdf-stakeholder-badge="true"
                className="flex min-h-[44px] min-w-0 items-center gap-3 rounded-[8px] border border-x-[4px] border-[#B5CC2E] bg-white px-4 py-2 shadow-sm sm:px-6"
              >
                <div data-pdf-stakeholder-icon="true">
                  <User className="w-5 h-5 text-[#B5CC2E]" />
                </div>
                <span className="truncate text-[16px] font-bold text-[#00253E]">
                  {sh.name}
                </span>
              </div>
            </div>

            <div
              data-export-btn="true"
              className="flex items-center gap-3 print:hidden"
            >
              <button
                onClick={() =>
                  exportStakeholderPdf(
                    sh._id,
                    `${viewMode}-view-${sh.name}`,
                    viewMode,
                  )
                }
                className="h-[44px] px-6 bg-white border border-[#B5CC2E] rounded text-[14px] font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Download className="w-5 h-5" />
                {lang === 'de' ? 'PDF exportieren' : 'Export PDF'}
              </button>
            </div>
          </div>

          {!sh.measures || sh.measures.length === 0 ? (
            <p className="text-gray-400 text-center py-12 text-[16px] italic">
              No measures added for this stakeholder.
            </p>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col gap-4">
              {getSortedMeasures(sh.measures).map(m => (
                <div
                  key={m._id}
                  className="bg-[#F2F2F2] border-l-[4px] border-[#BADA55] rounded-xl p-6 flex flex-row items-center relative overflow-hidden shadow-sm"
                >
                  <div className="w-[140px] text-[16px] md:text-xl font-semibold text-black">
                    {lang === 'de'
                      ? `Woche ${m.startWeeks}`
                      : `Week ${m.startWeeks}`}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-[20px] font-bold text-black">
                      {m.type} - {m.name}
                    </div>
                    <div className="text-[13px] font-semibold text-[#00253E]/70">
                      {formatMeasureDate(m)}
                    </div>
                    <div className="flex">
                      <span
                        data-pdf-category-pill="true"
                        data-category-name={m.category || ''}
                        className="inline-flex px-5 py-1 rounded-full text-[12px] font-bold tracking-widest"
                        style={{
                          backgroundColor: getCategoryColor(m.category),
                          color: getCategoryTextColor(m.category),
                        }}
                      >
                        {m.category?.toUpperCase() || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-[#F8F9FA] border border-gray-100 rounded-xl p-6 mt-2 flex items-center text-[20px] font-bold text-[#00253E] shadow-sm">
                {/* <span className="mr-3">Change Ambassador :</span> */}
                <span className="text-[#3e4042] font-medium text-[16px] notranslate">
                  Created with Insight engine by Conwalls
                </span>
              </div>
            </div>
          ) : (
            (() => {
              const sortedMeasures = getSortedMeasures(sh.measures)
              const maxWeeksPre =
                sortedMeasures
                  .filter(m => m.timing === 'pre')
                  .reduce((mx, m) => Math.max(mx, m.startWeeks || 0), 0) || 0
              const maxWeeksPost =
                sortedMeasures
                  .filter(m => m.timing === 'post')
                  .reduce((mx, m) => Math.max(mx, m.startWeeks || 0), 0) || 0

              const timelineStartBuffer = Math.max(2, maxWeeksPre + 2)
              const timelineEndBuffer = Math.max(2, maxWeeksPost + 2)
              const totalWeeks = timelineStartBuffer + timelineEndBuffer
              const weekWidth = 56
              const timelineWidth = Math.max(640, totalWeeks * weekWidth)
              const canvasSidePadding = 140
              const canvasWidth = timelineWidth + canvasSidePadding * 2
              const splitLeftPx =
                canvasSidePadding +
                (timelineStartBuffer / totalWeeks) * timelineWidth
              const preCount = sortedMeasures.filter(
                m => m.timing === 'pre',
              ).length
              const postCount = sortedMeasures.filter(
                m => m.timing === 'post',
              ).length
              const upperRows = Math.max(
                1,
                Math.ceil(preCount / 2),
                Math.ceil(postCount / 2),
              )
              const lowerRows = Math.max(
                1,
                Math.ceil(preCount / 2),
                Math.ceil(postCount / 2),
              )
              const rowGap = 40
              const cardHeight = 56
              const topBase = 12
              const timelineTop = 182 + Math.max(0, upperRows - 1) * rowGap
              const bottomBase = timelineTop + 92
              const canvasHeight =
                bottomBase +
                cardHeight +
                Math.max(0, lowerRows - 1) * rowGap +
                20

              return (
                <div
                  data-pdf-grid-shell="true"
                  className="relative w-full max-w-full overflow-hidden rounded-xl border border-gray-50 bg-white px-2 py-4 shadow-sm sm:px-4 lg:px-6 lg:py-6"
                >
                  <div
                    data-pdf-grid-viewport="true"
                    className="w-full max-w-full overflow-x-auto overflow-y-hidden pb-4 print:overflow-visible [overscroll-behavior-x:contain] [-webkit-overflow-scrolling:touch]"
                  >
                    <div
                      data-pdf-grid-canvas="true"
                      className="relative inline-block print:min-w-0"
                      style={{ height: `${canvasHeight}px`, width: `${canvasWidth}px` }}
                    >
                      <div
                        className="absolute h-[48px] overflow-hidden border border-[#d7dde3]"
                        style={{
                          left: `${canvasSidePadding}px`,
                          top: `${timelineTop}px`,
                          width: `${timelineWidth}px`,
                        }}
                      >
                        <div
                          className="absolute inset-y-0 left-0 bg-[#DDB3C1]"
                          style={{
                            width: `${(timelineStartBuffer / totalWeeks) * timelineWidth}px`,
                          }}
                        ></div>
                        <div
                          className="absolute inset-y-0 right-0 bg-[#9EB7CB]"
                          style={{
                            width: `${(timelineEndBuffer / totalWeeks) * timelineWidth}px`,
                          }}
                        ></div>
                      </div>

                      <div
                        className="absolute h-[78px]"
                        style={{
                          left: `${canvasSidePadding}px`,
                          top: `${timelineTop - 32}px`,
                          width: `${timelineWidth}px`,
                        }}
                      >
                        {Array.from({ length: totalWeeks + 1 }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute top-0 h-[50px] w-px bg-[#23445f]/65"
                            style={{ left: `${(i / totalWeeks) * timelineWidth}px` }}
                          ></div>
                        ))}
                      </div>

                      <div
                        className="absolute z-30 flex -translate-x-1/2 flex-col items-center"
                        style={{
                          left: `${splitLeftPx}px`,
                          top: `${timelineTop - 73}px`,
                        }}
                      >
                        <div className="h-[56px] w-[3px] bg-[#A91D54]"></div>
                        <div className="mt-[-1px] flex flex-col items-center bg-white px-2 text-center">
                          <div className="flex items-center gap-1 text-[20px] font-black leading-none text-[#A91D54] sm:text-[24px]">
                            <span className="h-[11px] w-[11px] rounded-full bg-[#A91D54] sm:h-[13px] sm:w-[13px]"></span>
                            <span className="text-[16px] text-[#00253E] sm:text-[20px]">
                              Start
                            </span>
                          </div>
                          <span className="mt-1 text-[12px] font-bold text-[#00253E]">
                            {formattedStartDate}
                          </span>
                        </div>
                        <div className="h-[120px] w-[3px] bg-[#A91D54]"></div>
                      </div>

                      {sortedMeasures.map((m, idx) => {
                        const isPre = m.timing === 'pre'
                        const weekPos = isPre
                          ? timelineStartBuffer - (m.startWeeks || 0)
                          : timelineStartBuffer + (m.startWeeks || 0)
                        const xPos =
                          canvasSidePadding +
                          (weekPos / totalWeeks) * timelineWidth

                        const orderWithinSide = sortedMeasures
                          .slice(0, idx + 1)
                          .filter(item => item.timing === m.timing).length - 1
                        const isNearStart = (m.startWeeks || 0) <= 2
                        const nearStartCountWithinSide = sortedMeasures
                          .slice(0, idx + 1)
                          .filter(
                            item =>
                              item.timing === m.timing &&
                              (item.startWeeks || 0) <= 2,
                          ).length
                        const adjustedOrder = isPre
                          ? orderWithinSide
                          : Math.max(0, orderWithinSide - nearStartCountWithinSide)
                        const isAbove = isPre
                          ? orderWithinSide % 2 === 0
                          : isNearStart
                            ? false
                            : adjustedOrder % 2 === 0
                        const rowOffset = Math.floor(orderWithinSide / 2)
                        const yPos = isAbove
                          ? topBase + rowOffset * rowGap
                          : bottomBase + rowOffset * rowGap
                        const connectorHeight = isAbove
                          ? timelineTop - (yPos + cardHeight)
                          : yPos - (timelineTop + 48)

                        return (
                          <div
                            key={m._id}
                            className="absolute z-20 -translate-x-1/2"
                            style={{
                              left: `${xPos}px`,
                              top: `${yPos}px`,
                            }}
                          >
                            <div
                              className={`absolute left-1/2 w-px -translate-x-1/2 bg-[#5C7286]/80 ${
                                isAbove ? 'top-full' : 'bottom-full'
                              }`}
                              style={{
                                height: `${Math.max(connectorHeight, 24)}px`,
                              }}
                            ></div>

                            <div className="flex min-w-[150px] max-w-[170px] gap-2 bg-white px-1 py-1 text-[#00253E] sm:min-w-[180px] sm:max-w-[200px] sm:gap-3">
                              <div
                                className="mt-1 h-[16px] w-[16px] flex-shrink-0 rounded-none sm:h-[18px] sm:w-[18px]"
                                style={{
                                  backgroundColor: getCategoryColor(m.category),
                                }}
                              ></div>
                              <div className="flex flex-col leading-tight">
                                <span className="text-[13px] font-extrabold sm:text-[15px]">
                                  {m.type}
                                </span>
                                <span className="mt-0.5 text-[11px] font-semibold text-[#00253E] sm:text-[12px]">
                                  {m.name}
                                </span>
                                <span className="mt-1 text-[10px] font-bold text-[#00253E] sm:text-[11px]">
                                  {m.startWeeks}{' '}
                                  {m.startWeeks === 1 ? 'Week' : 'Weeks'}
                                </span>
                                <span className="mt-0.5 text-[10px] font-bold text-[#00253E]/80 sm:text-[11px]">
                                  {formatMeasureDate(m)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })()
          )}
        </div>
      ))}
    </div>
  )
}
















// 'use client'

// import React, { useState } from 'react'
// import { useQuery } from '@tanstack/react-query'
// import { useSession } from 'next-auth/react'
// import {
//   Loader2,
//   Download,
//   Grid,
//   List,
//   User,
//   ChevronLeft,
// } from 'lucide-react'
// import { Stakeholder } from './stakeholder-types'
// import { Measure } from './measure-types'

// interface TimetableProps {
//   projectId: string
//   projectTitle: string
//   kickOffDate: Date
//   onBack?: () => void
// }

// export default function Timetable({
//   projectId,
//   projectTitle,
//   kickOffDate,
//   onBack,
// }: TimetableProps) {
//   const session = useSession()
//   const token = (session?.data?.user as { accessToken?: string })?.accessToken

//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

//   const { data, isLoading } = useQuery({
//     queryKey: ['stakeholders-measures', projectId],
//     queryFn: async () => {
//       const stRes = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/stakeholder/${projectId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       )
//       if (!stRes.ok) throw new Error('Failed to fetch stakeholders')
//       const stData = await stRes.json()
//       const stakeholders: Stakeholder[] = stData.data || []

//       const measuresMap = new Map<string, Measure[]>()

//       await Promise.all(
//         stakeholders.map(async sh => {
//           const mRes = await fetch(
//             `${process.env.NEXT_PUBLIC_BACKEND_URL}/measure/${projectId}/stakeholders/${sh._id}`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             },
//           )
//           if (mRes.ok) {
//             const mData = await mRes.json()
//             measuresMap.set(sh._id, mData.data || [])
//           }
//         }),
//       )

//       return stakeholders.map(sh => ({
//         ...sh,
//         measures: measuresMap.get(sh._id) || [],
//       }))
//     },
//     enabled: !!token && !!projectId,
//   })

//   const getCategoryColor = (category: string) => {
//     const cat = category?.toLowerCase() || ''
//     if (cat.includes('communication')) return '#B5CC2E'
//     if (cat.includes('involvement')) return '#00253E'
//     if (cat.includes('recognition')) return '#A91D54'
//     return '#9CA3AF'
//   }

//   if (isLoading) {
//     return (
//       <div className="flex justify-center p-12">
//         <Loader2 className="w-8 h-8 animate-spin text-primary" />
//       </div>
//     )
//   }

//   const stakeholdersWithMeasures = data || []

//   // Calculate timeline bounds
//   const maxWeeksPre = stakeholdersWithMeasures.reduce((max, sh) => {
//     const shMax =
//       sh.measures
//         ?.filter(m => m.timing === 'pre')
//         .reduce((m, m2) => Math.max(m, m2.startWeeks), 0) || 0
//     return Math.max(max, shMax)
//   }, 0)

//   const maxWeeksPost = stakeholdersWithMeasures.reduce((max, sh) => {
//     const shMax =
//       sh.measures
//         ?.filter(m => m.timing === 'post')
//         .reduce((m, m2) => Math.max(m, m2.startWeeks), 0) || 0
//     return Math.max(max, shMax)
//   }, 0)

//   const timelineStartBuffer = Math.max(1, maxWeeksPre + 2)
//   const timelineEndBuffer = Math.max(1, maxWeeksPost + 2)
//   const totalWeeks = timelineStartBuffer + timelineEndBuffer

//   const handlePrint = () => {
//     window.print()
//   }

//   const formattedStartDate = kickOffDate
//     ? new Date(kickOffDate)
//       .toLocaleDateString('en-GB', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric',
//       })
//       .replace(/\//g, ' - ')
//     : '08 - 02 - 2026'

//   return (
//     <div className="space-y-10 pb-10 w-full max-w-full mx-auto font-sans">
//       {/* Header Section */}
//       <div className="flex flex-col gap-6 pb-4">
//         <div className="flex items-start justify-between">
//           <div className="flex flex-col gap-1">
//             <button
//               onClick={onBack || (() => window.history.back())}
//               className="flex items-center gap-1 text-[14px] text-gray-500 hover:text-[#00253E] transition-colors mb-2 print:hidden"
//             >
//               <ChevronLeft className="w-4 h-4" />
//               Go Back
//             </button>
//             <h2 className="text-[22px] font-bold text-[#00253E]">
//               Project List
//             </h2>
//             <div className="flex items-center gap-2 text-[15px] text-gray-500">
//               <span>{projectTitle || 'New ERP System'}</span>
//               <span className="text-gray-400">&gt;</span>
//               <span className="text-[#00253E] font-medium">Time Table</span>
//             </div>
//           </div>

//           <div className="flex gap-10">
//             <div className="flex bg-gray-100 p-1.5 rounded-lg h-[48px] w-[260px] print:hidden">
//               <button
//                 onClick={() => setViewMode('grid')}
//                 className={`flex-1 rounded-md text-[14px] font-bold transition-colors flex items-center justify-center gap-2 ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#00253E]' : 'text-gray-500 hover:text-[#00253E]'}`}
//               >
//                 <Grid className="w-5 h-5" />
//                 Grid View
//               </button>
//               <button
//                 onClick={() => setViewMode('list')}
//                 className={`flex-1 rounded-md text-[14px] font-bold transition-colors flex items-center justify-center gap-2 ${viewMode === 'list' ? 'bg-white shadow-sm text-[#00253E]' : 'text-gray-500 hover:text-[#00253E]'}`}
//               >
//                 <List className="w-5 h-5" />
//                 List View
//               </button>
//             </div>

//             <div className="flex flex-col gap-4 text-[15px] font-bold pt-1">
//               <div className="flex items-center gap-4 text-[#00253E]">
//                 <span className="w-[20px] h-[20px] bg-[#B5CC2E] rounded-sm"></span>{' '}
//                 Communication
//               </div>
//               <div className="flex items-center gap-4 text-[#00253E]">
//                 <span className="w-[20px] h-[20px] bg-[#00253E] rounded-sm"></span>{' '}
//                 Involvement
//               </div>
//               <div className="flex items-center gap-4 text-[#00253E]">
//                 <span className="w-[20px] h-[20px] bg-[#A91D54] rounded-sm"></span>{' '}
//                 Recognition
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="text-[#00253E] font-bold text-[18px] pt-2">
//           Start : {formattedStartDate}
//         </div>
//       </div>

//       {/* Content per Stakeholder */}
//       {stakeholdersWithMeasures.map(sh => (
//         <div key={sh._id} className="mb-12 block print:break-inside-avoid">
//           {/* Stakeholder Header */}
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center">
//               <div className="h-[44px] px-6 bg-white border border-x-[4px] border-[#B5CC2E] rounded-[8px] flex items-center gap-3 shadow-sm">
//                 <User className="w-5 h-5 text-[#B5CC2E]" />
//                 <span className="text-[16px] font-bold text-[#00253E]">
//                   {sh.name}
//                 </span>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 print:hidden">
//               <button
//                 onClick={handlePrint}
//                 className="h-[44px] px-6 bg-white border border-[#B5CC2E] rounded text-[14px] font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
//               >
//                 <Download className="w-5 h-5" />
//                 Export PDF
//               </button>
//             </div>
//           </div>

//           {/* Timeline / List View Rendering */}
//           {!sh.measures || sh.measures.length === 0 ? (
//             <p className="text-gray-400 text-center py-12 text-[16px] italic">
//               No measures added for this stakeholder.
//             </p>
//           ) : viewMode === 'list' ? (
//             <div className="flex flex-col gap-4">
//               {sh.measures.map(m => (
//                 <div
//                   key={m._id}
//                   className="bg-[#F2F2F2] border-l-[4px]  border-[#BADA55] rounded-xl p-6 flex flex-row items-center relative overflow-hidden shadow-sm "
//                 >
//                   {/* Left colored accent based on category */}
//                   {/* <div
//                     className="absolute left-0 top-0 bottom-0 w-[6px]"
//                     style={{ backgroundColor: getCategoryColor(m.category) }}
//                   ></div> */}

//                   <div className="w-[140px] text-[16px] text-lg md:text-xl font-semibold text-black">
//                     {m.timing === 'pre' ? 'Week' : 'Week'} {m.startWeeks}
//                   </div>
//                   <div className="flex flex-col gap-2">
//                     <div className="text-[20px] font-bold text-black">
//                       {m.type} - {m.name}
//                     </div>
//                     <div className="flex">
//                       <span
//                         className="inline-flex px-5 py-1 rounded-full text-[12px] font-bold text-white tracking-widest"
//                         style={{
//                           backgroundColor: getCategoryColor(m.category),
//                         }}
//                       >
//                         {m.category?.toUpperCase() || 'N/A'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//               {/* Ambassador row from image */}
//               <div className="bg-[#F8F9FA] border border-gray-100 rounded-xl p-6 mt-2 flex items-center text-[20px] font-bold text-[#00253E] shadow-sm">
//                 <span className="mr-3">Change Ambassador :</span>
//                 <span className="text-[#00253E] font-medium text-[16px]">
//                   Conwalls_gmbh
//                 </span>
//               </div>
//             </div>
//           ) : (
//             // Grid View (Timeline)
//             <div className="relative pt-2 pb-24 px-10 bg-white overflow-x-auto min-w-[80%] print:overflow-visible rounded-xl shadow-sm border border-gray-50">
//               <div className="min-w-[80%] relative h-[350px] ">
//                 {/* Horizontal Timeline Axis */}
//                 <div className="absolute top-[200px] left-0 right-0 h-[44px] flex shadow-inner rounded-md overflow-hidden border border-gray-200">
//                   {/* Split colored bars */}
//                   <div
//                     className="h-full bg-[#D7A8BA]"
//                     style={{
//                       width: `${(timelineStartBuffer / totalWeeks) * 100}%`,
//                     }}
//                   ></div>
//                   <div className="h-full bg-[#829DB5] flex-1"></div>

//                   {/* Tick marks on the axis */}
//                   <div className="absolute inset-0 flex">
//                     {[...Array(totalWeeks + 1)].map((_, i) => (
//                       <div
//                         key={i}
//                         className="flex-1 border-r border-[#00253E]/15 last:border-0 relative"
//                       >
//                         {/* Start vertical line indicator */}
//                         {i === timelineStartBuffer && (
//                           <div className="absolute top-[-90px] left-0 -translate-x-1/2 flex flex-col items-center">
//                             <div className="bg-white border border-gray-100 shadow-xl px-6 py-3 rounded-lg mb-3 flex flex-col items-center z-30">
//                               <span className="text-[15px] font-black text-[#00253E]">
//                                 Start
//                               </span>
//                               <span className="text-[12px] text-gray-500 font-bold">
//                                 {new Date(kickOffDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}
//                               </span>
//                             </div>
//                             <div className="w-[4px] h-[340px] bg-[#A91D54] z-20"></div>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Measure Markers */}
//                 {sh.measures.map((m, idx) => {
//                   const isPre = m.timing === 'pre'
//                   const weekPos = isPre
//                     ? timelineStartBuffer - m.startWeeks
//                     : timelineStartBuffer + m.startWeeks
//                   const xPos = (weekPos / totalWeeks) * 100

//                   // Vertical positioning: staggered above and below
//                   const isAbove = idx % 2 === 0
//                   const row = idx % 3
//                   const yPos = isAbove ? 30 + row * 50 : 280 + row * 50
//                   const lineHeight = isAbove ? 200 - yPos : yPos - 244

//                   return (
//                     <div
//                       key={m._id}
//                       className="absolute z-20"
//                       style={{
//                         left: `${xPos}%`,
//                         top: `${yPos}px`,
//                         transform: 'translateX(-50%)',
//                       }}
//                     >
//                       <div className="flex items-start gap-3 bg-white rounded-lg p-2 whitespace-nowrap min-w-[170px] shadow-md border border-gray-100">
//                         <div
//                           className="w-[20px] h-[20px] mt-1 flex-shrink-0 rounded-sm"
//                           style={{
//                             backgroundColor: getCategoryColor(m.category),
//                           }}
//                         ></div>
//                         <div className="flex flex-col gap-1">
//                           <span className="text-[15px] font-bold text-[#00253E] leading-tight">
//                             {m.type}
//                           </span>
//                           <span className="text-[13px] text-[#00253E] font-medium leading-tight opacity-95 max-w-[140px] truncate">
//                             {m.name}
//                           </span>
//                           <span className="text-[11px] text-[#00253E]/70 font-black mt-0.5">
//                             {m.startWeeks} Weeks 
//                           </span>
//                         </div>
//                       </div>
//                       {/* Connecting line to timeline axis */}
//                       <div
//                         className={`absolute left-1/2 w-[1px] bg-gray-400/80 z-10 ${isAbove ? 'top-full' : 'bottom-full'}`}
//                         style={{ height: `${lineHeight}px` }}
//                       ></div>
//                     </div>
//                   )
//                 })}

                


//               </div>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   )
// }
