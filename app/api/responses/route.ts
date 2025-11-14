import { NextRequest, NextResponse } from 'next/server'
import { saveResponse } from '@/lib/storage'
import { Response } from '@/lib/types'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response: Response = {
      id: nanoid(),
      formId: body.formId,
      answers: body.answers,
      submittedAt: new Date().toISOString(),
    }
    
    await saveResponse(response)
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    )
  }
}

