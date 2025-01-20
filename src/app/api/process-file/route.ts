import { NextResponse } from 'next/server'

const OLLAMA_API_URL = 'http://localhost:11434/api/generate'

export interface OllamaResponse {
    response: string
}

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        
        if (!file) {
            return NextResponse.json(
                { error: '没有找到文件' },
                { status: 400 }
            )
        }

        // 将文件转换为 base64
        const bytes = await file.arrayBuffer()
        const base64 = arrayBufferToBase64(bytes)

        // 调用 minicpm-v API 进行图片识别
        const response = await fetch(OLLAMA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'minicpm-v',
                prompt: '请详细描述这张图片的内容，包括图片中的主要元素、文字、布局等信息。',
                images: [base64],
                stream: false,
                format: 'json'
            }),
        })

        if (!response.ok) {
            throw new Error('图片识别请求失败')
        }

        const data = await response.json()
        
        return NextResponse.json({
            response: data.response
        })
    } catch (error) {
        console.error('Error processing file:', error)
        return NextResponse.json(
            { error: '处理文件时发生错误' },
            { status: 500 }
        )
    }
}
