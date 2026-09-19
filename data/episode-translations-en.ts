/**
 * data/episode-translations-en.ts
 *
 * Traductions EN des contenus éditoriaux des épisodes Dance Lab.
 * Clé = numéro d'épisode.
 *
 * ─── Champs disponibles ─────────────────────────────────────────────────────
 *  title          → titre traduit (h1, cards, og:title)
 *  excerpt        → résumé court (cards, og:description fallback)
 *  quote          → citation mise en avant (blockquote héro)
 *  description    → description complète (optionnel — fallback FR si absent)
 *  seoTitle       → titre SEO (auto : title + " | Dance Lab" si absent)
 *  seoDescription → description SEO (auto : excerpt si absent)
 *  chapters       → titres des chapitres traduits (optionnel)
 *
 * ─── Architecture ───────────────────────────────────────────────────────────
 *  • Si un champ EN est absent, la page affiche automatiquement le FR.
 *  • Pour les épisodes RSS (≥ 122), ajouter une entrée ici ET dans
 *    data/episode-extras.ts (pour quote / titre corrigé).
 *  • Pour les futurs épisodes, copier le bloc template ci-dessous.
 *
 * ─── Template pour un nouvel épisode ────────────────────────────────────────
 *  NNN: {
 *    title:   "...",
 *    excerpt: "...",
 *    quote:   "...",
 *    // description: "...",  // optionnel — laissez vide = fallback FR
 *  },
 *
 * ─── État des traductions ───────────────────────────────────────────────────
 *  ✅ title + excerpt + quote  : 129 épisodes traduits (1–121 + 122–129)
 *  ✅ description              : 129 épisodes traduits (1–121 + 122–129)
 *  ⏳ chapters                 : à compléter pour les épisodes concernés
 */

export type EpisodeTranslationEN = {
  /** Titre EN affiché en h1, dans les cards et dans les balises og/twitter. */
  title?: string
  /** Résumé court EN (≤ 220 chars) — cards et og:description. */
  excerpt?: string
  /** Citation mise en avant EN. */
  quote?: string
  /**
   * Description complète EN (texte brut, paragraphes séparés par \n\n).
   * Si absent, la page affiche la description FR en fallback.
   */
  description?: string
  /**
   * Titre SEO EN.
   * Si absent, calculé automatiquement : title + " | Dance Lab".
   */
  seoTitle?: string
  /**
   * Description SEO EN.
   * Si absent, calculé automatiquement depuis excerpt.
   */
  seoDescription?: string
  /**
   * Chapitres traduits EN.
   * Doit contenir le même nombre d'entrées que l'original FR.
   * Si absent, les titres FR sont affichés en fallback.
   */
  chapters?: { time: string; title: string }[]
}

// ─── Traductions épisodes RSS (≥ 122) ────────────────────────────────────────
// Ajouter chaque nouvel épisode ici, avec le même format.
// Fallback automatique sur le FR si l'entrée est absente.

