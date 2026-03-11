import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useTracking } from '../context/TrackingContext'
import { sendMessageToGemini } from '../lib/gemini'

// Demo questions for fallback
const demoQuestions = {
  'Mathematics': [
    {
      question: 'What is the derivative of x²?',
      options: ['x', '2x', '2', 'x²'],
      correct: 1,
      explanation: 'The power rule states that d/dx(xⁿ) = nxⁿ⁻¹. So d/dx(x²) = 2x¹ = 2x'
    },
    {
      question: 'What is the value of π (pi) rounded to 2 decimal places?',
      options: ['3.12', '3.14', '3.16', '3.18'],
      correct: 1,
      explanation: 'Pi (π) is approximately 3.14159..., which rounds to 3.14'
    },
    {
      question: 'What is the quadratic formula used to solve ax² + bx + c = 0?',
      options: ['x = -b/2a', 'x = (-b ± √(b²-4ac))/2a', 'x = b² - 4ac', 'x = -b ± √(b²+4ac)'],
      correct: 1,
      explanation: 'The quadratic formula x = (-b ± √(b²-4ac))/2a gives the solutions to any quadratic equation.'
    }
  ],
  'Physics': [
    {
      question: 'What is Newton\'s Second Law of Motion?',
      options: ['F = ma', 'E = mc²', 'F = mv', 'a = v/t'],
      correct: 0,
      explanation: 'Newton\'s Second Law states that Force equals mass times acceleration (F = ma).'
    },
    {
      question: 'What is the SI unit of electric current?',
      options: ['Volt', 'Watt', 'Ampere', 'Ohm'],
      correct: 2,
      explanation: 'The Ampere (A) is the SI unit of electric current, named after André-Marie Ampère.'
    },
    {
      question: 'What is the speed of light in vacuum?',
      options: ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'],
      correct: 1,
      explanation: 'The speed of light in vacuum is approximately 3 × 10⁸ meters per second (299,792,458 m/s).'
    }
  ],
  'Computer Science': [
    {
      question: 'Which data structure uses LIFO (Last In, First Out)?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correct: 1,
      explanation: 'A Stack follows LIFO principle - the last element added is the first one to be removed.'
    },
    {
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
      correct: 2,
      explanation: 'Binary search has O(log n) time complexity because it halves the search space with each comparison.'
    },
    {
      question: 'Which hook in React is used for side effects?',
      options: ['useState', 'useEffect', 'useContext', 'useReducer'],
      correct: 1,
      explanation: 'useEffect is used for side effects like data fetching, subscriptions, or DOM manipulation.'
    }
  ],
  'default': [
    {
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correct: 2,
      explanation: 'Paris is the capital and largest city of France.'
    },
    {
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correct: 1,
      explanation: 'Mars is called the Red Planet due to iron oxide (rust) on its surface giving it a reddish appearance.'
    },
    {
      question: 'What is H₂O commonly known as?',
      options: ['Salt', 'Sugar', 'Water', 'Oxygen'],
      correct: 2,
      explanation: 'H₂O is the chemical formula for water - two hydrogen atoms bonded to one oxygen atom.'
    }
  ]
}

