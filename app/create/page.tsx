'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, GripVertical, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Question, QuestionType } from '@/lib/types'
import { nanoid } from 'nanoid'

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: 'short_text', label: 'Short Text' },
  { value: 'long_text', label: 'Long Text' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'checkboxes', label: 'Checkboxes' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'date', label: 'Date' },
  { value: 'ranked', label: 'Ranked' },
]

export default function CreateForm() {
  const router = useRouter()
  const [title, setTitle] = useState('Untitled Form')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: nanoid(),
      type: 'short_text',
      question: '',
      required: false,
    },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: nanoid(),
        type: 'short_text',
        question: '',
        required: false,
      },
    ])
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => (q.id === id ? { ...q, ...updates } : q)))
  }

  const deleteQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id))
    }
  }

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId)
    if (question) {
      const newOptions = [...(question.options || []), '']
      updateQuestion(questionId, { options: newOptions })
    }
  }

  const updateOption = (questionId: string, index: number, value: string) => {
    const question = questions.find(q => q.id === questionId)
    if (question && question.options) {
      const newOptions = [...question.options]
      newOptions[index] = value
      updateQuestion(questionId, { options: newOptions })
    }
  }

  const deleteOption = (questionId: string, index: number) => {
    const question = questions.find(q => q.id === questionId)
    if (question && question.options && question.options.length > 1) {
      const newOptions = question.options.filter((_, i) => i !== index)
      updateQuestion(questionId, { options: newOptions })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          questions,
        }),
      })

      if (response.ok) {
        const form = await response.json()
        router.push(`/forms`)
      } else {
        alert('Failed to create form')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const needsOptions = (type: QuestionType) => {
    return ['multiple_choice', 'checkboxes', 'dropdown', 'ranked'].includes(type)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Header */}
          <div className="bg-white rounded-lg shadow-md p-8 border-t-8 border-primary-500">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-bold w-full border-none outline-none focus:border-b-2 focus:border-primary-500 mb-4"
              placeholder="Form Title"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-none outline-none focus:border-b-2 focus:border-primary-500 text-gray-600 resize-none"
              placeholder="Form description (optional)"
              rows={2}
            />
          </div>

          {/* Questions */}
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-4 mb-4">
                <GripVertical className="w-6 h-6 text-gray-400 mt-3 cursor-move" />
                <div className="flex-1 space-y-4">
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(question.id, { question: e.target.value })
                    }
                    className="w-full text-lg border-b-2 border-gray-300 focus:border-primary-500 outline-none pb-2"
                    placeholder="Question"
                    required
                  />

                  <div className="flex gap-4 items-center">
                    <select
                      value={question.type}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          type: e.target.value as QuestionType,
                          options: needsOptions(e.target.value as QuestionType)
                            ? ['Option 1']
                            : undefined,
                        })
                      }
                      className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      {questionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) =>
                          updateQuestion(question.id, {
                            required: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Required</span>
                    </label>
                  </div>

                  {/* Options for multiple choice, checkboxes, dropdown, ranked */}
                  {needsOptions(question.type) && (
                    <div className="space-y-2 mt-4">
                      {(question.options || []).map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <span className="text-gray-400">
                            {question.type === 'multiple_choice' ? '○' : 
                             question.type === 'ranked' ? `${optionIndex + 1}.` : '☐'}
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              updateOption(question.id, optionIndex, e.target.value)
                            }
                            className="flex-1 border-b border-gray-300 focus:border-primary-500 outline-none pb-1"
                            placeholder={`Option ${optionIndex + 1}`}
                            required
                          />
                          {(question.options?.length || 0) > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteOption(question.id, optionIndex)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(question.id)}
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Option
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => deleteQuestion(question.id)}
                  className="text-gray-400 hover:text-red-500 mt-3"
                  disabled={questions.length === 1}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Question Button */}
          <button
            type="button"
            onClick={addQuestion}
            className="w-full bg-white rounded-lg shadow-md p-4 text-primary-600 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>

          {/* Submit Button */}
          <div className="flex gap-4 justify-end">
            <Link
              href="/"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? 'Creating...' : 'Create Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

