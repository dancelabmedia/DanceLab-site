import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  classifyType,
  decidePublication,
  dedupeWithinSource,
  fingerprint,
  isWeeklySlot,
  looksLikeDance,
  nextWeeklyRun,
  sameEvent,
} from '../lib/collecte/rules'
import { normalizeQfapRecord } from '../lib/collecte/sources/que-faire-a-paris'
import { planActions, pendingAfter } from '../lib/collecte/plan'
import { PUBLICATION, type CollectedEvent } from '../lib/collecte/types'
import type { AgendaPage } from '../lib/collecte/notion'
import { findSharedImages, isGenericPage, isNonDanceSection, pickImage, readMeta, titlesMatch } from '../lib/collecte/images'

const TODAY = '2026-10-12'

function event(overrides: Partial<CollectedEvent> = {}): CollectedEvent {
  return {
    sourceId: 'qfap:1',
    sourceName: 'Que faire à Paris',
    sourceLabel: 'Ville de Paris – Que faire à Paris (licence ODbL)',
    sourceUrl: 'https://www.paris.fr/evenements/exemple-1',
    title: 'Spectacle de danse contemporaine',
    description: 'Une création chorégraphique.',
    type: 'Spectacle / Création',
    disciplines: ['Contemporain'],
    startDate: '2026-11-20T19:00:00+00:00',
    endDate: '2026-11-20T21:00:00+00:00',
    hasTime: true,
    schedule: '',
    venue: 'Carreau du Temple',
    address: '4 rue Eugène Spuller',
    postalCode: '75003',
    city: 'Paris',
    latitude: 48.865,
    longitude: 2.36,
    price: '15 €',
    ticketUrl: 'https://billetterie.example/1',
    officialUrl: 'https://www.carreaudutemple.eu/',
    organizer: 'Carreau du Temple',
    taggedDance: true,
    sourceUpdatedAt: '2026-10-01',
    imageUrl: 'https://cdn.paris.fr/qfapv4/exemple.jpg',
    imageCredit: 'Crédit photo',
    imageAlt: 'Affiche du spectacle',
    ...overrides,
  }
}

function page(overrides: Partial<AgendaPage> = {}): AgendaPage {
  return {
    id: 'page-1',
    url: 'https://www.notion.so/page-1',
    title: 'Spectacle de danse contemporaine',
    startDate: '2026-11-20',
    endDate: null,
    sourceId: 'qfap:1',
    publication: PUBLICATION.auto,
    locked: false,
    fingerprint: fingerprint(event()),
    missingSince: null,
    imageUrl: 'https://cdn.paris.fr/qfapv4/exemple.jpg',
    imageStatus: 'Officielle (open data Ville de Paris)',
    imageChecked: null,
    eventLinks: [],
    hasManualImage: false,
    ...overrides,
  }
}

// ─── Règles ───────────────────────────────────────────────────────────────────

test('une fiche complète, taguée danse et à venir est publiée automatiquement', () => {
  assert.deepEqual(decidePublication(event(), TODAY), { status: PUBLICATION.auto, reasons: [] })
})

test('une fiche incomplète ou repérée par mot-clé reste en attente, avec les raisons', () => {
  const d = decidePublication(event({ taggedDance: false, address: '', latitude: null, longitude: null }), TODAY)
  assert.equal(d.status, PUBLICATION.pending)
  assert.equal(d.reasons.length, 3)
})

test('une fiche hors Île-de-France ou sans date ne se publie jamais seule', () => {
  assert.equal(decidePublication(event({ latitude: 43.6, longitude: 3.87 }), TODAY).status, PUBLICATION.pending)
  assert.equal(decidePublication(event({ startDate: null, endDate: null }), TODAY).status, PUBLICATION.pending)
})

test('un événement terminé est archivé', () => {
  assert.equal(decidePublication(event({ startDate: '2026-09-01', endDate: '2026-09-02' }), TODAY).status, PUBLICATION.archived)
})

test('la détection danse écarte les faux positifs connus', () => {
  assert.equal(looksLikeDance('Les soirées cabaret du Bal Blomet'), false)
  assert.equal(looksLikeDance('Battle de puzzle des bibliothèques'), false)
  assert.equal(looksLikeDance('Atelier tarentelle'), true)
  assert.equal(looksLikeDance('Spectacle de danse : Variations'), true)
})

