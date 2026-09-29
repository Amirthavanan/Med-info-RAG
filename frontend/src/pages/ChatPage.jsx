import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  Send,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Info
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { api } from '../services/api'
import { useToast } from '../hooks/useToast'

export function ChatPage({ stats, onNavigate }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('medinfo_chat_messages')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [expandedSources, setExpandedSources] = useState({})
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const toast = useToast()

  // Save conversation in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('medinfo_chat_messages', JSON.stringify(messages))
    } catch (e) {
      console.warn('Failed to save chat to localStorage', e)
    }
  }, [messages])

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const toggleSource = (msgIndex, sourceIndex) => {
    const key = `${msgIndex}-${sourceIndex}`
    setExpandedSources((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    toast.success('Copied to Clipboard', 'Answer copied to clipboard.')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const clearChat = () => {
    setMessages([])
    setExpandedSources({})
    try {
      localStorage.removeItem('medinfo_chat_messages')
    } catch {}
    toast.info('Chat Cleared', 'Conversation history has been reset.')
  }

  const sendMessage = async (overridePrompt) => {
    const textToSend = (overridePrompt || input).trim()
    if (!textToSend || isLoading) return

    const userMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setIsLoading(true)

    try {
      // Format chat history for context
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await api.sendChatMessage(textToSend, historyPayload)

      const assistantMessage = {
        role: 'assistant',
        content: response.answer || 'No answer returned.',
        sources: response.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errDetail = err.response?.data?.detail || err.message || 'An error occurred during retrieval'
      toast.error('Query Failed', errDetail)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Error retrieving information:** ${errDetail}\n\nPlease verify that relevant drug documents are indexed and the backend service is reachable.`,
          sources: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const exampleQueries = [
    'What are the indicated uses and dosage for the indexed drug?',
    'What boxed warnings or contraindications are listed in the label?',
    'What are the most frequent adverse reactions reported?',
    'What drug interactions should clinicians monitor?',
  ]

  const hasDocs = (stats?.total_chunks || 0) > 0

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto rounded-3xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
      {/* Chat Header Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              MedInfo Clinical Drug Assistant
              <Badge variant="success" className="text-[10px] py-0">
                Grounded RAG
              </Badge>
            </h2>
            <p className="text-xs text-slate-500">
              Answers are strictly grounded in indexed official pharmaceutical documents
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="text-xs text-slate-600 hover:text-rose-600 hover:border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear Chat
          </Button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto text-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-600 mb-5 shadow-inner">
              <Sparkles className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-800">
              Ask About Indexed Drug Labels
            </h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Every substantive statement is substantiated by retrieved document chunks with source file titles and exact page citations.
            </p>

            {!hasDocs && (
              <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-center gap-2.5 text-left">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-semibold">No drug labels indexed yet</p>
                  <p className="text-amber-700 mt-0.5">
                    Upload official PDF prescribing information or Medication Guides first so the RAG assistant has context to answer.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => onNavigate('upload')}
                  className="shrink-0 text-xs bg-amber-600 hover:bg-amber-700"
                >
                  Upload PDF
                </Button>
              </div>
            )}

            {/* Prompt Suggestion Pills */}
            <div className="mt-8 w-full space-y-2 text-left">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block text-center">
                Suggested Clinical Questions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {exampleQueries.map((query, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(query)}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 text-xs font-medium text-slate-700 text-left transition-all duration-150 shadow-subtle group"
                  >
                    <span className="group-hover:text-blue-600 transition-colors">
                      "{query}"
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Message List */
          messages.map((msg, index) => {
            const isUser = msg.role === 'user'

            return (
              <div
                key={index}
                className={`flex gap-3 md:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm mt-1">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div className={`max-w-[85%] md:max-w-[78%] space-y-2`}>
                  {/* Bubble */}
                  <div
                    className={`rounded-2xl p-4 md:p-5 shadow-sm transition-all ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white border border-slate-200/90 text-slate-900 rounded-bl-sm'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-sm font-normal whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <div className="prose-medical text-sm">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>

                        {/* Action buttons (Copy) */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                          <span className="text-[11px]">{msg.timestamp}</span>
                          <button
                            onClick={() => handleCopy(msg.content, index)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                            title="Copy answer"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Answer</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Retrieved Sources Accordion (For Assistant) */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          Retrieved Sources ({msg.sources.length})
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          Click to expand passage
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {msg.sources.map((src, sIdx) => {
                          const isExpanded = expandedSources[`${index}-${sIdx}`]
                          const docName = src.document || src.source || 'Document'
                          const pageNum = src.page || '?'
                          const passageText = src.content || src.text || ''

                          return (
                            <div
                              key={sIdx}
                              className="rounded-xl border border-slate-200 bg-white overflow-hidden text-xs transition-colors"
                            >
                              <button
                                onClick={() => toggleSource(index, sIdx)}
                                className="w-full flex items-center justify-between p-2.5 text-left hover:bg-slate-50 font-medium text-slate-700 transition-colors"
                              >
                                <span className="flex items-center gap-2 truncate pr-2">
                                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                                    {sIdx + 1}
                                  </span>
                                  <span className="font-semibold text-slate-800 truncate" title={docName}>
                                    {docName}
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-blue-600 shrink-0 font-medium">
                                    Page {pageNum}
                                  </span>
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                              </button>

                              {isExpanded && (
                                <div className="p-3 bg-slate-50/90 border-t border-slate-100 text-slate-600 text-[11.5px] leading-relaxed whitespace-pre-wrap font-mono">
                                  {passageText}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700 shadow-sm mt-1">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 md:gap-4 items-start animate-in fade-in">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm mt-1">
              <Bot className="h-5 w-5" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Searching drug monographs & synthesizing grounded answer...
              </div>
              <div className="space-y-1.5 w-64 pt-1">
                <div className="h-2 rounded bg-slate-200 animate-pulse w-full"></div>
                <div className="h-2 rounded bg-slate-200 animate-pulse w-4/5"></div>
                <div className="h-2 rounded bg-slate-200 animate-pulse w-3/5"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="p-4 border-t border-slate-200/80 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="relative flex items-end gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-subtle focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask about contraindications, dosage, boxed warnings, or adverse effects..."
            className="flex-1 max-h-36 resize-none border-0 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
          />

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            isLoading={isLoading}
            className="rounded-xl h-10 w-10 shrink-0 bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center justify-between mt-2 px-2 text-[11px] text-slate-400">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>Education & document lookup only</span>
        </div>
      </div>
    </div>
  )
}
