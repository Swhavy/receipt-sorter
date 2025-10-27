// app/api/download-word-file/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const listUrl = 'http://127.0.0.1:8000/output'
    const res = await fetch(listUrl)
    const data = await res.json()

    const latestFile = data.files?.at(-1)
    if (!latestFile) throw new Error('No file found')

    const downloadUrl = `http://127.0.0.1:8000/download/${latestFile}`
    const response = await fetch(downloadUrl)
    const blob = await response.blob()

    return new Response(blob, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${latestFile}"`,
      },
    })
  } catch (err: any) {
    console.error('Download error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