test('le type suit les options existantes de la base Notion', () => {
  assert.equal(classifyType('Workshop Capoeira Angola', '', 'Danse'), 'Stage / Atelier')
  assert.equal(classifyType('« Dancing with Bob » Onstage', '', 'Danse'), 'Spectacle / Création')
  assert.equal(classifyType('Process Dat Sound, un battle de hip-hop', '', 'Danse'), 'Battle / Compétition')
  assert.equal(classifyType('Bal Antillais', '', 'Danse'), 'Bal / Performance gratuite')
})

test('le créneau du lundi 5 h à Paris fonctionne en heure d’été et d’hiver', () => {
  assert.equal(isWeeklySlot(new Date('2026-10-12T03:20:00Z')), true) // été : 5 h 20 à Paris
  assert.equal(isWeeklySlot(new Date('2026-10-12T04:20:00Z')), false) // été : 6 h 20
  assert.equal(isWeeklySlot(new Date('2026-11-02T04:10:00Z')), true) // hiver : 5 h 10
  assert.equal(isWeeklySlot(new Date('2026-11-02T03:10:00Z')), false) // hiver : 4 h 10
  assert.equal(nextWeeklyRun(new Date('2026-10-12T14:00:00Z')), '2026-10-19T03:00:00.000Z')
  assert.equal(nextWeeklyRun(new Date('2026-10-27T10:00:00Z')), '2026-11-02T04:00:00.000Z')
})

test('deux titres proches à la même date sont reconnus comme doublons', () => {
  assert.equal(sameEvent({ title: 'Border Dance', startDate: '2027-04-23' }, { title: 'BORDER DANCE', startDate: '2027-04-23T20:00:00Z' }), true)
  assert.equal(
    sameEvent(
      { title: 'Border Dance, spectacle de Taoufiq Izeddiou au Carreau du Temple', startDate: '2027-04-23' },
      { title: 'Border Dance, spectacle de Taoufiq Izeddiou', startDate: '2027-04-23' }
    ),
    true
  )
  assert.equal(sameEvent({ title: 'Border Dance', startDate: '2027-04-23' }, { title: 'Border Dance', startDate: '2027-04-24' }), false)
  assert.equal(
    sameEvent(
      { title: 'Chill in the City — La Place – Breakleague (Chaillot)', startDate: '2026-12-19', endDate: '2026-12-19' },
      { title: '« Chill in the City » de La Place - Breakleague', startDate: '2026-12-19T14:00:00+00:00' }
    ),
    true
  )
})

test('un titre court n’est pas absorbé par une fiche bien plus détaillée', () => {
  assert.equal(
    sameEvent(
      { title: 'Casse-noisette', startDate: '2026-12-20' },
      { title: "Casse-Noisette de Noël (Ballet Opéra National d'Ukraine ou similaire)", startDate: '2026-12-19', endDate: '2027-01-04' }
    ),
    false
  )
  assert.equal(
    sameEvent(
      { title: 'Casse-noisette', startDate: '2026-12-03', endDate: '2027-01-02' },
      { title: "Casse-Noisette — Ballet Opéra de Paris", startDate: '2026-12-22', endDate: '2027-01-04' }
    ),
    false
  )
})

test('une fiche « saison » ou « festival » générale n’absorbe pas les spectacles qu’elle couvre', () => {
  assert.equal(
    sameEvent(
      { title: "Festival d'Automne à Paris 2026", startDate: '2026-09-08', endDate: '2026-12-31' },
      { title: 'Silence — Mathilde Monnier & Lucie Antunes (Festival d’Automne)', startDate: '2026-10-21' }
    ),
    false
  )
  assert.equal(
    sameEvent(
      { title: 'Saison danse — Théâtre des Abbesses', startDate: '2026-09-15', endDate: '2027-06-30' },
      { title: 'Spectacle de danse au Théâtre des Abbesses', startDate: '2026-11-02' }
    ),
    false
  )
})

