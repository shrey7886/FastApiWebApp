'use client'

import { useEffect, useState, createContext, useContext } from 'react'

// Auth Context
interface AuthContextType {
  token: string | null
  setToken: (token: string | null) => void
  logout: () => void
}
const AuthContext = createContext<AuthContextType>({ token: null, setToken: () => {}, logout: () => {} })
export function useAuth() { return useContext(AuthContext) }

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  useEffect(() => {
    setToken(localStorage.getItem('token'))
  }, [])
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    window.location.href = '/login'
  }
  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function ThemeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])
  const toggle = () => {
    setDark(d => {
      const next = !d
      if (next) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
      return next
    })
  }
  return (
    <button
      aria-label="Toggle dark mode"
      className="fixed top-6 right-6 z-50 w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:scale-110"
      onClick={toggle}
    >
      <div className="w-full h-full flex items-center justify-center">
        {dark ? (
          <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </div>
    </button>
  )
}

function NavBar() {
  const { token, logout } = useAuth()
  return (
    <nav className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 fixed top-0 left-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">🎯</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">AI Quiz</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Generator</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <a 
              href="/" 
              className="px-4 py-2 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
            >
              Dashboard
            </a>
            
            {!token ? (
              <>
                <a 
                  href="/login" 
                  className="btn-secondary px-6 py-2 text-sm"
                >
                  Login
                </a>
                <a 
                  href="/signup" 
                  className="btn-primary px-6 py-2 text-sm"
                >
                  Sign Up
                </a>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Online</span>
                </div>
                <button 
                  onClick={logout} 
                  className="btn-secondary px-6 py-2 text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeToggle />
      <NavBar />
      <div className="pt-24">{children}</div>
    </AuthProvider>
  )
} 