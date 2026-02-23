import { Briefcase, GraduationCap } from "lucide-react"

const timeline = [
  {
    title: "Full-Stack AI System Development / Team Lead",
    org: "AusBiz Consulting",
    period: "2025 - Present",
    type: "work" as const,
  },
  {
    title: "Dietitian (Online)",
    org: "Self-employed, Japan",
    period: "2025 - Present",
    type: "work" as const,
  },
  {
    title: "Diploma of IT",
    org: "ECA College",
    period: "2025 - Present",
    type: "education" as const,
  },
  {
    title: "Kitchen Staff",
    org: "Ume Burger, Sydney",
    period: "2024 - 2025",
    type: "work" as const,
  },
  {
    title: "Dietitian",
    org: "Chiba Yakuhin, Japan",
    period: "2022 - 2024",
    type: "work" as const,
  },
  {
    title: "Bachelor's Degree in Nutrition",
    org: "Nagoya University of Arts and Sciences",
    period: "2018 - 2022",
    type: "education" as const,
  },
]

export function Career() {
  return (
    <section id="career" className="relative px-6 py-28">
      {/* Subtle alternating background */}
      <div className="pointer-events-none absolute inset-0 bg-card/40" />

      <div className="relative mx-auto max-w-4xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
          Career
        </p>
        <h2 className="mb-12 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Experience & Education
        </h2>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border md:left-1/2 md:-translate-x-px" />

          <div className="flex flex-col gap-10">
            {timeline.map((item, i) => (
              <div
                key={i}
                className={`relative flex flex-col md:flex-row ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div className="absolute left-[12px] top-1.5 z-10 flex h-[15px] w-[15px] items-center justify-center rounded-full border-2 border-primary bg-background md:left-1/2 md:-translate-x-1/2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>

                {/* Content */}
                <div
                  className={`ml-12 md:ml-0 md:w-1/2 ${
                    i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                  }`}
                >
                  <div className="rounded-xl border border-border bg-card p-5 shadow-sm shadow-foreground/[0.03] transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
                    <div className="mb-1 flex items-center gap-2 md:gap-2">
                      {i % 2 !== 0 && (
                        <>
                          {item.type === "education" ? (
                            <GraduationCap className="h-4 w-4 text-primary" />
                          ) : (
                            <Briefcase className="h-4 w-4 text-primary" />
                          )}
                        </>
                      )}
                      <span className="font-mono text-xs text-muted-foreground">
                        {item.period}
                      </span>
                      {i % 2 === 0 && (
                        <span className="md:ml-auto">
                          {item.type === "education" ? (
                            <GraduationCap className="h-4 w-4 text-primary" />
                          ) : (
                            <Briefcase className="h-4 w-4 text-primary" />
                          )}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.org}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
