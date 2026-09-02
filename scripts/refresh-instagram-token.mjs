#!/usr/bin/env node
/**
 * scripts/refresh-instagram-token.mjs
 *
 * Renouvelle le token Instagram long (valable 60 jours) avant expiration.
 * Le nouveau token est affiché dans le terminal — il faut ensuite le mettre à
 * jour dans les variables d'environnement Vercel.
 *
 * Usage :
 *   node scripts/refresh-instagram-token.mjs
 *
 * Prérequis :
 *   • Le fichier .env.local doit contenir INSTAGRAM_ACCESS_TOKEN
 *     (ou la variable doit être définie dans l'environnement courant)
 *
 * À planifier : tous les 50 jours environ (le token expire après 60 jours).
 */

import { readFileSync } from 'node:fs'
import path             from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Lecture du token ────────────────────────────────────────────────────────

function readToken() {
  // 1. Variable d'environnement directe
  if (process.env.INSTAGRAM_ACCESS_TOKEN) {
    return process.env.INSTAGRAM_ACCESS_TOKEN
  }

  // 2. Fichier .env.local (Next.js)
  const envPath = path.join(__dirname, '..', '.env.local')
  try {
    const content = readFileSync(envPath, 'utf8')
    const match   = content.match(/^INSTAGRAM_ACCESS_TOKEN\s*=\s*(.+)$/m)
    if (match) return match[1].trim()
  } catch {
    // fichier absent ou illisible
  }

  return null
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '═'.repeat(60))
  console.log('🔑 DANCE LAB — Renouvellement du token Instagram')
  console.log('═'.repeat(60) + '\n')

  const currentToken = readToken()
  if (!currentToken) {
    console.error('❌ INSTAGRAM_ACCESS_TOKEN introuvable.')
    console.error('   Vérifie .env.local ou la variable d\'environnement.')
    process.exit(1)
  }

  console.log('📡 Appel à l\'API Graph Instagram...')
  try {
    const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`
    const res = await fetch(url)
    const data = await res.json()

    if (!res.ok || data.error) {
      console.error('❌ Erreur API :', data.error?.message ?? res.status)
      console.error('   Le token est peut-être déjà expiré. Génère-en un nouveau depuis')
      console.error('   https://developers.facebook.com/tools/explorer/')
      process.exit(1)
    }

    const newToken  = data.access_token
    const expiresIn = data.expires_in // secondes

    const expiresDate = new Date(Date.now() + expiresIn * 1000)
    const expiresStr  = expiresDate.toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    })

    console.log('\n✅ Token renouvelé avec succès !')
    console.log(`   Expire le : ${expiresStr}\n`)
    console.log('─'.repeat(60))
    console.log('📋 Nouveau token :')
    console.log(newToken)
    console.log('─'.repeat(60))
    console.log('\n📤 Étapes suivantes :')
    console.log('   1. Copie le token ci-dessus')
    console.log('   2. Dans Vercel → Settings → Environment Variables')
    console.log('      → Mettre à jour INSTAGRAM_ACCESS_TOKEN')
    console.log('   3. Mettre à jour .env.local si tu travailles en local')
    console.log(`\n   ⚠️  Prochain renouvellement avant le ${expiresStr}`)
    console.log('      (lance ce script dans ~50 jours)\n')
  } catch (err) {
    console.error('❌ Erreur réseau :', err.message)
    process.exit(1)
  }
}

main()
