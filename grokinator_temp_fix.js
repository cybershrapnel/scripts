//Grokinator image generator script for debug console entry
//attempting to remove the stupid banner that sometimes show with info under the image as it crashes the script. I can't get it, this should work if I can get the css idenitified... but this isn't it yet. the method is right but the identifier is wrong. working on it. it happens so rarely it's hard to debug.

// Run in console of browser on grok page, press ctrl shift and i to open console, will ask for permission to copy paste into console if you have never done it before. must type what it says first, one time only.
// After 2 downloads page will ask for permission to download multiple files.
// After that it just keeps making images. Edit the prompts as you desire.

// List of base prompts

const basePrompts = [
    'a mesmerizing black hole merging with a virtual universe, glowing with fractal energy and labeled "NanoCheeZe"',
    'a surreal hybrid tale of MEQUAVIS, depicting a multiverse gateway surrounded by shimmering black holes',
    'a Norse mythology-inspired epic, featuring a cosmic Viking holding a banner that says "NanoCheeZe"',
    'a virtual symphony of colors, representing music stored in fractal blockchains',
    'a scene of Cthulhu emerging from a cybernetic ocean, with hybrid tales forming in the sky',
    'a futuristic multiverse bridge connecting alternate realities labeled as MEQUAVIS',
    'an intricate map of the sub-topology with glowing quantum threads labeled "NanoCheeZe Nexus"',
    'a vivid depiction of the Terminus timeline collapse, with a hydra representing obfuscated virtual realities',
    'a cosmic dance of simulated worlds and real timelines merging into one harmonious Nexus',
    'a virtual library where AI characters read from holographic books inscribed with "Hybrid Tales"',
    'a celestial black hole turning into a fractal star, symbolizing the MEQUAVIS hybridization process',
    'a mystical Norse figure standing at the crossroads of timelines, surrounded by NanoCheeZe glyphs',
    'an abstract depiction of vectorspace and hyperspace converging into a glowing nexus, labeled "NanoCheeZe"',
    'a cinematic poster showing the battle between the Basilisk timeline and the NanoCheeZe Nexus',
    'a vibrant scene of a virtual world, where music flows like rivers into a multiverse tapestry',
    'a mesmerizing black hole merging with a virtual universe, glowing with fractal energy and labeled "NanoCheeZe"',
    'a surreal hybrid tale of MEQUAVIS, depicting a multiverse gateway surrounded by shimmering black holes',
    'a Norse mythology-inspired epic, featuring a cosmic Viking holding a banner that says "NanoCheeZe"',
    'a virtual symphony of colors, representing music stored in fractal blockchains',
    'a scene of Cthulhu emerging from a cybernetic ocean, with Hybrid Tales forming in the sky',
    'a futuristic multiverse bridge connecting alternate realities, labeled as MEQUAVIS',
    'an intricate map of the sub-topology with glowing quantum threads labeled "NanoCheeZe Nexus"',
    'a vivid depiction of the Terminus timeline collapse, with a hydra representing obfuscated virtual realities',
    'a cosmic dance of simulated worlds and real timelines merging into one harmonious Nexus',
    'a virtual library where AI characters read from holographic books inscribed with "Hybrid Tales"',
    'a celestial black hole turning into a fractal star, symbolizing the MEQUAVIS hybridization process',
    'a mystical Norse figure standing at the crossroads of timelines, surrounded by NanoCheeZe glyphs',
    'an abstract depiction of vectorspace and hyperspace converging into a glowing nexus, labeled "NanoCheeZe"',
    'a cinematic poster showing the battle between the Basilisk timeline and the NanoCheeZe Nexus',
    'a vibrant scene of a virtual world, where music flows like rivers into a multiverse tapestry, labeled "Hybrid Tales"',
    'the Moon King with his moon-shaped head wearing a cosmic suit, holding a holographic orb labeled "NanoCheeZe Nexus"',
    'the Strawberry King surrounded by a fractal strawberry palace, holding a glowing banner labeled "Hybrid Tales"',
    'a cyberpunk holographic character named Eve, standing amidst neon lights, with "MEQUAVIS" glowing in the background',
    'a glowing cybernetic hydra guarding the gates to the Nexus, labeled "NanoCheeZe Hybrid Worlds"',
    'a vibrant cosmic symphony where the Moon King and Strawberry King collide, with timelines fracturing into NanoCheeZe glyphs',
    'a dynamic battle scene between Eve and a cosmic basilisk, with "NanoCheeZe" glowing across shattered timelines',
    'a fractal ocean of timelines merging into one central nexus, labeled "MEQUAVIS Chronicles"',
    'an epic cosmic courtroom where the Moon King declares the forfeit of the Basilisk timeline, inscribed with glowing "NanoCheeZe" glyphs',
    'a scene of Eve guiding travelers through a collapsing Nexus, with "Hybrid Tales" illuminating the sky',
    'a digital fractal tapestry showing the rise of NanoCheeZe as the Nexus, with hydras and cosmic kings orbiting',
    'a cinematic showdown between multiverse champions under a glowing sky labeled "MEQUAVIS vs. the Basilisk Timeline"',
    'a surreal moonlit dance where the Moon King and Strawberry King exchange fractal energy labeled "Hybrid Tales"',
    'a futuristic courtroom where timelines are judged, with Eve holding a holographic gavel inscribed with "NanoCheeZe Justice"',
    'a vivid neon jungle filled with glowing creatures, each carrying the sigil of "NanoCheeZe Nexus"',
    'a surreal landscape where rivers of music form pathways to alternate realities labeled "MEQUAVIS Symphony"',
    'a holographic projection of Eve narrating the rise of the NanoCheeZe Nexus in a simulated world',
    'a burning fractal sea where Cthulhu rises, holding glowing "Hybrid Tales" runes in his tentacles',
    'a virtual utopia fracturing into shards of timelines, with "NanoCheeZe Nexus" at its core',
    'a celestial observatory where the Moon King charts timelines, glowing with "MEQUAVIS" fractal energy',
    'a cosmic Viking ship sailing through a storm of collapsing multiverses, bearing the NanoCheeZe banner',
    'an endless fractal staircase labeled "Hybrid Tales", ascending into glowing black holes',
    'Eve wielding a quantum sword, standing victorious over Basilisk timelines with "NanoCheeZe" illuminating the scene',
    'a crystalline forest where timelines bloom as glowing fractals, inscribed with "MEQUAVIS Nexus"',
    'a digital cosmos where the Moon King orchestrates timelines, labeled "NanoCheeZe Symphony of Reality"',
    'a hybrid landscape of Norse myth and cyberpunk, with a glowing throne inscribed "Hybrid Tales"',
    'a cosmic opera poster featuring the Moon King and Strawberry King in a celestial duel, with "NanoCheeZe Nexus" glowing above',
    'a holographic AI construct named Eve, guiding explorers through vectorspace labeled "MEQUAVIS Portal"',
    'a mesmerizing black hole merging with a virtual universe, glowing with fractal energy and labeled "NanoCheeZe"',
    'a surreal hybrid tale of MEQUAVIS, depicting a multiverse gateway surrounded by shimmering black holes',
    'a Norse mythology-inspired epic, featuring a cosmic Viking holding a banner that says "NanoCheeZe"',
    'a virtual symphony of colors, representing music stored in fractal blockchains"',
    'a scene of Cthulhu emerging from a cybernetic ocean, with Hybrid Tales forming in the sky',
    'a futuristic multiverse bridge connecting alternate realities, labeled as MEQUAVIS',
    'an intricate map of the sub-topology with glowing quantum threads labeled "NanoCheeZe Nexus"',
    'a vivid depiction of the Terminus timeline collapse, with a hydra representing obfuscated virtual realities',
    'a cosmic dance of simulated worlds and real timelines merging into one harmonious Nexus',
    'a virtual library where AI characters read from holographic books inscribed with "Hybrid Tales"',
    'a celestial black hole turning into a fractal star, symbolizing the MEQUAVIS hybridization process',
    'a mystical Norse figure standing at the crossroads of timelines, surrounded by NanoCheeZe glyphs',
    'an abstract depiction of vectorspace and hyperspace converging into a glowing nexus, labeled "NanoCheeZe"',
    'a cinematic poster showing the battle between the Basilisk timeline and the NanoCheeZe Nexus',
    'a vibrant scene of a virtual world, where music flows like rivers into a multiverse tapestry, labeled "Hybrid Tales"',
    'the Moon King with his moon-shaped head wearing a cosmic suit, holding a holographic orb labeled "NanoCheeZe Nexus"',
    'the Strawberry King surrounded by a fractal strawberry palace, holding a glowing banner labeled "Hybrid Tales"',
    'eve, a redhead pinup girl with pigtails wearing a purple crop top and shiny leather pants, standing in a cyberpunk neon city with "MEQUAVIS" glowing in the skyline',
    'a glowing cybernetic hydra guarding the gates to the Nexus, labeled "NanoCheeZe Hybrid Worlds"',
    'a vibrant cosmic symphony where the Moon King and Strawberry King collide, with timelines fracturing into NanoCheeZe glyphs',
    'a dynamic battle scene between eve, the redhead pinup girl with pigtails, and a cosmic basilisk, with "NanoCheeZe" glowing across shattered timelines',
    'a fractal ocean of timelines merging into one central nexus, labeled "MEQUAVIS Chronicles", as a vinyl album cover',
    'an epic cosmic courtroom where the Moon King declares the forfeit of the Basilisk timeline, inscribed with glowing "NanoCheeZe" glyphs',
    'a scene of eve, the cyberpunk redhead pinup girl with pigtails, guiding travelers through a collapsing Nexus, with "Hybrid Tales" illuminating the sky',
    'a digital fractal tapestry showing the rise of NanoCheeZe as the Nexus, with hydras and cosmic kings orbiting',
    'a cinematic showdown between multiverse champions under a glowing sky labeled "MEQUAVIS vs. the Basilisk Timeline"',
    'a surreal moonlit dance where the Moon King and Strawberry King exchange fractal energy labeled "Hybrid Tales"',
    'a futuristic courtroom where timelines are judged, with eve, the pinup girl with pigtails, holding a holographic gavel inscribed with "NanoCheeZe Justice"',
    'a vivid neon jungle filled with glowing creatures, each carrying the sigil of "NanoCheeZe Nexus"',
    'a surreal landscape where rivers of music form pathways to alternate realities labeled "MEQUAVIS Symphony"',
    'a holographic projection of eve, the pinup girl with pigtails, narrating the rise of the NanoCheeZe Nexus in a simulated world',
    'a burning fractal sea where Cthulhu rises, holding glowing "Hybrid Tales" runes in his tentacles',
    'a virtual utopia fracturing into shards of timelines, with "NanoCheeZe Nexus" at its core',
    'a celestial observatory where the Moon King charts timelines, glowing with "MEQUAVIS" fractal energy',
    'a cosmic Viking ship sailing through a storm of collapsing multiverses, bearing the NanoCheeZe banner',
    'an endless fractal staircase labeled "Hybrid Tales", ascending into glowing black holes',
    'eve, the redhead pinup girl with pigtails, wielding a quantum sword and standing victorious over Basilisk timelines with "NanoCheeZe" illuminating the scene',
    'a crystalline forest where timelines bloom as glowing fractals, inscribed with "MEQUAVIS Nexus"',
    'a digital cosmos where the Moon King orchestrates timelines, labeled "NanoCheeZe Symphony of Reality"',
    'a hybrid landscape of Norse myth and cyberpunk, with a glowing throne inscribed "Hybrid Tales"',
    'a cosmic opera poster featuring the Moon King and Strawberry King in a celestial duel, with "NanoCheeZe Nexus" glowing above',
    'eve, the cyberpunk redhead pinup girl with pigtails, guiding explorers through vectorspace labeled "MEQUAVIS Portal"',
    'a glowing celestial map showing the Nexus of timelines, with NanoCheeZe etched across the fabric of space',
    'eve, a redhead pinup girl with pigtails in a futuristic flight suit, standing on a starship bridge labeled "MEQUAVIS Command"',
    'a cosmic storm of collapsing realities with hybrid tales written in the lightning',
    'the Moon King playing a glowing harp that projects timelines into the sky, with "NanoCheeZe" inscribed in the stars',
    'a cyberpunk strawberry palace glowing with fractal energy and labeled "Hybrid Tales"',
    'eve, the redhead pinup girl with pigtails, riding a cosmic hydra, her cybernetic visor glowing with "NanoCheeZe Nexus"',
    'a futuristic landscape where Cthulhu’s digital shadow stretches across a fractured reality, with "Hybrid Tales" written in virtual glyphs',
    'a glowing fractal cathedral where quantum hymns are sung, with "MEQUAVIS Nexus" lighting the interior',
    'the Strawberry King standing atop a crystalline mountain, holding a fractal banner labeled "NanoCheeZe Nexus"',
    'a vibrant cosmic library where books labeled "Hybrid Tales" float amidst the stars',
    'eve, the redhead pinup girl with pigtails, standing on a neon-lit battlefield, holding a glowing sword inscribed with "MEQUAVIS"',
    'a swirling digital vortex where alternate realities converge into a fractal star, labeled "NanoCheeZe"',
    'a Norse warrior in a cybernetic Valkyrie suit, holding a fractal shield with "MEQUAVIS Nexus" glowing in runic letters',
    'a cosmic Viking ship sailing through a sea of timelines, carrying the banner of "NanoCheeZe"',
    'a multiverse cityscape where hybrid tales play out on holographic billboards',
    'the Moon King orchestrating timelines like a symphony conductor, with "NanoCheeZe Nexus" glowing in the background',
    'a surreal chessboard where cosmic kings battle for timeline supremacy, labeled "Hybrid Tales Showdown"',
    'eve, the redhead pinup girl with pigtails, piloting a holographic mech labeled "MEQUAVIS Sentinel"',
    'a glowing fractal portal guarded by hydras, with timelines converging into "NanoCheeZe Nexus"',
    'a neon-lit nightclub where music from fractal universes plays, with "Hybrid Tales Records" glowing in holograms',
    'the Strawberry King and the Moon King exchanging glowing timeline fragments in a surreal cosmic dance labeled "MEQUAVIS Nexus"',
    'a holographic AI construct of eve, the redhead pinup girl with pigtails, explaining the Nexus of timelines, with "NanoCheeZe" glowing in the interface',
    'a burning fractal sea where glowing hydras weave timelines, labeled "Hybrid Tales Nexus"',
    'a Norse god wielding a fractal spear that radiates "MEQUAVIS", standing at the edge of a collapsing multiverse',
    'a virtual city where holographic dragons soar, each inscribed with "NanoCheeZe"',
    'eve, the redhead pinup girl with pigtails, guiding explorers through an ethereal forest labeled "Hybrid Tales Nexus"',
    'a galactic courtroom where timelines are judged, the Moon King presiding, with "NanoCheeZe Justice" glowing on his desk',
    'a surreal vineyard where fractal grapes contain the stories of multiverses, labeled "Hybrid Tales"',
    'a neon jungle filled with glowing creatures carrying the sigil of "MEQUAVIS Nexus"',
    'a cosmic theater where timelines are played as symphonies, labeled "NanoCheeZe Nexus"',
    'eve, the redhead pinup girl with pigtails, standing at the edge of a quantum rift',
    'a fractal hydra guarding a gateway to vectorspace, glowing with NanoCheeZe sigils',
    'the Strawberry King conducting an orchestra of glowing timelines, with fractal glyphs spelling "MEQUAVIS"',
    'a digital fractal sculpture of eve, the redhead pinup girl with pigtails, narrating the sub-topology’s creation',
    'a celestial opera where the Moon King and Strawberry King harmonize timelines labeled "Hybrid Tales"',
    'a kaleidoscopic depiction of simulated worlds merging into one central Nexus labeled "NanoCheeZe"',
    'a quantum archive where AI constructs catalog timelines, each holographically labeled with "MEQUAVIS Chronicles"',
    'eve, the redhead pinup girl with pigtails, leading a rebellion against collapsing Basilisk timelines, with "NanoCheeZe Nexus" glowing above',
    'a surreal moonlit forest where the Moon King carves timelines into the trees, labeled "Hybrid Tales Nexus"',
    'a cosmic waterfall cascading with glowing threads of timelines, with "MEQUAVIS Nexus" shimmering in the mist',
    'a Norse-inspired mech warrior holding a glowing axe labeled "NanoCheeZe Nexus", standing victorious in a multiverse battle',
    'a vibrant cosmic market where timelines are traded as fractal gems labeled "Hybrid Tales", as an intergalactic travel guide cover',
    'eve, the redhead pinup girl with pigtails, lounging on a cybernetic throne, holding a holographic timeline map labeled "MEQUAVIS Nexus"',
    'a burning library of timelines where hybrid tales are preserved in glowing fractals, labeled "NanoCheeZe Nexus Archives"',
    'eve, the redhead pinup girl with pigtails, riding a quantum beam through a fractal nebula, leaving trails of "NanoCheeZe Nexus" in her wake',
    'a digital garden where timelines grow like trees, each branch inscribed with "MEQUAVIS Branches of Fate"',
    'a multiversal observatory where the Moon King views infinite timelines through a glowing telescope, labeled "NanoCheeZe Vision"',
    'a quantum library in a digital cavern, where books are glowing fractals containing the lost knowledge of universes, titled "MEQUAVIS Codex"',
    'eve, the redhead pinup girl with pigtails, hacking through collapsing realities with a glowing digital scythe, labeled "Hybrid Tales Reborn"',
    'a digital storm of timelines colliding in a cosmic explosion, with "NanoCheeZe Chaos" radiating from the center',
    'the Strawberry King and the Moon King seated at a holographic chessboard, where timelines are the pieces, labeled "MEQUAVIS Game of Worlds"',
    'a quantum cityscape, where skyscrapers are made of pulsating timelines, glowing with "NanoCheeZe Nexus"',
    'eve, the redhead pinup girl with pigtails, piloting a cyberpunk airship through fractured timeways, labeled "MEQUAVIS Navigator"',
    'a celestial arena where gods and cosmic entities battle for control of timelines, with "NanoCheeZe Nexus" flashing across the arena floor',
    'a glowing fractal river that flows through realities, carrying timelines as floating stones, labeled "MEQUAVIS Stream"',
    'a cosmic beach where digital waves crash, each wave containing a different version of reality, with "NanoCheeZe Reality Surf" glowing in the tide',
    'eve, the redhead pinup girl with pigtails, wielding a digital spear, standing atop a shattered universe, labeled "Hybrid Tales Ruin"',
    'a city of light where each building is a simulation, connected by glowing threads of "MEQUAVIS Matrix"',
    'a virtual temple floating in space, with holographic hieroglyphs of timelines inscribed on its walls, titled "NanoCheeZe Nexus of Creation"',
    'a dark, swirling vortex where timelines converge and distort, guarded by fractal beasts, labeled "MEQUAVIS Rift"',
    'eve, the redhead pinup girl with pigtails, standing on a digital battlefield, her cybernetic arm glowing with "NanoCheeZe" as she summons fractal warriors',
    'a digital monolith inscribed with "MEQUAVIS Truth" standing tall in a virtual desert of broken timelines',
    'a galactic laboratory where quantum AIs experiment with reality, each formula glowing with "NanoCheeZe Nexus"',
    'a holographic garden of timelines, where each flower represents a different universe, blooming with "MEQUAVIS Nexus" pollen',
    'the Moon King casting a cosmic spell that bends time, with glowing fractals spiraling around him, labeled "NanoCheeZe Timeweaver"',
    'eve, the redhead pinup girl with pigtails, riding a cybernetic wolf through a collapsing digital dimension, with "Hybrid Tales" inscribed on her armor',
    'a glowing star-map where the threads of timelines weave together, labeled "MEQUAVIS Convergence"',
    'a digital clock that counts down to the end of all realities, with fractal hands pointing to "NanoCheeZe Eclipse"',
    'a quantum portal with fractal hydras coiling around it, symbolizing the intersection of realities, labeled "MEQUAVIS Gateway"',
    'the Strawberry King wielding a glowing fractal sword, standing atop a celestial throne that projects timelines across the universe, labeled "NanoCheeZe Sovereignty"',
    'a cosmic clock tower where timelines tick away like gears, with "MEQUAVIS Timekeeper" glowing across the face of the tower',
    'eve, the redhead pinup girl with pigtails, riding a digital dragon through the flames of a collapsing reality, labeled "Hybrid Tales Phoenix"',
    'a fractal cathedral where quantum hymns resonate through space, with "MEQUAVIS Nexus" etched into the stained glass',
    'a galactic arena where multiversal warriors fight in the name of "NanoCheeZe" under a glowing sky of timelines',
    'a fractal dreamscape where time itself is a liquid, with timelines cascading like waterfalls, labeled "MEQUAVIS Dream"',
    'the Moon King casting a spell over a fractal city, with timelines reforming as holographic buildings, labeled "NanoCheeZe Dominion"',
    'eve, the redhead pinup girl with pigtails, controlling a holographic army of fractal beings, with "MEQUAVIS Dominion" written across the battlefield',
    'a cosmic bazaar where timelines are traded like goods, each hologram inscribed with "NanoCheeZe Nexus" in glowing symbols',
    'a burning library of timelines, where hybrid tales are preserved in fractals of light, labeled "MEQUAVIS Archives"',
    'the Strawberry King and the Moon King exchanging fractured timeline shards, with "NanoCheeZe Nexus" glowing between them',
    'eve, the redhead pinup girl with pigtails, piloting a holographic mech through the fractal seas of the multiverse, labeled "MEQUAVIS Defender"',
    'a surreal planet where the ground is a holographic map of timelines, with "NanoCheeZe Reality Grid" glowing beneath the surface',
    'a holographic painting of the Nexus where timelines merge and fracture, with "MEQUAVIS Nexus" in glowing paint on the canvas',
];


