'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import KickOffDateForm from './_components/kick-off-date-form'
import SystemForms from './_components/system-forms'
import StakeholderList from './_components/stakeholder-list'
import { Loader2 } from 'lucide-react'
import StepNavigation from './_components/step-navigation'
import { Scroll, Users, ClipboardList, Clock } from 'lucide-react'
import Timetable from './_components/timetable'



export default function InsightEnginePage() {
  const { projectId } = useParams() as { projectId: string }
  const session = useSession()
  const token = (session?.data?.user as { accessToken?: string })?.accessToken

  const [step, setStep] = useState(1)
  const [kickOffDate, setKickOffDate] = useState<Date>()
  const [activeSubStep, setActiveSubStep] = useState<'Trigger' | 'Measures' | null>(null)

  const { data: projectData, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/insight-engine/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!res.ok) throw new Error('Failed to fetch project')
      return res.json()
    },
    enabled: !!token && !!projectId,
  })

  // Sync state with fetched project data
  React.useEffect(() => {
    if (projectData?.data) {
      const data = projectData.data;
      if (data.kickOffDate) {
        const date = new Date(data.kickOffDate);
        setKickOffDate(date);

        // If kickOffDate exists, we are at least at step 2
        // Check if systemForms exists to determine if we move to step 3
        if (data.systemForms && Object.keys(data.systemForms).length > 0) {
          setStep(3);
        } else {
          setStep(2);
        }
      }
    }
  }, [projectData]);

  const projectTitle = projectData?.data?.projectTitle || 'Project';

  const STEPS = [
    { id: 1, title: projectTitle, icon: Scroll },
    { id: 2, title: 'Stakeholder', icon: Users },
    { id: 3, title: activeSubStep === 'Trigger' ? 'Trigger' : 'Measures', icon: ClipboardList },
    { id: 4, title: 'Timetable', icon: Clock },
  ];

  // Logic to determine which tab should be ACTIVE based on internal state
  // Step 1: KickOffDateForm -> Active: 1 (Project Title)
  // Step 2: SystemForms -> Active: 1 (Project Title) - This fixes the first issue
  // Step 3: StakeholderList (List view) -> Active: 2 (Stakeholder) - This fixes the second issue
  // Step 3: StakeholderList (Trigger sub-step) -> Active: 3 (Trigger)
  // Step 3: StakeholderList (Measures sub-step) -> Active: 3 (Measures)
  // Step 4: Timetable -> Active: 4 (Timetable)

  let activeTabId = step;
  if (step === 2) {
    activeTabId = 1; // Highlight Project Tab during System Forms
  } else if (step === 3) {
    if (activeSubStep === 'Trigger' || activeSubStep === 'Measures') {
      activeTabId = 3; // Highlight Measures/Trigger during sub-steps
    } else {
      activeTabId = 2; // Highlight Stakeholder during List view
    }
  }

  let displaySteps = STEPS;
  if (activeSubStep) {
    displaySteps = STEPS.slice(0, 3);
  }

  if (isProjectLoading || !session.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className=" mx-auto py-6 px-4 w-full">
      <StepNavigation
        currentStep={activeTabId}
        steps={displaySteps}
      />

      {step === 1 && (
        <KickOffDateForm
          projectTitle={projectTitle}
          initialDate={kickOffDate}
          onNext={date => {
            setKickOffDate(date)
            setStep(2)
          }}
        />
      )}

      {step === 2 && kickOffDate && (
        <SystemForms
          projectId={projectId}
          projectTitle={projectTitle}
          kickOffDate={kickOffDate}
          initialData={projectData?.data?.systemForms}
          onBack={() => {
            setStep(1)
          }}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <StakeholderList
          projectId={projectId}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
          onSubStepChange={setActiveSubStep}
        />
      )}

      {step === 4 && kickOffDate && (
        <Timetable
          projectId={projectId}
          projectTitle={projectTitle}
          kickOffDate={kickOffDate}
          onBack={() => setStep(3)}
        />
      )}
    </div>
  )
}
