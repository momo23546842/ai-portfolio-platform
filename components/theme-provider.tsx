"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type Props = {
  children: React.ReactNode
}

export default function ThemeProvider({ children }: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      enableSystem={false}
      defaultTheme="dark"
      storageKey="theme"
    >
      {children}
    </NextThemesProvider>
  )
}