export const episodeTranslationsEN: Record<number, EpisodeTranslationEN> = {

  122: {
    title:   "Can you succeed in dance without sacrificing your mental health?",
    excerpt: "A candid conversation about mental health in the dance world — the pressure, the comparison, and what it really takes to build a sustainable career.",
    quote:   "Knowing how to say no and thinking about your personal life — that's a good thing.",
    description: "We still don't talk enough about mental health in the dance world.\n\nAnd yet, I think many of us go through the same things without daring to speak up.\n\nWhy? Simply because it's still taboo.\n\nThe pressure to always be working. Constantly comparing yourself to others. The feeling that you always have to show you're busy — when, very often, you're not really, but someone's selling you smoke with an Instagrammable photo taken in a studio mirror.\n\nThis creates a permanent race toward success, largely fuelled by social media, where everyone shows what's working and rarely what fails.\n\nIn this episode, Mylène also shared that dance — which was supposed to be her refuge — triggered a depression, followed by a suicide attempt.\n\nWe also talked about motherhood, and that reality: when you become a mother, people stop calling — or call far less — because they assume you're no longer available.\n\nAnd for those afraid of not finding their place:\n\nThat's probably the biggest lie of all — because there is room for everyone.",
  },

  129: {
    title:   "CLIP — \"Better to start small but do it well...\" with Clémentine Dagousset",
    excerpt: "A short clip about managing artistic projects, financing shows and entrepreneurship in dance.",
    quote:   "It's better to start small but do it well.",
    description: "A short clip from the Dance Lab podcast featuring Clémentine Dagousset on the importance of starting small but doing it well — a philosophy for building sustainable artistic projects in dance.",
  },

  128: {
    title:   "Dance and disability: is the industry truly inclusive?",
    excerpt: "An exploration of inclusion in dance, accessibility for people with disabilities, professional working conditions and artists' rights.",
    quote:   "My vision of disability dance isn't about tugging at heartstrings.",
    description: "Can we really talk about inclusion if not everyone has access to dance yet?\n\nIn this episode, Wilfried Bernard shares his vision of diversity in dance, the place of people with disabilities, and the importance of allowing everyone to see themselves in the artists on stage.\n\nBut we also talk about what happens once you enter the professional world:\n\n➜ Working conditions, dancer pay, all the things we sometimes accept at the start of our career because we don't yet dare say no — and that fear of being seen as \"difficult\" simply because we ask to be respected.\n\nWe also talk about everything dancers should be taught before entering the job market, because being a professional dancer isn't just about dancing well.\n\nIt's also about knowing your rights, understanding your status, and knowing what you can and should no longer accept.",
  },

  127: {
    title:   "What a dancer feels right before a battle",
    excerpt: "A short episode capturing the mental state of a dancer in the moments immediately before stepping onto the battle floor.",
    quote:   "It's not about technique — it's about what you carry inside.",
    description: "Right after his set — and it was 40 degrees that day — I caught up with WaaBee at House of Bastet at La Villette.\n\nWe talked about what he came looking for at this event, what carries him through his sets, and what he says to himself right before stepping in.\n\nA beautiful exchange that also captures what goes through a dancer's mind when they enter the cypher.\n\n[This episode was recorded on June 20, 2026]",
  },

  126: {
    title:   "Dance castings: the mistakes that could cost you your spot",
    excerpt: "A behind-the-scenes look at what casting directors really see — and what artists can do to stand out on both sides of the table.",
    quote:   "On the artists' side, it's important to know how to say no.",
    description: "Do we really know what happens on the other side of the table?\n\nWhat a casting director actually looks for — and what can make the difference.\n\nTo succeed in this industry, there are a few things you need to know that no training program will ever teach you!\n\nHow do you nail a casting? What is intermittent status? How do you market yourself on social media? How do you handle rejection?\n\nAnd also: knowing when to say no and choosing who you want to work with — taking back some control over your career and your place in the industry.\n\nIn this episode, we talk about the real life of artists with Christopher Lopez, a casting director who had A LOT of truths to share.\n\n[This episode was recorded on August 25, 2026]",
  },

  125: {
    title:   "What place for women in dance, hip-hop and club cultures?",
    excerpt: "A conversation about women's representation in underground dance scenes, decision-making spaces and dance as a tool for empowerment.",
    quote:   "Today everything moves much faster.",
    description: "We talk a lot about women's representation in dance and culture. And when you look at what's happening on social media, on stages, at festivals, you might almost think things have changed — that the problem barely exists anymore.\n\nExcept not quite.\n\nBecause being visible isn't the same as being present where decisions are made. In juries, committees, behind programming choices, at the decks, in all those spaces where, ultimately, who gets a place is decided.\n\nAnd sometimes, simply seeing someone arrive somewhere they're not usually expected is enough to make you think: \"Oh, so it's possible for me too.\"\n\nIn this episode, we also talk about the party as a space for emancipation — how we reclaim our bodies, our identities, certain spaces — and all those patterns we sometimes reproduce without ever really asking ourselves why.\n\nWe also reflect on dance as a tool for reconnecting with yourself, with others, and simply with the present moment.\n\n[This episode was recorded on June 20, 2026]",
  },

  124: {
    title:   "He started dancing at 22: at 51, he still makes a living from it",
    excerpt: "Fred Jean-Baptiste shares how he built and sustained a 25+ year career through determination after starting dance later than most.",
    quote:   "You don't need to have a hold over your dancers.",
    description: "He started dancing at 22, and today at 51, he's still dancing professionally.\n\nAt an age when some are still wondering whether it's \"too late\" to start or whether they're \"too old\" to keep going — that thought doesn't even cross his mind.\n\nIn 1999, he simply told himself that if he wanted to catch up, he'd have to work twelve times harder than everyone else.\n\n➜ He says it himself: \"I ate dirt for two years.\"\n\nSo for two years, he took five dance classes a day. I don't know if you can picture that — but it's enormous.\n\nAnd in 25 years of career, he's also had plenty of time to see what goes on behind the scenes.\n\nWe didn't sugarcoat anything. We talked about misplaced ego, absurd auditions, power dynamics, and the reality that talent and motivation clearly aren't enough.\n\nWe talked about all of it: what's changed in the industry, what he refuses today, and above all, what he believes truly allows you to last.\n\nWe ended up emotional when I asked him what he'd say to 22-year-old Fred, the day he first pushed open the door of a dance studio.\n\n[This episode was recorded on August 8, 2026]",
  },

  123: {
    title:   "How to stand out when everyone is talented",
    excerpt: "A conversation with Bertrand Exertier about choosing creativity over technique, developing a distinctive artistic style and building a career through authenticity.",
    quote:   "Let's stop always comparing ourselves.",
    description: "At 20, he left for Quebec because he had \"nothing to lose.\"\n\nAt that point, he had nothing — so photography felt like an idea that was miles away from him.\n\nBut he started taking photos on his iPhone, then celebrities began reposting them and asking him to shoot theirs.\n\nHe bought his first camera.\n\nHis name slowly started to circulate — and of course, it ruffled feathers, because he had no formal technique.\n\nIn the end, it was his creativity that saved him.\n\nThe artists he worked with back then were people he'd grown up watching on screens and on CD covers — he had no idea how to approach them, who to write to, or where to even begin.\n\nFor him, it felt impossible. Unthinkable, even.\n\nAnd yet, today, he works with them.\n\nSo yes — there's the glitter, the pretty storytelling. But also: jealousy, people who look down on you, moments when you're out there cold-pitching for work on your own, rejections, doubts.\n\nBut as he puts it so well:\n\nJust make your stuff. Test things. Be bold.\n\nFind what sets you apart from others — and above all, don't say yes to everything just so you can say you're working. [Big topic, that one.]\n\nAnd today, what makes the difference for him isn't having the best technique.\n\nIt's having a style that people recognise.\n\n[This episode was recorded on July 28, 2026]",
  },

// ─── Traductions épisodes 1–121 ───────────────────────────────────────────────

  121: {
    title:   "Why are female dancers sexualized?",
    excerpt: "A conversation about femininity, sensuality and sexualization in dance — and why we are not responsible for what others project onto us.",
    quote:   "Competition is fierce and if you don't put yourself out there, people don't think of you.",
    description: "\"No matter what, you will be sexualized.\"\nThat was THE topic I'd been wanting to tackle for a long time.\nBecause in dance — and even more on social media — sometimes all it takes is an outfit, a movement or a photo for others to immediately project intentions onto you that were never yours.\n➜ And as Laëtitia Simon says, unfortunately, we are not responsible for what others think of us, no matter what we wear or how we dance.\nThis conversation connects with the one we had with Yasmine Habib in episode 118.\nAnd that's the real problem:\nWe confuse femininity, sensuality and sexualization.\nAnd yet they are 3 completely different things!\n➜ Being feminine and sensual does not mean wanting to seduce.\n➜ Dancing with your body does not mean making it available for the gaze of others.\nAnd that is precisely what we talked about.\nWhat we feel.\nWhat we show.\nAnd everything others imagine in our place.\nA conversation that, I believe, goes far beyond the world of dance.",
  },

  120: {
    title:   "Photography and AI: should we fear the future of dance?",
    excerpt: "Duy-Laurent Tran is a dance photographer: he reveals the invisible behind every image, the impact of AI and the lessons of an entrepreneur.",
    quote:   "Dance photography is no easy feat.",
    description: "We often talk about the result, but far less about everything that comes before it.\nIn this episode, we talked about dance photography, of course. But mostly about everything we never see.\nDuy-Lau shares how he got started almost by chance in 2020, photographing his dancer friends.\nAnd of course, being a dance photographer wasn't just about pressing a button at the right moment.\n➜ You have to understand movement, anticipate, observe.\nAnd so there are all those invisible hours of work behind a single image.\n➜ The selection, the retouching, the trials...\nYes, one photo can represent hours of work.\nWe also talked about AI.\n➜ Is it scary in this field?\nRight now, not really.\nIt speeds up certain stages, yes — like pre- and post-production.\nBut creating, feeling movement, telling a story with an image — that still remains deeply human today.\nWe also talked about entrepreneurship.\nBuilding a company means believing in it 200%, accepting setbacks, choosing the right people.\nAnd sometimes, knowing when to stop is also a way of moving forward.\nWhat I take away most from this conversation is something he said:\n\"Curiosity is what allowed me to get where I am today.\"",
  },

  119: {
    title:   "Why she left the dance world: toxicity, jealousy and pressure",
    excerpt: "Charlotte Baret speaks candidly about why she left dance, the toxicity of the industry, transmission and what you gain from looking elsewhere.",
    quote:   "Students don't belong to their teacher.",
    description: "Even today, when we talk about our profession, we still hear it:\n\"You dance? Yes but apart from dancing, what do you actually do?\"\nWith hindsight, Charlotte realizes that her business degree actually served her dance career too — especially in helping her become an entrepreneur.\nBecause yes, a dancer is an entrepreneur.\nWe also talked about transmission:\n➜ Those teachers who mark you for life,\n➜ Those who forget that their students don't belong to them,\n➜ And the importance of looking elsewhere to keep growing.\nThen Charlotte speaks plainly about why she ultimately left the dance world.\nA decision she lived with as a failure for a long time, before understanding she had perhaps simply chosen to protect herself from the toxicity of the industry:\n➜ Stabs in the back\n➜ Cyberbullying\n➜ Hypocrisy\n➜ Jealousy\nAs if you almost had to accept haters as a normal consequence of success.\nBut no.\nAnd today, when she talks about her greatest wealth, she's not talking about a stage or a contract.\n➜ She's talking about love, her family, her child.\nAn episode that reminds us no career is worth the price of losing who you are.",
  },

  118: {
    title:   "What the dance world doesn't show: hypocrisy, criticism and toxicity",
    excerpt: "An unfiltered conversation about heels, transmission, values, hypocrisy in the dance world, contracts and artists' rights.",
    quote:   "I didn't play the hypocrite to get where I am.",
    description: "There are so many little phrases that stuck with me.\nIn this conversation, we talked about everything that lies behind a career people often imagine as \"successful.\"\n➜ We also talked about heels.\nBecause yes — no — it's not just putting on a pair of heels and a nice outfit.\nBehind it, there's a lot of work, technique, rigor.\nWe also talked about dance classes:\n➜ The intention with which you come to learn.\n➜ The values that get transmitted.\n➜ The hypocrisy you can sometimes encounter in this world — without pretending it doesn't exist!\nAnd then there were those topics we don't talk about enough: contracts we sign without support, the lack of education about our rights, maternity that still makes some people question our commitment…\nI simply loved the way she says things, without trying to please everyone.\nHer message is simple: stay disciplined, do things with the right intentions, don't let others define what you can accomplish — and if the passion is there:\n➜ Keep moving forward!\nI can't wait to hear what you'll take away from this episode :)",
  },

  117: {
    title:   "What we sacrifice to make a living from dance: ambition, longevity and telling your own story",
    excerpt: "A discussion about ambition, the stage, transmission, motherhood and building an artistic career.",
    quote:   "Before making a career choice, I make a human choice.",
    description: "I'm not quite sure how to talk about episode 117 with Tatiana, but I felt like I was listening to someone asking the right questions — and it made me think alongside her.\nLike that feeling of not really knowing if you exist outside of dance.\nAnd at the same time, that need to keep coming back to it because that's where things speak loudest.\nWe talked about her show Descendantes de combattantes, about what it means to carry a story, to make it bigger than yourself, almost universal. About speaking for women, about shining a light on Black women.\n➜ About how precious the stage is — as a place where you can say things you can't always say elsewhere.\nAnd then some topics came naturally: motherhood, and that moment when calls start coming in less often without any real explanation…\nWe talked about ambition, and above all, work.\nAbout this idea that we've somehow normalized being a dancer, when behind it there are years of building, culture, self-questioning.\nWhat I take away most is a piece of advice she was given that really moved me: for people to listen and watch you on stage, you have to live.",
  },

  116: {
    title:   "Becoming a dancer: what it really takes (no taboos)",
    excerpt: "A conversation about injuries, precarious work, contracts, pedagogy and the realities of a dancer's profession.",
    quote:   "Never underestimate the power of proper training.",
    description: "Some episodes — I know from the very first minutes — we're going to talk about much more than dance!\nWe started by looking back on an injury from an accident.\nThe kind of moment where the only question looping in your head is:\n➜ \"Will I be able to dance again?\"\nAnd then we talked about everything this profession doesn't always show:\n➜The fear of saying you're injured because you might lose a contract — ouch!\n➜Choreographers who elevate their dancers, and those who still think pressure or tyranny lead to progress — ouch!\n➜The precarity we sometimes end up treating as \"normal\" — ouch!\n➜Salaries that haven't kept up with inflation — ouch!\n➜Those who live well, those who get by, and those who barely survive — ouch!\n[Please get the Denis Brogniart reference]\nBut we also talked about transmission, pedagogy, the importance of solid training — and above all a question I find essential: what kind of dancer do we want to be, and why do we do this job?\nAnd of course we ended by talking about collaborations we'd rather forget.\nWe almost named names!\nBut of course we held back.\n[Defamation and all that, you know]\nHonestly, it was an unfiltered conversation, with things you rarely hear said this frankly.\nI can't wait to hear what stays with you most from this episode :)",
  },

  115: {
    title:   "My physiotherapist explained why dancers get injured so much",
    excerpt: "Prevention, warm-up, injuries and the importance of treating dancers as true athletes.",
    quote:   "Pain is your body's first signal telling you something's wrong.",
    description: "When I contacted my physiotherapist, Laura Malié-Leclerc, I knew we were going to touch on something very concrete for dancers.\nWe started from a simple observation: there's still a real gap between \"feeling like an artist\" and \"accepting that you're also an athlete.\"\n➜ And yet the body is our working tool.\nSo of course, it needs upkeep!\nWe talked about warm-ups — and the fact that it's not optional but an OBLIGATION.\nWe also talked about prevention, because ultimately a large part of injuries aren't big accidents but repeated micro-traumas that build up without us noticing.\nShe says it clearly:\n➜ Pain is a signal.\nSo it's not something to ignore.\nAnd that really struck me, because in dance we sometimes tend to normalize it: \"It hurts but I keep going.\"\nWe also raised a real question: should physiotherapists be integrated from the start of the choreographic process?\nAnd the economic reality behind all of it, because yes — taking care of dancers should be a budget in its own right, not a luxury.\n➜ I invite you to tag @culture_gouv and @sports.gouv so that budgets are allocated to care for dancers, during performances and beyond.\nAnd in the middle of this episode, there's also optimism, nutrition, taboos — and that simple idea we so often forget: if your body is your tool, you need to take care of it as such.\nAll in all, a very concrete conversation, sometimes blunt, funny too — but one that puts a lot of things back in perspective, just the way I like it!",
  },

  114: {
    title:   "Being a dancer is no longer enough: the skills that really make the difference",
    excerpt: "A reflection on castings, values, agents and building a lasting career.",
    quote:   "That's the one thing 98% of artists lack.",
    description: "There was one phrase that struck me particularly in this exchange:\n\"You're contributing to a system that barely values talent anymore — but values judgment on physical appearance. I don't want to endorse that, so I'm stopping.\"\nI think it takes a lot of courage to make a decision like that.\nBecause she didn't stop dancing because she lacked passion.\n➜ She walked away from a career she no longer recognized herself in, because she was tired of being judged on her appearance before her talent even had a chance to show.\nIn this episode, we talked about the reality of the commercial world, the relentless casting cycle, the gaze on bodies — and that constant feeling of having to prove your worth.\nBut also about what you need to develop to build a lasting career.\nBecause we know it: talent alone is no longer enough!\nI also appreciated her perspective on supporting artists — and on a topic we still rarely discuss in dance: the role of agents.\n➜ There are almost none in France for dancers!\nWhat I take away most from this conversation is the importance of staying aligned with your values, even when it means making difficult decisions.\nIntegrity and values — always.",
  },

  113: {
    title:   "If there's no longer the word dance, what am I: Krump, BJJ and transmission",
    excerpt: "An episode about krump, identity, transmission and pushing beyond your limits.",
    quote:   "Jiu-jitsu for me is like krump in dance: it's complete.",
    description: "Some episodes are about careers, contracts, or success.\nAnd then there are those that make you think about something much deeper:\n➜ \"If the word 'dance' disappeared, who would I be?\"\nThat's probably the phrase that struck me most during this conversation.\nSo yes, we talked about krump — but above all about what this dance reveals in those who practice it.\nWe also talked about his position as a pioneer, the place he holds in the scene today.\n➜ And yet it's a place he never sought.\nHe simply sought to be himself, to follow his path, without becoming a figure.\nAnd then there was this discussion about pushing yourself past your limits — to the point of saturation.\n➜ To the point of wanting to quit dance entirely after the Madonna tour.\nI found that both incredible and so real!\nWhat I found particularly interesting was the connection he draws between dance and combat sports: ➜ Krump as a martial dance. ➜ Jiu-jitsu as krump in sport form.\nTwo worlds that seem different on the surface, but are so similar: learning to know yourself and push your limits.\nAnd I think that's also what makes this conversation so interesting.\nWe talk about dance, yes — but above all about identity, balance, transmission and what remains when you stop defining yourself solely by what you do.",
  },

  112: {
    title:   "Artistic legitimacy: do we really have to wait for someone to give it to us?",
    excerpt: "A conversation about creation, fear, legitimacy and the courage to explore new paths.",
    quote:   "No one's going to do it for me: I have to face what could potentially become my career.",
    description: "There's something that stayed with me after this conversation.\nThis idea that fear is maybe not a \"danger\" sign — but sometimes a \"go for it\" sign.\nWe often wait to be ready, to be validated. To feel legitimate before taking up space, testing a project, speaking up, creating something beyond the box people know us from.\nBut deep down, how do you know what you like if you never allow yourself to try?\nWe talked about that tendency to apologize for existing, to thank people endlessly whenever we're given a little space. As if claiming your place had to be earned before you'd even begun.\n➜ We laughed so hard at that moment!\nAnd then we also talked about terrain:\n➜ Searching, doubting, questioning yourself. Because in reality, evolving as an artist isn't about having all the answers.\nIt's about continuing to explore even when it's scary — like an entrepreneur!\nI also loved the moment when we talked about not defining yourself solely through others' eyes. About living your passion without forgetting who you really are behind the image, behind the job, behind what you project.\nIn short, it's an episode about daring — but not necessarily to be opportunistic. Just to discover yourself a little more.\nAnd personally, I loved it. I needed to hear these words.",
  },

  111: {
    title:   "Thinking of the artist beyond dance: legitimacy, kindness and mental health",
    excerpt: "An episode about artistic responsibility, work environments and the human behind the artist.",
    quote:   "I'd rather turn down a contract than work with monsters.",
    description: "People often told him: \"You got lucky.\"\nFair enough — but can we take a moment to talk about the work behind that, and all the closed doors? The jobs you don't get because you don't have \"the right followers.\"\n➜ Fact: today, we still confuse visibility with value.\nThat's also why, for years, I've stopped working for certain \"influential\" people just to add a line to my CV.\nBecause by constantly accepting everything and anything, we also keep elevating certain people — and the behaviors that come with them.\nAnd like Johan: without humanity, I'm out.\nThat's exactly what this episode is about: ➜ The responsibility we hold in this industry — for current generations and those coming up. ➜ Being able to turn down a contract rather than working for monsters. ➜ Creating safe spaces, not jobs where you show up with a knot in your stomach.\nRethinking certain ways of doing things too:\n➜ Choreographers who project their stress and doubts onto dancers instead of lifting them up.\n➜ People who lead by screaming and humiliating in public.\n➜ Endless castings in the rain.\n➜ Injuries ignored out of fear of losing a job.\nYes, we do a passion job. But at what cost?\nPassion should NEVER make us forget our worth.\nThe artist of tomorrow, as Johan imagines it, is multifaceted, human and respectful. Someone who respects themselves enough to also respect others.\nAnd that changes everything!",
  },

  110: {
    title:   "How to last in creative careers: world tour, depression, resilience",
    excerpt: "A testimony about creation, resilience, mental health and longevity in artistic careers.",
    quote:   "I understood we weren't machines and that we're not infallible. The first thing I did when I came out was dance, sing and ride a bike.",
    description: "During COVID, he closed his company, his gallery, lost 3 people close to him, and saw his revenue drop 90% in one year.\nHe ended up falling into a deep depression that led him to a psychiatric hospital, following a medical wandering.\n➜ Today he speaks about it to bear witness.\nThis is the story of Frédéric Fontan — entrepreneur, artist, set designer, artistic director, dancer, choreographer, internationally recognized.\nI'll simply leave you with this:\n➜ \"I understood that we are not machines and that we are not infallible. The first thing I did when I got out was go dance, sing and ride my bike.\"\nA moving episode and testimony — and yet we laughed a great deal throughout it.",
  },

  109: {
    title:   "Do you have to become someone else to succeed in dance?",
    excerpt: "A conversation about artistic identity, self-confidence and the pressure to transform yourself to succeed in the dance world.",
    quote:   "In artistic fields you're quickly confronted with yourself and what you're going to do; no one's going to tell you what to do but yourself.",
    description: "In artistic worlds, you come face to face with yourself very quickly.\n➜ It's you VS you.\nThe same questions keep coming back: what am I doing here and why do I keep going?\nFor Indies, the answer has remained fairly simple: dance is first a passion, before being a profession.\nAnd that's probably the healthiest relationship to have with dance when you make it your career.\nBecause if you play certain games, people will make you believe that if you're not part of a certain circle, there's no place for you.\n➜ Yes, you often see the same faces, the same formats, the same trajectories. It ends up creating a very narrow vision of what the artistic world really is. When in reality, there are a multitude of possible paths.\nAnd it's time to talk about it — because many of them are invisible. And that's where some people get lost or even quit.\nRemember: if you love what you do, you are — no matter what — \"in the right place.\"\nToday, she chooses to stay for exactly that reason.\nA good reminder that your place doesn't depend solely on what's being shown.",
  },

  108: {
    title:   "Why you're blocked around money and how to break free",
    excerpt: "A practical conversation about your relationship with money, limiting beliefs and the keys to better managing your life as an artist.",
    quote:   "Money goes where things are clear.",
    description: "\"I'm terrible with money.\"\n\nReally?\n\nThat's what we question with Maëva in this episode.\nAnd we quickly realize it's not necessarily a truth — but sometimes just an inherited belief!\n\nOur famous relationship with money:\n➜ The one we learned,\n➜ The one we unconsciously repeat,\n➜ The one that holds us back.\nAnd not educating yourself financially is also allowing societal gaps to widen.\n\nBecause yes, as Maëva says, you can have the best project, the best idea —\nBut if you create without strategy or vision, you can bring everything crashing down.\n\nAn essential episode for all artists, creatives and entrepreneurs to:\n➜ Clarify what you want\n➜ Understand how much you want to earn\n➜ Align your actions with your values\nBecause money flows where things are clear.\n\nIn this episode, we talked about her unconventional path, beliefs around money, and concrete solutions for better managing your finances in creative fields.",
  },

  107: {
    title:   "Why do dancers feel music differently?",
    excerpt: "A discussion about groove, musicality and the unique way dancers feel, interpret and embody music.",
    quote:   "Freedom, sharing, inclusion: those are the keywords of clubbing.",
    description: "He makes no distinction between dancers and clubbers!\n➜ For him, groove is that moment when music comes alive in the body — where everyone plays, interprets, surrenders to it in their own way.\nWith Tijo Aimé, we talked about freedom, letting go, and that invisible but essential connection between the DJ and the audience.\nThis was part of his carte blanche with Atmosphere Project.",
  },

  106: {
    title:   "How to enrich your dance through other arts?",
    excerpt: "A conversation about the connections between dance, theatre and other artistic disciplines to nurture creativity and enrich movement.",
    quote:   "I think we are living sculptures in dance.",
    description: "Nothing in his background predestined him to become a professional dancer and start his own company.\nPlot twist: he applied to AID because he was looking for a company for his work-study program in chemistry. No connection whatsoever — but he did it!\nAnd becoming a professional dancer means:\nOpening up, testing, searching.\nAnd from that, Rodin was born.\nA name heavy with meaning:\n➜ The housing tower where he grew up\n➜ But above all, the name he used on his Skyblog\nI laughed so hard at that anecdote! Another era entirely.\nAnd of course, the inspiration of Auguste Rodin and his way of sculpting bodies.\nToday, he creates Aqua.\nA duet that tells more than movement:\n➜ How does a friendship become brotherhood?\n➜ How do two opposing worlds meet?\n➜ How do the floor, break, and lived experience create a bond?\nAnd this powerful vision:\n\"We are living sculptures.\"\nSo he composes with constraints and sincerity.\nAn episode to rethink creation.\nAnd maybe, the way you dance!",
  },

  105: {
    title:   "Directing dancers: the true responsibilities of a choreographer",
    excerpt: "A conversation about choreographic direction, listening, responsibility and the human qualities needed to accompany dancers on stage.",
    quote:   "For me, everything is political. Choosing to go or not to go see a show, for example, is already political.",
    description: "His accident allowed him — and above all, forced him — to ask: \"Why do I dance?\"\nAnd the answer stayed the same:\n➜ Not to please\n➜ Not to fit into a box\n➜ But because she believes in it\nAnd in this episode, we hold one conviction: there is not just one way to be a dancer.\n➜ There is no single body type\n➜ There is no perfect path\n➜ There are only artists who dare\nAnd it's time that was visible!\nBecause your body is not the problem.\nSocietal standards are.\nI deliberately left a few seconds of silence in this episode — to question, with a touch of sarcasm, as always.",
  },

  104: {
    title:   "Creating, transmitting and experimenting beyond movement",
    excerpt: "A discussion about creation, transmission and experimentation to build a free artistic practice beyond movement.",
    quote:   "Feeling emptiness is even harder today because we live in a world full of distractions.",
    description: "\"You don't always see it, but there are a lot of rejections.\"\nThat's what we talked about in episode 104 with Théophile:\n➜ Feeling the void in a world full of noise.\n➜ Learning to tell the difference between what comes from yourself and what comes from others.\n➜ Comparing yourself — yes, but to rise.\nBecause deep down, what you admire in others also exists in you. Dance isn't just \"beautiful\" — it's complex, demanding, and sometimes hard! But as Théophile said: \"It's worth it.\"",
  },

  103: {
    title:   "Strategies and tips to win a battle",
    excerpt: "A rich conversation with strategies to prepare for a battle, handle pressure and make a difference through musicality.",
    quote:   "The goal, when you want to become a high-level dancer, is to find your way to be unique.",
    description: "When we talk about battles, we often think about performance, energy, spectacle.\nBut we talk a lot less about the responsibility of the judges!\nBecause behind a vote, there is sometimes:\n➜ Years of training\n➜ Hopes\n➜ Careers that can tip either way.\nIn this episode, we talk about the behind the scenes:\n➜ How do you judge impartially?\n➜ How do you decide when two dancers are at the exact same level?\n➜ Why does the difference sometimes come down to a detail, an attitude, an aura?\nWe shouldn't forget that the battle scene is both welcoming and very unforgiving.\nAs Nelson says, it's an intimate space where you have to be ready to bare yourself!\nAnd the reality is:\nSome dancers win but don't necessarily leave their mark on history.\nWhereas others — even without winning — leave an enormous imprint!\nThe real challenge for a high-level dancer is above all to find their unique way of moving.",
  },

  102: {
    title:   "The hidden face of social media in dance: harassment and mental health",
    excerpt: "An essential conversation about online harassment, social media and its impact on dancers' mental health.",
    quote:   "Being a man with a masculine appearance but having feminine gestures unsettles society in general, I think.",
    description: "He thought he was simply sharing his dance with his community.\nHe became the target of a wave of harassment.\nBehind his appearance as a man and his way of dancing, some people decided to see a problem.\nThe comments started pouring in.\nThe hatred too.\n➜ Threats, insults, violence.\nUntil it caused an anxiety attack and left him feeling unsafe in his own home.\nIn this episode of Dance Lab, we talk about cyberbullying, homophobia — and above all, what you can do to protect yourself!\n➜ Stop homophobie: Association fighting discrimination and anti-LGBT hatred https://www.stophomophobie.com\n➜ Le refuge: Foundation working to prevent isolation and su*c/de among LGBT+ youth https://le-refuge.org/la-fondation/\nBecause speaking up saves lives — and staying silent isolates.\nYes, hate speech is punishable by law. If you witness or are a victim of an offense, you can report content here: https://internet-signalement.gouv.fr\nPharos is the official platform for reporting illegal content on the internet.\nMaxime also explains in the episode the steps to take if you want to pursue legal action.",
  },

  101: {
    title:   "Why artists must create their own projects",
    excerpt: "A conversation about artistic autonomy, creating projects and the importance for dancers to build their own opportunities.",
    quote:   "I didn't ask myself whether to become an entrepreneur. I just went straight ahead.",
    description: "In dance — as in many creative and professional fields — taking inspiration can sometimes slide into copying.\nExcept inspiration isn't that.\nAnd yet I do see plagiarism, things that look far too similar, without anyone raising an issue…\nSo yes, you can admire, learn, observe — but it's up to each of us to transform what inspires us into something personal.\nIn this episode, Joseph shares all his keys for building your artistic or professional identity:\n➜ Exploring different universes\n➜ Focusing on yourself\n➜ And believing in what you do\nBecause in reality, creating your own projects means daring to go toward what truly draws you in.\nAnd telling yourself that if it works, great — and if it doesn't, oh well, at least you tried!\nAnd that in itself is very precious, and a thousand times better than copying.",
  },

  100: {
    title:   "Painting with your legs: transforming movement into a trace",
    excerpt: "An encounter between break, painting and performance where movement becomes a trace and the body a true creative tool.",
    quote:   "When you're curious you notice a detail and it can inspire you. Something simple can be beautiful.",
    description: "There's breaking — and then there's everything no one sees.\nKanti spent days defying gravity: spins, freezes, jumps — like every b-boy.\nAnd in breaking, every movement demands e-nor-mous strength, precision and energy. You can't fake it, it's so athletic!\nAnd yet, when a training session ends, nothing remains. [Okay, a video or two — but that breaks the storytelling]\nUntil the day he looked at the floor and noticed the marks left by his shoes.\nAnd a simple but powerful idea was born: ➜ What if these marks could become visible?\nHe started putting paint on his shoes and literally painting his movements.\nBy materializing breaking, each of his \"fluidities\" — as he likes to call them — became a hieroglyph, a visual alphabet telling his identity.\nKanti transformed the intangible into the tangible, and behind this approach, an essential lesson for everyone: our singularity is our strength — and it can leave a mark.\n➜ In this episode, we talk about the ephemeral nature of dance, its relationship to visual art, and how he captures the body's energy to transform it into tangible, personal traces.",
  },

  99: {
    title:   "How to build a career in pole dance?",
    excerpt: "An inspiring conversation about pole dance, discipline and the strength to believe in your path despite criticism.",
    quote:   "In the world of movement arts, I've met the most disciplined people of my life.",
    description: "People told her she wasn't made for dance, that she wasn't good enough.\nSo she wrote:\n\"I will be a dancer. I'll show them.\"\nToday, Marion Crampe is followed by more than 230K people.\nShe is 42 and has never felt:\n➜ Stronger.\n➜ More flexible.\n➜ More aligned.\nSpoiler alert: yes, she still works just as hard. And no, your career does not end at 30.\nShe began taking flight with her hands and arms around a pole.\nThen through her hair, with the practice of hair suspension.\nAnd she was drawn to water, where nothing ties her down.\nIn the world of art and movement, she has met the most rigorous people of her life!\nShe even had a word tattooed on her back:\n➜ Discipline.\nBecause performance is great — but alignment is what makes a career solid and lasting.\nAnd the more aligned you are, the more powerful your art becomes.\nIn this episode, we talk about resilience, pole dance, hair suspension, free diving, discipline, alignment — and what movement teaches us about life.",
  },

  98: {
    title:   "What we carry after having danced",
    excerpt: "A sensitive conversation about what dance leaves within us — between memories, transitions, injuries and new forms of creation.",
    quote:   "I think that until you go through an injury or a long forced break, you won't understand.",
    description: "\"When I found out I needed knee surgery, I decided to buy a controller.\"\nShe had to have knee surgery — so she bought a controller. Not to become a DJ. Just to avoid staying still and to stay connected to the community. Even if she couldn't dance, she could still mix! And thanks to that injury, she discovered a real passion.",
  },

  97: {
    title:   "Making society dance",
    excerpt: "A discussion about dance as a social tool, capable of creating connection, questioning norms and transforming perspectives.",
    quote:   "There's something very spiritual about the club. A form of elevation.",
    description: "Being a DJ isn't just playing songs. It's about adapting!\nIt's about creating spaces where everyone feels legitimate — where music doesn't separate but brings together a mixed, connected audience.\n➜ Yes, the DJ has that ability to read a room and create connection!\nThat is actually the very foundation of club culture: sociability.",
  },

  96: {
    title:   "Managing energy, risk and longevity on Soprano's tour",
    excerpt: "An immersion in the backstage of a tour with Soprano, between energy management, risk-taking and artistic longevity.",
    quote:   "When there's no pressure, what happens? Well, we bring out the best in ourselves. And we thank that kind of choreographer for taking good care of their dancer.",
    description: "High performance isn't just about performing. ➜ It's about being able to last, to listen to yourself, and to be disciplined. But above all! To surround yourself with people who take care of the dancer — not just the movement or the choreography.\nIn this conversation, we discovered his physical and artistic preparation, his collaboration with the choreographer and the artistic director, and how he experiences the pressure, risk and intensity of a tour as massive as Soprano's.",
  },

  95: {
    title:   "What DJs forget but dancers know",
    excerpt: "A conversation about the role of DJs, club culture and what listening to dancers can bring to the dancefloor.",
    quote:   "Inclusion, freedom of expression, safe space too. And I'm all for coexistence. No colour, no age, no orientation, no gender. Everyone is included and it must stay that way.",
    description: "\"Dancers have their moments — but those aren't their only moments.\"\nDo you need to be a dancer to dance to house music?\nAbsolutely not.\n➜ You mainly need to love this music.\nKapela is a dancer before being a DJ — he mixes the way he dances and dances the way he mixes.\nA matter of groove, timing, feeling.\n➜ Groove isn't about doing a lot.\nSometimes it's just a foot tapping: less is more, as they say.\nIn this episode, we talk about inclusion, the dancefloor as a safe space, a place where everyone coexists.\nWithout age. Without color. Without gender.",
  },

  94: {
    title:   "What no one tells you about becoming a choreographer: Soprano, stakes, humanity",
    excerpt: "An unfiltered conversation about the choreographer's profession, its human responsibilities and the realities of touring with Soprano.",
    quote:   "You can create amazing choreographies on video, but that's not necessarily what will make a hit. Dancing for a show, stadiums or very large events is different.",
    description: "\"Don't be afraid to say no.\"\n➜ What they don't teach you when you want to become a choreographer:\nChoreographing is not just assembling ideas. It's carrying a vision, thinking big for the stage, respecting the dancers — and knowing how to say no.\nAnything to add?",
  },

  93: {
    title:   "Healing grief through movement",
    excerpt: "An intimate conversation about grief, resilience and the power of movement to get through loss and rebuild yourself.",
    quote:   "As an artist, the best way to heal or rediscover a taste for life is through movement.",
    description: "\"Sawata is a cry of the heart, a cry of the body.\"\n➜ Born from grief, from lack, from loss.\nA cry of the body because movement is sometimes the only way to heal.\nFor her, grief is like water: it comes in waves, even as the years pass.",
  },

  92: {
    title:   "The strength of being twins, on stage and in life",
    excerpt: "A conversation about twinhood, complicity and the strength of moving forward together in dance, on stage and in life.",
    quote:   "Dance and artistic fields always demand more sacrifices than other types of careers.",
    description: "\"Everything is possible for those who believe.\"\n➜ Twins, dancers, athletes and artists.\nThe An&Ge Twins talk to us about discipline, demanding standards, the Soprano tour, and what makes them stronger together — on stage and in life.\nYes, being a dancer also means being a high-level athlete.\nHow to believe in yourself, transmit and keep going over time.",
  },

  91: {
    title:   "Dancing to speak: Krump to stay standing",
    excerpt: "A powerful conversation about krump, resilience and dance as a language to express your truth and stay standing.",
    quote:   "Krump reconciled me with part of my story.",
    description: "Creating isn't about looking for a \"beautiful\" gesture.\nIt's about asking: which gesture tells the truth?\nBecause as you grow up, traumas rise to the surface — and dance becomes a place where you speak without pretending.\n➜ Getting to the essential\n➜ Simplicity as honesty\n➜ Over-complicating = sometimes lying a little.\nUnderstanding that simplicity never lies.",
  },

  90: {
    title:   "Occupying the stage differently as a master of ceremonies",
    excerpt: "A meeting with Lÿdie La PëstE about the role of master of ceremonies, stage presence and transmission.",
    quote:   "I would define the master of ceremonies as the guiding thread of an event.",
    description: "In this short conversation, I meet Lÿdie La PëstE, a multi-disciplinary artist and essential figure on the freestyle scene — professional dancer, singer and mistress of ceremonies.\nThis brief interview was conducted at the battle \"THE MOBB IS CALLING: vol.1,\" as part of the Carte Blanche by Units, during the festival \"En Corps,\" in partnership with the Playground festival of the Rencontres chorégraphiques, at the Point Fort d'Aubervilliers.\nWe talk about her place on stage as an MC and her way of working with her energy — both soft, free and assertive — that defines her.",
  },

  89: {
    title:   "It's always about the human",
    excerpt: "A conversation with Soprano about the importance of people, the collective and the values that give a show its strength.",
    quote:   "It's always the human that comes first. That gives you a superb team. And when you have a great team you know they'll be there for each other.",
    description: "In 15 minutes, Soprano shares his perspective on what makes a show powerful beyond the music!\nAnd no surprise: \"It's the human that comes first.\"\nYes, things are finally changing. ➜ We value the human before the talent. And you have no idea how good it felt to hear that.\nWe also touched on: ➜ The power of collective work, ➜ The importance of being free to be yourself — on stage and in the audience.\nFor several years now, Soprano has surrounded himself with dancers, acrobats and performers, because he conceives the stage as a living space where the team's energy makes all the difference.\nAn inspiring exchange — but above all fun and very authentic, with two spontaneous moments I deliberately left in. [Okay, I did bleep 2–3 things though.]",
  },

  88: {
    title:   "The Mobb is Calling: a conversation with the grand battle winner",
    excerpt: "A meeting with Sam Yudat about the battle The Mobb is Calling, performance and the mindset of a winner.",
    quote:   "Take pleasure and always keep that thing that drives you, that flame deep inside you that makes you love dancing.",
    description: "I asked a few questions to the winner of the battle \"THE MOBB IS CALLING: vol 1\" during the Carte Blanche by Units, as part of the festival \"En Corps\" organized by La Place and the \"Playground\" festival of the Rencontres chorégraphiques at the Point Fort d'Aubervilliers.\nThis is Sam Yudat, member of the crew Yudat! Dancer, DJ — and also founder of Elyte Studio!",
  },

  87: {
    title:   "What's not said enough in dance",
    excerpt: "A candid conversation about the invisible difficulties of dance, perseverance and the realities artists keep too quiet.",
    quote:   "In France they want versatile people. But at the same time when you're too versatile, they think: there might be a problem — maybe she's mediocre somewhere.",
    description: "\"There were really very, very tough moments — and I genuinely thought about stopping.\"\nWe want versatile artists, but when they're too versatile, we question their legitimacy.\n➜ We put social media on a pedestal, but forget that selling yourself is a craft — not a universal skill.\nThe artistic CV gets replaced by Instagram, and visibility sometimes becomes more important than the actual work.\n➜ Careers can shift very fast: from very visible to invisible in a matter of months, creating guilt, self-doubt, mental exhaustion.\nThis episode is a reminder of something essential:\n➜ Not everything is your fault\n➜ Jealousy and symbolic violence are real\n➜ Passion must not come at the cost of your mental health\nA conversation that felt necessary, human — and a call for more kindness toward others and toward yourself.",
  },

  86: {
    title:   "Clubbing: a mirror of society",
    excerpt: "A conversation about clubbing, its codes, its history and the way the dancefloor reflects the evolution of our society.",
    quote:   "I stopped because I think I loved my sport too much. I left with my head held high but I was broken.",
    description: "\"I stopped because I loved my sport too much.\"\nIn this episode, we talk about her path between high-level sport and the club scene.\nJessica shares how the discipline she developed on the French national sport-études team helped her navigate a world full of clichés and judgment.\nShe shares her vision: clubbing as a space of freedom, creativity and learning — and the importance of managing failure to move forward in life and in your career.",
  },

  85: {
    title:   "Being an artist: dysmorphia, failure and snobbery",
    excerpt: "A candid discussion about body dysmorphia, failure, snobbery and the vulnerability behind the artist status.",
    quote:   "There's no shame in working the night shift.",
    description: "\"If you're not curious about others, I think something is missing from you as an artist.\"\nWe talk about snobbery, about clubbing being dismissed as \"cheap,\" when the night can actually be a vast terrain of creativity.\nWe also talk about body dysmorphia, the fear of your own image, the feeling of never being \"enough.\"\n➜ Paths that don't run straight.\n➜ Anxiety that drives you but also drains you.\n➜ Harassment that resurfaces even in adulthood — and a lot in dance.\nAnd above all: stepping back.\nBecause we don't save lives.\nAnd so sometimes, you just need to let it out.",
  },

  84: {
    title:   "Art heals: illness, resilience, vulnerability",
    excerpt: "A sensitive conversation about illness, resilience and the power of art to welcome your vulnerability and rebuild yourself.",
    quote:   "Being an artist is being vulnerable.",
    description: "When Ashley dances, it's her divine side expressing itself freely.\nContemporary dance taught her to stretch her krump, to test, explore, discover herself.\n➜ Her greatest strength? Resilience and vulnerability.\nWhen she fell ill in 2017, she understood that vulnerability means removing the masks and being real.\nYes, dance literally saved her — and today she wants to show that anything is possible and that life should be lived lightly.",
  },

  83: {
    title:   "Dancing, teaching, entrepreneurship: cultivating presence and creating meaning",
    excerpt: "A conversation about the multiple lives of an artist, between dance, pedagogy, entrepreneurship, presence and a search for meaning.",
    quote:   "You can do nothing and be completely present. You can do many things and be completely absent.",
    description: "\"You don't have to be all three to be recognized.\"\nBeing a performer, a choreographer or a teacher — these are three different jobs with different skills, networks and desires.\n➜ It's OK to love transmitting without wanting to create.\n➜ It's OK to thrive on stage without wanting to direct.\n➜ And it's OK to wear just one hat, as long as it fits you.",
  },

  82: {
    title:   "Building your vision of versatility: electro dance, fashion, music",
    excerpt: "A conversation about electro dance, fashion and music to build a versatility true to your own vision.",
    quote:   "Tecktonik is a brand; the dance is electro.",
    description: "Spoiler alert: Tecktonik dance never actually existed. End of debate.\nIn this episode we talk about Tecktonik (or rather electro dance), stage presence, invisible work — and that generation of dancers caught between social media, introspection and passion.",
  },

  81: {
    title:   "Sick leave vs workplace accident: the truth",
    excerpt: "A legal episode to understand the difference between sick leave and workplace accidents and the rights of performing artists.",
    quote:   "A workplace accident doesn't necessarily imply sick leave.",
    description: "With our guests Samuela Berdah and Raphaëlle Petitperrin, lawyers at the CN D — Centre National de la Danse, we untangle the misconceptions and explain:\n➜ What distinguishes a standard sick leave from a workplace accident\n➜ Why a workplace accident doesn't necessarily mean time off\n➜ The rights you need to know (compensation, protection against dismissal, etc.)",
  },

  80: {
    title:   "Why multidisciplinarity makes the difference",
    excerpt: "A discussion about multidisciplinarity, curiosity and complementary skills that allow artists to stand out durably.",
    quote:   "What matters is your performance, not your weight.",
    description: "In this episode, we dive into the inspiring journey of Charlotte Sumian-Hubener, who made versatility her greatest strength.\nFrom dance to circus, via yoga — she shares how this polyvalence opened the doors of Cirque du Soleil and allowed her to build a career on her own terms.\nShe also opens up about the imbalances she had to face: the pressure of the perfect body, eating disorders, loneliness on tour, watching her own career as a spectator — and the slow reconstruction through yoga and listening to herself.\nI found this conversation powerful — about healing, resilience and redefining success!",
  },

  79: {
    title:   "Understanding collective agreements in dance",
    excerpt: "A clear and concrete episode to understand collective agreements, employer obligations and artists' rights.",
    quote:   "A dancer cannot be paid below the collective agreement.",
    description: "Because the collective agreement is the law — just like the Labour Code.\nA dancer will never be paid at minimum wage. The minimum rates are defined, negotiated and publicly accessible. They guarantee a legal framework, rest periods, safety conditions and genuine recognition of artistic work.\n➔ An employer can always pay more, but never less.\n➔ The applicable agreement must compulsorily appear on the contract and pay slips.\n➔ All collective agreements are freely available at legifrance.gouv.fr.\nIn this episode, we put numbers, rules and tools on the table so that artists can defend their rights.",
  },

  78: {
    title:   "Standing out at auditions and freeing yourself from others' judgment",
    excerpt: "A conversation about auditions, singularity and the confidence needed to stand out without being weighed down by others' gaze.",
    quote:   "Casting is something anxiety-inducing.",
    description: "Casting — ah, casting.\nWe all know we won't all be chosen, and yet we show up and walk into the room wanting to give everything we have.\n➜ It's a moment where you have to observe, become a bit of a \"spy,\" absorb what inspires you, spot what resonates with your personality — and dare to offer something that goes beyond what's simply asked.\nBut dance isn't only auditions and selections. Today we see different bodies sharing the stage — and that feels good!\n➜ Because dance belongs to everyone.\nAnd yet many people don't dare to dance, for fear of others' gaze.\nIn this episode, Nicolas Huchard talks about his vision of dance as a way to reinvent yourself, to free yourself from others' judgment — and to inspire. We also talk about his view on casting and diversity in the artistic world.",
  },

  77: {
    title:   "Auditions and castings: what the law says",
    excerpt: "A legal conversation about auditions, prohibited practices and essential rights to know before attending a casting.",
    quote:   "You cannot make dancers wait in the street.",
    description: "Some things are simply illegal in an audition listing.\nAnd yet we still see them far too often.\nWhat you write commits you legally as an employer.",
  },

  76: {
    title:   "Dancing again after a double ligament rupture and bone avulsion",
    excerpt: "A testimony about injury, rehabilitation and the mental strength needed to dance again after a double ligament rupture.",
    quote:   "I had a double ligament rupture with a bone avulsion in my left ankle. At 37 I told myself: this is it, it's over. My career ends now.",
    description: "\"It was a descent into hell. Everything stops. Work really isolates you.\"\nIn this episode, Laura shares the ordeal of a serious injury: a double ligament rupture with bone avulsion in the left ankle.\nTogether, we address:\n➜ How her relationship with her body changed before and after the accident\n➜ The psychological and emotional impact of an injury on a dancer\n➜ The fear of being forgotten, and the difficulty of returning\n➜ The mental load, the financial and administrative challenges linked to intermittent worker status\n➜ The pressure of having to envision a future outside of dance\n➜ The lessons she draws today from this difficult period\nHer testimony moved me — because it sheds light on a reality of our artistic careers!\nSpoiler alert: we cried a little, and it wasn't planned.",
  },

  75: {
    title:   "Hiring an artist: everything you need to know",
    excerpt: "A practical guide on hiring an artist, contracts, declarations and the legal responsibilities of project holders.",
    quote:   "Employers are not entirely free in how they write their job postings.",
    description: "In this episode, I welcome my future favorite internet stars: Raphaëlle Petitperrin and Samuela Berdah, lawyers at the CN D — Centre National de la Danse — to break down the essential legal aspects of live performance.\nOn the agenda:\n➜ Why contracts and declarations go hand in hand — and how these processes protect both artists and employers.\n➜ The DPAE (pre-employment declaration) and the role of URSSAF in opening up social rights.\n➜ The reference number assigned by France Travail to each production: a mandatory tracking tool for securing employment.\n➜ The abattement: its advantages and disadvantages for the artist, and why their agreement is essential.\n➜ The employer's obligations regarding health and workplace safety — and how to assess and reduce risks.\n➜ The GUSO (Guichet Unique du Spectacle Occasionnel): a free, mandatory platform for non-professional performing arts employers.\nClear explanations, practical advice and essential reminders to avoid administrative pitfalls and get started on a first hire with confidence!",
  },

  74: {
    title:   "Dance, innovation and entrepreneurship: a visionary path",
    excerpt: "A conversation about dance, innovation and entrepreneurship to imagine new projects and build a visionary career.",
    quote:   "Sometimes we project and would like certain successes we've seen in others, but that's not our own path.",
    description: "This means you don't need to achieve what someone else has accomplished to succeed — but to find what makes sense for you and what makes you feel alive.\nIn this episode we talked a lot about entrepreneurship, touching on:\n➜ The genesis of La Fabrique de la Danse,\n➜ How the choreographic incubator works,\n➜ The link between dance and entrepreneurship,\n➜ The current challenges facing the choreographic sector.\nWe had this conversation to understand how dance could reinvent itself, structure itself and innovate — without ever losing sight of the human, the artistic and the emotional.",
  },

  73: {
    title:   "Denouncing and breaking the codes of classical dance",
    excerpt: "An engaged conversation about discrimination, power abuse and the need to break the codes of classical dance.",
    quote:   "What I denounced several years ago wasn't just a question of racism — it was also a system that leaves the door open to all kinds of abuse.",
    description: "Chloé puts words to the realities of a world that can generate abuse of power, psychological pressure, lack of representation and an absence of diversity.\n➜ And I thank her for it.\nIn her book Le Cygne noir, she shares her story with a powerful message of resilience, representation and emancipation.\nI devoured it in two evenings — I highly recommend it. It's powerful and it makes you think.\nShe also talks about her project BOLDSTEP, an initiative that transmits, innovates and gives power back to dancers.\nAn episode that questions the future of ballet and opens the way toward a more open, more just and more alive dance.",
  },

  72: {
    title:   "From DWTS to EuroMillions: how Inès chose, dared and succeeded",
    excerpt: "A conversation with Inès Vandamme about the choices, audacity and opportunities that shaped her artistic and media career.",
    quote:   "Being a coach on Dancing with the Stars is a huge job.",
    description: "To start, you have to get \"you won't make it\" out of their heads. And replace it with: \"I'm going to make it.\"\nInès reveals everything in this episode!\n➜ How did she build her artistic identity over the years?\n➜ What role does social media play in her career?\n➜ How do you manage criticism, the external gaze, the pressure of expectations?",
  },

  71: {
    title:   "How a magnitude 7.5 earthquake changed her dance",
    excerpt: "A story of resilience, creation and how a 7.5 magnitude earthquake profoundly transformed her dance.",
    quote:   "You know, the word 'copy' is the anagram of 'picore' (to peck) — those who copy ultimately just nibble.",
    description: "Copying means settling for crumbs.\nAnd it doesn't build a strong artistic identity.\nWhereas taking inspiration requires different work: it means cherry-picking in order to create something original.\n➜ Copying is staying small. ➜ Being inspired is creating — it's going beyond the infinite.\nIn this episode, we covered several topics, including the importance of originality: why it's essential for a dancer to stand out and create their own universe — and how dance can be a way to express yourself, tell stories and connect with audiences.\nWe also revisited the project \"La Haine,\" an original creation blending dance and music that generated a great deal of interest.",
  },

  70: {
    title:   "Creator at heart: 'Call Out – The Game', 'Qui veut être mon associé?' and content creation",
    excerpt: "A conversation about invention, entrepreneurship and content creation, from Call Out to Qui veut être mon associé.",
    quote:   "To all dancers: work on your marketing.",
    description: "That means knowing how to present yourself, make yourself visible and be strategic — because being a good dancer is no longer enough!\n➜ Understand that you are a \"brand.\"\n➜ Build a consistent image.\n➜ Use the right channels.\n➜ Highlight your experiences.\n➜ Create opportunities [instead of waiting for them to fall in your lap].\n➜ Think long-term.\nIn this episode, he shares the behind-the-scenes of this adventure: the original idea, the testing phases, community feedback, and his ambitions for the years ahead.\nWe also talk about dance today: its gaps, its drifts — but also its strengths, its promises, and the values Jérémie wants to embody and pass on to the next generation. Together we explore essential questions like:\n➜ Why create content for dancers today?\n➜ Should all dancers be on Instagram?\n➜ How do you maintain a healthy relationship with social media?\n➜ And is good content content that makes you want to dance?",
  },

  69: {
    title:   "Becoming a professional dancer without training: from rave parties to battles and voguing",
    excerpt: "An inspiring journey between rave parties, battles and voguing to become a professional dancer without traditional training.",
    quote:   "When I started dancing, I realised I wasn't taking care of my body.",
    description: "We often think that just following choreography or dancing a lot is enough to improve.\nBut in reality, we neglect warm-up, stretching, recovery, hydration — and even nutrition.\nThis is a reality I still observe in some professional dancers, even though of course everyone does what they want.\nFor Tianée, at the beginning she wasn't aware of the importance of listening to her body and respecting her limits to prevent injuries.\nShe often pushed hard without taking the necessary rest, which led her to accumulate tension — and even go through repeated burn-outs.\nIn this conversation, we'll talk about:\n➜ Her dual roots in electro and voguing;\n➜ Her approach to choreography with her collective;\n➜ Her perspective on institutions, the underground scene and battles;\n➜ And finally, what it means today to live from dance at 23 in Paris.",
  },

  68: {
    title:   "Multiple lives: Madonna, choreographer, embroidery and above all desire",
    excerpt: "A conversation about a multiple artistic life, between Madonna, choreography, embroidery and a constant desire to create differently.",
    quote:   "I thought to myself: Wait, am I going to dance for Madonna?",
    description: "She showed up in New York without an invitation to the casting.\nShe didn't speak a word of English.\nShe thought she'd been cut — when in fact she'd been kept.\nShe genuinely didn't understand the English.\nShe nearly botched her casting because of it.\nAnd yet, she was one of the 3 selected in New York.\nShe joined the world tours: Sticky & Sweet, MDNA.\nShe even choreographed the Rebel Heart Tour.\nBecause at some point, she told herself:\n➜ \"Why not me?\"\nToday, Émilie continues her path between @le.fildemi and the stage, recently signing the choreography for the show @lahaine.officiel alongside @yam_sonite, as well as the music video Impardonnable for rapper @thedamso.\nAn episode about boldness, transitions, resilience — and that inner strength that pushes you to take on everything.\nI'll end by saying that Émilie doesn't just have one string to her bow — she has many threads in her needle.\n[Pun intended, as always.]",
  },

  67: {
    title:   "Never sign another contract without listening to this episode first",
    excerpt: "An essential episode on clauses, rights and pitfalls to avoid before signing an artistic contract.",
    quote:   "You can never impose a recording.",
    description: "What this means is that performers (dancers, musicians, actors, etc.) hold a neighboring right to the author's right over their performance.\nTherefore, their agreement is required for any recording, broadcasting or exploitation of their interpretation.\nThis right is inalienable without their explicit consent, which typically takes the form of a contract or written authorization.",
  },

  66: {
    title:   "Dancing authentically: the stage as a space of freedom",
    excerpt: "A conversation about the stage as a space of freedom, authentic movement and the search for a deeply personal dance.",
    quote:   "Your body can abandon you within a year.",
    description: "Our body is our working tool — and like any tool, it needs upkeep.\nHere's what can happen without regular practice, without strengthening, without listening to your body:\n➜ The pains you thought were buried come back,\n➜ Muscle mass decreases,\n➜ Flexibility is lost,\n➜ And endurance too.\nGone.\nEqually, if you eat poorly or don't sleep well, your performance drops.\nSo if you don't take care of it properly, it can literally give out on you.\nIn this episode, we talked about his unconventional path and his artistic versatility.\nWe also discussed the role of art in inclusion and diversity — and how dance can convey powerful messages and create connection.\nHow is dance a means of expression for him?\nHow does he take care of his body in such a demanding profession?\nWhat pushes him to surpass himself?\nHow does he handle the challenges of the artistic world?",
  },

  65: {
    title:   "Inspiration vs plagiarism: how to protect your work?",
    excerpt: "A legal episode to distinguish inspiration from plagiarism, protect a choreography and understand the rights related to artistic works.",
    quote:   "Just because something is on the internet doesn't mean I can take it and reuse it as I please. All of that requires permissions.",
    description: "No — a video, a choreography, a piece of music or a text found online is not free to use.\nThere are legal rights that protect a work from the moment it's created, with no formalities required.\nThe author has:\n➜ A moral right [they must be credited, and their work cannot be modified without authorization]\n➜ And an economic right [their agreement is needed to use, reproduce, distribute, sell or exploit the work]\nFor example:\n1. You see a video of a choreography on Instagram.\n2. You decide to use it in a class, a music video or a creation without asking permission — because you had no bad intentions.\n3. You are in violation, because you are using someone else's protected work without authorization.\nConclusion: always ask for permission and credit the author!\nIn this episode, we had a rich, concrete and accessible conversation to better understand the legal issues that run through the lives of dancers and cultural sector players.\nWhether you're an artist, a project leader, or simply curious about the realities that structure the dance world — and you want to understand the law in these fields — this episode is for you!",
  },

  64: {
    title:   "Flamenco to create, transmit and resist",
    excerpt: "A conversation about flamenco as a language of creation, cultural transmission and resistance through movement.",
    quote:   "Wait, being a dancer is actually a job?",
    description: "That's the question we asked Rubén on the metro.\nAnd it struck us.\nBecause if adults still doubt this, how can we expect children at school to believe it's possible?\nDance is still too often perceived as a hobby — not a legitimate professional path.\nAnd behind this lack of recognition, there are deeper prejudices to be dismantled.\nIn this episode we talked about flamenco, his creative vision and his relationship to staging, transmission and cross-disciplinary creation.",
  },

  63: {
    title:   "Everything you don't know about intermittent employment and combining activities",
    excerpt: "A practical conversation about intermittent employment, combining activities and the rules to know to secure your artistic career.",
    quote:   "You can do all those hours with the same employer. The only thing to keep in mind is that it will automatically trigger an audit at France Travail.",
    description: "Whether you're an artist, a project leader, or simply curious about the realities that structure the world of dance — and you want to understand the law in these fields — this episode is for you!",
  },

  62: {
    title:   "Starting at 17, mental health and DWTS",
    excerpt: "A conversation with Joël Luzolo about his late start, mental health and his experience on Dancing with the Stars.",
    quote:   "There's a huge taboo around depression among dancers.",
    description: "In general, in society, I find that admitting to or showing that you're depressed is perceived as being weak, unstable or professionally unreliable.\nEven if more and more dancers are starting to speak up, the myth of the beautiful, strong dancer still persists.\nIt is completely normal to talk about:\n➜ Doubts\n➜ Mental health\n➜ Low periods\nThe risk of not talking about it is developing associated disorders like eating disorders, anxiety, addiction, etc.\nIn this conversation, Joël also looks back on his participation in Danse avec les Stars: the behind the scenes, how he experienced that sudden visibility and what it changes in a career. We talked about managing your image, social media, criticism and media exposure.\nWe talked about the relationship with the body: how to stay high-performing, prevent injuries, recover and regenerate physically and mentally in order to last over time.\nHe also shared his tools for resilience, along with some advice he would have liked to receive at the start — essential in such a demanding world for developing and refining your artistic identity.",
  },

  61: {
    title:   "Dancing with your heart: from battles to the Olympic Games",
    excerpt: "A heart-guided journey from battles to the Olympics, between passion, discipline and loyalty to your dance.",
    quote:   "Today I'm starting to understand the meaning of why I dance.",
    description: "But why do we dance?\nBecause it's natural, instinctive. Because our bodies need it, because it feels good, because we love it.\n➜ Because it liberates us.\nIt's not just a movement of the body — not just a passion.\nIt's a language.\nA way of saying what we can't always put into words. A refuge for some.\n➜ And by the way — why do you dance?\nIn this episode we'll talk about her artistic identity, her vision of transmission through her INTRO training, motherhood as an artistic and personal transformation. We'll also explore resilience, discipline and the love of movement — tracing everything dance has brought her in her personal journey.",
  },

  60: {
    title:   "Reinventing yourself to always shine: dance, motherhood, music",
    excerpt: "A conversation about artistic reinvention, motherhood and music to keep evolving without losing your light.",
    quote:   "There are loads of dancers who are so talented but aren't working, because they don't have the right connection with the right person.",
    description: "Why? Because in this world — as in many others — connections and networks play an enormous role. Let's not kid ourselves.\nThat's where you need to be more socially strategic, more visible on social media, or closer to the decision-makers — the ones with the contracts, etc.\nThat said, without being fake about it — people can sense the energy when it's not genuine…\n➜ People often call on those they know, have worked with before, or see regularly.\nIt's a logic of network and trust.\nSo make yourself visible — and cultivate your relationships in the professional world.\nIn this episode, Fleur shared her journey of resilience, transformation and self-affirmation. We talked about bodies, gazes, choices, femininity, motherhood and freedom.\nAn episode where we explored Fleur's garden — cultivated on her own terms.\n[And there it is — a great pun.]",
  },

  59: {
    title:   "Getting on every train: Beyoncé, motherhood, ambition and versatility",
    excerpt: "A conversation about ambition, motherhood and versatility, along an international career notably marked by Beyoncé.",
    quote:   "Today, the more open you are and the more colours you have in your dance, the more work you can get.",
    description: "It's like an artistic metaphor meaning:\n➜ Mastering several dance styles,\n➜ Knowing how to adapt your body and energy to different aesthetics,\n➜ Developing a nuanced identity of your own.\nAnd to get there, you need to be curious, step out of your comfort zone, embrace the fusion of styles, and be open to feedback in order to evolve.\nIn this episode, we revisited her journey, the difficulty of being a multi-faceted artist in France — as well as her reflections on transmission and representation.\nWe also talked about managing stress, her relationship to the stage since becoming a mother, and what it means for her to be a role model — sometimes despite herself — for younger generations.",
  },

  58: {
    title:   "Freeing the body to emancipate: voguing, femininity, Beyond and MaisonM",
    excerpt: "A conversation about voguing, femininity and the body as a space of emancipation, creation and freedom.",
    quote:   "When you transmit, you're obliged to have a consciousness of what you're saying.",
    description: "This means:\n➜ Being clear about the words you use, the instructions you give, the messages you convey\n➜ Being aware of the impact this can have on the person in front of you — whether on their body (injury or progress), their self-confidence, their relationship to dance, or their identity\nBeing conscious of what you say means being responsible, ethical and caring in your pedagogy.\nIn this episode we discussed:\n➜ How do you free movement from aesthetic constraints?\n➜ What is the importance of body memory in creation?\n➜ How can dance become a political, poetic and collective space?\nAn episode where movement becomes language — and where dance becomes a tool of resistance and love that allows us to rethink our relationship to the body, the group and creation.",
  },

  57: {
    title:   "How to make a living from dance in Los Angeles and dance for the biggest stars?",
    excerpt: "A conversation about a dancer's life in Los Angeles, auditions and the work needed to accompany the biggest stars.",
    quote:   "At first you're motivated, you're fully committed — but after a few weeks you think: Wait, I've done 30 auditions and I haven't been called?",
    description: "At first, you believe in it. You give everything. Then the days pass, the weeks too.\nYou rack up the auditions but no response, no callback — sometimes not even a glance.\n➜ That's the reality of our profession!\nGradually, doubt sets in — and I think that's normal.\nYou start wondering if you're in the right place, if you're at the right level, if you're doing something wrong. And then the motivation begins to waver. Because you were always told that if you worked hard, you'd eventually be rewarded.\n➜ Except in this industry, it doesn't always work that way. There's the effort, yes — but there's also the waiting, the randomness, luck, connections, the tastes of the moment, and everything you can't control.\nThat's when a lot of people quit, telling themselves: \"If after 30 auditions I still have nothing, maybe I'm not cut out for this.\"\nAnd sometimes, it just takes the 31st.\nIn this episode, we'll talk about her Belgian-Ghanaian identity and how it feeds her dance.\nThe artist status in Belgium: is it a safety net or an illusion for artists?\nHow do you sign with a US agency and make it in L.A. when you come from Europe?\nWe'll also explore her perspective on the industry, the behind the scenes, the rigor — and the balance you need to find in order to last in this profession.",
  },

  56: {
    title:   "How to act against and prevent sexist and sexual violence in dance?",
    excerpt: "An essential discussion about preventing sexist and sexual violence, harassment and creating safe dance spaces.",
    quote:   "For me, if we don't act, we're somehow complicit. And it means we're accepting the violence that's being suffered.",
    description: "In this exchange, Mélodie gives us concrete tools for understanding, responding and building a safer, more respectful and more just artistic space.\nHow do you get trained?\nHow do you create safer spaces? How do you act if you witness or experience something?",
  },

  55: {
    title:   "What choreographers don't know but the IADU teaches them",
    excerpt: "A conversation about the choreographer's profession, its professional challenges and the resources offered by the IADU.",
    quote:   "It may be better to lose a venue or a partner but remain true to yourself.",
    description: "This phrase raises a classic dilemma between personal desires and professional opportunities!\nAnd personally, I think it's a strong, courageous and necessary position to hold — especially in artistic fields like dance.\n➜ Staying true to yourself allows you to build coherent, sincere and lasting work.\nConversely, compromising too often can lead to a loss of meaning, creative drive and even credibility.\n➜ But of course, it all depends on context, the values at stake and what you're willing to take responsibility for in the long run!\nIADU is a unique program dedicated to supporting and professionalizing artists in hip-hop and so-called \"urban\" dance.\nIn this episode, we'll revisit the origins and ambitions of IADU, how it works, its pedagogical specificities and its impact on artists' careers.\nA rich exchange to better understand how an ecosystem of support for urban dance artists gets built — and why IADU plays a key role in today's cultural landscape.",
  },

  54: {
    title:   "Perfectionism and legitimacy: dare to be mediocre to free your creativity",
    excerpt: "A conversation about perfectionism, legitimacy and the courage to accept imperfection to fully free your creativity.",
    quote:   "When we want to measure up, we've already adopted the belief that we think we're not enough.",
    description: "In dance, the moment you want to \"measure up,\" you've already bought into the idea that you're below.\nIt's not just about high standards — it's a limiting belief in disguise.\nYou don't dance to prove you're good enough. You dance to explore, to say something, to surpass yourself — not to compare yourself.\n➜ Wanting to measure up usually means dancing with fear, instead of dancing with your heart.\nIn this episode, we talked about his journey, his path toward an embodied and spiritual dance, his pedagogical approach as artistic director at La Manufacture in Aurillac, as well as his creative process — which will take us into questions of legitimacy and doubt, and toward what it means to \"dance freely\" in 2025.\nAn inspiring exchange with an artist who is as humble as he is visionary.",
  },

  53: {
    title:   "Believing in yourself to build your dreams and dance without limits",
    excerpt: "An inspiring conversation about confidence, work and perseverance needed to build your dreams and dance without limits.",
    quote:   "There really are no limits; you can truly go wherever you want.",
    description: "And as Sabrina puts it so well, there is a price to pay afterward:\n➜ The price of investment.\nIn this episode, we explored the mental and perseverance side of dance — a topic at the heart of her journey and her teaching.\nSabrina talked about her own experience with pressure, injuries, self-doubt — and how she transformed each challenge into a driver of growth.\nWe also discussed the importance of kindness in her classes, and how she encourages her students to develop their individuality and confidence.\nShe also shared her perspective on the challenges she faced — from her time as a student to her early years as a teacher and professional — and how she overcame the obstacles, including difficult experiences with toxic teachers and external judgment.",
  },

  52: {
    title:   "Cultivating difference, elevating art",
    excerpt: "A conversation about singularity, the highs and lows of an artistic journey and the strength of transforming your difference.",
    quote:   "Life is cycles; as dancers we go through bad cycles. That's fine — it's your learning.",
    description: "There are highs and there are lows. That's normal.\nThere are moments when you feel like you're going backward, doubting — sometimes even losing yourself.\nBut don't worry, it's part of the path.\nIt's a cycle, and it will pass — because the moments when you're at the bottom are not failures. They are lessons.\nSee these lessons as opportunities to build something new — not as constraints.\nIn this episode, we talked about the gaze of others and casting, the place of LGBTQ+ artists in the music industry, the shadow and light of an artistic career — and the importance of cultivating your difference and putting joy into your work.\n➜ Why should you not see a rejection as a failure?\n➜ How are dance and music a metaphor for life?\n➜ Can you be an artist without being engaged?\nMark Weld shared his vision, his energy and his love for art.",
  },

  51: {
    title:   "Education, creation, transmission: dance as a social relay",
    excerpt: "A discussion about dance as a lever for education, transmission and social connection with young people.",
    quote:   "There are nowhere near enough dance classes for young people. It would change lives! It can reconnect young people with school.",
    description: "Dance can be a real lever for re-engaging young people with school — giving them back confidence, motivation and discipline!\nDance is above all a universal language — but also a genuine social connector.\nAnd by sharing art, by sharing dance, from school onward, we bring different visions of society!\nFor example, you can't be racist, sexist or homophobic if dance has taken you on a journey — because you'll have connected with people from all over the world!\n➜ You dance their stories, you feel their struggles, you understand their cultures.\nThrough dance, you see things that non-artists and ordinary people don't get to see! [No offense to the muggles.]\nAlso, the values we learn in dance translate into life:\n➜ Being on time\n➜ Mindset\n➜ Work ethic\nThere is so much to do with dance in schools!\nIn this episode, Arnaud talked about his journey, his constant artistic research, his vision of dance as a language in perpetual evolution — street show — and the importance of artistic and cultural education for young people.",
  },

  50: {
    title:   "Shaking things up with kindness, breaking free from boxes with versatility",
    excerpt: "A conversation about kindness, versatility and the boldness needed to shake up conventions without getting locked in boxes.",
    quote:   "We need our role models to change and kindness is part of that.",
    description: "We need to transform the way we function as a society.\nOur current models — social, cultural and professional — need to change, and they need to put kind people in the spotlight.\n➜ We clearly need human values.\nBy the way, if you haven't seen it yet, I highly recommend Karim Leklou's speech at the last Césars ceremony.\nKindness is not a weakness — it's a reference to adopt in how we act in society.\nIn this episode, we revisited her unconventional path, the way dance feeds her acting career — both physically and mentally.\nWe talked about resilience, relationships, the importance of having mentors — but also about transmission and empathy in an artistic world that can sometimes be harsh.\nZoé shared her vision of a freer artistic world, where each person builds their own path, far from imposed boxes.",
  },

  49: {
    title:   "Building an unlimited career: the power of versatility",
    excerpt: "A conversation about versatility, career choices and the skills that allow you to build an unlimited artistic journey.",
    quote:   "No one will invest more in you than you yourself.",
    description: "I didn't know which phrase to use as a hook because there were so many — but I found this one impactful and very telling.\nIf you're not the first person to believe in yourself, why would others?\nThe truth is: if you don't take the initiative to go for it, very few people will do it for you — unless you've already gained enough recognition or social credibility.\nIt all starts with you!\nIn this episode, Krees talked about his journey, his turning points, his encounters, his collaborations — the importance of resilience and hard work in the face of doubt and failure, and the role of talent in success.\nHe also shared the lessons from his large-scale projects, his future aspirations and his advice for those who want to pursue an artistic path.",
  },

  48: {
    title:   "Creating and dancing for diversity",
    excerpt: "An engaged conversation about diversity, representation and the creation of a dance where everyone can find their place.",
    quote:   "There's no code. Above all there's work and desire and passion.",
    description: "There is no single way to succeed in dance.\nThere is also no predefined path or unique method for getting there.\nYes, some people make it through rigorous, often academic classical training — but others are self-taught. Some by joining a prestigious company, others by creating their own style.\nIn short, there's no one way to succeed.\n➜ \"Above all, it takes work\":\nEven if talent helps, it doesn't do everything — it's a combination of practice, repetition and rigor that makes the difference. And regardless of your dance style!\n➜ \"Desire and passion\":\nMotivation, determination and love for dance — everything that keeps you going over the long term.\nThe job is hard [yes, I think it's important for me to use the word \"job\" here], the world is demanding — but passion is what pushes you to keep going through failures, injuries and doubts. [Yes, everyone doubts. Don't worry, you're not alone.]\nSo there's no magic recipe. Just work.\nIn this episode, we talked with Tamara about her journey, her choreographic approach and her commitment to a more open and more conscious dance — as well as the realities of the profession.\nTamara shared her reflections on entrepreneurship, the place of women in live performance, and the values that guide her work.",
  },

  47: {
    title:   "Dancing to embody: the art of creating characters at Just Dance",
    excerpt: "An immersion in Just Dance to understand how movement, interpretation and play bring memorable characters to life.",
    quote:   "It's not just the dance. It's really about trying to stand out through intention, energy, interpretation, the way people dress — it catches the eye.",
    description: "Benjamin said another very true thing in the episode: \"Someone who doesn't dance that well, or doesn't have much technique — if they embody it, they'll hit you right in the retina, and you won't forget them.\"\nAnd that is so true.\nOf course, if you want to become professional, technique will be unavoidable — but it's also not true that full technique means you'll get all the jobs.\nIn dance,\n➜ you tell stories,\n➜ you convey emotions,\n➜ you send messages,\nand if you don't interpret, no matter how great your technique is, the audience or jury will be less moved — or simply won't book you.\nBenjamin explains it very well in the episode: there were dancers who were technically very strong, musically on point, etc. during the Just Dance auditions —\nBut whose faces were blank, or who didn't fully commit to their interpretation.\nUnfortunately, they weren't selected.\nTechnique < Interpretation\nTechnique + Interpretation = Winning combination\nIn this episode, we'll talk about:\n➜ His relationship with dance and what it brings him day-to-day,\n➜ The importance of multidisciplinarity in an artistic career,\n➜ His work on Just Dance and his creative process at the crossroads of fashion and performance,\n➜ His advice for those who dream of joining a project like Just Dance or working in costume design.",
  },

  46: {
    title:   "Revealing talent and supporting artists in their artistic career",
    excerpt: "A conversation about spotting talent, mentorship and the essential values for building a lasting artistic career.",
    quote:   "Those who succeed in this profession aren't necessarily the best. They're the ones with the best mindset, most determined and who don't give up.",
    description: "I have nothing to add.\nIn this episode, Nathalie shared with us:\n➜ The values that guide her work,\n➜ The challenges she's faced in her career,\n➜ Her transition from stage to accompaniment.\nShe also talked about:\n➜ Cultivating your uniqueness,\n➜ Finding a balance between personal life and career,\n➜ Breaking free from the standards imposed by the industry.\nNathalie unveiled some of her methods and a few practical exercises, alongside reflections on the future of artistic accompaniment.\nIn short, she says interesting things.",
  },

  45: {
    title:   "Finding your path and forging your destiny to dare and shine",
    excerpt: "A conversation about choices, failures and the confidence needed to find your path and shape your own destiny.",
    quote:   "Failure must be part of a career for genuine self-questioning, for solid building. Failing has given me big moments of solitude.",
    description: "Failure lives inside us and will always be part of our lives.\nA very uplifting phrase to open this new episode. Or not.\nNo — what I mean is that failure is often perceived as something negative, and I understand that after a while, it can become frustrating and even discouraging.\nIn dance, you go through job interviews almost every day. Casting announcements come in fairly regularly for:\n➜ Events,\n➜ Live performance,\n➜ Advertising shoots,\nAnd more.\nYou still have to fit each of those listings.\nAnd of course, that's not always the case — it depends on the profiles they're looking for and the physical criteria defined by the artistic direction.\nBut when you do fit a listing, you go for it, you push yourself, you take your shot and you hope to be \"chosen\" among the thousand other people.\nAnd you fail 9 times out of 10. Not because you're not a good dancer —\nBut simply because there is a lot of demand for very few spots, and often it doesn't depend on the quality of your performance — just the number of places available.\nSo failing should not constantly call your worth and talent into question.\nIn this episode, Julien shared his thoughts on his personal challenges and those of the profession: the relationship with the body, the pressure of social media — and his fears about the future [a real topic when you have a supposedly short career].\nHe also talked about his desires, his artistic ambitions, artistic management — and his wish to pass on his aesthetic vision.",
  },

  44: {
    title:   "Artificial intelligence and progress in service of dance",
    excerpt: "A conversation about artificial intelligence, innovation and the new possibilities technology offers the world of dance.",
    quote:   "Among people who don't dance much — investors or institutions — there's often a narrow or somewhat retro vision of dance.",
    description: "There are still a lot of judgments about dance.\nAnd yet it's a huge market that will keep existing and evolving.\nOver the past 5 years, dance has taken up more and more space in society:\n➜ Social media,\n➜ Fashion shows,\n➜ Influencers,\n➜ Advertising,\nAnd more.\nThere is so much to do in this world, so many problems to solve and concepts — even businesses — to create.\nIn 2–3 years, dance will be even more omnipresent: on screens, on social media, at your events. This is only the beginning.\nDon't miss the boat — if you see even a small opportunity in the dance world, go for it. Invest, or simply hire dancers. We make a difference.\nI digress!\nDANC·R is:\n➜ An app that generates motivation and self-confidence,\n➜ An algorithm that makes more than 1 million calculations per minute of dancing,\n➜ A system for self-evaluating your dance through movement comparison.\nIn this episode we talked about the genesis of DANC·R, the concept and how the app works:\n➜ How can AI recognize and analyze dance movements with such precision?\n➜ How can DANC·R revolutionize the way we practice dance?\n➜ What business model did they choose?\n➜ And finally, how can you — as a listener — contribute to improving the app and become an actor in its development?\nThank you to Extraterrien / Barth Fendt for lending your recording studio and for your time and advice.",
  },

  43: {
    title:   "Entrepreneurship and learning, teaching and inspiring",
    excerpt: "A conversation about entrepreneurship, learning and transmission to teach dance while inspiring others.",
    quote:   "I also sense there's this race to prove you're a good dancer. Lots of contracts means I'm good; few contracts means I must be bad.",
    description: "It's terrible — but that's also what I feel.\nAnd just like Loriane, I believe the answer is no.\nThe number of contracts you've landed does not define your worth as a dancer.\nWhat's more, don't forget that many contracts that seem prestigious are not the most rewarding.\nSo if you see a dancer who's done fewer contracts, it may be because they've chosen not to work with a certain person out of respect for their own values.\nAnd that doesn't call their talent into question at all.\nSame goes for followers — don't always go by that.\nEspecially in a world where recognition is often skewed by external criteria like popularity or volume of work.\nYou can have very few followers and be an excellent dancer.\nYour follower count does not define your worth.\nAnd if you have a lot — great for you. You've surely worked very hard to get there, and that's wonderful. It's inspiring.\nThis may seem very contradictory, but I invite you to listen to the episode to understand it better.\n➜ In the end, like everything else — it's about knowing where to set the dial!\nIn this episode, we talked about her journey, her motivations, her perspective on the evolution of dance styles, her vision of entrepreneurship and social media.",
  },

  42: {
    title:   "Creating connections through dance, transmitting through sharing",
    excerpt: "A conversation about the power of dance to create connections, share experiences and transmit beyond movement.",
    quote:   "Many are called but few are chosen.",
    description: "This phrase is so true and reflects the reality of our profession.\n➜ When you go to a casting, sometimes you're one of 300 — sometimes one of 3,000.\nFor how many spots?\n➜ 2, sometimes 20.\nBut in your head you have to believe you're the best —\n➜ Number 1.\nWithout crushing others, of course.\n[Yes, I feel the need to say this in 2025, because I still see it.]\nEqually, if you tell yourself it'll always be the same people who get picked — you're already out.\nMindset, friends. Mindset.\nWork on yourself, your mindset, your mental game — it's the most important thing in dance.\nIn this episode, we talked about the creation of the Crysael company, their approach to movement and pedagogy, and their reflections on the dance industry in France.",
  },

  41: {
    title:   "Dance, fashion and authenticity: creating to tell a story",
    excerpt: "A conversation at the intersection of dance and fashion, where authenticity becomes the starting point of creation.",
    quote:   "Everyone should take dance classes to know their body, know their space. I think it would help a lot of people let go of their complexes.",
    description: "For the \"knowing your body\" part, we've talked about it in almost every episode:\n➜ Episode 2. How boxing can improve your dance, with Omar Dramé\n➜ Episode 16. How Pilates can help you overcome injuries, with Justine Gérard\n➜ Episode 23. Embracing your femininity through heels, with Julie Bagalciague\nEtc…\nFor the \"managing your space\" part, we talked about…\n➜ The metro.\nA serious topic!\nBetween those who don't move aside and those who block the exits because they're afraid of losing their spot and not being able to get back on.\nCome on, people — let's all make an effort!\nAnyway, there's so much to say.\nWe figured the RATP should hire dancers to solve the situation!\nA campaign idea? Just saying.\nAny communications agency out there?\nIn this episode, we explored his artistic vision, his landmark projects — including the opening ceremony of the Paralympic Games — and his reflections on identity and how he uses dance to express emotions.\nWe also talked about the impact of Paris on his journey, and his advice for young artists looking to carve out a space in the dance and fashion industry.",
  },

  40: {
    title:   "Between passion, perseverance and the reality of the profession",
    excerpt: "A clear-eyed conversation about passion, perseverance and the professional realities that shape a career in dance.",
    quote:   "There's no deadline if you truly want it. But only work pays off.",
    description: "For a long time, Laëtitia thought she was going to struggle because it was too late…\n➜ That's one of the many clichés in dance:\nYou need to start very young to succeed.\nFALSE!\nYou can start at 15, 20 or even 30 if you want.\nOf course, depending on your goals, you may need to work harder —\nBut nothing is impossible!\nIn this episode, Laëtitia shared her journey, her challenges, her triumphs — and the lessons she drew from them, reminding us that passion alone can carry us beyond our limits.\nWe even talked about the realities of our world — and it stings!",
  },

  39: {
    title:   "Revolutionising dance in Paris: from start-ups to the dancefloor",
    excerpt: "A conversation about entrepreneurship and new dance spaces, from Parisian start-ups to the creation of a real dancefloor.",
    quote:   "I stopped dancing because I couldn't find anywhere I felt at home. Everything we were telling ourselves — it actually existed!",
    description: "Late 2019, Fanny texts Rachel on WhatsApp: \"Come on, let's open a dance school.\"\nTheir mission? To offer beginners a space to reconnect with dance, make friends and just enjoy it.\nSo a little while later, they raise funds, find investors — it's all happening, and then…\nLockdown.\nAs Rachel says in the episode: \"I think at that point the investors thought, 'Bye bye, money.'\"\nBut they're still standing!\nTheir edge — and what makes Dancefloor special?\nThey're amateur dancers themselves, so they can genuinely test what a real beginner class feels like!\nBut just because it's accessible doesn't mean it's easy!\nBecause yes, dance is hard!\nAnyway, Rachel tells us everything.\nIn this episode, we talked about the genesis of the project, the philosophy behind Dancefloor, the importance of great recruitment — and of course, Rachel's inspiring journey.\n➜ How did this idea come to life?\n➜ How did Rachel Vanier and her co-founder Fanny Seroka manage to create such a place?\n➜ What challenges did they face, and what are their ambitions for the future?\nThat's what we discovered together in this episode.",
  },

  38: {
    title:   "Pressure, perceptions and eating disorders: reconciling body and soul",
    excerpt: "A sensitive conversation about eating disorders, the pressure of being watched and reconciling your body with your artistic identity.",
    quote:   "It's people's comments and gaze that made me wonder: should I force myself to please others or should I remain myself?",
    description: "Choosing to be authentic in a world — and an industry — where appearance is judged and often criticized [quite harshly, clearly] is not easy.\nSo he learned to work with it.\n➜ Especially when it impacts you mentally and physically: eating disorders (TCA).\nIn this episode, we talked about his journey, the battles he faces daily, and how he transforms these experiences into strength.\nYanis also shared his reflections on the physical and mental pressure in the dance world — as well as on rigor, positive thinking and the importance of surrounding yourself well.",
  },

  37: {
    title:   "Forging your singularity: electro dance, vision and resilience",
    excerpt: "A conversation about electro dance, resilience and building a singular vision to fully assert your artistic identity.",
    quote:   "If we all said no, productions would have no choice but to raise wages and pay people what they're actually worth.",
    description: "If all dancers and artists refused to work for insufficient pay, the people who hire us would be forced to rethink their pricing and compensate us fairly.\nWe're going to talk about the Olympic Games.\n(An example outside this episode's main context — but a good one, since it was widely covered in the media.)\nYes, it was a fantastic event, and the dancers loved it — but behind the scenes, you don't see everything.\nAs Jade says, people often imagine that working with big artists or at major events is \"wow, incredible.\"\nAnd yet…\nFour days before the opening ceremony of the Olympic Games, 150 dancers — or more — had to raise their fists in protest, refusing to participate in the final rehearsal.\n➜ Why? To denounce \"wage inequalities\" between artists performing on the same stage.\nThanks to this collective action and the intervention of unions like the SFA-CGT, a pay revision was agreed upon, allowing rehearsals to resume.\nWhen a majority of artists unite to say no, it establishes a norm where artistic work is better recognized and properly compensated.\n➥ In this episode, we explored Jade's journey, her beginnings, her influences, her vision of dance and its importance in society.\nWe analyzed the evolution of the electro scene, her approach to teaching, and her future projects.\nThen a few pieces of advice for dancers — and her thoughts on the mindset needed to succeed.",
  },

  36: {
    title:   "From stereotypes to self-acceptance: eating disorders, pressure and injuries",
    excerpt: "A testimony about stereotypes, eating disorders, pressure and injuries on the journey toward greater self-acceptance.",
    quote:   "Also lots of remarks: 'You've got big a**es. If you keep eating like that, we could roll you across the floor.'",
    description: "Mélissa's words are at once moving, heartbreaking and revealing of what some in our world have experienced.\n➜ Just yesterday, I was discussing this with other dancers and we said: \"How can anyone witness this — or be the victim of these words — and say nothing?\"\nFor most of us, we grew up with these excessive, completely destructive expectations.\nAnd yes, that is profoundly toxic.\nI've already received work contracts containing this clause, word for word: \"A weigh-in may be carried out once a month.\"\nAnd no, this is not a necessary weigh-in — because we are not supposed to be fighting in a ring.\nI put out a call for people to speak about this topic. I was both surprised and not at all surprised by how many people wrote to me, wanting to share their stories.\nAnd her perspective seems essential to me for questioning the beauty standards in the dance world — and putting body diversity back at the center of everything.\nThere is no \"ideal body\" to succeed. Just a person with passion who wants to move forward.\n➜ In this episode, we addressed the challenges dancers face — including eating disorders, the pressure of body image and the psychological consequences of these excessive demands.\nWe also talked about the relationship with injury (torn cruciate ligaments).\nMélissa shared her testimony, with the central message that accepting yourself as you are is paramount.",
  },

  35: {
    title:   "Choreographing with the heart, dancing with souls",
    excerpt: "A conversation about choreography, intuition and the way of creating with the heart to make emotions dance.",
    quote:   "It's not ok to speak badly to people, it's not ok to treat them badly, it's not ok to be underpaid.",
    description: "And these words apply to every professional field, regardless of your experience.\nSo I have nothing more to add.\nIn this episode, Manon explained to us how to go beyond pure technique — and how she explores human relationships, diversity and the importance of the individual within a collective.",
  },

  34: {
    title:   "When difference and the quest for identity disturb",
    excerpt: "A conversation about difference, identity and the reactions that singularity provokes when it refuses to conform to norms.",
    quote:   "It's hugely important to go toward the unknown. And I've felt and seen that I've unsettled people with that, because difference unsettles.",
    description: "Yes — being capable of doing things others are not can be unsettling.\nWhy?\nBecause it calls into question the norms, habits and comfort zones of others.\nBut like Thomas, I strongly believe that difference is a source of richness and innovation.\n➜ It pushes us to surpass ourselves and expand our comfort zones.\nIn this episode, Thomas wanted to share with us a deeper vision of our profession as dancers.\n➜ He talked about his commitment to representing the LGBTQIA+ community in the world of dance — and beyond — as well as his personal journey marked by self-acceptance, the search for authenticity and identity.",
  },

  33: {
    title:   "Single mum and dancer: sacrifices, balance and rebuilding a family",
    excerpt: "A testimony about single motherhood, sacrifices and the search for balance between a dancer's career and family reconstruction.",
    quote:   "I was teaching classes, I'd bring her with me, I was breastfeeding my daughter right in the middle of class.",
    description: "Cécilia shares honestly how she had to face difficult choices.\nBeing a mother and a professional dancer is possible — but requires serious organization.\n➜ So for several years, Cécilia had to put her career on pause to take on her role as a single mother.\nAnd she did all of this out of love for her daughter.\nToday, she has learned to accept herself, to embrace every stage of her life — and even to rebuild a family while living from her passion.\nIn this episode, we revisited the highlights of her career, from her promising beginnings to her current projects — including her experience on Koh Lanta.\n➜ We also explored a more personal side of her life: motherhood.\nCécilia shared her quite unique and deeply moving experience as both a dancer and a former single mother — and revealed how she balances her different passions.",
  },

  32: {
    title:   "Effort, authenticity and humanity: the keys to surpassing yourself",
    excerpt: "A conversation about effort, authenticity and the human qualities that allow you to progress and go beyond your own limits.",
    quote:   "It's important to give people the home you want them to come to.",
    description: "Beyond technique and performance, in this episode we'll talk about:\n➜ The value of effort,\n➜ The importance of working on yourself,\n➜ Constantly challenging yourself,\nto successfully combine artistic excellence and personal fulfillment.\n➜ How do you find your path, develop your authenticity and fully flourish in a competitive environment like dance?\nWilliam will also speak about passion, his vision of dance — and the importance of dancing with your heart.\nHe'll also share his advice on how to progress, overcome obstacles and find your place in an at times competitive world.",
  },

  31: {
    title:   "Between passion and social media: how to reinvent yourself without limits",
    excerpt: "A conversation about passion, social media and the ability to reinvent yourself without letting others set your limits.",
    quote:   "He passed on this to me: there are no barriers — if you want to go somewhere you go, and there's nobody who can stop you.",
    description: "I also believe you shouldn't let yourself be limited by the boundaries imposed by others — or by society — and even less by the ones you set for yourself.\nWith Manuela, we talked a lot about taking action — and about not letting yourself be paralyzed by fear of failure or the judgment of others, especially when you're just starting out.\n➜ Because yes, when you start, you're not great.\nAt least, you're probably not as good as you are today.\n➜ And it is difficult to put yourself out there as imperfect and vulnerable in a society — an era, a world — where we always show the result, the finished product, and rarely failure on social media.\nIn this episode, we revisited the different stages of her career and the choices that brought her to where she is today.\nWe explored how she manages to juggle so many passions (dance, video, music, etc.) and how these different facets of her art enrich each other — with her desire to master the entire creative process, from capture to editing.\nWe also discussed the impact of social media on her career, the pressure of likes and the algorithm, and her approach to creating original, authentic content.",
  },

  30: {
    title:   "Classical dance: joys, sacrifices, eating disorders and renewal",
    excerpt: "An unfiltered conversation about classical dance, its joys, its sacrifices, eating disorders and possible paths to renewal.",
    quote:   "If your dreams don't scare you enough, your dreams aren't big enough.",
    description: "The biggest goals often require stepping out of your comfort zone.\nAnd that's what Coraline understood when she entered the entrance exams for the Paris Opéra at age 9 — even though she hated competitions.\nBut a few years later, she realized it wasn't classical dance that made her heart sing — it was the stage and dance in general.\nShe felt limited in her full potential, because classical dance had taken over her identity.\n➜ She decided to leave the Paris Opéra.\nAnd the hardest part for Coraline was telling her parents she wanted to leave because she wasn't happy.\n\"I can't do this to my parents — I'm finally in the place I always wanted to be.\"\nIt was even harder because she knew all the sacrifices her parents had made to help her succeed.\n➜ But her mental health was starting to suffer — and since her parents had always wanted her happiness, they supported her.\nToday, she shares her journey on social media to demystify classical dance, raise awareness about body image and mental health for dancers, and inspire those who want to pursue this discipline.\n➜ She also wants to show that classical dance is not an end in itself — and that it's possible to thrive as a dancer while exploring other forms of artistic expression.\nIn this episode, we'll talk about her time at the Paris Opéra — the joys, the difficulties, the sacrifices, the relationship with the body and self-image, and everything you need to know to better understand this discipline — as well as Coraline's artistic evolution.",
  },

  29: {
    title:   "Fusing styles, pushing limits and expressing your personality",
    excerpt: "A conversation about fusing styles, audacity and self-expression to push the boundaries of your dance.",
    quote:   "I don't want to wake up at 50 and think: what would my life have been if I'd made the choice to leave my job and live fully from dance.",
    description: "For Reem, the idea of looking back years later and regretting not having dared to follow her calling — not having fully lived a life aligned with what moved her deeply — was simply unthinkable.\nThe thought of one day finding yourself asking \"what if\" can be hard to sit with.\n➜ And in the context of a dance career, it also speaks to the brevity and intensity of this discipline.\nIn this episode, we talked about the history of salsa, the key elements of its technique, and the different ways to express creativity through this dance.",
  },

  28: {
    title:   "Doubt and resilience, working conditions and mental health",
    excerpt: "A conversation about doubt, resilience, working conditions and mental health in the dancer's profession.",
    quote:   "Either you listen to yourself and quickly realise it doesn't suit you and have the courage to get out, or you realise very late — and by then it's already not okay.",
    description: "We do a passion job — and I recently realized that many of the dancers around me no longer quite felt at home in what they were doing.\nIn talking with them, I realized they were on the verge of burn-out.\nAnd honestly, I had been too.\n➜ But how is it possible to be close to burn-out when you're supposed to love what you do?!\nThe truth is, we often accept jobs because we need to clock our hours — and some jobs, maybe three-quarters of them, don't exactly make us vibrate.\nI also think that when you stay in a comfort zone and keep getting told no, it creates frustration and self-doubt.\nIn reality, turning your passion into your job sometimes hides truths that are rarely acknowledged — and very far from what you imagined when you started out.",
  },

  27: {
    title:   "Revolutionising your body, mind and performance through yoga",
    excerpt: "A conversation about yoga, body awareness and the tools to sustainably improve your performance as a dancer.",
    quote:   "Having a different image of your body through different disciplines that allow you to take care of yourself is essential.",
    description: "As a dancer, you are constantly confronted with your image — the gaze you turn on yourself, your reflection in the mirror.\nAnd as she puts it so well, sometimes you need to step away from that by finding other disciplines where you can take care of yourself.\nFor Laure, it was the discovery of yoga.\n➜ She gives this example in the episode: when you're on tour, or when you've had a long journey before a performance, you can feel completely numb.\nAnd as she explains, that's a bit contradictory with the performance you're then supposed to deliver.\nSo knowing your body — understanding what to do to warm it up quickly — allows you to be as high-performing as possible, and above all to avoid injury.",
  },

  26: {
    title:   "How dance and art shape an artist",
    excerpt: "A conversation about dance, artistic influences and the experiences that gradually shape an artist's identity.",
    quote:   "I also had family pressure — every Christmas asking me: Oh, when are you going to have a real job?",
    description: "This phrase — we've all heard it. Me first.\nIn secondary school, when I said I wanted to become a dancer, people would answer:\n\"Sure, but otherwise, what do you actually want to do?\"\nAnd how can I describe what it's like to:\n➜ Be faced with doubt so young,\n➜ Run up against such closed-minded attitudes,\n➜ Have to deal with these remarks constantly.\nIt's already not easy to choose a direction so young [and even as an adult — and that's OK to still be figuring it out]. But when you know what you want to do, when you come alive through a passion — whether artistic or sporting — when you have a clear vision of your goals and your dreams, why would anyone question that? Why make us doubt ourselves so young? Why try to fit us into a conventional path that doesn't suit us?\n➜ These are questions I asked myself more than 10 years ago — and still ask myself today.\n➜ I'd also like to remind you that it's often our parents who sign us up for extracurricular activities — and I don't think they always realize just how much those activities can become a passion, an outlet, then a career.\nSo why force yourself to work in something that doesn't inspire you or move you — when you could live from your passions?\nFor me, my parents always let me live my dreams. For Diem, going against her family's expectations took courage.\nAnd it was only recently that her parents told her: \"We're proud of you.\"\nIn this episode, we address doubt, casting, how to balance your parents' expectations with your own — and how dance allows you to express what words cannot.",
  },

  25: {
    title:   "Dancing to survive",
    excerpt: "A powerful testimony about dance as a means of survival, resilience and self-assertion in the face of hardship.",
    quote:   "That's where integrating people with disabilities helps normalise different bodies.",
    description: "For Angelina, the next step would be to have dancers with disabilities at the opening and closing ceremonies of the Olympics — not just the Paralympics.\n➜ Yes, for her it was a logical next step. But true inclusion would mean being able to mix with \"able-bodied\" people — to normalize different bodies.\nIn this episode, Angelina Bruno talks about her journey and the upheaval that changed her life.\nAt 18, she found in hip-hop a lifeline and a way to express the full force of her soul.\nThrough this dance, she would find:\n➜ A way to be reborn\n➜ A way to learn to reclaim her own body,\nwhich became her greatest love story.\nConvinced she could never become a professional dancer, she immersed herself in psychology. Then she left everything to live her dream fully — and break down the barriers that had been imposed on her until then.",
  },

  24: {
    title:   "Sharing your vision and transmitting your know-how",
    excerpt: "A conversation about artistic vision, pedagogy and transmitting know-how to help other dancers grow.",
    quote:   "As you say, there's room for everyone — if it's not happening now, just believe in yourself; if you have talent you'll make it.",
    description: "There is enough room for everyone to accomplish what they want —\nEven if it sometimes takes:\n➜ Time,\n➜ Patience,\n➜ Resilience.\nTrusting yourself, persevering and finding the strength to believe are Priscilla's guiding words.\n➜ So yes, having \"talent\" is not enough on its own — it's about learning to cultivate it and putting it in service of your goals to get there.\nIn this episode, we'll discover Priscilla's inspiring journey, her unique approach to teaching, and the reasons that drive her to share her passion with as many people as possible.\nWe'll also explore the impact of her classes on her students — and the reasons behind her success.\nSpoiler alert: in this episode we are passionate and passionate-about — and I think it shows.",
  },

  23: {
    title:   "Asserting your femininity through heels",
    excerpt: "A conversation about heels, body knowledge and asserting your femininity through movement.",
    quote:   "A good dancer is someone who knows their body. And yet we think we know our body…",
    description: "The truth is that many of us don't know our bodies as well as we think.\nKnowing your body means above all:\n➜ Warming up properly\n➜ Knowing your limits\n➜ Diversifying your physical activities\nAlso, by listening to your body, you can anticipate injury risks and adapt your training accordingly.\nDancing is above all a source of pleasure.\nAnd being comfortable in your body means you take more pleasure in dancing.\n➜ Knowing your body is a long, complex process that demands patience and perseverance — a bit like the evolution of our careers, actually.\nIn this episode, we'll talk about her journey, her inspirations and aspirations, and the challenges she faced to become the artist she is today.\nShe'll tell us about the technique, the creativity and the artistic expression that this discipline — heels — requires, as well as her vision of things.",
  },

  22: {
    title:   "When disability becomes visible in an overly standardised world",
    excerpt: "A conversation about disability, visibility and the solutions to be invented to make the dance world truly inclusive.",
    quote:   "My goal in my artistic vision is to open doors for my future colleagues with disabilities.",
    description: "\"Me too, I want to pursue this career — I'm doing it, and whatever my situation, we find solutions.\"\nPeople always told Ilies that given his situation, he should work with his mind.\nIlies has achondroplasia — dwarfism — and he decided to turn it into a strength.\nAt 23, he decided to throw himself into dance and cinema, giving himself 1 year to make it work.\n➜ And we all know we're in an era where being different generates interest.\nBut as he says, in our artistic world: \"We tend to want to see on screen, on stage, representations of desirable people.\"\nSo we talked for an hour about:\n➜ How do you find your place despite established norms?\n➜ What is desirable and what isn't?\n➜ How can we improve inclusion for dancers with visible and invisible disabilities?\nIn this episode, we'll see how he balances his artistic career with the challenges of his physical condition — and his aspirations and ambitions for the future.\nIlies opens the doors of his world and shares his inspiring journey.",
  },

  21: {
    title:   "The impact of dance on fashion",
    excerpt: "A conversation about the connections between dance and fashion, body representation and the evolution toward greater inclusivity.",
    quote:   "We need movement in clothing; we also need to see different sizes.",
    description: "Things are evolving — but they're not yet fully inclusive for Ludovica.\nAnd like her, I think dance helps move things forward —\nEven if, not too many years ago, being both a dancer and a model was frowned upon…\nMarithé + François Girbaud was one of the pioneers in this, as was Issey Miyake.\nBecause today we realize we need:\n➜ Comfort, to feel at ease in what we wear,\n➜ Inclusion, to represent all body types.\nAnd dance gives clothing another dimension.\n➜ Moving more freely in fluid, loose, elastic fabrics that don't restrict movement,\n➜ Highlighting bodies and contouring them through cuts that celebrate body diversity,\nDance nourishes, completes, animates, awakens and creates emotions.\nDance has been walking the runways for a few years now:\n➜ The spring-summer 2021 Isabel Marrant show, to unveil their stretch pieces\n➜ The spring-summer 2023 Louis Vuitton Men's show, to energize the catwalk and convey poetry\n➜ The spring-summer 2023 Issey Miyake Women's show, as a tribute to its founder\n➜ The autumn-winter 2024–2025 Dior Men's show, to confirm the balletcore trend in menswear\nIn this episode, Ludovica talks about her artistic universe — a blend of movement and style — as well as the challenges and constraints she faces, and that we dancers face too.",
  },

  20: {
    title:   "The secrets to creating a show without grants",
    excerpt: "A practical conversation about creating a show without grants, between fundraising, organisation and confidence in your artistic project.",
    quote:   "Never forget why we do this, what the project's primary motivations are.",
    description: "You can quickly end up underwater when you launch your own project.\nBut you must never stop believing in it.\nAntoine decided to produce his own musical show \"Fantasmagloria\" without any subsidies — starting with €15,000 of his own money.\nHis own savings.\nHe'll tell you himself: with hindsight, doing it in 4 months was madness.\nAnd I agree.\n➜ So he simply started with a blank page and wrote — to create the atmosphere he wanted the show to have.\nHe then knew how to surround himself with the right people to create:\n➜ Musical composition, costumes, auditions for his 5 artists, lighting, creating content for visibility on social media, finding a production company, approaching theaters, finding a distribution manager and a press attaché, looking for patrons and funding bodies, etc. etc.\nHe even worked through the nights as deadlines loomed.\nAs the project grew, a production company reached out to accompany him on his next challenge:\n➜ Taking the show to the Festival d'Avignon OFF from 3 to 21 July, at a cost of €50,000.\nAnd as he says, it goes beyond just having a great time — because sometimes there are difficult moments. But for him, it's above all:\n\"Seeing bigger, having ambitions, and doing what you actually want to do.\"",
  },

  19: {
    title:   "When suffering becomes a source of creation",
    excerpt: "A conversation about pain, resilience and the way hardship can become raw material for artistic creation.",
    quote:   "Who cares — if you want to dance, you dance. We're not heart surgeons; we're not saving lives.",
    description: "This phrase hit me so hard — because it's the truth.\nAnd in any field.\nIf you want to do something, do it.\nIt might not be perfect at first — but at least you'll have tried and you'll have put yourself out there.\nJulie had promised herself, coming out of surgery, that if everything went well, she no longer had the right to do things halfway — and that she had to honor her presence on this earth.\n➜ Let's not wait until we're backed into a corner to take that decisive step out of our situation.\nAnd let's avoid regretting that we never dared.\nThere's nothing worse…\nBecause yes, too often:\n➜ We wait too much for others' approval,\n➜ We put pressure on ourselves for unnecessary things,\n➜ We think we have to wait for THE perfect moment to begin.\nAs Julie says:\n\"Shake an apple tree and the universe will give you oranges.\"\nYou never know what you'll harvest when you put yourself out there.\nSo just do it:\n➜ Take that dance class,\n➜ Take that solo trip,\n➜ Build your projects.\nExperiment, fail, try again, learn and succeed.\nIn this episode, Julie explains that ultimately what matters is you — your accomplishments, the path you've walked, and what you do with it.",
  },

  18: {
    title:   "Taking care of your mental health through holistic therapies",
    excerpt: "A conversation about mental health, burnout and holistic therapies to better take care of yourself.",
    quote:   "The body needs balance.",
    description: "We all tend to overwork ourselves and over-adapt.\nFor dancers, this can quickly lead to:\n➜ Exhaustion, injuries, creative blocks…\nBecause you constantly have to wear a mask — sometimes setting aside your own thoughts and emotions.\nAlways playing a role.\nSometimes in the same day, you get bad news — and that evening you have to be on stage, cheerful.\nYes, that can drive you crazy if you don't know how to balance it all.\nAnd over time, it leads nowhere.\n➜ As Léna says, the body is like a car — and unfortunately we sometimes take better care of our car than our body.\nLéna, psychotherapist and energy healer, shares all her keys for helping dancers — and others — release energetic blockages and find balance again.\nShe guides us through this episode toward deep well-being, sharing her techniques for:\n➜ Managing stress,\n➜ Managing emotions,\n➜ And anxiety,\n— and reconnecting with yourself to optimize your professional and personal life.",
  },

  17: {
    title:   "How to stand out from the competition?",
    excerpt: "A conversation about competition, singularity and the choices that allow a dancer to stand out professionally.",
    quote:   "I remain convinced that dancers are the future of communication.",
    description: "I'm convinced of it too.\nDance is everywhere:\nFrom music videos to concerts, from Bobochic ads to World by Kenzo campaigns.\nBrands have understood this for a long time:\n➜ To stand out, you need to tell stories.\n➜ To sell, you need to touch people's hearts with emotion.\nMaking you cry and making you laugh — yes. And making you buy in the process.\nAnd who better to do that than dancers?\nDancing means being able to convey messages without words — through the power of movement and the body.\nYou just have to look at the opening of the Paralympic Games to understand that.\nAnd to stand out, you need to differentiate yourself — just as much in dance as with a business or brand.\nSo Yohann shares his secrets in this episode for making dancers and brands shine through campaigns that are:\n➜ Creative,\n➜ Original,\n➜ Unforgettable,\n— while respecting everyone's values.\n➜ His mission:\nShowcasing brands through the talent and creativity of dancers — and vice versa.",
  },

  16: {
    title:   "How can Pilates help you overcome your injuries?",
    excerpt: "A conversation about Pilates, understanding movement and the tools to prevent injuries and recover better.",
    quote:   "Pilates should be given more prominence in dance training centres.",
    description: "Understanding movement is essential.\nFor Justine, Pilates should be given a more prominent place in all dance training programs, to:\n➜ Optimize recovery and performance,\n➜ Learn to feel your body from the inside,\n➜ Refine technique,\n➜ Prevent injuries.\nI'll never say it enough:\nDancers are high-level athletes — and we need to be seen and trained as such, in order to last physically over time.\nDiscover in this episode how Justine Gérard, professional dancer, recovered from a herniated disc and a quadriceps tendon rupture without surgery — thanks to Pilates [alongside, of course, a medical team including sports doctors, physiotherapists and neurologists].",
  },

  15: {
    title:   "How to set up your dance and wellness business?",
    excerpt: "A conversation about entrepreneurship, dance and well-being to transform bodily expertise into a lasting professional project.",
    quote:   "Don't be afraid to try things, don't be afraid to launch things.",
    description: "\"Your body sends you information too.\"\nOur body speaks to us — and that's a fact.\nThe body knows what it needs before the mind even becomes aware of it.\nIt's up to each of us to stay attuned to our own sensations, and to learn to decode these signals in order to be as aligned as possible with ourselves and our decisions.\nSo yes, listen to yourself — but not too much.\nEspecially when it comes to stepping out of your comfort zone!\nLike Marie:\n➜ Experiment,\n➜ Challenge yourself,\n➜ Put yourself in difficulty,\n➜ Try new things,\n➜ Dare to step out of your comfort zone.\nThe most important thing is simply to find your own balance between body and mind — and to do it through movement.",
  },

  14: {
    title:   "How to stand out with professional photos?",
    excerpt: "A conversation about professional image, preparing for a shoot and the role of photos in showcasing your artistic identity.",
    quote:   "Photos don't make the talent but will allow you to get to the in-person audition.",
    description: "The photos you send give a glimpse of your potential — but it's your artistic talent that will make the difference at the in-person audition.\nFor that, prepare your application with:\n➜ A CV,\n➜ A demo reel,\n➜ Professional photos.\nSend it as soon as possible!\nBecause in some cases, first come, first served.\nAlso don't forget:\n➜ Take the time to craft your email and present yourself well, because your application is your first impression.\nPeople often say, \"it's always the same people who get booked.\"\nAsk yourself why — and maybe change the way you approach things to stand out.\nOr: work hard, prove yourself, and don't give up.",
  },

  13: {
    title:   "Freeing movement with comfortable clothes",
    excerpt: "A conversation about movement, comfort and creating outfits designed to fully free the dancer's body.",
    quote:   "Dance is a sport that would perfectly showcase this type of clothing.",
    description: "Dance is a sport that challenges the body and frees the mind.\nSpoade collaborates with activewear brands to offer clothing designed to make us shine.\nBlending style and performance to:\n➜ Allow you to surpass yourself\n➜ Express your personality\n➜ Dare to be yourself\n➜ Feel confident\n➜ Be authentic\n➜ Explore yourself\nModern, bold designs, flattering cuts and comfortable fabrics to let you stand out!\nIn this episode I welcomed Lili Lurquin Dramé and Lucile Froment, who met at ESSCA.\nThrough their conversations about business, entrepreneurship and their shared vision for life, they co-founded Spoade in 2023 — the active fashion house dedicated to activewear, bringing together brands and sportswear for women that combine performance, comfort and style.\nTheir goal: to give women the means to feel beautiful and high-performing in their sport.",
  },

  12: {
    title:   "How to nail your casting?",
    excerpt: "A conversation full of advice to prepare your casting, manage your nerves and showcase your artistic personality.",
    quote:   "You need to release your stress by visualising yourself succeeding.",
    description: "In summary:\n➜ Visualize your success:\nBefore going to an audition, take a moment for yourself. Imagine yourself shining during the audition. Believe in yourself and stay positive — it shows and it's felt!\n➜ Prepare:\nPassing an audition takes work. As Rabah says: \"Work, work, work — and maintain your various disciplines!\"\n➜ Be curious and do your research:\nThe more you know about the casting and the project, the better. Read the script, look into the director, the casting director, the role you're auditioning for, etc.\nWork, persevere and believe in yourself.\nIn this episode, Rabah shares his best advice on \"How to nail your casting.\"",
  },

  11: {
    title:   "Mum and dancer: the perfect balance",
    excerpt: "A testimony about motherhood, professional prejudice and the search for balance between a dancer's career and family life.",
    quote:   "There was discrimination, a lack of understanding as a future mother and artist. I was told: We won't take the risk of hiring you.",
    description: "Emilie's experience is unfortunately not unique…\nBeing told \"We won't take the risk of hiring you\" because you're expecting a child is not only:\n➜ Against the law.\n➜ Hurtful.\nBeing a parent and an artist is not an obstacle — nor are they incompatible.\nI hope that Émilie's testimony can help change mentalities and contribute to creating a world where women artists and entrepreneurs can balance their art and family life without discrimination.\nRemember: the law says you have the right to work freely — even while pregnant or after giving birth.",
  },

  10: {
    title:   "How to create a solo show?",
    excerpt: "A conversation about creating a solo show, from writing to performance and stage presence.",
    quote:   "I was an introvert, and on stage it's a completely different person.",
    description: "Three key phrases to remember — three facets of personality:\n➜ Introverted in life, extroverted on stage: The stage allowed him to overcome his shyness and express himself fully.\n➜ Sincerity and authenticity are among his core values: Régis doesn't perform for his audience — he offers them an authentic version of himself, with his strengths and his flaws.\n➜ Dedicated and hard-working: Applause doesn't come by itself — it's earned through countless hours of rehearsal, discipline and perseverance. A total commitment to his art and his audience, even at 50!\nOn stage, he's no longer the same person. His art freed him from his shyness, allowing him to express himself fully.",
  },

  9: {
    title:   "What does a stage manager do?",
    excerpt: "A conversation to understand the profession of stage manager, the essential link between artistic needs and the technical reality of a show.",
    quote:   "The stage manager is a point of reference, a team leader.",
    description: "The stage manager is like a conductor —\nThey are the link between:\n➜ The artistic\n➜ And the technical.\nThe more precise the choreographer's or director's vision, the more the stage manager can offer a tailored technical response.\nAbove all, you have to understand what the choreographer wants to tell — because as we know, every movement tells a story.\nEmilie is a true Swiss Army knife of live performance, with vast experience. Her passion began at a very young age, nurtured by concerts and shows.\nMy turn to put her in the spotlight — and to share, through this episode, her profession: so important for us as dancers and performers in live performance.",
  },

  8: {
    title:   "A journey into the heart of Drag",
    excerpt: "An immersion in the world of drag, between character creation, performance, tolerance and freedom of expression on stage.",
    quote:   "The best future we can all dream of is a future where we tolerate each other.",
    description: "For Piche, tolerance is the key to a better future for everyone.\nBut how do we get there?\n➜ By respecting others' opinions and beliefs, even if we don't share them,\n➜ By building inclusive and just societies where everyone feels valued and respected,\n➜ By building a future where difference is celebrated, not condemned.\nLet's live in peace and harmony, despite our differences. Full stop.",
  },

  7: {
    title:   "Street jazz: dare to express yourself",
    excerpt: "A conversation about street jazz, confidence and self-expression to dance with greater freedom.",
    quote:   "It's not just dance training. It's also working on yourself: your mindset, your physique, your cardio, your musculature.",
    description: "Being a dancer means:\nStrengthening your mind:\n➜ Seeing yourself succeed,\n➜ Visualizing positively,\n➜ Pushing your limits,\n➜ Learning quickly,\n➜ Handling the many rejections,\n➜ Breaking free from negative criticism,\n➜ Confronting the gaze of others.\nImproving your body:\n➜ Being precise,\n➜ Taking care of yourself,\n➜ Mastering your body,\n➜ Avoiding injuries,\n➜ Building muscle,\n➜ Developing endurance,\n➜ Performing well in castings and on stage.\nBut above all, it means keeping the passion, the joy — finding the style that suits you best, and traveling to the heart of yourself.\nI welcomed Delphine to talk about her journey, her inspirations, her musicality, her future projects and her vision of street jazz.",
  },

  6: {
    title:   "How to excel at battles?",
    excerpt: "A conversation about preparation, musicality and the mindset needed to progress and excel in dance battles.",
    quote:   "There's no secret: when you want to perform at something, you have to repeat it.",
    description: "For Nelson, no magic:\nWORK.\nBut on what?\n➜ Your technique,\n➜ Your musicality,\n➜ Your improvisation,\n➜ Your ability to adapt,\n➜ Your ability to push your limits.\nAll of these sharpen over years and hours of repetition — constantly refining yourself.\nAnd in a battle?\nThat's where they're waiting for you!\n➜ Be precise,\n➜ Connect with the music,\n➜ Give your best,\n➜ Win over the audience and the jury,\n➜ Read your opponent and adapt in the moment.\nHis advice when nerves kick in?\nTransform pressure into something positive!\nAnd never forget:\n\"One of the hardest things to hold onto is what brought you here in the first place — the love of it.\"",
  },

  5: {
    title:   "Dance infrastructure in Switzerland: challenges and prospects",
    excerpt: "A conversation about dance infrastructure in Switzerland, its current challenges and the prospects offered to artists.",
    quote:   "Keep inspiring each other, travel, be kind to one another and take care of your ego.",
    description: "I also think that an oversized ego won't get us anywhere — better to stay humble and kind.\nOf course you need self-confidence — but you mustn't let pride take over.\nNor does walking over others necessarily make you progress.\nEvery encounter can and should be a source of inspiration.\n➜ Be kind, be generous, and be happy for others' success.\n➜ Be someone else's inspiration — and let yourself be inspired by them.\nIn this episode, Annabelle shed light on the infrastructure available to dancers and artists in Switzerland, the challenges they face, and the prospects for the future.",
  },

  4: {
    title:   "Discovering Old Way, the founding style of voguing",
    excerpt: "A meeting with Old Way, the founding style of voguing, between precision, elegance, history and cultural transmission.",
    quote:   "In Old Way, you must always be elegant. If it's not precise, if the lines aren't right — it simply doesn't work.",
    description: "For Yanou, precision and elegance are essential in Old Way.\nIt's this precision that gives the movement a captivating dimension — its beauty and its power.\nAnd especially the combination of small details that gives voguing its richness and depth.\nDid you know there are 5 elements in voguing: the cat walk, duck walk, spin and dip, hands performance, floor performance?\nBut Old Way has even more elements than that —\nIt draws its inspiration from a variety of styles:\n➜ Break\n➜ Popping\n➜ Jazz",
  },

  3: {
    title:   "Naturopathy in service of dance",
    excerpt: "A conversation about naturopathy, prevention and lifestyle to support the health and performance of dancers.",
    quote:   "Naturopathy completely supports the dancer and is almost indispensable.",
    description: "For Aurélie, naturopathy is a genuine asset for dancers:\n➜ Optimizing your performance\n➜ Preventing injuries\n➜ Managing emotions\nWe all need to physically and emotionally release accumulated tension.\nSo Aurélie shares natural tools to achieve this — to be more effective and sustain the long term!\nTake care of yourselves — for real.",
  },

  2: {
    title:   "How can boxing improve your dance?",
    excerpt: "A conversation about boxing, cardio and coordination to understand how this training can strengthen your dance.",
    quote:   "When you're a dancer and you start boxing, it's generally a great advantage, because you have body and mind awareness.",
    description: "For Omar Dramé, dancers have an advantage when they take up boxing.\nWhy?\nBecause we already have awareness of our body and our mind:\n➜ Body awareness: We have mastered our bodies. We know how to move, feel every movement with precision and coordination — which gives us a considerable advantage in boxing when it comes to landing punches and dodging our opponent's.\n➜ Mind awareness: We need to be able to focus on our movements while listening to others and the music — developing strong concentration.\nSo, if you're a dancer and you want to develop your skills, have a great time without getting hurt — boxing is for you!\nYou already have all the qualities needed to become an excellent boxer — and thanks to Omar!\nIn this episode, he shares his best advice on how to excel in boxing — and perhaps in dance too.",
  },

  1: {
    title:   "Former dancer: her community manager advice",
    excerpt: "An exchange of tips on social media, brand identity and digital communication to develop your dance career.",
    quote:   "Social media can bring you opportunities; go for it, there's room for everyone.",
    description: "For Mathilde, to stand out on social media, you need to:\n1. Define your identity:\nSay clearly who you are and what you offer as a dancer.\nClassical dance, heels, krump, etc.: be distinctive to attract the right audience.\nIf you master several styles, showcase them — but clearly and concisely.\n2. Create quality content:\nCreative and original photos and videos are essential to capture attention.\nNo blurry, pixelated or thrown-together videos.\nRemember: you are selling your image — and potentially selling it to brands and companies. Bet on quality. [Quality attracts quality.]\nAbove all, never forget to remain yourself!",
  },

}
