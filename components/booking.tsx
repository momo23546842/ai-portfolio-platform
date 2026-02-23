import { CalendarDays } from "lucide-react"

export function Booking() {
  return (
    <section id="booking" className="px-6 py-28">
      <div className="mx-auto max-w-4xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
          Booking
        </p>
        <h2 className="mb-12 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Schedule a Meeting
        </h2>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center shadow-sm shadow-foreground/[0.03]">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <CalendarDays className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-card-foreground">
            Calendar Coming Soon
          </h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            An integrated booking calendar will be available here shortly. In the
            meantime, feel free to reach out via the contact section below.
          </p>
        </div>
      </div>
    </section>
  )
}