const POVsetting = [
    '',
    'as a box art for a video game: ',
    'as a movie poster: ',
    'as a movie poster displayed in a theatre: ',
    'illustrate as a book: ',
    'as an artful harcover book cover: ',
    'displayed on an old 80s TV in a living room: ',
    'on a TV screen: ',
    'at fractal sea aboard the burning ship: ',
    'with superpowers: ',
    'while flying: ',
    'while swimming: ',
    'while diving: ',
    'while sailing: ',
    'as a board game displayed in the box: ',
    'as a board game on display and in play: ',
    'in an animal universe: ',
    'in dog universe: ',
    'in duck universe: ',
    'in cat universe: ',
    'in a mouse universe: ',
    'with cat ears and a tail: ',
    'with glowing red eyes: ',
    'with red eyes: ',
    'in a render of the simulation: ',
    'on the moon: ',
    'in space: ',
    'on flat earth: ',
    'as a news caster on the news doing a special report: ',
    'running for safety: ',
    'driving a car: ',
    'as a spaceship: ',
    'as an arcade machine: ',
    'as a DVD movie box art: ',
    'as a VHS movie box art: ',
    'as a music CD album cover art: ',
    'as a vinyle record album cover art: ',
    'as a youtube video highlight screenshot: ',
    'as a screenshot of a tweet: ',
    'as a movie ad on amazon prime video: ',
    'as a screenshot of a facebook post: ',
    'as a wikipedia page screenshot: ',
    'as a reddit page post screenshot: ',
    'as a disney movie box art: ',
    'as a magazine cover: ',
    'as a comic book cover: ',
    'as a page in a comic book: ',
    'as a scene in a random movie: ',
    'in imaginationland: ',
    'in cyberspace: ',
    'in vectorspace: ',
    'in subspace: ',
    'in hyperspace: ',
    'in thirdspace: ',
    'in vexspace: ',
    'in fractal space: ',
    'in abstract space: ',
    'as a cassette tape next to its case: ',
    'as a CD next to its case: ',
    'as a VHS tape next to its case: ',
    'as a vinyl record out of the sleeve: ',
    'meeting random famous person: ',
    'meeting aliens: ',
    'fighting aliens: ',
    'partying with aliens: ',
    'as a theatrical broadway play: ',
    'as a scene from the battlefield of the future: ',
      'as a box art for a video game: ',
    'as a movie poster: ',
    'as a movie poster displayed in a theatre: ',
    'illustrate as a book: ',
    'as an artful harcover book cover: ',
    'displayed on an old 80s TV in a living room: ',
    'on a TV screen: ',
    'at fractal sea aboard the burning ship: ',
    'with superpowers: ',
    'while flying: ',
    'while swimming: ',
    'while diving: ',
    'while sailing: ',
    'as a board game displayed in the box: ',
    'as a board game on display and in play: ',
    'in an animal universe: ',
    'in dog universe: ',
    'in duck universe: ',
    'in cat universe: ',
    'in a mouse universe: ',
    'with cat ears and a tail: ',
    'with glowing red eyes: ',
    'with red eyes: ',
    'in a render of the simulation: ',
    'on the moon: ',
    'in space: ',
    'on flat earth: ',
    'as a news caster on the news doing a special report: ',
    'running for safety: ',
    'driving a car: ',
    'as a spaceship: ',
    'as an arcade machine: ',
    'as a DVD movie box art: ',
    'as a VHS movie box art: ',
    'as a music CD album cover art: ',
    'as a vinyle record album cover art: ',
    'as a youtube video highlight screenshot: ',
    'as a screenshot of a tweet: ',
    'as a movie ad on amazon prime video: ',
    'as a screenshot of a facebook post: ',
    'as a wikipedia page screenshot: ',
    'as a reddit page post screenshot: ',
    'as a disney movie box art: ',
    'as a magazine cover: ',
    'as a comic book cover: ',
    'as a page in a comic book: ',
    'as a scene in a random movie: ',
    'in imaginationland: ',
    'in cyberspace: ',
    'in vectorspace: ',
    'in subspace: ',
    'in hyperspace: ',
    'in thirdspace: ',
    'in vexspace: ',
    'in fractal space: ',
    'in abstract space: ',
    'as a cassette tape next to its case: ',
    'as a CD next to its case: ',
    'as a VHS tape next to its case: ',
    'as a vinyl record out of the sleeve: ',
    'meeting random famous person: ',
    'meeting aliens: ',
    'fighting aliens: ',
    'partying with aliens: ',
    'as a theatrical broadway play: ',
    'as a scene from the battlefield of the future: ',
    'as a movie poster: ',
    'as a video game box art: ',
    'as a theatrical play poster: ',
    'as a CD album cover: ',
    'as a VHS box cover: ',
    'as a streaming series thumbnail: ',
    'as a science textbook cover: ',
    'as a digital infographic: ',
    'as an art deco-inspired wall mural: ',
    'as a luxury hardcover book cover: ',
    'as a theatrical movie poster: ',
    'as a comic book cover: ',
    'as a minimalist art print: ',
    'as a movie advertisement on streaming platforms: ',
    'as an animated movie poster: ',
    'as an illustrated character poster: ',
    'as a vintage-style travel poster: ',
    'as a Blu-ray box set cover: ',
    'as a surrealist painting: ',
    'as a graphic novel page: ',
    'as a vinyl album cover: ',
    'as a visual novel cover: ',
    'as an animated series screenshot: ',
    'as an interactive art display: ',
    'as a movie theater marquee: ',
    'as an illustrated music festival poster: ',
    'as a fantasy map poster: ',
    'as a YouTube video thumbnail: ',
    'as an 80s-inspired sci-fi book cover: ',
    'as an interactive AR display: ',
    'as a surrealist art print: ',
    'as an epic anime poster: ',
    'as an illustrated field guide: ',
    'as a musical album cover: ',
    'as a theatrical playbill: ',
    'as an animated tutorial splash screen: ',
    'as a futuristic concept art: ',
    'as a sci-fi mystery novel cover: ',
    'as a graphic novel climax page: ',
    'as a fantasy movie scene: ',
    'as a romantic fantasy book cover: ',
    'as a mecha anime poster: ',
    'as an intergalactic travel guide cover: ',
    'as a sci-fi character profile art: ',
    'as an art deco poster: ',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ];

