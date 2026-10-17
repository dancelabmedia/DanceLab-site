import { resolveSpecialEventImage } from "../../data/agenda-image-overrides"

export type AgendaCategory =
  | "Festival"
  | "Spectacle"
  | "Battle"
  | "Atelier"
  | "Arts de rue"
  | "Ballet"
  | "Performance"
  | "Rencontre"
  | "Cours / atelier"
  | "Stage / workshop"
  | "Bal / soirée"
  | "Conférence / rencontre"
  | "Exposition"
  | "Cabaret & dîner-spectacle"
  | "Comédie musicale"

export type AgendaStatus = "En cours" | "À venir" | "Complet" | "Reporté" | "Annulé"

/**
 * Un membre de la distribution ou de l'équipe artistique/technique.
 * - `name`      : nom complet de la personne
 * - `role`      : fonction exacte (ex. "Chorégraphie", "Mise en scène", "Interprète")
 * - `character` : personnage interprété, uniquement pour les spectacles narratifs
 */
export type CastMember = {
  name: string
  role: string
  character?: string
}

/**
 * Une étape de tournée : même production dans une ville différente.
 * Permet de structurer un spectacle → étapes → représentations
 * sans créer de doublons artistiques dans le catalogue.
 */
export type TourStop = {
  /** Ville de l'étape */
  city: string
  /** Salle exacte */
  venue: string
  address?: string
  postalCode?: string
  latitude?: number
  longitude?: number
  /** Date de début de l'étape (ISO YYYY-MM-DD) */
  startDate: string
  endDate?: string
  /** Horaire par défaut */
  time?: string
  /** Tarif pour cette étape */
  price?: string
  /** Lien billetterie de cette étape */
  ticketUrl?: string
  status?: AgendaStatus
  /** Liste des représentations individuelles */
  performances?: Array<{ date: string; time?: string; ticketUrl?: string }>
}

export type AgendaEvent = {
  slug: string
  title: string
  description: string
  image?: string
  gallery?: string[]
  videoUrl?: string
  duration?: string
  dates: string
  startDate: string
  endDate?: string
  venue: string
  address?: string
  city: string
  postalCode?: string
  latitude?: number
  longitude?: number
  price: string
  time?: string
  category: AgendaCategory
  disciplines?: string[]
  officialUrl: string
  ticketUrl?: string
  additionalInfo?: Array<{ label: string; value: string }>
  source: string
  sourceLabel: string
  lastVerifiedAt: string
  status: AgendaStatus
  isRecurring?: boolean
  programmingId?: string
  productionId?: string
  canonicalKey?: string
  canonicalSourceId?: string
  sourceIds?: string[]
  sourceUrls?: string[]
  aliasSlugs?: string[]
  performances?: Array<{ date: string; time?: string; ticketUrl?: string }>
  /**
   * Étapes de tournée : liste des villes/salles où le spectacle est présenté.
   * Chaque étape possède ses propres dates, billetterie et lieu.
   * Permet d'afficher « Toutes les dates de la tournée » sur la fiche.
   */
  tourStops?: TourStop[]
  sourceRecords?: Array<Omit<AgendaEvent, 'sourceRecords'>>
  /**
   * Distribution complète et équipe artistique/technique.
   * Chaque entrée représente une personne avec son rôle exact.
   * Les personnages sont renseignés pour les spectacles narratifs.
   */
  cast?: CastMember[]
}

export type ResolvedAgendaLocation = {
  latitude?: number
  longitude?: number
  label: string
  isComplete: boolean
}

/**
 * Coordonnées GPS des villes françaises (+ DOM-TOM).
 * Utilisé pour :
 *  – le fallback de géolocalisation des événements sans coordonnées exactes
 *  – le filtre « Rayon géographique » (Haversine) dans l'interface Sortir
 *
 * Clés normalisées : minuscules, sans diacritiques, trim.
 */
