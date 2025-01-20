'use client'

import { useState, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { FileUpload } from '../components/file-upload'
import { OllamaResponse } from './api/process-file/route'

interface ChatMessage {
    role: 'user' | 'system' | 'assistant'
    content: string
}

export default function Home() {
    const [mounted, setMounted] = useState(false)
    const [fileContent, setFileContent] = useState<OllamaResponse | null>(null)
    const [userQuestion, setUserQuestion] = useState('')
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleFileSelect = (res: OllamaResponse) => {
        setFileContent(res)
        setChatHistory((prevHistory: ChatMessage[]) => [...prevHistory, {
            role: 'system',
            content: '图片已成功上传并识别。您可以询问关于图片内容的问题。'
        }])
    }

    const handleQuestionSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!userQuestion.trim() || !fileContent) return

        // 添加用户问题到聊天历史
        setChatHistory((prevHistory: ChatMessage[]) => [...prevHistory, {
            role: 'user',
            content: userQuestion
        }])

        setIsLoading(true)
        try {
            // 调用聊天 API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: userQuestion,
                    imageContent: fileContent.response
                }),
            })

            if (!response.ok) {
                throw new Error('请求失败')
            }

            const data = await response.json()
            
            // 添加助手回答到聊天历史
            setChatHistory((prevHistory: ChatMessage[]) => [...prevHistory, {
                role: 'assistant',
                content: data.response
            }])
        } catch (error) {
            console.error('Error:', error)
            // 添加错误消息到聊天历史
            setChatHistory((prevHistory: ChatMessage[]) => [...prevHistory, {
                role: 'system',
                content: '抱歉，处理您的问题时出现错误。请稍后重试。'
            }])
        } finally {
            setIsLoading(false)
            setUserQuestion('')
        }
    }

    if (!mounted) {
        return null
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="w-full max-w-2xl mb-8">
                <FileUpload onProcessingComplete={handleFileSelect} />
            </div>
            
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-md">
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                    {chatHistory.map((message: ChatMessage, index: number) => (
                        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-lg ${
                                message.role === 'user' 
                                    ? 'bg-blue-500 text-white' 
                                    : message.role === 'system'
                                        ? 'bg-gray-200 text-gray-700'
                                        : 'bg-green-500 text-white'
                            }`}>
                                {message.content}
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleQuestionSubmit} className="border-t p-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={userQuestion}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setUserQuestion(e.target.value)}
                            placeholder="请输入您的问题..."
                            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading || !fileContent}
                        />
                        <button
                            type="submit"
                            className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isLoading || !fileContent
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                            disabled={isLoading || !fileContent}
                        >
                            {isLoading ? '处理中...' : '发送'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}
