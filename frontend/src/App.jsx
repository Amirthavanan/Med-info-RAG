import React, { useState, useEffect, useCallback } from 'react'
import { MainLayout } from './layouts/MainLayout'
import { DashboardPage } from './pages/DashboardPage'
import { UploadPage } from './pages/UploadPage'
import { ChatPage } from './pages/ChatPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ToastProvider, useToast } from './hooks/useToast'
import { api } from './services/api'

function MedInfoApp() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('medinfo_active_tab') || 'dashboard'
  })
  const [stats, setStats] = useState(null)
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  const loadData = useCallback(async (quiet = false) => {
    try {
      const [statsData, docsData] = await Promise.all([
        api.getStats(),
        api.getDocuments(),
      ])
      setStats(statsData)
      setDocuments(docsData)
      if (!quiet) {
        toast.info('Data Synchronized', 'System statistics and documents updated.')
      }
    } catch (err) {
      console.error('Failed to load initial stats/documents:', err)
      if (!quiet) {
        toast.error('Connection Notice', 'Could not sync with FastAPI backend. Ensure backend is running.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData(true)
  }, [loadData])

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId)
    localStorage.setItem('medinfo_active_tab', tabId)
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            stats={stats}
            documents={documents}
            onNavigate={handleSelectTab}
          />
        )
      case 'upload':
        return (
          <UploadPage
            onUploadSuccess={() => loadData(true)}
            onNavigate={handleSelectTab}
          />
        )
      case 'chat':
        return (
          <ChatPage
            stats={stats}
            onNavigate={handleSelectTab}
          />
        )
      case 'documents':
        return (
          <DocumentsPage
            documents={documents}
            onRefresh={() => loadData(false)}
            onNavigate={handleSelectTab}
          />
        )
      case 'settings':
        return (
          <SettingsPage
            stats={stats}
            onRefresh={() => loadData(false)}
          />
        )
      default:
        return (
          <DashboardPage
            stats={stats}
            documents={documents}
            onNavigate={handleSelectTab}
          />
        )
    }
  }

  return (
    <MainLayout
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      stats={stats}
      onRefresh={() => loadData(false)}
    >
      {renderActivePage()}
    </MainLayout>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <MedInfoApp />
    </ToastProvider>
  )
}
