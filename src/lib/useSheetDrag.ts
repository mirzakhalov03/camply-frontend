import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type KeyboardEvent,
  type RefObject,
} from 'react'

/*
  Drag-to-dismiss for bottom sheets — Instagram-comments style. Grab the handle and
  the sheet follows your finger; it only closes if you pull it nearly all the way
  down (past `ratio` of the sheet's own height). Release at 50% or 80% and it springs
  back up. Pointer events (not click), so a plain tap never closes — Enter/Space
  keeps it keyboard-accessible.

  Pass the sliding panel's ref so the threshold scales to that sheet's height.
  Spread `handleProps` on the grab handle, `panelStyle` on the panel, and
  `backdropStyle` on the dimmed backdrop (it fades as the sheet is pulled away).
*/
export function useSheetDrag(
  onClose: () => void,
  panelRef: RefObject<HTMLDivElement | null>,
  ratio = 0.85,
) {
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(0)
  const heightRef = useRef(0)

  const handleProps = {
    onPointerDown: (e: PointerEvent) => {
      startY.current = e.clientY
      // Snapshot the sheet height at grab time — the threshold is a fraction of it.
      heightRef.current = panelRef.current?.offsetHeight ?? window.innerHeight
      setDragging(true)
      e.currentTarget.setPointerCapture?.(e.pointerId)
    },
    onPointerMove: (e: PointerEvent) => {
      if (!dragging) return
      // Downward only.
      setDragY(Math.max(0, e.clientY - startY.current))
    },
    onPointerUp: () => {
      if (!dragging) return
      setDragging(false)
      if (dragY > heightRef.current * ratio) onClose()
      setDragY(0) // else spring back to the top
    },
    onPointerCancel: () => {
      setDragging(false)
      setDragY(0)
    },
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClose()
      }
    },
  }

  const panelStyle: CSSProperties = {
    transform: `translateY(${dragY}px)`,
    transition: dragging ? 'none' : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
  }

  // Backdrop dims less the further the sheet is pulled — the peel-away feel.
  const progress = heightRef.current ? Math.min(1, dragY / heightRef.current) : 0
  const backdropStyle: CSSProperties = {
    opacity: 1 - progress * 0.8,
    transition: dragging ? 'none' : 'opacity 320ms ease',
  }

  return { handleProps, panelStyle, backdropStyle }
}
