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
import { eventDirectories, findSharedImages, guessedUrls, matchesOpenDataEvent, sameProduction, titledContentImage, isGenericPage, isNonDanceSection, isNonEventPath, pickImage, readMeta, seasonYearInPath, titlesMatch } from '../lib/collecte/images'

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
    imageSource: '',
    imageCredit: '',
    venue: '',
    city: '',
    company: '',
    ticketUrl: '',
    officialUrl: '',
    imageAttempts: 0,
    imageNext: null,
    imageHistory: '',
    imageScore: null,
    imageRightsNote: '',
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

test('les anciennes saisons et les articles sont écartés', () => {
  assert.equal(seasonYearInPath('https://www.operadeparis.fr/saison-15-16/ballet/giselle'), 2015)
  assert.equal(seasonYearInPath('https://www.104.fr/fr/programmation/saison-2025-2026/danse/x'), 2025)
  assert.equal(seasonYearInPath('https://www.chatelet.com/programmation/26-27/hammer/'), 2026)
  assert.equal(seasonYearInPath('https://www.lecarreaudutemple.eu/evenements/border-dance/'), null)
  assert.equal(isNonEventPath('https://www.theatredelaville-paris.com/fr/theatre-sans-frontieres/entretien-avec-x'), true)
  assert.equal(isNonEventPath('https://exemple.fr/entretien/avec-x'), true)
  assert.equal(isNonEventPath('https://www.104.fr/fr/programmation/saison-2025-2026/categorie/x'), true)
})

test('l’apostrophe ne colle pas les mots (« l’Opéra » ≠ « lopera »)', () => {
  assert.equal(titlesMatch("L'Histoire de Manon — Ballet de l'Opéra de Paris", "L'Histoire de Manon - Ballet - Opéra national de Paris"), true)
})

test('sans balise og:image, l’image principale de la page est utilisée (jamais un logo)', () => {
  const html = '<img src="/m/lieu_logo_x.png"><img src="/m/banner_spectacle_radial.png" class="cover"><img src="/m/autre.jpg">'
  assert.equal(pickImage(readMeta(html), 'https://www.festival-automne.com/fr/edition-2026/x'), 'https://www.festival-automne.com/m/banner_spectacle_radial.png')
})

test('l’œuvre peut figurer dans le texte de la page quand le titre ne donne que la compagnie', () => {
  assert.equal(titlesMatch("The Joffrey Ballet — A Midsummer Night's Dream", 'The Joffrey Ballet | Théâtre des Champs-Elysées', "Midsummer Night's Dream d'Alexander Ekman"), true)
  assert.equal(titlesMatch("The Joffrey Ballet — A Midsummer Night's Dream", 'Saison danse | TCE', "The Joffrey Ballet, Midsummer Night's Dream"), false)
})

test('les adresses probables suivent le modèle des pages connues du site', () => {
  const dirs = eventDirectories(['https://www.operadeparis.fr/saison-26-27/ballet/lhistoire-de-manon'])
  assert.deepEqual(dirs, ['https://www.operadeparis.fr/saison-26-27/ballet/'])
  assert.ok(guessedUrls("Kaguyahime — The Tokyo Ballet", dirs).includes('https://www.operadeparis.fr/saison-26-27/ballet/kaguyahime'))
})

test('« Dance » seul ne suffit pas à reconnaître une œuvre', () => {
  assert.equal(titlesMatch('Dance ; HØPE — Lucinda Childs, Alessandro Sciarroni', 'Trisha Brown Dance Company | La Villette', 'avec Lucinda Childs'), false)
})

test('une image dont le nom reprend l’œuvre est acceptée, pas un logo du lieu', () => {
  assert.equal(titledContentImage('<img src="/img/dome-de-paris.png"><img src="/f/4-saisons-pdc-web.jpg">', 'Les Quatre Saisons — Paris Ballet Theatre'), '/f/4-saisons-pdc-web.jpg')
  assert.equal(titledContentImage('<img src="/img/dome-de-paris.png">', 'Le Roi Soleil, le retour — Kamel Ouali'), '')
  assert.ok(guessedUrls('Muette — Boris Charmatz / Terrain (Festival d’Automne)', ['https://www.festival-automne.com/fr/edition-2026/']).includes('https://www.festival-automne.com/fr/edition-2026/boris-charmatz-terrain-muette'))
})

