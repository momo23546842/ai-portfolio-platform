# momoyo-ai

> 🇯🇵 [日本語版はこちら](#japanese)

---

## Introduction

This project was built to extend my presence beyond time and availability.

Even when I am sleeping, busy, or unavailable, this system allows visitors to interact with a digital version of me — ask questions, learn about my background, and schedule meetings — as if I were responding in real time.

Rather than building a traditional portfolio website, I designed a system that can represent me both conversationally and functionally through AI-driven interaction and structured scheduling workflows.

**This is not just a personal introduction page.
It is an AI-powered presence platform.**

---

## Overview

This repository implements a full-stack AI-integrated digital twin web application.

The system combines:

- Conversational AI (voice + chat)
- Real-time calendar synchronization
- Automated meeting booking workflows
- Google Meet auto-generation
- Email confirmation automation
- Persistent conversation & booking storage

The goal is to simulate natural interaction while integrating structured scheduling logic in a production-ready environment.

---

## Core Capabilities

### Conversational AI

- Voice and chat interaction
- Structured booking intent handling
- Tool-based execution via MCP integration

### Smart Scheduling System

- Real-time availability checks via Google Calendar
- Server-side booking validation
- Automatic Google Meet link generation

### Automation Layer

- Email confirmations via Resend
- Persistent storage in PostgreSQL
- End-to-end workflow orchestration

---

## System Architecture

### Frontend

- Next.js (App Router)
- Tailwind CSS

### Backend

- Next.js API Routes
- Prisma ORM
- Neon (PostgreSQL)

### AI Layer

- Web Speech API (current implementation)
- MCP-based structured tool execution
- *(Previously Vapi + ElevenLabs pipeline)*

### External Integrations

- Google Calendar (Service Account authentication)
- Google Meet link generation
- Resend (email automation)

### Deployment

- Vercel (production hosting)

---

## Key Challenges & Solutions

### 1. Synchronizing AI with Real-world Scheduling

**Challenge:**
AI-triggered booking requests needed to reflect real-time calendar availability without conflicts.

**Solution:**

- Implemented server-side availability validation
- Controlled booking execution logic
- Structured tool invocation via MCP

This ensured reliable and conflict-free scheduling.

### 2. Voice Calls Failing Due to ElevenLabs Quota Limits

**Symptoms:**

- Calls disconnected mid-session
- Vapi logs showed `endedReason: "pipeline-error-eleven-labs-quota-exceeded"`

**Cause:**
Insufficient ElevenLabs free-tier credits (Required: 6 / Remaining: 4)

**Decision & Solution:**
Instead of upgrading immediately, I redesigned the voice architecture:

- Removed Vapi + ElevenLabs integration
- Migrated to browser-native Web Speech API
- Simplified the voice processing flow

**Removed Files:**

- `components/vapi/VapiWidget.tsx`
- `app/api/llm/route.ts`
- `app/api/vapi/*`

This reduced cost and improved system stability.

**Future Plan:**
Reintroduce ElevenLabs with a custom voice model for production-level voice personalization.

### 3. Prisma Initialization Issues with Neon + Next.js

**Challenge:**
PrismaClient initialization errors prevented correct API route detection.

**Solution:**

- Implemented `@prisma/adapter-neon`
- Switched to dynamic imports in API routes
- Updated seed logic

### 4. Google Calendar OAuth Configuration Confusion

**Symptoms:**

- Difficulty configuring OAuth Client ID
- Redirect URI complexity

**Root Cause:**
Confusion between OAuth (user authentication) and Service Account (server authentication).

Since this system only requires backend-controlled calendar access, OAuth was unnecessary.

**Solution:**

- Cancelled OAuth setup
- Switched to Google Service Account authentication

**Implementation Steps:**

1. Created Service Account (`momoyo-calendar`)
2. Assigned Editor role
3. Generated JSON key
4. Shared Google Calendar with Service Account email
5. Granted event modification permission

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS |
| Voice/Chat | Web Speech API |
| Database | Neon (PostgreSQL) |
| ORM | Prisma |
| Calendar | Google Calendar (Service Account) |
| Email | Resend |
| Deployment | Vercel |

---

## Future Improvements & Roadmap

### 1. Personalized Voice Model

Reintroduce ElevenLabs with a custom-trained voice model to replicate my natural voice.

### 2. Retrieval-Augmented Generation (RAG)

Integrate structured profile and resume data into a vector database for deeper contextual responses.

### 3. Multi-language Support

Dynamic English/Japanese switching with adaptive tone.

### 4. User Authentication Layer

Optional accounts for:

- Returning visitor recognition
- Secure booking management
- Personalized follow-ups

### 5. Analytics Dashboard

Track:

- Conversation patterns
- Booking metrics
- Feature usage

### 6. Scalable Voice Pipeline

Transition from browser speech to server-side voice processing for scalability.

### 7. Phone Number Integration (PSTN Calling)

Integrate a public phone number (e.g., Twilio/Vapi telephony) allowing users to call and interact with the AI through traditional phone calls.

This will enable:

- Real-world voice interaction
- AI-powered call handling
- Phone-based scheduling
- Expanded accessibility

**Long-term vision:**
Transform this system from a personal portfolio into a scalable AI-driven presence platform.

---

## What This Project Demonstrates

- Full-stack AI integration
- Real-time API orchestration
- Structured conversational workflows
- Calendar-based scheduling automation
- Authentication architecture decisions
- Production-ready deployment practices
- System redesign under constraints

---

<a name="japanese"></a>

# momoyo-ai（日本語）

## はじめに

本プロジェクトは、私の時間的制約を超えて「存在を拡張する」ことを目的として構築しました。

私が就寝中や予定がある場合でも、このシステムを通じて訪問者はAIを介して自然に対話し、経歴や考えを知り、ミーティング予約まで行うことができます。

単なる自己紹介ページではなく、会話と実務機能を担う「デジタル上の分身」を実装したプラットフォームです。

---

## 概要

本リポジトリは、会話型AIとリアルタイム予約機能を統合したフルスタックWebアプリケーションです。

- 音声・チャットによる会話
- Googleカレンダーとのリアルタイム同期
- 会話中に完結する予約処理
- Google Meet自動生成
- メール自動送信
- データベース保存

自然な対話体験と構造化されたスケジューリングロジックを統合しています。

---

## 今後の拡張計画

- カスタム音声モデル導入
- RAG実装
- 多言語対応
- ユーザー認証追加
- 分析ダッシュボード
- 電話番号連携（PSTN対応）

最終的には、個人ポートフォリオを超えた
**「AI拡張型プレゼンスプラットフォーム」** への進化を目指しています。
