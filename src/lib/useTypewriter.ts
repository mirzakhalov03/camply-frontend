import { useEffect, useState } from 'react'

/*
  Reveals `text` one character at a time, like it's being typed. Returns the
  portion shown so far plus a `done` flag (handy for a caret). Honors
  prefers-reduced-motion by showing the full text immediately (no animation).

  `start` gates the animation: pass false while the screen is offscreen so the
  title waits and types when it actually appears (the onboarding pager keeps both
  screens mounted, so without this the title would finish typing before the user
  ever slides to it). Restarts whenever `text` changes — so switching language
  retypes the new title.

  Why JS and not a CSS `steps()` typewriter: the classic CSS trick needs a single
  no-wrap line and a known character width. Our title is translated and can wrap
  to two lines, so revealing by character count in state is the robust approach.
*/
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

type Options = { speedMs?: number; start?: boolean }

export function useTypewriter(text: string, { speedMs = 60, start = true }: Options = {}) {
  const [count, setCount] = useState(0)

  // (Re)start when the text changes or the screen becomes active. While inactive
  // the title stays empty; it types out the moment `start` flips true.
  useEffect(() => {
    if (!start) {
      setCount(0)
      return
    }
    setCount(prefersReducedMotion() ? text.length : 0)
  }, [text, start])

  useEffect(() => {
    if (!start || count >= text.length) return
    const id = setTimeout(() => setCount((c) => c + 1), speedMs)
    return () => clearTimeout(id)
  }, [count, text, start, speedMs])

  return { shown: text.slice(0, count), done: start && count >= text.length }
}
