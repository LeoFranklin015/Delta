'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Volume2, Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react"

export function NearAiChat() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      setMessages([...messages, { type: 'user', content: inputMessage }])
      // Simulating a response from the AI
      setTimeout(() => {
        setMessages(
          prevMessages => [...prevMessages, { type: 'ai', content: 'This is a simulated response from NEAR AI.' }]
        )
      }, 1000)
      setInputMessage('')
    }
  }

  return (
    (<div className="flex flex-col h-screen bg-black text-green-400">
      <header className="p-4 border-b border-green-400/20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">NEAR AI</h1>
          <nav>
            <Button
              variant="ghost"
              className="text-green-400 hover:text-green-300 hover:bg-green-400/10">AI Office Hours</Button>
            <Button
              variant="ghost"
              className="text-green-400 hover:text-green-300 hover:bg-green-400/10">About</Button>
          </nav>
        </div>
      </header>
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <div className="w-64 h-64 mb-8">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M50 10 L90 90 L10 90 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="4" />
              <circle cx="50" cy="45" r="10" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold mb-4">NEAR.AI Master Plan</h2>
          <p className="text-xl text-center max-w-2xl">Bringing AI on-chain with the power of NEAR Protocol</p>
        </div>
      ) : (
        <ScrollArea className="flex-grow p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${message.type === 'user' ? 'text-right' : ''}`}>
              <div
                className={`inline-block p-3 rounded-lg ${message.type === 'user' ? 'bg-green-400/20' : 'bg-gray-800'} max-w-[80%]`}>
                {message.content}
              </div>
              {message.type === 'ai' && (
                <div className="flex items-center mt-2 space-x-2">
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
      )}
      <div className="p-4 border-t border-green-400/20">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Message NEAR AI..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-grow bg-gray-800 text-green-400 border-green-400/20 focus:border-green-400 placeholder-green-400/50" />
          <Button
            onClick={handleSendMessage}
            className="bg-green-400 hover:bg-green-500 text-black">
            Send
          </Button>
        </div>
        <p className="text-xs text-center mt-2 text-green-400/50">
          NEAR AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>)
  );
}