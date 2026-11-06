# AIデジタルツイン ― 私の代わりに答えるポートフォリオ

私（片岡 桃世）の経歴・スキル・作品について、AIがチャットと音声で答え、ミーティングの予約まで行うポートフォリオサイトです。答えは、私の経歴データを検索して根拠にする**RAG**の仕組みで作っています。

**デモ：https://momoyo-ai.vercel.app** （日本語でも英語でも質問できます）

[![test](https://github.com/momo23546842/ai-portfolio-platform/actions/workflows/test.yml/badge.svg)](https://github.com/momo23546842/ai-portfolio-platform/actions/workflows/test.yml)

<img src="docs/images/1-top.png" width="720" alt="サイトのトップ。名前と紹介文、その下にAIと会話するチャット欄">

> English summary: An AI "digital twin" that answers recruiters' questions about my background by chat and voice, and books meetings with Google Calendar. Answers are grounded in my own profile through a lightweight RAG pipeline (BM25 retrieval over bilingual passages) with conversation memory. Built with Next.js, Groq, Neon (PostgreSQL), ElevenLabs and MCP, deployed on Vercel.

## 作った背景

オーストラリアでのAIエージェント開発インターン（AusBiz Consulting）で、チームで「デジタルツイン」を開発しました。チームではチャットと音声の会話が中心でした。

インターンのあと、これを個人のプロジェクトとして作り直しました。ふつうのポートフォリオは情報を一方的に並べるだけですが、見る人が知りたいことを会話で聞けるほうが、私という人をより自然に伝えられると考えたからです。個人では、次の機能を足しました。

- Googleカレンダーと連携したミーティング予約（Google Meetのリンクも自動で作る）
- 問い合わせフォームとメール通知
- 経歴データを根拠に答えるRAGと、会話の記憶

## できること

| 機能 | 内容 |
|---|---|
| チャット・音声で質問に答える | 経歴、インターン、作品、スキル、資格などに、日本語・英語で答えます。音声はElevenLabsで読み上げます |
| 根拠のある回答（RAG） | 質問に関係する経歴データだけを検索してLLMに渡します。回答の下に「参照した情報」を表示します |
| 続けての質問 | 直近の会話を覚えているので、「その時に使った技術は？」のような質問にも答えられます |
| 知らないことは知らないと言う | 経歴データにない質問（例：「趣味は？」）には推測で答えず、ミーティングを案内します |
| ミーティング予約 | チャットで「3月10日空いてる？」と聞くと空き時間を表示し、そのまま予約できます。Google Meetのリンクとメール通知を自動で送ります |
| AIエージェント向けのツール（MCP） | 音声エージェントなど外部のAIから、プロフィール検索を道具として呼び出せます |

<img src="docs/images/2-works.png" width="720" alt="作品セクション。AIデジタルツインとジム記録の2つのカード">

## RAGの仕組み

```mermaid
flowchart LR
  U[質問 + 直近の会話] --> Q[検索クエリを作る<br/>前の質問も含める]
  K[(経歴データ<br/>lib/profile-data.ts<br/>＋ DBのQ&A)] --> C[小さな文書に分割<br/>日本語・英語を併記]
  C --> I[BM25の索引]
  Q --> S{BM25で検索<br/>上位5件}
  I --> S
  S -->|関係する文書だけ| P[システムプロンプト<br/>「この情報だけで答える」]
  P --> L[Groq LLM]
  L --> R[回答 + 参照した情報]
```

1. **経歴データを小さな文書に分ける：** 職歴1件、作品1件、Q&A1件などを、それぞれ1つの文書にします。各文書は日本語と英語の両方で書いてあるので、どちらの言語の質問でも見つかります。
2. **質問に関係する文書を探す：** BM25という検索方式で、質問と各文書の一致度を点数にします。直前の質問もいっしょに検索するので、「その時に〜」のような続けての質問でも話題を見失いません。
3. **見つかった文書だけをLLMに渡す：** 「この情報だけを使って答え、ないことは推測しない」と指示します。プロンプトが短くなるので、速く安く答えられます。
4. **参照した情報を返す：** どの文書をもとに答えたかを画面に表示します。

## 設計で判断したこと

- **ベクトル検索ではなくBM25を選んだ：** 文書は数十件と少なく、使っているGroqには埋め込み（ベクトル化）のAPIがありません。BM25なら追加のサービスやデータベースの変更なしで動き、検索結果の理由も説明しやすいです。文書が増えたら、Neonのpgvectorでベクトル検索を足すことを考えています。
- **日本語の検索の工夫：** 日本語は単語の区切りがないので、漢字・カタカナを2文字ずつ区切って索引にしています。ひらがなは「について」「ですか」のような助詞・語尾がほとんどで、どの文書にも一致して検索を邪魔するため、区切りとして扱います。この工夫で、「趣味は何ですか？」のような関係のない質問に、無理やり答えないようになりました。
- **経歴データを1か所にまとめた：** 以前は、画面の経歴、データベース、AIへの指示文に別々に経歴が書かれていて、内容が食い違っていました。`lib/profile-data.ts` を唯一の元データにして、画面の表示・AIの回答・MCPのツールがすべてここを読むようにしました。
- **会話の記憶はブラウザ側に持つ：** サーバーは会話を覚えず、ブラウザが直近の会話を毎回送ります。サーバーレス（Vercel）でも追加の保存先なしで動きます。送られてきた履歴は信用せず、形式を確かめ、長さと件数を制限してから使います。
- **安全とコストへの配慮：**
  - 1回の質問は1,000文字まで、同じ人からの連続した質問は1分20回までに制限し、Groqの利用料が膨らまないようにしています。
  - 誰でも任意の宛先にメールを送れてしまう開発用のテストAPIが残っていたので削除しました。
  - APIキーはすべて環境変数で管理し、リポジトリには含めていません。

## 技術構成

| 分類 | 技術 |
|---|---|
| フロントエンド | Next.js (App Router)、React、TypeScript、Tailwind CSS |
| バックエンド | Next.js API Routes、Prisma、Neon (PostgreSQL) |
| 生成AI | Groq API（LLM）、RAG（BM25、自前実装）、ElevenLabs（音声）、MCP |
| 外部サービス | Google Calendar API、Google Meet、Resend（メール） |
| テスト・CI | Node.js標準のテストランナー、GitHub Actions |
| 公開 | Vercel |

```
lib/
  profile-data.ts   経歴・作品・スキル・Q&A（画面とAIの共通の元データ）
  rag.ts            分割・索引・BM25検索・会話履歴の検証（外部依存なし）
  prisma.ts         データベース接続
app/api/
  chat/             チャットAPI（検索 → プロンプト → Groq → 回答と参照元）
  mcp/              AIエージェント向けツール（プロフィール検索など）
  booking/          空き時間の確認・予約作成（Google Calendar）
  contact/          問い合わせ
  elevenlabs/       音声合成
components/         画面の各セクション
tests/              検索・会話履歴のテスト
```

## テスト

```bash
npm test
```

検索のテスト（日本語・英語の質問で正しい文書が見つかるか、続けての質問、関係のない質問で何も返さないか）、会話履歴の検証、経歴データの日付の整合性などを確かめています。追加のライブラリは使わず、Node.js 22の機能だけで動きます。pushのたびにGitHub Actionsで自動実行されます。

## ローカルで動かす

```bash
npm install
npm run dev
```

`.env` に次の環境変数を設定します。

| 変数 | 用途 |
|---|---|
| `DATABASE_URL` | Neon (PostgreSQL) の接続先 |
| `GROQ_API_KEY`, `GROQ_MODEL` | LLM（モデルを省略すると `llama-3.1-8b-instant`） |
| `ELEVENLABS_API_KEY`, `VOICE_ID` | 音声 |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID` | 予約（Google Calendar） |
| `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `GOOGLE_OAUTH_REFRESH_TOKEN` | Google Meetのリンク作成 |
| `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_NOTIFY_TO`, `CONTACT_NOTIFY_EMAIL` | メール通知 |

## 開発の進め方

- インターンでのチーム開発（チャット・音声のデジタルツイン）がもとになっています。私はチームリーダーとして、タスクの割り振り、進捗管理、ミーティングの運営を担当しました。
- 個人での拡張（予約・問い合わせ・RAG・会話の記憶・経歴データの一本化）は、何を作るか、どこまで作るかを自分で決め、ClaudeなどのAIを使いながら実装しました。開発中に起きた問題と解決は [`.doc/PROGRESS.md`](.doc/PROGRESS.md) に記録しています（例：Vercelでパッケージが大きすぎて動かなかったGoogle APIを、REST APIと自前の認証に置き換えた）。

## 今後やりたいこと

- **ベクトル検索の追加：** 文書が増えたときのために、BM25とNeonのpgvectorを組み合わせたハイブリッド検索
- **回答の品質評価：** 想定質問と正解の組を用意して、検索と回答の正確さを自動で測る
- **電話での会話：** Vapiを使い、電話番号に発信してAIと話せるようにする
