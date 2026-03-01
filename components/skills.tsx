import { Globe, Cloud, Brain, Wrench, Users, Database, Award } from "lucide-react"

const skills = [
  {
    category: "Web Development",
    icon: Globe,
    items: ["Next.js", "TypeScript", "JavaScript", "HTML", "CSS / SCSS"],
  },
  {
    category: "Cloud & Infrastructure",
    icon: Cloud,
    items: ["Vercel", "Neon (PostgreSQL)", "Env variable management"],
  },
  {
    category: "AI Systems",
    icon: Brain,
    items: ["Vercel AI SDK", "MCP integration", "API integration"],
  },
  {
    category: "Database",
    icon: Database,
    items: ["PostgreSQL", "MySQL"],
  },
  {
    category: "Tools / Workflow",
    icon: Wrench,
    items: ["GitHub (PR, branching)", "ClickUp (task tracking)", "ngrok (tunneling)"],
  },
  {
    category: "Professional",
    icon: Users,
    items: ["Team Leadership", "Schedule Management", "Technical Documentation"],
  },
]

const certifications = [
  {
    title: "Registered Dietitian",
    detail: "Japan — National License",
  },
]

export function Skills() {
  return (
    <section id="skills" className="px-6 py-28">
      <div className="mx-auto max-w-4xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
          Skills
        </p>
        <h2 className="mb-12 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Tools & Technologies
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <div
              key={skill.category}
              className="group rounded-xl border border-border bg-card p-6 shadow-sm shadow-foreground/[0.03] transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <skill.icon className="h-4 w-4" />
              </div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-card-foreground">
                {skill.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skill.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="mt-14">
          <h3 className="mb-6 text-lg font-semibold tracking-tight text-foreground">
            Certifications
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert) => (
              <div
                key={cert.title}
                className="group flex items-start gap-4 rounded-xl border border-border bg-card p-6 shadow-sm shadow-foreground/[0.03] transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{cert.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{cert.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
