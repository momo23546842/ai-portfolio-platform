// Retrieval for the digital twin (RAG).
//
// Instead of pasting every fact about me into the system prompt, the knowledge is split into
// small passages ("chunks"), each question is matched against them with BM25, and only the
// best few are given to the LLM. This keeps answers grounded in my own data, keeps the prompt
// short (faster and cheaper on Groq), and lets the reply show which passages it used.
//
// Why BM25 rather than vector embeddings: the corpus is small (tens of passages), Groq has no
// embedding endpoint, and BM25 needs no extra service or database migration. Japanese has no
// spaces between words, so Japanese text is indexed as overlapping character pairs (bigrams),
// which matches well without a morphological analyser. English is indexed by word.
//
// This file has no imports so it can be unit-tested with plain Node (see tests/rag.test.ts).

export type Chunk = {
  id: string
  /** Short label shown to the user as the source of an answer, e.g. "経歴: AusBiz Consulting" */
  title: string
  text: string
  /** Optional extra words that should match this chunk (synonyms in the other language, etc.) */
  keywords?: string[]
}

export type ScoredChunk = Chunk & { score: number }

const CJK = /[぀-ヿ㐀-鿿豈-﫿ｦ-ﾟ]/

/** Lower-case words for Latin text, character bigrams for Japanese runs. */
export function tokenize(input: string): string[] {
  const text = input.normalize('NFKC').toLowerCase()
  const tokens: string[] = []
  // Split into runs of Japanese characters and runs of everything else.
  const runs = text.match(/[぀-ヿ㐀-鿿豈-﫿ｦ-ﾟ]+|[^぀-ヿ㐀-鿿豈-﫿ｦ-ﾟ]+/g) || []
  for (const run of runs) {
    if (CJK.test(run[0])) {
      // Hiragana is mostly particles and endings (について, ですか), which would match almost
      // every passage, so it is treated as a separator. What remains are runs of kanji and
      // katakana (技術, インターン), indexed as single characters or overlapping pairs.
      for (const word of run.split(/[\u3040-\u309f]+/)) {
        if (!word || JA_STOP_CHARS.has(word)) continue
        if (word.length === 1) tokens.push(word)
        for (let i = 0; i < word.length - 1; i++) tokens.push(word.slice(i, i + 2))
      }
    } else {
      for (const w of run.split(/[^a-z0-9.+#]+/)) {
        const word = w.replace(/^\.+|\.+$/g, '')
        if (word.length >= 2 && !STOPWORDS.has(word)) tokens.push(word)
      }
    }
  }
  return tokens
}

/** Single characters from question phrasing (何ですか, 教えて) that say nothing about the topic. */
const JA_STOP_CHARS = new Set(['何', '教', '事', '方', '時', '言', '思', '下', '僕', '私'])

const STOPWORDS = new Set([
  'the', 'and', 'for', 'are', 'you', 'your', 'what', 'how', 'did', 'does', 'was', 'with', 'about',
  'tell', 'me', 'my', 'can', 'do', 'is', 'in', 'of', 'to', 'a', 'an', 'on', 'at', 'it', 'i', 'have',
  'has', 'which', 'who', 'any', 'could', 'would', 'please',
])

export type Index = {
  chunks: Chunk[]
  docTokens: string[][]
  df: Map<string, number>
  avgLen: number
}

export function buildIndex(chunks: Chunk[]): Index {
  const docTokens = chunks.map((c) => tokenize(`${c.title} ${c.text} ${(c.keywords || []).join(' ')}`))
  const df = new Map<string, number>()
  for (const toks of docTokens) for (const t of new Set(toks)) df.set(t, (df.get(t) || 0) + 1)
  const avgLen = docTokens.reduce((s, t) => s + t.length, 0) / Math.max(1, docTokens.length)
  return { chunks, docTokens, df, avgLen }
}

/** Okapi BM25 with the usual k1 = 1.2, b = 0.75. */
export function search(index: Index, query: string, k = 5, minScore = 0.5): ScoredChunk[] {
  const q = tokenize(query)
  if (!q.length) return []
  const N = index.chunks.length
  const k1 = 1.2, b = 0.75
  const scored: ScoredChunk[] = index.chunks.map((chunk, i) => {
    const toks = index.docTokens[i]
    const tf = new Map<string, number>()
    for (const t of toks) tf.set(t, (tf.get(t) || 0) + 1)
    let score = 0
    for (const term of new Set(q)) {
      const f = tf.get(term)
      if (!f) continue
      const n = index.df.get(term) || 0
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5))
      score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * toks.length) / index.avgLen)))
    }
    return { ...chunk, score }
  })
  return scored.filter((c) => c.score >= minScore).sort((a, b2) => b2.score - a.score).slice(0, k)
}

