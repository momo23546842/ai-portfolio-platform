import { test } from 'node:test'
import assert from 'node:assert/strict'
import { speechLocale, defaultVoiceLang, voiceLines, spokenDate, spokenReply } from '../lib/voice.ts'

test('the call listens and speaks in the chosen language', () => {
  assert.equal(speechLocale('ja'), 'ja-JP')
  assert.equal(speechLocale('en'), 'en-US')
})

test('the call starts in Japanese only for browsers that prefer Japanese', () => {
  assert.equal(defaultVoiceLang(['ja-JP', 'en-US']), 'ja')
  assert.equal(defaultVoiceLang(['en-AU', 'ja']), 'ja')
  assert.equal(defaultVoiceLang(['en-AU']), 'en')
  assert.equal(defaultVoiceLang(undefined), 'en')
})

test('both languages have every fixed line', () => {
  assert.deepEqual(Object.keys(voiceLines.ja).sort(), Object.keys(voiceLines.en).sort())
  assert.match(voiceLines.ja.slots(3, '3月10日', '9:00, 10:00'), /3月10日は3件/)
})

test('dates are read the Japanese way in Japanese', () => {
  assert.equal(spokenDate('2026-03-10', 'ja'), '3月10日')
  assert.equal(spokenDate('2026-03-10', 'en'), '2026-03-10')
})

test('long replies are cut at a sentence end, not mid-sentence', () => {
  assert.equal(spokenReply('Short answer. [BOOKING_LINK]'), 'Short answer.')
  const ja = 'AusBizではAIエージェントを開発しました。チームリーダーとして進捗を管理しました。使った技術はNext.jsとGroqです。'
  assert.equal(spokenReply(ja, 50), 'AusBizではAIエージェントを開発しました。チームリーダーとして進捗を管理しました。')
  assert.equal(spokenReply(ja, 30), 'AusBizではAIエージェントを開発しました。')
  assert.ok(spokenReply('x'.repeat(200), 50).endsWith('…'))
})
