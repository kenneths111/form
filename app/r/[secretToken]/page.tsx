'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Lock } from 'lucide-react'
import { Form, Response } from '@/lib/types'

export default function SecretResponsesPage() {
  const router = useRouter()
  const params = useParams()
  const secretToken = params.secretToken as string
  
  const [form, setForm] = useState<Form | null>(null)
  const [responses, setResponses] = useState<Response[]>([])
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
        fetchData()
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
        fetchData()
      } else {
        setError('Incorrect password')
      }
    } catch (error) {
      setError('An error occurred')
    }
  }

  const fetchData = async () => {
    try {
      const [formRes, responsesRes] = await Promise.all([
        fetch(`/api/forms/default-trip-form`),
        fetch(`/api/responses/default-trip-form`),
      ])

      if (formRes.ok) {
        const formData = await formRes.json()
        setForm(formData)
      }

      if (responsesRes.ok) {
        const responsesData = await responsesRes.json()
        setResponses(responsesData)
      }
    } catch (error) {
      alert('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    if (!form || responses.length === 0) return

    const headers: string[] = ['Submission Time']
    
    form.questions.forEach(question => {
      if (question.type === 'ranked' && question.options) {
        const rankHeaders = question.options.map((_, idx) => 
          `${question.question} - Rank ${idx + 1}`
        )
        headers.push(...rankHeaders)
      } else {
        headers.push(question.question)
      }
    })
    
    const rows = responses.map(response => {
      const row = [new Date(response.submittedAt).toLocaleString()]
      
      form.questions.forEach(question => {
        const answer = response.answers[question.id]
        
        if (question.type === 'ranked' && Array.isArray(answer)) {
          answer.forEach(item => row.push(item))
          const remaining = (question.options?.length || 0) - answer.length
          for (let i = 0; i < remaining; i++) {
            row.push('')
          }
        } else if (Array.isArray(answer)) {
          row.push(answer.join(', '))
        } else {
          row.push(answer || '')
        }
      })
      
      return row
    })

    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.title.replace(/[^a-z0-9]/gi, '_')}_responses.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
            <p className="text-gray-600">
              {responses.length} response{responses.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {responses.length > 0 && (
            <button
              onClick={downloadCSV}
              className="mt-4 md:mt-0 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          )}
        </div>

        {responses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No responses yet
            </h2>
            <p className="text-gray-600 mb-6">
              Responses will appear here once participants start submitting
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {responses.map((response, index) => (
              <div key={response.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Response #{responses.length - index}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(response.submittedAt).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-4">
                  {form.questions.map((question, qIndex) => {
                    const answer = response.answers[question.id]
                    return (
                      <div key={question.id}>
                        <p className="font-medium text-gray-900 mb-2">
                          {qIndex + 1}. {question.question}
                        </p>
                        <div className="text-gray-700 pl-4">
                          {question.type === 'ranked' && Array.isArray(answer) ? (
                            <ol className="list-decimal list-inside space-y-1">
                              {answer.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ol>
                          ) : Array.isArray(answer) ? (
                            <span>{answer.join(', ')}</span>
                          ) : answer ? (
                            <span>{answer}</span>
                          ) : (
                            <span className="text-gray-400 italic">No answer</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

