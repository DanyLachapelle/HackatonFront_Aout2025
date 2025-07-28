import { useWindowStore } from "@/stores/window-store"
import { Window } from "./window"

export function WindowManager() {
  const { windows } = useWindowStore()

  return (
    <>
      {windows.map((window) => (
        <Window key={window.id} window={window} />
      ))}
    </>
  )
} 