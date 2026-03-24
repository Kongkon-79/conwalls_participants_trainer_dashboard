import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import { DashboardSidebar } from './_components/dashboard-sidebar'
import DashboardHeader from './_components/dashboard-header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full">
        {/* ✅ Full Width Header */}
        <div className=" w-full sticky top-0 z-50">
          <DashboardHeader />
        </div>

        {/* ✅ Sidebar + Content */}
        <div className="flex w-full">
          {/* Sidebar */}
          <div style={{ '--sidebar-width': '320px' } as React.CSSProperties}>
            <DashboardSidebar />
          </div>

          {/* Main Content */}
          <main className="min-w-0 flex-1 bg-[#F8F9FA] min-h-screen p-4 overflow-x-hidden">
            <div className="lg:hidden p-4">
              <SidebarTrigger />
            </div>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
