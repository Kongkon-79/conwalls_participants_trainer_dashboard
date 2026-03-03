'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { Pencil, Trash2, Loader2, ChevronsRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Measure, MeasuresResponse } from './measure-types'
import { Stakeholder } from './stakeholder-types'
import MeasureForm from './measure-form'

interface MeasureListProps {
  projectId: string
  stakeholder: Stakeholder
  onBack: () => void
  onOverview?: () => void
}

export default function MeasureList({
  projectId,
  stakeholder,
  onBack,
  onOverview,
}: MeasureListProps) {
  const session = useSession()
  const token = (session?.data?.user as { accessToken?: string })?.accessToken
  const queryClient = useQueryClient()

  const [isAdding, setIsAdding] = useState(false)
  const [editingMeasure, setEditingMeasure] = useState<Measure | null>(null)

  const { data, isLoading } = useQuery<MeasuresResponse>({
    queryKey: ['measures', projectId, stakeholder._id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/measure/${projectId}/stakeholders/${stakeholder._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!res.ok) throw new Error('Failed to fetch measures')
      return res.json()
    },
    enabled: !!token && !!projectId && !!stakeholder._id,
  })

  const deleteMutation = useMutation({
    mutationFn: async (measureId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/measure/${measureId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!res.ok) throw new Error('Failed to delete measure')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['measures', projectId, stakeholder._id],
      })
      toast.success('Measure deleted successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete measure')
    },
  })

  if (isAdding || editingMeasure) {
    return (
      <MeasureForm
        projectId={projectId}
        stakeholderId={stakeholder._id}
        initialData={editingMeasure}
        onCancel={() => {
          setIsAdding(false)
          setEditingMeasure(null)
        }}
        onSuccess={() => {
          setIsAdding(false)
          setEditingMeasure(null)
        }}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const measures = data?.data || []

  // Function to get color class based on category
  const getCategoryBadgeColor = (category: string) => {
    const cat = category?.toLowerCase() || ''
    if (cat.includes('communication')) {
      return 'bg-[#B5CC2E] text-[#00253E]' // lime green
    } else if (cat.includes('involvement')) {
      return 'bg-[#00253E] text-white' // navy
    } else if (cat.includes('recognition')) {
      return 'bg-pink-500 text-white' // pink/magenta
    }
    return 'bg-gray-200 text-gray-800'
  }

  return (
    <div className="space-y-6 pb-10">
      <h2 className="text-xl font-semibold text-[#00253E] mb-6">
        Measures for {stakeholder.name}
      </h2>

      <div className="space-y-0 border-b border-t border-gray-200 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[3fr_2fr_1fr_auto] gap-4 p-4 bg-[#00253E] text-white font-medium text-[16px]">
          <div>Subject</div>
          <div>Type</div>
          <div>Category</div>
          <div className="w-16"></div>
        </div>

        {measures.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white">
            No measures found. Add one to get started.
          </div>
        ) : (
          measures.map((m, index) => (
            <div
              key={m._id}
              className={`grid grid-cols-[3fr_2fr_1fr_auto] gap-4 p-4 items-center bg-white ${index !== measures.length - 1 ? 'border-b border-gray-200' : ''}`}
            >
              <div className="font-semibold text-[#00253E] text-[16px] truncate">
                {m.name}
              </div>
              <div className="text-gray-600 text-[16px]">{m.type}</div>
              <div>
                <span
                  className={`px-4 py-1.5 rounded-full text-[14px] font-medium whitespace-nowrap ${getCategoryBadgeColor(m.category)}`}
                >
                  {m.category || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 w-16">
                <button
                  onClick={() => setEditingMeasure(m)}
                  className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm('Are you sure you want to delete this measure?')
                    ) {
                      deleteMutation.mutate(m._id)
                    }
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="h-[48px] px-8 rounded-[4px] flex items-center gap-2 bg-[#B5CC2E] border-none text-[#00253E] hover:bg-[#A3B829] font-medium"
          >
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00253E]/70" />
              Stakeholder
            </span>
          </Button>
          {onOverview && (
            <Button
              variant="outline"
              onClick={onOverview}
              className="h-[48px] px-8 rounded-[4px] flex items-center gap-2 bg-[#B5CC2E] border-none text-[#00253E] hover:bg-[#A3B829] font-medium"
            >
              <span className="flex items-center gap-2">
                overview <ChevronsRight className="w-4 h-4" />
              </span>
            </Button>
          )}
        </div>

        <Button
          onClick={() => setIsAdding(true)}
          className="bg-primary hover:bg-primary/90 text-[#00253E] px-8 h-[48px] rounded-[8px] flex items-center gap-2 font-semibold"
        >
          Add New Measure
          <ChevronsRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
