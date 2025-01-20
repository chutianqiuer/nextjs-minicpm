'use client'

import React, { useState, useRef, DragEvent } from 'react'
import { Upload, File, Loader } from 'lucide-react'
import { OllamaResponse } from '@/app/api/process-file/route'

interface FileUploadProps {
    onProcessingComplete: (result: OllamaResponse) => void
}

export function FileUpload({ onProcessingComplete }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            handleFiles(files)
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFiles(files)
        }
    }

    const handleFiles = async (files: FileList) => {
        const file = files[0]
        if (file.size > 10 * 1024 * 1024) {
            setError('File size exceeds 10MB.')
            return
        }

        setFileName(file.name)
        setError(null)

        await processFile(file)
    }

    const processFile = async (file: File) => {
        setIsProcessing(true)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/process-file', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const { error } = await response.json()
                setError(error || 'Error processing file.')
                return
            }

            const { result } = await response.json()
            onProcessingComplete(result)
        } catch (err) {
            console.error(err)
            setError('Failed to process the file.')
        } finally {
            setIsProcessing(false)
        }
    }

    const openFileDialog = () => {
        fileInputRef.current?.click()
    }

    return (
        <div
            className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors ${
                isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-300 bg-gray-50'
            } hover:bg-gray-100`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={openFileDialog}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                className="hidden"
                aria-label="File upload"
            />
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Any file type (MAX. 10MB)
                </p>
            </div>
            {fileName && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-white p-2 rounded-md shadow">
                    <div className="flex items-center">
                        <File className="w-5 h-5 mr-2 text-primary" />
                        <span className="text-sm font-medium text-gray-700 truncate">
                            {fileName}
                        </span>
                    </div>
                    <button
                        onClick={e => {
                            e.stopPropagation()
                            setFileName(null)
                            setError(null)
                        }}
                        className="text-sm text-red-500 hover:text-red-700"
                    >
                        Remove
                    </button>
                </div>
            )}
            {isProcessing && (
                <div className="absolute top-3 right-3">
                    <Loader className="w-5 h-5 animate-spin text-primary" />
                </div>
            )}
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    )
}
