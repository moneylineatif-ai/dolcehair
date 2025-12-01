import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

interface LoginModalProps {
  onClose: () => void
  onSuccess?: () => void
  role?: 'customer' | 'mechanic'
}

export default function LoginModal({ onClose, onSuccess, role }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()

  // Close modal when user successfully logs in
  useEffect(() => {
    if (user) {
      // Verify role matches if specified
      if (role && user.role !== role) {
        setError(`This login is for ${role}s only. Please use the ${user.role} sign in.`)
        return
      }
      onSuccess?.()
      onClose()
    }
  }, [user, onSuccess, onClose, role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      setLoading(false)
      // Modal will close via useEffect when user state updates
    } else {
      setError(result.error || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 safe-area-inset">
      <div className="bg-gradient-to-br from-black/95 to-purple-900/40 border border-purple-500/30 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-400 hover:text-purple-300 transition-colors touch-manipulation"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6 text-glow">
          {role === 'mechanic' ? 'Mechanic Sign In' : role === 'customer' ? 'Customer Sign In' : 'Sign In'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-300 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-purple-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-black/60 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-purple-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-black/60 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all font-semibold shadow-lg active:scale-[0.98] transform touch-manipulation min-h-[50px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-purple-400">
          Don't have an account?{' '}
          <button
            onClick={() => {
              // You can add signup modal here later
              alert('Sign up feature coming soon!')
            }}
            className="text-purple-300 hover:text-purple-200 underline transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}

