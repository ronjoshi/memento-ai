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
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-card shadow-xl border border-card-border">
          {/* Header */}
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Add Memory
            </h3>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            <div>
              <label
                htmlFor="memory-content"
                className="block text-sm font-medium text-card-foreground mb-2"
              >
                Memory
              </label>
              <textarea
                id="memory-content"
                rows={4}
                value={memoryText}
                onChange={(e) => setMemoryText(e.target.value)}
                placeholder="What do you want to remember?"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder-muted-foreground resize-none"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="memory-tag"
                className="block text-sm font-medium text-card-foreground mb-2"
              >
                Tag
              </label>
              <input
                id="memory-tag"
                type="text"
                value={tagText}
                onChange={(e) => setTagText(e.target.value)}
                placeholder="e.g., work, personal, ideas"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder-muted-foreground"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-xl bg-error-light p-3 border border-error/20">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-secondary/10 rounded-xl disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary-hover rounded-xl disabled:opacity-50 flex items-center shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Memory'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
