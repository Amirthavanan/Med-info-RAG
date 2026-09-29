import React, { useState } from 'react'
import {
  FileText,
  Trash2,
  Search,
  UploadCloud,
  Layers,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  Info
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { formatBytes, formatDate } from '../lib/utils'
import { api } from '../services/api'
import { useToast } from '../hooks/useToast'

export function DocumentsPage({ documents, onRefresh, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const toast = useToast()

  const filteredDocs = documents.filter((doc) =>
    (doc.filename || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteCandidate) return

    setIsDeleting(true)
    try {
      const res = await api.deleteDocument(deleteCandidate.id || deleteCandidate.filename)
      toast.success(
        'Document Removed',
        `Successfully removed "${deleteCandidate.filename}" and deleted ${res.deleted_chunks || 0} vector chunks.`
      )
      setDeleteCandidate(null)
      if (onRefresh) onRefresh()
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to delete document'
      toast.error('Deletion Failed', msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Indexed Monograph Repository
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Official pharmaceutical prescribing information stored in the ChromaDB vector database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="rounded-xl text-slate-600"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Sync
          </Button>
          <Button
            size="sm"
            onClick={() => onNavigate('upload')}
            className="rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload New PDF
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents by drug name or filename..."
                className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{filteredDocs.length}</span> of{' '}
              <span className="font-bold text-slate-800">{documents.length}</span> documents
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Table */}
      <Card className="overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Document Filename
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">
                  Pages
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">
                  Vector Chunks
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  File Size
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Indexed Date
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No documents found</p>
                    <p className="text-xs mt-1">
                      {searchTerm
                        ? 'No indexed PDF matches your search term.'
                        : 'Your knowledge base is empty. Upload drug labels to begin.'}
                    </p>
                    {!searchTerm && (
                      <Button
                        size="sm"
                        onClick={() => onNavigate('upload')}
                        className="mt-4 text-xs"
                      >
                        <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                        Upload Document
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id || doc.filename}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 max-w-xs md:max-w-sm truncate">
                          <p className="font-semibold text-slate-900 truncate" title={doc.filename}>
                            {doc.filename}
                          </p>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ID: {doc.id || 'reg'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">
                      {doc.pages}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full text-xs">
                        <Layers className="w-3 h-3" />
                        {doc.chunks}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {doc.file_size ? formatBytes(doc.file_size) : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(doc.indexed_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="success" className="text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Indexed
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCandidate(doc)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                        title="Delete from knowledge base"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteCandidate)}
        onClose={() => setDeleteCandidate(null)}
        title="Remove Document from Knowledge Base"
        description="This will permanently delete all associated passage embeddings and chunks from ChromaDB."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 leading-relaxed">
              <p className="font-semibold text-sm mb-1">Confirm deletion:</p>
              <p className="font-mono bg-white/70 p-1.5 rounded border border-rose-200 truncate">
                {deleteCandidate?.filename}
              </p>
              <p className="mt-1">
                Removing this document will erase {deleteCandidate?.chunks || 0} indexed vector chunks. The drug information assistant will no longer be able to reference this label.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteCandidate(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
