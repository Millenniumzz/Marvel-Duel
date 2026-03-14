import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  text?: string
}

export default function LoadingSpinner({ text = 'กำลังโหลด...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 size={40} className="text-marvel-red animate-spin" />
      <p className="text-gray-400">{text}</p>
    </div>
  )
}
