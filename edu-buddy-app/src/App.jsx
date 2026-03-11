import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { TrackingProvider } from './context/TrackingContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Quiz from './pages/Quiz'
import Progress from './pages/Progress'
import SmartNotes from './pages/SmartNotes'
import HowItWorks from './pages/HowItWorks'
import About from './pages/About'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Analytics from './pages/Analytics'
import ScheduleSession from './pages/ScheduleSession'
import DemoMountain from './pages/DemoMountain'



function App() {
  return (
    <AppProvider>
      <TrackingProvider>
        <Router>
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login/*" element={<Login />} />
          <Route path="/signup/*" element={<Signup />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/schedule" element={
            <ProtectedRoute>
              <ScheduleSession />
            </ProtectedRoute>
          } />
          <Route path="/quiz" element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          } />
          <Route path="/progress" element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          } />
          <Route path="/notes" element={
            <ProtectedRoute>
              <SmartNotes />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/profile/edit" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path="/demo-mountain" element={<DemoMountain />} />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
      </TrackingProvider>
    </AppProvider>
  )
}

export default App
