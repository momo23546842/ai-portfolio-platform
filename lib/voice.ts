// Language-dependent pieces of the voice call: what the browser listens for, and the fixed
// lines the assistant speaks. Kept free of React and browser APIs so it can be tested in Node.

export type VoiceLang = 'en' | 'ja'

/** BCP-47 tag for the browser's SpeechRecognition and speechSynthesis. */
export function speechLocale(lang: VoiceLang) {
  return lang === 'ja' ? 'ja-JP' : 'en-US'
}

/** Start in Japanese for visitors whose browser prefers Japanese, otherwise English. */
export function defaultVoiceLang(browserLanguages: readonly string[] | undefined): VoiceLang {
  return browserLanguages?.some((l) => l.toLowerCase().startsWith('ja')) ? 'ja' : 'en'
}

export const voiceLines = {
  en: {
    greeting: "Hey! I'm Momoyo. What can I help you with?",
    askDate: 'Sure! What date works for you?',
    slots: (count: number, date: string, times: string) => `I have ${count} slots on ${date}: ${times}. Check the chat to pick one!`,
    noSlots: (date: string) => `Nothing available on ${date}. Try another date?`,
    slotsHeading: (date: string) => `Here are my times on ${date}:`,
    listening: 'Listening...',
    speaking: 'Speaking...',
    thinking: 'Thinking...',
    checking: 'Checking...',
    error: 'Error. Tap the mic.',
    you: 'You',
    hintMic: 'Tap the mic to speak',
    hintInterrupt: 'Tap the chat icon to interrupt',
  },
  ja: {
    greeting: 'こんにちは、片岡桃世です。何でも聞いてください。',
    askDate: 'ぜひお話ししましょう。ご希望の日にちを教えてください。',
    slots: (count: number, date: string, times: string) => `${date}は${count}件空いています。${times}などです。チャットの画面から選んでください。`,
    noSlots: (date: string) => `${date}は空きがありません。別の日はいかがですか？`,
    slotsHeading: (date: string) => `${date}の空いている時間です：`,
    listening: '聞いています…',
    speaking: '話しています…',
    thinking: '考えています…',
    checking: '確認しています…',
    error: 'エラーが起きました。マイクを押してください。',
    you: 'あなた',
    hintMic: 'マイクを押して話してください',
    hintInterrupt: 'チャットのアイコンで話を止められます',
  },
} as const

/** "2026-03-10" → "3月10日" for Japanese speech; English keeps the ISO date. */
export function spokenDate(date: string, lang: VoiceLang) {
  if (lang !== 'ja') return date
  const m = date.match(/^\d{4}-(\d{2})-(\d{2})$/)
  return m ? `${Number(m[1])}月${Number(m[2])}日` : date
}

/**
 * Shorten a reply for speech without cutting a sentence in half: keep whole sentences
 * while they fit, and only fall back to a hard cut when the first sentence alone is too long.
 */
export function spokenReply(text: string, maxChars = 150) {
  const clean = text.replace(/\[BOOKING_LINK\]/g, '').replace(/\s+/g, ' ').trim()
  if (clean.length <= maxChars) return clean
  const sentences = clean.match(/[^.!?。！？]+[.!?。！？]*/g) ?? [clean]
  let out = ''
  for (const s of sentences) {
    if ((out + s).length > maxChars) break
    out += s
  }
  return out.trim() || clean.slice(0, maxChars).trim() + '…'
}
