'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import { Form, Response } from '@/lib/types'

export default function FormResponsesPage() {
  const router = useRouter()
  const params = useParams()
  const formId = params.formId as string
  
  const [form, setForm] = useState<Form | null>(null)
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (response.ok) {
        setIsAuthorized(true)
        fetchData()
      } else {
        router.push('/responses/auth')
      }
    } catch (error) {
      router.push('/responses/auth')
    }
  }

  const fetchData = async () => {
    try {
      const [formRes, responsesRes] = await Promise.all([
        fetch(`/api/forms/${formId}`),
        fetch(`/api/responses/${formId}`),
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

    // Create CSV headers - for ranked questions, create multiple columns (Rank 1, Rank 2, etc.)
    const headers: string[] = ['Submission Time']
    const questionHeaders: { questionId: string; headers: string[] }[] = []
    
    form.questions.forEach(question => {
      if (question.type === 'ranked' && question.options) {
        // Create separate columns for each rank
        const rankHeaders = question.options.map((_, idx) => 
          `${question.question} - Rank ${idx + 1}`
        )
        headers.push(...rankHeaders)
        questionHeaders.push({
          questionId: question.id,
          headers: rankHeaders
        })
      } else {
        headers.push(question.question)
        questionHeaders.push({
          questionId: question.id,
          headers: [question.question]
        })
      }
    })
    
    // Create CSV rows
    const rows = responses.map(response => {
      const row = [new Date(response.submittedAt).toLocaleString()]
      
      form.questions.forEach(question => {
        const answer = response.answers[question.id]
        
        if (question.type === 'ranked' && Array.isArray(answer)) {
          // For ranked questions, put each rank in its own column
          answer.forEach(item => row.push(item))
          // Fill remaining columns if fewer items than expected
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

    // Combine headers and rows
    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.title.replace(/[^a-z0-9]/gi, '_')}_responses.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!isAuthorized || loading) {
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
              Share your form to start collecting responses
            </p>
            <div className="max-w-lg mx-auto">
              <p className="text-sm text-gray-500 mb-2">Form Link:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/f/${formId}`}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/f/${formId}`)
                    alert('Link copied!')
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
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
