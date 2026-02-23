import { FolderOpen } from "lucide-react"

export function Works() {
  return (
    <section id="works" className="relative px-6 py-28">
      {/* Subtle alternating background */}
      <div className="pointer-events-none absolute inset-0 bg-card/40" />

      <div className="relative mx-auto max-w-4xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
          Works
        </p>
        <h2 className="mb-12 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Selected Projects
        </h2>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center shadow-sm shadow-foreground/[0.03]">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <FolderOpen className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-card-foreground">
            Coming Soon
          </h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Projects are currently being curated. Check back soon to see the
            latest work in full-stack development and AI systems.
          </p>
        </div>
      </div>
    </section>
  )
}
