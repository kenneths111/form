'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Form, Question } from '@/lib/types'
import { CheckCircle, GripVertical } from 'lucide-react'

// Ranked Question Component with Mobile Touch Support
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
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [touchedIndex, setTouchedIndex] = useState<number | null>(null)

  useEffect(() => {
    // Initialize rankings from answer or from options
    if (answer && Array.isArray(answer) && answer.length > 0) {
      setRankings(answer)
    } else if (question.options) {
      setRankings([...question.options])
    }
  }, [question.options, answer])

  // Desktop drag handlers
  const handleDragStart = (e: React.DragEvent, item: string) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
    // Prevent the ghost image from scrolling the page
    if (e.dataTransfer.setDragImage) {
      const div = document.createElement('div')
      div.style.position = 'absolute'
      div.style.top = '-9999px'
      document.body.appendChild(div)
      e.dataTransfer.setDragImage(div, 0, 0)
      setTimeout(() => document.body.removeChild(div), 0)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetItem: string) => {
    e.preventDefault()
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

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0]
    setTouchStartY(touch.clientY)
    setTouchedIndex(index)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null || touchedIndex === null) return
    
    const touch = e.touches[0]
    const touchY = touch.clientY
    const diffY = touchY - touchStartY
    
    // Threshold for moving up or down
    if (Math.abs(diffY) > 80) {
      if (diffY < 0 && touchedIndex > 0) {
        // Swiped up - move item up
        moveUp(touchedIndex)
        setTouchStartY(touchY)
        setTouchedIndex(touchedIndex - 1)
      } else if (diffY > 0 && touchedIndex < rankings.length - 1) {
        // Swiped down - move item down
        moveDown(touchedIndex)
        setTouchStartY(touchY)
        setTouchedIndex(touchedIndex + 1)
      }
    }
  }

  const handleTouchEnd = () => {
    setTouchStartY(null)
    setTouchedIndex(null)
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
      <p className="text-xs text-primary-500 mb-3">
        <span className="hidden sm:inline">Drag to reorder or use arrow buttons.</span>
        <span className="inline sm:hidden">Swipe items up or down to reorder, or use arrow buttons.</span>
        {' '}Rank 1 is your top choice.
      </p>
      {rankings.map((option, index) => (
        <div
          key={option}
          draggable
          onDragStart={(e) => handleDragStart(e, option)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, option)}
          onTouchStart={(e) => handleTouchStart(e, index)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`flex items-center gap-3 p-3 rounded-md border transition-all select-none ${
            touchedIndex === index
              ? 'border-accent-500 bg-accent-50' 
              : 'border-primary-200 bg-primary-50 hover:border-primary-300 hover:bg-primary-100'
          } ${draggedItem === option ? 'opacity-40' : ''}`}
        >
          <GripVertical className="w-4 h-4 text-primary-400 flex-shrink-0 cursor-grab active:cursor-grabbing" />
          <span className="font-medium text-primary-900 w-6 text-xs flex-shrink-0">
            {index + 1}
          </span>
          <span className="flex-1 text-sm text-primary-700 break-words">{option}</span>
          <div className="flex gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => moveUp(index)}
              disabled={index === 0}
              className="w-7 h-7 text-xs bg-white border border-primary-200 rounded hover:bg-primary-50 hover:border-primary-300 active:bg-primary-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors touch-manipulation"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveDown(index)}
              disabled={index === rankings.length - 1}
              className="w-7 h-7 text-xs bg-white border border-primary-200 rounded hover:bg-primary-50 hover:border-primary-300 active:bg-primary-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors touch-manipulation"
            >
              ↓
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
  const [validationError, setValidationError] = useState<string | null>(null)

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
    setValidationError(null)

    // Validate required fields
    if (form) {
      const missingFields: string[] = []
      form.questions.forEach((question, index) => {
        if (question.required) {
          const answer = answers[question.id]
          if (!answer || (Array.isArray(answer) && answer.length === 0) || answer === '') {
            missingFields.push(`Question ${index + 1}: ${question.question}`)
          }
        }
      })

      if (missingFields.length > 0) {
        setValidationError(
          missingFields.length === 1
            ? `Please answer the required question: ${missingFields[0]}`
            : `Please answer all required questions (${missingFields.length} missing)`
        )
        // Scroll to top to see the error
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
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
        setValidationError('Failed to submit response. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting response:', error)
      setValidationError('Error submitting response. Please check your connection.')
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
            className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all text-sm"
            placeholder="Your answer"
          />
        )

      case 'long_text':
        return (
          <textarea
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all resize-none text-sm"
            placeholder="Your answer"
          />
        )

      case 'email':
        return (
          <input
            type="email"
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all text-sm"
            placeholder="your@email.com"
          />
        )

      case 'phone':
        return (
          <input
            type="tel"
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all text-sm"
            placeholder="Your phone number"
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all text-sm"
          />
        )

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center gap-3 px-3 py-2.5 bg-primary-50 border border-primary-200 rounded-md cursor-pointer hover:bg-primary-100 hover:border-primary-300 transition-colors"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-accent-600 border-primary-300 focus:ring-accent-500"
                />
                <span className="text-sm text-primary-700">{option}</span>
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
                className="flex items-center gap-3 px-3 py-2.5 bg-primary-50 border border-primary-200 rounded-md cursor-pointer hover:bg-primary-100 hover:border-primary-300 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={((answer as string[]) || []).includes(option)}
                  onChange={(e) =>
                    handleCheckboxChange(question.id, option, e.target.checked)
                  }
                  className="w-4 h-4 text-accent-600 border-primary-300 focus:ring-accent-500 rounded"
                />
                <span className="text-sm text-primary-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'dropdown':
        return (
          <select
            value={(answer as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all text-sm"
          >
            <option value="">Choose an option...</option>
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
      <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-primary-200 p-12 max-w-lg text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-primary-900 mb-4">
            Thank You!
          </h1>
          <p className="text-sm text-primary-600 mb-3 leading-relaxed">
            Your preferences have been recorded! We will let you know when the results are out.
          </p>
          <p className="text-sm text-primary-500 leading-relaxed">
            Looking forward to an amazing trip to Singapore and Taiwan together.
          </p>
          <div className="mt-8 pt-6 border-t border-primary-100">
            <p className="text-xs text-primary-400">
              GST 2026
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation Error Message */}
          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-900 mb-1">Unable to submit</h3>
                <p className="text-sm text-red-700">{validationError}</p>
              </div>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Form Header */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-primary-200">
            <h1 className="text-2xl font-semibold text-primary-900 mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-primary-600 text-sm whitespace-pre-wrap">{form.description}</p>
            )}
          </div>

          {/* Questions */}
          {form.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg p-6 shadow-sm border border-primary-200">
              <label className="block mb-4">
                <span className="text-sm font-medium text-primary-900 flex items-center gap-2">
                  <span className="text-primary-400">{index + 1}.</span>
                  {question.question}
                  {question.required && <span className="text-red-500">*</span>}
                </span>
              </label>
              {renderQuestion(question)}
            </div>
          ))}

          {/* Submit Button */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-primary-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-primary-900 text-white rounded-md hover:bg-primary-800 transition-colors disabled:bg-primary-300 font-medium shadow-sm"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <p className="text-center text-xs text-primary-400 mt-4">
              GST 2026
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

