import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useTracking } from '../context/TrackingContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export default function EditProfile() {
  const { user } = useApp()
  const { trackPageNavigation } = useTracking()

  useEffect(() => {
    trackPageNavigation('/profile/edit', 'Edit Profile')
  }, [])

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '')
      setEmail(user.email || '')
      setPhotoUrl(user.avatar_url || '')
    }
  }, [user])

  const handleSave = (e) => {
    e.preventDefault()
    const payload = { full_name: fullName, email, avatar_url: photoUrl }
    // TODO: wire to backend or user service; currently a stub
    console.log('Save profile:', payload)
    alert('Profile saved (stub)')
  }

  return (
    <div className="flex h-screen w-full bg-background-dark">
      <main className="flex-1 px-6 py-10 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
          <p className="text-text-secondary mt-2">Update your name, email and avatar.</p>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-text-secondary text-sm mb-1 block">Full name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
          </div>

          <div>
            <label className="text-text-secondary text-sm mb-1 block">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div>
            <label className="text-text-secondary text-sm mb-1 block">Avatar URL</label>
            <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div className="pt-2">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </main>
    </div>
  )
}
