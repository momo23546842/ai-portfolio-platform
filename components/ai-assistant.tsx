"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, MicOff, Phone, PhoneOff, MessageCircle } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function AiAssistant() {
  const [tab, setTab] = useState<"chat" | "call">("chat")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm Momoyo's AI assistant. Feel free to ask me anything about her background, skills, or how to get in touch.",
    },
  ])
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      setCallDuration(0)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isCallActive])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    setTimeout(() => {
      const replies = [
        "Thanks for your question! Momoyo is a full-stack developer specializing in Next.js and AI-driven applications, with a background in nutrition science.",
        "Great question! You can reach Momoyo through the contact form on this page, or schedule a meeting through the booking section.",
        "Momoyo is currently based in Sydney, working as a Full-Stack AI System Developer and Team Lead at AusBiz Consulting.",
        "Momoyo combines her expertise in technology and health science to build thoughtful digital experiences. Feel free to ask more!",
      ]
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: replies[Math.floor(Math.random() * replies.length)],
      }
      setMessages((prev) => [...prev, reply])
    }, 1000)
  }

  return (
    <section id="assistant" className="relative px-6 py-12">
      {/* Subtle section background for visual separation */}
      <div className="pointer-events-none absolute inset-0 bg-card/40" />

      <div className="relative mx-auto max-w-4xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
          AI Assistant
        </p>
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Ask Me Anything
        </h2>
        <p className="mb-10 max-w-2xl leading-relaxed text-muted-foreground">
          Chat with my AI assistant to learn more about my background, skills,
          and experience -- or start a voice call.
        </p>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-foreground/[0.03]">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setTab("chat")}
              className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                tab === "chat"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </button>
            <button
              onClick={() => setTab("call")}
              className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                tab === "call"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Phone className="h-4 w-4" />
              Call
            </button>
          </div>

          {/* Chat tab */}
          {tab === "chat" && (
            <div className="flex flex-col">
              {/* Messages */}
              <div ref={scrollRef} className="h-80 overflow-y-auto px-6 py-6">
                <div className="flex flex-col gap-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-border bg-background/50 px-6 py-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-xl border border-border bg-card px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-colors hover:brightness-110 disabled:opacity-40 disabled:shadow-none"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Call tab */}
          {tab === "call" && (
            <div className="flex flex-col items-center justify-center px-6 py-16">
              {isCallActive ? (
                <div className="flex flex-col items-center gap-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative flex h-24 w-24 items-center justify-center">
                      <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                        <Phone className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground">
                      Voice call in progress
                    </p>
                    <p className="font-mono text-3xl font-semibold text-primary">
                      {formatTime(callDuration)}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                        isMuted
                          ? "bg-destructive/20 text-destructive"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <MicOff className="h-6 w-6" />
                      ) : (
                        <Mic className="h-6 w-6" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsCallActive(false)
                        setIsMuted(false)
                      }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-card transition-transform hover:scale-105"
                      aria-label="End call"
                    >
                      <PhoneOff className="h-7 w-7" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                    <Mic className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <h4 className="text-lg font-semibold text-foreground">
                      Voice Call
                    </h4>
                    <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                      Start a voice conversation with the AI assistant to learn
                      more about Momoyo.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCallActive(true)}
                    className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
                  >
                    <Phone className="h-4 w-4" />
                    Start Call
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
