'use client'

import { Memory } from '@/types'
import { formatDate } from '@/utils/date'

interface MemoryCardProps {
  memory: Memory
}

export default function MemoryCard({ memory }: MemoryCardProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-card-border p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200">
      <p className="text-card-foreground text-base leading-relaxed mb-3">
        {memory.memoryData}
      </p>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-accent text-accent-foreground">
          {memory.tag}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDate(memory.createdAt)}
        </span>
      </div>
    </div>
  )
}
