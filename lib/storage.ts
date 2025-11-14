import fs from 'fs'
import path from 'path'
import { Form, Response } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')
const FORMS_FILE = path.join(DATA_DIR, 'forms.json')
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json')

// Ensure data directory and files exist
function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(FORMS_FILE)) {
    fs.writeFileSync(FORMS_FILE, JSON.stringify([]))
  }
  if (!fs.existsSync(RESPONSES_FILE)) {
    fs.writeFileSync(RESPONSES_FILE, JSON.stringify([]))
  }
}

// Forms
export function getAllForms(): Form[] {
  ensureDataFiles()
  const data = fs.readFileSync(FORMS_FILE, 'utf-8')
  return JSON.parse(data)
}

export function getFormById(id: string): Form | null {
  const forms = getAllForms()
  return forms.find(form => form.id === id) || null
}

export function saveForm(form: Form): void {
  ensureDataFiles()
  const forms = getAllForms()
  const index = forms.findIndex(f => f.id === form.id)
  
  if (index >= 0) {
    forms[index] = form
  } else {
    forms.push(form)
  }
  
  fs.writeFileSync(FORMS_FILE, JSON.stringify(forms, null, 2))
}

export function deleteForm(id: string): void {
  ensureDataFiles()
  const forms = getAllForms()
  const filtered = forms.filter(f => f.id !== id)
  fs.writeFileSync(FORMS_FILE, JSON.stringify(filtered, null, 2))
  
  // Also delete associated responses
  const responses = getAllResponses()
  const filteredResponses = responses.filter(r => r.formId !== id)
  fs.writeFileSync(RESPONSES_FILE, JSON.stringify(filteredResponses, null, 2))
}

// Responses
export function getAllResponses(): Response[] {
  ensureDataFiles()
  const data = fs.readFileSync(RESPONSES_FILE, 'utf-8')
  return JSON.parse(data)
}

export function getResponsesByFormId(formId: string): Response[] {
  const responses = getAllResponses()
  return responses.filter(response => response.formId === formId)
}

export function saveResponse(response: Response): void {
  ensureDataFiles()
  const responses = getAllResponses()
  responses.push(response)
  fs.writeFileSync(RESPONSES_FILE, JSON.stringify(responses, null, 2))
}

