// Single source of truth for what the site shows and what the digital twin may say about me.
// Both the Career section and the chat's retrieval (lib/rag.ts) read from here, so the page and
// the AI can't drift apart. Facts follow my 職務経歴書 / 履歴書. Each entry is written in
// Japanese and English so a question in either language finds it.
//
// No imports: kept dependency-free so it can be tested with plain Node.

export type Bilingual = { ja: string; en: string }

export type TimelineItem = {
  id: string
  kind: 'work' | 'education'
  title: Bilingual
  org: Bilingual
  /** YYYY-MM */
  start: string
  /** YYYY-MM, or null while ongoing */
  end: string | null
  summary: Bilingual
  details: Bilingual[]
  tech?: string[]
  /** Extra search words for the chat's retrieval */
  keywords?: string[]
}

export type Work = {
  id: string
  name: Bilingual
  url?: string
  repo?: string
  summary: Bilingual
  points: Bilingual[]
  tech: string[]
}

export const profile = {
  name: { ja: '片岡 桃世', en: 'Momoyo Kataoka' },
  headline: {
    ja: '管理栄養士 × 生成AI開発。LLM・RAGを使って、現場の課題を解決するエンジニアを目指しています。',
    en: 'Registered Dietitian × generative AI development. Aiming to be an engineer who solves real-world problems with LLMs and RAG.',
  },
  location: { ja: 'オーストラリア・シドニー在住', en: 'Based in Sydney, Australia' },
  summary: {
    ja: '大学卒業後、管理栄養士として健康相談や特定保健指導に従事し、対象者の生活習慣をヒアリングして行動変容を支援してきました。働く中でICTや生成AIの必要性と可能性を感じ、オーストラリアでITを学んでいます。生成AIを使ったフルスタック開発（AIエージェント）のインターンと、学習管理システム（LMS）の運用・保守のインターンを経験しました。',
    en: 'After university I worked as a Registered Dietitian in health consultations and Specific Health Guidance (Tokutei Hoken Shidou), helping people change their lifestyle habits. Seeing the need for ICT and generative AI in that work, I moved to Australia to study IT. I have completed a full-stack generative AI (AI agent) development internship and an LMS operations and maintenance internship.',
  },
  goal: {
    ja: '生成AIエンジニアとして、LLMやRAGを使ったアプリケーション開発に携わりたいと考えています。お客様や現場の人の話を聞いて課題をつかみ、AIで解決する形にするところまで担えるエンジニアが目標です。将来的には、管理栄養士の経験を活かしてヘルスケア領域にも貢献したいです。',
    en: 'I want to work as a generative AI engineer building applications with LLMs and RAG — an engineer who listens to clients and front-line users, understands the problem, and turns it into an AI solution. In the long run I would like to contribute to healthcare using my dietitian background.',
  },
}

