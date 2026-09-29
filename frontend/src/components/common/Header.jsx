import React from 'react'
import { Menu, RefreshCw, FileText, Layers, PlusCircle, Database, CheckCircle2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export function Header({ activeTab, stats, onRefresh, onNavigate, onToggleMobile }) {
  const titles = {
    dashboard: { title: 'Dashboard', subtitle: 'System overview & knowledge base intelligence' },
    upload: { title: 'Upload & Index Documents', subtitle: 'Process drug label prescribing information PDFs' },
    chat: { title: 'Drug Information Assistant', subtitle: 'Ask clinical queries grounded strictly in indexed drug labels' },
    documents: { title: 'Indexed Documents', subtitle: 'Manage active pharmaceutical monographs and label records' },
    settings: { title: 'System Information & Settings', subtitle: 'Pipeline configuration, models, and maintenance' },
  }

  const current = titles[activeTab] || { title: 'MedInfo RAG', subtitle: 'Healthcare Drug Assistant' }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 md:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          aria-label="Open Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            {current.title}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 md:gap-3">
        {/* Quick stat badges */}
        <div className="hidden md:flex items-center gap-2 border-r border-slate-200 pr-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-600">Docs:</span>
            <span className="font-semibold text-slate-800">{stats?.total_documents ?? 0}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-slate-600">Chunks:</span>
            <span className="font-semibold text-slate-800">{stats?.total_chunks ?? 0}</span>
          </div>
        </div>

        {/* Action buttons */}
        {activeTab !== 'upload' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('upload')}
            className="hidden sm:inline-flex gap-1.5 text-xs rounded-xl"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            Upload PDF
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          title="Refresh Data & Stats"
          className="rounded-xl text-slate-500 hover:text-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
