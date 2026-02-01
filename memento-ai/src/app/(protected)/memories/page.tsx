'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Memory } from '@/types'
import MemoryList from '@/components/memories/MemoryList'
import AddMemoryModal from '@/components/memories/AddMemoryModal'

export default function MemoriesPage() {
  const { signOut } = useAuth()
  const router = useRouter()
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [showTestResult, setShowTestResult] = useState(false)

  const loadMemories = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/memories')

      if (!response.ok) {
        throw new Error('Failed to fetch memories')
      }

      const data = await response.json()
      setMemories(data.memories)
    } catch (error) {
      console.error('Error loading memories:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMemories()
  }, [loadMemories])

  const handleSaveMemory = async (memoryData: string, tag: string) => {
    const response = await fetch('/api/memories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ memoryData, tag }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to save memory')
    }

    await loadMemories()
  }

  const handleTestEdge = async () => {
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setTestResult(`Error: ${data.error}`)
      } else {
        setTestResult(
          `Status: Success\n\nTotal Memories: ${data.data?.totalMemories || 0}\n\nSummary:\n${data.data?.summary || 'No summary available'}`
        )
      }
      setShowTestResult(true)
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setShowTestResult(true)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>

            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Memories
            </h1>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/search')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <button
                onClick={handleTestEdge}
                className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
              >
                Test Edge
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Add Memory"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MemoryList
          memories={memories}
          isLoading={isLoading}
          onRefresh={loadMemories}
        />
      </main>

      {/* Add Memory Modal */}
      <AddMemoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveMemory}
      />

      {/* Test Result Modal */}
      {showTestResult && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowTestResult(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edge Function Response
                </h3>
              </div>
              <div className="px-6 py-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                  {testResult}
                </pre>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={() => setShowTestResult(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
