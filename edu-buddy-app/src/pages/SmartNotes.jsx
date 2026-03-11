import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useTracking } from '../context/TrackingContext'
import { sendMessageToGemini } from '../lib/gemini'
import FileUpload from '../components/FileUpload'
import * as fileStorage from '../lib/fileStorage'
import * as pdfjsLib from 'pdfjs-dist'

// Set worker to local file in public folder to avoid CDN/CORS issues
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function SmartNotes() {
  const { user, saveNote } = useApp() // removed subjects as it wasn't used
  const { trackPageNavigation, trackNoteEvent } = useTracking()
  const [selectedType, setSelectedType] = useState('summary')
  const [file, setFile] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [generatedNotes, setGeneratedNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [extractionStatus, setExtractionStatus] = useState('') // 'extracting', 'ready', 'error'
  const [uploadedFiles, setUploadedFiles] = useState([])
  const fileInputRef = useRef(null)

  // Track page navigation
  useEffect(() => {
    trackPageNavigation('/notes', 'Smart Notes Generator')
  }, [])

  const handleGenerate = async () => {
    if (!extractedText) return

    setIsLoading(true)
    setGeneratedNotes('')

    try {
      let promptPrefix = ''
      switch (selectedType) {
        case 'summary':
          promptPrefix = 'Create a comprehensive summary of the following text, highlighting the main points and key takeaways:'
          break
        case 'bullets':
          promptPrefix = 'Convert the following text into a structured list of key bullet points:'
          break
        case 'formulas':
          promptPrefix = 'Extract and list all the formulas, equations, and mathematical or scientific definitions from the following text:'
          break
        case 'quiz':
          promptPrefix = 'Create a short quiz (5 questions) with answers based on the following text:'
          break
        default:
          promptPrefix = 'Analyze the following text:'
      }

      const fullPrompt = `${promptPrefix}\n\n${extractedText}`
      // Truncate if too long (rough safety check, though Gemini 1.5/2.0 context is huge, we want to be safe with standard calls)
      // Sending first ~30k chars for now to ensure speed and responsiveness if file is huge book.
      // Adjust as needed.
      const truncatedPrompt = fullPrompt.length > 50000 ? fullPrompt.substring(0, 50000) + '...[Text Truncated]' : fullPrompt

      const response = await sendMessageToGemini(truncatedPrompt, "You are an expert study assistant. Format your response with clear Markdown, using headings, bold text for key terms, and bullet points.")

      setGeneratedNotes(response)

      // Track note generation
      await trackNoteEvent(selectedType, response.length)

      // Save note and refresh stats
      await saveNote({
        title: file ? `Notes: ${file.name}` : `Smart Notes - ${new Date().toLocaleDateString()}`,
        content: response,
        subject_id: null, // Could add subject selector later
        type: selectedType
      })
    } catch (error) {
      console.error('Generation error:', error)
      setGeneratedNotes('Failed to generate notes. Please check your API key and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (uploadedFileList) => {
    try {
      setExtractionStatus('extracting')
      
      for (const uploadedFile of uploadedFileList) {
        let text = ''
        
        // Get file for processing
        const response = await fetch(uploadedFile.url)
        const blob = await response.blob()
        const processedFile = new File([blob], uploadedFile.name, { type: uploadedFile.type })

        if (uploadedFile.type === 'application/pdf' || uploadedFile.name.endsWith('.pdf')) {
          const arrayBuffer = await processedFile.arrayBuffer()
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

          const maxPages = pdf.numPages
          for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            const pageText = content.items.map((item) => item.str).join(' ')
            text += pageText + ' '
          }
        } else if (uploadedFile.type === 'text/plain' || uploadedFile.name.endsWith('.txt')) {
          text = await processedFile.text()
        }

        if (text) {
          setExtractedText(text)
          setFile(uploadedFile)
          setUploadedFiles(prev => [...prev, uploadedFile])
          setExtractionStatus('ready')
        }
      }
    } catch (error) {
      console.error('Error processing uploaded file:', error)
      setExtractionStatus('error')
    }
  }

  return (
    <div className="bg-background-dark text-white font-display overflow-hidden h-screen flex">
      {/* Sidebar - Keeping original structure */}
      <aside className="w-64 h-full flex flex-col border-r border-border-dark bg-[#0f1512] shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 rounded-full bg-gradient-to-br from-primary to-emerald-800 flex items-center justify-center text-background-dark font-bold text-xl">E</div>
          <div>
            <h1 className="text-white text-lg font-bold leading-tight">Edu Buddy</h1>
            <p className="text-text-secondary text-xs font-normal">AI Study Assistant</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-full text-text-secondary hover:bg-white/5 hover:text-white transition-colors group">
            <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link to="/notes" className="flex items-center gap-3 px-4 py-3 rounded-full bg-primary/10 text-primary border border-primary/20">
            <span className="material-symbols-outlined text-[24px]">sticky_note_2</span>
            <span className="text-sm font-medium">Smart Notes</span>
          </Link>
          <Link to="/quiz" className="flex items-center gap-3 px-4 py-3 rounded-full text-text-secondary hover:bg-white/5 hover:text-white transition-colors group">
            <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">psychology</span>
            <span className="text-sm font-medium">AI Quiz</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-border-dark flex items-center justify-between px-8 bg-[#0f1512]/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold tracking-tight">Smart Notes Generator</h2>
          <button className="flex items-center gap-2 text-sm font-bold text-background-dark bg-primary px-4 py-2 rounded-full hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(54,226,123,0.3)]">
            <span className="material-symbols-outlined text-[20px]">bolt</span>
            <span>Upgrade to Pro</span>
          </button>
        </header>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-8">
            {/* Left Column: Input */}
            <div className="w-full lg:w-5/12 xl:w-4/12 flex flex-col gap-6 shrink-0">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Upload Material</h1>
                <p className="text-text-secondary text-sm">Upload your lecture slides (PDF) or notes (TXT) to generate concise AI study notes.</p>
              </div>

              {/* Upload Dropzone - FileUpload Component */}
              <FileUpload
                onFileUpload={handleFileUpload}
                acceptedTypes={['.pdf', '.txt']}
                maxSize={25}
                multiple={false}
                showPreview={true}
                autoProcess={true}
                storageFolder="documents/notes"
              />

              {/* Settings */}
              <div className="flex flex-col gap-4 bg-[#1a1a1e]/50 p-6 rounded-3xl border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white uppercase tracking-wider">Output Type</label>
                  <span className="text-xs text-primary cursor-pointer hover:underline" onClick={() => setSelectedType('summary')}>Reset</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'summary', icon: 'summarize', label: 'Summary' },
                    { id: 'bullets', icon: 'format_list_bulleted', label: 'Bullet Points' },
                    { id: 'formulas', icon: 'functions', label: 'Formulas' },
                    { id: 'quiz', icon: 'quiz', label: 'Quiz' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${selectedType === type.id
                        ? 'bg-primary text-background-dark shadow-lg shadow-primary/20'
                        : 'bg-surface-dark border border-white/10 text-text-secondary hover:text-white hover:border-primary/50'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!extractedText || isLoading}
                className={`w-full mt-auto h-14 rounded-full text-background-dark text-base font-bold tracking-wide transition-all flex items-center justify-center gap-2 group ${!extractedText || isLoading
                  ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                  : 'bg-primary hover:bg-primary-hover shadow-[0_4px_20px_rgba(54,226,123,0.25)] hover:shadow-[0_4px_25px_rgba(54,226,123,0.4)]'
                  }`}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined group-hover:animate-pulse">auto_awesome</span>
                    Generate Notes
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Output */}
            <div className="flex-1 flex flex-col h-full min-h-[600px] bg-surface-dark rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative">
              {/* Output Header */}
              <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-surface-dark/90 backdrop-blur shrink-0 z-10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">description</span>
                  <span className="font-bold text-white uppercase tracking-wider">{file ? file.name : 'No Document'}</span>
                  {generatedNotes && <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-mono">GENERATED</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedNotes)}
                    className="size-9 rounded-full hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                  </button>
                </div>
              </div>

              {/* Output Content */}
              <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-gradient-to-b from-[#1a1a1e] to-[#151518]">
                <div className="max-w-3xl mx-auto font-body leading-relaxed">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 opacity-50">
                      <div className="animate-bounce mb-4 text-4xl text-primary">✨</div>
                      <p className="text-white text-lg font-medium animate-pulse">Analyzing document & crafting notes...</p>
                      <p className="text-text-secondary text-sm mt-2">This might take a few seconds.</p>
                    </div>
                  ) : generatedNotes ? (
                    <div className="markdown-content text-text-secondary space-y-6">
                      {/* Simple rendering of markdown text to basic HTML mostly relying on whitespace/bolding for now since we don't have a markdown renderer installed, or we can just split by newlines */}
                      {generatedNotes.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-display font-bold text-white mb-4 mt-8">{line.replace('# ', '')}</h1>
                        if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-display font-bold text-white mb-3 mt-6 flex items-center gap-2"><span className="w-1.5 h-6 bg-primary rounded-full"></span>{line.replace('## ', '')}</h2>
                        if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-display font-bold text-white mb-2 mt-4">{line.replace('### ', '')}</h3>
                        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="flex items-start gap-3 ml-4 mb-2"><span className="material-symbols-outlined text-primary shrink-0 mt-0.5 text-[18px]">check_circle</span><span>{line.replace(/^[-*] /, '')}</span></li>
                        return <p key={i} className="mb-2">{line}</p>
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-30 select-none">
                      <span className="material-symbols-outlined text-6xl mb-4">article</span>
                      <p className="text-lg text-white">Upload a document to see AI-generated notes here.</p>
                      <p className="text-sm text-text-secondary">Supported formats: PDF, Text</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

