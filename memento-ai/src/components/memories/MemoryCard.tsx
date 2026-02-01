'use client'

import { Memory } from '@/types'
import { formatDate } from '@/utils/date'

interface MemoryCardProps {
  memory: Memory
}

export default function MemoryCard({ memory }: MemoryCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <p className="text-gray-900 dark:text-white text-base leading-relaxed mb-3">
        {memory.memoryData}
      </p>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {memory.tag}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(memory.createdAt)}
        </span>
      </div>
    </div>
  )
}
