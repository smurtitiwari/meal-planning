import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, generateId } from '../store/useStore'
import BottomNav from '../components/BottomNav'
import { Play, BookmarkPlus, Check, UtensilsCrossed } from 'lucide-react'

type RecipeSuggestion = {
  name: string
  videoTitle: string
  videoUrl: string
  thumbnail: string
  ingredients: string[]
  cookTime?: string
  calories?: number
}

type Message = {
  id: string
  role: 'system' | 'user' | 'assistant'
  content: string
  recipeSuggestion?: RecipeSuggestion
}

const serifFont = "'DM Serif Display', Georgia, serif"

export default function AskChef() {
  const navigate = useNavigate()
  const { preferences, addRecipe, recipes } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [introTyping, setIntroTyping] = useState(true)
  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const userName = preferences.name || 'there'

  const lightColors = {
    pageSurface: '#FBFAF8',
    textPrimary: '#1C1C1C',
    textSecondary: '#6F6B66',
    textTertiary: '#6F6B66',
    border: 'rgba(0,0,0,0.07)',
    card: '#F5F3F1',
    accentText: '#4A1F23',
    accentPurple: '#4A1F23',
    accentBackground: '#F2F3F5',
    userBubble: '#F2F3F5',
    chipBg: '#F1F2F4',
    chipText: '#3C151A',
  }

  const darkColors = {
    pageSurface: '#121212',
    textPrimary: '#FEFEFE',
    textSecondary: '#D6D1D3',
    textTertiary: '#A9A0A3',
    border: '#2E2E2E',
    card: '#1B1B1B',
    accentText: '#F0C7CF',
    accentPurple: '#9A4D5A',
    accentBackground: 'rgba(154, 77, 90, 0.18)',
    userBubble: 'rgba(154, 77, 90, 0.18)',
    chipBg: 'rgba(255,255,255,0.1)',
    chipText: '#F0C7CF',
  }

  const colors = preferences.darkMode ? darkColors : lightColors

  const suggestions = [
    { label: 'Chicken & rice 🍗', query: 'What can I make with chicken and rice?' },
    { label: 'Vegetarian under 15 min 🥗', query: 'Quick vegetarian recipe under 15 mins' },
    { label: 'High protein dinner 🍳', query: 'High protein dinner ideas' },
    { label: 'Something sweet 🍓', query: 'Suggest a healthy dessert' },
  ]

  const mockResponse = (_query: string) => {
    setIsTyping(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Here's a great recipe that fits what you're looking for. I found a video tutorial too so your cook can easily follow along.",
          recipeSuggestion: {
            name: 'Protein Packed Salad Bowl',
            videoTitle: 'Ultimate Healthy Recipe Guide',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
            ingredients: ['Quinoa', 'Chickpeas', 'Cucumber', 'Cherry tomato', 'Feta cheese', 'Olive oil', 'Lemon'],
            cookTime: '20 min',
            calories: 420,
          },
        },
      ])
      setIsTyping(false)
    }, 1200)
  }

  const handleSend = (text: string) => {
    if (!text.trim()) return
    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() }
    setMessages((prev) => [...prev, newMsg])
    setInput('')
    mockResponse(text.trim())
  }

  const handleSaveRecipe = (msgId: string, suggestion: RecipeSuggestion) => {
    if (savedRecipes.has(msgId)) return
    const alreadySaved = recipes.some((r) => r.name.toLowerCase() === suggestion.name.toLowerCase())
    if (!alreadySaved) {
      addRecipe({
        id: generateId(),
        name: suggestion.name,
        ingredients: suggestion.ingredients,
        category: 'main',
        link: suggestion.videoUrl,
        image: suggestion.thumbnail,
        mealType: 'lunch',
      })
    }
    setSavedRecipes((prev) => new Set(prev).add(msgId))
    setToast('Recipe added to your collection.')
    setTimeout(() => setToast(null), 2400)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, introTyping])

  useEffect(() => {
    if (messages.length === 0) {
      setIntroTyping(true)
      const timer = setTimeout(() => setIntroTyping(false), 1400)
      return () => clearTimeout(timer)
    }
  }, [messages.length])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: colors.pageSurface }}>
      <div className="px-5 pt-14 pb-4 sticky top-0 z-10" style={{ background: colors.pageSurface }}>
        <div className="flex items-center justify-between">
          <h1 style={{ fontFamily: serifFont, fontSize: '32px', fontWeight: 400, color: colors.textPrimary, margin: 0 }}>
            Ask Chef
          </h1>
          <button
            onClick={() => setMessages([])}
            className="px-3 py-1.5 rounded-full border bg-transparent cursor-pointer"
            style={{ borderColor: colors.border, color: colors.textPrimary, fontSize: '13px', fontWeight: 600, minHeight: 36 }}
          >
            Clear chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32">
        {messages.length === 0 ? (
          <div className="mt-4 space-y-6">
            <div className="flex justify-start">
              {introTyping ? (
                <div className="px-0 py-3">
                  <div className="flex gap-1" style={{ marginLeft: 4 }}>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              ) : (
                <div className="max-w-[92%] w-full">
                  <p style={{ fontSize: '16px', lineHeight: 1.5, color: colors.textPrimary, margin: '0 0 18px 0', animation: 'fadeIn 0.3s ease-out' }}>
                    Hey, <span style={{ fontWeight: 800 }}>{userName}</span>. I am here to make your today's meal planning simpler. Share the ingredients you have or select the pre-generated suggestions.
                  </p>
                  <div className="flex gap-2 flex-wrap" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(s.query)}
                        className="px-4 rounded-full cursor-pointer transition-smooth outline-none border"
                        style={{
                          background: preferences.darkMode ? '#1B1B1B' : '#F6F6F6',
                          borderColor: preferences.darkMode ? 'rgba(255,255,255,0.08)' : '#ECE8E4',
                          color: colors.textPrimary,
                          fontSize: '13px',
                          fontWeight: 600,
                          minHeight: 40,
                          boxShadow: preferences.darkMode ? 'none' : '0 2px 6px rgba(0,0,0,0.03)',
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 mt-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3" style={{ background: colors.userBubble }}>
                    <p style={{ margin: 0, fontSize: '15px', color: colors.accentText, lineHeight: 1.4 }}>{msg.content}</p>
                  </div>
                ) : (
                  <div className="max-w-[92%] w-full">
                    <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: colors.textPrimary, lineHeight: 1.5 }}>
                      {msg.content}
                    </p>
                    {msg.recipeSuggestion && (
                      <ChatRecipeCard
                        colors={colors}
                        suggestion={msg.recipeSuggestion}
                        saved={savedRecipes.has(msg.id)}
                        onSave={() => handleSaveRecipe(msg.id, msg.recipeSuggestion!)}
                        onOpen={() => navigate(`/recipe/ai-${msg.id}`, { state: { recipe: msg.recipeSuggestion, source: 'chat' } })}
                      />
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

      {/* Toast */}
      {toast && (
        <div
          className="fixed left-0 right-0 flex justify-center pointer-events-none z-60"
          style={{ bottom: 148 }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-full"
            style={{
              background: colors.textPrimary,
              color: colors.pageSurface,
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            }}
          >
            <Check size={14} />
            {toast}
          </div>
        </div>
      )}

      <div className="fixed bottom-16 left-0 right-0 p-4" style={{ background: `linear-gradient(transparent, ${colors.pageSurface} 20%)` }}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 p-1.5 rounded-full" style={{ background: colors.card, border: `1px solid ${preferences.darkMode ? colors.border : '#F4F4F4'}` }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Message Chef"
              className="flex-1 bg-transparent border-none outline-none px-4"
              style={{ fontSize: '15px', color: colors.textPrimary, minHeight: 44 }}
            />
            <button
              onClick={() => handleSend(input)}
              className="px-4 rounded-full border-none cursor-pointer transition-smooth"
              style={{
                background: input.trim() ? colors.accentText : colors.border,
                color: input.trim() ? '#FFF' : colors.textSecondary,
                fontWeight: 600,
                minHeight: 44,
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function ChatRecipeCard({
  colors,
  suggestion,
  saved,
  onSave,
  onOpen,
}: {
  colors: any
  suggestion: RecipeSuggestion
  saved: boolean
  onSave: () => void
  onOpen: () => void
}) {
  return (
    <div
      style={{
        background: colors.card,
        borderRadius: 20,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        boxShadow: colors.pageSurface === '#121212' ? 'none' : '0 6px 16px rgba(27,18,18,0.05)',
      }}
    >
      <div style={{ height: 4, background: colors.accentPurple }} />
      <button onClick={onOpen} className="w-full border-none bg-transparent cursor-pointer p-0 text-left outline-none">
      <div style={{ display: 'flex', gap: 12, padding: 12 }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 14,
            overflow: 'hidden',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <img
            src={suggestion.thumbnail}
            alt={suggestion.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.18)' }}>
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Play size={14} style={{ color: '#4A1F23', marginLeft: 1 }} fill="#4A1F23" />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-1.5" style={{ marginBottom: 4 }}>
            <UtensilsCrossed size={12} style={{ color: colors.textSecondary }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recipe
            </span>
          </div>
          <h4
            style={{
              margin: '0 0 4px 0',
              fontSize: '15px',
              fontWeight: 700,
              color: colors.textPrimary,
              lineHeight: 1.25,
            }}
          >
            {suggestion.name}
          </h4>
          <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
            {suggestion.calories && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: colors.chipBg,
                  border: `1px solid ${colors.border}`,
                  color: colors.chipText,
                }}
              >
                {suggestion.calories} kcal
              </span>
            )}
            {suggestion.cookTime && (
              <span style={{ fontSize: '11px', color: colors.textSecondary, fontWeight: 500 }}>
                {suggestion.cookTime}
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: '12px',
              color: colors.textSecondary,
              fontStyle: 'italic',
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            {suggestion.ingredients.join(', ')}
          </p>
        </div>
      </div>
      </button>

      <div
        style={{
          background: colors.card,
          padding: '10px 14px 12px',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <a
          href={suggestion.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '12px',
            color: colors.accentText,
            textDecoration: 'none',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Watch on YouTube ↗
        </a>
        <button
          onClick={onSave}
          disabled={saved}
          className="flex items-center gap-1.5 cursor-pointer border-none"
          style={{
            background: 'transparent',
            color: colors.accentText,
            fontSize: '12px',
            fontWeight: 700,
            padding: '8px 6px',
            minHeight: 44,
            opacity: saved ? 0.7 : 1,
          }}
        >
          {saved ? <Check size={14} /> : <BookmarkPlus size={14} />}
          {saved ? 'Added' : 'Add to My Recipes'}
        </button>
      </div>
    </div>
  )
}
