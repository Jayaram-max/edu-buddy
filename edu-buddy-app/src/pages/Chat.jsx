import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useTracking } from '../context/TrackingContext'
import { sendMessageToGemini } from '../lib/gemini'

export default function Chat() {
  const { user, subjects, createChat, sendMessage } = useApp()
  const { trackPageNavigation, trackChatEvent, trackEvent } = useTracking()
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'Hello! I\'m ready to help you study. You can ask me to explain a topic, solve a problem, or practice a language. What are we working on today?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentChat, setCurrentChat] = useState(null)
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: 'Quadratic Formula Help', subject: 'Mathematics', lastMessage: 'Can you explain the quadratic formula?', timestamp: new Date() }
  ])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    trackPageNavigation('/chat', 'AI Chat Assistant')
  }, [])

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px'
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const userMessage = input.trim()
      const newUserMessage = { id: Date.now(), type: 'user', text: userMessage }

      setMessages(prev => [...prev, newUserMessage])
      setInput('')
      setIsLoading(true)

      // Track chat event
      await trackChatEvent(currentChat?.id || 'general', userMessage.length, 'neutral')

      // Save user message to database if chat exists
      if (currentChat) {
        await sendMessage?.(currentChat.id, userMessage, 'user')
      }

      try {
        // Enhanced prompt with subject context
        const contextPrompt = selectedSubject
          ? `You are Edu Buddy, an AI tutor specializing in ${selectedSubject.name}. Provide detailed, step-by-step solutions for questions about ${selectedSubject.name}. 
             If the student asks to solve a problem, break it down into logical steps. Explain the 'why' behind each step.
             Be encouraging, clear, and educational.`
          : `You are Edu Buddy, a personal AI study assistant. Your goal is to provide specific solutions to study questions.
             - For problem-solving questions: Provide step-by-step detailed solutions.
             - For conceptual questions: Explain clearly with examples.
             - Be encouraging and educational.`

        const aiResponse = await sendMessageToGemini(userMessage, contextPrompt)
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          text: aiResponse
        }

        setMessages(prev => [...prev, aiMessage])

        // Save AI response to database if chat exists
        if (currentChat) {
          await sendMessage?.(currentChat.id, aiResponse, 'assistant')
        }

      } catch (error) {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'ai',
          text: error.message.includes('API key')
            ? '⚠️ Please add your Google Gemini API key to the .env.local file to enable AI responses.\n\nGet your free API key at: https://makersuite.google.com/app/apikey'
            : `⚠️ Error: ${error.message || 'Unknown error occurred'}. Please try again.`
        }
        setMessages(prev => [...prev, errorMessage])
        await trackEvent('chat_error', { error: error.message })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const startNewChat = async () => {
    const title = `New Chat ${new Date().toLocaleTimeString()}`
    const chat = await createChat?.(title, selectedSubject?.id)

    if (chat) {
      setCurrentChat(chat)
      setChatHistory(prev => [{
        id: chat.id,
        title,
        subject: selectedSubject?.name || 'General',
        lastMessage: 'New conversation started',
        timestamp: new Date()
      }, ...prev])
    }

    setMessages([
      {
        id: 1, type: 'ai', text: selectedSubject
          ? `Hello! I'm ready to help you with ${selectedSubject.name}. What would you like to learn about today?`
          : 'Hello! I\'m ready to help you study. You can ask me to explain a topic, solve a problem, or practice a language. What are we working on today?'
      }
    ])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen w-full bg-background-dark">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-full border-r border-border-dark bg-surface-dark flex-shrink-0 z-20">
        <div className="p-5 pb-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-background-dark shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[20px] font-bold">school</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-lg font-bold leading-tight tracking-tight">Edu Buddy AI</h1>
              <p className="text-text-secondary text-xs font-medium">Study Assistant Pro</p>
            </div>
          </Link>
        </div>
        <div className="px-4 pb-4 flex flex-col gap-2 flex-1 overflow-y-auto">
          <button
            onClick={startNewChat}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary hover:bg-primary-hover transition-colors group mb-4 shadow-md shadow-primary/10 text-background-dark font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="text-sm">New Chat</span>
          </button>

          {/* Subject Filter */}
          <div className="mb-4">
            <h3 className="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Subject</h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSelectedSubject(null)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${!selectedSubject ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
              >
                <span className="material-symbols-outlined text-[18px]">school</span>
                <span className="text-sm">All Subjects</span>
              </button>
              {subjects.slice(0, 6).map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${selectedSubject?.id === subject.id ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ color: subject.color }}>
                    {subject.icon}
                  </span>
                  <span className="text-sm truncate">{subject.name}</span>
                </button>
              ))}
            </div>
          </div>

          <h3 className="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Recent Chats</h3>
          {chatHistory.map((chat) => (
            <button
              key={chat.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group cursor-pointer relative overflow-hidden transition-colors ${currentChat?.id === chat.id
                ? 'bg-surface-dark border border-border-dark text-white'
                : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
            >
              {currentChat?.id === chat.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg"></div>
              )}
              <span className="material-symbols-outlined text-primary text-[20px]">chat_bubble</span>
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="text-sm font-medium truncate w-full">{chat.title}</span>
                <span className="text-xs text-text-secondary truncate w-full">{chat.lastMessage}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative bg-background-dark">
        {/* Header */}
        <header className="h-16 border-b border-border-dark flex items-center justify-between px-6 bg-background-dark/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2 text-text-secondary hover:bg-surface-dark rounded-lg">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {currentChat?.title || (selectedSubject ? `${selectedSubject.name} Chat` : 'Study Chat')}
                </h2>
                {selectedSubject && (
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    {selectedSubject.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary hidden sm:block">
                {isLoading ? 'Edu Buddy is typing...' : 'Ready to help you learn'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden sm:flex h-9 items-center justify-center gap-2 px-3 rounded-lg bg-surface-dark hover:bg-border-dark text-text-secondary hover:text-white text-xs font-semibold transition-colors">
              <span className="material-symbols-outlined text-[18px]">share</span>Share
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-dark hover:bg-border-dark text-text-secondary hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto w-full relative pb-40">
          <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  layout
                  className={`flex gap-4 sm:gap-6 group ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 mt-1 ${msg.type === 'user' ? '' : ''}`}>
                    {msg.type === 'ai' ? (
                      <div className="flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-background-dark text-[20px]">school</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-cover bg-center border-2 border-border-dark"
                        style={{ backgroundImage: `url("${user?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGAIP6RSV3u5OzEyfxEpLFtiQ50o8nVk_6ysbEfGpvkppn7bnbtIH4SQjvVe00k06MZfjbFkc6PQvpFMx9bOqdHSwho306v6l4mS1HupiTk59x5HEiyOZg4gQKSFzvRuJv35gs-oYvd_ew6Wnez5jcb76108K45V5hA9Yd6svbGSzf8wnAizmWKCm1gvcoXnZGCbmPHV908zuYYfdGMnIkWmLLJ2EG5qF6t2uQurJboKGLMSHHuuopwBMypnnbOPHoQ_tonaWkMcw'}")` }}></div>
                    )}
                  </div>
                  <div className={`flex flex-col gap-2 max-w-[85%] sm:max-w-[75%] ${msg.type === 'user' ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{msg.type === 'ai' ? 'Edu Buddy' : user?.full_name || 'You'}</span>
                      {msg.type === 'ai' && <span className="text-xs text-text-secondary">AI Assistant</span>}
                    </div>
                    <div className={`p-5 rounded-2xl ${msg.type === 'ai' ? 'bg-surface-dark border border-border-dark text-text-secondary' : 'bg-primary text-background-dark'} ${msg.type === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'} shadow-sm text-base leading-relaxed whitespace-pre-wrap`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-4 sm:gap-6"
              >
                <div className="flex items-center justify-center size-8 rounded-full bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-background-dark text-[20px]">school</span>
                </div>
                <div className="flex flex-col gap-2 max-w-[75%]">
                  <span className="text-sm font-semibold text-white">Edu Buddy</span>
                  <div className="bg-surface-dark border border-border-dark rounded-2xl rounded-tl-sm p-5">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                      </div>
                      <span className="text-text-secondary text-sm ml-2">Thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full px-4 pb-6 pt-2 bg-gradient-to-t from-background-dark via-background-dark to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-2 bg-surface-dark p-2 rounded-2xl shadow-xl border border-border-dark focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
              <button className="flex items-center justify-center w-10 h-10 rounded-xl text-text-secondary hover:text-primary hover:bg-white/5 transition-colors flex-shrink-0 mb-1">
                <span className="material-symbols-outlined text-[24px]">add_circle</span>
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? "Edu Buddy is thinking..." : selectedSubject ? `Ask about ${selectedSubject.name}...` : "Ask a follow-up question..."}
                disabled={isLoading}
                className="w-full bg-transparent border-none text-white placeholder-text-secondary/50 focus:ring-0 resize-none py-3 max-h-32 text-base leading-relaxed disabled:opacity-50"
                rows="1"
                style={{ minHeight: '48px' }}
              />
              <div className="flex items-center gap-1 mb-1">
                <button className="flex items-center justify-center w-9 h-9 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                </button>
                <button
                  onClick={handleSend}
                  className="flex items-center justify-center h-9 px-4 rounded-lg bg-primary hover:bg-primary-hover text-background-dark font-bold shadow-md shadow-primary/20 transition-all active:scale-95 ml-1"
                >
                  <span className="hidden sm:inline mr-1 text-sm">Send</span>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-text-secondary/60 mt-2">Edu Buddy AI can make mistakes. Consider checking important information.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