test('même production à d’autres dates ou lieux, sans confondre deux versions d’une œuvre', () => {
  const p = (title: string, venue = '', startDate = '2026-11-12') => ({ title, venue, startDate })
  assert.equal(sameProduction(p('Olivier Dubois — Come Out — Centre des arts d’Enghien-les-Bains'), p('Come Out — Olivier Dubois (MAC Créteil)', 'MAC Créteil', '2027-01-22')), true)
  assert.equal(sameProduction(p("L'Histoire de Manon — Adieux Dorothée Gilbert", 'Palais Garnier'), p("L'Histoire de Manon — Ballet de l'Opéra de Paris", 'Palais Garnier')), true)
  assert.equal(sameProduction(p('Giselle — Johan Inger', 'Palais Garnier', '2027-06-25'), p('Giselle — Ballet de Lettonie', 'Palais des Congrès', '2027-02-01')), false)
  assert.equal(sameProduction(p('Giselle (classique)', 'Palais des Congrès'), p('Giselle — Johan Inger', 'Palais Garnier')), false)
})

test('correspondance open data : même lieu, ou titre quasi identique', () => {
  const rec = (title: string, venue: string, startDate = '2026-11-03') => ({ title, description: '', startDate, endDate: startDate, imageUrl: 'https://cdn.paris.fr/x.jpg', venue, address: '', city: 'Paris' })
  const known = ['Théâtre de la Bastille', 'Opéra Bastille', 'Chaillot']
  assert.equal(matchesOpenDataEvent({ title: 'Ix : variations — Marcos Caramés-Blanco & Sacha Starck', startDate: '2026-11-03', venue: 'Théâtre de la Bastille' }, rec('Ix : variations - Marcos Caramés-Blanco et Sacha Starck', 'Théâtre de la Bastille'), known), true)
  assert.equal(matchesOpenDataEvent({ title: "Le Fantôme de l'Opéra (création française originale)", startDate: '2026-11-03', venue: 'À confirmer' }, rec('Le fantôme de Canterville, spectacle enfants', 'Théâtre X'), known), false)
  assert.equal(matchesOpenDataEvent({ title: 'Casse-Noisette — Ballet Opéra de Paris', startDate: '2026-12-22', venue: 'Opéra Bastille' }, rec('Casse-noisette', 'Théâtre Le 13e Art', '2026-12-03'), known), false)
  assert.equal(matchesOpenDataEvent({ title: 'Lac des Cygnes (ballet en tournée)', startDate: '2027-01-22', venue: 'À confirmer' }, rec('Tchaïkovsky : Le Lac des cygnes par l’Orchestre Colonne', 'Salle Gaveau', '2027-01-20'), known), false)
})

// ─── Score de confiance, file d'attente, fiches vagues ───────────────────────
import { datesIn, datesOverlapPage, isOlderEditionImage, lookupContext, provenanceOf, scorePage, SCORE_PUBLISH, yearsIn } from '../lib/collecte/images'
import { dueForImage, isVagueTitle, nextAttemptDate } from '../lib/collecte/image-pipeline'

test('provenance : site officiel, billetterie, média', () => {
  assert.equal(provenanceOf('https://www.operadeparis.fr/saison-26-27/ballet/giselle', ['operadeparis.fr']), 'officielle')
  assert.equal(provenanceOf('https://www.fnacspectacles.com/event/x', []), 'billetterie')
  assert.equal(provenanceOf('https://sceneweb.fr/autotherapie/', []), 'média ou agrégateur')
  assert.equal(provenanceOf('https://www.paris.fr/evenements/x-1', []), 'open data')
})

test('score : page officielle concordante publiée, média non publié', () => {
  const ctx = lookupContext({ title: 'Giselle — Johan Inger / Ballet de l’Opéra de Paris', startDate: '2027-06-25', venue: 'Opéra Bastille', eventLinks: ['https://www.operadeparis.fr'] })
  const ok = scorePage(ctx, 'https://www.operadeparis.fr/saison-26-27/ballet/giselle', 'Giselle - Ballet - Saison 26/27 - Opéra national de Paris', 'Johan Inger, Opéra Bastille, juin 2027', 'https://x/giselle.jpg', false)
  assert.ok(ok.total >= SCORE_PUBLISH && ok.rightsOk, JSON.stringify(ok))
  const media = scorePage(ctx, 'https://sceneweb.fr/giselle-johan-inger/', 'Giselle de Johan Inger', 'Opéra Bastille 2027', 'https://x/g.jpg', false)
  assert.equal(media.rightsOk, false)
})

