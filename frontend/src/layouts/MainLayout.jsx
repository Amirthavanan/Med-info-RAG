import React, { useState } from 'react'
import { Sidebar } from '../components/common/Sidebar'
import { Header } from '../components/common/Header'
import { SafetyBanner } from '../components/common/SafetyBanner'

export function MainLayout({ activeTab, onSelectTab, stats, onRefresh, children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50">
      {/* Top medical safety advisory banner */}
      <SafetyBanner />

      <div className="flex flex-1 overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          stats={stats}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            activeTab={activeTab}
            stats={stats}
            onRefresh={onRefresh}
            onNavigate={onSelectTab}
            onToggleMobile={() => setIsMobileOpen((prev) => !prev)}
          />

          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/70">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