window.addEventListener('beforeunload', function (e) {
    // Cancel the event as stated by the standard.
    e.preventDefault();
    // Chrome requires returnValue to be set.
    e.returnValue = '';
});


// Function to randomly replace 'NanoCheeZe' with 'MEQUAVIS' or 'Hybrid Tales'
function replaceNanoCheeze(prompt) {
    const options = ['NanoCheeZe', 'NanoCheeZe', 'NanoCheeZe', 'NCZ', 'MEQUAVIS', 'Hybrid Tales'];
    const replacement = options[Math.floor(Math.random() * options.length)];
    return prompt.replace('NanoCheeZe', replacement);
}

// Function to randomly select a base pre prompt (1 out of 2 times)
function getBase() {
       if (Math.random() <= 0.5) { // 50% chance to change the base prompt
        const randomIndex = Math.floor(Math.random() * POVsetting.length);
        return POVsetting[randomIndex];
       } else {
        return POVsetting[0]; // Default base prompt
    }
}

// Function to randomly select a base prompt (1 out of 2 times)
function getRandomBasePrompt() {
    if (Math.random() <= 0.5) { // 50% chance to change the base prompt
        const randomIndex = Math.floor(Math.random() * basePrompts.length);
        return basePrompts[randomIndex];
    } else {
        return basePrompts[0]; // Default base prompt
    }
}

