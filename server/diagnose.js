// Run this directly on Replit: node server/diagnose.js
// Tests each part of the insights pipeline in isolation

import 'dotenv/config'
import Anthropic from '@anthropic-ai/sdk'

console.log('\n=== INSIGHTS PIPELINE DIAGNOSTIC ===\n')

// 1. Check API key
const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY is not set in environment')
  console.error('   On Replit: add it in Secrets (padlock icon)')
  process.exit(1)
}
console.log('✓ ANTHROPIC_API_KEY is set:', apiKey.substring(0, 12) + '…')

// 2. Check Firecrawl key (optional)
const fcKey = process.env.FIRECRAWL_API_KEY
if (fcKey) {
  console.log('✓ FIRECRAWL_API_KEY is set:', fcKey.substring(0, 12) + '…')
} else {
  console.log('⚠ FIRECRAWL_API_KEY not set (website scraping will be skipped)')
}

// 3. Test Anthropic API directly
console.log('\n--- Testing Anthropic API call ---')
const client = new Anthropic({ apiKey })

try {
  const start = Date.now()
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    temperature: 0.7,
    system: 'You are a skincare marketing analyst. Respond with JSON only, no markdown.',
    messages: [{
      role: 'user',
      content: `Return this exact JSON structure with brief example text:
{"whats_working":"example","the_leak":"example","missing_angle":"example","test_brief":"example"}`
    }],
  })
  const elapsed = Date.now() - start

  const text = response.content?.[0]?.text || ''
  console.log(`✓ API responded in ${elapsed}ms`)
  console.log('  Raw text:', text.substring(0, 200))

  // Try parsing
  try {
    const parsed = JSON.parse(text)
    const keys = ['whats_working', 'the_leak', 'missing_angle', 'test_brief']
    const hasAll = keys.every(k => typeof parsed[k] === 'string')
    if (hasAll) {
      console.log('✓ JSON parsing succeeded — all 4 keys present')
    } else {
      console.warn('⚠ JSON parsed but missing keys:', keys.filter(k => !parsed[k]))
    }
  } catch (e) {
    console.warn('⚠ Direct JSON parse failed:', e.message)
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        JSON.parse(match[0])
        console.log('✓ Regex extraction recovered valid JSON')
      } catch {
        console.error('❌ All JSON parsing failed')
      }
    }
  }
} catch (err) {
  console.error('❌ Anthropic API call failed:', err.message)
  if (err.status === 401) console.error('   → API key is invalid or expired')
  if (err.status === 404) console.error('   → Model claude-haiku-4-5-20251001 not found for this key')
  if (err.status === 429) console.error('   → Rate limited')
  if (err.name === 'AbortError') console.error('   → Timed out')
  process.exit(1)
}

// 4. Test AbortController compatibility
console.log('\n--- Testing AbortController + signal ---')
try {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  const response2 = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 50,
    messages: [{ role: 'user', content: 'Say "hello"' }],
  }, { signal: controller.signal })
  clearTimeout(timeout)
  console.log('✓ AbortController signal works with this SDK version')
} catch (err) {
  if (err.message?.includes('signal') || err instanceof TypeError) {
    console.error('❌ AbortController signal NOT supported by SDK version')
    console.error('   FIX: Remove { signal: controller.signal } from insights.js line 182')
  } else {
    console.error('❌ Signal test failed:', err.message)
  }
}

// 5. Test Express server reachability
console.log('\n--- Testing Express server on port 3001 ---')
try {
  const res = await fetch('http://localhost:3001/api/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answers: {
        brandName: 'DiagnosticTest',
        brandType: 'skincare_mass',
        revenue: '30k_80k',
        spendTier: '30k_50k',
        refreshRate: 'monthly_or_less',
        angleDiversity: 'yes_same',
        costTrend: 'up_some',
        roasBracket: 'r_1_5_2_5',
        creativeVolume: 'vol_3_7',
        adsMadeBy: 'agency',
        frustrations: ['stop_performing', 'same_message'],
        aov: 'aov_40_60',
      }
    }),
  })
  const data = await res.json()
  if (data.insights) {
    console.log('✓ Express returned insights:', Object.keys(data.insights))
  } else {
    console.warn('⚠ Express returned null insights — check server logs above')
  }
} catch (err) {
  if (err.cause?.code === 'ECONNREFUSED') {
    console.error('❌ Express server is NOT running on port 3001')
    console.error('   THIS IS THE PROBLEM. The Vite proxy has nothing to connect to.')
    console.error('   FIX: Use "npm run dev:full" instead of "npm run dev"')
    console.error('   Or in .replit: run = "npm run dev:full"')
  } else {
    console.error('❌ Could not reach Express:', err.message)
  }
}

console.log('\n=== DIAGNOSTIC COMPLETE ===\n')
