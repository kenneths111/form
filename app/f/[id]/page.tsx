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

  // Mobile touch handlers with scroll detection
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0]
    setTouchStartY(touch.clientY)
    setTouchStartX(touch.clientX)
    setTouchedIndex(index)
    setIsReorderMode(false)
    
    // Enter reorder mode after holding for 300ms
    holdTimerRef.current = setTimeout(() => {
      setIsReorderMode(true)
      // Haptic feedback on supported devices
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 300)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null || touchStartX === null || touchedIndex === null) return
    
    const touch = e.touches[0]
    const touchY = touch.clientY
    const touchX = touch.clientX
    const diffY = touchY - touchStartY
    const diffX = touchX - touchStartX
    
    // If user moves horizontally too much, they're probably scrolling - cancel
    if (Math.abs(diffX) > 15) {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current)
      }
      setIsReorderMode(false)
      return
    }
    
    // Only reorder if in reorder mode (held for 300ms)
    if (!isReorderMode) {
      // If moved too much before hold completed, cancel the hold
      if (Math.abs(diffY) > 10) {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current)
        }
      }
      return
    }
    
    // Prevent page scrolling when in reorder mode
    e.preventDefault()
    
    // Threshold for moving up or down (smaller now since we're in deliberate mode)
    if (Math.abs(diffY) > 50) {
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
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
    }
    setTouchStartY(null)
    setTouchStartX(null)
    setTouchedIndex(null)
    setIsReorderMode(false)
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
        <span className="hidden sm:inline">Drag items to reorder, or use the arrow buttons.</span>
        <span className="inline sm:hidden">Hold and swipe up/down to reorder, or tap the arrow buttons.</span>
        {' '}#1 is your top choice.
      </p>
      {rankings.map((option, index) => (
        <div
          key={option}
          draggable
          onDragStart={() => handleDragStart(option)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(option)}
          onTouchStart={(e) => handleTouchStart(e, index)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white border-2 rounded-lg transition-all select-none ${
            touchedIndex === index && isReorderMode
              ? 'border-primary-500 shadow-lg scale-105 bg-primary-50' 
              : touchedIndex === index
              ? 'border-primary-300'
              : 'border-gray-300 hover:border-primary-400'
          } ${draggedItem === option ? 'opacity-50' : ''}`}
        >
          <GripVertical className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
          <span className="font-semibold text-primary-600 w-6 sm:w-8 text-sm sm:text-base flex-shrink-0">
            #{index + 1}
          </span>
          <span className="flex-1 text-sm sm:text-base break-words">{option}</span>
          <div className="flex gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => moveUp(index)}
              disabled={index === 0}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed rounded touch-manipulation"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => moveDown(index)}
              disabled={index === rankings.length - 1}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed rounded touch-manipulation"
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
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-lg text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 text-4xl opacity-20">🇸🇬</div>
          <div className="absolute top-4 right-4 text-4xl opacity-20">🇹🇼</div>
          <div className="absolute bottom-4 left-8 text-2xl opacity-10">✈️</div>
          <div className="absolute bottom-4 right-8 text-2xl opacity-10">🎓</div>
          
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 relative z-10">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 relative z-10">
            Thank You! 🙏
          </h1>
          <p className="text-lg text-gray-700 mb-4 relative z-10">
            Your preferences have been recorded! We'll do our best to optimize everyone's experience for this Singapore 🇸🇬 and Taiwan 🇹🇼 GST journey.
          </p>
          <p className="text-gray-600 relative z-10">
            Looking forward to an amazing trip together! 🌟
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Header with decorations */}
          <div className="bg-white rounded-lg shadow-md p-8 border-t-8 border-primary-500 relative overflow-hidden">
            {/* Decorative flags */}
            <div className="absolute top-2 right-2 text-3xl opacity-20 flex gap-2">
              🇸🇬 🇹🇼
            </div>
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
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 font-medium text-lg"
            >
              {isSubmitting ? 'Submitting... ✈️' : 'Submit My Preferences 🚀'}
            </button>
            <p className="text-center text-sm text-gray-500 mt-3">
              Singapore 🇸🇬 • Taiwan 🇹🇼 • GST 2024
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

