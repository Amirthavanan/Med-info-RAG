import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  FileCheck,
  Layers,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'
import { formatBytes } from '../lib/utils'
import { api } from '../services/api'
import { useToast } from '../hooks/useToast'

export function UploadPage({ onUploadSuccess, onNavigate }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState('') // 'uploading' | 'indexing' | 'done' | ''
  const [uploadPercent, setUploadPercent] = useState(0)
  const [results, setResults] = useState([])
  const fileInputRef = useRef(null)
  const toast = useToast()

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (incoming) => {
    const validPdfs = incoming.filter((file) => {
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'
      if (!isPdf) {
        toast.warning('Invalid File Type', `${file.name} is not a PDF. Only PDF drug labels are supported.`)
      }
      return isPdf
    })

    if (validPdfs.length === 0) return

    // Prevent duplicate entries in selection
    setSelectedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name))
      const fresh = validPdfs.filter((f) => !existingNames.has(f.name))
      return [...prev, ...fresh]
    })
  }

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUploadAndIndex = async () => {
    if (selectedFiles.length === 0) return

    setIsProcessing(true)
    setCurrentStep('uploading')
    setUploadPercent(0)
    setResults([])

    try {
      // 1. Upload files with progress tracking
      setCurrentStep('indexing')
      const response = await api.uploadDocuments(selectedFiles, (percent) => {
        setUploadPercent(percent)
        if (percent === 100) {
          setCurrentStep('indexing')
        }
      })

      if (response && response.results) {
        setResults(response.results)
        const successful = response.results.filter((r) => r.status === 'indexed')
        const failed = response.results.filter((r) => r.status === 'error')

        if (successful.length > 0) {
          toast.success(
            'Documents Indexed',
            `Successfully processed ${successful.length} drug document${successful.length > 1 ? 's' : ''}.`
          )
          if (onUploadSuccess) onUploadSuccess()
        }

        if (failed.length > 0) {
          toast.error(
            'Indexing Warning',
            `${failed.length} document${failed.length > 1 ? 's' : ''} encountered errors.`
          )
        }
      }

      setCurrentStep('done')
      setSelectedFiles([])
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to process documents'
      toast.error('Processing Error', errorMsg)
      setCurrentStep('')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Upload & Index Drug Labels</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload FDA prescribing information, Medication Guides, or DailyMed drug labels to expand the vector knowledge base.
        </p>
      </div>

      {/* Drag & Drop Upload Card */}
      <Card>
        <CardContent className="p-8">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-sm">
              <UploadCloud className="h-8 w-8" />
            </div>
            <p className="text-base font-semibold text-slate-800">
              Drag & drop drug label PDFs here, or <span className="text-blue-600 underline">browse files</span>
            </p>
            <p className="text-xs text-slate-400 mt-1.5">
              Supports multiple PDF prescribing information monographs (Up to 50MB per file)
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                <span>Selected for Indexing ({selectedFiles.length})</span>
                <button
                  onClick={() => setSelectedFiles([])}
                  disabled={isProcessing}
                  className="text-rose-600 hover:underline disabled:opacity-50"
                >
                  Clear all
                </button>
              </div>

              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 text-sm hover:bg-slate-50/60">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-medium text-slate-800 truncate">{file.name}</p>
                        <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    {!isProcessing && (
                      <button
                        onClick={() => removeFile(i)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Real Progress indicator when indexing */}
              {isProcessing && (
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-blue-900 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      {currentStep === 'uploading'
                        ? `Uploading PDFs (${uploadPercent}%)...`
                        : 'Indexing document... Parsing pages, generating embeddings & storing into ChromaDB'}
                    </span>
                    <span className="text-xs font-mono text-blue-700">
                      {currentStep === 'uploading' ? `${uploadPercent}%` : 'In Progress'}
                    </span>
                  </div>
                  <Progress
                    value={currentStep === 'uploading' ? uploadPercent : 85}
                    indicatorClassName={currentStep === 'indexing' ? 'animate-pulse bg-indigo-600' : 'bg-blue-600'}
                  />
                  <p className="text-xs text-slate-500">
                    Extracting text chunks with pypdf and generating 768-dim embeddings via Google Gemini. Please keep this tab open.
                  </p>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleUploadAndIndex}
                  isLoading={isProcessing}
                  disabled={isProcessing || selectedFiles.length === 0}
                  className="w-full sm:w-auto px-8"
                >
                  <UploadCloud className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing Documents...' : `Start Indexing (${selectedFiles.length})`}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ingestion Results Table */}
      {results.length > 0 && (
        <Card className="border-emerald-100 shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-slate-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Indexing Summary
            </CardTitle>
            <CardDescription>
              Document chunking and vector storage results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {results.map((res, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  res.status === 'indexed'
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                    : 'border-rose-200 bg-rose-50/40 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {res.status === 'indexed' ? (
                    <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{res.filename}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {res.status === 'indexed'
                        ? `${res.pages} pages detected → ${res.chunks} vector chunks indexed`
                        : res.message || 'Indexing failed'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Badge variant={res.status === 'indexed' ? 'success' : 'destructive'}>
                    {res.status === 'indexed' ? 'Indexed Successfully' : 'Failed'}
                  </Badge>
                </div>
              </div>
            ))}

            <div className="pt-3 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => onNavigate('documents')}>
                View Knowledge Base
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
              <Button size="sm" onClick={() => onNavigate('chat')}>
                Ask Questions in Chat
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Authoritative Sources Reference Card */}
      <Card className="bg-slate-50/60 border-slate-200/80">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800 text-sm">Recommended Official Drug Sources</p>
              <p>
                For official label testing, download current PDF prescribing information monographs from:
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                <a
                  href="https://dailymed.nlm.nih.gov/dailymed/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                >
                  DailyMed (NLM / NIH)
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://labels.fda.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                >
                  FDA Online Label Repository
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400">
                Suggested test medicines: Metformin, Lisinopril, Ibuprofen, Amoxicillin, Atorvastatin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
