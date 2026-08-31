#!/usr/bin/env node
// Regenerates skills/blindpay from the BlindPay VitePress docs.
//
//   node scripts/sync-docs.mjs <path-to-docs>
//
// Every reference file under skills/blindpay/references is derived, never edited
// by hand: the script wipes that tree, converts each docs page from VitePress
// markdown (custom Vue components, flavor blocks, site-root links) into plain
// markdown, and regenerates the reference index inside SKILL.md from
// scripts/skill-template.md.

import { readFileSync, writeFileSync, rmSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GROUPS } from './pages.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SKILL_DIR = join(ROOT, 'skills/blindpay')
const REFS_DIR = join(SKILL_DIR, 'references')
const DOCS = resolve(process.argv[2] || process.env.BLINDPAY_DOCS_DIR || '')
const DOCS_URL = 'https://blindpay.com/docs'

if (!existsSync(join(DOCS, '.vitepress'))) {
  console.error('Docs source not found.\nUsage: node scripts/sync-docs.mjs <path-to-docs> (or set BLINDPAY_DOCS_DIR)')
  process.exit(1)
}

/* ------------------------------------------------------------------ pages -- */

function pagesInFolder(folder) {
  return readdirSync(join(DOCS, folder))
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .sort()
    .map(f => `${folder}/${f.replace(/\.md$/, '')}`)
}

const groups = GROUPS.map(g => ({
  ...g,
  files: g.glob ? pagesInFolder(g.glob) : g.files,
}))

// slug ("learn/instances") -> reference path relative to references/ ("essentials/instances.md")
const slugToRef = new Map()
for (const g of groups)
  for (const slug of g.files) slugToRef.set(slug, `${g.dir}/${slug.split('/').pop()}.md`)

/* ------------------------------------------------------------- components -- */

const ALERT_LABELS = { info: 'Note', tip: 'Tip', success: 'Success', warning: 'Warning', danger: 'Danger', error: 'Danger' }

const FLAVOR_LABELS = {
  abstracted: 'Abstracted flavor (bank-rails framing, fiat-first API surface)',
  fiat: 'Abstracted flavor (bank-rails framing, fiat-first API surface)',
  advanced: 'Advanced flavor (stablecoin and blockchain mechanics)',
  stablecoin: 'Advanced flavor (stablecoin and blockchain mechanics)',
}

// Mirrors CPrerequisites.vue.
const PREREQ_BASE = [
  ['account', 'Create an account at https://app.blindpay.com/sign-up'],
  ['instance', 'Create a development instance (see essentials/instances.md)'],
  ['api-key', 'Create your API key (see essentials/api-keys.md)'],
]
const PREREQ_EXTRA = {
  tos: 'Accept the Terms of Service and get your `tos_id` (see essentials/terms-of-service.md)',
}

function attrs(tag) {
  const out = {}
  // name="value" | :name='["a","b"]' | bare boolean flag
  for (const m of tag.matchAll(/(:?[a-zA-Z][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')|(?<![-\w:="'])\b([a-zA-Z][\w-]*)\b(?!\s*=)/g)) {
    const [, name, dq, sq, bare] = m
    if (bare) {
      if (!/^(CAlert|CAuthNote|CPrerequisites|CHeroImg|CSupport|CSteps|CCodeGroup|FlavorOnly)$/.test(bare))
        out[bare] = true
      continue
    }
    const key = name.replace(/^:/, '')
    const raw = dq ?? sq ?? ''
    out[key] = name.startsWith(':') ? safeJson(raw) : raw
  }
  return out
}

function safeJson(raw) {
  try {
    return JSON.parse(raw.replace(/'/g, '"'))
  }
  catch {
    return raw
  }
}

function renderPrerequisites(a) {
  const omit = Array.isArray(a.omit) ? a.omit : []
  const extra = Array.isArray(a.steps) ? a.steps : []
  const steps = [
    ...PREREQ_BASE.filter(([k]) => !omit.includes(k)).map(([, label]) => label),
    ...extra.map(k => PREREQ_EXTRA[k]).filter(Boolean),
  ]
  return ['**Before you start:**', '', ...steps.map((s, i) => `${i + 1}. ${s}`)].join('\n')
}

function renderAuthNote(a) {
  const parts = ['`YOUR_API_KEY` with your API key', '`in_000000000000` with your instance ID']
  if (a.customer) parts.push('`re_000000000000` with your customer ID')
  if (a.bankAccount) parts.push('`ba_000000000000` with your bank account ID')
  return `**Remember:** replace ${parts.join(', ')}.`
}

/* --------------------------------------------------------------- pipeline -- */

function splitFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!m) return { data: {}, body: src }
  const data = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/)
    if (kv) data[kv[1]] = kv[2].trim().replace(/^["'](.*)["']$/, '$1')
  }
  return { data, body: src.slice(m[0].length) }
}

