'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { Pencil, Trash2, Plus, Loader2, ChevronLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Stakeholder, StakeholdersResponse } from './stakeholder-types'
import { Input } from '@/components/ui/input'
import StakeholderForm from './stakeholder-form'
import TriggerForm from './trigger-form'
import MeasureList from './measure-list'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface StakeholderListProps {
    projectId: string
    onBack: () => void
    onNext: () => void
    onSubStepChange?: (subStep: 'Trigger' | 'Measures' | null) => void
}

export default function StakeholderList({ projectId, onBack, onNext, onSubStepChange }: StakeholderListProps) {
    const session = useSession()
    const token = (session?.data?.user as { accessToken?: string })?.accessToken
    const queryClient = useQueryClient()

    const [editingNameId, setEditingNameId] = useState<string | null>(null)
    const [editNameValue, setEditNameValue] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [triggerStakeholder, setTriggerStakeholder] = useState<Stakeholder | null>(null)
    const [measuresStakeholder, setMeasuresStakeholder] = useState<Stakeholder | null>(null)
    const [deleteStakeholderId, setDeleteStakeholderId] = useState<string | null>(null)

    const { data, isLoading } = useQuery<StakeholdersResponse>({
        queryKey: ['stakeholders', projectId],
        queryFn: async () => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/stakeholder/${projectId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            if (!res.ok) throw new Error('Failed to fetch stakeholders')
            return res.json()
        },
        enabled: !!token && !!projectId,
    })

    const deleteMutation = useMutation({
        mutationFn: async (stakeholderId: string) => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/stakeholder/single/${stakeholderId}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            if (!res.ok) throw new Error('Failed to delete stakeholder')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stakeholders', projectId] })
            toast.success('Stakeholder deleted successfully')
        },
        onError: (err: Error) => {
            toast.error(err.message || 'Failed to delete stakeholder')
        }
    })

    const updateNameMutation = useMutation({
        mutationFn: async ({ id, name }: { id: string, name: string }) => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/stakeholder/single/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ name })
                }
            )
            if (!res.ok) throw new Error('Failed to update stakeholder')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stakeholders', projectId] })
            setEditingNameId(null)
            toast.success('Stakeholder updated successfully')
        },
        onError: (err: Error) => {
            toast.error(err.message || 'Failed to update stakeholder')
        }
    })

    if (isAdding) {
        return (
            <StakeholderForm
                projectId={projectId}
                onCancel={() => setIsAdding(false)}
                onSuccess={() => setIsAdding(false)}
            />
        )
    }

    if (triggerStakeholder) {
        return (
            <TriggerForm stakeholder={triggerStakeholder} onBack={() => {
                setTriggerStakeholder(null)
                onSubStepChange?.(null)
            }} />
        )
    }

    if (measuresStakeholder) {
        return (
            <MeasureList
                projectId={projectId}
                stakeholder={measuresStakeholder}
                onBack={() => {
                    setMeasuresStakeholder(null)
                    onSubStepChange?.(null)
                }}
                onOverview={() => {
                    setMeasuresStakeholder(null)
                    onSubStepChange?.(null)
                    onNext()
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

    const stakeholders = data?.data || []

    return (
        <div className="space-y-6 pb-10">

            <div className="space-y-0">
                {stakeholders.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 border rounded-lg">
                        No stakeholders found. Add one to get started.
                    </div>
                ) : (
                    stakeholders.map((sh, index) => (
                        <div
                            key={sh._id}
                            className={`flex items-center justify-between p-4 ${index !== stakeholders.length - 1 ? 'border-b border-gray-200' : ''}`}
                        >

                            <div className="flex items-center gap-4 flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <UsersIcon className="w-4 h-4" />
                                    </div>
                                    {editingNameId === sh._id ? (
                                        <div className="flex flex-col gap-2">
                                            <p className="text-sm text-[#00253E] font-medium mb-1">Enter the name of the target person / group</p>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={editNameValue}
                                                    onChange={e => setEditNameValue(e.target.value)}
                                                    className="w-[300px]"
                                                    autoFocus
                                                />
                                                <Button
                                                    onClick={() => updateNameMutation.mutate({ id: sh._id, name: editNameValue })}
                                                    className="bg-primary text-[#00253E] hover:bg-primary/90"
                                                    disabled={updateNameMutation.isPending || !editNameValue.trim()}
                                                >
                                                    Add
                                                </Button>
                                                <Button variant="ghost" onClick={() => setEditingNameId(null)}>Cancel</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-[20px] font-semibold text-[#00253E]">{sh.name}</span>
                                    )}
                                </div>

                                {editingNameId !== sh._id && (
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => { setEditingNameId(sh._id); setEditNameValue(sh.name); }}
                                            className="p-1.5 text-gray-500 hover:text-primary transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteStakeholderId(sh._id)}
                                            className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {editingNameId !== sh._id && (
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => {
                                            setTriggerStakeholder(sh)
                                            onSubStepChange?.('Trigger')
                                        }}
                                        className="flex items-center gap-2 text-[16px] font-medium text-[#00253E] hover:text-primary transition-colors"
                                    >
                                        Trigger
                                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setMeasuresStakeholder(sh)
                                            onSubStepChange?.('Measures')
                                        }}
                                        className="flex items-center gap-2 text-[16px] font-medium text-[#00253E] hover:text-primary transition-colors"
                                    >
                                        Measures
                                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="flex items-center justify-between pt-6">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="h-[48px] px-8 rounded-[8px] flex items-center gap-2 border-[#00253E]/20 text-[#00253E] hover:bg-gray-50 bg-white"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </Button>

                <Button
                    onClick={() => setIsAdding(true)}
                    className="bg-primary hover:bg-primary/90 text-[#00253E] px-8 h-[48px] rounded-[8px] flex items-center gap-2 font-semibold"
                >
                    <Plus className="w-5 h-5" />
                    Add (further Stakeholder)
                </Button>
                <Button
                    onClick={onNext}
                    className="bg-primary hover:bg-primary/90 text-[#00253E] px-8 h-[48px] rounded-[8px] flex items-center gap-2 font-semibold ml-4"
                >
                    Continue
                    <ChevronsRight className="w-5 h-5" />
                </Button>
            </div>

            <Dialog open={!!deleteStakeholderId} onOpenChange={(open) => !open && setDeleteStakeholderId(null)}>
                <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-[#00253E]">Delete Stakeholder</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Are you sure you want to delete this stakeholder? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" className="text-[#00253E]" onClick={() => setDeleteStakeholderId(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => {
                                if (deleteStakeholderId) {
                                    deleteMutation.mutate(deleteStakeholderId)
                                    setDeleteStakeholderId(null)
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}

function UsersIcon(props: React.ComponentProps<'svg'>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
