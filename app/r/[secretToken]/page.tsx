'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Lock } from 'lucide-react'
import { Form } from '@/lib/types'

export default function SecretFormsListPage() {
  const router = useRouter()
  const params = useParams()
  const secretToken = params.secretToken as string
  
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    verifyTokenAndAuth()
  }, [])

  const verifyTokenAndAuth = async () => {
    // Verify the secret token is correct
    const correctToken = process.env.NEXT_PUBLIC_SECRET_TOKEN || 'gst-x9k2m7n4p8q1';
    
    if (secretToken !== correctToken) {
      // Invalid token - show 404-like page
      setLoading(false)
      return
    }

    // Token is valid, now check if password authenticated
    try {
      const response = await fetch('/api/auth/verify')
      if (response.ok) {
        setIsAuthorized(true)
        fetchForms()
      } else {
        setShowPasswordPrompt(true)
        setLoading(false)
      }
    } catch (error) {
      setShowPasswordPrompt(true)
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/auth/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        setIsAuthorized(true)
        setShowPasswordPrompt(false)
        fetchForms()
      } else {
        setError('Incorrect password')
      }
    } catch (error) {
      setError('An error occurred')
    }
  }

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/forms')
      if (response.ok) {
        const data = await response.json()
        setForms(data)
      }
    } catch (error) {
      alert('Failed to load forms')
    } finally {
      setLoading(false)
    }
  }

  // Invalid token - show generic 404
  if (!loading && secretToken !== (process.env.NEXT_PUBLIC_SECRET_TOKEN || 'gst-x9k2m7n4p8q1')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <p className="text-gray-600">Page not found</p>
        </div>
      </div>
    )
  }

  // Show password prompt
  if (showPasswordPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-100 rounded-full p-4">
              <Lock className="w-12 h-12 text-primary-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Protected Access
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Enter the password to view responses
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Enter password"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Access Responses
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Forms & Responses</h1>

        {forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No forms yet
            </h2>
            <p className="text-gray-600">
              Forms will appear here once created
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Link
                key={form.id}
                href={`/r/${secretToken}/${form.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <FileText className="w-8 h-8 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {form.title}
                </h3>
                {form.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {form.description}
                  </p>
                )}
                <div className="text-sm text-gray-500">
                  {form.questions.length} question{form.questions.length !== 1 ? 's' : ''}
                </div>
                <div className="mt-4 text-sm text-primary-600 font-medium">
                  View Responses →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

