import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { AiAssistant } from "@/components/ai-assistant"
import { About } from "@/components/about"
import { Career } from "@/components/career"
import { Skills } from "@/components/skills"
import { Works } from "@/components/works"
import { Booking } from "@/components/booking"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AiAssistant />
        <About />
        <Career />
        <Skills />
        <Works />
        <Booking />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
