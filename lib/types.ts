export type QuestionType = 
  | 'short_text' 
  | 'long_text' 
  | 'multiple_choice' 
  | 'checkboxes' 
  | 'dropdown'
  | 'email'
  | 'phone'
  | 'date'

export interface Question {
  id: string
  type: QuestionType
  question: string
  required: boolean
  options?: string[] // For multiple choice, checkboxes, dropdown
}

export interface Form {
  id: string
  title: string
  description: string
  questions: Question[]
  createdAt: string
  updatedAt: string
}

export interface Response {
  id: string
  formId: string
  answers: Record<string, string | string[]> // questionId -> answer
  submittedAt: string
}

