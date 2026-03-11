// Google Gemini API Integration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Demo responses for when API is not available
const demoResponses = {
  greeting: "Hello! How can I assist you with your studies today? I'm here to help you learn and understand any topic you're working on.",
  default: "I'm currently in demo mode. To enable real AI responses, please add a valid Google Gemini API key to your .env.local file.\n\nGet your free API key at: https://makersuite.google.com/app/apikey\n\nFor now, I can help you with basic study questions!",
  math: "Great math question! Let me help you understand this concept step by step:\n\n1. First, identify what we're solving for\n2. Apply the relevant formula or theorem\n3. Work through the calculation\n4. Check your answer\n\nWould you like me to explain a specific math topic?",
  science: "That's an interesting science question! Here's a clear explanation:\n\nScientific concepts are best understood through:\n• Clear definitions\n• Real-world examples\n• Step-by-step processes\n• Visual representations\n\nWhat specific science topic would you like to explore?",
}

// Check if message is a greeting
function isGreeting(message) {
  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'howdy']
  const lowerMsg = message.toLowerCase().trim()
  return greetings.some(greeting =>
    lowerMsg === greeting ||
    lowerMsg.startsWith(greeting + ' ') ||
    lowerMsg.startsWith(greeting + ',') ||
    lowerMsg.startsWith(greeting + '!')
  )
}

export async function sendMessageToGemini(userMessage, systemPrompt) {
  console.log('API Key loaded:', GEMINI_API_KEY ? 'Yes' : 'No')

  // Handle greetings first (both demo and real API)
  if (isGreeting(userMessage)) {
    await new Promise(resolve => setTimeout(resolve, 500)) // Quick response for greetings
    return "Hello! How can I assist you with your studies today? I'm here to help you learn and understand any topic you're working on."
  }

  // Demo mode if no API key
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_google_gemini_api_key_here') {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

    const lowerMsg = userMessage.toLowerCase()
    if (lowerMsg.includes('math') || lowerMsg.includes('equation') || lowerMsg.includes('calculate')) {
      return demoResponses.math
    } else if (lowerMsg.includes('science') || lowerMsg.includes('physics') || lowerMsg.includes('chemistry') || lowerMsg.includes('biology')) {
      return demoResponses.science
    }
    return demoResponses.default
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

  // Default system prompt if none provided
  const finalSystemPrompt = systemPrompt || `You are Edu Buddy, a friendly AI study assistant. Help students learn by explaining concepts clearly with examples. Be encouraging and educational.

Instructions:
- Provide clear, educational explanations
- Solve problems step-by-step using a logical approach
- Be encouraging and supportive
- Use examples when helpful`

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${finalSystemPrompt}

Student: ${userMessage}

Edu Buddy:`
          }]
        }]
      })
    })

    const data = await response.json()
    console.log('API Response:', data)

    if (!response.ok) {
      console.error('API Error:', data)
      throw new Error(data.error?.message || 'Failed to get AI response')
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      console.error('No text in response:', data)
      throw new Error('No response from AI')
    }

    return text
  } catch (error) {
    console.error('Gemini Error:', error)
    throw error
  }
}
