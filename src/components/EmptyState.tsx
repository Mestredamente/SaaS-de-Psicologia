import { FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in-up duration-500">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-200">
        <Icon className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">{title}</h3>
      {description && (
        <p className="text-slate-500 max-w-sm mb-8 text-lg leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all px-8 h-12 text-base rounded-full font-medium"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