test('le dédoublonnage interne garde la version la plus récente', () => {
  const { kept, removed } = dedupeWithinSource([
    event({ sourceId: 'qfap:1', sourceUpdatedAt: '2026-01-01', price: 'ancien' }),
    event({ sourceId: 'qfap:2', sourceUpdatedAt: '2026-06-01', price: 'nouveau' }),
  ])
  assert.equal(removed, 1)
  assert.equal(kept[0].price, 'nouveau')
})

// ─── Normalisation de la source ───────────────────────────────────────────────

test('un enregistrement Que faire à Paris est normalisé sans rien inventer', () => {
  const e = normalizeQfapRecord(
    {
      id: '125033',
      url: 'https://www.paris.fr/evenements/auto-spectacle-a-voir-6-ans-125033',
      title: '« Auto », spectacle à voir 6 ans',
      lead_text: 'Un spectacle entre danse et chant',
      description: '<p>Danse <b>et</b> chant</p>',
      date_start: '2026-11-21T15:00:00+00:00',
      date_end: '2026-11-21T15:45:00+00:00',
      address_name: 'Maison de la musique de Nanterre',
      address_street: '8 rue des Anciennes Mairies',
      address_zipcode: '92000',
      address_city: 'Nanterre',
      lat_lon: { lat: 48.89, lon: 2.2 },
      price_type: 'payant',
      price_detail: 'De 8 à 15 euros.',
      contact_phone: undefined,
      qfap_tags: 'Enfants;Spectacle musical',
      updated_at: '2026-09-30T10:00:00+00:00',
    } as never,
    false
  )!
  assert.equal(e.sourceId, 'qfap:125033')
  assert.equal(e.price, 'De 8 à 15 euros.')
  assert.equal(e.ticketUrl, '')
  assert.equal(e.organizer, '')
  assert.equal(decidePublication(e, TODAY).status, PUBLICATION.pending)
})

test('des coordonnées 0,0 sont traitées comme absentes', () => {
  const e = normalizeQfapRecord({ id: '1', title: 'Danse', lat_lon: { lat: 0, lon: 0 } } as never, true)!
  assert.equal(e.latitude, null)
})

// ─── Plan de synchronisation ──────────────────────────────────────────────────

test('nouvelle entrée → création ; identique → aucune écriture', () => {
  const created = planActions([event()], [], TODAY, ['qfap:'])
  assert.equal(created[0].kind, 'create')
  const same = planActions([event()], [page()], TODAY, ['qfap:'])
  assert.deepEqual(same.map((a) => a.kind), ['unchanged'])
})

test('un changement de tarif ou d’horaire déclenche une mise à jour', () => {
  const actions = planActions([event({ price: '20 €' })], [page()], TODAY, ['qfap:'])
  assert.equal(actions[0].kind, 'update')
})

test('une fiche verrouillée n’est jamais modifiée', () => {
  const actions = planActions([event({ price: '20 €' })], [page({ locked: true })], TODAY, ['qfap:'])
  assert.deepEqual(actions.map((a) => a.kind), ['locked'])
})

test('une validation manuelle n’est pas remise en attente par la collecte', () => {
  const actions = planActions([event({ taggedDance: false })], [page({ publication: PUBLICATION.validated })], TODAY, ['qfap:'])
  assert.deepEqual(actions.map((a) => a.kind), ['unchanged'])
})

test('un événement déjà saisi à la main est signalé comme doublon, sans création', () => {
  const manual = page({ id: 'm', sourceId: '', publication: '', title: 'SPECTACLE DE DANSE CONTEMPORAINE' })
  const actions = planActions([event()], [manual], TODAY, ['qfap:'])
  assert.deepEqual(actions.map((a) => a.kind), ['duplicate'])
})

test('disparue de la source : surveillée, puis en attente après 14 jours, jamais supprimée', () => {
  const first = planActions([], [page()], TODAY, ['qfap:'])
  assert.deepEqual(first.map((a) => a.kind), ['missing-mark'])
  const later = planActions([], [page({ missingSince: '2026-09-20' })], TODAY, ['qfap:'])
  assert.deepEqual(later.map((a) => a.kind), ['missing-pending'])
})

test('si la source est en panne, aucune fiche n’est marquée disparue', () => {
  assert.deepEqual(planActions([], [page()], TODAY, []), [])
})

