import React from 'react'
import {
  LayoutDashboard,
  UploadCloud,
  MessageSquare,
  FileText,
  Settings,
  Pill,
  Database,
  Cpu,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import { cn } from '../../lib/utils'

export function Sidebar({ activeTab, onSelectTab, stats, isMobileOpen, setIsMobileOpen }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      description: 'System overview & stats'
    },
    {
      id: 'upload',
      label: 'Upload & Index',
      icon: UploadCloud,
      badge: 'PDF',
      description: 'Add drug label documents'
    },
    {
      id: 'chat',
      label: 'Drug Information Chat',
      icon: MessageSquare,
      badge: 'RAG',
      description: 'Query grounded drug facts'
    },
    {
      id: 'documents',
      label: 'Indexed Documents',
      icon: FileText,
      badge: stats ? `${stats.total_documents || 0}` : null,
      description: 'Manage document repository'
    },
    {
      id: 'settings',
      label: 'Settings & System',
      icon: Settings,
      badge: null,
      description: 'Pipeline config & health'
    },
  ]

  const handleNavClick = (id) => {
    onSelectTab(id)
    if (setIsMobileOpen) {
      setIsMobileOpen(false)
    }
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-white shadow-card transition-transform duration-300 lg:static lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header / Brand */}
        <div className="flex h-20 items-center gap-3.5 border-b border-slate-100 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-50">
            <Pill className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                MedInfo <span className="text-blue-600">RAG</span>
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Drug Information Assistant
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-blue-50/80 text-blue-700 shadow-sm border border-blue-100 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-left">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                      isActive
                        ? 'bg-blue-200/60 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Bottom system status card */}
        <div className="p-4 border-t border-slate-100">
          <div className="rounded-xl border border-slate-200/70 bg-gradient-to-b from-slate-50 to-white p-3.5 text-xs text-slate-600 space-y-2.5">
            <div className="flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                System Status
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Online
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500">
                  <Database className="w-3 h-3 text-slate-400" />
                  ChromaDB
                </span>
                <span className="font-semibold text-slate-700">
                  {stats?.total_chunks || 0} chunks
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500">
                  <Cpu className="w-3 h-3 text-slate-400" />
                  LLM Model
                </span>
                <span className="font-mono text-[10px] text-slate-700 truncate max-w-[120px]" title={stats?.generation_model}>
                  {stats?.generation_model || 'gemini-flash'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
