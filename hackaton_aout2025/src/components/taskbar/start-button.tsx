import { useState } from "react"
import { Button } from "@/components/ui/button"
import { StartMenu } from "./start-menu"

export function StartButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        className="text-white hover:bg-white/10 h-8 w-8 p-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        ⊞
      </Button>
      {isOpen && <StartMenu onClose={() => setIsOpen(false)} />}
    </>
  )
} 