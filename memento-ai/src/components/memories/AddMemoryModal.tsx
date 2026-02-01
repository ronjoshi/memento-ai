'use client'

import { useState } from 'react'

interface AddMemoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (memoryData: string, tag: string) => Promise<void>
}

export default function AddMemoryModal({ isOpen, onClose, onSave }: AddMemoryModalProps) {
  const [memoryText, setMemoryText] = useState('')
  const [tagText, setTagText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSave = async () => {
    if (!memoryText.trim() || !tagText.trim()) {
      setError('Please enter both memory content and tag')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await onSave(memoryText.trim(), tagText.trim())
      setMemoryText('')
      setTagText('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save memory')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setMemoryText('')
      setTagText('')
      setError('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Memory
            </h3>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            <div>
              <label
                htmlFor="memory-content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Memory
              </label>
              <textarea
                id="memory-content"
                rows={4}
                value={memoryText}
                onChange={(e) => setMemoryText(e.target.value)}
                placeholder="What do you want to remember?"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="memory-tag"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Tag
              </label>
              <input
                id="memory-tag"
                type="text"
                value={tagText}
                onChange={(e) => setTagText(e.target.value)}
                placeholder="e.g., work, personal, ideas"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
