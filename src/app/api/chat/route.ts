import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { question, imageContent } = await req.json()

        // 这里构建发送给 llama3.2 的提示
        const prompt = `
基于以下图片内容回答问题：

图片内容：${imageContent}

问题：${question}

请用对话的方式回答上述问题。
`
        // 调用 llama3.2 API
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama2',
                prompt: prompt,
                stream: false
            }),
        })

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