export const CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  // ── Grandes métropoles ───────────────────────────────────────────────────
  paris:                  { latitude: 48.8566,  longitude: 2.3522  },
  marseille:              { latitude: 43.2965,  longitude: 5.3698  },
  lyon:                   { latitude: 45.7640,  longitude: 4.8357  },
  toulouse:               { latitude: 43.6047,  longitude: 1.4442  },
  bordeaux:               { latitude: 44.8378,  longitude: -0.5792 },
  nantes:                 { latitude: 47.2184,  longitude: -1.5536 },
  strasbourg:             { latitude: 48.5734,  longitude: 7.7521  },
  montpellier:            { latitude: 43.6119,  longitude: 3.8772  },
  rennes:                 { latitude: 48.1173,  longitude: -1.6778 },
  lille:                  { latitude: 50.6292,  longitude: 3.0573  },
  nice:                   { latitude: 43.7102,  longitude: 7.2620  },
  grenoble:               { latitude: 45.1885,  longitude: 5.7245  },
  reims:                  { latitude: 49.2583,  longitude: 4.0317  },
  toulon:                 { latitude: 43.1242,  longitude: 5.9280  },
  "saint-etienne":        { latitude: 45.4397,  longitude: 4.3872  },
  "clermont-ferrand":     { latitude: 45.7797,  longitude: 3.0863  },
  dijon:                  { latitude: 47.3220,  longitude: 5.0415  },
  tours:                  { latitude: 47.3941,  longitude: 0.6848  },
  orleans:                { latitude: 47.9029,  longitude: 1.9039  },
  angers:                 { latitude: 47.4784,  longitude: -0.5632 },
  metz:                   { latitude: 49.1193,  longitude: 6.1757  },
  nancy:                  { latitude: 48.6921,  longitude: 6.1844  },
  brest:                  { latitude: 48.3905,  longitude: -4.4860 },
  "le havre":             { latitude: 49.4938,  longitude: 0.1077  },
  "le mans":              { latitude: 48.0061,  longitude: 0.1996  },
  caen:                   { latitude: 49.1829,  longitude: -0.3707 },
  amiens:                 { latitude: 49.8941,  longitude: 2.2958  },
  perpignan:              { latitude: 42.6887,  longitude: 2.8948  },
  nimes:                  { latitude: 43.8369,  longitude: 4.3601  },
  "aix-en-provence":      { latitude: 43.5297,  longitude: 5.4474  },
  avignon:                { latitude: 43.9493,  longitude: 4.8055  },
  rouen:                  { latitude: 49.4432,  longitude: 1.0999  },
  // ── Villes moyennes ───────────────────────────────────────────────────────
  pau:                    { latitude: 43.2951,  longitude: -0.3708 },
  biarritz:               { latitude: 43.4832,  longitude: -1.5586 },
  bayonne:                { latitude: 43.4923,  longitude: -1.4750 },
  angouleme:              { latitude: 45.6500,  longitude: 0.1564  },
  limoges:                { latitude: 45.8336,  longitude: 1.2611  },
  poitiers:               { latitude: 46.5802,  longitude: 0.3404  },
  "la rochelle":          { latitude: 46.1591,  longitude: -1.1520 },
  besancon:               { latitude: 47.2380,  longitude: 6.0243  },
  mulhouse:               { latitude: 47.7508,  longitude: 7.3359  },
  colmar:                 { latitude: 48.0793,  longitude: 7.3585  },
  valenciennes:           { latitude: 50.3574,  longitude: 3.5237  },
  dunkerque:              { latitude: 51.0343,  longitude: 2.3768  },
  calais:                 { latitude: 50.9513,  longitude: 1.8587  },
  roubaix:                { latitude: 50.6947,  longitude: 3.1747  },
  tourcoing:              { latitude: 50.7235,  longitude: 3.1561  },
  arras:                  { latitude: 50.2918,  longitude: 2.7812  },
  "saint-malo":           { latitude: 48.6496,  longitude: -2.0254 },
  lorient:                { latitude: 47.7482,  longitude: -3.3649 },
  quimper:                { latitude: 47.9961,  longitude: -4.0975 },
  chartres:               { latitude: 48.4469,  longitude: 1.4900  },
  cherbourg:              { latitude: 49.6337,  longitude: -1.6229 },
  laval:                  { latitude: 48.0733,  longitude: -0.7693 },
  troyes:                 { latitude: 48.2973,  longitude: 4.0744  },
  "saint-quentin":        { latitude: 49.8492,  longitude: 3.2858  },
  chambery:               { latitude: 45.5646,  longitude: 5.9178  },
  annecy:                 { latitude: 45.8992,  longitude: 6.1294  },
  vichy:                  { latitude: 46.1236,  longitude: 3.4267  },
  thiers:                 { latitude: 45.8551,  longitude: 3.5427  },
  montauban:              { latitude: 44.0178,  longitude: 1.3525  },
  albi:                   { latitude: 43.9293,  longitude: 2.1481  },
  tarbes:                 { latitude: 43.2337,  longitude: 0.0736  },
  cannes:                 { latitude: 43.5528,  longitude: 7.0174  },
  antibes:                { latitude: 43.5808,  longitude: 7.1239  },
  "saint-tropez":         { latitude: 43.2677,  longitude: 6.6402  },
  gap:                    { latitude: 44.5594,  longitude: 6.0773  },
  digne:                  { latitude: 44.0924,  longitude: 6.2361  },
  arles:                  { latitude: 43.6767,  longitude: 4.6278  },
  martigues:              { latitude: 43.4057,  longitude: 5.0495  },
  aubagne:                { latitude: 43.2945,  longitude: 5.5717  },
  "la ciotat":            { latitude: 43.1734,  longitude: 5.6041  },
  vitrolles:              { latitude: 43.4602,  longitude: 5.2486  },
  istres:                 { latitude: 43.5131,  longitude: 4.9896  },
  salon:                  { latitude: 43.6396,  longitude: 5.0978  },
  montbeliard:            { latitude: 47.5097,  longitude: 6.8024  },
  belfort:                { latitude: 47.6380,  longitude: 6.8638  },
  bourg:                  { latitude: 46.2050,  longitude: 5.2258  },
  "bourg-en-bresse":      { latitude: 46.2050,  longitude: 5.2258  },
  valence:                { latitude: 44.9334,  longitude: 4.8924  },
  vienne:                 { latitude: 45.5226,  longitude: 4.8726  },
  roanne:                 { latitude: 46.0348,  longitude: 4.0614  },
  "saint-chamond":        { latitude: 45.4786,  longitude: 4.5153  },
  saintes:                { latitude: 45.7471,  longitude: -0.6327 },
  rochefort:              { latitude: 45.9422,  longitude: -0.9612 },
  niort:                  { latitude: 46.3238,  longitude: -0.4638 },
  vendome:                { latitude: 47.7928,  longitude: 1.0657  },
  saumur:                 { latitude: 47.2600,  longitude: -0.0751 },
  "cholet":               { latitude: 47.0601,  longitude: -0.8780 },
  "saint-brieuc":         { latitude: 48.5141,  longitude: -2.7663 },
  vannes:                 { latitude: 47.6586,  longitude: -2.7600 },
  fougeres:               { latitude: 48.3511,  longitude: -1.2051 },
  evreux:                 { latitude: 49.0236,  longitude: 1.1502  },
  dieppe:                 { latitude: 49.9234,  longitude: 1.0815  },
  alençon:                { latitude: 48.4316,  longitude: 0.0931  },
  // ── Banlieue parisienne ───────────────────────────────────────────────────
  suresnes:               { latitude: 48.8715,  longitude: 2.2293  },
  "boulogne-billancourt": { latitude: 48.8357,  longitude: 2.2375  },
  nanterre:               { latitude: 48.8924,  longitude: 2.2046  },
  versailles:             { latitude: 48.8014,  longitude: 2.1301  },
  "saint-denis":          { latitude: 48.9362,  longitude: 2.3574  },
  montreuil:              { latitude: 48.8638,  longitude: 2.4441  },
  aubervilliers:          { latitude: 48.9170,  longitude: 2.3845  },
  bobigny:                { latitude: 48.9100,  longitude: 2.4411  },
  creteil:                { latitude: 48.7838,  longitude: 2.4580  },
  "vitry-sur-seine":      { latitude: 48.7892,  longitude: 2.3997  },
  "choisy-le-roi":        { latitude: 48.7663,  longitude: 2.4078  },
  "ivry-sur-seine":       { latitude: 48.8157,  longitude: 2.3862  },
  "bagneux":              { latitude: 48.7966,  longitude: 2.3048  },
  gennevilliers:          { latitude: 48.9282,  longitude: 2.2977  },
  vanves:                 { latitude: 48.8228,  longitude: 2.2978  },
  "fontenay-sous-bois":   { latitude: 48.8531,  longitude: 2.4813  },
  vincennes:              { latitude: 48.8477,  longitude: 2.4395  },
  pantin:                 { latitude: 48.8972,  longitude: 2.4080  },
  bagnolet:               { latitude: 48.8682,  longitude: 2.4192  },
  "saint-ouen":           { latitude: 48.9093,  longitude: 2.3340  },
  bondy:                  { latitude: 48.9033,  longitude: 2.4826  },
  // ── Banlieue lyonnaise ────────────────────────────────────────────────────
  villeurbanne:           { latitude: 45.7666,  longitude: 4.8793  },
  venissieux:             { latitude: 45.6965,  longitude: 4.8946  },
  "saint-priest":         { latitude: 45.6949,  longitude: 5.0983  },
  // ── Banlieue bordelaise ───────────────────────────────────────────────────
  merignac:               { latitude: 44.8416,  longitude: -0.6435 },
  pessac:                 { latitude: 44.8077,  longitude: -0.6307 },
  // ── Corse ────────────────────────────────────────────────────────────────
  ajaccio:                { latitude: 41.9192,  longitude: 8.7386  },
  bastia:                 { latitude: 42.6976,  longitude: 9.4508  },
  // ── DOM-TOM ───────────────────────────────────────────────────────────────
  "fort-de-france":       { latitude: 14.6037,  longitude: -61.0724 },
  "pointe-a-pitre":       { latitude: 16.2422,  longitude: -61.5330 },
  "saint-denis-de-la-reunion": { latitude: -20.8823, longitude: 55.4504 },
  cayenne:                { latitude: 4.9224,   longitude: -52.3135 },
  "saint-pierre":         { latitude: -21.3419, longitude: 55.4781 },
  // ── Divers (présents dans les données sources) ────────────────────────────
  "vendée / loire-atlantique": { latitude: 46.697, longitude: -1.94 },
}