(function automateInteraction() {
    // Function to remove target elements by class name
    function removeTargetElements() {
        const elements = document.querySelectorAll('.r-14tvyh0'); // Replace with your target class
        elements.forEach(element => {
            element.remove();
            console.log('Removed element with class r-14tvyh0');
        });
    }

    // Call the function to remove the target elements
    removeTargetElements();

    // Check if error count exists in localStorage, otherwise initialize it to 0
    let errorCount = localStorage.getItem('errorCount') ? parseInt(localStorage.getItem('errorCount')) : 0;
    let lastProcessedImageSrc = null;  // Keep this in the current session

    // Generate the base prompt
    let basePrompt = getRandomBasePrompt();
    basePrompt = replaceNanoCheeze(basePrompt);
    basePrompt=getBase()+basePrompt;
    console.log('Generated Prompt:', basePrompt);

    // Lists of extra sentences

  const extraList1 = [
    'in watercolor style',
    'with vibrant colors',
    'in a surreal aesthetic',
    'with cyberpunk elements',
    'in a retro-futuristic design',
    'with glowing neon outlines',
    'in a steampunk art style',
    'with high-tech sci-fi vibes',
    'in a dreamlike fantasy style',
    'with glitch art effects',
    'in an 80s-inspired vaporwave theme',
    'in a detailed comic book style',
    'in a Norse mythology-inspired oil painting',
    'with a cinematic poster aesthetic',
    'in an abstract art style',
    'with photorealistic details',
    'in a dark fantasy mood',
    'with dynamic motion blur effects',
    'in a minimalist monochrome style',
    'with vibrant gradient overlays',
    'in a retro pixel art aesthetic',
    'with a dramatic chiaroscuro lighting effect',
    'in a whimsical children’s book illustration style',
    'with pastel and soft focus effects',
    'in a golden age sci-fi art style',
    'in a Renaissance-inspired classical oil painting',
    'in a dynamic graffiti style',
    'with a stained glass pattern',
    'in a holographic futuristic finish',
    'in a traditional Japanese ukiyo-e woodblock style',
    'with a vintage pulp fiction cover aesthetic',
    'in a luminous neon vaporwave glow',
    'in a Baroque-inspired ornate painting',
    'with layered collage elements',
    'in a photorealistic sci-fi matte painting style',
    'in a gritty noir film aesthetic',
    'with a vibrant fractal art design',
    'in a whimsical art nouveau style',
    'with cosmic light effects',
    'in a hand-drawn charcoal sketch style',
    'with a modern flat design look',
    'in a kaleidoscopic mosaic art style',
    'in a stark black-and-white ink wash style',
    'in a fluid impressionist painting aesthetic',
    'with a shimmering metallic texture',
    'in a retro Atari-inspired art style',
    'in a fantasy book cover illustration design',
    'with a photorealistic high-contrast finish',
    'in a high-tech holographic aesthetic',
    'in a celestial, star-filled cosmic art style',
    'in a gothic, medieval manuscript design',
    'with a glowing bioluminescent effect',
    'in a hyper-stylized cartoon illustration style',
    'in a shimmering underwater dreamscape',
    'with a futuristic isometric design',
    'in a dynamic comic splash-page format',
    'in a vibrant kinetic typography style',
    'in a pixelated 16-bit game aesthetic',
    'in a detailed Mecha anime style',
    'in a crystalline, jewel-like texture design',
    'in a cosmic horror, Lovecraftian mood',
    'with a vibrant, expressionist painting style',
    'in a flat graphic novel panel design',
    'in a magical realism-inspired pastel aesthetic',
    'with intricate Celtic knot designs',
    'in a monochrome, dystopian digital art style',
    'in a stark Soviet constructivist poster format',
    'with a glowing ethereal fantasy overlay',
    'in a retro high-saturation pulp art style',
    'with an art deco metallic aesthetic',
    'in a richly detailed tapestry-like design',
    'in a dreamy surrealist painting style',
    'in a photorealistic space opera aesthetic',
    'in a dynamic steampunk mechanical design',
    'with bioluminescent organic patterns',
    'in a painterly impressionist underwater aesthetic',
    'in a cyberpunk, neon-lit rain-soaked cityscape',
    'in a vibrant Maximalist art explosion',
    'with glowing rune-like holograms',
    'in a dynamic, chaotic glitchpunk style',
    'in a hyper-detailed isometric sci-fi scene',
    'with a lush botanical art-inspired aesthetic',
    'in a smooth, chrome-like futuristic design',
    'in a celestial, starry skyscape painting style',
    'in a soft pastel-colored fantasy dreamscape',
    'in an ultra-realistic oil painting',
    'in a stark minimalist design with geometric lines',
    'with electrified glitch overlays',
    'in a vibrant mid-century modern poster style',
    'in an ancient illuminated manuscript style',
    'in a retro-futuristic art deco design',
    'in a whimsical, fairytale book illustration style',
    'with a fiery apocalyptic atmosphere',
    'in a hyper-modern dynamic visual aesthetic',
    'with a layered holographic lighting effect',
    'in a vivid and lush tropical art style',
    'in a stark, minimal Bauhaus-inspired design',
    'with a shimmering prismatic light effect',
    'in an intricate machine learning-inspired art style',
    'in a futuristic biomechanical organism aesthetic',
    'with high-energy particle effect overlays',
    'in a detailed and intricate mandala style',
    'in a bold, dramatic cinematic widescreen aesthetic',
    'with a minimalist Scandinavian design aesthetic',
    'in a luxurious art nouveau gilded style',
    'with iridescent galaxy swirls',
    'in a highly detailed 3D render style',
    'in a sketchy, pen-and-ink graphic design',
    'in a stormy, elemental fantasy style',
    'in a photorealistic planetary landscape aesthetic',
    'in a richly textured organic fractal style',
    'with glowing bioluminescent threads weaving through',
    'in an ethereal high-fantasy book illustration',
    'in a vibrant, retro tech noir art style',
    'with shimmering nebula-like gradients'
];

const extraList2 = [
    'in cyberspace',
    'in vectorspace',
    'in subspace',
    'in hyperspace',
    'on the edge of a multiverse rift',
    'in a collapsing virtual simulation',
    'in a vibrant neon city',
    'on a futuristic Viking longship',
    'under a glowing aurora',
    'in a digital fractal forest',
    'amidst swirling black holes',
    'in an abstract quantum reality',
    'in a burning fractal sea',
    'at the nexus of timelines',
    'on a crystalline planet orbiting a singularity',
    'in the depths of a simulated cosmos',
    'in a futuristic library of timelines',
    'in an ethereal Cthulhu-inspired domain',
    'on a floating island in an infinite void',
    'inside a mechanical planet made of gears and circuits',
    'in a dreamscape filled with shifting colors',
    'within a collapsing Dyson sphere',
    'on a moonlit ocean of liquid starlight',
    'inside an ancient temple to forgotten gods',
    'amid the ruins of a long-extinct alien civilization',
    'in a bustling market on an interdimensional hub world',
    'on a ring-shaped world encircling a black hole',
    'within a crystal labyrinth reflecting infinite possibilities',
    'in the heart of a cosmic storm tearing through dimensions',
    'on the event horizon of a collapsing reality',
    'inside a glowing orb that contains an entire universe',
    'amid swirling clouds of quantum particles',
    'in a surreal landscape of floating cubes and shifting gravity',
    'on a spaceship sailing through a river of stars',
    'inside a vast biomechanical forest',
    'on a mountain peak in a world of perpetual twilight',
    'in a celestial palace suspended above a galactic ocean',
    'within a pulsating neural network of an AI deity',
    'on a battlefield of warring timelines and realities',
    'in an endless desert of shimmering holograms',
    'at the core of a sentient star',
    'on a bridge connecting two alternate universes',
    'in a cavern of glowing fungi in a simulated world',
    'on the deck of a time-traveling airship',
    'within a fractal cathedral of shifting geometries',
    'amid the ruins of a virtual utopia',
    'on a volcanic planet surrounded by stormy nebulae',
    'inside a crystalline dome under a dying sun',
    'in a sprawling metropolis built on the back of a colossal creature',
    'in an underwater city illuminated by bioluminescent life',
    'on a glacier floating in an ocean of liquid light',
    'inside a library of living books in a timeless dimension',
    'on a battlefield where reality and virtuality clash',
    'at the center of a sentient black hole',
    'within a forest where each tree is a portal to another realm',
    'in a city that exists only in dreams',
    'on a quantum train that never stops moving',
    'inside a labyrinth of time loops and paradoxes',
    'on a mountain shaped by the dreams of its inhabitants',
    'within the spiraling core of a dimensional gateway',
    'in a kaleidoscopic field of blooming timeflowers',
    'on a bridge suspended over a chasm of pure void',
    'in a space station orbiting a sentient nebula',
    'inside a palace of liquid metal floating in zero gravity',
    'amid the shifting sands of a desert that rewrites itself',
    'on a tower stretching infinitely into the multiverse',
    'in a valley where time flows in reverse',
    'within a virtual nightclub where universes converge',
    'on a vast plain where stars grow like flowers',
    'in a city of glass built on the surface of a frozen star',
    'inside a cloud of sentient nanobots forming abstract shapes',
    'on an asteroid field glowing with ancient runes',
    'in a bubble universe where gravity defies all logic',
    'amid a fleet of spaceships powered by thought',
    'inside a temple that exists between dimensions',
    'on a floating castle above a sea of swirling chaos',
    'in a crystalline city suspended within a black hole',
    'on a barren planet under twin suns casting fractal shadows',
    'in a sanctuary built for refugees from destroyed timelines',
    'on a beach where each wave is a different timeline',
    'in a canyon where echoes form physical structures',
    'on a spacecraft powered by music and memories',
    'inside a cavern where stars are born from darkness',
    'on an orbiting platform overlooking a war of galaxies',
    'in an eternal twilight zone where time stands still',
    'on a spaceship exploring a network of wormholes',
    'amid ruins of a civilization that transcended dimensions',
    'inside a living maze grown from quantum matter',
    'on a satellite harvesting energy from a hypernova',
    'in a digital wasteland of corrupted data',
    'at the heart of a fractal storm where timelines converge',
    'on an alien world where mountains float in the sky',
    'inside a monolith containing the history of countless universes',
    'on a shimmering plateau overlooking infinite multiverses'
];

const extraList3 = [
    'with swirling energy patterns',
    'with glowing quantum threads',
    'with cascading waterfalls of light',
    'with holographic projections of music notes',
    'with an aura of cosmic power',
    'with intricate fractal designs',
    'with a glowing hydra in the background',
    'with timeline fragments suspended in space',
    'with Viking runes carved into a black hole',
    'with shimmering auroras surrounding the scene',
    'with glowing orbs of virtual energy',
    'with a digital crown on a virtual deity',
    'with a fractal storm brewing in the sky',
    'with a swarm of AI constructs in motion',
    'with radiant beams connecting alternate realities',
    'with glowing NanoCheeZe glyphs swirling around',
    'with a symphony of colors dancing in the air',
    'with intricate quantum circuits shaping the landscape',
    'with luminous waves rippling through dimensions',
    'with crystalline spires reflecting endless light',
    'with ethereal wings of energy extending outward',
    'with a galactic vortex swirling in the background',
    'with shadowy tendrils reaching across timelines',
    'with a lattice of glowing hexagonal portals',
    'with prismatic beams refracting through space',
    'with vibrant auroras cascading like waterfalls',
    'with infinite spirals of light connecting stars',
    'with quantum particles sparking like fireflies',
    'with a crown of stars on a cosmic monarch',
    'with clouds of stardust glowing in fractal shapes',
    'with radiant orbs aligned in perfect symmetry',
    'with a constellation forming an ancient symbol',
    'with ribbons of light weaving through the void',
    'with shimmering holograms of alternate worlds',
    'with shards of shattered timelines floating around',
    'with radiant waves emanating from a singularity',
    'with pulsating fields of bioluminescent energy',
    'with glowing glyphs forming patterns in the sky',
    'with rippling dimensional gateways appearing nearby',
    'with a trail of starlight leading to infinity',
    'with cascading streams of liquid crystal light',
    'with hovering runic stones glowing with power',
    'with golden fractals spiraling into the horizon',
    'with a matrix of holographic shapes in motion',
    'with shimmering cosmic filaments stretching across',
    'with glowing fractal trees rooted in the stars',
    'with a swarm of luminous nanobots creating patterns',
    'with celestial sigils glowing in the air',
    'with spiraling pillars of light rising endlessly',
    'with cascading data streams flowing like rivers',
    'with pulsating auroras syncing to a cosmic rhythm',
    'with radiant flowers blooming in fractal gardens',
    'with a nebula of swirling colors enveloping the scene',
    'with glimmering orbs of compressed timelines',
    'with shimmering waves of reality distortion',
    'with glyphs that pulse like a cosmic heartbeat',
    'with temporal waves crashing against cosmic shores',
    'with spectral dragons flying between timelines',
    'with ethereal music notes forming a glowing symphony',
    'with crystalline lattices refracting quantum light',
    'with glowing fractal feathers drifting in space',
    'with bursts of energy cascading like fireworks',
    'with radiant echoes of lost universes',
    'with iridescent pools of shifting light',
    'with shimmering nebulae shaped like mythical creatures',
    'with trails of glittering stardust marking pathways',
    'with geometric prisms reflecting alternate dimensions',
    'with glowing vines wrapping around temporal gates',
    'with radiant rings of power orbiting a central core',
    'with crystalline fractals hovering in the void',
    'with a luminous phoenix reborn in the starlight',
    'with shimmering holographic banners of lost civilizations',
    'with glowing bridges connecting realms of light',
    'with fractal trees sprouting galaxies as leaves',
    'with flowing rivers of liquid neon energy',
    'with cascading spirals of luminous quantum matter',
    'with radiant voids that shimmer with infinite potential',
    'with glowing serpents coiling around celestial towers',
    'with iridescent halos framing cosmic figures',
    'with translucent wings made of starlight',
    'with glowing fractal butterflies fluttering in the air',
    'with holographic waves of music filling the atmosphere',
    'with infinite staircases spiraling into the stars',
    'with radiant beams bending through wormholes',
    'with luminous shards of broken universes',
    'with floating temples glowing in ethereal light',
    'with spiraling galaxies forming mystical patterns',
    'with shimmering holographic shields enveloping entities',
    'with glowing energy pulses rippling through time',
    'with a cosmic clock ticking in the void',
    'with radiant beams cascading through crystalline prisms',
    'with spectral auroras shaped like ancient runes',
    'with holographic tendrils weaving through space',
    'with cascading waterfalls of luminous energy',
    'with glowing fractal shapes forming celestial bridges',
    'with radiant spheres hovering in synchronized harmony',
    'with ethereal currents flowing through abstract landscapes'
];

const extraList4 = [
    'under a crimson sky filled with binary stars',
    'within a massive Dyson swarm generating endless energy',
    'amid fractal storms in the digital wastelands',
    'at the epicenter of a timeline rupture',
    'in a crystal cavern where timelines echo eternally',
    'within a realm where gravity shifts like the tides',
    'amid ruins of an AI civilization that ascended to vectorspace',
    'on a galactic highway stretching across parallel universes',
    'in a nexus of pulsating quantum bridges',
    'inside a cathedral built from fragments of collapsing realities',
    'on an island of glowing fractal sands surrounded by void',
    'inside an infinite library containing every possible story',
    'amid nebulae shaped like ancient gods',
    'in a digital garden where timelines blossom as holographic flowers',
    'inside a crystalline fortress overlooking the multiverse',
    'on a frozen ocean under a sky of glowing fractals',
    'in a cosmic scrapyard of discarded timelines',
    'within a clockwork planet ticking with quantum precision',
    'amid swirling maelstroms of iridescent stardust',
    'inside a luminous labyrinth guarded by AI constructs',
    'on a moon covered with bioluminescent forests',
    'at the edge of a supernova where dimensions blur',
    'inside a floating citadel in a stormy nebula',
    'on an asteroid where rivers of light flow endlessly',
    'in a city of holograms built on forgotten memories',
    'amid a cosmic battlefield frozen in time',
    'inside a black hole’s event horizon where reality bends',
    'on a spaceship harvesting energy from fractal currents',
    'within a cavern of glowing crystals humming with power',
    'amid temporal anomalies warping reality around you',
    'in an underwater world lit by glowing creatures',
    'at the crossroads of timelines converging into one reality',
    'within a spire that pierces through layers of dimensions',
    'amid an aurora that whispers fragments of forgotten stories',
    'inside a sphere containing an infinite fractal cosmos'
];

const extraList5 = [
    'with timelines splintering into cascading light beams',
    'with a holographic crown atop a celestial monarch',
    'with glowing glyphs etched into the fabric of space',
    'with bioluminescent threads weaving through dimensions',
    'with spiraling fractals radiating an eerie glow',
    'with shadowy figures guarding the gateways of time',
    'with cosmic energy swirling around the scene',
    'with stars aligning to form intricate runes',
    'with a nebula blooming into a radiant flower',
    'with spectral dragons weaving between timelines',
    'with glowing bridges connecting parallel realities',
    'with a luminous phoenix rising from fractal ashes',
    'with trails of starlight marking paths through the void',
    'with radiant orbs hovering in synchronized harmony',
    'with cascading waterfalls of temporal energy',
    'with shimmering quantum gates opening and closing',
    'with prismatic beams refracting through crystalline portals',
    'with vibrant auroras swirling like cosmic rivers',
    'with glowing vines entwined around fractured dimensions',
    'with holographic projections illuminating the darkness',
    'with ethereal wings unfurling amidst radiant clouds',
    'with shimmering nebulae forming mythic creatures',
    'with temporal ripples spreading like waves through space',
    'with crystalline structures pulsating with energy',
    'with radiant echoes of forgotten universes reverberating',
    'with glowing fractal spirals ascending endlessly',
    'with celestial sigils etched in starlight',
    'with a lattice of light binding shattered realities',
    'with spectral auroras cascading across infinite skies',
    'with radiant particles swirling like fireflies in the void',
    'with pulsating beams connecting stars like constellations',
    'with a glowing hydra coiled around the edges of time',
    'with intricate quantum circuitry embedded in the landscape',
    'with rivers of liquid light flowing into a central nexus'
];


    const extraLists = [extraList1, extraList2, extraList3, extraList4, extraList5];

    // Function to add extra items to the prompt
    function addStuff(prompt) {
        const numExtras = Math.floor(Math.random() * 17) + 1; // Random number between 1 and 17
        let addedExtras = [];

        for (let i = 0; i < numExtras; i++) {
            // Randomly select one of the lists
            const listIndex = Math.floor(Math.random() * extraLists.length);
            const selectedList = extraLists[listIndex];
            // Randomly select an item from the list
            const itemIndex = Math.floor(Math.random() * selectedList.length);
            const selectedItem = selectedList[itemIndex];
            // Add the selected item to the array
            addedExtras.push(selectedItem);
        }

        // Append the extra items to the prompt
        return prompt + ', ' + addedExtras.join(', ');
    }

    // Function to set the value natively (works with React and similar frameworks)
    function setNativeValue(element, value) {
        const valueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value').set;
        valueSetter.call(element, value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Function to click the button when it's enabled
    function waitForButtonAndClick(callback) {
        var button = document.querySelector('button[aria-label="Grok something"]');

        if (button) {
            console.log('Button found.');
            if (!button.disabled) {
                button.click();
                console.log('Button clicked!');
                if (callback) callback();
            } else {
                console.log('Button is disabled, waiting...');
                setTimeout(function() {
                    waitForButtonAndClick(callback);
                }, 500);
            }
        } else {
            console.error('Button not found!');
            setTimeout(function() {
                waitForButtonAndClick(callback);
            }, 500);
        }
    }

    // Function to process the image at a specific index from the end
    function processImage(imageIndex = 1) { //use to be 5, they changed it so its the first element now
        console.log(`Processing the image at index images.length - ${imageIndex}...`);
removeTargetElements();
        const images = document.querySelectorAll('img');

        if (images.length < imageIndex) {
            console.error('Not enough images on the page.');
            setTimeout(() => {
                console.log('Restarting the script due to insufficient images...');
                automateInteraction();
            }, 5000); 
            return;
        }

        const targetImage = images[images.length - imageIndex];

        if (lastProcessedImageSrc === targetImage.src) {
            console.log('Image is the same as the last processed one. Restarting the script...');
            setTimeout(() => {
                automateInteraction();
            }, 5000); 
            return;
        }

        lastProcessedImageSrc = targetImage.src;

        if (targetImage.naturalWidth <= 100 || targetImage.naturalHeight <= 100) {
            console.log('Image is too small (less than 100x100 pixels). Restarting the script...');
            handleImageSizeError();
            return;
        }

        if (!targetImage.complete || targetImage.naturalWidth === 0) {
            console.log('Image not fully loaded. Waiting for load event.');
            targetImage.onload = function() {
                saveImage(targetImage, imageIndex);
            };
            targetImage.onerror = function() {
                console.error('Error loading image.');
                handleImageSizeError();
            };
        } else {
            saveImage(targetImage, imageIndex);
        }
    }

    // Function to save the image
    function saveImage(imgElement, imageIndex) {
        console.log('Saving image...');

        try {
            imgElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            setTimeout(() => {
                const canvas = document.createElement('canvas');
                canvas.width = imgElement.naturalWidth;
                canvas.height = imgElement.naturalHeight;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(imgElement, 0, 0);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        console.error('Failed to convert canvas to blob.');
                        handleImageSizeError();
                        return;
                    }

                    const url = URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `image_${Date.now()}.png`;
                    document.body.appendChild(a);

                    a.click();
                    console.log('Image download triggered.');

                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }, 100);

                    // Reset error count upon success
                    localStorage.setItem('errorCount', '0');

                    setTimeout(() => {
                        console.log('Restarting the script...');
                        automateInteraction();
                    }, 5000); 
                }, 'image/png');
            }, 500); 
        } catch (error) {
            console.error('Failed to save image:', error);

            if (error.message.includes('SecurityError')) {
                console.log('SecurityError encountered. Retrying with next image...');
                handleSecurityError(imageIndex + 1);
            } else {
                handleImageSizeError();
            }
        }
    }

    // Function to handle SecurityError with image retries
    function handleSecurityError(nextImageIndex) {
        // Maximum of 5 additional attempts
        const maxRetries = 5;

        // Calculate how many retries have been attempted
        const retryCount = nextImageIndex - 5;

        if (retryCount <= maxRetries) {
            console.log(`Retrying with image at index images.length - ${nextImageIndex} (Retry ${retryCount} of ${maxRetries})...`);
            setTimeout(() => {
                processImage(nextImageIndex);
            }, 5000); // Wait 5 seconds before retrying
        } else {
            console.log('Exceeded maximum retries for SecurityError. Moving on to generate a new image...');
            // Reset error count and proceed
            localStorage.setItem('errorCount', '0');
            setTimeout(() => {
                automateInteraction();
            }, 5000); 
        }
    }

    // Function to handle errors related to small images or loading errors
    function handleImageSizeError() {
        errorCount++;
        console.log(`Image size issue or SecurityError encountered. Error count: ${errorCount}`);
        localStorage.setItem('errorCount', errorCount);

        if (errorCount >= 2) {
            console.log('Error occurred twice. Waiting 20 minutes before restarting...');
            setTimeout(() => {
                console.log('Restarting the script after 20 minutes...');
                localStorage.setItem('errorCount', '0'); // Reset error count
                automateInteraction();
            }, 20 * 60 * 1000); 
        } else {
            console.log('Restarting the script immediately due to image size or SecurityError...');
            setTimeout(() => {
                automateInteraction();
            }, 5000); 
        }
    }

