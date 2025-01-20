import { NextResponse } from 'next/server'

const OLLAMA_API_URL = 'http://localhost:11434/api/generate'

export interface OllamaResponse {
    model: string
    created_at: string
    response: string
    done: boolean
    done_reason: string
    context: string
    total_duration: number
    load_duration: number
    prompt_eval_duration: number
    eval_count: number
    eval_duration: number
}

const fileToBase64 = async (file: Blob): Promise<string> => {
    const buffer = await file.arrayBuffer()
    return Buffer.from(buffer).toString('base64')
}

const callOllama = async (payload: object): Promise<OllamaResponse> => {
    const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Ollama API error: ${error}`)
    }

    return response.json()
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file')

        if (!file || !(file instanceof Blob)) {
            return NextResponse.json(
                { error: 'Valid file is required' },
                { status: 400 }
            )
        }

        // Extract text from image
        const base64Image = await fileToBase64(file)
        const ocrResult = await callOllama({
            model: 'minicpm-v',
            prompt: 'Explain the image precisely.',
            stream: false,
            images: [base64Image],
        })

        // Structure the extracted text as JSON
        const llmResult = await callOllama({
            model: 'llama3.2',
            prompt: `Provide sentiment analysis in the form of JSON. Provide sentiment, emotions, and reasoning: ${ocrResult.response}`,
            stream: false,
            format: 'json',
        })

        // Validate JSON response
        try {
            return NextResponse.json({ result: llmResult })
        } catch {
            return NextResponse.json(
                { error: 'Failed to parse structured response' },
                { status: 422 }
            )
        }
    } catch (error) {
        console.error('OCR processing error:', error)
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred',
            },
            { status: 500 }
        )
    }
}
