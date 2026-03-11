import { Link } from 'react-router-dom'
import { SignUp } from '@clerk/clerk-react'

export default function Signup() {
  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-background-dark shadow-[0_0_20px_rgba(54,226,123,0.4)]">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            <span className="text-2xl font-bold text-white">Edu Buddy AI</span>
          </Link>
        </div>

        {/* Clerk SignUp Component */}
        <div className="flex justify-center">
          <SignUp 
            routing="path" 
            path="/signup"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-surface-dark border border-border-dark shadow-xl",
                headerTitle: "text-white",
                headerSubtitle: "text-text-secondary",
                socialButtonsBlockButton: "bg-input-dark border-border-dark text-white hover:bg-border-dark",
                formFieldInput: "bg-input-dark border-border-dark text-white",
                formButtonPrimary: "bg-primary hover:bg-primary-hover text-background-dark",
                footerActionLink: "text-primary hover:text-primary-hover"
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}