/**
 * Coordonnées GPS exactes des principales salles de spectacle.
 * Utilisé comme fallback entre les coordonnées event et les coordonnées de ville.
 * Clés normalisées : toLowerCase + suppression diacritiques + trim.
 */
const VENUE_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  // ── Opéra national de Paris ──────────────────────────────────────────────
  "opera bastille":                   { latitude: 48.8527, longitude: 2.3694 },
  "palais garnier":                   { latitude: 48.8723, longitude: 2.3316 },
  "opera de paris":                   { latitude: 48.8723, longitude: 2.3316 },
  "opera national de paris":          { latitude: 48.8723, longitude: 2.3316 },
  // ── Danse / Scène nationale ──────────────────────────────────────────────
  "theatre national de chaillot":     { latitude: 48.8623, longitude: 2.2887 },
  "theatre de chaillot":              { latitude: 48.8623, longitude: 2.2887 },
  "chaillot":                         { latitude: 48.8623, longitude: 2.2887 },
  "theatre de la ville":              { latitude: 48.8530, longitude: 2.3471 },
  "theatre de la ville paris":        { latitude: 48.8530, longitude: 2.3471 },
  "les abbesses":                     { latitude: 48.8844, longitude: 2.3389 },
  "espace cardin":                    { latitude: 48.8653, longitude: 2.3199 },
  "theatre sarah bernhardt":          { latitude: 48.8530, longitude: 2.3471 },
  "le centquatre":                    { latitude: 48.8849, longitude: 2.3689 },
  "104 paris":                        { latitude: 48.8849, longitude: 2.3689 },
  "le 104":                           { latitude: 48.8849, longitude: 2.3689 },
  "centquatre":                       { latitude: 48.8849, longitude: 2.3689 },
  "philharmonie de paris":            { latitude: 48.8892, longitude: 2.3938 },
  "cite de la musique":               { latitude: 48.8892, longitude: 2.3938 },
  "centre national de la danse":      { latitude: 48.8963, longitude: 2.4053 },
  "cnd":                              { latitude: 48.8963, longitude: 2.4053 },
  "atelier de paris":                 { latitude: 48.8432, longitude: 2.3699 },
  "atelier de paris cdcn":            { latitude: 48.8432, longitude: 2.3699 },
  "mc93":                             { latitude: 48.9100, longitude: 2.4411 },
  "maison de la culture de seine-saint-denis": { latitude: 48.9100, longitude: 2.4411 },
  "theatre jean vilar vitry":         { latitude: 48.7878, longitude: 2.3930 },
  "theatre jean vilar":               { latitude: 48.7878, longitude: 2.3930 },
  "maison des arts de creteil":       { latitude: 48.7838, longitude: 2.4560 },
  "mac creteil":                      { latitude: 48.7838, longitude: 2.4560 },
  "theatre de gennevilliers":         { latitude: 48.9282, longitude: 2.2977 },
  "t2g":                              { latitude: 48.9282, longitude: 2.2977 },
  "theatre de vanves":                { latitude: 48.8228, longitude: 2.2978 },
  "theatre paul eluard choisy":       { latitude: 48.7608, longitude: 2.4058 },
  "theatre jean-claude carriere":     { latitude: 43.6119, longitude: 3.8772 },
  "espace 1789":                      { latitude: 48.9097, longitude: 2.3344 },
  "nouveau gymnase":                  { latitude: 48.9097, longitude: 2.3344 },
  "fondation fiminco":                { latitude: 48.8775, longitude: 2.4533 },
  "l'onde":                           { latitude: 48.7768, longitude: 2.1936 },
  "onde velizy":                      { latitude: 48.7768, longitude: 2.1936 },
  "theatre jean vilar suresnes":      { latitude: 48.8684, longitude: 2.2268 },
  "theatre de suresnes":              { latitude: 48.8684, longitude: 2.2268 },
  "grande halle de la villette":      { latitude: 48.8938, longitude: 2.3914 },
  "la villette":                      { latitude: 48.8938, longitude: 2.3914 },
  // ── Comédie musicale / Spectacle ────────────────────────────────────────
  "theatre mogador":                  { latitude: 48.8750, longitude: 2.3292 },
  "mogador":                          { latitude: 48.8750, longitude: 2.3292 },
  "theatre du chatelet":              { latitude: 48.8592, longitude: 2.3469 },
  "le chatelet":                      { latitude: 48.8592, longitude: 2.3469 },
  "theatre des champs-elysees":       { latitude: 48.8666, longitude: 2.3019 },
  "la seine musicale":                { latitude: 48.8296, longitude: 2.2197 },
  "seine musicale":                   { latitude: 48.8296, longitude: 2.2197 },
  "theatre marigny":                  { latitude: 48.8678, longitude: 2.3128 },
  "dome de paris":                    { latitude: 48.8349, longitude: 2.2882 },
  "palais des sports":                { latitude: 48.8349, longitude: 2.2882 },
  "olympia":                          { latitude: 48.8710, longitude: 2.3285 },
  // ── Cabarets ────────────────────────────────────────────────────────────
  "moulin rouge":                     { latitude: 48.8841, longitude: 2.3322 },
  "paradis latin":                    { latitude: 48.8501, longitude: 2.3538 },
  "crazy horse":                      { latitude: 48.8659, longitude: 2.3042 },
  "la nouvelle eve":                  { latitude: 48.8811, longitude: 2.3343 },
  "casino de paris":                  { latitude: 48.8793, longitude: 2.3316 },
  "lido de paris":                    { latitude: 48.8716, longitude: 2.3043 },
  // ── La Place / Hip-Hop ───────────────────────────────────────────────────
  "la place":                         { latitude: 48.8747, longitude: 2.3633 },
  // ── Marseille ────────────────────────────────────────────────────────────
  "klap maison pour la danse":        { latitude: 43.2965, longitude: 5.3697 },
  "klap":                             { latitude: 43.2965, longitude: 5.3697 },
  "ballet national de marseille":     { latitude: 43.2948, longitude: 5.3748 },
  "bnm":                              { latitude: 43.2948, longitude: 5.3748 },
  "la criee":                         { latitude: 43.2900, longitude: 5.3610 },
  "theatre national de marseille la criee": { latitude: 43.2900, longitude: 5.3610 },
  "le zef":                           { latitude: 43.3100, longitude: 5.3850 },
  "zef scene nationale":              { latitude: 43.3100, longitude: 5.3850 },
  "scene nationale de marseille":     { latitude: 43.3100, longitude: 5.3850 },
  "theatre joliette":                 { latitude: 43.2980, longitude: 5.3460 },
  "friche la belle de mai":           { latitude: 43.3108, longitude: 5.3936 },
  "friche belle de mai":              { latitude: 43.3108, longitude: 5.3936 },
  "cepac silo":                       { latitude: 43.3018, longitude: 5.3380 },
  "le silo":                          { latitude: 43.3018, longitude: 5.3380 },
  "theatre du gymnase":               { latitude: 43.2955, longitude: 5.3785 },
  "gymnase marie bell":               { latitude: 43.2955, longitude: 5.3785 },
  "opera de marseille":               { latitude: 43.2970, longitude: 5.3822 },
  "dome de marseille":                { latitude: 43.2945, longitude: 5.3750 },
  "espace julien":                    { latitude: 43.3003, longitude: 5.3911 },
  "alkazar":                          { latitude: 43.2968, longitude: 5.3817 },
  "theatre de la criee":              { latitude: 43.2900, longitude: 5.3610 },
  // ── Aix-en-Provence ──────────────────────────────────────────────────────
  "grand theatre de provence":        { latitude: 43.5299, longitude: 5.4430 },
  "pavillon noir":                    { latitude: 43.5350, longitude: 5.4260 },
  "ballet preljocaj":                 { latitude: 43.5350, longitude: 5.4260 },
  "opera aix-en-provence":            { latitude: 43.5283, longitude: 5.4399 },
  "theatre du jeu de paume":          { latitude: 43.5283, longitude: 5.4399 },
  // ── Lyon ─────────────────────────────────────────────────────────────────
  "opera de lyon":                    { latitude: 45.7678, longitude: 4.8337 },
  "maison de la danse":               { latitude: 45.7480, longitude: 4.8576 },
  "theatre national populaire":       { latitude: 45.7649, longitude: 4.8119 },
  "tnp":                              { latitude: 45.7649, longitude: 4.8119 },
  "theatre de la croix rousse":       { latitude: 45.7716, longitude: 4.8289 },
  "halle tony garnier":               { latitude: 45.7303, longitude: 4.8222 },
  "transbordeur":                     { latitude: 45.7803, longitude: 4.8711 },
  // ── Toulouse ─────────────────────────────────────────────────────────────
  "theatre du capitole":              { latitude: 43.6045, longitude: 1.4433 },
  "les abattoirs":                    { latitude: 43.5999, longitude: 1.4308 },
  "theatre garonne":                  { latitude: 43.5993, longitude: 1.4335 },
  "zenith de toulouse":               { latitude: 43.6110, longitude: 1.4575 },
  "usine":                            { latitude: 43.5893, longitude: 1.4325 },
  // ── Bordeaux ─────────────────────────────────────────────────────────────
  "opera national de bordeaux":       { latitude: 44.8397, longitude: -0.5775 },
  "theatre national de bordeaux en aquitaine": { latitude: 44.8385, longitude: -0.5773 },
  "tnba":                             { latitude: 44.8385, longitude: -0.5773 },
  "arkea arena":                      { latitude: 44.8360, longitude: -0.6545 },
  "zenith de bordeaux":               { latitude: 44.8360, longitude: -0.6545 },
  "theatre femina":                   { latitude: 44.8419, longitude: -0.5769 },
  "rock school barbey":               { latitude: 44.8278, longitude: -0.5715 },
  // ── Lille ─────────────────────────────────────────────────────────────────
  "opera de lille":                   { latitude: 50.6353, longitude: 3.0609 },
  "theatre du nord":                  { latitude: 50.6374, longitude: 3.0617 },
  "tripostal":                        { latitude: 50.6397, longitude: 3.0652 },
  "zenith arena":                     { latitude: 50.6125, longitude: 3.1218 },
  "maison de la culture de lille":    { latitude: 50.6303, longitude: 3.0492 },
  // ── Strasbourg ────────────────────────────────────────────────────────────
  "opera national du rhin":           { latitude: 48.5802, longitude: 7.7422 },
  "theatre national de strasbourg":   { latitude: 48.5841, longitude: 7.7390 },
  "tns":                              { latitude: 48.5841, longitude: 7.7390 },
  "zenith de strasbourg":             { latitude: 48.5501, longitude: 7.7355 },
  // ── Nantes ───────────────────────────────────────────────────────────────
  "theatre de nantes":                { latitude: 47.2148, longitude: -1.5587 },
  "zenith de nantes":                 { latitude: 47.2424, longitude: -1.5496 },
  "lieu unique":                      { latitude: 47.2119, longitude: -1.5450 },
  // ── Montpellier ───────────────────────────────────────────────────────────
  "opera comedie":                    { latitude: 43.6093, longitude: 3.8784 },
  "opera de montpellier":             { latitude: 43.6093, longitude: 3.8784 },
  "agora pole national cirque":       { latitude: 43.6003, longitude: 3.8714 },
  // ── Rennes ───────────────────────────────────────────────────────────────
  "opera de rennes":                  { latitude: 48.1127, longitude: -1.6757 },
  "theatre national de bretagne":     { latitude: 48.1080, longitude: -1.6798 },
  "tnb":                              { latitude: 48.1080, longitude: -1.6798 },
  "le triangle":                      { latitude: 48.0965, longitude: -1.6746 },
  // ── Nice ─────────────────────────────────────────────────────────────────
  "opera de nice":                    { latitude: 43.6953, longitude: 7.2760 },
  "theatre national de nice":         { latitude: 43.7034, longitude: 7.2689 },
  "tnn":                              { latitude: 43.7034, longitude: 7.2689 },
  "acropolis nice":                   { latitude: 43.6925, longitude: 7.2812 },
  // ── Nancy / Metz ─────────────────────────────────────────────────────────
  "ballet de lorraine":               { latitude: 48.6940, longitude: 6.1810 },
  "ccn ballet de lorraine":           { latitude: 48.6940, longitude: 6.1810 },
  "opera national de lorraine":       { latitude: 48.6930, longitude: 6.1793 },
  "arsenal metz":                     { latitude: 49.1197, longitude: 6.1762 },
  "opera-theatre de metz":            { latitude: 49.1191, longitude: 6.1758 },
  // ── Biarritz ─────────────────────────────────────────────────────────────
  "malandain ballet biarritz":        { latitude: 43.4876, longitude: -1.5591 },
  "theatre du casino de biarritz":    { latitude: 43.4836, longitude: -1.5561 },
  // ── Nationaux / CCN / CDCN ───────────────────────────────────────────────
  "choreographiques":                 { latitude: 48.8566, longitude: 2.3522 },
  "stadium de toulouse":              { latitude: 43.5815, longitude: 1.4341 },
  "accord arena":                     { latitude: 48.8393, longitude: 2.3774 },
  "bercy arena":                      { latitude: 48.8393, longitude: 2.3774 },
  "zenith paris":                     { latitude: 48.8939, longitude: 2.3948 },
}