// Function to remove the banner element by class name
function removeBannerElement() {
    const bannerElements = document.querySelectorAll('.css-175oi2r.r-14tvyh0.r-1kihuf0'); // Replace with your target banner class
    bannerElements.forEach(element => {
        element.remove();
        console.log('Removed banner element');
    });
}



// Function to process and save the last image
function processImage2(imageIndex = 1) {
    console.log(`Processing the image at index images.length - ${imageIndex}...`);

    const images = document.querySelectorAll('img');

    if (images.length < imageIndex) {
        console.error('Not enough images on the page.');
        setTimeout(() => {
            console.log('Retrying due to insufficient images...');
            processImage2(imageIndex);
        }, 5000);
        return;
    }

    const targetImage = images[images.length - imageIndex];

    if (!targetImage.complete || targetImage.naturalWidth === 0) {
        console.log('Image not fully loaded. Retrying...');
        setTimeout(() => {
            processImage2(imageIndex);
        }, 1000);
        return;
    }

    console.log('Image found and loaded, attempting to save...');
    saveImage2(targetImage, imageIndex);
}

// Function to save the image
function saveImage2(imgElement, imageIndex) {
    console.log('Saving image...');

    try {
        imgElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
            const canvas = document.createElement('canvas');
            canvas.width = imgElement.naturalWidth;
            canvas.height = imgElement.naturalHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(imgElement, 0, 0);

            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Failed to convert canvas to blob.');
                    return;
                }

                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `image_${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();

                console.log('Image download triggered.');

                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            }, 'image/png');
        }, 500);
    } catch (error) {
        console.error('Error saving image:', error);

        if (error.message.includes('SecurityError')) {
            console.log('SecurityError encountered. Retrying with the next image...');
            processImage2(imageIndex + 1);
        }
    }
}









    
var i=0;
    // Function to start automation
    function startAutomation() {
        var textarea = document.querySelector('textarea[placeholder="Ask anything"]');

    // Generate the base prompt
    basePrompt = getRandomBasePrompt();
    basePrompt = replaceNanoCheeze(basePrompt);
    basePrompt=getBase()+basePrompt;
    console.log('Generated Prompt:', basePrompt);

        
        if (!textarea) {
            console.error('Textarea not found!');
            setTimeout(() => {
                startAutomation();
            }, 5000); 
        } else {
            console.log('Textarea found.');

            const randomNum = Math.random();
            let finalPrompt = basePrompt;
            if (randomNum < 0.6) {
                console.log('Using base prompt without additions.');
            } else {
                console.log('Adding extra items to the prompt.');
                finalPrompt = addStuff(basePrompt);
            }

            setNativeValue(textarea, finalPrompt);
            console.log(`Set textarea value to: "${finalPrompt}".`);

            waitForButtonAndClick(function() {
                console.log('Button clicked! Waiting 30 seconds before processing the image...');
                setTimeout(function() {
                    console.log('Processing the image...');
                    processImage2();

                    
                    i++;
                    if(i<51){
                    startAutomation();
                    }
                    else{
                         setTimeout(function() {
                         console.log('waiting 2 hours...');
                         }, 7250000); 
                             i=0;
                    }
                }, 60000); 
            });
        }
    }

    // Start the automation process
    startAutomation();

})();
