import { NextResponse } from 'next/server'

const OLLAMA_API_URL = 'http://localhost:11434/api/generate'

export async function POST(req: Request) {
    try {
        const { question, imageContent } = await req.json()

        // 构建发送给 llama3.2 的提示
        const prompt = `
你是一个智能助手。我会给你一个图片的描述和一个问题。请你基于图片描述来回答问题。
请用自然、友好的对话方式回答，不要输出JSON格式。

图片描述：
${imageContent}

用户问题：
${question}

请根据图片描述详细回答用户的问题。回答要准确、完整，并保持对话的语气友好自然。`

        // 调用 llama3.2 API
        const response = await fetch(OLLAMA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama2',
                prompt: prompt,
                stream: false,
                temperature: 0.7,
                top_p: 0.9,
                max_tokens: 500
            }),
        })

        if (!response.ok) {
            throw new Error('对话生成请求失败')
        }

        const data = await response.json()
        
        return NextResponse.json({
            response: data.response
        })
    } catch (error) {
        console.error('Error processing chat:', error)
        return NextResponse.json(
            { error: '处理请求时发生错误' },
            { status: 500 }
        )
    }
} 