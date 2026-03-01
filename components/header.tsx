"use client"

import { useState, useEffect } from "react"
import { Menu, X, Sun, Moon, MessageCircle, Phone } from "lucide-react"
import { useTheme } from "next-themes"

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Career", href: "#career" },
  { label: "Skills", href: "#skills" },
  { label: "Works", href: "#works" },
  { label: "Booking", href: "#booking" },
  { label: "Contact", href: "#contact" },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToAssistant = (tab: "chat" | "call") => {
    const el = document.getElementById("assistant")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
      // Dispatch custom event to switch tab
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("switch-assistant-tab", { detail: tab }))
      }, 400)
    }
    setMobileOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#hero"
          className="text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          MK
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}

          {/* Chat & Call buttons */}
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => scrollToAssistant("chat")}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Chat
            </button>
            <button
              onClick={() => scrollToAssistant("call")}
              className="flex items-center gap-1.5 rounded-full bg-[oklch(0.55_0.12_150/0.12)] px-3.5 py-1.5 text-xs font-medium text-[oklch(0.45_0.10_150)] transition-colors hover:bg-[oklch(0.55_0.12_150/0.22)] dark:text-[oklch(0.70_0.12_150)]"
            >
              <Phone className="h-3.5 w-3.5" />
              Call
            </button>
          </div>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          {/* Mobile Chat & Call */}
          <button
            onClick={() => scrollToAssistant("chat")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors active:bg-primary/20"
            aria-label="Chat"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollToAssistant("call")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[oklch(0.55_0.12_150/0.12)] text-[oklch(0.45_0.10_150)] transition-colors active:bg-[oklch(0.55_0.12_150/0.22)] dark:text-[oklch(0.70_0.12_150)]"
            aria-label="Call"
          >
            <Phone className="h-4 w-4" />
          </button>

          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          <button
            className="text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-b border-border bg-background/95 backdrop-blur-lg md:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1 px-6 pb-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
