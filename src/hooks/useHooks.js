import { useState, useEffect, useCallback, useRef } from 'react'

export function useCountdown(endTime) {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (!endTime) return

    const calcRemaining = () => {
      const diff = Math.max(0, Math.floor((new Date(endTime) - new Date()) / 1000))
      return diff
    }

    setSecondsLeft(calcRemaining())

    const interval = setInterval(() => {
      const remaining = calcRemaining()
      setSecondsLeft(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 1000)

    return () => clearInterval(interval)
  }, [endTime])

  const isExpired = secondsLeft <= 0 && endTime
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return { secondsLeft, minutes, seconds, formatted, isExpired }
}

export function useAutoSave(content, saveFn, interval = 60000) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const contentRef = useRef(content)
  const lastSavedContentRef = useRef(content)

  useEffect(() => {
    contentRef.current = content
  }, [content])

  const save = useCallback(async () => {
    if (contentRef.current === lastSavedContentRef.current) return
    setIsSaving(true)
    try {
      await saveFn(contentRef.current)
      lastSavedContentRef.current = contentRef.current
      setLastSaved(new Date())
    } catch (err) {
      console.error('Auto-save failed:', err)
    } finally {
      setIsSaving(false)
    }
  }, [saveFn])

  useEffect(() => {
    const timer = setInterval(save, interval)
    return () => clearInterval(timer)
  }, [save, interval])

  return { isSaving, lastSaved, saveNow: save }
}
