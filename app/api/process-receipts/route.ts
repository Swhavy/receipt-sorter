import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    //const backendUrl = 'http://127.0.0.1:8000/upload'
    const backendUrl = 'https://backend-production-8af5.up.railway.app/upload'
    //const processUrl = 'http://127.0.0.1:8000/process'
    const processUrl = 'rhttps://backend-production-8af5.up.railway.app/process'

    // Step 1: Upload all files to FastAPI
    const uploadResponse = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
    })

    if (!uploadResponse.ok) {
      throw new Error('Upload to FastAPI failed')
    }

    // Step 2: Tell FastAPI to process them
    const processResponse = await fetch(processUrl, {
      method: 'POST',
    })

    if (!processResponse.ok) {
      throw new Error('Processing failed')
    }

    const result = await processResponse.json()
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Error in process-receipts:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
