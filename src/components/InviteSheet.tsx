import { useState } from 'react'
import { Copy, MessageCircle, X, Check } from 'lucide-react'
import { useStore } from '../store/useStore'

interface InviteSheetProps {
  onClose: () => void
}

export default function InviteSheet({ onClose }: InviteSheetProps) {
  const preferences = useStore((s) => s.preferences)
  const [copied, setCopied] = useState(false)

  const groupName = preferences.groupName || 'Flat 503 Kitchen'
  const inviteCode = preferences.groupInviteCode || 'SMRUTI-HOME'
  const inviteLink = `https://smruti.app/join/${preferences.groupId || 'demo'}?code=${inviteCode}`
  const inviteText = encodeURIComponent(
    `Join my Smruti group "${groupName}" to share meals and recipes.\nInvite code: ${inviteCode}\n${inviteLink}`
  )

  const copyInvite = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const dark = preferences.darkMode
  const C = dark
    ? { bg: '#1A1A1A', card: '#252525', border: '#333', text: '#FEFEFE', sub: '#A9A0A3', accent: '#9A4D5A', code: '#F0C7CF', codeBg: 'rgba(154,77,90,0.15)' }
    : { bg: '#F7F4EF', card: '#FFFFFF', border: '#E6E0D8', text: '#1C1B1F', sub: '#6F6B73', accent: '#4A1F23', code: '#4A1F23', codeBg: 'rgba(74,31,35,0.06)' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(28,27,31,0.45)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md animate-slide-up"
        style={{
          background: C.bg,
          borderRadius: '24px 24px 0 0',
          padding: '8px 0 0',
          boxShadow: '0 -4px 24px rgba(28,27,31,0.12)',
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '0 auto 16px' }} />

        <div style={{ padding: '0 22px 32px' }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 400, fontFamily: "'DM Serif Display', Georgia, serif", color: C.text, margin: 0, lineHeight: 1.2 }}>
                Invite to {groupName}
              </h2>
              <p style={{ fontSize: '13px', color: C.sub, margin: '4px 0 0 0', lineHeight: 1.4 }}>
                Share the code or send a link directly
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center border-none cursor-pointer transition-smooth"
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: C.card, color: C.sub,
                border: `1px solid ${C.border}`,
                flexShrink: 0, marginTop: 2,
              }}
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          {/* Invite code block */}
          <div style={{
            background: C.codeBg,
            border: `1px solid ${dark ? '#3A3A3A' : 'rgba(74,31,35,0.15)'}`,
            borderRadius: 14, padding: '14px 16px', marginBottom: 16,
          }}>
            <p style={{
              fontSize: '10px', fontWeight: 600, color: C.sub,
              textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px 0',
            }}>
              Invite code
            </p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: C.code, margin: 0, letterSpacing: '0.06em' }}>
              {inviteCode}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            {/* Primary — WhatsApp */}
            <a
              href={`https://wa.me/?text=${inviteText}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 transition-smooth"
              style={{
                height: 46, borderRadius: 18,
                background: '#25D366', color: '#FFFFFF',
                fontSize: '15px', fontWeight: 600,
                textDecoration: 'none', display: 'flex',
              }}
            >
              <MessageCircle size={17} />
              Share via WhatsApp
            </a>

            {/* Secondary — Copy link */}
            <button
              onClick={copyInvite}
              className="w-full flex items-center justify-center gap-2 border-none cursor-pointer transition-smooth"
              style={{
                height: 46, borderRadius: 18,
                background: C.card, color: C.text,
                border: `1px solid ${C.border}`,
                fontSize: '15px', fontWeight: 500,
              }}
            >
              {copied ? <Check size={16} style={{ color: '#5FB07A' }} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy invite link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