export const timeline: TimelineItem[] = [
  {
    id: 'eca-lms',
    kind: 'work',
    title: { ja: '学習管理システム（LMS）運用担当 インターン', en: 'LMS Administration Intern' },
    org: { ja: 'ECA College（オーストラリア）', en: 'ECA College, Australia' },
    start: '2026-02',
    end: '2026-05',
    summary: {
      ja: '職業教育・高等教育を提供するカレッジで、学習管理システム（LMS）の運用・保守を担当しました。英語環境での業務です。',
      en: 'Operated and maintained the learning management system (LMS) at a vocational and higher-education college, working in English.',
    },
    details: [
      { ja: 'ユーザー管理（アカウント登録・権限管理）', en: 'User management (account registration and permissions)' },
      { ja: 'コンテンツの管理・公開', en: 'Content management and publishing' },
      { ja: '利用者目線でのページ構成の見直し・改善', en: 'Reworked page structure from the learner’s point of view' },
    ],
    tech: ['LMS', 'Canva'],
    keywords: ['internship', 'intern', 'インターン', 'インターンシップ', 'learning management system'],
  },
  {
    id: 'ausbiz',
    kind: 'work',
    title: { ja: 'フルスタック・AIエージェント開発 インターン（チームリーダー）', en: 'Full-Stack & Agentic AI Development Intern (Team Lead)' },
    org: { ja: 'AusBiz Consulting（オーストラリア）', en: 'AusBiz Consulting, Australia' },
    start: '2025-11',
    end: '2026-03',
    summary: {
      ja: '企業・政府機関向けに生成AIやAIエージェントを開発する会社で、チームでAIデジタルツイン（自分の代わりに質問に答えるAI）を開発しました。チームリーダーとして、タスクの割り振り・進捗管理・ミーティングの運営と、プロジェクトマネージャーとの調整を担当しました。',
      en: 'At a company that builds generative AI and AI agents for businesses and government, I worked in a team building an AI digital twin (an AI that answers questions on a person’s behalf). As team lead I assigned tasks, tracked progress, ran team meetings and coordinated with the project manager.',
    },
    details: [
      { ja: 'Next.jsでのWebアプリ開発、Vercelへのデプロイ・運用', en: 'Built the web app with Next.js; deployed and ran it on Vercel' },
      { ja: 'Neon（PostgreSQL）でクラウドデータベースを構築・管理', en: 'Set up and managed a cloud database on Neon (PostgreSQL)' },
      { ja: 'Groq APIを使ったAIチャット機能の開発', en: 'Developed the AI chat feature with the Groq API' },
      { ja: 'MCPサーバーを使ったAIエージェント機能の開発', en: 'Developed AI agent features with an MCP server' },
      { ja: 'v0でのUIデザイン・プロトタイピング、GitHub CopilotやClaudeを使った開発', en: 'UI design and prototyping with v0; development with GitHub Copilot and Claude' },
      { ja: 'ClickUpでのタスク・進捗管理', en: 'Task and progress management in ClickUp' },
    ],
    tech: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'Vercel', 'Neon (PostgreSQL)', 'Prisma', 'Groq API', 'MCP', 'v0', 'GitHub', 'ClickUp'],
    keywords: ['internship', 'intern', 'インターン', 'インターンシップ', 'build', 'built', 'developed', '開発', 'AIエージェント', 'agent', 'digital twin', 'デジタルツイン', 'team', 'leader', 'リーダー'],
  },
  {
    id: 'medcare',
    kind: 'work',
    title: { ja: '管理栄養士（業務委託・オンライン）', en: 'Registered Dietitian (contract, online)' },
    org: { ja: 'メドケア株式会社', en: 'MedCare Inc., Japan' },
    start: '2025-07',
    end: null,
    summary: {
      ja: 'オンライン診療サービスなどを運営する会社と業務委託契約を結び、オンラインで特定保健指導を行っています。',
      en: 'Under contract with a Japanese online-healthcare company, I provide Specific Health Guidance online.',
    },
    details: [
      { ja: '特定保健指導（初回面接）の実施', en: 'Initial Specific Health Guidance interviews' },
      { ja: '健診結果や生活習慣のヒアリング・アセスメント、行動目標の設定', en: 'Reviewing check-up results and habits, assessment, and setting behaviour goals' },
      { ja: '指導記録の作成・システム入力・メッセージ送信', en: 'Writing guidance records, entering them in the system and messaging clients' },
      { ja: '英語対応が必要な方への保健指導（英語での面談）', en: 'Guidance in English for clients who need it' },
    ],
  },
  {
    id: 'recruit',
    kind: 'work',
    title: { ja: '営業事務（派遣社員）', en: 'Sales Administration (temporary staff)' },
    org: { ja: '株式会社リクルート（派遣先）', en: 'Recruit Co., Ltd. (assignment)' },
    start: '2023-10',
    end: '2024-02',
    summary: {
      ja: '派遣社員として営業事務を担当しました。',
      en: 'Worked in sales administration as temporary staff.',
    },
    details: [
      { ja: '顧客・取引先・社内からの問い合わせへのメール・電話対応', en: 'Email and phone enquiries from clients, partners and colleagues' },
      { ja: '顧客情報のシステム入力（正確性の確保）', en: 'Accurate entry of customer data into the system' },
      { ja: '業務マニュアルの作成', en: 'Writing operation manuals' },
    ],
  },
  {
    id: 'chiba',
    kind: 'work',
    title: { ja: '管理栄養士', en: 'Registered Dietitian' },
    org: { ja: '株式会社千葉薬品', en: 'Chiba Yakuhin Co., Ltd., Japan' },
    start: '2022-04',
    end: '2023-06',
    summary: {
      ja: 'ドラッグストアを中心とする会社で、健康チェック・栄養相談・特定保健指導を担当しました。',
      en: 'At a drugstore-centred company I ran health checks, nutrition consultations and Specific Health Guidance.',
    },
    details: [
      { ja: '健康チェック（栄養相談・指導、商品の提案）。基幹店から月13〜15店舗を車で巡回', en: 'Health checks with nutrition advice and product suggestions, visiting 13–15 stores a month by car' },
      { ja: '特定保健指導（面接、電話での勧奨、アンケートや個人情報の入力、資料作成）', en: 'Specific Health Guidance: interviews, phone outreach, data entry and materials' },
      { ja: '4名のチームで週2回、集客のためのInstagram投稿を作成', en: 'Created Instagram posts twice a week in a team of four' },
      { ja: '行政主催の栄養教室（月1回）', en: 'Monthly nutrition classes run with the local government' },
    ],
  },
  {
    id: 'diploma',
    kind: 'education',
    title: { ja: 'Diploma of Information Technology', en: 'Diploma of Information Technology' },
    org: { ja: 'Education Centre Australia College', en: 'Education Centre Australia College' },
    start: '2025-01',
    end: null,
    summary: { ja: 'オーストラリアで、英語でITを学んでいます。', en: 'Studying IT in English in Australia.' },
    details: [],
  },
  {
    id: 'university',
    kind: 'education',
    title: { ja: '管理栄養学部 管理栄養学科', en: 'Bachelor of Nutrition (Registered Dietitian course)' },
    org: { ja: '名古屋学芸大学', en: 'Nagoya University of Arts and Sciences' },
    start: '2018-04',
    end: '2022-03',
    summary: { ja: '管理栄養士の国家資格を取得しました（2022年3月）。', en: 'Qualified as a Registered Dietitian in Japan (March 2022).' },
    details: [],
  },
]

