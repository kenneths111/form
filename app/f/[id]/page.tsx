'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Form, Question } from '@/lib/types'
import { CheckCircle, GripVertical } from 'lucide-react'

// Ranked Question Component
function RankedQuestion({ 
  question, 
  answer, 
  onChange 
}: { 
  question: Question
  answer: string | string[] | undefined
  onChange: (questionId: string, value: string[]) => void
}) {
  const [rankings, setRankings] = useState<string[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  useEffect(() => {
    // Initialize rankings from answer or from options
    if (answer && Array.isArray(answer) && answer.length > 0) {
      setRankings(answer)
    } else if (question.options) {
      setRankings([...question.options])
    }
  }, [question.options, answer])

  const handleDragStart = (item: string) => {
    setDraggedItem(item)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetItem: string) => {
    if (!draggedItem) return
    
    const newRankings = [...rankings]
    const draggedIndex = newRankings.indexOf(draggedItem)
    const targetIndex = newRankings.indexOf(targetItem)
    
    // Swap items
    newRankings.splice(draggedIndex, 1)
    newRankings.splice(targetIndex, 0, draggedItem)
    
    setRankings(newRankings)
    onChange(question.id, newRankings)
    setDraggedItem(null)
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newRankings = [...rankings]
    const temp = newRankings[index]
    newRankings[index] = newRankings[index - 1]
    newRankings[index - 1] = temp
    setRankings(newRankings)
    onChange(question.id, newRankings)
  }

  const moveDown = (index: number) => {
    if (index === rankings.length - 1) return
    const newRankings = [...rankings]
    const temp = newRankings[index]
    newRankings[index] = newRankings[index + 1]
    newRankings[index + 1] = temp
    setRankings(newRankings)
    onChange(question.id, newRankings)
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 mb-3">
        Drag items to reorder, or use the arrow buttons. #1 is your top choice.
      </p>
      {rankings.map((option, index) => (
        <div
          key={option}
          draggable
          onDragStart={() => handleDragStart(option)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(option)}
          className="flex items-center gap-3 p-3 bg-white border-2 border-gray-300 rounded-lg hover:border-primary-400 cursor-move transition-colors"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
          <span className="font-semibold text-primary-600 w-8">#{index + 1}</span>
          <span className="flex-1">{option}</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => moveUp(index)}
              disabled={index === 0}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => moveDown(index)}
              disabled={index === rankings.length - 1}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded"
            >
              ▼
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function FormResponsePage() {
  const params = useParams()
  const formId = params.id as string
  
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchForm()
  }, [formId])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/${formId}`)
      if (response.ok) {
        const data = await response.json()
        setForm(data)
      } else {
        alert('Form not found')
      }
    } catch (error) {
      alert('Failed to load form')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (form) {
      for (const question of form.questions) {
        if (question.required && !answers[question.id]) {
          alert(`Please answer: ${question.question}`)
          return
        }
      }
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId,
          answers,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        alert('Failed to submit response')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    const currentAnswers = (answers[questionId] as string[]) || []
    const newAnswers = checked
      ? [...currentAnswers, option]
      : currentAnswers.filter(a => a !== option)
    setAnswers({ ...answers, [questionId]: newAnswers })
  }

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id]

    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required={question.required}
          />
        )

      case 'long_text':
        return (
          <textarea
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
            required={question.required}
          />
        )

      case 'email':
        return (
          <input
            type="email"
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required={question.required}
          />
        )

      case 'phone':
        return (
          <input
            type="tel"
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required={question.required}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required={question.required}
          />
        )

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  required={question.required}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case 'checkboxes':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={((answer as string[]) || []).includes(option)}
                  onChange={(e) =>
                    handleCheckboxChange(question.id, option, e.target.checked)
                  }
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case 'dropdown':
        return (
          <select
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required={question.required}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'ranked':
        return <RankedQuestion question={question} answer={answer} onChange={handleAnswerChange} />

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form not found</h1>
          <p className="text-gray-600">This form may have been deleted or the link is invalid.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Response Submitted!
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you for your submission. Your response has been recorded.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Header */}
          <div className="bg-white rounded-lg shadow-md p-8 border-t-8 border-primary-500">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600 whitespace-pre-wrap">{form.description}</p>
            )}
          </div>

          {/* Questions */}
          {form.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
              <label className="block mb-4">
                <span className="text-lg font-medium text-gray-900">
                  {index + 1}. {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </span>
              </label>
              {renderQuestion(question)}
            </div>
          ))}

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 font-medium"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