/** Passages formatted for the system prompt, numbered so the model can stay close to them. */
export function formatContext(chunks: Chunk[]): string {
  if (!chunks.length) return '(No matching information found.)'
  return chunks.map((c, i) => `[${i + 1}] ${c.title}\n${c.text}`).join('\n\n')
}

// ─── Conversation memory ────────────────────────────────────────────────────

export type ChatTurn = { role: 'user' | 'assistant'; content: string }

export const MAX_MESSAGE_CHARS = 1000
const MAX_TURNS = 8
const MAX_HISTORY_CHARS = 4000

/**
 * The browser sends the recent conversation with each request; the server keeps nothing
 * between requests. Anything sent by a browser is untrusted, so only well-formed turns are
 * kept, each is cut to a safe length, and only the most recent ones are used.
 */
export function sanitizeHistory(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return []
  const turns: ChatTurn[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const { role, content } = item as { role?: unknown; content?: unknown }
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') continue
    const text = content.trim().slice(0, MAX_MESSAGE_CHARS)
    if (text) turns.push({ role, content: text })
  }
  const recent = turns.slice(-MAX_TURNS)
  // Drop the oldest turns until the whole history fits the budget.
  while (recent.length && recent.reduce((s, t) => s + t.content.length, 0) > MAX_HISTORY_CHARS) recent.shift()
  // The model expects the conversation to start with the user.
  while (recent.length && recent[0].role !== 'user') recent.shift()
  return recent
}

/**
 * Follow-up questions ("その時に使った技術は？") don't name the topic, so the search query
 * also includes the previous user question.
 */
export function retrievalQuery(message: string, history: ChatTurn[]): string {
  const lastUser = [...history].reverse().find((t) => t.role === 'user')
  return lastUser ? `${message} ${lastUser.content}` : message
}

/** Reply in Japanese when the visitor writes in Japanese. */
export function detectLanguage(text: string): 'ja' | 'en' {
  return CJK.test(text) ? 'ja' : 'en'
}

export type SmallTalk = 'greeting' | 'capabilities' | null

const GREETING = /^(hi|hello|hey|hiya|good (morning|afternoon|evening)|g'?day|こんにちは|こんばんは|おはよう|はじめまして|初めまして|よろしく)[\s!！。.、,~〜ー]*$/i
const CAPABILITIES = /(what can you (do|help|answer)|what do you (do|know)|how can you help|what (should|can) i ask|help me|^help$|何ができ|何を聞け|何が聞け|何を質問|どんなこと|使い方)/i

/**
 * Greetings and "what can you do?" match no profile passage, so retrieval finds nothing.
 * They are recognised separately so the assistant introduces itself instead of declining.
 */
export function detectSmallTalk(message: string): SmallTalk {
  const m = message.trim()
  if (GREETING.test(m)) return 'greeting'
  if (CAPABILITIES.test(m)) return 'capabilities'
  return null
}

/** A fixed self-introduction, used when the LLM can't be reached. */
export function smallTalkReply(kind: Exclude<SmallTalk, null>, lang: 'ja' | 'en') {
  if (lang === 'ja') {
    return `${kind === 'greeting' ? 'こんにちは！' : ''}片岡桃世のAIデジタルツインです。経歴、インターンでの仕事、作品、スキルや資格について、日本語か英語で聞いてください。たとえば「インターンでは何をしましたか？」「どんな技術を使えますか？」のように聞けます。ミーティングの予約もできます。`
  }
  return `${kind === 'greeting' ? 'Hi! ' : ''}I'm Momoyo Kataoka's AI digital twin. Ask me about my background, internships, projects, skills or certifications, in English or Japanese — for example "What did you do in your internship?" or "Which technologies do you use?". I can also book a meeting for you.`
}