export const works: Work[] = [
  {
    id: 'digital-twin',
    name: { ja: 'AIデジタルツイン（このサイト）', en: 'AI Digital Twin (this site)' },
    url: 'https://momoyo-ai.vercel.app',
    repo: 'https://github.com/momo23546842/ai-portfolio-platform',
    summary: {
      ja: '私の代わりに、経歴やスキルについての質問にチャットと音声で答え、ミーティングの予約まで行うAIです。インターンでチーム開発したデジタルツインをもとに、個人で予約機能・問い合わせ機能・RAGを追加しました。',
      en: 'An AI that answers questions about my background by chat and voice and books meetings for me. I extended the digital twin my internship team built, adding booking, a contact form and RAG on my own.',
    },
    points: [
      { ja: 'RAG：経歴や作品を小さな文書に分けてBM25で検索し、関連する部分だけをLLMに渡す。回答には参照した情報を表示', en: 'RAG: my profile is split into passages, searched with BM25, and only the relevant ones go to the LLM; replies show their sources' },
      { ja: '直近の会話を覚えて、「その時に使った技術は？」のような続けての質問に答えられる', en: 'Remembers the recent conversation, so follow-up questions work' },
      { ja: 'Googleカレンダーと連携した予約、Google Meetリンクの自動作成、メール通知', en: 'Booking with Google Calendar, automatic Google Meet links and email notifications' },
      { ja: 'Groqで低遅延の応答、ElevenLabsで音声会話', en: 'Low-latency replies with Groq; voice conversation with ElevenLabs' },
    ],
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Prisma', 'Neon (PostgreSQL)', 'Groq API', 'ElevenLabs', 'Google Calendar API', 'Resend', 'MCP', 'Vercel'],
  },
  {
    id: 'gym-log',
    name: { ja: 'ジム記録（gym-log）', en: 'Gym Log' },
    url: 'https://gym-log-taupe-phi.vercel.app',
    repo: 'https://github.com/momo23546842/gym-log',
    summary: {
      ja: 'ジムに行った日をカレンダーで見える化し、種目ごとに前回からの伸びを比べられる記録アプリです。カレンダーアプリに「ジム」と書いていた自分の習慣から生まれ、既存アプリの「種目が固定されている」不満を解決しました。',
      en: 'A workout log that shows gym days on a calendar and compares each exercise with the last session. It grew out of my habit of writing "gym" in a calendar app, and fixes my frustration with apps that only offer fixed exercise lists.',
    },
    points: [
      { ja: '月・週の回数と週平均、部位の記録、セットごとの重さ・回数', en: 'Monthly and weekly counts, body parts, and weight and reps per set' },
      { ja: '種目は自分で登録して使い回せる。前回比・推移グラフ・2日の比較', en: 'User-defined exercises; comparison with the last session, a progress chart and a two-day comparison' },
      { ja: '自分で使いながら8段階で改善。計算部分に22件のテストとGitHub Actions', en: 'Improved in 8 steps while using it myself; 22 unit tests on the logic with GitHub Actions' },
      { ja: 'Claudeと一緒に開発。要件と改善点は自分で決め、コードはClaudeに任せた', en: 'Built with Claude: I decided the requirements and improvements, Claude wrote the code' },
    ],
    tech: ['JavaScript (ES Modules)', 'HTML', 'CSS', 'localStorage', 'node:test', 'GitHub Actions', 'Vercel'],
  },
]

