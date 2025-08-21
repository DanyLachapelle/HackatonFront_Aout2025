import React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <Card className="w-96 max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          {title && (
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
          )}
          {children}
        </CardContent>
      </Card>
    </div>
  )
}
