'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Trash2, ExternalLink, ArrowLeft, Copy, Check } from 'lucide-react'
import { Form } from '@/lib/types'

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/forms')
      const data = await response.json()
      setForms(data)
    } catch (error) {
      alert('Failed to fetch forms')
    } finally {
      setLoading(false)
    }
  }

  const deleteForm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form and all its responses?')) {
      return
    }

    try {
      const response = await fetch(`/api/forms/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setForms(forms.filter(f => f.id !== id))
      } else {
        alert('Failed to delete form')
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  const copyFormLink = (formId: string) => {
    const link = `${window.location.origin}/f/${formId}`
    navigator.clipboard.writeText(link)
    setCopiedId(formId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forms...</p>
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

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Forms</h1>
          <Link
            href="/create"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create New Form
          </Link>
        </div>

        {forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No forms yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first form to start collecting responses
            </p>
            <Link
              href="/create"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Form
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="w-8 h-8 text-primary-600" />
                    <button
                      onClick={() => deleteForm(form.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {form.title}
                  </h3>
                  
                  {form.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {form.description}
                    </p>
                  )}
                  
                  <div className="text-sm text-gray-500 mb-4">
                    {form.questions.length} question{form.questions.length !== 1 ? 's' : ''}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/f/${form.id}`}
                      target="_blank"
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center text-sm flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Form
                    </Link>
                    <button
                      onClick={() => copyFormLink(form.id)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Copy form link"
                    >
                      {copiedId === form.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>

                  <Link
                    href={`/responses/${form.id}`}
                    className="block mt-2 text-center px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm"
                  >
                    View Responses
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