export const skills = {
  ai: ['LLMアプリ開発 / LLM apps (Groq API)', 'RAG (BM25)', 'MCP', 'プロンプト設計 / Prompt design', 'Claude', 'GitHub Copilot', 'v0'],
  frontend: ['Next.js', 'React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML / CSS'],
  backend: ['Next.js API Routes', 'Prisma', 'Neon (PostgreSQL)', 'Resend', 'Google Calendar API'],
  tools: ['Vercel', 'GitHub', 'GitHub Actions', 'ClickUp', 'LMS administration', 'Canva'],
}

export const certifications: Bilingual[] = [
  { ja: '管理栄養士（2022年3月）', en: 'Registered Dietitian, Japan (March 2022)' },
  { ja: '医薬品登録販売者（2021年10月）', en: 'Registered Seller of OTC drugs, Japan (October 2021)' },
  { ja: 'TOEIC Listening & Reading 825点（2026年8月）', en: 'TOEIC Listening & Reading 825 (August 2026)' },
]

/** Questions people often ask, answered in my own words (from my 職務経歴書). */
export const faqs: { q: Bilingual; a: Bilingual }[] = [
  {
    q: { ja: 'なぜ管理栄養士からITに進んだのですか？', en: 'Why did you move from dietetics to IT?' },
    a: {
      ja: '健康支援の現場で、DXが進む一方で、専門職とシステムを導入・運用する側の間に知識や視点のギャップがあり、現場で活用が進まない課題を感じました。その間をつなぐためにITを学ぶと決め、オーストラリアに渡りました。',
      en: 'In health support I saw that while digital transformation moves forward, there is a gap between professionals and the people who build and run the systems, so tools are not used well on the ground. I decided to learn IT to bridge that gap and moved to Australia.',
    },
  },
  {
    q: { ja: 'あなたの強みは何ですか？', en: 'What are your strengths?' },
    a: {
      ja: '一人ひとりの生活背景や課題を丁寧に聞き取り、その人が実行できる改善策を考えて提案する力です。管理栄養士として身につけたこの力は、相手が企業やお客様に変わっても、課題の本質をつかんで解決策を一緒に考えるところで活かせると考えています。もう一つは、ヘルスケアとITの両方の視点を持っていることです。',
      en: 'Listening carefully to each person’s background and problems, then proposing improvements they can actually carry out. I built this as a dietitian, and it carries over to working with companies and clients: getting to the core of the problem and shaping a solution together. I also bring both a healthcare and an IT perspective.',
    },
  },
  {
    q: { ja: 'なぜ生成AIエンジニアを目指すのですか？', en: 'Why generative AI engineering?' },
    a: {
      ja: 'インターンでAIエージェントを開発し、生成AIを使えば、人の代わりに質問に答えたり予約を受けたりといった仕事を形にできると実感しました。自分の困りごとから作ったジム記録も、Claudeと一緒に短期間で形にできました。生成AIは現場の課題を解決する力が大きいので、その開発に携わりたいと考えています。',
      en: 'Building an AI agent in my internship showed me that generative AI can turn real tasks — answering questions or taking bookings on someone’s behalf — into working products. I also built my gym log quickly with Claude to solve my own problem. Generative AI has great power to solve real problems, and I want to build with it.',
    },
  },
  {
    q: { ja: 'チームではどんな役割でしたか？', en: 'What was your role in the team?' },
    a: {
      ja: 'AusBiz Consultingのインターンでチームリーダーを務め、メンバーへのタスクの割り振り、進捗管理、チームミーティングの運営、プロジェクトマネージャーとの進捗・課題の共有と調整を担当しました。',
      en: 'I was team lead in the AusBiz Consulting internship: assigning tasks, tracking progress, running team meetings, and sharing progress and issues with the project manager.',
    },
  },
  {
    q: { ja: '英語はできますか？', en: 'How is your English?' },
    a: {
      ja: 'TOEIC Listening & Reading 825点です。オーストラリアで英語でITを学び、インターンも英語環境で行いました。英語での保健指導も担当しています。',
      en: 'I scored 825 on TOEIC Listening & Reading, studied IT in English in Australia, did both internships in English, and also give health guidance in English.',
    },
  },
]