test('une affiche d’une édition passée est refusée', () => {
  assert.equal(isOlderEditionImage('https://festivaldedanse-cannes.com/thumbs/Affiche-2025-1920x960.webp', 2026, 2026), true)
  assert.equal(isOlderEditionImage('https://site.fr/wp-content/uploads/2023/11/R-OSA.jpg', 2027, 2026), false)
  assert.deepEqual(yearsIn('saison 2026-2027'), [2026, 2027])
})

test('fiches vagues et délais progressifs de la file d’attente', () => {
  assert.equal(isVagueTitle("Casse-Noisette de Noël (Ballet Opéra National d'Ukraine ou similaire)"), true)
  assert.equal(isVagueTitle('Création Préljocaj — tournée Chaillot'), true)
  assert.equal(isVagueTitle('Giselle — Johan Inger'), false)
  assert.equal(nextAttemptDate('2026-10-14', 1, 'Page officielle inaccessible'), '2026-10-16')
  assert.equal(nextAttemptDate('2026-10-14', 1, 'Aucun visuel'), '2026-10-21')
  assert.equal(nextAttemptDate('2026-10-14', 9, 'Aucun visuel'), '2026-11-11')
})

test('file d’attente : seules les fiches à venir, sans image et dont l’essai est échu', () => {
  const base = { id: 'x', url: '', title: 'Spectacle', startDate: '2026-12-01', endDate: null, sourceId: '', publication: '', locked: false, fingerprint: '', missingSince: null, imageUrl: '', imageSource: '', imageCredit: '', venue: '', city: '', company: '', ticketUrl: '', officialUrl: '', imageAttempts: 0, imageNext: null, imageHistory: '', imageScore: null, imageRightsNote: '', imageStatus: '', imageChecked: null, eventLinks: [], hasManualImage: false }
  assert.equal(dueForImage(base, '2026-10-14'), true)
  assert.equal(dueForImage({ ...base, imageNext: '2026-10-20' }, '2026-10-14'), false)
  assert.equal(dueForImage({ ...base, publication: 'Non confirmé' }, '2026-10-14'), false)
  assert.equal(dueForImage({ ...base, startDate: '2026-09-01' }, '2026-10-14'), false)
})

test('une apostrophe dans une balise ne coupe pas sa valeur', () => {
  const meta = readMeta(`<meta property="og:site_name" content="Festival d'Avignon"><meta content='Le "Lac"' name='description'>`)
  assert.equal(meta['og:site_name'], "Festival d'Avignon")
  assert.equal(meta['description'], 'Le "Lac"')
})

test('dates écrites sur la page : une autre série de représentations est écartée', () => {
  const d = datesIn('Le Lac des Cygnes, du 1 au 16 octobre 2026 au Palais des Congrès. Réservez dès le 12/05/2026.', 2026)
  assert.ok(d.includes('2026-10-01') && d.includes('2026-05-12'), JSON.stringify(d))
  assert.equal(datesOverlapPage(d, '2027-01-22', '2027-02-08'), false)
  assert.equal(datesOverlapPage(d, '2026-10-01', '2026-10-16'), true)
  assert.equal(datesOverlapPage([], '2026-10-01', null), null)
})