export default function Quiz() {
  const { user, subjects, submitQuiz, stats } = useApp()
  const { trackPageNavigation, trackQuizEvent } = useTracking()

  // Quiz states
  const [quizState, setQuizState] = useState('setup') // setup, loading, playing, results
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [customTopic, setCustomTopic] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [questionCount, setQuestionCount] = useState(5)

  // Game states
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [loadingError, setLoadingError] = useState(null)

  // Track page navigation on mount
  useEffect(() => {
    trackPageNavigation('/quiz', 'Quiz Practice')
  }, [])

  const parseAIQuestions = (text) => {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return parsed.map(q => ({
          question: q.question,
          options: q.options,
          correct: q.correct || q.correctAnswer || 0,
          explanation: q.explanation || 'Great job!'
        }))
      }
    } catch (e) {
      console.log('Failed to parse AI response, using demo questions')
    }
    return null
  }

  const generateQuiz = async () => {
    setQuizState('loading')
    setLoadingError(null)

    const topic = customTopic || selectedSubject?.name || 'General Knowledge'

    try {
      const prompt = `Generate exactly ${questionCount} multiple choice quiz questions about "${topic}" at ${difficulty} difficulty level.

Return ONLY a valid JSON array with this exact format, no other text:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation of the correct answer"
  }
]

The "correct" field should be the index (0-3) of the correct option.
Make questions educational and clear.`

      const systemPrompt = "You are a Quiz Generator AI. Output strictly valid JSON arrays. Do not add markdown formatting or conversational text."
      const response = await sendMessageToGemini(prompt, systemPrompt)
      const parsedQuestions = parseAIQuestions(response)

      if (parsedQuestions && parsedQuestions.length > 0) {
        setQuestions(parsedQuestions)
      } else {
        // Use demo questions as fallback
        const demoKey = Object.keys(demoQuestions).find(k =>
          topic.toLowerCase().includes(k.toLowerCase())
        ) || 'default'
        setQuestions(demoQuestions[demoKey].slice(0, questionCount))
      }

      // Track quiz started event
      trackQuizEvent('quiz_started', {
        subject: topic,
        difficulty: difficulty,
        question_count: questionCount
      })

      setQuizState('playing')
    } catch (error) {
      console.error('Error generating quiz:', error)
      // Use demo questions on error
      const demoKey = Object.keys(demoQuestions).find(k =>
        topic.toLowerCase().includes(k.toLowerCase())
      ) || 'default'
      setQuestions(demoQuestions[demoKey].slice(0, questionCount))
      
      // Track quiz started (even with demo questions)
      trackQuizEvent('quiz_started', {
        subject: topic,
        difficulty: difficulty,
        question_count: questionCount,
        used_demo: true
      })
      
      setQuizState('playing')
    }
  }

  const handleAnswerSelect = (index) => {
    if (showFeedback) return
    setSelectedAnswer(index)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === questions[currentQuestion].correct
    if (isCorrect) {
      setScore(prev => prev + 1)
    }

    setAnswers(prev => [...prev, {
      questionIndex: currentQuestion,
      selected: selectedAnswer,
      correct: questions[currentQuestion].correct,
      isCorrect
    }])

    setShowFeedback(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      const finalScore = score + (selectedAnswer === questions[currentQuestion].correct ? 1 : 0)
      const totalQuestions = questions.length
      const scorePercentage = Math.round((finalScore / totalQuestions) * 100)
      
      setQuizState('results')
      
      // Track quiz completion
      trackQuizEvent('quiz_completed', {
        subject: selectedSubject?.name || customTopic || 'General Knowledge',
        difficulty: difficulty,
        score: finalScore,
        total_questions: totalQuestions,
        score_percentage: scorePercentage
      })
      
      // Submit quiz results
      submitQuiz?.(
        `quiz-${Date.now()}`,
        answers,
        finalScore,
        questions.length,
        0
      )
    }
  }

  const resetQuiz = () => {
    setQuizState('setup')
    setSelectedSubject(null)
    setCustomTopic('')
    setQuestions([])
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setScore(0)
    setAnswers([])
  }

  const finalScore = showFeedback && currentQuestion === questions.length - 1
    ? score + (selectedAnswer === questions[currentQuestion].correct ? 1 : 0)
    : score

  return (
    <div className="min-h-screen bg-background-dark font-display text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border-dark bg-background-dark/95 backdrop-blur">
        <div className="px-4 md:px-10 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 text-white cursor-pointer group">
            <div className="size-8 text-primary transition-transform group-hover:rotate-12">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-tight">Edu Buddy AI</h2>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/dashboard" className="text-text-secondary hover:text-primary transition-colors text-sm font-medium">Dashboard</Link>
            <Link to="/chat" className="text-text-secondary hover:text-primary transition-colors text-sm font-medium">Chat</Link>
            <span className="text-white text-sm font-medium border-b-2 border-primary pb-0.5">Quiz</span>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full flex justify-center py-8 px-4 sm:px-6">
        <div className="flex flex-col w-full max-w-[960px] gap-6">

          {/* Setup Screen */}
          {quizState === 'setup' && (
            <>
              <section className="flex flex-col gap-2">
                <h1 className="text-white text-3xl md:text-4xl font-bold">Create Your Quiz</h1>
                <p className="text-text-secondary">Select a subject or enter a custom topic to generate AI-powered questions</p>
              </section>

              {/* Subject Selection */}
              <div className="flex flex-col gap-4">
                <h3 className="text-white font-semibold">Choose a Subject</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => {
                        setSelectedSubject(subject)
                        setCustomTopic('')
                      }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedSubject?.id === subject.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border-dark bg-surface-dark hover:border-text-secondary'
                        }`}
                    >
                      <span className="material-symbols-outlined text-2xl" style={{ color: subject.color }}>
                        {subject.icon}
                      </span>
                      <span className="text-sm font-medium">{subject.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Topic */}
              <div className="flex flex-col gap-2">
                <label className="text-white font-semibold">Or Enter a Custom Topic</label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => {
                    setCustomTopic(e.target.value)
                    setSelectedSubject(null)
                  }}
                  placeholder="e.g., World War II, Photosynthesis, JavaScript Promises..."
                  className="w-full px-4 py-3 rounded-xl bg-input-dark border border-border-dark text-white placeholder-text-secondary focus:outline-none focus:border-primary"
                />
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-white font-semibold">Difficulty</label>
                  <div className="flex gap-2">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium capitalize transition-all ${difficulty === level
                            ? 'bg-primary text-background-dark'
                            : 'bg-surface-dark text-text-secondary hover:text-white border border-border-dark'
                          }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-white font-semibold">Number of Questions</label>
                  <div className="flex gap-2">
                    {[3, 5, 10].map((count) => (
                      <button
                        key={count}
                        onClick={() => setQuestionCount(count)}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${questionCount === count
                            ? 'bg-primary text-background-dark'
                            : 'bg-surface-dark text-text-secondary hover:text-white border border-border-dark'
                          }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={generateQuiz}
                disabled={!selectedSubject && !customTopic}
                className="w-full py-4 rounded-xl bg-primary hover:bg-primary-hover text-background-dark font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(54,226,123,0.39)]"
              >
                Generate Quiz
              </button>
            </>
          )}

          {/* Loading Screen */}
          {quizState === 'loading' && (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center">
                <h2 className="text-white text-xl font-bold mb-2">Generating Your Quiz...</h2>
                <p className="text-text-secondary">Our AI is crafting personalized questions for you</p>
              </div>
            </div>
          )}

          {/* Playing Screen */}
          {quizState === 'playing' && questions.length > 0 && (
            <>
              {/* Quiz Header */}
              <section className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                    Quiz Mode
                  </span>
                  <h1 className="text-white text-2xl font-bold mt-2">
                    {customTopic || selectedSubject?.name || 'General Knowledge'}
                  </h1>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center bg-surface-dark border border-border-dark rounded-xl px-5 py-3">
                    <span className="text-text-secondary text-xs">Score</span>
                    <span className="text-primary text-2xl font-bold">{finalScore}/{questions.length}</span>
                  </div>
                </div>
              </section>

              {/* Progress Bar */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-white text-sm font-medium">Question {currentQuestion + 1} of {questions.length}</span>
                  <span className="text-text-secondary text-xs">{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
                </div>
                <div className="w-full h-2 rounded-full bg-border-dark overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 md:p-10">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-8">
                  {questions[currentQuestion].question}
                </h2>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {questions[currentQuestion].options.map((option, index) => {
                    const isCorrect = index === questions[currentQuestion].correct
                    const isSelected = selectedAnswer === index

                    let buttonClass = 'border-border-dark bg-input-dark hover:bg-white/5 hover:border-text-secondary'
                    if (showFeedback) {
                      if (isCorrect) {
                        buttonClass = 'border-green-500 bg-green-500/10'
                      } else if (isSelected && !isCorrect) {
                        buttonClass = 'border-red-500 bg-red-500/10'
                      }
                    } else if (isSelected) {
                      buttonClass = 'border-primary bg-primary/10'
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showFeedback}
                        className={`flex items-center p-4 rounded-xl border-2 transition-all text-left ${buttonClass}`}
                      >
                        <div className={`flex items-center justify-center size-8 rounded-lg text-sm font-bold mr-4 ${showFeedback && isCorrect ? 'bg-green-500 text-white' :
                            showFeedback && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                              isSelected ? 'bg-primary text-background-dark' : 'bg-border-dark text-text-secondary'
                          }`}>
                          {showFeedback && isCorrect ? '✓' :
                            showFeedback && isSelected && !isCorrect ? '✗' :
                              String.fromCharCode(65 + index)}
                        </div>
                        <span className={showFeedback && isCorrect ? 'text-white font-bold' : isSelected ? 'text-white' : 'text-text-secondary'}>
                          {option}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Feedback */}
                {showFeedback && (
                  <div className={`rounded-xl p-5 mb-6 ${selectedAnswer === questions[currentQuestion].correct
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                    }`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${selectedAnswer === questions[currentQuestion].correct ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                        <span className="material-symbols-outlined">
                          {selectedAnswer === questions[currentQuestion].correct ? 'check_circle' : 'cancel'}
                        </span>
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg ${selectedAnswer === questions[currentQuestion].correct ? 'text-green-500' : 'text-red-500'
                          }`}>
                          {selectedAnswer === questions[currentQuestion].correct ? 'Correct!' : 'Incorrect'}
                        </h3>
                        <p className="text-text-secondary text-sm mt-1">
                          {questions[currentQuestion].explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t border-border-dark">
                  {!showFeedback ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="bg-primary hover:bg-primary-hover text-background-dark font-bold py-3 px-8 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="bg-primary hover:bg-primary-hover text-background-dark font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all"
                    >
                      {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Results Screen */}
          {quizState === 'results' && (
            <div className="flex flex-col items-center py-10 gap-8">
              <div className="text-center">
                <div className="size-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-5xl">
                    {finalScore >= questions.length * 0.7 ? 'emoji_events' : finalScore >= questions.length * 0.5 ? 'thumb_up' : 'school'}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h1>
                <p className="text-text-secondary">
                  {finalScore >= questions.length * 0.7 ? 'Excellent work! You really know your stuff!' :
                    finalScore >= questions.length * 0.5 ? 'Good job! Keep practicing to improve.' :
                      'Keep studying! Practice makes perfect.'}
                </p>
              </div>

              <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 w-full max-w-md">
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-primary mb-2">{finalScore}/{questions.length}</div>
                  <div className="text-text-secondary">Questions Correct</div>
                </div>
                <div className="flex justify-around text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{Math.round((finalScore / questions.length) * 100)}%</div>
                    <div className="text-text-secondary text-sm">Score</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{difficulty}</div>
                    <div className="text-text-secondary text-sm">Difficulty</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={resetQuiz}
                  className="py-3 px-6 rounded-lg bg-surface-dark border border-border-dark text-white font-medium hover:bg-border-dark transition-all"
                >
                  New Quiz
                </button>
                <Link
                  to="/dashboard"
                  className="py-3 px-6 rounded-lg bg-primary hover:bg-primary-hover text-background-dark font-bold transition-all"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
