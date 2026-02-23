"use client"

import { Mail, MapPin } from "lucide-react"

export function Contact() {
  return (
    <section id="contact" className="relative px-6 py-28">
      {/* Subtle alternating background */}
      <div className="pointer-events-none absolute inset-0 bg-card/40" />

      <div className="relative mx-auto max-w-4xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
          Contact
        </p>
        <h2 className="mb-12 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {"Let's Connect"}
        </h2>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact info */}
          <div className="flex flex-col gap-6">
            <p className="leading-relaxed text-muted-foreground">
              Whether you have a project in mind, want to discuss a
              collaboration, or just want to say hello — I would love to hear from
              you.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span>Sydney, Australia</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span>Available via contact form</span>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <form
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm shadow-foreground/[0.03]"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="message"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                placeholder="Your message..."
                className="resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:brightness-110"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
