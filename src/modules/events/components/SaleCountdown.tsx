import { Statistic } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { countdownLabel, formatDuration } from '@/modules/events/model/labels'

type SaleCountdownProps = {
  target: string
  seconds: number
  onElapsed?: () => void
}

export function SaleCountdown({ target, seconds, onElapsed }: SaleCountdownProps) {
  const [left, setLeft] = useState(seconds)
  const fired = useRef(false)

  useEffect(() => {
    setLeft(seconds)
    fired.current = false
  }, [seconds, target])

  useEffect(() => {
    if (target === 'NONE') {
      return
    }
    const timer = window.setInterval(() => {
      setLeft((current) => (current <= 1 ? 0 : current - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [seconds, target])

  useEffect(() => {
    if (target === 'NONE' || left !== 0 || seconds <= 0 || fired.current) {
      return
    }
    fired.current = true
    onElapsed?.()
  }, [left, onElapsed, seconds, target])

  if (target === 'NONE') {
    return null
  }

  return <Statistic title={countdownLabel(target)} value={formatDuration(left)} />
}
