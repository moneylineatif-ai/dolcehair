import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProfileDropdownProps {
  compact?: boolean
}

export default function ProfileDropdown({ compact = false }: ProfileDropdownProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!user) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[1.5rem] hover:from-purple-500 hover:to-pink-500 transition-all font-semibold shadow-lg active:scale-[0.95] transform touch-manipulation ${
          compact 
            ? 'px-2 py-1.5 min-h-[36px] text-xs' 
            : 'px-3 sm:px-5 py-2 text-xs sm:text-sm min-h-[44px]'
        }`}
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 flex items-center justify-center text-xs sm:text-sm font-bold">
          {getInitials(user.name)}
        </div>
        <span className="hidden sm:inline">{user.name}</span>
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 bg-gradient-to-br from-black/95 to-purple-900/40 border border-purple-500/30 rounded-xl shadow-2xl z-50 min-w-[200px] sm:min-w-[240px] overflow-hidden ${
          compact ? 'top-full' : 'top-full'
        }`}>
          <div className="p-4 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm sm:text-base truncate">{user.name}</p>
                <p className="text-purple-300 text-xs sm:text-sm truncate">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-purple-900/50 border border-purple-500/30 text-purple-300 text-[10px] sm:text-xs rounded-full">
                  {user.role === 'customer' ? 'Customer' : 'Mechanic'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-2">
            {user?.role === 'mechanic' && (
              <button
                onClick={() => {
                  navigate('/dashboard')
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2.5 text-left text-purple-300 hover:bg-purple-900/20 rounded-lg transition-colors text-sm font-medium touch-manipulation mb-2"
              >
                Mechanic Dashboard
              </button>
            )}
            <button
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left text-red-300 hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium touch-manipulation"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

