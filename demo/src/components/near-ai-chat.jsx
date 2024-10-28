'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Volume2, Copy, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react"

export function NearAiChat() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLogoVisible, setIsLogoVisible] = useState(true)

  useEffect(() => {
    setIsLogoVisible(messages.length === 0)
  }, [messages])

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

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        yoyo: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  }

  return (
    (<div className="flex flex-col h-screen bg-black text-green-400">
      <motion.header
        className="p-4 border-b border-green-400/20"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">NEAR AI</h1>
          <nav>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                variant="ghost"
                className="text-green-400 hover:text-green-300 hover:bg-green-400/10">AI Office Hours</Button>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                variant="ghost"
                className="text-green-400 hover:text-green-300 hover:bg-green-400/10">About</Button>
            </motion.div>
          </nav>
        </div>
      </motion.header>
      <ScrollArea className="flex-grow p-4">
        <AnimatePresence>
          {isLogoVisible && (
            <motion.div
              className="flex flex-col items-center justify-center h-full"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={logoVariants}>
              <motion.div
                className="w-64 h-64 mb-8"
                animate={{ 
                  rotate: 360,
                  transition: { duration: 20, ease: "linear", repeat: Infinity }
                }}>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <motion.path
                    d="M50 10 L90 90 L10 90 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }} />
                  <motion.circle
                    cx="50"
                    cy="45"
                    r="10"
                    fill="currentColor"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 }} />
                </svg>
              </motion.div>
              <motion.h2
                className="text-4xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}>
                NEAR.AI Master Plan
              </motion.h2>
              <motion.p
                className="text-xl text-center max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}>
                Bringing AI on-chain with the power of NEAR Protocol
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              className={`mb-4 ${message.type === 'user' ? 'text-right' : ''}`}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="hidden">
              <div
                className={`inline-block p-3 rounded-lg ${message.type === 'user' ? 'bg-green-400/20' : 'bg-gray-800'} max-w-[80%]`}>
                {message.content}
              </div>
              {message.type === 'ai' && (
                <motion.div
                  className="flex items-center mt-2 space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}>
                  {[Volume2, Copy, ThumbsUp, ThumbsDown, RotateCcw].map((Icon, i) => (
                    <motion.div key={i} variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                        <Icon className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>
      <motion.div
        className="p-4 border-t border-green-400/20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Message NEAR AI..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-grow bg-gray-800 text-green-400 border-green-400/20 focus:border-green-400 placeholder-green-400/50" />
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              onClick={handleSendMessage}
              className="bg-green-400 hover:bg-green-500 text-black">
              Send
            </Button>
          </motion.div>
        </div>
        <p className="text-xs text-center mt-2 text-green-400/50">
          NEAR AI can make mistakes. Consider checking important information.
        </p>
      </motion.div>
    </div>)
  );
}