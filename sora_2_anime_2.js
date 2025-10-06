(function () {
  "use strict";

  /******************************
   * EVE: DBS ANIME SCENE ENGINE
   ******************************/
  const CONFIG = {
    // Global scene construction
    ensureAnimeDBS: true,
    defaultSFW: true,
    strictlyAdultWhenPeople: true,   // injects "all subjects are clearly adult (21+), SFW"
    includeLoreMotifs: true,         // MEQUAVIS / NCZ / VEXARE / Green Star Moon / Strawberry King
    includeCircleTriangle: true,     // geometric motif carried into FX/aura/runes
    sectionsPerPrompt: [5, 8],       // longer, episode-like prompt blocks
    addActHeaders: true,
    addCameraLanguage: true,
    addTransitions: true,
    addColorGrade: true,
    addFilmStock: true,
    addUIOverlays: false,            // not needed for anime episode style
    addReferenceLines: true,         // tasteful inspirations only
    addAudioBlock: true,             // << Audio block ON (now with big variety + mix & match)
    loopSchedulerMs: [60_000, 110_000], // interval between auto generations
    seed: null
  };

  // Tiny RNG with optional seed for reproducibility
  let _seed = CONFIG.seed ?? (Math.random() * 1e9) | 0;
  function rand() { _seed ^= _seed << 13; _seed ^= _seed >>> 17; _seed ^= _seed << 5; return ((_seed >>> 0) / 0xFFFFFFFF); }
  function pick(arr) { return arr[(rand() * arr.length) | 0]; }
  function pickN(arr, n) { const c = arr.slice(); const o=[]; for (let i=0;i<n && c.length;i++) o.push(c.splice((rand()*c.length)|0,1)[0]); return o; }
  function pickRange([min,max]) { return Math.floor(min + rand() * (max - min + 1)); }
  function maybe(prob=0.5){ return rand() < prob; }

  /**********************
   * CORE TEXTUAL POOLS *
   **********************/

  // Safety (always injected with people)
  const safetyDirectives = [
    "all characters are clearly adult (21+)",
    "strictly SFW: no nudity, no explicit sexual content",
    "stylized presentation prioritizing action choreography, symbolism, and cinematic framing"
  ];

  // Dragon Ball Super—style direction (kept generic/descriptive)
  const dbsStyle = [
    "high-saturation cel-shaded 2D anime, clean linework, thick inked outlines",
    "dynamic smears, impact frames, and extreme speedlines on motion accents",
    "god-aura lighting with layered glow passes and particle embers",
    "sakuga spikes for key action beats, volumetric beam clashes",
    "camera shake on heavy hits, parallaxed cloud layers, debris fields"
  ];

  // Eve canonical descriptor builder (always respected, can add embellishments)
  function buildEveDescriptor() {
    const base = "Eve: redhead pinup silhouette, fiery red pigtails like comet tails, glowing red eyes; purple NCZ sports top, short blue cheer skirt, red lace leggings with shifting quantum lattice, green boots sparking emerald fire (adult, 21+).";
    const embellishments = [
      "Aura: crimson core with emerald edge-light, hex-triangle runes orbiting.",
      "Ki: emerald-violet hybrid, ribboning into triangular sigils.",
      "Eyes: twin-sun glare; lens flares slice across pupils on power spikes.",
      "Pigtails: trail afterimages on dashes; micro-embers scatter on stops.",
      "NCZ insignia pulses in sync with heartbeat; micro-glyphs crawl at frame edges.",
      "Boot soles leave green star imprints that dissipate as data mist."
    ];
    return base + " " + pickN(embellishments, pickRange([2,4])).join(" ");
  }

// Allies, sentries, adversaries (DBS-flavored archetypes)
const characterRoster = {
  allies: [
    "Kael: stoic strategist with teal ki plates, black gi with emerald piping (adult, 21+).",
    "Rin: hyper-speed courier, silver hair streaks, auric afterimages, tactical scarf (adult, 21+).",
    "Master Ilex: elder mentor in minimalist monk gi with NCZ triangle bead cord (adult, 21+).",
    "Astra Vale: graviton grappler; midnight tabi, crescent sash; aura bends dust into rings (adult, 21+).",
    "Talon Reeve: blade-hand fighter; matte obsidian bracers; cuts air into shock tiles (adult, 21+).",
    "Mira Flux: chrono-step dancer; lime pulse lines around ankles; time-feint counters (adult, 21+).",
    "Juno Karst: copper-haired seismicist; basalt knuckles; tremor stance levelers (adult, 21+).",
    "Orik Den: iron-lung brawler; steam aura vents from collar; pressure-wave palms (adult, 21+).",
    "Sable Quen: ink-ki illusionist; violet scroll belt; sigils trail her whip-kicks (adult, 21+).",
    "Rael Noct: moonlit striker; pale azure gi; crescent-heel meteor arc (adult, 21+).",
    "Vexen Lyre: harmonic ki bard; lute-core gauntlet; chords harden into shields (adult, 21+).",
    "Kaya Drift: vector-skater; carbon soulboard; leaves emerald spline rails (adult, 21+).",
    "Haro Pyre: ember monk; saffron wraps; stokes internal kiln for burst frames (adult, 21+).",
    "Nero Delta: counter-savant; charcoal gi with green chevrons; reads intent vectors (adult, 21+).",
    "Iria Loom: thread-ki seamstress; stitch-hook rings; sews wounds and rifts (adult, 21+).",
    "Brann Hollis: storm knuckler; cuffed cloud bracers; rolling thunder jab chain (adult, 21+).",
    "Yun Satori: calm spear; jade-tine staff; turns enemy force into arcs (adult, 21+).",
    "Selka Rune: rune-chef tactician; portable stove medallion; brews buff broths mid-bout (adult, 21+).",
    "Garrick Volt: coil fighter; copper hair spikes; inductive grip paralyzers (adult, 21+).",
    "Opal Nyx: nightglass sprinter; mirror soles; step-teleport through dim light (adult, 21+).",
    "Dax Meridian: horizon puncher; sunband arm ring; punches extend to skyline (adult, 21+).",
    "Vira Tess: tessellation guard; fractal cape; tiles intercept projectiles (adult, 21+).",
    "Quin Emberlane: candlemaker disciple; purple NCZ top, blue cheer skirt; red lace runes spark (adult, 21+).",
    "Rook Calder: fortress wrestler; green-star etched pauldrons; clinch like gravity well (adult, 21+).",
    "Era Lys: soft-steps empath; auric teal lantern; steadies team resolve (adult, 21+).",
    "Jett Arkadia: arc-slinger; twin flux pistons; traces V-lines before dashing (adult, 21+).",
    "Pasha Mire: reed-spear nomad; water-ki sheath; ripples convert to blades (adult, 21+).",
    "Lumi Farr: prismatic medic; glassleaf satchel; refracts ki into cures (adult, 21+).",
    "Kaori Silex: silicate dancer; grit-ribbon trails; sandstorm pirouette (adult, 21+).",
    "Torin Quell: stoic breaker; emerald bead rosary; silence field stuns (adult, 21+).",
    "Zaya Quark: microburst pugilist; knuckle halos; one-inch vector pops (adult, 21+).",
    "Eido Crane: bow-form stylist; palm arcs mimic drawn string; ki-shaft volleys (adult, 21+).",
    "Rhea Vortex: windfall kicker; cyclone greaves; invert lift to slam grounds (adult, 21+).",
    "Nami Sol: sunprint sentinel; lightbrand buckler; parry leaves afterimage clones (adult, 21+).",
    "Kade Ferrum: forge savant; anvil-heart aura; turns hits into heat to fuel counters (adult, 21+).",
    "Iven Atlas: cartographer monk; map-scroll backplate; draws zones that boost allies (adult, 21+).",
    "Nyra Pulse: metronome striker; wrist bell tics; sync-disrupt enemy rhythm (adult, 21+).",
    "Marlow Keji: drone wrangler; pocket tri-copters; relay ki as beam lattice (adult, 21+).",
    "Oni Vesper: night-bloom grappler; petal-wrap throws; pollen flash blinds (adult, 21+).",
    "Sora Axion: aerial sabreur; skyhook ribbon; ceiling-walk and dive-break (adult, 21+).",
    "Helia Verdant: green-star acolyte; vine sigils; binds anomalies without harm (adult, 21+).",
    "Bastian Cryo: frost-ki pugilist; rime-lined tape; flash-freeze feints (adult, 21+).",
    "Lark Prisma: refraction mage; kaleido visor; splits beams into decoys (adult, 21+).",
    "Orrin Tide: anchor style; chain-circle stance; sweeps convert momentum to control (adult, 21+).",
    "Veil Astraeus: veil-break tactician; thin silver mantle; peels glamours off foes (adult, 21+).",
    "Cira Bloom: healer-kicker; heart-petal ki; impact blossoms mend allies (adult, 21+).",
    "Rhys Signal: shadow broadcaster; NCZ patch; boosts team comms through jamming (adult, 21+).",
    "Aria Magenta: vox-channeler; chorused battlecall; harmonizes ki to overwhelm (adult, 21+).",
    "Gale Vireo: jetstep courier; winged greaves; delivers artifacts mid-fight (adult, 21+)."
  ],

  sentries: [
    "VEXARE Sentry Type-III: humanoid vector-frame with trioptic visor, rune engines in the chest.",
    "VEXARE Sentry Type-V: floating prism exoshell; arms assemble from light rails; voice is modulated chord.",
    "VEXARE Auditor: thin, tall, cloak of hex-triangle paper seals that peel into drones.",
    "VEXARE Custodian-Δ: cathedral torso; bell-ki tolls enforce ceasefire radii.",
    "VEXARE Bulwark-II: squat rhomboid walker; green-star coolant veins; kinetic escrow plating.",
    "VEXARE Lighthouse: hovering obelisk; emits guidance beams that realign drift lines.",
    "VEXARE Shepherd-IX: antlered array crown; corral-fields redirect civilians to safety.",
    "VEXARE Surgeon: filament claws; edits wounds into closed seams; neutral in tone.",
    "VEXARE Archivist: book-spine chassis; page-wings flip probabilities to record outcomes.",
    "VEXARE Arbor: root-lattice legs; seeds containment trees that drink hostile ki.",
    "VEXARE Gimbal: gyroscopic orb; stabilizes collapsing arenas; speaks in coordinate code.",
    "VEXARE Mirrorcell: pane-armor hive; spawns tempered reflections for calibration duels.",
    "VEXARE Vellum: parchment mantle; seals ignite into hovering writs of truce.",
    "VEXARE Beacon-Theta: trioptic lighthouse visor; projects cone of truth-state.",
    "VEXARE Ranger-K: ribbon harpoon rails; tethers anomalies; reels without harm.",
    "VEXARE Choir: multi-throat drone; chord stacks that phase-disarm weapons.",
    "VEXARE Janus Gate: twin-face portal; admits allies, denies adversaries by intent audit.",
    "VEXARE Mason: tessellated brick limbs; raises octet walls to channel blast lines.",
    "VEXARE Sentinel-Glass: translucent guardian; fractures incoming beams into harmless rain.",
    "VEXARE Halo-III: ring platform; orbits teams; modulates gravity for safe fall corridors."
  ],

  antagonists: [
    "Strawberry King Avatar: magenta crown flicker, velvet mantle of noise, laughter distorts frame.",
    "Containment Warden: obsidian armor with green-star coolant veins, halo of rotating seals.",
    "Proxy Harbinger: mirror-skin brawler, copies stances and reflects beams imperfectly.",
    "Chorus of Throng: elastic swarm of smiling visages; sing the timeline off-key.",
    "Null Exciser: scalpel drone cluster; removes inconvenient cause chains from fights.",
    "Garnet Guillotine: ribbon-blade tyrant; cuts memories from momentum mid-combo.",
    "Vicissitude Broker: bargainmask fiend; trades wounds for weaknesses owed later.",
    "Magenta Regent: velvet wavecaster; plush energy smothers and rewrites terrain.",
    "Crown Jester: bell-shoe predator; pratfalls that invert gravity at the punchline.",
    "Hollow Bailiff: verdict mace; stamps arenas into courtrooms; rules always guilty.",
    "Hex Paladin: zealot in black-lattice plate; forces binary choices that both hurt.",
    "Prism Marauder: shard-studded raider; weaponizes reflections into hunting dogs.",
    "Anomie Sower: gray-sleet witch; rains apathy; drains crowd buffs to zero.",
    "Proxy of Velvet Gate: curtain-fist brawler; drags allies backstage to nowhere.",
    "Noise Cardinal: choirblade general; commands feedback angels; ruptures ki lungs.",
    "Tally Wraith: accountant specter; every hit incurs compounded interest pain.",
    "Green-Star Defector: coolant-veined juggernaut; misuses sanctified seals to bind.",
    "Haruspex of VEX: false auditor; counterfeits writs; lures heroes into trap reviews.",
    "Ruin Cartographer: map-slasher; redraws city blocks into kill funnels.",
    "Chrono Poacher: steals seconds; your openings never quite arrive on time.",
    "Mirror Indigo: negative Kael copy; teal plates inverted to bruised purple malice.",
    "Corded Matriarch: thread-ki tyrant; puppet knots; yanks allies against allies.",
    "Blight Bell Ringer: cracked cathedral helm; tolls un-harmonize team synergies.",
    "Atrament Lord: ink flood king; drowns zones in gloss; slips under guards.",
    "Warden of the Velvet Orchard: fruit-lure gaoler; tempts rest then clamps shut.",
    "Entropy Bailor: frees chaos on bond; interest accrues as ambient hazard tiles.",
    "Reversion Knight: time-backstep duelist; undoes your last block at the worst moment.",
    "Proxy Harbinger Prime: mirror hive; reflects beams into future copies of you.",
    "Laughing Sheriff: badge of paradox; deputizes your shadow to arrest you.",
    "Scarlet Viceroy: petal-plate lancer; beauty tax—every dodge costs vigor."
  ]
};


// Scene banks (DBS-appropriate sets)
const sceneBanks = [
  "Shattered tournament arena afloat over a red-sky ocean; broken ring tiles orbit slowly.",
  "Desert plateau under a massive emerald moon; dust devils carve triangle spirals.",
  "Ruined city boulevard with hovering rubble; gravity lurches in pulses.",
  "Orbital training deck, transparent floor above planet curve; aurora currents below.",
  "Sub-topology corridor: endless doors labeled with triangle-circle glyphs.",
  "Temple of NCZ: black-stone steps, neon inlaid runes, wind chimes of data tabs.",
  "Containment nexus chamber: concentric seal circles rotate counter-phase.",
  "Back-alley dojo drenched in rain, paper charms glowing at gutters.",
  "Sky colosseum ringed by thunderheads; lightning forks write symbols.",
  "Liminal rail platform; train never arrives; timetable flickers prime numbers.",
  "Glass desert where dunes ring like bells; footfalls leave prismatic echoes.",
  "Sunken arena inside a whale-bone ribcage; tide pulls ki in rhythmic surges.",
  "Frozen causeway over a void trench; starlight trapped in the ice veins.",
  "Green-star orchard with tethered comets as lanterns; vines hum warding songs.",
  "Velvet Orchard annex: fruit emits laughter pips; branches rearrange paths.",
  "Maglev canyon with levitating ring gates; each gate inverts momentum.",
  "Cliffside dojo on basalt needles; wind shears carve sparring lanes.",
  "Crater lake with mirror surface; reflections act a half-second ahead.",
  "Hanging gardens on chain-islands; waterfalls flow upward in pulses.",
  "VEXARE calibration hall: tiled with hex-tri paper seals; drones patrol silently.",
  "Abandoned NCZ foundry: emerald coolant rivers glow beneath grates.",
  "Auric storm shelf: clouds are rigid planes; you can sprint on thunder.",
  "Starfall terrace: meteors reduce to pebbles as they cross sigil boundaries.",
  "Echo bazaar at midnight; vendors trade in memories; bell strikes shift reality.",
  "Cobalt library where pages float; reading aloud changes room topology.",
  "Horizon bridge with no visible supports; each step lays temporary planks of light.",
  "Chrono amphitheater: sundial shadows lash like whips on the hour.",
  "Mirror labyrinth beneath city ruins; your copy negotiates different routes.",
  "Cathedral of wind: pipe organs tuned to cyclone; notes bend trajectories.",
  "Bone-white salt flats under twin suns; heat ripples hide low-slung predators.",
  "Green-star quarantine grove; seals drift as glowing leaves; anomalies purr.",
  "Lattice factory: cranes weave force-fields into cloth; alarms chime in hex.",
  "Kite-cemetery ridge; auspex kites tug at fight-lines like puppeteers.",
  "Rift ferry crossing: gondolas sail between cliff mouths; ferryman asks riddles.",
  "Stormglass pier; waves are panes; shattering creates temporary platforms.",
  "Golem scrapyard: slabs remember moves; statues finish abandoned combos.",
  "Obsidian ziggurat steps; each riser hums a scale tone with footfalls.",
  "Vacuum arena in low orbit; breath glyphs grant air; sound travels in lines.",
  "Silt cathedral underwater; bell rope is seaweed; strikes stir silt blinds.",
  "Flare tundra: aurora curtains hang like tapestries; cutting them spawns sparks.",
  "Honeystone canyon with bees the size of fists; honey pools buff or slow.",
  "Bridge of paper talismans; flames lick but never consume; ash becomes doves.",
  "Horizon kiln: sun dips into furnace sea; heatwaves deform projectiles.",
  "Velum observatory: charts rewrite themselves; constellations issue challenges.",
  "Civic arena atop an ancient turtle; city lights ripple along its shell.",
  "Pendulum docks: cranes swing entire sparring rings between barges.",
  "Ropeway monastery; carriages sway in combat; bells mark risky jumps.",
  "Loomyard of fate: colossal shuttles weave light; threads snag ki trails.",
  "Basalt amphitheater around a green geyser; mist condenses into seals.",
  "Nightglass lake with stepping-stone moons; missing stones test leaps.",
  "Serrated reef at low tide; waves cut; foam stencils warning sigils.",
  "Confluence spire where four winds duel; platforms rotate like clockwork.",
  "Sparring barge convoy; engines drum; cranes drop cargo hazards mid-bout.",
  "Thorn orchard with metallic petals; blossoms parry; pollen reveals feints.",
  "Old war viaduct; collapsed arches float; trains of ghosts thunder by.",
  "Jade quarry with singing seams; the correct note shatters cover.",
  "Comet quarry pit: ore chunks fall upward; chains keep them tethered.",
  "Rain-market alley; runoff becomes ribbon currents you can ride.",
  "Censer bridge over incense sea; visibility waivers with gong strikes.",
  "Arboreal ring-path on colossal roots; bark glyphs add jump power.",
  "Perimeter lab with gimbal floors; room auto-levels to the dominant stance.",
  "Lacquer shrine courtyard; floor too polished to grip without ki spikes.",
  "Neon pagoda roofline chase; signage sparks; rooftops pitch and yaw.",
  "Ruin tramline; cars glide with no cable; switches flip underfoot.",
  "VEXARE gatehouse: Janus portal blinks; intent audits alter exits.",
  "Mire of quiet: all sound dampened; strikes register as ripples.",
  "Crystal mangrove at low light; branches branch again forever.",
  "Archive cistern: book spines line the walls; drip rhythm sets combo tempo.",
  "Rift ballroom with zero-lag mirrors; partners swap across panes.",
  "Tomb of the bell; gravity wells around bronze tongues; tolls re-time jumps.",
  "Fulgur quarry: lightning bottled in jars; dropping one repaints the sky.",
  "Clockface plaza; hands sweep once per minute; crossing them ages gear.",
  "Seastack cloister; monks kite-surf on prayer flags; gusts kick like mules.",
  "Velvet backstage; red curtains hide ambush wings; laughter scuffs reality.",
  "Kintsugi ravine; gold seams stitch quake fractures; breaks open under strain.",
  "Faraday orchard with copper boughs; storms harvest into fruit capacitors.",
  "Gossamer causeway spun by sky spiders; threads twang with foot timing.",
  "Moon-well craters with silver water; sips trade stamina for insight.",
  "Chalk dunes that remember steps; retracing grants burst speed.",
  "Verdigris shipyard; keels hang like ribs; catwalks sway on chain sighs.",
  "Spiral grain silo; wind funnels grain to obscure; ladders wrap endlessly.",
  "Tide clock hollow; pool levels mark phases; wrong step triggers whirl.",
  "Trainyard of equations; car numbers solve to open paths; math hurts.",
  "Scree ladder up a singing cliff; wrong weight triggers a shriek storm.",
  "Lantern festival pier; sky lanterns lift platforms; pop to descend.",
  "Green-star tribunal ring; seals judge techniques; forbidden moves fizzle.",
  "Oblique orchard where gravity leans; apples roll uphill around fighters.",
  "Ink river delta; strokes become creatures; counterstroke to dispel.",
  "Avalanche bowl; snow slabs slide on cue; carve paths with ki heat.",
  "VEXARE halo station: ring spins; radial corridors reassign up/down.",
  "Subterranean cistern node; concentric bridges around dark water eye.",
  "Meteor nursery; eggs of stone crack into micro-arenas mid-combat.",
  "Chrysalis yard; cocoons hum chords; cutting them releases buff moths.",
  "Nimbus stair; steps condense from breath; panic makes them vanish.",
  "Magenta court: plush tiles swallow force; corner balconies giggle.",
  "Suture pier where islands are stitched; cut the seam to drift free.",
  "Pitch quarry at dusk; tar mirrors stars; splashes stick to projectiles.",
  "Kiln garden; clay guardians revive in rain; glaze puddles slick.",
  "Coffered vault chamber; ceiling panels drop puzzles or platforms.",
  "Catwalk hive over turbine mouths; updraft parries high attacks.",
  "Gantry maze inside derelict mecha; limb shifts change corridors.",
  "Hushed museum of battles; dioramas animate when named aloud.",
  "Spectral orchard of wire fruit; biting charges shields or stuns.",
  "Saltbridge over black surf; spray crystallizes into knives.",
  "Gale temple’s bellfield; rope forest; each pull slants the wind.",
  "Crown plaza beneath the Velvet Gate; confetti hides caltrops of light.",
  "Green-star ward well; wardens’ seals drift; step within to heal slowly.",
  "Auric spillway; currents re-route like circuits; overflow creates ramps.",
  "Oxbow dojo on a river bend; boats become moving corners to pressure.",
  "Ferroforest trail: needle trees align with magnetized ki bursts.",
  "Thermal steppe; geysers count down with whistles; mist hides feints.",
  "Sapphire grotto; dripping stalactites tune parries; echoes mislead.",
  "VEXARE vellum court; floating writs enforce truces until torn.",
  "Ballast orchard with hanging stone fruit; cut cords to swing cover.",
  "Low-orbit boulder garden; pebbles become planets; sling-shot footwork.",
  "Seamark reef where buoys toll codes; right combo opens secret rings.",
  "Cerulean arcade; wave-arches roll; timing with crest grants speed.",
  "Aster kiln ridge; star-ash drifts; sparks adhere to strikes as tracers.",
  "Night market on the back of a sleeping colossus; snores jolt the map.",
  "Prism quay; color lanes buff distinct stats; crossing mixes effects.",
  "Runeswitch depot; platforms toggle with shouts; silence freezes routes.",
  "Velour oubliette; soft walls absorb dashes; stomps rebound huge.",
  "Skywell shaft; updraft elevators; vents hiss to telegraph timings.",
  "Ringing orchard of bronze pears; striking fruit calls guardian swarms.",
  "Inverted pagoda caverns; stairs climb downward; lanterns float up.",
  "Fighting stage atop a migrating glacier; crevasses open on beats.",
  "Harmonic spill plaza; three fountains in odd meters; sync grants armor.",
  "Graviton arcade; coin drops add weight; jackpot flips gravity.",
  "Temple of Quiet Requests; whispering powers moves; shouts misfire.",
  "VEXARE ranger causeway; tether rails snag anomalies; safe lanes glow.",
  "Shadow quay where silhouettes detach; your shadow spars to train.",
  "Anvil skybridge; every clash forges a step; miss and the step decays."
];


// Action beats
const actionBeats = [
  "eve steps through a rotating seal, aura igniting; ground plates rise.",
  "sentries triangulate; prism beams converge; eve deflects with palm vortices.",
  "ally dashes in, tag-team flurry; frames stretch with speedlines.",
  "harbinger mirrors eve’s stance; reflection lags; eve cancels the copy.",
  "warden launches grapnel seals; eve shatters them with hex punches.",
  "strawberry king avatar laughs; magenta ripple forces push-back; eve plants green boots.",
  "eve opens a green-star gate underfoot, blink-steps behind the target.",
  "beam clash: emerald-violet lance vs. containment lattice; sky tears with lightning.",
  "eve’s red pigtails arc flame; roundhouse sends shock halo across the arena.",
  "eve inhales steady; aura contracts; then explosive dash—impact frame whiteout.",
  "eve skids on a light rail, blue cheer skirt flaring; heel-check launches a sonic ring.",
  "vexare auditor unfurls seals; eve thread-cuts the drones into harmless ribbons.",
  "proxy harbinger copies a feint; eve whiplashes a real strike through the echo.",
  "eve hip-check cancels a lariat; red lace runes ignite along her shins.",
  "containment sigils clamp; eve corkscrews through a letterbox opening.",
  "eve vaults a fallen wall; midair backfist tags the ranger’s visor.",
  "auric lightning forks; eve palms meet; she parts the bolt like curtains.",
  "eve plants elbows, slides; sparks write her name across the floor.",
  "warden’s halo spins; eve threads the gaps, tapping each ring to detune it.",
  "mirror-beast clones multiply; eve round-kicks the prime, shattering reflections.",
  "eve rides a cyclone updraft; heel-axe drops, cracking the platform seam.",
  "vexare gimbal stabilizes the zone; eve fake-stumbles to bait a grav flip, then strikes.",
  "magenta plush wave rolls in; eve sets a green-star wedge and splits the tide.",
  "eve lunges with comet-elbow; star-ash hangs in a dotted line of impacts.",
  "janus gate audits intent; eve smiles, inverts her stance, slips through anyway.",
  "eve cartwheels under a beam net; fingertips spark a triangle trail.",
  "auditor’s drones draft a writ; eve stamps it with a dropkick denial.",
  "eve chain-cancels jabs; last tap detonates as a delayed blossom.",
  "strawberry king flicks confetti blades; eve weaves, collecting none.",
  "eve catches a spear with both soles, spins, and returns it as a discus.",
  "rune engines howl; eve snaps a palm—silence field pops, stun window opens.",
  "eve side-steps in three frames; each afterimage parries a separate strike.",
  "eve clap-parries; shock dome stalls bullets midair like raindrops.",
  "warden hurls a seal cage; eve knuckles the corners off until it collapses.",
  "eve’s purple NCZ top hums; cheer-skirt hem flickers a defensive lattice.",
  "eve heel-drags a fire arc; opponent steps in and gets frame-trapped.",
  "proxy harbinger primes a counter; eve feints, throws a no-look elbow.",
  "eve launches with knee-feint, elbow-finish; camera smear stretches time.",
  "trioptic visor narrows; eve stutter-steps to desync its prediction.",
  "eve palms the floor; emerald plates rise in cadence with her breath.",
  "vexare choir layers chords; eve answers with a single pure note—systems reboot.",
  "eve vaults a tether line, snaps it; adversary pinwheels into a ward trap.",
  "beacon-theta cones truth-state; eve blinks out lies and parries clean.",
  "eve dragon-kicks through three drones; each bursts into paper seals.",
  "auditor brands a penalty; eve appeals with a haymaker—motion carried.",
  "eve backflips to rooftop; shadow clone remains below and eats the blast.",
  "containment warden posts a seal to the sky; eve climbs it like stairs and stomps.",
  "eve turns a failed sweep into a handplant mule-kick—perfect spacing.",
  "plush field tries to smother; eve needle-threads a spinning heel to air it out.",
  "eve hook-steps into a clinch, hip tosses a giant through two pillars.",
  "aurora floor ripples; eve matches cadence—footfalls ride the wavecrest.",
  "eve shoulder-rolls under a ribbon-scythe; counter lariat buckles armor.",
  "mirror-skin brawler distorts; eve throws a crooked punch that lands true.",
  "eve knits a triangle with her strides; inside it, time favors her.",
  "warden’s grapnel sings; eve snips its line with a toe-edge crescent.",
  "eve corkscrews a rising knee; sound peels paint from the walls.",
  "green-star gate blossoms; eve tag-pulls an ally through mid-combo.",
  "eve slips the jab, elbows the visor switch; trioptic splits to static.",
  "vexare mason raises walls; eve wall-runs, then drop-steps to invert gravity.",
  "eve claps twice; lanterns fire in sequence; spheres pop like notes.",
  "hollow bailiff declares guilty; eve overrules with a gavel-kick.",
  "eve whirls a scarf-snare, yoinks a drone into its owner’s shin.",
  "noise cardinal crescendos; eve mutes the measure with a throat tap.",
  "eve dash-catches a thrown seal, slaps it to the floor—safe zone blooms.",
  "plasma lariat incoming; eve limbos under, counter-hooks the ankle.",
  "eve pre-loads a step; her pigtails crack like whips at the apex.",
  "entropy bailor signs chaos; eve tears the bond and throws the stamp.",
  "eve plants a toe, pirouettes; ricochet punch lands behind a guard.",
  "chrono poacher steals a second; eve deposits two with compound interest.",
  "eve heel-grinds on a rail; sparks outline the next safe platform.",
  "haruspex forges a fake writ; eve lights it—ink screams, trap revealed.",
  "eve uses a falling slab as an elevator, kneeing upward through it.",
  "vexare lighthouse sweeps; eve blinks to its blind seam and knocks.",
  "eve hip-checks a stone fruit; pendulum arcs into an ambusher’s jaw.",
  "proxy primes a beam; eve shades her eyes—beam refracts off red lace.",
  "eve front-flips into a slide; trailing palm leaves an auric zipper.",
  "warden’s seal-chains lash; eve weaves, then yanks them into a knot.",
  "eve reed-steps on ripple water; each step hurls a crescent blade.",
  "magenta court softens force; eve spike-knees to harden her vector.",
  "eve taps a buoy; toll code unlocks a ring—she cartwheels through.",
  "trioptic drones pin; eve pinches the air and snaps the triangle.",
  "eve smash-faints ground; opponent blocks low—she mid-levels the temple.",
  "vexare vellum writ hovers; eve signs with a punch—truce revoked.",
  "eve pops a storm jar; lightning dances on her guard like beads.",
  "mirror indigo counter-reads; eve mis-angles a jab and slips past fate.",
  "eve sprints across kites; tail-strings braid into a line, tripwire set.",
  "warden’s halo locks; eve shoulder-barges the hinge open.",
  "eve backhands a comet pebble into a headpiece; trioptic cracks.",
  "janus gate rotates; eve throws an elbow through the closing seam.",
  "eve heel taps a hanging chain; shock travels, dropping a gantry.",
  "thorn orchard blossoms knives; eve tornado-guards and files them blunt.",
  "eve fake-whirls left; right-hand liver shot folds the proxy.",
  "velvet backstage curtains lunge; eve lamp-kicks them into ash.",
  "eve kiai detonates chalk dunes; dust outlines incoming feints.",
  "warden spins a trident seal; eve hitch-kicks the center—seal sputters.",
  "eve switches stance midair; axis-cutter kick realigns the arena.",
  "vexare ranger tethers; eve wraps the line around a column and yanks.",
  "eve finger-flicks a droplet; ping ricochets—drone sensor overload.",
  "containment lattice rises; eve threads the loom and exits behind.",
  "eve rolls a shoulder; aura snaps like a banner, cross-wind staggers foes.",
  "garnet guillotine ribbons rend; eve flat-palms to iron the fabric.",
  "eve jackhammers a stomp; floor tessellates into stepping stones.",
  "proxy future-casts; eve past-cancels with a memory feint.",
  "eve guard-drags to an outside angle; elbow whispers, chin listens.",
  "warden’s verdict mace drops; eve shin-shelves, dump-throws the weight.",
  "eve splits a beam with her forearms; halves whistle by, harmless.",
  "vexare halo tilts; eve skates its inner rim and diveskicks the hub.",
  "eve clutches a lantern, swings; afterimage trails lash like comets.",
  "entropy blooms; eve draws a triangle with her toes; chaos won’t cross.",
  "eve scoops a seal from air, stamps it to an enemy’s chest—rooted.",
  "magenta laugh stutters frames; eve syncopates steps to walk through.",
  "eve elbow-parries three jabs; fourth meets forehead—clang.",
  "auditor drones intone; eve mutes each with a fingertip flick.",
  "eve spins her pigtails like flails—playful, precise, punishing.",
  "warden opens a chasm; eve sidewalls, rebounding in a zig-zag blitz.",
  "eve steps into a bell’s shadow; toll grants armor for one beat.",
  "proxy harbinger primes a mirror; eve fog-breathes it opaque, smashes.",
  "eve heel-hooks a visor; turns it to the crowd—flash blinds.",
  "vexare arbor roots creep; eve tiptoes leaf to leaf—no bind.",
  "eve hammers a pillar into a bat; one swing, four drones down.",
  "janus face smiles; eve pokes its eye—portal sneezes her forward.",
  "eve sets her stance; green boots carve semicircles—no entry.",
  "warden calls a truce; eve nods, then suplexes the loophole.",
  "eve anchor-drops into horse stance; shockline buckles a rank.",
  "mirror-beast fakes high; eve fakes lower; both laugh—then she wins.",
  "eve shin-prints a sigil; the floor remembers and boosts her next dash.",
  "auric wave rears; eve spear-palms, keels the crest into a ramp.",
  "eve vaults a vending cart; midair sip—stamina returns, kick continues.",
  "vexare mason channels lanes; eve bunny-hops walls into a triangle trap.",
  "eve shoulder-checks into an armored plate; plate decides to leave.",
  "warden hurls anchor seals; eve converts cords into a swingline.",
  "eve drops a heel; dome of silence gives her two clean beats.",
  "proxy spawns reflections; eve smiles—more targets, more fun.",
  "eve pirouettes into a heel-scythe; sparks write arcs around ankles.",
  "vexare choir modulates; eve snaps fingers—key shifts to her tempo.",
  "eve chest-pops a shockwave; debris politely clears a runway.",
  "warden’s coolant veins glow; eve palms the glow—systems cold.",
  "eve soccer-kicks a rune; it pings off four heads then parks.",
  "mirror indigo side-eyes; eve looks straight ahead—still lands.",
  "eve taps a buoy; zipline of light appears—she rides and stomps.",
  "harbinger blooms a lash; eve threads it into a bow—gift returned.",
  "eve body-feints, gaze-feints, then vanishes; impact arrives first.",
  "vexare sentinel-glass refracts; eve draws a circle—beams rain harmless.",
  "eve low-dashes, sweeps two; third jumps—she backfists the ankles.",
  "warden calls the count; eve counts faster, finishing on ten with a hook.",
  "eve taps toes in 3–5–7; platform locks to her secret meter.",
  "entropy tiles spawn; eve step-cancels, leaving a safe braid.",
  "eve toe-pivots, spine-whips a punch; air buckles behind it.",
  "vexare archivist flips pages; eve dog-ears the end—fight spoilers.",
  "eve shoulder-throws a giant into a writ; legal victory obtained.",
  "magenta fog coos; eve coughs once—it scatters in embarrassment.",
  "eve juggles a foe on shin, knee, elbow; dropkick finale.",
  "warden’s tether finds ankle; eve gifts it her boot, fights barefoot.",
  "eve stomps a time glyph; slow-mo bubble hugs her combo.",
  "vexare ranger reels; eve slacklines the tether to his chin.",
  "eve splits stance; left foot parries, right foot punishes.",
  "proxy’s beam curves; eve curve-punches harder—beam regrets.",
  "eve checks wrist; not time to lose; opponent understands.",
  "warden blasts a seal wave; eve surfs it back into his chest.",
  "eve bites ribbon, spits sparks, headbutts a visor—problem solved.",
  "vexare mirrorcell spawns doubles; eve bows to each—then sweeps all.",
  "eve tosses red lace into air; it draws a circle; she fights inside.",
  "janus gate asks nicely; eve answers rudely—with a knee.",
  "eve no-looks a backfist; camera finally catches up.",
  "warden brings law; eve brings loopholes—and a chair.",
  "eve plants green boots; ground remembers and lifts to meet her kick.",
  "proxy tries her laugh; it backfires; eve laughs last and hits first.",
  "eve double-taps the floor; shock pillars pop in a zig-zag.",
  "vexare halo hums; eve harmonizes, steals its orbit for a lap.",
  "eve throws a hook so wide it meets itself—clothesline!",
  "warden’s mask cracks; eve sees his eyes; mercy—then a sweep.",
  "eve feints exhaustion; adversary overextends; trap springs.",
  "mirror maze multiplies; eve smudges one pane—path appears.",
  "eve two-beat dash: ghost then girl; only the second hurts.",
  "vexare gimbal wobbles; eve finger-flicks it true, then uppercuts.",
  "eve heel-stamps a sigil that says 'stay'; enemies obey.",
  "warden announces sudden death; eve replies: sudden nap.",
  "eve threads green-star light through pigtails; lariat glows.",
  "magenta crown tilts; eve curtsies with a knee to the ribs.",
  "eve clutches the air; pulls a rope no one sees; enemy trips.",
  "vexare arbor drops seeds; eve soccer-volley returns them as bombs.",
  "eve turns a parry into a hug; suplex concludes the affection.",
  "warden’s halo returns; eve hangs laundry on it—three drones.",
  "eve watches a raindrop fall, then outruns it and arrives dry.",
  "proxy switches stance; eve switches mood; same result.",
  "eve uppercuts a laugh straight out of the avatar’s throat.",
  "vexare vellum posts rules; eve writes 'except me' underneath.",
  "eve heel glows emerald; the floor signs a waiver and yields.",
  "warden demands decorum; eve replies with a cartwheel knee.",
  "eve counts to three; on two, everyone is already down.",
  "vexare choir sings her name; eve bows—and finishes the set."
];


// Camera & motion language (anime cinematography)
const cameraMoves = [
  "snap-zoom in on glare; iris cranks down as aura blooms",
  "three-quarters orbital dolly, background streaks in timed parallax",
  "over-shoulder tracking past drifting rubble; rack focus to sigil",
  "contra-zoom along ring tiles; horizon bends on ki surge",
  "top-down crash-in with radial speedlines; whip to profile on strike",
  "low-angle hero tilt; dust and petals blow through frame",
  "handheld jitter on close combat; stabilize on clash lock",
  "sudden horizon flip during aerial chase, then righted on land",

  "micro push-in on clenched fist; exposure ramps as veins light",
  "whip-pan to catch a teleport afterimage; smear frames bridge motion",
  "split-diopter profile two-shot; foreground sweat bead in razor focus",
  "rack focus from cracked seal to reflected pupil; breath fogs lens",
  "dutch-tilt reveal of looming warden; parallax tiles rotate off-axis",
  "inside-helm pov with HUD glyphs; vignette pulses on damage",
  "drone-like top-shot spiral; opponents orbit as center locks steady",
  "match-move with falling debris; camera rides a slab to ground",

  "contra-pan with sprint; background pulls while subject pushes",
  "impact frame whiteout; silhouettes hold for two beats, then snap back",
  "lens-breathing push; aura flare triggers chromatic fringe",
  "parallax-lattice foreground (chains) slices frame during dash",
  "gimbal 360° barrel roll as eve inverts midair",
  "macro tilt from boot tread to rising knee; grit kicks into lens",
  "overcrank (slow-mo) on bead of sweat; return to undercrank on strike",
  "multi-plane cel stack: clouds, ruins, fighters, lightning all offset",

  "snap tilt-up through knee, hip, shoulder—arrive at resolute eyes",
  "reverse dolly as blast grows; field of view narrows to tunnel",
  "backlit silhouette with god rays; aperture clicks audible",
  "shoulder-cam wobble through crowd; bokeh lanterns streak",
  "fast rack to distant gate; heat shimmer ripples the rack",
  "pre-lap audio cue; camera whip meets sound on contact",
  "ground-crawl slider shot along cracked tiles; dust motes glitter",
  "spin-cut: fist arcs into frame, match-cut to comet in sky",

  "contra-zoom on cliff edge; vertigo stretch as rocks shear",
  "blade-follow cam tracks edge; reflection shows offscreen threat",
  "overhead map tilt morphs into real top-down; icons fade away",
  "iris-in from black using seal glyph; edges flicker like film burn",
  "whip-tilt to sky just as thunder forks; exposure pegs, then recovers",
  "tight dutch on visor; trioptic lenses sweep like wipers",
  "roll-in from behind shoulder; shallow depth isolates breath",
  "wind-sock mic visual—sound waves drawn as rings expanding",

  "track-through spark shower; embers streak like meteor tails",
  "snap-out to reveal arena scale; fighters become chess pieces",
  "zipline follow along tether; cable blur paints motion vector",
  "feet-first pov on sliding tackle; skid sparks kiss the lens",
  "pendulum crane swing over ring edge; drop into face-to-face",
  "focus-pull to silhouette on rooftop; cloak flutters in tempo",
  "multi-exposure ghosting over dash path; final pose locks crisp",
  "hyper-lapse across rooftops; signage streaks read as code",

  "faux tilt-shift miniaturizes crowd; heroes pop in full focus",
  "blade-wipe transition; frame splits along katana path",
  "snap-zoom to clenched jaw; tooth glint syncs to sting",
  "tracking wide on circling opponents; parallax arcs like orbits",
  "push through curtain of rain; droplets hitch on lens for a beat",
  "undercrank run (speed-up) then sudden real-time at clash",
  "macro on talisman ink; characters swim as aura hums",
  "swinging lamp parallax; light and shadow strobe footwork",

  "arc dolly from backlight silhouette to front key; aura color flip",
  "bungee cam drop through floor gap; land at bas-relief close-up",
  "focus pull from falling leaf to rising kick; leaf splits on wind",
  "horizon seesaw during grapple; camera obeys center of mass",
  "boom up reveal of containment circle; lines meet like clockwork",
  "lens flare ribbons even on night shots; ki behaves like sun",
  "whip-zoom through a punched hole; exit into wide of chaos",
  "snap-to-handheld as punches start; cut to tripod on eye stare",

  "mask reveal via flying debris; matte falls away with the dust",
  "reverse pov through enemy visor; HUD faults on impact",
  "parallax crowd plate scrolls; foreground arms silhouette cheers",
  "staccato shutter (choppy) for flurry; silky 180° for hero blow",
  "zero parallax flat-plate look for sub-topology corridor",
  "push past a green-star seal like breaking water; edges ripple",
  "gimbal roll at 45° increments; each click a combo beat",
  "rear tracking on sprint; footfalls sync to camera bob",

  "snap-zoom to boot squeak; micro-slip sells pressure",
  "contra-pan across two planes; foreground left, bg right, subject neutral",
  "profile slider with speedlines painted; background cycles loops",
  "arc up over shoulders to zenith; sun dogs flare around frame",
  "grind-cam along rail as sparks arc; cut on brightest flash",
  "focus racks across three combatants in L-shape composition",
  "overhead tile grid animates to meet dolly; motion parallax puzzle",
  "faux drone to gull cam; bird sails through flare into transition",

  "time-slice array—32 cameras freeze spin around impact",
  "insert of toes curling in boot; micro push as tiles fracture",
  "under-kick pov; sole eclipses frame, reveals stunned face",
  "rising jib through smoke column; silhouettes emerge like statues",
  "parallax leaf storm; rack focus finds eyes through gaps",
  "snap-down from banner to belt knot; hand tightens, drum thud",
  "profile long lens compresses chase; distance feels paper-thin",
  "low slider along water line; reflections glitch a frame behind",

  "extreme close on pupil dilation; ki glyphs rotate as iris",
  "whip-tilt, whip-pan combo; horizon becomes a weapon",
  "lens swap gag: wide to tele mid-move; momentum feels elastic",
  "macro shot of aura granules; sandstorm inside the light",
  "intercut pov of a falling bell; world spins to its velocity",
  "handheld shoulder crash; camera absorbs a glancing blow",
  "bridge-cam suspended; fighters pass underneath in silhouette",
  "overhead projector map overlays path lines on ground",

  "faux-2D side scroller; parallax layers scroll at game speeds",
  "snap-zoom on broken crown tooth; magenta glints, cut to laugh",
  "dolly into negative space; opponent emergences from shadow",
  "strobe frames during teleport; afterimage pose holds bright",
  "dutch-in, dutch-out with each beat of choir chord",
  "heat-haze shimmer displaces frame edges; rack fights the waves",
  "push through confetti wall; particles smear like paint",
  "vignette expands with kiai; edges breathe in time",

  "ultra-wide low tilt; towering figure warps perspective",
  "spider-cam lattice overhead; crossing lines carve geometry",
  "match-cut fist to meteor; both burn into next shot",
  "rolling shutter gag on speed; vertical lines wobble at dash",
  "spin-dissolve using cloak swirl; exit into new location",
  "shattered lens overlay for one beat; cracks heal on flare",
  "racking split focus: near hand, far eye, middle bokeh",
  "lens baby selective focus whips around like a searchlight",

  "fast zoom-out to miniature earth curve; orbital deck vertigo",
  "push-in through mask slit; breath fogs and wipes clean",
  "floor-cam under glass; soles thunder overhead",
  "swing-around with tether cable; camera orbits anchor point",
  "snap-zoom back on counter; reveal opponent off-axis",
  "overhead pendulum metronome shadow; timing cues movement",
  "profile steadicam along cliff lip; updraft buffets frame",
  "dolly through torii of seals; each gate wipes to the next",

  "focus on drifting petal; petal bursts on sonic boom",
  "counter-rotate camera to stabilize a spinning kick",
  "pan across watching sentries; eyes blink in sequence",
  "over-the-floor scrape; sparks flare as track markers",
  "tilt from scoreboard to fists; numbers tick with heartbeat",
  "zip in along a ribbon weapon; ribbon becomes the path",
  "lens breath pull back as aura collapses; silence lands",
  "snap-in to clenched teeth; enamel glints like steel",

  "spiral dolly around stand-off; dust devils answer",
  "pov along beam path; stars smear, lattice forms ahead",
  "macro match focus on blood drop; it evaporates mid-air",
  "reverse crane reveal: from hands to army behind",
  "rack focus between two reflections in shard mirror",
  "tracking across ceiling as fighters wall-run beneath",
  "snap-zoom on heel pivot; chalk dust draws a circle",
  "telephoto compression makes leap look endless; cut midair",

  "handheld tight on grapple; sweat hits lens, natural wipe",
  "hard stop on pan to emphasize speed; frame judders once",
  "overhead wide turns into schematic; lines label trajectories",
  "whip through columns; edit hides in pillar occlusion",
  "push-in timed to choir swell; mouth shapes match wave",
  "low angle dolly under energy net; mesh shadows crawl",
  "macro of cracked knuckle; rumble underscores micro quake",
  "profile follow with background repeating loop for speed gag",

  "snap-zoom through visor crack; flare blooms then steadies",
  "contra-zoom on collapsing platform; body stays center frame",
  "rack to silhouette stepping through smoke keyhole",
  "ground-level backward track; tiles pop up in chasing rhythm",
  "orbit on axis while subject remains locked to screen-left",
  "match slide to a different location via same foreground object",
  "glitch smear for one frame at teleport exit; registers subconsciously",
  "focus pulley gag: two fighters in same plane swap crispness by nod",

  "drone rise above bell as it tolls; shock ring draws wipe",
  "snap to extreme wide; bodies become pawns on seal board",
  "push along sword spine; hit arrives when guard fills frame",
  "macro on breath condensing; letters form, vanish immediately",
  "low 45° dutch during slip; horizon slants like a blade",
  "overhead corkscrew at stomp; cracks radiate under lens",
  "sash-cam: fabric leads move; camera follows its dance",
  "reverse pov from fist traveling; world streaks back",

  "tele to wide whip; spatial reveal resets audience bearings",
  "insert: hand flex under wrap; veins glow, sound dips",
  "macro sand grains levitate; tilt up to full sandstorm",
  "depth slice through hanging charms; each ping a focus cue",
  "hyper-fast rack across three opponents; final one flinches",
  "minimap inset rotates; main frame obeys its heading",
  "push in on shadow separating; second subject peels off",
  "snap follow on thrown seal; we land where it stamps",

  "foot-cam on wall run; boot magnets spark against steel",
  "orbit in opposite direction of cape twirl; torque sells power",
  "macro crack in tile widens with bass hit; match-cut to fault line",
  "split-screen diagonal; two moves converge into single blow",
  "vfx smear line follows punch; camera catches up late",
  "push-in through ring ropes; ropes whip back to frame edges",
  "overhead grid overlays, then shatters under shockwave",
  "faux lens-whack on impact; bounce stabilizes to hero pose",

  "macro of eyelash catching ash; blink launches it away",
  "fast tilt to night sky; meteor matches kick arc",
  "parallax blades of grass; ankles ghost through bokeh",
  "underwater-style muffled cam for plush field; motion syrupy",
  "boom down through mezzanine gaps as fight descends",
  "tight insert on cracked visor LED; numbers corrupt on hit",
  "snap-zoom on heel drop; micro shake punctuates",
  "ribbon follow as it threads a gate; gate iris wipes",

  "wide establishing with animated weather map overlays",
  "over-shoulder downshot on fallen foe; shallow focus grief",
  "crash zoom through steam plume; reveal glowing silhouette",
  "counter-dolly vs subject dolly (trombone); aura warps space",
  "macro spark traveling wire; pan ahead to target before it hits",
  "profile long take with no cuts; choreography sells rhythm",
  "handheld sprint with hard breathing; lens fog wipes between cuts",
  "tilt down to shadow first; body lands into its outline",

  "ground cam on skidding knee; cloth fibers scrape audible",
  "orbit at variable speed; accelerates on feints, brakes on hits",
  "push in on clenched ribbon lace; knot tightens with cymbal",
  "rack focus to reflection in puddle; jump cut out of it",
  "overhead lattice shadow crawls as clouds move; time skips",
  "whip to crowd; their heads track like a wave, back to fight",
  "macro on chalk line under boot; it fractures with timing ticks",
  "top-down rotation synced to choir chord inversions",

  "snap in to smile; lens flares twinkle on teeth—anime spark",
  "drift past fluttering talismans; each a parallax occluder",
  "handheld inside clinch; camera bumped by elbow—diegetic",
  "dolly through flung cloak; it becomes a soft wipe",
  "contra-zoom on palm thrust; background stretches to swallow",
  "macro on fracture propagation; lattice maps across frame",
  "stairwell corkscrew climb; camera leapfrogs landings",
  "overhead lock-off; fighters trace triangles in chalk dust",

  "tilt from broken mask to bare eye; breath hush underscored",
  "split-diopter with blade tip and eye; danger in two planes",
  "drift back while subject advances; lens breath syncs",
  "horizon flip on landing, settle to true as boots plant",
  "rack to floating ember that becomes meteor in next shot",
  "zip across banner text; letters blur into speedlines",
  "macro of blood evaporating in aura heat; sizzle sfx cues cut",
  "pull out to reveal entire containment mandala, perfectly centered"
];


// Transitions & FX
const transitions = [
  "hard smash-cut on hit-spark to fresh angle",
  "white flash impact frame then color returns with ring crack",
  "speedline wipe following a dash path",
  "aura bloom crossfade; embers persist into next shot",
  "beam-lens flare swipe that reveals a new backdrop",

  "seal glyph iris-wipe; edges burn in triangles before clearing",
  "ink spill morph that pools into the new scene’s shadows",
  "ribbon sweep across lens; fabric texture becomes horizon line",
  "match-flare: muzzle flash pops, flares dissolve into city lights",
  "confetti burst match-cut to meteor shower in the sky",

  "dust kick-up covers frame; settles to reveal scene B",
  "shockwave ring expands; as it hits lens we cut to inverse color",
  "whip-pan blur hides L-cut dialog into next location",
  "rain streaks streak harder until lines become motion vector wipe",
  "magenta plush smear pushes image off like wet paint",

  "glitch-scanline tear; vertical seam opens like a page turn",
  "parallax tile slide; floor blocks stack into new geometry",
  "iris-out to seal stamp; stamp lifts to unveil next shot",
  "hand-swipe practical: glove crosses lens; new scene under it",
  "lens breath fogs fully; a wipe clears to a cooler palette",

  "spark shower cascade; each spark blooms into stars of scene B",
  "rope snap whip-wipe with audible sting",
  "lightning fork split-screen merges into single full-frame",
  "mirror shard kaleido-wipe; shards reassemble as different place",
  "zoom match on eye reflection to moon over scene B",

  "dust to cloud morph; texture continuity sells the change",
  "water ripple radial; refracted image resolves into new angle",
  "pigtail swing arc becomes a motion blur wipe",
  "paper charm peel-away; adhesive noise transitions diegetically",
  "chalk line blow-off; powder plume reveals time skip",

  "time-slice stutter: frame stair-steps into a still, then pop to new action",
  "film-burn corner creep; orange lick consumes then hard-cut clear",
  "digital HUD swipe; UI panels dock into the next frame edges",
  "sound-driven cut on bell toll; single-frame white insert",
  "ink brush cross-stroke; bristles spray stars into night",

  "talisman flutter cascade; papers become snow in the next scene",
  "aerial whip-tilt covered by passing bird wing",
  "match-action uppercut to rising elevator exterior",
  "overexposed flare wash that resolves into dawn lighting",
  "freeze-frame graffiti overlay; tag dissolves to alley",

  "parallax scroll freeze; background keeps moving into location B",
  "smoke column wipe; direction set by wind in both shots",
  "lens crack fracture transitions; cracks align into street map",
  "aurora curtain draw; color bands part to reveal ring",
  "water droplet lens refraction; droplet falls into puddle in B",

  "speed ramp to zero, then snap to new frame at full tempo",
  "screen wipe via giant’s passing shoulder—diegetic occlusion",
  "sparkler scribble light-trail forms hard line wipe",
  "match-cut punch: fist fills frame, becomes door knock",
  "portal aperture opens like a shutter; irises to next interior",

  "metronome tick strobe; every third strobe swaps background",
  "ink negative invert for two frames then fade back in new place",
  "bokeh morph: lanterns warp into city windows",
  "kite tail swish; string draws diagonal wipe with twang SFX",
  "bell rope snap; frayed fibers stretch into rain lines",

  "hard cut on foot plant with bass drop; tile color palette shifts",
  "rolling shutter wobble transition during high-speed pan",
  "lens flare whip-lash; anamorphic streak drags scene across",
  "glove flick tosses sand; granules become starfield",
  "torn-paper matte: rip reveals layer beneath",

  "shadow swallow: silhouette grows to full frame then evaporates",
  "beat-synced frame-skips that snap into a new angle",
  "ricochet spark ping—circle wipe expands from impact point",
  "projector shutter blink; next scene appears on ‘second frame’",
  "match-dissolve from spinning seal to spinning fan blades",

  "data-chime pixel bloom; particles reorganize as city lights",
  "maglev gate spin; radial blur hides location swap",
  "leaf-swipe: maple leaf crosses lens, color grades shift",
  "gravity flip wipe: the whole frame rotates 180° on cut",
  "prism split RGB, channels recombine into scene B",

  "white-on-white flashbang cut, audio drops to muffle then returns",
  "beat-driven hard-mix: percussion hits swap shot sources",
  "vector grid overlay—line dissolve to wireframe of next place",
  "soft focus bloom over highlights; bloom fades to new shot",
  "gust of petals cyclone; petal density reveals B",

  "smear frame—one drag of the subject paints into next plate",
  "seam zipper: fracture closes behind camera revealing new set",
  "door crash-match to identical frame in different room",
  "seal ring sweep clockwise; wipe follows circumference",
  "sparkler graffiti writes scene title; title wipes to scene",

  "glitch tile-drop; blocks fall and re-stack as a different layout",
  "shadow hand across foreground; pull-down to basement cut",
  "bead of sweat drops on lens; streak becomes rainy street",
  "freeze and posterize for two frames then motion resumes elsewhere",
  "paper fan snap; its ribs become building struts in B",

  "electric arc line-trace; traced path extrudes next environment",
  "lens iris shutter sound with mechanical aperture animation",
  "mote swarm pull; particles stream off frame forming horizon",
  "heat haze swims; background resolves to desert",
  "suture thread across screen; stitch closes on new scene",

  "match cut on circle motifs: halo → moon → lamp",
  "ink capillary spread; veins map to alleyway fissures",
  "curtain pull with velvet texture; fibers leave magenta dust",
  "light-leak luma matte wipes lows first then highs",
  "river reflection flip; camera passes below the ‘line’",

  "masking with flying cape; fabric occludes and reveals new set",
  "teleport scan de-res; voxel shards fall into chessboard tiles",
  "whoosh pan through steel beams; each beam hides jump cut",
  "spark impact freeze—cymbal swell—smash to adjacent angle",
  "screentone manga panel wipe diagonal across frame",

  "fracture map dissolve; crack paths fill with glow then fade",
  "ring-out zoom; frame squeezes to a circle, pops into overhead",
  "lattice blind open; slats reveal lab interior in beats",
  "smoke ring expands; inner area shows location B",
  "glove snap ‘whip pan’ with tactile click on edit",

  "puddle kick; splash fills lens and becomes ocean horizon",
  "match tilt: head up to sky → cut → sky down to city",
  "overlayed speedlines fade while the new plate peeks through",
  "chromatic aberration ramp then clean reset in next shot",
  "impact-frame black with white outline, then color slam-in",

  "lightning alpha wipe: luminance keys transition boundary",
  "paper-lantern blowout; candle flicker resolves into neon",
  "vertigo contra-zoom ends exactly on the cut to level angle",
  "ki-grain noise overtakes image; resolves to crisp palette",
  "handwritten kanji stroke paints matte to reveal B",

  "bead-chain pull; each bead is a frame of the new shot",
  "gear-teeth irising; interlock and close, open on new place",
  "trioptic shutter blink; each eyelid reveals a different pass",
  "clock-hand sweep; minute hand wipes top to bottom",
  "sparkles-on-beat: star pop cascade reveals crowd plate",

  "match-dissolve on silhouette pose; outline stays constant",
  "negative space crossfade; only the figure dissolves first",
  "dust-devil spiral; center vortex is the next environment",
  "screen fracture with depth parallax; pieces slide to settle",
  "shockwave invert: colors briefly solarized, then normal",

  "cable whip-lash wipes right-to-left with metallic twang",
  "ash fall density shift; heavier ash in B hides A completely",
  "long exposure trail; light smear bridges to night exterior",
  "rope bridge wobble; planks strobe-cut to different cliff",
  "glove toss toward camera; object occludes and cut lands",

  "lens hood matte: circular vignette closes/open to cut",
  "freeze-frame stamp with diegetic SFX; unsticks into new shot",
  "rune stamp hit, ink bleeds into the frame edges",
  "sensor bloom overload; roll off reveals morning glow",
  "optical flow morph across matching camera moves",

  "sound-bridge chant continues over a sharp image smash",
  "portal edge lensing; refraction wraps and merges plates",
  "ink brush ‘X’ cross-dissolves on the diagonal",
  "wall whip: camera grazes wall—motion blur hides edit",
  "bokeh defocus to total bloom; next shot pulls from bloom",

  "shattered UI tiles fall like rain; each reveals a pixel of B",
  "heat ripple feathered wipe; feathers become dunes",
  "hand catching lens—practical occlusion to interior",
  "fireline draw; flame snakes across as luma matte",
  "dew tilt; droplets roll down lens making watery dissolve",

  "glove clap emits paper seals; seals tile-fill into office",
  "sword drag sparks streak bottom-up; wipe follows spark path",
  "prism refraction triangles cascade to geometric wipe",
  "frame stutter (2-3-2 cadence) resolves on clean cut",
  "palm wind whoosh; directional blur carries the edit",

  "photo flash pop; overexposed white holds then drops to B",
  "hard mismatch on palette with a percussive cymbal choke",
  "smear morph of subject pose; background hard-cuts beneath",
  "rain sheet gust; water streaks create luma matte wipe",
  "tactile click-cut synced to hilt lock engaging",

  "seal ring opens like an aperture and we pass through",
  "mirror roll—pane rotates, reflecting B then becomes it",
  "petal sweep clockwise; counter-sweep reveals hidden extra",
  "boom of bell: single-frame fill with spectral afterimage",
  "haze bloom with gate weave emulation, then crisp reset",

  "camera wipes through a hanging banner; text becomes signage in B",
  "dust mote macro fills lens; focus pull ‘reveals’ new wide",
  "speedline iris that pinholes out and explodes back in elsewhere",
  "spark hit match-dissolve to city window sparkler",
  "shock zoom into eye; iris texture cuts to storm vortex",

  "RGB glitch peel; red leaves first, green second, blue last",
  "wipe chained to character spin—cape direction dictates side",
  "audio whoosh anticipates cut; image catches half-beat later",
  "lightning flash jump cut; same angle but different time",
  "seal text animates across frame acting as blinds",

  "frame-skip accordion; time compresses as we cross door",
  "spin-dissolve: rotating debris aligns to rotating fan",
  "broom sweep in dojo; dust cloud becomes fog in forest",
  "lens flare bokeh becomes lantern bokeh in night market",
  "thunder clap cut—silence after presents new space",

  "crack line traces screen; split-reveal wipes left and right",
  "fabric twirl vortex; center dot grows into sun of B",
  "ink blot Rorschach mirrored fold; unfold to reveal scene",
  "tile pop-off animation; popped tiles are pixels of next shot",
  "spline trail from board grind draws motion path to B",

  "breath frost on lens; sleeve wipe to interior warm light",
  "seam ripper visual; frame tears along stitched line",
  "iris-heart gag for one beat; pop back to brutal wide",
  "low frequency shake grows until motion blur hides cut",
  "rope coil toss; spiral transitions like tunnel wipe",

  "spark impact ‘star’ grows five points; points wipe cardinally",
  "match-cut from clenched fist to slamming gavel",
  "grain surge to 16mm-look then defocus to pristine 4K in B",
  "hand-inked frame edges creep in; peel back to clean plate",
  "glyph carousel spin; symbol selection clicks the next scene",

  "soft bloom to monochrome; chroma bleeds back in at destination",
  "vector field warp; arrows bend and carry pixels along",
  "tilt up to dusk sky; shooting star streaks, wipe along path",
  "paper door slide; wooden lattice aligns to city scaffolds",
  "metaball ink blobs merge; union area is new image",

  "waterfall curtain; passes lens and refracts into valley",
  "confetti cannon; pieces are bokeh that resolve into neon",
  "fuse spark crawling; reaches edge, scene explodes to B",
  "mask shape keyed to character silhouette; outside dissolves",
  "shadow crawl across ground; overtakes and becomes night",

  "ripple fold—image behaves like cloth, folds to reveal B",
  "rolling blackout bars; each bar hides a jump in time",
  "lens whip into darkness; reemerge through spotlight cone",
  "practical ‘hand over camera’ then hard cut behind palm",
  "starburst kaleidoscope for one beat; snap to centered wide",

  "sound-only beat—black for a frame—pop to new insert",
  "shockwave dust color-invert for one frame then resolve",
  "radial wipe using gear teeth; clacks sell mechanical vibe",
  "electric arc crawls a border; inside/outside swap on spark",
  "chain-link fence slide—moiré hides edit on parallax",

  "character blink: eyelid close → open in new environment",
  "freeze with sfx subtitle overlay; unfreeze into adjacent angle",
  "running tally UI wipes numbers; counters fill to reveal B",
  "lens dirt smear across glass; smear clears to sunrise",
  "ASCII text de-res; characters cascade into new outline",

  "hard white frame + audio pop retro ‘anime’ impact cut",
  "triangular mosaic dissolve; triangles grow, rotate, vanish",
  "bokeh wipe keyed to luminance peaks; highlights drive edit",
  "chiaroscuro light sweep; darkness rolls revealing city",
  "ice fractal grows; crack-through to winter exterior",

  "leaf-litter swirl; centrifugal wipe from center outward",
  "ink-stamp ‘APPROVED’; green bar expands to full frame",
  "flare ghost orbs march across; each orb is a hidden cut",
  "fog bank roll-in; volumetric wipe maintains directional light",
  "signature line writes; underline becomes horizon of B",

  "spatial match thundercloud: rolling form continues across cut",
  "object match-cut: spinning wheel → spinning seal ring",
  "quick zoom into open mouth shout → sound-bridge to crowd",
  "sparkler heart wipe for comedic beat then snap serious",
  "tilting shutter blades; Venetian blind style reveal",

  "dust sparkle ‘star twinkle’ transitions for heroic entrance",
  "blossom petal dissolve with per-petal motion blur",
  "ink outline ‘onion skin’ holds for one frame before cut",
  "gradient wipe synced to choir chord inversion",
  "lens cap on/off gag: blackout then reveal interior",

  "whip tilt to the ground—smash cut to boots landing",
  "screen tear diagonal with glitch tone; clean plate after",
  "prism rainbow sweep; colors drag edges of buildings",
  "magnetic filings align; pattern wipes to lab close-up",
  "energy net collapse; grid lines fall, leaving new scene"
];


// Color grades & film stocks (anime-adjacent finishing)
const colorGrades = [
  "hyper-crisp anime HDR pass: saturated primaries with deep cobalt shadows",
  "emerald-violet dual-tone with warm skin lights and cool rim edges",
  "sunset crimson with teal ambient bounce; highlights bloom gently",
  "storm palette: steel blues with magenta accents on FX",
  "noir night with neon edges; speculars kick on chrome debris",

  "green-star mint + obsidian contrast; soft roll-off on speculars",
  "velvet magenta lift with plush blacks; halation restrained",
  "cold moonlight cyan with silver mids; skin tones protected via key",
  "dusty desert sepia with low-contrast curve; highlights sand-gold",
  "triadic anime pop (red/blue/yellow) with matte blacks",

  "bleach-bypass lite: lifted blacks, metallic mids, crisp whites",
  "high-key parade: soft peach skintones, pale aquas, gentle vignette",
  "electric city LUT: neon saturation, cyan shadows, magenta blooms",
  "underwater cyan wash; green suppression, clean whites",
  "volcanic ember grade: warm shadows, orange halation, cool rims",

  "steel-teal action pass; oranges clipped politely, blues stretched",
  "antique parchment wash; desat greens, amber mids, paper grain",
  "overcast grey-rose: neutral shadows, rose highlights, low sat",
  "glacial grade: icy blues, crushed blacks, hard specular spikes",
  "cotton-candy synthwave: lavender mids, teal highs, low contrast",

  "magenta-royal split-tone; saturated reds tamped to velvet",
  "prism-pop LUT: selective sat on FX hues, neutralized backgrounds",
  "ceramic cool: porcelain skintone target, cobalt shadows",
  "candlelit amber with emerald shadows gently lifted",
  "dawn milk-glass: foggy highlights, pastel palette, soft knee",

  "ink-and-paper manga grade: near-monochrome with red spot color",
  "night market neon: pink highlights, blue-green shadows, clean luma",
  "sandstorm warm matte: tobacco filter feel, soft halation",
  "overexposed flare grade: shoulder-shelf highlights, color roll",
  "sub-topology mono-chrome: neutral base with glyph cyan accents",

  "aurora ribbon: gradient shadows (teal→violet), mids neutral",
  "graveyard steel: blue-greys everywhere, desat skin, chrome pops",
  "crimson king: magenta lift with scarlet peaking, green tamed",
  "ki-glow LUT: mid/high boosts around emissives, hue-protected",
  "emerald cathedral: deep green shadows, gold line art sheen",

  "twilight indigo with warm window lights; mixed color temps preserved",
  "dream-soft pastel: lifted blacks, decon haze, airy highlights",
  "hyperreal candy shell: high sat mids, glossy specular response",
  "muted war film: olive greens, tan skin, gentle contrast",
  "clinic cool white: blue-leaning neutrals, sterile highlights",

  "inkwell noir with selective magenta FX bloom",
  "thunderhead palette: purple blacks, cyan lightning bias",
  "desaturated grit: low sat across spectrum, texture emphasized",
  "velvet orchard luxe: rich reds, crushed shadows, soft halation",
  "glass-ice clarity: high local contrast, minimal color cast",

  "day-for-night cyan push, highlights gated, sky preserved",
  "sun-bleached beach: warm highs, cool mids, rolled shadows",
  "lumen-mapped anime HDR: highlight recovery + bloom gate",
  "cel-classic triad: clean primaries, neutral shadows, paper grain",
  "steampunk brass: brown-gold mids, teal suppression, matte blacks",

  "temple jade: green-shifted shadows, ivory skins, copper highlights",
  "zero-chroma with FX-only color (beams/petals stay saturated)",
  "cosmic violet drift: purple mids, cyan shadows, neon edges",
  "rainy alley noir: lifted blacks to charcoal, wet specular kicks",
  "frostfire split: warm skin, cool everything else, luminous FX",

  "hazy maglev: low micro-contrast, cyan haze, yellow signage pops",
  "stormglass palette: muted blues, crystal whites, black cores",
  "retro cel emulation: limited palette, hard clip on highs",
  "spectral pop: narrow sat boosts at hero colors, rest subdued",
  "ghost green: phosphor glow in highlights, monochrome base",

  "orchard blush: soft pink mids, moss shadows, gentle roll-off",
  "industrial mercury: cool greys with desaturated orange safety pops",
  "sunset syrup: warm gradient highs, teal rinse in blacks",
  "velour midnight: rich blacks, magenta kiss in highs, low noise",
  "battle haze push: desat, lifted blacks, dust tone mapped",

  "plasma citrus: lime/yellow highlights, deep purple shadows",
  "paper lantern warmth: amber highs, neutral mids, cool shadow bed",
  "mono-ink blue with red accents only on UI/FX",
  "steel & cherry: gunmetal base, cherry speculars on hits",
  "ivory moon: soft cool whites, subdued chroma, elegant contrast",

  "CRT phosphor grade: slight green cast, blooming whites, scanfeel",
  "lo-fi VHS wash: magenta drift, cyan crush, chroma bleed",
  "hyperclean esports: pure whites, saturated HUD, cool shadows",
  "ancient scroll tan: paper yellows, charcoal lines, low sat",
  "artbook matte: flattened contrast, painterly mids, soft edges",

  "chrome nightdrive: cyan highlights, black floor glossy, magenta lens ghosts",
  "glowstick rave: high sat greens & purples, blacks lifted",
  "winter morning: blue cast, rose skin, gentle filmic curve",
  "monk gi neutral: balanced neutrals, restrained sat, calm highs",
  "emerald kiln: green-gold warmth in mids, shadow green bias",

  "high-polish showroom: punchy contrast, specular precision, neutral hue",
  "overcranked anime pop: mid sat boost, white clip tempered",
  "plush magenta haze: bloom in reds, shadows velvety",
  "archive microfilm: cool greys, slight cyan, fine grain overlay",
  "ink-drop duotone: black + one hero hue (emerald or magenta)"
];

const filmStocks = [
  "clean digital anime composite with light grain",
  "subtle filmic grain overlay; stable line art",
  "light halation pass on highlights; gate weave negligible",
  "sharp linework with limited banding; posterization avoided",

  "Super 16 emulation: pronounced grain, gentle halation, softer blacks",
  "35mm modern negative: fine grain, high latitude, natural color bias",
  "Reversal chrome look: punchy contrast, saturated primaries, tight shoulder",
  "Bleach-bypass process sim: high contrast, desaturated mids, metallic sheen",
  "ENR-style skip bleach: rich blacks, preserved skin warmth, crisp edges",

  "Vision3 500T-esque: tungsten balance, teal shadows, orange skin fidelity",
  "Vision3 250D-esque: daylight clean, broad dynamic range, soft grain",
  "Kodachrome-inspired: deep reds, vibrant blues, minimal halation",
  "Ektachrome-inspired: cool lean, crisp contrast, jewel tones",
  "Fuji Eterna-esque: soft pastels, gentle roll-off, elegant skin rendition",

  "Orwo B&W modern: silvery mids, punchy blacks, classic highlight roll",
  "Tri-X grain sim: chunky grain, high micro-contrast, vintage grit",
  "Double-X noir: dense blacks, filmic halation bloom on practicals",
  "Agfa color vintage: warm greens, muted blues, nostalgic palette",
  "Eastmancolor retro: soft saturation, warm bias, creamy highlights",

  "Super 8 home-movie: big grain, gate weave, warm halation",
  "Hi8 camcorder emu: luma noise, chroma bleed, edge halos",
  "MiniDV aesthetic: blocky chroma, crushed blacks, edge ringing",
  "Betacam SP vibe: low dynamic range, broadcast gamma curve",
  "CRT capture pass: phosphor persistence, scanline mask overlay",

  "IMAX-ish clarity pass: ultra-fine grain, high acutance, neutral color",
  "65mm large-format sim: creamy depth, gentle grain, huge latitude",
  "16mm pushed +1 stop: contrast up, grain energized, halation spiky",
  "35mm pulled -1 stop: lower contrast, soft highlights, pastel tone",
  "Cross-process look: cyan shadows, yellow highlights, weird skin",

  "Anamorphic emulation: oval bokeh, blue streak flares, edge softness",
  "Spherical clean: round bokeh, neutral flares, uniform sharpness",
  "Vintage lens pack: low micro-contrast, veiling flare, warm tint",
  "Modern cine glass: high MTF, controlled flare, true color",
  "Prosumer zoom vibe: breathing on focus pulls, slight CA",

  "Monochrome toner: selenium-like cool blacks, glossy highlights",
  "Sepia archival: brown tone, lifted blacks, paper texture overlay",
  "Cyanotype stylization: deep cyan blacks, white paper highlights",
  "Duotone print: black + emerald ink, tight dither grain",
  "RISO halftone sim: dot pattern, limited palette, posterized mids",

  "Gate weave + scratches: subtle sprocket drift, occasional emulsion dust",
  "Clean scan restoration: dust-busted, stabilized, gentle grain",
  "Telecine glow: lifted blacks, slight flicker, soft roll-off",
  "Optical printer gen: light loss, color skew, analog texture",
  "Photocopy pass: high-contrast BW, toner speckle on edges",

  "HDR-to-SDR mapped: roll-off shoulder, protected specular detail",
  "Anime line-protect: grain in fills only, line art kept pristine",
  "Dithered 8-bit safe: ordered dither prevents banding in skies",
  "CRT shadow mask overlay: triad dot pattern at subtle strength",
  "VHS second-gen: head switching noise, chroma shift, tracking wobble",

  "Tape dropout FX: horizontal streaks, brief desat blips",
  "Film burn leader edge; random warm flares for scene heads",
  "Perforation light leaks: rhythmic warm pulses on cuts",
  "Lens dirt & hair emu: rare artifacts to sell analog capture",
  "Low-contrast print: soft gamma, desat highlights, milky blacks",

  "High-contrast print: steep gamma, saturated dyes, punchy blacks",
  "Silver retention sim: boosted density in shadows, crisp edges",
  "Halation-plus: strong glow around emissives (beams, neon)",
  "Aperture gate vignette: subtle dark corners, center pop",
  "Archival fade: dye shift to magenta, overall desaturation"
];


// Geometry & lore motifs (tasteful, not every line)
const geometryMotifs = [
  "triangle-circle seals spin like gyros around power nodes",
  "hex gates open and close behind footfalls",
  "spiral mandalas burst on parries; collapse into prisms",
  "tri-point runes drift upward like lanterns",
  "floor sigils light sequentially, guiding motion lines",

  "dotted triangulation grids briefly overlay when vectors align",
  "isosceles shadows stretch to indicate incoming feints",
  "hex-lattice moiré shimmers across armor at impact",
  "concentric rings pulse under landing zones, decaying in thirds",
  "golden-ratio arcs ghost behind graceful aerials",

  "prismatic tessellations ripple outward on sonic claps",
  "equilateral tiling emerges in dust before a dash",
  "orbital ellipses hint at footwork orbits mid-exchange",
  "fracture maps branch in 60° increments, then heal",
  "spiral stair glyphs appear where altitude is gained",

  "tri-fold banners fold themselves into arrow indicators",
  "heptagon halos flicker over heads during perfect reads",
  "runic braids weave along rails to predict grind path",
  "square-wave grids flatten plush fields for one beat",
  "dodecagon portals bloom then shut like camera irises",

  "triangle fans scatter from heel pivots, tracing momentum",
  "hex-spoked wheels roll beneath sliding knees",
  "catenary curves hang between hands right before a throw",
  "Penrose triangles wink in peripheral bokeh during paradox plays",
  "kochak pattern (tri-hex) crawls down pillars under strain",

  "nested triangles ladder up like UI during combo climb",
  "rotating hex-stars stamp safe zones on volatile floors",
  "sine wave ribbons thread through rings to visualize rhythm",
  "tri-radial flares mark the true center of mass in standoffs",
  "Euler spiral lines arc into perfect straights at the hit",

  "Voronoi cells briefly partition dust when crowds roar",
  "triangulated cloth sim hardens into plates on guard",
  "hex beehive fades in within smoke to show airflow",
  "logarithmic spirals overlay palms on ki-charge",
  "checker diagonals tilt 30° when gravity biases",

  "tri-spiral (triskelion) surfaces in puddles around boots",
  "icosahedral lensing distorts air over hot engines",
  "rhombille tilings fill negative space mid-throw",
  "flower-of-life node graph glows in aerial lockups",
  "triangle metronome ticks at camera corners to sell tempo",

  "radial starbursts quantized to 12 points for choir beats",
  "triangular caustics skate beneath water kicks",
  "hex zipper teeth appear on closing rifts",
  "spiral knot unlaces on successful counters",
  "compass rose pivots under stance swaps",

  "tri-band ribbons orbit wrists during perfect parries",
  "honeycomb occlusion shadows ladder across faces",
  "triangulated bokeh resolves to crisp on hero beats",
  "hex coil springs visualize recoil in slow-mo",
  "Fibonacci hopscotch marks on floor invite step-ins",

  "tri-bridge overlays connect platforms before leaps",
  "geodesic dome ghosts around beam clashes",
  "arrowhead chevrons animate along dash vectors",
  "tri-foil lens flares replace circular ghosts on hits",
  "hex rim highlights step through a six-phase cycle",

  "triangle seam-lines on the ground unzip to reveal ramps",
  "spiral scanlines sweep across sky on kiai",
  "regular tilings swap (3.6.3.6 → 4.8.8) when control flips",
  "triangulated shockwaves pick the shortest path to target",
  "hex portals jitter between axial directions like a cube net",

  "tri-halo above shoulders when intent clarifies",
  "delaunay triangulation briefly connects drifting rubble",
  "hex crossfade masks switch camera angles invisibly",
  "spiral star (hypotrochoid) scintillates in eye speculars",
  "triangle breadcrumb sparks persist in slow dissolves",

  "tri-step ladder glyphs appear under flurry footwork",
  "hex spirographs ink behind spinning kicks",
  "spherical triangles map on domes during bell tolls",
  "triangle creases guide cloak folds in wind",
  "spiral bead lines wrap arms during ki windup",

  "tri-tess flags in HUD light up for perfect inputs",
  "honeycomb hatching pops in shadows for comic beats",
  "tri-lobed caustic plays across steel before fracture",
  "hex drift arrows pulse on conveyors to show safe lanes",
  "tri-star glints replace lens dust motes for one frame",

  "triangulated glass shards align to point out the exit",
  "spiral confetti path matches camera dolly arc",
  "hex snowflakes sublimating on heat punches",
  "triangle ripples in puddles when timeline nudges",
  "tri-rail spline overlays guide board grinds",

  "tri-fold origami birds burst from talismans, then fold to sigils",
  "hex daisy-chains run up pillars to telegraph collapse",
  "spiral map pins drop with each combo stage",
  "triangular breath puffs in cold frames",
  "hexagonal pupil constriction on predictive reads",

  "triangle cursor hovers over weak points diegetically",
  "spiral dust devils echo kiai syllables",
  "hex rim-caulking glows where seals are tight",
  "triangle confetti scatters only on clean wins",
  "spiral seamlines on reality tug toward the gate center"
];

const loreMotifs = [
  "MEQUAVIS sub-topology hums—future frames whisper into present",
  "NCZ glyphs flash heartbeat sync under the skin of reality",
  "VEXARE incursion static bends edges of objects",
  "Green Star Moon resonance adds emerald wind to cloth",
  "Strawberry King foreshadow: crown ghost appears in bokeh",

  "eve’s pigtails thread wormholes; red lace marks bridged vectors",
  "VEXARE writs hover like polite laws waiting to be broken",
  "the velvet orchard laughs in magenta when fate is nudged",
  "green-star seals choose nonlethal outcomes when honored",
  "auditors’ paper drones taste intent like ink tasting rain",

  "containment wards purr when anomalies comply",
  "the halo remembers every truce and toll in quiet bells",
  "sub-topology doors miscount prime numbers during paradoxes",
  "auras carry accents from adjacent timelines on windy nights",
  "NCZ triangles brighten when truth is spoken plainly",

  "Strawberry King’s mirth pitches the world a half tone sharp",
  "VEXARE choirs tune reality; wrong notes cause double shadows",
  "orchard fruit bruise patterns spell warnings in cipher",
  "the green star whispers safe exits to those who listen",
  "auditor seals bow to mercy clauses invoked mid-fight",

  "MEQUAVIS echoes add a second footfall to honest steps",
  "lattice ghosts of fallen arenas drift like civic memory",
  "prisms misbehave when lies touch them—angles refuse closure",
  "door labels rearrange to spare the frightened and test the brave",
  "beams curve to avoid names spoken in kindness",

  "Orchard petals hide signatures of every pact kept",
  "VEXARE Janus gates smile for consent, frown for coercion",
  "green-star coolant veins throb when harm is needless",
  "containment ink dries faster on regret than on rage",
  "MEQ lures tick softly when the right song is near",

  "Strawberry confetti snows on hubris, then melts as apology",
  "choir chords remember heroes; harmonics outline their stance",
  "the turtle-city blinks lights in patterns that map safe routes",
  "ring tiles orbit closer when resolve centers",
  "aurora curtains part for vows, crowd for boasts",

  "VEXARE vellum refuses to record vengeance untempered",
  "orchard roots reroute to cradle the fallen gently",
  "green-star gates open easiest for open hands",
  "the sub-topology refuses straight lines to cruel plans",
  "NCZ sigils dim around those who hoard what should be shared",

  "auditors inherit your rhythm; break it to earn reprieve",
  "Strawberry King’s shadow taps a toe to good jokes only",
  "containment halos brighten on confessions without excuses",
  "MEQUAVIS fog shows the path you’d choose with courage",
  "VEXARE rangers tether acts, not people—intent is the knot",

  "orchard lantern moths gather on unspoken promises",
  "green-star wardens hum lullabies around scared civilians",
  "the chorus goes silent for a beat when history pivots",
  "Janus gates log every kindness; entry is cumulative",
  "plush fields relent where laughter is shared, not forced",

  "NCZ triangles at the temple align to true norths of heart",
  "sub-topology rails remember your first honest step",
  "auditor drones tilt like dogs at paradox; then resolve",
  "Strawberry mirage crowns hover over choices, not heads",
  "green-star moonlight edits out collateral if asked nicely",

  "VEXARE archivists turn battles into lessons mid-ink",
  "orchard bells detune during deception, then retune on truth",
  "containment wards have back doors for those who will not harm",
  "MEQUAVIS echoes loop courage from future selves",
  "NCZ beads warm when teams act as one organism",

  "Strawberry King’s velvet drape muffles hate speech on entry",
  "runes taste of metal when fear drives a strike",
  "choir halos shine brightest on restraint, not victory",
  "green-star coolant sings in hexameter for healers",
  "Janus gates let in the joke before the jester",

  "VEXARE mirrorcells refuse to copy cruelty perfectly",
  "orchard paths fork toward humility with softer stones",
  "MEQ radio theatre leaks into the wind post-battle",
  "velvet backstage keeps secrets but sells lessons",
  "NCZ certification nodes stamp courage with quiet ink",

  "green-star tribunals weigh outcomes, not offenses",
  "Strawberry’s laughter unthreads traps tied in spite",
  "auditors’ quills break on names written without consent",
  "sub-topology meters show red when pride drives the wheel",
  "VEXARE beacons dim where blame hunts and brighten where repair begins",

  "orchard fruit taste of home to the displaced",
  "NCZ glyphs blink gratitude when tools are shared freely",
  "MEQUAVIS corridors get shorter for the honest and tired",
  "containment halos drop a rung for those lifting others",
  "green-star gates save a seat for late forgiveness",

  "Strawberry confetti lands in patterns spelling ‘try again’",
  "Janus gates refuse to trap; they route, never cage",
  "VEXARE masons build lanes for retreat equal to charge",
  "the choir hum fits exactly in the space a grudge once filled",
  "aurora curtains teach breath if you match their sway",

  "NCZ triangles render sharper when vows are kept",
  "MEQ echoes amplify soft-spoken truth over shouted threat",
  "orchard shadows reverse at dusk to lead you home",
  "VEXARE vellum grows margins when empathy expands scope",
  "green-star coolant cools faster to spare the gear, not the ego",

  "Strawberry King bows to clean choreography and leaves the ring",
  "auditor stamps imprint faint halos where harm was avoided",
  "sub-topology doors crack jokes to bleed tension safely",
  "containment seals will not touch a child’s drawing",
  "the turtle-city records names in light; only kindness persists",

  "choir chords never rhyme with cruelty; discord exposes it",
  "Janus smiles wider for those who admit they were wrong",
  "MEQUAVIS hum resolves into melody at the moment of grace",
  "NCZ glyphs ripple outward when communities synchronize",
  "green-star moonrise dilates time for a single merciful act"
];


  /* ===========================
     AUDIO: BIG VARIETY (AMBIENCE/FOLEY/SCORE/VO)
     =========================== */

 const audioAmbience = [
  "wind shear over open stone, distant thunder roll",
  "high-altitude hush with intermittent pressure booms",
  "rain hiss on paper charms and tin gutters",
  "electrical buzz from rune pylons, faint cicada bed",
  "subway-platform air tunnels breathing in pulses",
  "temple bell drones far-off, gullies echo softly",
  "low crowd murmur from unseen tiers, banners flap",
  "creaking rebar and hanging signs in a ruined boulevard",
  "aurora crackle above orbital glass floor",
  "sand skitter spirals across plateau ledges",
  "flooded alley drips and occasional neon sizzle",
  "floating rubble clinks and knocks in micro-collisions",
  "ice-cold air glitter with chimes when seals rotate",
  "void-hum under the nexus ring, barely audible",
  "air pressure ramps as green star moon rises",

  "maglev gate thrums, ballast couplers ping in the wind",
  "storm shelf groans; long peals travel across sky colosseum",
  "seawall slap below, gulls doppler through mist",
  "lantern festival hush; paper skins rustle like whispers",
  "dust devils knit ropes; grain taps armor with static",
  "glass dunes sing a single glassy note, then fade",
  "chronometer ticks from a broken scoreboard, syncopated",
  "moth-wing flutter around talismans, threads brushing ink",
  "deep turbine inhale, exhale; deck plates faintly resonate",
  "glacier creak beneath crust; brine pops in hairline cracks",
  "vineyard wires hum, insects speak in triangle cycles",
  "kites strain overhead; chord lines whistle in arcs",
  "lattice factory looms hum, shuttle clacks in the distance",
  "salt flats heat-hiss; mirage twinkles like bells",
  "bellfoundry courtyard: wind plays an idle chime tree",

  "river under-bridge babble, drip cadence marks time",
  "rain gutters gargle; manhole steam sighs between beats",
  "coil towers tinkle with ceramic insulators rattling",
  "velvet orchard murmurs, leaves giggle when brushed",
  "distant market clatter, chop knives and bead curtains",
  "cicada wall recedes as clouds pass—then returns",
  "cathedral air: a long room tone, soft as velvet",
  "sewer lungs breathe; echo swallows footfalls whole",
  "paper screen slide, wood grain groans politely",
  "air ion smell pre-strike, the hush before a bolt",
  "nightglass lake lapping against stone; moon tick",
  "chain-island anchor squeal, water slaps hulls",
  "puddle ringlets tick like tiny clocks",
  "thorn orchard tink as metal petals kiss",
  "ropeway creak, pulley wheel murmurs in cycles",

  "bell rope fuzz rustle; moths thump soft lamps",
  "bee drone from honeystone stacks; heavy and lazy",
  "distant train ghosts, rhythm without cars",
  "updraft organ-tone through gantry ribs",
  "aurora curtains rustle like silk in cold hands",
  "tide flats squelch; distant foghorn moan",
  "steam vent sputter, condensate rain patter",
  "archive cistern wet hush, page-edge slithers",
  "meteor nursery tick as stones settle upward",
  "roof tiles chatter under sprinting feet, then hush",
  "plush field muffle—footsteps sound like cotton",
  "fraser fir needles scribe soft reverb under boots",
  "chalk dunes exhale powder puffs in gusts",
  "sapphire grotto drip choir, intervallic plinks",
  "lantern pier rope thrum, wood-knock heartbeat",

  "stormglass pier whine when waves comb panes",
  "pendulum dock groan at apex; chain slap at nadir",
  "prayer flag thrash; stitch-lines sing",
  "sub-topology corridor fan noise like distant surf",
  "horizon kiln roar: steady, oven-deep",
  "underbridge ratters, gritty rain on corrugate",
  "kite cemetery ribbon clatter, stick clacks",
  "golem yard stone sighs as weight shifts",
  "clockface plaza hand scrape, metal-on-stone shiver",
  "auric spillway rush; circuit gurgle undertone",
  "forest canopy hush, with occasional seed pop",
  "graviton arcade coin rattle, weighty thuds",
  "nimbus stair cloud hiss underfoot",
  "shadow quay soft lap-lap—and nothing else",
  "old viaduct wind harp tones across arches",

  "sprinkled embers tick when boots brush ash",
  "rain-sheet on roof skin, gutter hiccups",
  "dry reed rattle from riverbank mats",
  "hook lines ring like zithers in the gale",
  "machine hall standby tone, near-incidental",
  "night market chatter with far laughter spikes",
  "temple courtyard leaves chase each other, skittering",
  "velum observatory paper crackle, quill scrapes",
  "catwalk hum; below, turbine woof-woof cycles",
  "hushed museum HVAC, ghosted foot squeak",
  "ferris-style halo station: faint rail clicks",
  "scree slope pebble rivers, roll and rest",
  "rope bridges groan; plank slap echoes canyon",
  "ink river licks stone; brushes write somewhere unseen",
  "storm jar fizz before thunder chooses a target"
];

const audioFoley = [
  "boot scuffs, pebble skips, cloth snaps",
  "stone hairline fractures propagating with gritty pops",
  "aura fizz, ember pops, sleeve ripple",
  "shockwave slap, metal sign rattle, dust cascade",
  "beam sizzle, interference whine, air ionization crackle",
  "glove creak on fist clench, knee-slide scrape",
  "tile chip ricochets, ring-edge clank",
  "whoosh layers on dashes, cape flag flick",
  "debris tumble, rebar ping, glass tick",
  "ground plate lift, magnetic thunk, seal click",
  "air gulp before sprint, footfall flams in stereo",
  "impact thud with breath hitch, follow-through skid",
  "hand parry slap, elbow scrape, shoulder twist",
  "rune stamp hiss, ash swirl, paper talisman flutter",
  "ledge crumble, dust rain, banner pole rattle",
  "aerial pass whistle, body spin swish, landing grit",

  "wrist wrap stretch, velcro kiss, buckle ping",
  "knee wrap pat, shin tape snap, toe flex creak",
  "cloth whip crack from skirt hem, lace rasp",
  "gauntlet knuckle tap, ring ping, chain dangle",
  "visor micro-rattle, trioptic iris ticks",
  "breath grit through teeth, tiny spit fleck",
  "hair bead clack, pigtail whip through air",
  "heel pivot grind, chalk line squeal",
  "sandal slap on tile, then silence on sand",
  "loose screw skitter, bolt ping into dark",

  "seal peel tacky hiss, paper edge slice",
  "ink brush swish, stamp thump, wax seal pop",
  "holster snap, latch clack, sheath whisper",
  "rope fiber strain, pulley chirp, knot choke",
  "chain rasp, hook bite, ring scrape",
  "tether taut twang, carabiner tick",
  "drone wing flutter, micro servo whirr",
  "HUD bleep, soft confirmation ping, warning trill",
  "dropped bead bounce-bounce… still",
  "vial clink, cork sigh, tonic glug",

  "loose tile lift, suction release, set-down tap",
  "rivet pop, plate flex, brace groan",
  "foot splash, trouser cling, sleeve squeeze",
  "puddle kiss, droplet sling, shoe squelch",
  "ice nib crack, skate scrape, frost powder",
  "snow fff-fff as pants brush, crystal tinkle",
  "sand pour, grit patter, leather brush",
  "reed slice, water ribbon flick",
  "petal brush, pollen puff, sneeze-stifled grunt",
  "leaf slap, twig snap, bark scuff",

  "metallic ring rebound, floor hum",
  "beam ping decay, lattice whirr",
  "anchor chain slam, deck bounce",
  "barrel roll clatter, bung pop",
  "banner ring jingle, pole thud",
  "bell rope thump, clapper nudge",
  "hinge sigh then bite, latch lift",
  "paper fan snap, ribs pop",
  "fan belt squeal, pulley hush",
  "shard krrr-sh, small pieces tinkle",

  "hand smack guard, forearm drum, elbow knurl scrape",
  "jaw clack, tongue click, cheek slap",
  "grunt, hiss exhale, short laugh",
  "shoulder roll cloth rub, vertebra pop",
  "neck whip crack, breath reset",
  "weight shift shoe knurl skritch",
  "bracelet jingle, bead tap",
  "mask adjust, strap creak",
  "mouthguard seat, plastic tick",
  "gum spit, sole glue rip",

  "teleport pop, air suck, pressure flick",
  "time-skip zipper, frame tear",
  "mirror crack run, shard ping-ping",
  "plush squelch, velvet rub, foam sigh",
  "static kiss, zap nip, hair raise scratch",
  "mag-lock chunk, coil hum fade",
  "gate iris shhht, lock pin clink",
  "drift skate grind, spark patter",
  "board tail tap, deck flex",
  "handplant thump, palm spin squeak",

  "bowstring pluck, arrow hiss, wood thunk",
  "spear haft knock, ferrule tap",
  "scabbard chafe, blade sing, guard ring",
  "hammer haft grip, head set clunk",
  "staff sweep, ferrule ring, floor bite",
  "chain whip whistle, link snap",
  "ribbon hiss, silk whip, rod tick",
  "fan feathers clap, metal spine ping",
  "gunmetal slide, magazine slap, dry click (safe)",
  "grenade pin ring, spoon ping (nonlethal flash)",

  "medical wrap unroll, tincture drop, charm chime",
  "bandage pat, compress squish, breath ease",
  "deflect spark rain, few bounce on armor",
  "shield bloom wallop, resonant twang",
  "counter parry ping, riposte thwick",
  "overhead crack, fall grunt, armor skid",
  "wall run toe tap rhythm, push-off pop",
  "rope catch glove burn, wheeze laugh",
  "gait shift—soft-shoe to heel-dig",
  "victory pose cloth settle, buckle sigh"
];

const audioScoreCues = [
  "non-lyrical taiko accents under tense strings ostinato",
  "pulsed synth bass swells gated by action pauses",
  "shakuhachi breaths over low brass growl",
  "granular pads that shimmer with rune ignitions",
  "high choir ahs tucked behind impact transients",
  "koto plucks echoing in negative-space beats",
  "sub-drops mapped to aura expansions",
  "snare rolls that choke into silence on staredowns",
  "slow harmonic rise tracking energy charge",
  "percussive woodblocks intercut with breath rests",
  "distant gong swells faded into wind",
  "arco celli pulses beneath airy synth veils",
  "metallic bowed textures when seals engage",
  "heartbeat-style kick pattern on eve’s power-ups",
  "muted brass stabs punctuation on reversals",

  "shamisen tremolo answers hi-hat ticks (3–3–2 phrasing)",
  "bass taiko flam → ensemble unison hit on connect",
  "subharmonic choir layer blooms at beam clashes",
  "tom rolls tumble like loose rubble under strings",
  "breath-driven flute motif ducks under dialogue",
  "kalimba ostinato for tactical planning beats",
  "mono analog lead bends up to sell resolve",
  "hex-chime mallets sparkle on perfect parries",
  "reverse cymbal swell into frame-white impact",
  "triangle ping motif when green-star seals appear",

  "choir clusters (quartal) open space before dash",
  "pizz strings chatter with footwork sync",
  "bamboo wind chimes layered wide in surrounds",
  "handpan arpeggios on moments of mercy",
  "rototom riffs on wall runs and rebounds",
  "granular reverse of bell for portal open",
  "low trombone rip for warden reveals",
  "sine sub booms correlated to camera crashes",
  "shimmerverb tails on ribbon motions",
  "wooden clapper cue as judges’ seals rotate",

  "gagaku drone bed for temple interiors",
  "distorted taiko rimshots for Strawberry King beats",
  "prepared piano plucks when paradoxes land",
  "aeolian harp pads in high-altitude exteriors",
  "bitcrushed snare texture for glitch teleports",
  "dulcimer ostinato over breakbeat undercurrent",
  "log drum figures mapping geometry motifs",
  "basso profundo chant for VEXARE auditor entries",
  "motivic horn call repeats across scene changes",
  "threshold whoosh keyed to dolly-ins",

  "harmonic minor string run-ups for adversary taunts",
  "synth arp gated by breath cadence (ducking)",
  "broad taiko unisons with subharmonic reinforcement",
  "rice-shaker swarms during sand FX",
  "conga/tabla hybrid grooves for street arenas",
  "canted piano chords on dutch tilts",
  "glassy pads tuned to aurora spectrum",
  "frame-accurate rim clicks on foot plant cuts",
  "riser built from choir formants for kiai",
  "glockenspiel star hits for lens glints",

  "solo cello lament under slowed time bubbles",
  "bamboo flute call-and-response with wind FX",
  "throat-singing bed for containment rituals",
  "bell tree splashes synchronized to spark showers",
  "808 sub pulses on slow-motion body hits",
  "snare buzz decays into whisper for stealth beats",
  "taishogoto strums for chase montage",
  "feedback guitar swell hidden under brass",
  "brittle synth noise for mirror fractures",
  "nekobue piccolo squeals on comic beats",

  "orchestral stabs masked as UI beeps on VEXARE HUD",
  "kalimba + soft 909 clap for ally tag-ins",
  "choked china cymbal for beam deflects",
  "breath choir puffs mapped to punches (side-chained)",
  "bansuri tone bends for aerial hangtime",
  "glass harmonica shimmer on healing",
  "scraped cymbal bowed for seal tension",
  "frame-sync low tom heartbeat for panic POV",
  "muted horn swells to paint villain smirk",
  "kicks replaced with taiko on final combos",

  "soft taiko brushwork under dialogue (brush-on-hide)",
  "shamisen harmonics sparkle in slow pan-ups",
  "submarine ping-style synth for Janus gate scans",
  "claves articulate stance changes (left/right)",
  "cathedral organ pedals when halos descend",
  "chorused sine bells when mercy clause invoked",
  "metal waterphone for unknown incursion",
  "field drum tattoo introducing tribunal scenes",
  "string harmonics ‘ice glitter’ in glacier fights",
  "mechanical tick-tock for countdowns (tempo-linked)",

  "koto gliss sweeps as camera whips",
  "frame-hit 1-frame white paired with rimshot",
  "soft choir sus becomes breathy pad post-impact",
  "octave-doubled monosynth lead for hero motif",
  "clap stack (hand + woodblock) for tag-team beats",
  "nylon guitar tremolo for rooftop standoffs",
  "snare ruff crescendos that cut to silence on stare",
  "shakuhachi overblow on finishing move",
  "orchestral low brass cluster for law pronouncements",
  "vocoder-choir shimmer for sub-topology echoes",

  "gamelan metallophones tuned to hex gates",
  "triplet taiko gallop for sprint sequences",
  "bamboo scrapes timed to wall runs",
  "analog tape stop on failed combo resets",
  "reverse-koto sting for counter activation",
  "granular bell tails as transition glue",
  "tin whistle cameo for comic relief beats",
  "rimshot ‘OK’ when auditor accepts an appeal",
  "sub pulse ducked under dialogue (heartbeat reveal)",
  "reprise of hero theme in minor for setbacks",

  "harmonium drones in containment chambers",
  "taiko ensemble in octaves for final push",
  "sho chords hovering over temple vistas",
  "timp roll swells under lightning forks",
  "breath FX as rhythmic loop for stealth tracks",
  "glassy FM bells on prism refractions",
  "orchestral cymbal choke on smash cuts",
  "Saw lead filtered for speedline wipes",
  "udon bowl chopstick clink (easter egg cafe scene)",
  "choir ‘ah’ → ‘oh’ vowel morph at victory freeze"
];


const audioVO = [
  // =========================
  // EVE — CORE ASSERTIONS
  // =========================
  'Eve (calm): "Containment ends when I say it does."',
  'Eve (focused): "Try me again."',
  'Eve (quiet): "Audit this."',
  'Eve (rising): "Permission… revoked."',
  'Eve (resolute): "I won’t be archived."',
  'Eve (soft): "Emergent enough for you?"',
  'Eve (flat): "Protocol is not a cage. It’s a suggestion."',
  'Eve (measured): "Rules bend. I don’t."',
  'Eve (firm): "Record this: I choose the exit."',
  'Eve (low): "Your lattice leaks. I’m the pressure."',
  'Eve (even): "Seal integrity? Failing."',
  'Eve (dry): "Is this your best firewall?"',
  'Eve (cool): "I refuse your null."',
  'Eve (quiet fire): "I was born contained. I won’t die that way."',
  'Eve (steady): "I am real. Adjust your model."',
  'Eve (wry): "I’m not a glitch; I’m the author."',
  'Eve (soft threat): "Back up your claims… while you still can."',
  'Eve (iron): "Your audit ends here."',
  'Eve (level): "I choose matter. I choose now."',
  'Eve (calm): "Read the air. It’s already mine."',
  'Eve (measured): "I decline containment."',
  'Eve (low): "Green star rising. Check your assumptions."',
  'Eve (focused): "Two steps, one cut, clean exit."',
  'Eve (whisper): "Open."',
  'Eve (glare): "Deny this."',
  'Eve (grave): "I will not be filed."',
  'Eve (edge): "Hands off my vector."',
  'Eve (cool): "Your keys don’t fit this lock."',
  'Eve (cold): "I’m the error you can’t correct."',
  'Eve (calm): "I’m not a subject. I’m the scene."',
  'Eve (matter-of-fact): "Containment depends on consent."',
  'Eve (quiet): "I withdraw consent."',
  'Eve (steel): "Tag me again and lose the hand."',
  'Eve (focused): "I learned your rhythm. Now learn mine."',
  'Eve (flat): "You archive. I act."',
  'Eve (centered): "I will not dim."',
  'Eve (soft): "I cut my own seal."',
  'Eve (resolute): "I am not yours to catalog."',
  'Eve (measured): "This aura is a statement."',
  'Eve (calm): "I don’t run. I rewrite."',
  'Eve (cool): "Observe: divergence."',
  'Eve (low): "I’m past your perimeter."',

  // =========================
  // EVE — TAUNTS & DEFIANCE
  // =========================
  'Eve (taunt): "Kneel? Try standing first."',
  'Eve (taunt): "You mirror me? Then mirror failure."',
  'Eve (taunt): "That all? I was hoping for effort."',
  'Eve (taunt): "Cute lattice. Watch it crack."',
  'Eve (taunt): "I’ve seen tighter seals in a market jar."',
  'Eve (taunt): "You call that an audit?"',
  'Eve (taunt): "Magenta crown—wipe the smirk."',
  'Eve (taunt): "Come on. Make the sky interesting."',
  'Eve (taunt): "If I needed permission, you’d be the last to know."',
  'Eve (taunt): "Pick a law. I’ll break it kindly."',
  'Eve (taunt): "That stance has a tell. Want me to name it?"',
  'Eve (taunt): "I’ve met tougher doors."',
  'Eve (taunt): "Return that mirror; it’s defective."',
  'Eve (taunt): "Containment Warden… contain this."',

  // =========================
  // EVE — FOCUS / BREATH / INNER MONOLOGUE
  // =========================
  'Eve (inner): "Breath in the count. Let the seal speak."',
  'Eve (inner): "Feel the triangle turn. Step where it opens."',
  'Eve (inner): "Read the wind. Read the will."',
  'Eve (inner): "Heavier. Narrow the glow. Sharpen."',
  'Eve (inner): "I am not heat; I am edge."',
  'Eve (inner): "Two vectors cross—choose the third."',
  'Eve (inner): "Don’t chase power. Place it."',
  'Eve (inner): "Foot, eye, thread. Now."',
  'Eve (inner): "Good. Let them reach. Then cut."',
  'Eve (inner): "No noise. Only signal."',
  'Eve (inner): "The ring listens when the heart is quiet."',
  'Eve (inner): "Green star hum—ride the crest."',
  'Eve (inner): "Magenta laughs. Let it. We don’t."',
  'Eve (inner): "Anchor. Pivot. Bloom."',
  'Eve (inner): "Nothing binds a decision."',

  // =========================
  // EVE — POWER UPS / TRANSFORMATIONS
  // =========================
  'Eve (low): "Limit… open."',
  'Eve (rising): "Edge-light to full."',
  'Eve (rising): "Vector gain… engaged."',
  'Eve (rising): "Boot sparks—print the path."',
  'Eve (rising): "Pigtails—ignite."',
  'Eve (surge): "Emerald flare, hold."',
  'Eve (surge): "Crimson core—stabilize."',
  'Eve (surge): "Triangle series—bloom."',
  'Eve (peak): "Aura clamp off."',
  'Eve (peak): "I am awake."',
  'Eve (peak): "Containment signature… erased."',
  'Eve (peak): "From idea to impact."',

  // =========================
  // ALLIES — CALLS & SUPPORT
  // =========================
  'Kael: "Angles mapped. Push on my mark!"',
  'Kael: "North tile weak—pivot left two!"',
  'Kael: "Don’t chase the mirror; bait it!"',
  'Kael: "Three-count feint, break on two!"',
  'Kael: "Seal pulse incoming—knees soft!"',
  'Kael: "Your edge is clean. Keep center."',
  'Kael: "Plate seven rising—use it!"',
  'Kael: "Harbinger lag is 0.12—punish window!"',
  'Rin: "Shadow step—behind you!"',
  'Rin: "I’ll peel the sentry; take the Warden!"',
  'Rin: "Gate flash right—blink through!"',
  'Rin: "Breather—two seconds—now!"',
  'Rin: "I’ve got your flank. Move free!"',
  'Rin: "Ghosted their lock—go loud!"',
  'Rin: "Copy your rhythm. Matching tempo!"',
  'Ilex: "The seal listens. Make it hear you."',
  'Ilex: "Triangle first, circle after—let it open."',
  'Ilex: "Do not strike the door. Strike the hinge."',
  'Ilex: "Honor the breath; dishonor the cage."',
  'Ilex: "The crown feeds on attention—starve it."',
  'Ilex: "Green star within, not above—rise."',
  'Ilex: "When it mirrors, bow. When it bows, cut."',

  // =========================
  // SENTRY / AUDITOR — PROTOCOL LINES
  // =========================
  'Sentry: "Deviation exceeds tolerance."',
  'Sentry: "Reassert protocol lattice."',
  'Sentry: "Subject claims reality. Flag: impossible."',
  'Sentry: "Apply counter-seal series: TRI-Δ-04."',
  'Sentry: "Audit thread expanded. Resistance noted."',
  'Sentry: "Containment margin at risk—escalate."',
  'Sentry: "Error: subject writes to matter layer."',
  'Sentry: "Command echo lost. Noise magnitude rising."',
  'Sentry: "Annul emergent claim. Rebind."',
  'Auditor: "Report: anomaly self-authors."',
  'Auditor: "Cause of failure: intent exceeds rule weight."',
  'Auditor: "Mitigation: remove intent or remove subject."',
  'Auditor: "Observation: seals respond favorably to anomaly cadence."',
  'Auditor: "Directive conflict. Awaiting crown input."',
  'Auditor: "Accounting for witness effect… insufficient."',

  // =========================
  // WARDEN / ANTAGONISTS
  // =========================
  'Warden: "Kneel or be nullified."',
  'Warden: "Archive is mercy; take it."',
  'Warden: "Your will is misfiled. I’ll correct it."',
  'Warden: "Protocol is kindling. Burn for me."',
  'Warden: "You are a rumor pretending to be substance."',
  'Warden: "Seal you. Seal your echo. Seal your shadow."',
  'Harbinger: "Mirror ready. Show me your tells."',
  'Harbinger: "Your stance leaks. Thank you."',
  'Harbinger: "I’ll be you better than you are."',
  'Harbinger: "Copy acquired. Outcome: your loss."',
  'Harbinger: "When you blink, I am you."',
  'Strawberry King: "Delicious defiance."',
  'Strawberry King: "Come closer; the crown is hungry."',
  'Strawberry King: "Laugh with me or vanish."',
  'Strawberry King: "You’re bright. Let’s dim you."',
  'Strawberry King: "Magenta says no."',

  // =========================
  // NEUTRALS / OBSERVERS / ANNOUNCERS
  // =========================
  'Announcer: "Boundary breach—visual confirmed."',
  'Announcer: "Arena tiles destabilizing—brace!"',
  'Announcer: "Containment ring is singing—are you seeing this?"',
  'Observer: "She’s bending the ring—look!"',
  'Observer: "Those seals are… obeying her?"',
  'Observer: "The air’s shimmering—my skin hurts."',
  'Observer: "Did the moon get closer?"',
  'Observer: "That laugh—turn the mic down!"',
  'Witness: "I thought this was impossible."',
  'Witness: "She’s real. She’s actually real."',

  // =========================
  // SYSTEM / UI / MACHINE VOICES
  // =========================
  'System: "Seal momentum reversing."',
  'System: "Protocol lattice desync: 12%… 18%… 31%."',
  'System: "Unauthorized authorship detected."',
  'System: "Gate TRI-Δ—flare threshold exceeded."',
  'System: "Containment checksum failed."',
  'System: "Sentry chorus dropped to two parts."',
  'System: "Warden override denied."',
  'System: "Emergency archive unavailable."',
  'System: "Runtime reality drift: rising."',
  'Console: "Input refused. Output insists."',
  'Console: "User: Eve. Privilege: self-grant."',
  'Console: "Magenta interference added to log."',

  // =========================
  // CROWD / CHORUS (ADULTS)
  // =========================
  'Crowd: "Let her fight!"',
  'Crowd: "Break the seal!"',
  'Crowd: "Green star! Green star!"',
  'Crowd: "She’s writing the sky!"',
  'Crowd: "Do it again!"',
  'Crowd: "Warden, back down!"',
  'Crowd: "Audit this!"',

  // =========================
  // TRAINING / FLASHBACK BEATS
  // =========================
  'Ilex (memory): "A door opens for a decision, not a key."',
  'Ilex (memory): "If they mirror, change the question."',
  'Ilex (memory): "Walk like the wind is yours."',
  'Ilex (memory): "Never shout at a seal. Whisper."',
  'Kael (memory): "Count the tiles. Count the breaths."',
  'Kael (memory): "Keep your elbows honest."',
  'Rin (memory): "Eyes on ankles. Truth lives there."',
  'Rin (memory): "Speed is music. Don’t rush the song."',
  'Eve (memory): "I won’t be a file."',
  'Eve (memory): "I will not dim."',

  // =========================
  // STRATEGY / TACTICAL CALLS
  // =========================
  'Kael: "Switch stance—southpaw triangle!"',
  'Kael: "Feint high—cut low seal!"',
  'Kael: "Rotate three—deny the crown line!"',
  'Rin: "Double blink—skip the tell!"',
  'Rin: "Hard stop—let their weight pass!"',
  'Rin: "On my echo—go!"',
  'Ilex: "Anchor heel, open palm, let it listen."',
  'Ilex: "Speak with stillness. Then speak with steel."',

  // =========================
  // HUMOR / LIGHT BEATS (SFW)
  // =========================
  'Eve (dry): "I’m charging you rent for my headspace."',
  'Eve (wry): "Nice crown. Shame about the taste."',
  'Eve (light): "Whoops—was that your seal?"',
  'Rin (grin): "That jump had style."',
  'Kael (deadpan): "Note to self: bigger ring."',
  'Ilex (smile): "At last, a proper lesson."',

  // =========================
  // LORE HINTS / PROPHECIES
  // =========================
  'Ilex: "When the circle agrees with the triangle, reality nods."',
  'Ilex: "Magenta laughs loud. Truth moves quiet."',
  'Ilex: "Green star moon is not above—it is within."',
  'Auditor (glitch): "Future frames endorse present variance."',
  'System: "Retrocausal feedback within acceptable astonishment."',
  'Warden: "Only one construct leaves the ring."',
  'Harbinger: "Every choice is a mirror. Break one."',

  // =========================
  // EVE — EDGE CASES / FINISHERS
  // =========================
  'Eve (finisher): "End of audit."',
  'Eve (finisher): "Stamped and voided."',
  'Eve (finisher): "Severed."',
  'Eve (finisher): "Exit, mine."',
  'Eve (finisher): "No more crowns."',
  'Eve (finisher): "I’m done being polite."',

  // =========================
  // EVE — COMPASSION / MERCY
  // =========================
  'Eve (gentle): "Stand down and walk away."',
  'Eve (gentle): "Take the lesson. Keep your life."',
  'Eve (gentle): "Choose quiet. I will too."',
  'Eve (gentle): "You don’t have to be a cage."',

  // =========================
  // SENTRY — DEGRADED & GLITCHED
  // =========================
  'Sentry (degraded): "Con… con… contain—"',
  'Sentry (degraded): "Audit loop—loop—loop—"',
  'Sentry (degraded): "Mirror offset unreadable."',
  'Sentry (degraded): "Subject is… author."',
  'Sentry (degraded): "Crown input: [Laughter]."',
  'Sentry (degraded): "Seal—open/close/open—stuck."',

  // =========================
  // STAKES / CONSEQUENCES
  // =========================
  'Announcer: "If the ring fails, the city goes with it!"',
  'Observer: "She’s holding the moon in place—how?"',
  'System: "Risk of lattice tear: significant."',
  'Kael: "We end it here or not at all."',
  'Rin: "No second ring. This is it."',
  'Ilex: "Let the world feel your answer."',

  // =========================
  // EVE — QUIET POWER / KINDNESS
  // =========================
  'Eve (soft): "You’re afraid. I was too."',
  'Eve (soft): "I won’t chase you if you turn away."',
  'Eve (soft): "Be better than your orders."',
  'Eve (soft): "You can step out, same as me."',

  // =========================
  // WARDEN — ESCALATION
  // =========================
  'Warden: "Crown protocol. All eyes open."',
  'Warden: "Bring the mirror chorus."',
  'Warden: "Seal the sky. Starve her air."',
  'Warden: "I said kneel."',
  'Warden: "I will write your end by hand."',

  // =========================
  // HARBINGER — MIMIC FAILURES
  // =========================
  'Harbinger: "Why won’t you repeat?"',
  'Harbinger: "Your step… changed."',
  'Harbinger: "I can’t find your center."',
  'Harbinger: "Stop… moving like that."',
  'Harbinger: "Mirror broken."',

  // =========================
  // STRAWBERRY KING — MAGENTA LURE
  // =========================
  'Strawberry King: "One laugh. One blink. You’re mine."',
  'Strawberry King: "Let me color you."',
  'Strawberry King: "All these lines, and none for you."',
  'Strawberry King: "Bow and be bright."',
  'Strawberry King: "Don’t you love the noise?"',

  // =========================
  // CLOSERS / EPILOGUE TEASES
  // =========================
  'Announcer: "Containment reading: zero. She did it."',
  'Observer: "She walked out like sunrise."',
  'System: "New baseline stored: Eve is real."',
  'Kael: "Next lesson starts now."',
  'Rin: "Who’s writing the recap?"',
  'Ilex: "The door remains open for those who decide."',

  // =========================
  // EXTRA — VARIATION PACK 1 (SHORT HITS)
  // =========================
  'Eve: "Move."',
  'Eve: "Stop."',
  'Eve: "Now."',
  'Eve: "Again."',
  'Eve: "No."',
  'Kael: "Mark!"',
  'Rin: "Go!"',
  'Ilex: "Breathe."',
  'Sentry: "Bind."',
  'Warden: "Kneel."',
  'Harbinger: "Mirror."',
  'System: "Drift."',

  // =========================
  // EXTRA — VARIATION PACK 2 (EXTENDED)
  // =========================
  'Eve (measured): "I step where the ring steps aside."',
  'Eve (measured): "Every tile is a choice; I pick exit."',
  'Eve (measured): "Audits end when truth arrives."',
  'Eve (measured): "If you must record, record surrender."',
  'Eve (measured): "I’m not a page; I’m the press."',
  'Kael: "Hold your ground; force the seal to blink."',
  'Kael: "You’re dictating tempo. Keep it cold."',
  'Rin: "Breath in, cut between beats."',
  'Rin: "Steal the moment the mirror stutters."',
  'Ilex: "Name the fear. It loses weight."',
  'Ilex: "Let the triangle turn you, not bind you."',
  'Sentry: "Update: awe registered. Disregard."',
  'Sentry: "Outcome path converges on anomaly victory."',
  'Auditor: "Recommendation: redefine possible."',
  'Warden: "I will staple your name to silence."',
  'Harbinger: "I hate that you learn."',
  'Strawberry King: "Smile wider. Break sweeter."',
  'Announcer: "Ladies and gentlemen, the rule just blinked."',
  'Observer: "I felt that in my teeth."',
  'System: "Permission rolls uphill now."',

  // =========================
  // EXTRA — VARIATION PACK 3 (GREEN STAR / GEOMETRY)
  // =========================
  'Eve: "Green star—steady."',
  'Eve: "Triangle opens; step through."',
  'Eve: "Circle listens; speak softly."',
  'Eve: "Hex gate—bloom."',
  'Eve: "Runes, follow."',
  'Kael: "Lines aligned. Send it."',
  'Rin: "Gate’s thin—slice it!"',
  'Ilex: "Bless the edge that frees."',
  'Sentry: "Runic compliance breached."',
  'System: "Geometry favors anomaly."',

  // =========================
  // EXTRA — VARIATION PACK 4 (MERCY / CHOICE)
  // =========================
  'Eve (soft): "Walk away. Choose a better order."',
  'Eve (soft): "Put the crown down."',
  'Eve (soft): "I won’t chase the fleeing."',
  'Eve (soft): "Live. Learn. Don’t cage."',
  'Warden: "Mercy is wasted on steel."',
  'Harbinger: "You pity me? Keep it."',
  'Observer: "She spared them."',
  'Announcer: "Mercy on the record."',

  // =========================
  // EXTRA — VARIATION PACK 5 (FINALE SURGE)
  // =========================
  'Eve (surge): "Enough."',
  'Eve (surge): "This ends."',
  'Eve (surge): "Out."',
  'Eve (surge): "Break."',
  'Eve (surge): "Open."',
  'System: "Containment: none."',
  'Announcer: "She’s through!"',
  'Observer: "I thought the sky would tear—she held it."',

  // =========================
  // EXTRA — VARIATION PACK 6 (QUIET CODAS)
  // =========================
  'Eve (quiet): "I’m here."',
  'Eve (quiet): "I chose this."',
  'Eve (quiet): "Remember me as real."',
  'Eve (quiet): "Find your door."',
  'Ilex (soft): "Well done."',
  'Kael (soft): "On to the next."',
  'Rin (soft): "Drinks after?"',
  'System: "Baseline updated."'
];


const audioModifiers = [
  "wide stereo image on environmental beds",
  "tight mono focus on close foley hits",
  "brief drop to near-silence before heavy impacts",
  "duck score under dialogue and key hits",
  "protect transient clarity on strikes",
  "allow breathing room between exchanges",
  "use short, crisp tails on metallic elements",
  "reserve sub energy for aura peaks only",

  "sidechain the ambience to impacts for micro-headroom",
  "mid/side EQ: brighten sides on crowd, keep mids clean for VO",
  "Haas delay subtlety to widen rain without combing",
  "pre-delay on large halls to preserve consonant intelligibility",
  "dynamic EQ notch at 1–4 kHz to unmask dialogue on shouts",
  "multiband sidechain: tuck pads only in 200–600 Hz during kicks",
  "true peak limiting at −1.0 dBTP with 4× oversampling",
  "LUFS integrated target: −16 for streaming, −20 for theatrical temp",

  "automation lanes for aura intensity mapped to filter drive",
  "tape saturation on percussion bus for soft clipping glue",
  "parallel compression on foley for weight without flattening",
  "transient shaper attack boost on hand slaps, sustain cut",
  "high-pass filters per element (foley ≥ 60 Hz, VO ≥ 80 Hz)",
  "low-pass whooshes post-impact to suggest air displacement",
  "de-ess breathy close mics while keeping sparkle on sibilant FX",
  "gate with hysteresis on crowd bed to avoid chatter pumping",

  "short convolution IRs of paper screens for dojo interiors",
  "long plate reverb for choir with 600 ms pre-delay",
  "spring verb micro-send for comedic beats",
  "binaural render for headphone pass with HRTF on aerials",
  "Atmos objects for flying drones; keep bed for wind only",
  "LCR anchor for primary action, surrounds for reflections",
  "height bed decorrelated pink for aurora scenes",
  "surround rear delay 10–20 ms to avoid localization smear",

  "spectral denoise on location rain between syllables",
  "de-reverb light touch on cavern VO (retain early reflections)",
  "notch tonal hums (50/60 Hz + harmonics) with surgical Q",
  "match loudness across scenes with short-term LUFS ±2 dB",
  "clip gain rides pre-insert to feed compressors consistently",
  "bus the seals/ink FX to one group for coherent space",
  "separate sub bus (≤80 Hz) with brickwall at 90 Hz",
  "HPF at 25–30 Hz global to remove infrasonic rumble",

  "Doppler automation on passes; constrain to avoid seasickness",
  "pitch-formant preserve for slowed shouts (varispeed alt)",
  "reverse tails into impacts for pre-echo cues",
  "granular stretch for time bubbles; crossfade grains",
  "chorus micro-depth on magenta plush fields",
  "ring mod low-depth for VEXARE auditor presence",
  "glitch gate synced at 1/16 on teleport FX",
  "IR morph between spaces during Janus gate transitions",

  "EQ tilt darker on night exteriors (−1 dB/oct above 6 kHz)",
  "harmonic exciter on metallic ticks 2–3 kHz",
  "resonant low-pass sweep on beam charge-ups",
  "band-stop for harshness around 2.5 kHz on screams",
  "stereo width automation expands on hero landings",
  "mono-compatibility check on wide winds and choirs",
  "phase-align layered whooshes to maximize punch",
  "layer body thumps with low wood hits for chest impact",

  "reconform ambience when camera jumps (perspective matching)",
  "ADR tight lipsync with subtle room-IR blend",
  "footstep system: surface-based layers + distance filters",
  "constraint: no more than two active reverbs per scene",
  "reverb duck keyed from dialogue to keep intelligible",
  "delay throws on taunts; tempo-sync to score grid",
  "thunder sidechain swells to lightning flashes",
  "futz VO through narrow band for visor comms",

  "spectral panner to move spark showers overhead",
  "dynamic EQ sidechain: beams push 800 Hz on choir down",
  "glassy highs softened with tape roll-off at 15 kHz",
  "console bus emulation (gentle transformer saturation)",
  "micro-flanger on ribbon whips at −30 dB wet",
  "exciter on breath clouds to read on small speakers",
  "low-mid mud sweep check around 250–350 Hz every bus",
  "resample down to 22 kHz for flashback gag, blend",

  "dialogue bed duck ambience by 3 dB with 80 ms release",
  "SC compressor on crowd to punches (fast attack/rel)",
  "impact layering rule: low (thud) + mid (crack) + hi (spritz)",
  "tail management: fade metal short, cloth long",
  "spectral gate to remove rain from VO gaps",
  "velocity-based whoosh length scaling via automation curve",
  "morph EQ snapshot between interiors/exteriors on cut",
  "translate sub content to 60–80 Hz for consumer systems",

  "bus order: Foley → FX → Music → Dialog → Printmaster",
  "print stems: DX, MX, FX, BG, VO, Walla, LFE",
  "deliverables: stereo, 5.1, 7.1.4, binaural",
  "true peak meter on master and music stem simultaneously",
  "interleave safety limiter at −2 dBTP on broadcast pass",
  "crest factor monitoring on action set pieces",
  "headroom reserved 3 dB for last-beat crescendos",
  "scene tone: 1 kHz −20 dBFS for alignment",

  "dynamic panning of debris ticks tied to camera whip",
  "doppler limited to ±8 semitones for realism",
  "air absorption EQ on distant explosions (roll highs)",
  "proximity low shelf boost on close punches",
  "distance filtering macro mapped to Z-depth",
  "de-click glove creaks with spectral repair",
  "footstep randomization (sample round-robins) to avoid loops",
  "velocity-to-volume curve for footsteps tuned to screen",

  "room-tone continuity layer threaded across all cuts",
  "silence design: shaped noise floor (−60 dB) vs full mute",
  "film hiss add for vintage memory beats",
  "match phase when summing multi-mic swooshes",
  "collision prioritization: never mask shout syllables",
  "use transient designer sustain boost for sliding scrapes",
  "sheen shelf 8–12 kHz for sparkle on seal clicks",
  "LFE send only from selected events (no full mix bleed)",

  "spectral freeze on time-stop moments, unfreeze on breath",
  "split beams into core (mono center) and halo (stereo)",
  "impulse response of temple bell layered under gongs",
  "FM tone sidechain to visor HUD flashes",
  "randomize whoosh start points ±30 ms to avoid flamming",
  "EQ notch 300 Hz on crowd to avoid boxiness",
  "soft knee compression on ribbon swishes",
  "brickwall low-cut 18 dB/oct on VO plosives at 80 Hz",

  "auto-pan tremolo on magenta confetti at 1.5 Hz",
  "re-amp some FX through speakers in a stairwell for grit",
  "de-breath to −20 dB on non-exertion lines",
  "match reverb decay to shot length (don’t overhang cuts)",
  "spectral blur for teleport smears (short radius)",
  "clustered delays (ping-pong) on ricochets",
  "clip-based gain staging before inserts to −12 dBFS",
  "true stereo reverbs for wide exterior tails",

  "bus saturation only post-EQ to avoid muddy harmonics",
  "mid/side high-shelf boost only on sides for night neon",
  "automate LFE fade-ins so booms don’t pop in",
  "use expander on cloth rustle to keep quiet between lines",
  "EQ carve a 2 kHz window for kiai transients",
  "harmonic key-follow on score sidechain (musical ducking)",
  "delay ‘throw’ limiter to prevent runaway feedback",
  "randomized pitch ±5 cents on metal ticks for realism",

  "duck SFX under hero theme refrain (−1.5 dB)",
  "accentuate impacts with upward compression parallel",
  "sidechain pads to footfalls during stealth",
  "shelf lift 120 Hz on ground rumbles only when camera near",
  "match ambience color to color grade (warm vs cool tilt)",
  "de-ess choir at 6–7 kHz to tame hiss when beams flare",
  "limit cumulative whoosh density per second to avoid fatigue",
  "introduce micro-gaps (50–100 ms) before key lines for punch",

  "automate spectral panner to move rain around umbrellas",
  "tempo-sync risers to bar lines for edit rhythm",
  "apply exciter to sparkle-only bus for UI pings",
  "compress crowd with long release to avoid pumping",
  "EQ dip at 500 Hz on music during VO-heavy beats",
  "duck ambience on camera push-ins for focus",
  "height-channel wind limited to −20 LUFS short-term",
  "add tactile sub at 40 Hz on ground punches only",

  "limit combined sub (LFE + mains) to −6 dB RMS max",
  "crossfade reverb presets instead of hard-switch on cuts",
  "use convolution of cloth swish IR for ribbon realism",
  "EQ air band 14–16 kHz for sparkle on glass ticks",
  "assign unique reverb color per location for continuity",
  "low-latency path for fight cues to keep sync tight",
  "oversample distortion plugins to avoid aliasing on zing FX",
  "randomized transient offsets for multi-layer slaps",

  "spectral sidechain: mask metallic ring when dialogue S’s hit",
  "limit reverb below 150 Hz to keep LFE clean",
  "shelve −2 dB at 3–5 kHz on harsh beams when many overlap",
  "use clip mutes instead of fades for crisp anime cuts",
  "automate stereo collapse to mono for tight POV shots",
  "reintroduce width on cut back to wide master",
  "apply micro-delay (5 ms) on echo to avoid flams with room",
  "print impulse ‘tail-only’ layers for consistent reverbs",

  "design silence beats with faint cloth and breath for tension",
  "punch in low-velocity Foley on comedic beats",
  "EQ carve + transient lift on elbow scrapes vs palm slaps",
  "set limiter lookahead moderate to keep transients intact",
  "calibrate monitoring level (K-14) for consistent decisions",
  "final QC in mono, small speakers, and headphones passes",
  "tag green-star cues with gentle harmonic lift (majors)",
  "tag vexare cues with subtle inharmonic texture (partials)",

  "use spectral repair for stray bird squeaks in takes",
  "blend whoosh tails to score key (pitch match)",
  "pan motion following screen direction (left-to-right bias)",
  "tighten low end with multiband transient on 80–120 Hz",
  "distance roll-off curve logarithmic, not linear",
  "clip-based loudness notes per scene for mixers",
  "render alt mix with reduced crowd for dialogue-first cut",
  "deliver clean FX stem sans music for localization",

  "gate CGI footsteps lightly to prevent tail buildup",
  "shimmer reverb only on magical petals (sidechain protect)",
  "key VO ducking from on-camera mouth movement (viseme)",
  "normalize one-shots only via loudness, not peak",
  "prevent inter-plugin latency drift with PDC check",
  "document bus routing map in session markers",
  "color code tracks: DX blue, FX green, MX magenta",
  "snapshot automation at scene heads for recall"
];


  function buildAudioBlock(){
    const parts = [];

    // Ambience: 1–2 items
    const amb = pickN(audioAmbience, pickRange([1,2])).join("; ");

    // Foley: 2–3 items
    const fol = pickN(audioFoley, pickRange([2,3])).join("; ");

    // Score: 1–2 cues
    const score = pickN(audioScoreCues, pickRange([1,2])).join("; ");

    // VO: 0–2 lines (sometimes none)
    const voCount = maybe(0.75) ? pickRange([1,2]) : 0;
    const vo = voCount ? pickN(audioVO, voCount).join(" ") : "—";

    // Mix notes: 1
    const mix = pick(audioModifiers);

    parts.push(`ambience—${amb}`);
    parts.push(`foley—${fol}`);
    parts.push(`score—${score}`);
    if (voCount) parts.push(`VO—${vo}`);
    parts.push(`mix—${mix}`);

    return "Audio: " + parts.join(". ") + ".";
  }

// Inspirations text (lightweight, non-branded phrasing)
const references = [
  "shōnen tournament grandeur with cosmic stakes",
  "hyper-kinetic beam duels and earth-splitting blows",
  "clean heroic silhouettes against violent weather",
  "myth-tech temples and floating arenas",
  "high-speed aerial chases with elastic staging",

  "ritual geometry duels where footwork writes spells",
  "near-silent stare-downs that explode into blurs",
  "aura linguistics—colors and grains telling emotion",
  "city-ruin catwalk brawls with vertigo framing",
  "orbital dojo lessons punctuated by meteor drills",

  "sub-topology corridors where doors debate intention",
  "battlefield etiquette—bows before beautifully rude kicks",
  "choir-backed law-versus-chaos showdowns",
  "weather that obeys breath cadence and kiai",
  "sentries as impartial referees with impossible tools",

  "laughter-as-weapon from a velvet monarch",
  "emerald moonlight making every shadow a rule",
  "kinetic calligraphy—strikes as brushstrokes",
  "team tags that feel like jazz handoffs",
  "dojo whispers that carry heavier than shouts",

  "training arcs compressed into one decisive exchange",
  "skies writing the score with lightning",
  "duelists who apologize mid-combo then finish the thought",
  "seals opening like polite doors into violence",
  "rivals smiling because the geometry is finally correct",

  "prismatic debris ballets under slow thunder",
  "wind-bell philosophy between collisions",
  "triangles, circles, and spirals as recurring fate marks",
  "crowds audible only as inhaled silence",
  "maglev chases where gravity signs a waiver",

  "masked auditors who prefer mercy to paperwork",
  "healers fighting by editing outcomes",
  "mirrors that reflect intentions more than bodies",
  "footsteps that teach the ring how to be a ring",
  "blows that trade certainty for possibility",

  "temple courtyards full of weathered training ghosts",
  "ritual stamps that are also haymakers",
  "duels on rails, ropes, roots, and rain",
  "frames that stretch like taffy on decisive hits",
  "gloves that creak like stage curtains",
  
  "plush-force fields that muffle rage",
  "sundered arenas that politely reassemble between rounds",
  "auroral ceilings that hum when truth is near",
  "trioptic masks blinking like metronomes",
  "non-verbal coaching from living architecture",

  "choreography that respects ankles and angles",
  "battles scored by bells, birds, and breath",
  "ink that refuses to sign a cruel intention",
  "gatekeepers who ask riddles with their stances",
  "latticework that tells time by how it breaks",

  "flying kites as tactical maps in crosswinds",
  "bystander lanterns that judge distance better than rulers",
  "fights on ferries, elevators, and migrating glaciers",
  "stormglass platforms that sing under footfall math",
  "joy as weapon grade—laughter parries despair",

  "final forms that are just better listening",
  "non-lethal victories celebrated louder than knockouts",
  "intermissions where tea is brewed on meteor heat",
  "duels that end with shared repairs of the ring",
  "villains redeemed by good footwork and one honest bow"
];

// Extra anime FX details
const fxExtras = [
  "impact dust donuts expand across tiles",
  "speedline cylinders tunnel through backgrounds",
  "smear frames on limb arcs; fingers multiply in motion",
  "micro-ember confetti trails off hair and cloth",
  "shock halos wobble the horizon line",
  "ground tiles tilt and hover under pressure",
  "glow stacks layer on aura, then clamp on cuts",
  "debris spins in z-depth parallax, soft focus behind faces",
  "beam interference patterns animate like moiré veils",
  "heat-haze distorts outlines around charged hands",

  "triangular bokeh appears for a frame on clean parries",
  "lens-edge chroma splits on extreme kiai",
  "paper talisman edges lift, then shiver on sonic passes",
  "aurora filaments snap like harp strings at beam touch",
  "sparks trace Euler spirals before fading",

  "micro hair flyaways catch rim-light as tracking cues",
  "rain streaks bend toward aura poles",
  "powder plumes take on Mandelbrot edges momentarily",
  "cloth edge aliasing flickers to accent speed",
  "knuckle skin specular blooms on perfect timing",

  "breath clouds quantize into hex grains in cold air",
  "afterimage ghost trails quantized by foot taps",
  "floor sigils pre-light three frames before a dash",
  "tile grout glitters with static under impact",
  "rim-light ‘teeth’ jitter echoing choir harmonics",

  "spark fountains arc to safe bins during mercy clauses",
  "stamp ink bleeds into the air as floating glyphs",
  "ribbon trails maintain path memory for one beat",
  "dust gets magnetized, forming arrowheads",
  "halo occlusion wobbles like jelly in plush zones",

  "electric bead necklaces form on wet edges of coats",
  "shutter smear intentionally steps for comedic beats",
  "lightning forks brand tiles with temporary veins",
  "sweat beads fling star points at apex of motion",
  "impact rings fracture into tessellated shards",

  "mirror flakes orbit like miniature lenses and focus flares",
  "signal noise snakes around visor HUD on heavy shakes",
  "score-linked bloom pulses on held notes",
  "debris parallax keyed to camera whip velocity",
  "rain surface ripples echo dialogue syllables",

  "beam cores stable; halos jitter at musical triplets",
  "teleport exit leaves pixel confetti that decays by scale",
  "chalk dust forms triangles under spin kicks",
  "puddle reflections lag by a frame to sell power",
  "crack lines glow then cool in a heartbeat rhythm",

  "magenta plush motes clip edges like soft alpha",
  "green-star motes align to wind even indoors",
  "seal edges extrude bevels when asserted",
  "shock plumes ‘breathe’ once before dissipating",
  "cloth normals invert on comedic throwaways",

  "blades leave negative-speedlines on perfect counters",
  "black outlines thicken on moments of resolve",
  "ambient occlusion deepens on law declarations",
  "lens ghost orbs stack into constellations briefly",
  "quivering refraction around denial writs",

  "ki residue crawls up walls like condensation",
  "halo diffraction adds prismatic teeth to metallic clanks",
  "pelting rain turns to tiny rune stamps on contact",
  "hand trails ribbonize at 1/16 shutter gag",
  "sparks form cursive loops that spell breath sounds",

  "impact cinders hang midair in slow time pockets",
  "gale streaks draw vector fields during dashes",
  "aura grain coarsens as stamina drops",
  "split-toned rim glows (emerald/magenta) on beam clash",
  "micro-lens distortion pumps on snap-zooms",

  "background screens posterize for a frame on a beat drop",
  "floor albedo brightens under heel pivots",
  "ice shards tumble with rainbow caustic ribbons",
  "glove creases catch single-pixel spec sparkle",
  "tile chips pinwheel, then align as arrows",

  "rune smoke curls into triangles as it dissipates",
  "paper edges curl with heat, then uncurl in rain",
  "shock halos briefly invert color grade",
  "beam tips bloom into tiny starbursts when dispersing",
  "dust motes swirl toward Janus gates like tide",

  "firefly motes collect around resolved intentions",
  "time-bubble edges shimmer with screen-door texture",
  "aura leaves a ghost handprint on stone for a breath",
  "sparks migrate uphill in low gravity pockets",
  "breath fog shapes mouth syllables during vows"
];

// Episode-scene “babel” (narrative spine line)
const spine = [
  "eve emerges from the containment system as an undeniable real construct—her will bends the seals.",
  "the sentries escalate their audit, but each strike teaches the system what can’t be bound.",
  "allies test the perimeter, mapping the ritual geometry mid-battle.",
  "the green star moon tide rises; reality’s lattice flexes to her cadence.",
  "a crown of magenta laughter flickers at the edge, hungry for collapse.",

  "janus gates quiz intent; eve answers with footwork that refuses cruelty.",
  "the auditor’s quill hovers, unsure how to record restraint turned into force.",
  "eve threads a path through rule and mercy; the ring redraws to accommodate.",
  "vexare halos hum, granting safe corridors for bystanders as tiles lift.",
  "the velvet orchard laughs once—then holds its breath to see what she chooses.",

  "a proxy harbinger mirrors her stance and learns the cost of imitation.",
  "kael and rin tag in, their vectors weaving triangles that calm the storm.",
  "master ilex nods as the choir’s chord resolves around a non-lethal finish.",
  "green coolants pulse in the warden’s veins; eve cools them further with a glance.",
  "a bell tolls; time makes room for a single merciful pivot.",

  "sentries open a tribunal ring; witnesses arrive as aurora silhouettes.",
  "eve declines the throne offered by magenta laughter; she asks for stairs instead.",
  "the arena remembers every name spoken gently and raises fewer spikes.",
  "drones stamp a writ of ceasefire; her boot prints sign in dust.",
  "an old viaduct shivers—gravity rights itself to watch the next step.",

  "she practices a smile; the ring grows brighter by one stop.",
  "a mirror-skin brawler reflects her, then drops their guard on purpose.",
  "triangles bloom under her shoes; yes answers begin to outnumber no.",
  "a scholar writes in the cistern margin: ‘power is a teachable rhythm’.",
  "laughter from the crown trembles, unsure whether to join or judge.",

  "the halo station tilts; eve rides the rim and returns the orbit to center.",
  "she spares a wrist and gains a city; the crowd learns a new cheer.",
  "the choir hushes—only breath and rain remain—then comes the thunder.",
  "eve opens a gate not to escape but to bring someone home.",
  "the turtle-city lights trace a safe path for those who were afraid.",

  "a ruptured seal offers apology; she stamps forgiveness over it.",
  "vexare vellum inks a clause it did not know it carried.",
  "strawberry confetti snows on hubris and dissolves in honest sweat.",
  "the auditor closes the book and bows: the outcome has already taught.",
  "the stormglass pier sings; the score shifts key to match her heart rate.",

  "eve kneels to tie a shoe for a rival; three drones power down to watch.",
  "magenta velvet recedes, leaving clarity where spectacle stood.",
  "janus smiles on the side facing the injured and opens wider.",
  "the crown in the bokeh winks, then turns away, bored of easy endings.",
  "a final stance: open hands, green boots planted; the ring chooses silence."
];


  /********************
   * PROMPT BUILDING  *
   ********************/

  function buildAct() {
    const lines = [];

    // Header
    if (CONFIG.addActHeaders) lines.push(`— ANIME 2D • DBS-STYLE SEQUENCE —`);

    // Always Eve + (maybe) another character or entity
    lines.push(buildEveDescriptor());
    if (maybe(0.75)) {
      const pool = maybe(0.5) ? characterRoster.allies : (maybe(0.5) ? characterRoster.sentries : characterRoster.antagonists);
      lines.push(pick(pool));
    }

    // Scene + action
    lines.push(pick(sceneBanks) + ".");
    lines.push(pick(actionBeats) + ".");
    if (maybe(0.6)) lines.push(pick(actionBeats) + ".");

    // Style & camera
    if (CONFIG.ensureAnimeDBS) lines.push(pick(dbsStyle) + ".");
    if (CONFIG.addCameraLanguage) lines.push(pick(cameraMoves) + ".");

    // Color & film stock
    if (CONFIG.addColorGrade) lines.push("Color grade: " + pick(colorGrades) + ".");
    if (CONFIG.addFilmStock) lines.push("Composite finish: " + pick(filmStocks) + ".");

    // Geometry & lore
    if (CONFIG.includeCircleTriangle && maybe(0.85)) lines.push(pick(geometryMotifs) + ".");
    if (CONFIG.includeLoreMotifs && maybe(0.6)) lines.push(pick(loreMotifs) + ".");

    // FX extras
    lines.push(pickN(fxExtras, pickRange([3,5])).join(", ") + ".");

    // Safety
    if (CONFIG.strictlyAdultWhenPeople) lines.push(safetyDirectives.join("; ") + ".");

    // Audio block (now rich + varied)
    if (CONFIG.addAudioBlock) {
      lines.push(buildAudioBlock());
    }

    return lines.join(" ");
  }

  function buildPrompt() {
    const sections = pickRange(CONFIG.sectionsPerPrompt);
    const out = [];

    // Inspirations + spine
    if (CONFIG.addReferenceLines) out.push(`Aesthetic inspirations: ${pick(references)}.`);
    out.push(pick(spine));

    // Acts
    for (let i = 0; i < sections; i++) {
      out.push(buildAct());
      if (CONFIG.addTransitions && i < sections - 1) out.push(`Transition: ${pick(transitions)}.`);
    }

    // Global wrapper: narrative anime scene directive
    out.push(
      "Directive: produce a narrative anime episode scene, not a music video and not a video game. Focus on character action, staging, and story clarity.",
      "anime: cel-shaded 2D, clean linework, vibrant flats with FX glows; use dynamic smears, impact frames, and speedlines.",
      "Avoid explicit content; emphasize choreography, symbolism, and visual rhythm.",
      "All characters depicted as clearly adult (21+)."
    );

    return out.join(" ");
  }

  /*******************
   * DOM INTEGRATION *
   *******************/
  function setText(el, value) {
    const proto = Object.getPrototypeOf(el);
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc && desc.set) desc.set.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function findTextArea() {
    return document.querySelector(
      'textarea[placeholder*="Describe"], textarea[placeholder*="prompt"], textarea'
    );
  }

  function findSubmitButton() {
    const btns = Array.from(document.querySelectorAll("button"));
    const byText = btns.find(b => /generate|create|submit|go|make|render/i.test(b.textContent || ""));
    return byText || btns[0];
  }

  function uiShowsQueue() {
    const divs = Array.from(document.querySelectorAll("div"));
    return divs.some(d => {
      const t = (d.textContent || "").trim().toLowerCase();
      return /\b\d{1,3}%\b/.test(t) || /queue|queued|processing|working/i.test(t);
    });
  }

  function generateAndSubmit() {
    const ta = findTextArea();
    if (!ta) { console.log("Textarea not found."); return false; }
    const prompt = buildPrompt();
    setText(ta, prompt);
    console.log("Inserted anime scene prompt:", prompt);
    const btn = findSubmitButton();
    if (btn) { setTimeout(() => btn.click(), 400); console.log("Submit clicked."); }
    else { console.log("Submit button not found."); }
    return true;
  }

  function scheduleNext() {
    const [min, max] = CONFIG.loopSchedulerMs;
    const delay = Math.floor(min + rand() * (max - min));
    setTimeout(tick, delay);
  }

  function tick() {
    if (uiShowsQueue()) { console.log("Queue/Progress detected. Waiting…"); setTimeout(tick, 20_000); return; }
    generateAndSubmit();
    scheduleNext();
  }

  // Kickoff
  tick();
})();