test("rectification des dates et du lieu d'après la page officielle", async () => {
  const { factCorrections } = await import("../lib/collecte/image-pipeline")
  const fix = factCorrections(
    { startDate: "2027-03-15", endDate: "2027-03-22", venue: "Chaillot" },
    { startDate: "2027-04-08", endDate: "2027-04-11", venue: "Théâtre de la Ville – Sarah Bernhardt" },
    ["Chaillot", "Théâtre de la Ville"]
  )
  assert.equal(fix?.startDate, "2027-04-08")
  assert.equal(fix?.endDate, "2027-04-11")
  assert.equal(fix?.venue, "Théâtre de la Ville")
  // Lieu inconnu de l'agenda : aucune option inventée.
  const fix2 = factCorrections({ startDate: "2027-01-01", endDate: null, venue: "Chaillot" }, { startDate: "2027-01-01", venue: "Salle inconnue" }, ["Chaillot"])
  assert.equal(fix2, undefined)
  // Même fiche : rien à corriger.
  assert.equal(factCorrections({ startDate: "2026-11-18", endDate: "2026-11-21", venue: "Chaillot" }, { startDate: "2026-11-18", endDate: "2026-11-21", venue: "Théâtre national de Chaillot" }, ["Chaillot"]), undefined)
})

test("correspondance des titres : variantes, nombres, précisions de lieu", async () => {
  const { titlesMatch, isLogoLike, titledContentImage, requiredParts } = await import("../lib/collecte/images")
  assert.ok(titlesMatch("Le Salon revisité — Peeping Tom", "Le Salon revisited – Théâtre du Rond-Point", "Peeping Tom"))
  assert.ok(titlesMatch("Boris Charmatz / Terrain — 10 000 gestes", "10000 gestes Boris Charmatz | Théâtre de chaillot"))
  assert.deepEqual(requiredParts("The Joffrey Ballet — TCE"), [["joffrey"]])
  assert.ok(!titlesMatch("Le Lac des Cygnes — Ballet Preljocaj", "Giselle — Ballet de l'Opéra"))
  // Dossier Drupal « /sites/default/files » : pas une image par défaut.
  assert.equal(isLogoLike("https://theatre-chaillot.fr/sites/default/files/uploads/images/bodysuit.jpg"), false)
  assert.equal(isLogoLike("https://www.laseinemusicale.com/app/uploads/2022/06/LSM-mainvisu.jpg"), true)
  assert.equal(isLogoLike("https://example.fr/img/logos/site.png"), true)
  const html = '<img src="/a/autre-spectacle.jpg" alt="Le Lac des cygnes"><img src="/files/1920x600-danse-summerland.jpg" alt="x">'
  assert.equal(titledContentImage(html, "Summerland — Benjamin Millepied / November Ultra"), "/files/1920x600-danse-summerland.jpg")
  assert.equal(titledContentImage('<img src="/f/visuel.jpg" alt="Barbara, du bout des lèvres">', "Benjamin Millepied — Barbara, Du bout des Lèvres"), "/f/visuel.jpg")
})

test("variantes d'une partie du titre", async () => {
  const { titlesMatch } = await import("../lib/collecte/images")
  assert.ok(titlesMatch("Summerland — Benjamin Millepied / November Ultra", "SUMMERLAND | Folies Bergère", "Summerland - Avec November Ultra"))
  assert.ok(!titlesMatch("Summerland — Benjamin Millepied / November Ultra", "SUMMERLAND | Folies Bergère", "Autre artiste"))
})

test("clé Claude : Anthropic directe ou Vercel AI Gateway", async () => {
  const { claudeEndpoint } = await import("../lib/claude-api")
  const saved = { a: process.env.ANTHROPIC_API_KEY, g: process.env.AI_GATEWAY_API_KEY }
  delete process.env.AI_GATEWAY_API_KEY
  process.env.ANTHROPIC_API_KEY = "vck_abc"
  assert.equal(claudeEndpoint()?.via, "gateway")
  assert.equal(claudeEndpoint()?.model("claude-haiku-4-5-20251001"), "anthropic/claude-haiku-4.5")
  process.env.ANTHROPIC_API_KEY = "sk-ant-abc"
  assert.equal(claudeEndpoint()?.via, "anthropic")
  delete process.env.ANTHROPIC_API_KEY
  process.env.AI_GATEWAY_API_KEY = "vck_abc"
  assert.equal(claudeEndpoint()?.url, "https://ai-gateway.vercel.sh/v1/messages")
  delete process.env.AI_GATEWAY_API_KEY
  assert.equal(claudeEndpoint(), null)
  if (saved.a) process.env.ANTHROPIC_API_KEY = saved.a
  if (saved.g) process.env.AI_GATEWAY_API_KEY = saved.g
})
