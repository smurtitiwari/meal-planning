import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import BottomNav from '../components/BottomNav'
import { Sparkles, Send, Play } from 'lucide-react'

type Message = {
  id: string
  role: 'system' | 'user' | 'assistant'
  content: string
  recipeSuggestion?: {
    name: string
    videoTitle: string
    videoUrl: string
    thumbnail: string
  }
}

export default function AskJulienne() {
  const { preferences } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const userName = preferences.name || 'User'

  const lightColors = {
    pageSurface: '#FFFFFF',
    textPrimary: '#111111',
    textSecondary: '#8A8A8A',
    border: '#EAE4DC',
    card: '#F6F6F6',
    accentText: '#3C151A',
    accentBackground: '#FBF5F6',
    userBubble: '#FBF5F6',
    assistantBubble: '#FFFFFF'
  }
  
  const darkColors = {
    pageSurface: '#121212',
    textPrimary: '#FEFEFE',
    textSecondary: '#D6D1D3',
    border: '#2E2E2E',
    card: '#1B1B1B',
    accentText: '#F0C7CF',
    accentBackground: 'rgba(154, 77, 90, 0.18)',
    userBubble: 'rgba(154, 77, 90, 0.18)',
    assistantBubble: '#121212'
  }
  
  const colors = preferences.darkMode ? darkColors : lightColors

  const suggestions = [
    { label: 'American 🍔', query: 'I want an American style burger recipe' },
    { label: 'Low Carb 🥦', query: 'Suggest a low carb recipe' },
    { label: 'Healthy 🥗', query: 'Give me a healthy salad recipe' },
    { label: 'High Protein 🥩', query: 'High protein dinner ideas' }
  ]

  const mockResponse = (query: string) => {
    setIsTyping(true)
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Here is a great recipe that fits what you're looking for! I found a video tutorial as well so your cook can easily follow along.",
          recipeSuggestion: {
            name: "Protein Packed Salad Bowl",
            videoTitle: "Ultimate Healthy Recipe Guide",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            thumbnail: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"
          }
        }
      ])
      setIsTyping(false)
    }, 1500)
  }

  const handleSend = (text: string) => {
    if (!text.trim()) return
    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    mockResponse(text.trim())
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: colors.pageSurface }}>
      <div className="px-5 pt-14 pb-4 sticky top-0 z-10" style={{ background: colors.pageSurface }}>
        <div className="flex items-center justify-between">
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '32px', fontWeight: 400, color: colors.textPrimary, margin: 0 }}>
            Ask Julienne
          </h1>
          <button 
            onClick={() => setMessages([])}
            className="px-3 py-1.5 rounded-full border bg-transparent cursor-pointer"
            style={{ borderColor: colors.border, color: colors.textPrimary, fontSize: '13px', fontWeight: 600 }}>
            Clear chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32">
        {messages.length === 0 ? (
          <div className="mt-4">
            <p style={{ fontSize: '16px', lineHeight: 1.5, color: colors.textPrimary, fontWeight: 500, margin: '0 0 24px 0' }}>
              <span style={{ fontWeight: 800 }}>Hey, {userName}!</span> Looking for something a little different? 
              Tell us what you're in the mood for and we'll put together a dish, just for you.
            </p>
            
            <p style={{ fontSize: '13px', fontWeight: 700, color: colors.textPrimary, margin: '0 0 12px 0' }}>
              Need some inspiration? Try these
            </p>
            
            <div className="flex gap-2 flex-wrap">
              {suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(s.query)}
                  className="px-4 py-2 rounded-full border bg-transparent cursor-pointer transition-smooth"
                  style={{ borderColor: colors.border, color: colors.textPrimary, fontSize: '14px', fontWeight: 600 }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3" style={{ background: colors.userBubble }}>
                    <p style={{ margin: 0, fontSize: '15px', color: colors.accentText, lineHeight: 1.4 }}>{msg.content}</p>
                  </div>
                ) : (
                  <div className="max-w-[90%]">
                    <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: colors.textPrimary, lineHeight: 1.5 }}>
                      {msg.content}
                    </p>
                    {msg.recipeSuggestion && (
                      <div className="card overflow-hidden" style={{ borderRadius: 16 }}>
                        <div style={{ height: 160, position: 'relative' }}>
                          <img src={msg.recipeSuggestion.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="recipe" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center backdrop-blur-sm">
                              <Play size={20} className="ml-1" style={{ color: '#D9534F' }} />
                            </div>
                          </div>
                        </div>
                        <div className="p-3.5">
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: colors.textPrimary }}>{msg.recipeSuggestion.name}</h4>
                          <a href={msg.recipeSuggestion.videoUrl} target="_blank" rel="noopener noreferrer" 
                             style={{ fontSize: '13px', color: '#D9534F', textDecoration: 'none', fontWeight: 600 }}>
                             Watch on YouTube
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4" style={{ background: `linear-gradient(transparent, ${colors.pageSurface} 20%)` }}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 p-1.5 rounded-full" style={{ background: colors.card, border: `1.5px solid ${colors.border}` }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Message"
              className="flex-1 bg-transparent border-none outline-none px-4"
              style={{ fontSize: '15px', color: colors.textPrimary }}
            />
            <button 
              onClick={() => handleSend(input)}
              className="px-4 py-2 rounded-full border-none cursor-pointer transition-smooth"
              style={{ 
                background: input.trim() ? colors.accentText : colors.border, 
                color: input.trim() ? '#FFF' : colors.textSecondary,
                fontWeight: 600
              }}>
              Send
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