// ─── Turning the data into retrieval passages ───────────────────────────────

const ym = (s: string | null, lang: 'ja' | 'en') => {
  if (!s) return lang === 'ja' ? '現在' : 'present'
  const [y, m] = s.split('-')
  return lang === 'ja' ? `${y}年${Number(m)}月` : `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(m) - 1]} ${y}`
}

export function periodText(item: Pick<TimelineItem, 'start' | 'end'>, lang: 'ja' | 'en') {
  return `${ym(item.start, lang)} – ${ym(item.end, lang)}`
}

/** Every fact above as a passage for retrieval. Each passage carries both languages. */
export function profileChunks() {
  const chunks: { id: string; title: string; text: string; keywords?: string[] }[] = []
  chunks.push({
    id: 'profile',
    title: 'プロフィール / Profile',
    text: [profile.name.ja, profile.name.en, profile.location.ja, profile.location.en, profile.summary.ja, profile.summary.en].join('\n'),
    keywords: ['自己紹介', 'introduce', 'yourself', 'about', 'who', '経歴', 'background'],
  })
  chunks.push({
    id: 'goal',
    title: '目指していること / Career goal',
    text: [profile.headline.ja, profile.goal.ja, profile.headline.en, profile.goal.en].join('\n'),
    keywords: ['将来', 'goal', 'future', 'vision', 'want', 'キャリア', '志望'],
  })
  for (const t of timeline) {
    const lines = [
      `${t.title.ja}｜${t.org.ja}（${periodText(t, 'ja')}）`,
      t.summary.ja,
      ...t.details.map((d) => `・${d.ja}`),
      `${t.title.en} | ${t.org.en} (${periodText(t, 'en')})`,
      t.summary.en,
      ...t.details.map((d) => `- ${d.en}`),
    ]
    if (t.tech?.length) lines.push(`使った技術 / Tech: ${t.tech.join(', ')}`)
    chunks.push({
      id: `timeline-${t.id}`,
      title: `${t.kind === 'work' ? '経歴' : '学歴'}: ${t.org.ja}`,
      text: lines.join('\n'),
      keywords: [
        ...(t.kind === 'work' ? ['職歴', 'work', 'experience', 'job', '仕事'] : ['学歴', 'education', 'study', '学校']),
        ...(t.keywords || []),
      ],
    })
  }
  for (const w of works) {
    chunks.push({
      id: `work-${w.id}`,
      title: `作品: ${w.name.ja}`,
      text: [
        w.name.ja, w.summary.ja, ...w.points.map((p) => `・${p.ja}`),
        w.name.en, w.summary.en, ...w.points.map((p) => `- ${p.en}`),
        `技術 / Tech: ${w.tech.join(', ')}`,
        w.url ? `URL: ${w.url}` : '', w.repo ? `GitHub: ${w.repo}` : '',
      ].filter(Boolean).join('\n'),
      keywords: ['作品', 'portfolio', 'project', 'projects', 'built', 'made', '作った', 'アプリ', 'app'],
    })
  }
  chunks.push({
    id: 'skills',
    title: 'スキル / Skills',
    text: [
      '使える技術・スキルの一覧 / Technologies and skills I use',
      `生成AI・LLM / AI: ${skills.ai.join(', ')}`,
      `フロントエンド / Frontend: ${skills.frontend.join(', ')}`,
      `バックエンド / Backend: ${skills.backend.join(', ')}`,
      `ツール / Tools: ${skills.tools.join(', ')}`,
    ].join('\n'),
    keywords: ['スキル', 'skill', 'skills', '技術', 'tech', 'stack', '言語', 'language', 'できること'],
  })
  chunks.push({
    id: 'certifications',
    title: '資格 / Certifications',
    text: certifications.map((c) => `${c.ja} / ${c.en}`).join('\n'),
    keywords: ['資格', 'license', 'certification', 'qualified', '免許', 'TOEIC', '英語'],
  })
  faqs.forEach((f, i) => {
    chunks.push({ id: `faq-${i}`, title: `Q&A: ${f.q.ja}`, text: [f.q.ja, f.a.ja, f.q.en, f.a.en].join('\n') })
  })
  return chunks
}
