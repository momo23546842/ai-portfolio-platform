import { Code2, HeartPulse } from "lucide-react"

export function About() {
  return (
    <section id="about" className="px-6 py-28">
      <div className="mx-auto max-w-4xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
          About
        </p>
        <h2 className="mb-12 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          A unique blend of disciplines
        </h2>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Developer */}
          <div className="group rounded-xl border border-border bg-card p-8 shadow-sm shadow-foreground/[0.03] transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Code2 className="h-5 w-5" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-card-foreground">
              Developer
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              As a full-stack developer, I specialise in building AI-driven web
              applications using Next.js, TypeScript, and modern cloud
              infrastructure. I enjoy translating complex problems into clean,
              intuitive user interfaces.
            </p>
          </div>

          {/* Dietitian */}
          <div className="group rounded-xl border border-border bg-card p-8 shadow-sm shadow-foreground/[0.03] transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HeartPulse className="h-5 w-5" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-card-foreground">
              Dietitian
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              With a Bachelor of Nutrition from Nagoya University of Arts and
              Sciences, I bring a unique perspective to tech. My background in
              healthcare sharpens my empathy-driven approach to product
              development and user experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
