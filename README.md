# momoyo-ai

> 🇯🇵 [日本語版はこちら](#japanese)

---


## ■ Introduction
This project is not a traditional portfolio website, but an interactive platform that allows users to experience what it is like to communicate with me directly.

The AI can answer questions about me and handle meeting scheduling on my behalf, enabling users to interact with a digital version of myself in real time.

Instead of passively presenting information, this system delivers information through conversation based on user intent.  
This approach allows me to represent myself in a more natural and realistic way.

---

## ■ Background
This project is based on a digital twin system originally developed during a full-stack AI agent internship as part of a team project.

After the internship, I extended and redesigned the system as an individual project to create a more personalized and practical experience.

While the original team project focused on chat and voice interaction, I enhanced the system by adding features such as meeting scheduling and a contact interface, improving both usability and completeness.

---

## ■ Overview
This application is a full-stack AI-powered digital twin system.

It integrates the following functionalities:

- Conversational AI (voice + chat)
- Real-time Google Calendar integration
- Automated meeting scheduling
- Google Meet link generation
- Email notification automation
- Persistent storage for conversations and bookings

The system is designed to combine natural interaction with structured scheduling workflows in a production-oriented architecture.

---

## ■ Core Features

### ● Conversational Interface
- Voice and chat-based interaction
- AI-driven question answering
- Context-aware responses based on user intent

### ● Scheduling System
- Real-time availability checks via Google Calendar
- Automated meeting booking
- Google Meet link generation

### ● Automation
- Email notifications (Resend)
- Data persistence (PostgreSQL)
- End-to-end workflow orchestration

---

## ■ System Architecture

### Frontend
- Next.js (App Router)
- Tailwind CSS

### Backend
- Next.js API Routes
- Prisma ORM
- Neon (PostgreSQL)

### AI / Voice
- Groq API (low-latency LLM inference for real-time conversation)
- ElevenLabs (personalized voice synthesis)

### External Services
- Google Calendar (Service Account)
- Google Meet
- Resend (email automation)

### Deployment
- Vercel

---

## ■ Key Highlights
- A conversational portfolio that enables interactive self-representation
- Extension and redesign from a team-based project to an individual product
- Integration of real-world scheduling and communication workflows
- Unified experience combining chat, voice, and booking systems
- Low-latency AI responses powered by Groq
- Cost-aware and constraint-driven system design

---

## ■ Future Improvements

### ● PSTN Integration (Vapi)
Plan to integrate Vapi to enable users to interact with the AI via phone calls.

This will allow:
- Voice interaction without relying on a web browser
- Real-time AI-powered phone conversations
- Voice-based meeting scheduling
- A more intuitive and accessible user experience

The long-term goal is to extend the digital twin beyond the web into real-world communication as a “callable AI presence.”

---

### ● Multilingual Support (English / Japanese)
Support both English and Japanese, enabling users to interact naturally in their preferred language.

Rather than simple translation, the system will adapt tone and expression based on the language to provide a more natural communication experience.  
This will allow the platform to serve a more global audience.

---

### ● Retrieval-Augmented Generation (RAG)
Introduce RAG to generate responses based on structured data such as my profile, experience, and project information.

This will improve response accuracy and consistency by grounding answers in my own data, enabling a more reliable and personalized digital twin experience.

---

## ■ Final Note
This project was created not just as a portfolio, but as an exploration of how my presence can be extended beyond time and availability.

The goal is to build a system that can represent me, communicate on my behalf, and create opportunities through interaction — even when I am not available.

Moving forward, I aim to further evolve this system into a platform that explores new possibilities in the relationship between humans and AI.


---

<a name="japanese"></a>

# momoyo-ai（日本語）

## ■ Introduction
このプロジェクトは、単なる自己紹介ページではなく、まるで私と直接対話しているかのような体験を提供するポートフォリオです。

AIが私の代わりに質問に答えたり、ミーティングの予約を行うことができ、ユーザーはリアルタイムで「私自身」とやり取りしているような感覚を得ることができます。

従来のように情報を一方的に提示するのではなく、ユーザーが求める情報に応じて、まるで会話をしているかのように伝えることで、自分自身をよりリアルに表現できる仕組みを設計しました。

---

## ■ Background（開発背景）
本プロジェクトは、AIエージェントのフルスタック開発インターンシップにおいて、チームで開発したデジタルツインをベースにしています。

その後、このシステムを個人プロジェクトとして拡張し、よりパーソナライズされた体験を実現しました。

チーム開発ではチャットと音声機能が中心でしたが、本プロジェクトでは新たにミーティング予約機能やコンタクトページを追加し、実用性と完成度を高めています。

---

## ■ Overview（概要）
本アプリケーションは、AIを活用したフルスタックのデジタルツインシステムです。

以下の機能を統合しています：

- 会話型AI（音声＋チャット）
- Googleカレンダーとのリアルタイム連携
- ミーティング予約機能
- Google Meetリンクの自動生成
- メール通知の自動送信
- 会話および予約データの永続化

ユーザーとの自然な対話と、実用的なスケジューリング機能を統合することで、実運用を想定したシステム設計を行っています。

---

## ■ Core Features（主要機能）

### ● 会話型インターフェース
- チャットおよび音声による対話
- AIによる質問応答
- ユーザーの意図に応じた情報提供

### ● スケジューリング機能
- Googleカレンダーとの連携による空き状況確認
- ミーティング予約の自動処理
- Google Meetリンクの自動生成

### ● 自動化機能
- メール通知（Resend）
- データの永続化（PostgreSQL）
- ワークフローの自動化

---

## ■ System Architecture（システム構成）

### Frontend
- Next.js（App Router）
- Tailwind CSS

### Backend
- Next.js API Routes
- Prisma ORM
- Neon（PostgreSQL）

### AI / Voice
- Groq API（低レイテンシなLLM推論によるリアルタイム会話処理）
- ElevenLabs（パーソナライズ音声）

### External Services
- Google Calendar（Service Account）
- Google Meet
- Resend（メール送信）

### Deployment
- Vercel

---

## ■ Key Highlights（特徴・工夫）
- AIによる対話型ポートフォリオという新しい自己表現
- チーム開発から個人プロジェクトへの拡張・再設計
- 実利用を想定した予約・通知機能の統合
- 音声・チャット・スケジューリングの一体化
- 低レイテンシなAI応答（Groqを活用した高速推論）
- コストや制約を考慮した設計（音声APIなど）

---

## ■ Future Improvements（今後の展望）

### ● 電話番号連携（PSTN / Vapi）
Vapiを活用し、ユーザーが電話番号に発信することでAIと直接会話できる機能を実装予定です。

これにより、Webブラウザに依存しない音声インターフェースを実現し、AIによるリアルタイム通話対応や音声ベースでのミーティング予約が可能になります。  
より直感的でアクセシブルなユーザー体験を提供し、将来的には「電話でも話せるデジタルツイン」として、現実に近い形でのインタラクションを目指します。

---

### ● 多言語対応（英語・日本語）
英語と日本語の両方に対応し、ユーザーの言語に応じて自然な対話ができるシステムを構築予定です。

単なる翻訳ではなく、言語ごとのニュアンスや表現の違いにも対応し、より自然でストレスのないコミュニケーションを実現します。  
これにより、グローバルなユーザーにも対応できるポートフォリオへと発展させます。

---

### ● RAGによる高度な応答
RAG（Retrieval-Augmented Generation）を導入し、プロフィールや経歴、プロジェクト情報などをもとに応答を生成する仕組みを構築予定です。

これにより、AIがより正確で一貫性のある回答を行えるようになり、「自分に基づいた情報」で答えるデジタルツインを実現します。  
より深く、信頼性の高い対話体験の提供を目指します。

---

## ■ Final Note（おわりに）
このプロジェクトは、単なるポートフォリオではなく、「自分自身の存在をどのようにデジタル上で表現できるか」を探求する中で生まれました。

時間や場所に縛られず、自分の代わりに対話し、情報を伝え、機会を生み出す存在を実現することを目指しています。

今後はさらに機能や精度を高めながら、個人プロジェクトにとどまらず、**人とAIの新しい関係性を示すプラットフォームへと発展させていきたいと考えています。**
