import { kv } from '@vercel/kv'
import { Form, Response } from './types'

const FORMS_KEY = 'forms'
const RESPONSES_KEY = 'responses'

// Forms
export async function getAllForms(): Promise<Form[]> {
  try {
    const forms = await kv.get<Form[]>(FORMS_KEY)
    return forms || []
  } catch (error) {
    console.error('Error getting forms:', error)
    return []
  }
}

export async function getFormById(id: string): Promise<Form | null> {
  const forms = await getAllForms()
  return forms.find(form => form.id === id) || null
}

export async function saveForm(form: Form): Promise<void> {
  const forms = await getAllForms()
  const index = forms.findIndex(f => f.id === form.id)
  
  if (index >= 0) {
    forms[index] = form
  } else {
    forms.push(form)
  }
  
  await kv.set(FORMS_KEY, forms)
}

export async function deleteForm(id: string): Promise<void> {
  const forms = await getAllForms()
  const filtered = forms.filter(f => f.id !== id)
  await kv.set(FORMS_KEY, filtered)
  
  // Also delete associated responses
  const responses = await getAllResponses()
  const filteredResponses = responses.filter(r => r.formId !== id)
  await kv.set(RESPONSES_KEY, filteredResponses)
}

// Responses
export async function getAllResponses(): Promise<Response[]> {
  try {
    const responses = await kv.get<Response[]>(RESPONSES_KEY)
    return responses || []
  } catch (error) {
    console.error('Error getting responses:', error)
    return []
  }
}

export async function getResponsesByFormId(formId: string): Promise<Response[]> {
  const responses = await getAllResponses()
  return responses.filter(response => response.formId === formId)
}

export async function saveResponse(response: Response): Promise<void> {
  const responses = await getAllResponses()
  responses.push(response)
  await kv.set(RESPONSES_KEY, responses)
}
