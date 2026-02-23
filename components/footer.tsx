export function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 px-6 py-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-xs text-muted-foreground">
          {"© 2025 Momoyo Kataoka. All rights reserved."}
        </p>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  )
}