export function normalizeCity(city: string) {
  return city
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

/**
 * Calcule la distance en kilomètres entre deux points GPS (formule Haversine).
 */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Résout les coordonnées d'un événement ou d'une étape de tournée,
 * avec fallback salle → ville → null.
 */
export function resolveEventCoordinates(
  lat: number | undefined,
  lon: number | undefined,
  venue: string,
  city: string,
): { latitude: number; longitude: number } | null {
  if (hasValidCoordinates(lat, lon)) return { latitude: lat!, longitude: lon! }
  const venueCoords = lookupVenueCoordinates(venue)
  if (venueCoords) return venueCoords
  const cityCoords = CITY_COORDINATES[normalizeCity(city)]
  if (cityCoords) return cityCoords
  return null
}

/**
 * Normalise un nom de salle pour la recherche dans VENUE_COORDINATES :
 * minuscules + suppression des diacritiques + trim.
 */
function normalizeVenue(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

/**
 * Cherche les coordonnées d'une salle dans VENUE_COORDINATES.
 * Essaie d'abord la correspondance exacte, puis cherche si la clé est contenue
 * dans le nom de salle normalisé (match partiel).
 */
function lookupVenueCoordinates(venue: string) {
  if (!venue) return null
  const key = normalizeVenue(venue)
  // 1. Correspondance exacte
  if (VENUE_COORDINATES[key]) return VENUE_COORDINATES[key]
  // 2. Correspondance partielle : la clé est contenue dans le nom
  for (const [pattern, coords] of Object.entries(VENUE_COORDINATES)) {
    if (key.includes(pattern) || pattern.includes(key)) return coords
  }
  return null
}

/**
 * Retourne la date du jour au format YYYY-MM-DD en fuseau Europe/Paris.
 *
 * ⚠️ On utilise explicitement Europe/Paris et non UTC : en hiver Paris est UTC+1,
 * en été UTC+2. Si on utilisait toISOString() (UTC), à 23h15 heure de Paris le soir
 * de la dernière représentation, la date UTC serait déjà le lendemain et le spectacle
 * serait incorrectement marqué "terminé" alors qu'il est encore en cours.
 */
export function todayIso(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" })
}

/**
 * Retourne la date de fin effective d'un événement en tenant compte des
 * étapes de tournée (tourStops) : si des étapes futures existent, on utilise
 * la date de fin de la dernière étape future plutôt que event.endDate.
 */
function effectiveEndDate(event: AgendaEvent, asOf: string): string | undefined {
  if (event.tourStops?.length) {
    const futureStops = event.tourStops.filter(s => (s.endDate ?? s.startDate) >= asOf)
    if (futureStops.length > 0) {
      const lastStop = futureStops.reduce((latest, s) => {
        const d = s.endDate ?? s.startDate
        return d > (latest.endDate ?? latest.startDate) ? s : latest
      })
      return lastStop.endDate ?? lastStop.startDate
    }
  }
  return event.endDate
}

function isPastEvent(event: AgendaEvent): boolean {
  // Les shows récurrents (cabarets permanents) ne sont jamais considérés comme passés
  if (event.isRecurring) return false
  const asOf = todayIso()
  const end = effectiveEndDate(event, asOf)
  return Boolean(end ? end < asOf : event.startDate < asOf)
}

/**
 * Retourne true si un événement est dans ses "Dernières représentations" :
 * – il a déjà commencé (startDate ≤ aujourd'hui)
 * – il lui reste 7 jours ou moins avant sa dernière représentation confirmée
 * – les shows récurrents sans date de fin ne sont jamais concernés
 * – prend en compte tourStops pour les tournées
 */
export function isLastChance(event: AgendaEvent, asOf = todayIso()): boolean {
  if (event.isRecurring) return false
  if (event.startDate > asOf) return false   // pas encore commencé
  const end = effectiveEndDate(event, asOf)
  if (!end) return false
  const msLeft = new Date(end).getTime() - new Date(asOf).getTime()
  const daysLeft = Math.ceil(msLeft / 86_400_000)
  return daysLeft >= 0 && daysLeft <= 7
}

/**
 * Badge d'urgence pour les événements approchant de leur fin.
 *
 * Logique :
 *   > 7 jours restants          → null (affichage normal)
 *   1–7 jours                   → "DERNIÈRES DATES"
 *   Dernier jour (0 j restants) → "DERNIER JOUR"
 *   Seule représentation future → "DERNIÈRE REPR."
 *     (une date unique dans `performances`, ou endDate === startDate et c'est aujourd'hui)
 *
 * Ne jamais afficher "DERNIÈRE REPR." si plusieurs représentations sont encore
 * prévues le même jour (formule matin/soir par exemple).
 */
export type UrgencyLevel = "dernieres-dates" | "dernier-jour" | "derniere-repr"

export function getUrgencyBadge(
  event: AgendaEvent,
  asOf = todayIso()
): { label: string; level: UrgencyLevel } | null {
  if (event.isRecurring) return null
  if (event.startDate > asOf) return null   // pas encore commencé

  const end = effectiveEndDate(event, asOf)
  if (!end) return null

  const msLeft = new Date(end).getTime() - new Date(asOf).getTime()
  const daysLeft = Math.ceil(msLeft / 86_400_000)

  if (daysLeft < 0) return null  // déjà terminé (ne devrait pas arriver ici)
  if (daysLeft > 7) return null  // trop loin

  // ── Cas : dernière représentation unique ──────────────────────────────────
  // On détecte si une seule représentation reste dans le futur.
  if (event.performances?.length) {
    const futurePerfs = event.performances.filter(p => p.date >= asOf)
    if (futurePerfs.length === 1) {
      return { label: "DERNIÈRE REPR.", level: "derniere-repr" }
    }
    // Plusieurs représentations restantes → "Dernier jour" ou "Dernières dates"
  } else if (daysLeft === 0 && event.startDate === end) {
    // Événement d'une seule journée sans liste de performances → dernière repr.
    return { label: "DERNIÈRE REPR.", level: "derniere-repr" }
  }

  // ── Cas : dernier jour ────────────────────────────────────────────────────
  if (daysLeft === 0) {
    return { label: "DERNIER JOUR", level: "dernier-jour" }
  }

  // ── Cas : 1–7 jours restants ──────────────────────────────────────────────
  return { label: "DERNIÈRES DATES", level: "dernieres-dates" }
}

export function formatAgendaDate(date: string) {
  const [year, month, day] = date.split("-")

  if (!year || !month || !day) return ""

  return `${day}.${month}.${year.slice(-2)}`
}

export function formatAgendaDateRange(event: AgendaEvent) {
  const start = formatAgendaDate(event.startDate)
  if (!start) return ""
  if (event.endDate && event.endDate !== event.startDate) {
    const end = formatAgendaDate(event.endDate)
    if (end) return `${start} → ${end}`
  }
  return start
}

function hasValidCoordinates(latitude?: number, longitude?: number) {
  if (typeof latitude !== "number" || typeof longitude !== "number") return false
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false
  if (latitude < -90 || latitude > 90) return false
  if (longitude < -180 || longitude > 180) return false

  return true
}

export function resolveAgendaEventLocation(event: AgendaEvent): ResolvedAgendaLocation {
  const addressLabel = [event.address, event.postalCode, event.city].filter(v => v && v.trim()).join(", ")
  const venueLabel = [event.venue, event.city].filter(Boolean).join(", ")

  // 1. Coordonnées explicitement renseignées sur l'événement
  if (hasValidCoordinates(event.latitude, event.longitude)) {
    return {
      latitude: event.latitude,
      longitude: event.longitude,
      label: addressLabel || venueLabel,
      isComplete: true,
    }
  }

  // 2. Table de lookup par nom de salle (coordonnées exactes)
  const venueCoords = lookupVenueCoordinates(event.venue)
  if (venueCoords) {
    return {
      latitude: venueCoords.latitude,
      longitude: venueCoords.longitude,
      label: venueLabel,
      isComplete: true,
    }
  }

  // 3. Coordonnées de la ville (approximatif)
  const cityCoords = CITY_COORDINATES[normalizeCity(event.city)]
  if (cityCoords) {
    return {
      latitude: cityCoords.latitude,
      longitude: cityCoords.longitude,
      label: venueLabel,
      isComplete: true,
    }
  }

  // 4. Texte seulement, sans coordonnées
  if (addressLabel || venueLabel) {
    return {
      label: addressLabel || venueLabel,
      isComplete: false,
    }
  }

  return {
    label: "",
    isComplete: false,
  }
}

export const agendaEvents: AgendaEvent[] = [
  {
    slug: "portrait-de-rita",
    title: "Portrait de Rita",
    category: "Spectacle",
    image: resolveSpecialEventImage("portrait-de-rita"),
    dates: "14 et 15 octobre 2026",
    startDate: "2026-10-14",
    endDate: "2026-10-15",
    venue: "Espace 1789",
    address: "2-4 rue Alexandre-Bachelet",
    city: "Saint-Ouen",
    postalCode: "93400",
    latitude: 48.9097,
    longitude: 2.3344,
    price: "Tarifs Festival d'Automne",
    time: "20h",
    description:
      "Portrait de Rita, chorégraphie de Laurène Marx avec Bwanga Pilipili. Un solo de danse contemporaine présenté dans le cadre du Festival d'Automne à Paris 2026.",
    officialUrl: "https://www.festival-automne.com/fr/edition-2026/laurene-marx-portrait-de-rita-2026",
    ticketUrl: "https://www.festival-automne.com/fr/edition-2026/laurene-marx-portrait-de-rita-2026",
    source: "Festival d'Automne à Paris",
    sourceLabel: "Festival d'Automne",
    lastVerifiedAt: "2026-10-14",
    status: "En cours",
    cast: [
      { name: "Laurène Marx", role: "Chorégraphie et mise en scène" },
      { name: "Bwanga Pilipili", role: "Interprète" },
      { name: "Maïa Blondeau", role: "Composition musicale" },
      { name: "Kelig Le Bars", role: "Lumières" },
    ],
  },
  {
    slug: "festival-avignon-2026",
    title: "80e Festival d'Avignon",
    category: "Festival",
    image: resolveSpecialEventImage("festival-avignon-2026"),
    dates: "4 au 25 juillet 2026",
    startDate: "2026-07-04",
    endDate: "2026-07-25",
    venue: "Cloître Saint-Louis et lieux du Festival",
    address: "20 rue du Portail Boquier",
    city: "Avignon",
    postalCode: "84000",
    price: "",
    description:
      "Le grand rendez-vous du spectacle vivant fête sa 80e édition. Théâtre, performance, danse et formes hybrides se déploient dans toute la ville.",
    officialUrl: "https://festival-avignon.com/fr/edition-2026/programmation/par-categorie?cat=1001",
    source: "Festival d'Avignon",
    sourceLabel: "Festival d'Avignon",
    lastVerifiedAt: "2026-07-11",
    status: "En cours",
  },
  {
    slug: "festival-paris-lete-2026",
    title: "Festival Paris l'été",
    category: "Festival",
    image: resolveSpecialEventImage("festival-paris-lete-2026"),
    dates: "",
    startDate: "2026-07-12",
    endDate: "2026-08-05",
    venue: "Plusieurs lieux",
    city: "Paris",
    postalCode: "75000",
    price: "",
    description:
      "Un festival pluridisciplinaire qui investit Paris et ses alentours avec danse, performance, cirque, théâtre et propositions en espace public.",
    officialUrl: "https://www.parislete.fr/fr/le-programme",
    source: "Festival Paris l'été",
    sourceLabel: "Festival Paris l'été",
    lastVerifiedAt: "2026-07-11",
    status: "À venir",
  },
  {
    slug: "all-world-waacking-2026",
    title: "All World Waacking",
    category: "Battle",
    image: resolveSpecialEventImage("all-world-waacking-2026"),
    dates: "",
    startDate: "2026-07-12",
    venue: "",
    city: "Paris",
    postalCode: "75000",
    price: "",
    description:
      "Un rendez-vous consacré au waacking dans le cadre de Paris l'été. Les informations détaillées de lieu, horaires et tarifs sont à compléter.",
    officialUrl: "https://www.parislete.fr/fr/inscription-all-world-waacking",
    source: "Festival Paris l'été",
    sourceLabel: "Festival Paris l'été",
    lastVerifiedAt: "2026-07-11",
    status: "À venir",
  },
  {
    slug: "grand-defile-edith-amsellem",
    title: "Le Grand Défilé - Édith Amsellem",
    category: "Spectacle",
    image: resolveSpecialEventImage("grand-defile-edith-amsellem"),
    dates: "",
    startDate: "2026-07-12",
    venue: "",
    city: "Paris",
    postalCode: "75000",
    price: "",
    description:
      "Un projet participatif et chorégraphique annoncé dans le cadre de Festival Paris l'été. Les informations de représentation restent à compléter.",
    officialUrl: "https://www.parislete.fr/fr/appel-a-participation-le-grand-defile",
    source: "Festival Paris l'été",
    sourceLabel: "Festival Paris l'été",
    lastVerifiedAt: "2026-07-11",
    status: "À venir",
  },
  {
    slug: "la-deferlante-vague-art-2026",
    title: "La Déferlante, la vague à l'art",
    category: "Arts de rue",
    image: resolveSpecialEventImage("la-deferlante-vague-art-2026"),
    dates: "Juillet et août 2026",
    startDate: "2026-07-11",
    endDate: "2026-08-31",
    venue: "Communes du littoral vendéen et Loire-Atlantique",
    city: "Vendée / Loire-Atlantique",
    price: "",
    description:
      "Un réseau estival d'arts de la rue sur le littoral, avec une programmation pluridisciplinaire où la danse et le mouvement dialoguent avec l'espace public.",
    officialUrl: "https://www.ladeferlante.com/",
    source: "La Déferlante",
    sourceLabel: "La Déferlante",
    lastVerifiedAt: "2026-07-11",
    status: "En cours",
  },
  {
    slug: "nuits-fourviere-2026",
    title: "Les Nuits de Fourvière",
    category: "Festival",
    image: resolveSpecialEventImage("nuits-fourviere-2026"),
    dates: "28 mai au 25 juillet 2026",
    startDate: "2026-05-28",
    endDate: "2026-07-25",
    venue: "Théâtres romains de Fourvière",
    address: "6 rue de l'Antiquaille",
    city: "Lyon",
    postalCode: "69005",
    price: "",
    description:
      "Un festival pluridisciplinaire où danse, cirque, théâtre et musique se croisent dans les théâtres romains de Fourvière.",
    officialUrl: "https://www.nuitsdefourviere.com/",
    source: "Les Nuits de Fourvière",
    sourceLabel: "Les Nuits de Fourvière",
    lastVerifiedAt: "2026-07-11",
    status: "En cours",
  },
  {
    slug: "opera-paris-ballet-saison-26-27",
    title: "Ballet de l'Opéra national de Paris - Saison 26/27",
    category: "Ballet",
    image: resolveSpecialEventImage("opera-paris-ballet-saison-26-27"),
    dates: "Saison 2026-2027",
    startDate: "2026-09-01",
    endDate: "2027-07-31",
    venue: "Palais Garnier et Opéra Bastille",
    address: "Place de l'Opéra",
    city: "Paris",
    postalCode: "75009",
    price: "0€ à 300€ selon les spectacles",
    description:
      "La programmation ballet de l'Opéra national de Paris rassemble les grands classiques, les créations et les rendez-vous chorégraphiques de la saison.",
    officialUrl: "https://www.operadeparis.fr/programmation/saison-26-27",
    source: "Opéra national de Paris",
    sourceLabel: "Opéra national de Paris",
    lastVerifiedAt: "2026-07-11",
    status: "À venir",
  },
  {
    slug: "le-temps-daimer-la-danse-biarritz",
    title: "Le Temps d'Aimer la Danse",
    category: "Festival",
    image: resolveSpecialEventImage("le-temps-daimer-la-danse-biarritz"),
    dates: "",
    startDate: "2026-09-01",
    venue: "Gare du Midi et lieux partenaires",
    city: "Biarritz",
    postalCode: "64200",
    price: "",
    description:
      "Le festival biarrot dédié à la danse rassemble compagnies, créations, rencontres et propositions chorégraphiques dans plusieurs lieux du Pays basque.",
    officialUrl: "https://letempsdaimer.com/",
    source: "Le Temps d'Aimer la Danse",
    sourceLabel: "Le Temps d'Aimer la Danse",
    lastVerifiedAt: "2026-07-11",
    status: "À venir",
    cast: [
      { name: "Martin Harriague", role: "Directeur artistique" },
    ],
  },
  {
    slug: "suresnes-cites-danse-2027",
    title: "Suresnes Cités Danse",
    category: "Festival",
    image: resolveSpecialEventImage("suresnes-cites-danse-2027"),
    dates: "Janvier 2027",
    startDate: "2027-01-01",
    venue: "Théâtre de Suresnes Jean Vilar",
    address: "16 place Stalingrad",
    city: "Suresnes",
    postalCode: "92150",
    price: "8€ à 40€ selon les tarifs du théâtre",
    description:
      "Un rendez-vous majeur pour les écritures chorégraphiques contemporaines et les formes issues des cultures hip-hop.",
    officialUrl: "https://www.theatre-suresnes.fr/",
    source: "Théâtre de Suresnes Jean Vilar",
    sourceLabel: "Suresnes Cités Danse",
    lastVerifiedAt: "2026-07-11",
    status: "À venir",
    cast: [
      // Artistes confirmés pour l'édition 2026 / saison 26-27 (source : theatre-suresnes.fr)
      { name: "Leïla Ka", role: "Artiste invitée" },
      { name: "Sofiane Chalal", role: "Artiste invité" },
      { name: "Marina Gomes", role: "Artiste invitée" },
      { name: "Mourad Merzouki", role: "Artiste invité" },
      { name: "LeeLa Petronio", role: "Artiste invitée" },
    ],
  },
]

export const upcomingAgendaEvents = agendaEvents.filter((event) => !isPastEvent(event))
export const featuredAgendaEvents = upcomingAgendaEvents.slice(0, 3)
