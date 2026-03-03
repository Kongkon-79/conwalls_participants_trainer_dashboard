'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useSystemSettings } from '@/hooks/use-system-settings'

interface StakeholderFormProps {
    projectId: string
    onCancel: () => void
    onSuccess: () => void
}

type FormValues = {
    name: string
}

export default function StakeholderForm({
    projectId,
    onCancel,
    onSuccess,
}: StakeholderFormProps) {
    const session = useSession()
    const token = (session?.data?.user as { accessToken?: string })?.accessToken
    const queryClient = useQueryClient()

    const { register, handleSubmit } = useForm<FormValues>()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: systemSettings } = useSystemSettings()

    const submitMutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/stakeholder/${projectId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(values),
                }
            )
            if (!res.ok) throw new Error('Failed to create stakeholder')
            return res.json()
        },
        onSuccess: () => {
            toast.success('Stakeholder created successfully')
            queryClient.invalidateQueries({ queryKey: ['stakeholders', projectId] })
            onSuccess()
        },
        onError: (err: Error) => {
            toast.error(err.message || 'Something went wrong')
        },
    })

    // Basic stakeholder creation only needs the name according to Figma. Trigger evaluation happens in the Trigger step.

    const onSubmit = (values: FormValues) => {
        submitMutation.mutate(values)
    }

    return (
        <div className="w-full max-w-2xl space-y-8 pb-10">

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#00253E]/60" />
                        <label className="text-[20px] font-medium text-[#00253E]">
                            Enter the name of the target person / group
                        </label>
                    </div>
                    <Input
                        {...register('name', { required: true })}
                        placeholder="e.g. Accounting, IT Department, Sales team"
                        className="h-[48px] border-[#00253E]/20 text-[16px] rounded-[4px] focus-visible:ring-primary shadow-sm placeholder:text-[#616161]"
                    />
                </div>

                <div className="flex items-center justify-between pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="h-[48px] px-8 rounded-[8px] flex items-center gap-2 border-[#00253E]/20 text-[#00253E] hover:bg-gray-50 bg-white cursor-pointer"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back
                    </Button>

                    <Button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="bg-primary hover:bg-primary/90 text-[#00253E] px-8 h-[48px] rounded-[8px] flex items-center gap-2 font-semibold transition-all duration-200"
                    >
                        {submitMutation.isPending ? 'Adding...' : 'Add'}
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </form>
        </div>
    )
}