// Joins component tags whose attributes wrap across lines, so the tag handlers
// below only ever see a single line.
function joinWrappedTags(body) {
  const lines = body.split('\n')
  const out = []
  let fence = false
  let buf = null
  for (const line of lines) {
    if (/^\s*```/.test(line)) fence = !fence
    if (!fence && buf === null && /^\s*<\/?C[A-Z]|^\s*<FlavorOnly/.test(line) && !line.includes('>')) {
      buf = line
      continue
    }
    if (buf !== null) {
      buf += ` ${line.trim()}`
      if (line.includes('>')) {
        out.push(buf.replace(/\s+/g, ' '))
        buf = null
      }
      continue
    }
    out.push(line)
  }
  if (buf !== null) out.push(buf)
  return out.join('\n')
}

function transformComponents(body) {
  const out = []
  let fence = false
  for (const line of joinWrappedTags(body).split('\n')) {
    if (/^\s*```/.test(line)) {
      fence = !fence
      out.push(line)
      continue
    }
    if (fence) {
      out.push(line)
      continue
    }

    const tag = line.trim()

    let m = tag.match(/^<FlavorOnly\b([^>]*)>$/)
    if (m) {
      const only = attrs(m[1]).only
      out.push(`**${FLAVOR_LABELS[only] || `${only} flavor`}**`)
      continue
    }
    if (/^<\/FlavorOnly>$/.test(tag)) continue

    m = tag.match(/^<CAlert\b([^>]*)>$/)
    if (m && !tag.endsWith('/>')) {
      out.push(`**${ALERT_LABELS[attrs(m[1]).type] || 'Note'}:**`)
      continue
    }
    if (/^<\/CAlert>$/.test(tag)) continue

    m = tag.match(/^<CHeroImg\b([^>]*?)\/?>$/)
    if (m) {
      const a = attrs(m[1])
      if (a.image) out.push(`![${a.alt || ''}](${a.image})`)
      continue
    }

    m = tag.match(/^<CAuthNote\b([^>]*?)\/?>$/)
    if (m) {
      out.push(renderAuthNote(attrs(m[1])))
      continue
    }

    m = tag.match(/^<CPrerequisites\b([^>]*?)\/?>$/)
    if (m) {
      out.push(renderPrerequisites(attrs(m[1])))
      continue
    }

    // Structural-only wrappers and the support footer carry no content.
    if (/^<\/?(CCodeGroup|CSteps|CCodeBlock)\b[^>]*>$/.test(tag)) continue
    if (/^<CSupport\b[^>]*\/?>$/.test(tag) || /^<\/CSupport>$/.test(tag)) continue

    out.push(stripInlineHtml(line))
  }
  return out.join('\n')
}

// The docs use a few raw HTML inlines where markdown can't express the attribute
// (target="_blank"); flatten them so references stay pure markdown.
function stripInlineHtml(line) {
  return line
    .replace(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, '[$2]($1)')
    .replace(/<code>([\s\S]*?)<\/code>/g, '`$1`')
    .replace(/<br\s*\/?>/g, ' ')
}

function rewriteLinks(body, slug, refPath) {
  const fromDir = dirname(refPath)
  const resolveTarget = (href) => {
    const [pathPart, hash = ''] = href.split('#')
    let s = pathPart.replace(/^\/docs\//, '/').replace(/^\/docs$/, '/')
    if (!s.startsWith('/')) {
      // Relative to the source page's folder.
      const base = slug.includes('/') ? `${dirname(slug)}/` : ''
      s = `/${base}${s}`
    }
    s = s.replace(/^\//, '').replace(/\.md$/, '').replace(/\/$/, '')
    const ref = slugToRef.get(s)
    if (ref) {
      const rel = relative(fromDir, ref) || ref
      return `${rel}${hash ? `#${hash}` : ''}`
    }
    return `${DOCS_URL}/${s}${hash ? `#${hash}` : ''}`
  }

  const lines = body.split('\n')
  let fence = false
  return lines
    .map((line) => {
      if (/^\s*```/.test(line)) fence = !fence
      if (fence) return line
      return line.replace(/\[([^\]]+)\]\((\/[^)\s]*|[a-z0-9][^):\s]*\.md[^)\s]*)\)/g, (full, text, href) => {
        if (/^https?:|^mailto:/.test(href)) return full
        return `[${text}](${resolveTarget(href)})`
      })
    })
    .join('\n')
}

function convert(slug, refPath) {
  const src = readFileSync(join(DOCS, `${slug}.md`), 'utf8')
  const { data, body } = splitFrontmatter(src)
  let md = transformComponents(body)
  md = rewriteLinks(md, slug, refPath)
  md = md.replace(/\n{3,}/g, '\n\n').trim()

  const title = data.title || slug.split('/').pop()
  const header = [`# ${title}`, '']
  if (data.description) header.push(data.description, '')
  header.push(`Source: ${DOCS_URL}/${slug}`, '')

  return { title, description: data.description || '', content: `${header.join('\n')}\n${md}\n` }
}

/* ------------------------------------------------------------------- run --- */

rmSync(REFS_DIR, { recursive: true, force: true })

const index = []
let count = 0
for (const g of groups) {
  const entries = []
  for (const slug of g.files) {
    const refPath = slugToRef.get(slug)
    const { title, description, content } = convert(slug, refPath)
    const dest = join(REFS_DIR, refPath)
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, content)
    entries.push({ refPath, title, description })
    count++
  }
  index.push({ title: g.title, entries })
}

const indexMd = index
  .map(g => [
    `### ${g.title}`,
    '',
    ...g.entries.map(e => `- [${e.title}](references/${e.refPath})${e.description ? ` - ${e.description}` : ''}`),
  ].join('\n'))
  .join('\n\n')

const template = readFileSync(join(ROOT, 'scripts/skill-template.md'), 'utf8')
if (!template.includes('<!-- REFERENCE-INDEX -->')) {
  console.error('scripts/skill-template.md is missing the <!-- REFERENCE-INDEX --> marker')
  process.exit(1)
}
writeFileSync(join(SKILL_DIR, 'SKILL.md'), template.replace('<!-- REFERENCE-INDEX -->', indexMd))

console.log(`Synced ${count} reference pages from ${DOCS}`)
for (const g of index) console.log(`  ${g.title}: ${g.entries.length}`)
