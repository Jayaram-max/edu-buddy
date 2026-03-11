import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useTracking } from '../context/TrackingContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export default function ScheduleSession() {
  const { user } = useApp()
  const { trackPageNavigation } = useTracking()

  useEffect(() => {
    trackPageNavigation('/schedule', 'Schedule Session')
  }, [])

  const [subject, setSubject] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [notes, setNotes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { subject, date, time, duration, notes, user: user?.id }
    // TODO: integrate with backend / calendar; for now log and show simple feedback
    console.log('Scheduled session:', payload)
    alert('Study session scheduled!')
    setSubject('')
    setDate('')
    setTime('')
    setDuration(60)
    setNotes('')
  }

  return (
    <div className="flex-1 h-full bg-background-dark">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Schedule Study Session</h1>
          <p className="text-text-secondary mt-2">Pick a time, subject and duration for your focused study session.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-text-secondary text-sm mb-1 block">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Calculus - Integrals" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Start time</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div>
              <label className="text-text-secondary text-sm mb-1 block">Duration (mins)</label>
              <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className="text-text-secondary text-sm mb-1 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-border-dark bg-[#1a1a1e] px-4 py-3 text-sm text-white placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              rows={5}
              placeholder="Any goals or topics to focus on during this session"
            />
          </div>

          <div className="pt-2">
            <Button type="submit">Schedule Session</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
