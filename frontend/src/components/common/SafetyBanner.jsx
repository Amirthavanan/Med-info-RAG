import React, { useState } from 'react'
import { ShieldAlert, X } from 'lucide-react'

export function SafetyBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-blue-50/90 border-b border-blue-100 text-blue-900 px-4 py-2 text-xs md:text-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="flex items-center justify-center p-1 rounded-md bg-blue-100/80 text-blue-700 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <p className="font-normal text-slate-700 leading-snug">
            <span className="font-semibold text-blue-900">Safety Notice: </span>
            MedInfo RAG provides document-grounded drug information for educational purposes. It is not a diagnostic, prescribing, or emergency-care system.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-blue-500 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100/50 transition-colors"
          title="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