test('une fiche terminée est archivée', () => {
  const actions = planActions([], [page({ startDate: '2026-09-01' })], TODAY, ['qfap:'])
  assert.deepEqual(actions.map((a) => a.kind), ['archive'])
})

test('le compteur « en attente » reflète l’état après la collecte', () => {
  const pages = [page({ id: 'a', sourceId: 'qfap:a', title: 'A spectacle danse', publication: PUBLICATION.pending })]
  const actions = planActions([event({ sourceId: 'qfap:b', title: 'Autre spectacle', taggedDance: false })], pages, TODAY, ['qfap:'])
  assert.equal(pendingAfter(pages, actions), 2)
})

// ─── Visuels ──────────────────────────────────────────────────────────────────

test('le visuel de la source est repris avec son crédit', () => {
  const e = normalizeQfapRecord(
    { id: '9', title: 'Danse', cover_url: 'http://cdn.paris.fr/a.jpg', cover_credit: '© Photographe', cover_alt: '' } as never,
    true
  )!
  assert.equal(e.imageUrl, 'https://cdn.paris.fr/a.jpg')
  assert.equal(e.imageCredit, '© Photographe')
  assert.equal(e.imageAlt, 'Danse')
})

test('un changement de visuel dans la source déclenche une mise à jour', () => {
  const actions = planActions([event({ imageUrl: 'https://cdn.paris.fr/nouvelle.jpg' })], [page()], TODAY, ['qfap:'])
  assert.equal(actions[0].kind, 'update')
})

test('les pages générales (accueil, saison, programmation) sont refusées', () => {
  assert.equal(isGenericPage('https://www.foliesbergere.com'), true)
  assert.equal(isGenericPage('https://etoiledunord-theatre.mapado.com/en'), true)
  assert.equal(isGenericPage('https://www.lecarreaudutemple.eu/saison/'), true)
  assert.equal(isGenericPage('https://www.104.fr/fr/programmation/saison-2026-2027/danse/sequence-danse-paris-2027'), false)
})

test('la page doit reprendre l’œuvre et l’artiste de la fiche', () => {
  assert.equal(titlesMatch('R.OSA — Silvia Gribaudi', 'R.OSA - Faits d’hiver. Une pièce de Silvia Gribaudi'), true)
  assert.equal(titlesMatch('R.OSA — Silvia Gribaudi', 'R.OSA - Faits d’hiver'), false)
  assert.equal(titlesMatch('Fugaces — Aina Alegre', 'Fugaces — Aina Alegre / CCN de Grenoble | Chaillot'), true)
  assert.equal(titlesMatch('The Last Hamlet — Ben Duke / Lost Dog (Théâtre de la Ville)', 'Focus Ben Duke | Théâtre de la Ville'), false)
  assert.equal(titlesMatch('Olivier Dubois — Come Out — L’Onde Vélizy', 'Come Out - Olivier Dubois - L’Onde'), true)
  assert.equal(titlesMatch('Retour vers le futur, le spectacle musical', 'La Seine Musicale — Accueil'), false)
})

test('les pages d’opéra ou de concert sont écartées', () => {
  assert.equal(isNonDanceSection('https://www.operadeparis.fr/saison-26-27/opera/romeo-et-juliette'), true)
  assert.equal(isNonDanceSection('https://www.operadeparis.fr/saison-26-27/ballet/lhistoire-de-manon'), false)
})

test('les balises og:image sont lues quel que soit l’ordre des attributs', () => {
  const meta = readMeta('<head><meta content="/img/a.jpg" property="og:image"><title>Titre &amp; co</title></head>')
  assert.equal(pickImage(meta, 'https://exemple.fr/page'), 'https://exemple.fr/img/a.jpg')
  assert.equal(meta['html:title'], 'Titre & co')
})

test('un même visuel pour trois événements différents est considéré comme générique', () => {
  const shared = findSharedImages([
    { title: 'Spectacle Alpha', imageUrl: 'https://x/saison.jpg' },
    { title: 'Spectacle Bravo', imageUrl: 'https://x/saison.jpg' },
    { title: 'Spectacle Charlie', imageUrl: 'https://x/saison.jpg' },
    { title: 'Spectacle Delta', imageUrl: 'https://x/delta.jpg' },
  ])
  assert.deepEqual([...shared], ['https://x/saison.jpg'])
})
