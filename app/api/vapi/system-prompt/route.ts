import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Resume, Profile, Skill } from '@prisma/client'

export async function GET() {
  try {
    // Fetch profile (expect single)
    const profile = await prisma.profile.findFirst()

    // Fetch career/resume entries (order by startDate desc)
    const resumes = await prisma.resume.findMany({
      orderBy: { startDate: 'desc' },
    })

    // Fetch skills
    const skills = await prisma.skill.findMany({ orderBy: { category: 'asc' } })

    const profileSection = profile
      ? `PROFILE:\nName: ${profile.name}\nBio: ${profile.bio}${profile.catchphrase ? `\nCatchphrase: ${profile.catchphrase}` : ''}\n`
      : 'PROFILE:\nNo profile available.\n'

    const careerSection = resumes && resumes.length
      ? `CAREER:\n${(resumes as Resume[])
          .map((r: Resume) => `- ${r.title} at ${r.organization} (${r.startDate.toISOString().slice(0,10)}${r.endDate ? ` - ${r.endDate.toISOString().slice(0,10)}` : ''})${r.description ? `\n  ${r.description}` : ''}`)
          .join('\n')}`
      : 'CAREER:\nNo career/resume entries available.\n'

    const skillsSection = skills && skills.length
      ? `SKILLS:\n${(skills as Skill[]).map((s: Skill) => `- ${s.name} (${s.level}/5) — ${s.category}`).join('\n')}`
      : 'SKILLS:\nNo skills available.\n'

    const systemPrompt = `You are Momoyo Kataoka's digital twin. Here is her information:\n\n${profileSection}\n${careerSection}\n\n${skillsSection}`

    return NextResponse.json({ systemPrompt })
  } catch (err) {
    console.error('Error building system prompt', err)
    return new Response(JSON.stringify({ error: 'Failed to build system prompt' }), { status: 500 })
  }
}
