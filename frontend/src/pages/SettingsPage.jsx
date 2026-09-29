import React, { useState } from 'react'
import {
  Settings,
  Cpu,
  Database,
  Layers,
  ShieldAlert,
  Trash2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { api } from '../services/api'
import { useToast } from '../hooks/useToast'

export function SettingsPage({ stats, onRefresh }) {
  const [isClearModalOpen, setIsClearModalOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [healthStatus, setHealthStatus] = useState(null)
  const [pingLatency, setPingLatency] = useState(null)
  const toast = useToast()

  const handleTestConnection = async () => {
    setIsTesting(true)
    const start = performance.now()
    try {
      const data = await api.getHealth()
      const end = performance.now()
      setPingLatency(Math.round(end - start))
      setHealthStatus(data)
      toast.success('System Healthy', `Backend responded in ${Math.round(end - start)}ms`)
    } catch (err) {
      toast.error('Connection Failed', err.message)
      setHealthStatus({ status: 'unreachable' })
    } finally {
      setIsTesting(false)
    }
  }

  const handleClearKnowledgeBase = async () => {
    setIsClearing(true)
    try {
      await api.clearKnowledgeBase()
      toast.success('Knowledge Base Purged', 'All indexed documents and ChromaDB embeddings have been deleted.')
      setIsClearModalOpen(false)
      if (onRefresh) onRefresh()
    } catch (err) {
      toast.error('Clear Failed', err.response?.data?.detail || err.message)
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings & System Information
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Inspect RAG pipeline parameters, active Gemini neural models, and vector database telemetry.
        </p>
      </div>

      {/* System Telemetry & Health Test */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Service Diagnostics
            </CardTitle>
            <CardDescription>
              Real-time API connectivity and server status
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleTestConnection}
            isLoading={isTesting}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Ping Backend
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Backend API</span>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-bold text-slate-800">
                  {stats?.backend_status || 'Healthy'}
                </span>
              </div>
              {pingLatency !== null && (
                <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                  Latency: {pingLatency}ms
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Vector Storage</span>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-bold text-slate-800">
                  ChromaDB ({stats?.chroma_status || 'connected'})
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Cosine HNSW space
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Gemini API Key</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-slate-800">Configured</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Active in environment
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model & Chunking Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            RAG Pipeline Configuration
          </CardTitle>
          <CardDescription>
            Document chunking, overlap, and vector similarity thresholds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Generation Model</p>
                <p className="text-xs text-slate-500">Gemini model used for clinical answer synthesis</p>
              </div>
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                {stats?.generation_model || 'gemini-3.5-flash'}
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Embedding Model</p>
                <p className="text-xs text-slate-500">Dense embedding vectors for passage chunking</p>
              </div>
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                {stats?.embedding_model || 'gemini-embedding-001'}
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">ChromaDB Collection</p>
                <p className="text-xs text-slate-500">Target collection in persistent store</p>
              </div>
              <span className="font-mono text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                {stats?.collection_name || 'drug_labels'}
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Chunk Size</p>
                <p className="text-xs text-slate-500">Maximum characters per document chunk</p>
              </div>
              <span className="font-mono text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                {stats?.chunk_size || 1000} chars
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Chunk Overlap</p>
                <p className="text-xs text-slate-500">Character overlap to preserve boundary context</p>
              </div>
              <span className="font-mono text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                {stats?.chunk_overlap || 150} chars
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Top-K Retrieval</p>
                <p className="text-xs text-slate-500">Number of nearest passages returned per query</p>
              </div>
              <span className="font-mono text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                {stats?.top_k || 5} chunks
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scope and Disclaimer */}
      <Card className="border-blue-200/80 bg-blue-50/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-sm text-blue-950">Clinical Scope & Boundaries</p>
              <p>
                MedInfo RAG enforces strict zero-extrapolation constraints. The system:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-600 mt-1">
                <li>Does not diagnose patients or calculate personalized dosages.</li>
                <li>Does not extrapolate beyond the explicitly supplied text passages.</li>
                <li>Includes exact document and page citations for cross-referencing.</li>
                <li>Is intended solely for clinical reference and educational use.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-rose-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that clear all vector collections and documents
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm text-slate-800">Purge Entire Knowledge Base</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Delete all ChromaDB collections, embeddings, and uploaded document records.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsClearModalOpen(true)}
            className="shrink-0"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Clear Knowledge Base
          </Button>
        </CardContent>
      </Card>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Clear Entire Knowledge Base?"
        description="This will permanently delete all indexed PDF documents and embeddings from ChromaDB."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-900 leading-relaxed">
            <p className="font-semibold mb-1">Warning: Irreversible Action</p>
            <p>
              You are about to purge all {stats?.total_chunks || 0} vector chunks and all document metadata. Any ongoing conversations will no longer be able to reference previous documents until you re-upload them.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsClearModalOpen(false)}
              disabled={isClearing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearKnowledgeBase}
              isLoading={isClearing}
            >
              Yes, Purge Knowledge Base
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
