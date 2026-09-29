import React from 'react'
import {
  FileText,
  Layers,
  Database,
  Cpu,
  Server,
  ArrowRight,
  UploadCloud,
  MessageSquare,
  Sparkles,
  BookOpen,
  CheckCircle2,
  FileCheck
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatBytes } from '../lib/utils'

export function DashboardPage({ stats, documents, onNavigate }) {
  const statCards = [
    {
      title: 'Indexed Documents',
      value: stats?.total_documents ?? 0,
      description: 'Active PDF drug labels',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      title: 'Vector Chunks',
      value: stats?.total_chunks ?? 0,
      description: 'Semantic passage chunks',
      icon: Layers,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
    },
    {
      title: 'ChromaDB Status',
      value: stats?.chroma_status === 'connected' ? 'Connected' : 'Offline',
      description: `Collection: ${stats?.collection_name || 'drug_labels'}`,
      icon: Database,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      badge: 'Persistent Cosine',
    },
    {
      title: 'Backend Engine',
      value: stats?.backend_status === 'healthy' ? 'Healthy' : 'Initializing',
      description: 'FastAPI + Python RAG',
      icon: Server,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
      badge: 'Port 8000',
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Grounded Drug Monograph Intelligence</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              MedInfo <span className="text-blue-200">RAG</span>
            </h1>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed">
              Clinical Drug Information Assistant. Search, retrieve, and cross-reference FDA-approved prescribing labels and patient medication guides with exact source citations and page verification.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Button
              onClick={() => onNavigate('chat')}
              className="bg-white text-blue-700 hover:bg-blue-50 shadow-md border-0 font-semibold"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Ask MedInfo
            </Button>
            <Button
              onClick={() => onNavigate('upload')}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              Upload PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <Card key={idx} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="flex items-center justify-between p-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500">{card.title}</p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
                  <p className="text-xs text-slate-400">{card.description}</p>
                </div>
                <div className={`p-3.5 rounded-2xl ${card.bg} ${card.border} border`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Models & Architecture Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Specs Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              Active AI Configuration
            </CardTitle>
            <CardDescription>
              Gemini models driving embeddings and text synthesis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Generation Model
              </span>
              <p className="font-mono text-sm font-bold text-slate-800">
                {stats?.generation_model || 'gemini-3.5-flash'}
              </p>
              <p className="text-xs text-slate-500">
                Grounded responses with strict clinical constraints
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Embedding Model
              </span>
              <p className="font-mono text-sm font-bold text-slate-800">
                {stats?.embedding_model || 'gemini-embedding-001'}
              </p>
              <p className="text-xs text-slate-500">
                768-dimensional dense vector embeddings
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
              <div className="p-2 rounded-lg bg-slate-50">
                <span className="text-[10px] text-slate-400 block font-medium">Chunk Size</span>
                <span className="text-xs font-bold text-slate-700">{stats?.chunk_size || 1000}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50">
                <span className="text-[10px] text-slate-400 block font-medium">Overlap</span>
                <span className="text-xs font-bold text-slate-700">{stats?.chunk_overlap || 150}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50">
                <span className="text-[10px] text-slate-400 block font-medium">Top K</span>
                <span className="text-xs font-bold text-slate-700">{stats?.top_k || 5}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recently Indexed Documents Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Indexed Drug Labels
              </CardTitle>
              <CardDescription>
                Recently ingested pharmaceutical monographs
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('documents')}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-medium"
            >
              View All ({documents.length})
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                <FileText className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No documents indexed yet</p>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                  Upload FDA drug labels or Medication Guides in PDF format to build your knowledge base.
                </p>
                <Button size="sm" onClick={() => onNavigate('upload')}>
                  <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                  Upload First PDF
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id || doc.filename}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-800 truncate" title={doc.filename}>
                          {doc.filename}
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{doc.pages} pages</span>
                          <span>•</span>
                          <span>{doc.chunks} chunks</span>
                          {doc.file_size > 0 && (
                            <>
                              <span>•</span>
                              <span>{formatBytes(doc.file_size)}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success" className="shrink-0 text-[11px]">
                      Indexed
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RAG Pipeline Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document-Grounded RAG Flow</CardTitle>
          <CardDescription>
            Strict boundary pipeline ensuring zero hallucinations through exact drug-label context
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            {[
              { step: '1', title: 'React Frontend', desc: 'Vite UI & structured queries' },
              { step: '2', title: 'FastAPI Service', desc: 'REST endpoints & validation' },
              { step: '3', title: 'Dense Embeddings', desc: 'gemini-embedding-001 vectors' },
              { step: '4', title: 'ChromaDB Search', desc: 'Cosine top-k chunk retrieval' },
              { step: '5', title: 'Gemini LLM', desc: 'Citation-grounded synthesis' },
            ].map((node, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    {node.step}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">{node.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{node.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
