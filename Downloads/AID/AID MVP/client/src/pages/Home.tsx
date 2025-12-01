import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleGetStarted = () => {
    if (user) {
      // Redirect based on role
      if (user.role === 'customer') {
        navigate('/map')
      } else {
        navigate('/dashboard')
      }
    } else {
      navigate('/signup')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Hello World! 👋
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to AID MVP - Your full-stack application is ready!
        </p>
        
        {user ? (
          <div className="space-y-4">
            <p className="text-gray-700 mb-4">
              Welcome back, <span className="font-semibold">{user.name}</span>! 
              You are logged in as a <span className="font-semibold">{user.role}</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Go to {user.role === 'customer' ? 'Map' : 'Dashboard'}
              </button>
              <button
                onClick={logout}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Sign Up
            </Link>
          </div>
        )}
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            ✅ React + TypeScript + Vite<br />
            ✅ Tailwind CSS<br />
            ✅ React Router<br />
            ✅ Authentication & Role-Based Access<br />
            ✅ Backend API Ready
          </p>
        </div>
      </div>
    </div>
  )
}

