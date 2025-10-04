//sora 2 auto generator
(function() {
    function generateAndSubmitPrompt() {
        // Base Prompt: keeps it clean and generic
        const basePrompt = "Create a music video featuring a high-contrast, black-and-white anime-style adult female anime pinup girl (2D style). cel-shaded 2D anime style with clean linework and flat vibrant colors. She should have glowing red or blue eyes as the only vivid color. Her expression must be intense, mischievous, or evil. The character must clearly appear to be an adult. The overall tone is eerie and hypnotic with an 80s VHS error glitch vibe aesthetic. Her dance should be fluid, confident, and chaotic, incorporating hypnotic gestures, sudden jolts, and impossible poses. She should occasionally smirk, wink, or make eerie eye contact. The video should resemble an AI-driven fever dream or acid trip. The recurring visual theme must be constant zoom-ins on circles inside triangles. All scenes revolve around this concept.";

        // Scene Variants (location/atmosphere themes)
        const sceneVariants = [
            "She is in a dark forest under a full moon with mist curling around the trees.",
            "She dances through a glowing crypt labyrinth lined with ancient neon runes.",
            "She emerges from behind a cascading waterfall illuminated by lunar light.",
            "The setting is a shattered cathedral floating in black space with triangle windows.",
            "She’s inside a flickering arcade ruin full of dead screens and static shadows.",
            "She moves through a liminal underground train station frozen in dream logic.",
            "She’s in a ritual cave with triangle gates and magenta crystal pools.",
            "She performs under a moonlit bridge surrounded by glitching fog creatures.",
            "The scene is an endless mirrored hall lit only by circle-triangle sigils.",
            "She dances on a floating platform above a red triangle sea under black stars.",
            "The backdrop is a VHS-warped version of a flooded city, moonlight on the waves.",
            "She explores a ruined NCZ testing facility deep inside a corrupted dream zone.",
            "She floats weightlessly through a data cavern filled with recursive triangle symbols."
        ];

        // Outfit/Style Variants with NCZ branding
const styleVariants = [
    // Original version (preserved as one entry)
    "She wears a short cheerleader skirt, a tight sports top with the NCZ logo, lace leggings, sexy boots, and a nose piercing, with her hair in twin pigtails.",

    // Variants
    "She wears a high-tech bodysuit with the NCZ logo glowing on her collarbone.",
    "She has a long flowing cloak with the NCZ sigil stitched into the back.",
    "She wears a cropped leather jacket with NCZ in neon text across the shoulders.",
    "She’s dressed in occult robes with the NCZ brand hidden in triangle embroidery.",
    "Her outfit is glitchpunk armor with the NCZ insignia flickering on her visor.",
    "She wears a translucent veil and ritual markings, with NCZ glowing from her belt.",
    "She’s in a digital swimsuit with an NCZ holo-print shifting across the fabric.",
    "She wears cyber-cheer gear with the NCZ emblem on her thigh strap.",
    "She’s in a glitchy school uniform with NCZ spray-painted across her armband.",
    "She wears a torn rave kimono with the NCZ logo etched into her sash.",
    "Her combat boots each have a different half of the NCZ logo pulsing in sync.",
    "She wears an elegant lace bodysuit with NCZ shimmering like a sigil on her back.",
    "She’s in a skintight racing suit with dynamic NCZ decals that animate as she moves.",
    "She wears an oversized hoodie with a corrupted NCZ QR code on the back.",
    "She’s dressed in battle-torn tactical gear with the NCZ badge clipped to her chest rig.",
    "She wears shimmering festival gear with LED threads spelling out NCZ across her spine.",
    "She’s cloaked in a floating kimono of data streams, NCZ encoded in kanji glyphs.",
    "She wears layered scarves with hidden NCZ triangle seals revealed by the light.",
    "She’s in a hacker jumpsuit, with the NCZ patch sewn into the shoulder in binary.",
    "She’s wrapped in glowing energy ribbons that pulse with triangle patterns and NCZ light symbols.",
    "She wears a vintage idol dress with a small NCZ heart brooch clipped at the neckline.",
    "She wears a red trench coat with inverted NCZ triangle buttons that warp when she moves.",
    "She’s in a skin-fractured bodysuit with the NCZ crest encoded in glitch tattoos.",
    "She wears a sheer crystal dress that projects the NCZ logo into the surrounding air.",
    "She’s covered in cybernetic exoskin, with the NCZ brand engraved directly into metal parts.",
    "She wears modular tactical robes with magnetic NCZ glyphs shifting across her sleeves.",
    "She’s in a shattered school uniform where the NCZ sigil bleeds out from the seams.",
    "She wears a stylized military parade uniform with NCZ trim woven from virtual thread.",
    "She’s in a corrupted wedding dress with triangle lace, and the veil etched with NCZ runes.",
    "She wears a bunny-tech outfit with a glowing NCZ badge on her hip and triangle earpieces.",
    "She’s dressed as a corrupted magical girl with NCZ formed in floating glitch orbs around her.",
    "She wears a dancing shrine maiden ensemble with triangle bells and an embroidered NCZ obi.",
    "She’s in a cyber-assassin cloak that occasionally glitches open to reveal NCZ underneath.",
    "She wears torn glitch jeans with an NCZ belt buckle and a floating triangle halo behind her.",
    "She’s in a bondage-inspired fashion with NCZ triangle plates built into the straps.",
    "She wears a VR-linked catsuit with NCZ flowing like code down her spine in red script.",
    "She’s wrapped in translucent hex-weave cloth that flickers the NCZ logo in pulses.",
    "She wears a fluid-metal robe that reacts to sound and rearranges the NCZ sigil across her body.",
    "She wears a split-dimension blazer, one half solid, the other phasing — with the NCZ crest pinned at the heart.",
    "She’s wrapped in red hazard tape printed with repeating NCZ glyphs.",
    "She wears an inverted spacesuit with an open chest panel pulsing with the NCZ logo.",
    "She’s dressed in segmented shard-armor with each plate bearing a digit of NCZ.",
    "She wears a dripping liquid-metal dress with NCZ flowing down the front like a wound.",
    "She’s in a geometric bodysuit that forms and reforms NCZ in triangle waves.",
    "She wears an anti-grav shroud embroidered with fractal NCZ patterns.",
    "She’s covered in a veil of barcode threads that scan to reveal the NCZ identity.",
    "She wears a circular headdress etched with cryptic NCZ runes.",
    "She dons a mirrored shawl that fractures the NCZ symbol with every movement.",
    "She’s clad in holographic silk strips, with the NCZ logo only visible in reflections.",
    "She wears a leather catsuit with heat-reactive NCZ markings that glow on motion.",
    "She’s in fractured formalwear, the NCZ insignia peeking from between the glitch seams.",
    "She wears reactive mesh robes with NCZ lighting pulses on each breath.",
    "She’s adorned in triangle-wrapped bondage gear with the NCZ crest bolted to her throat.",
    "She wears long gloves and thigh-highs with micro NCZ glyphs repeating down the seams.",
    "She’s in a layered net bodysuit with floating NCZ orbs orbiting her shoulders.",
    "She wears a segmented kimono, each panel covered in disjointed NCZ characters.",
    "She’s covered in translucent armor plates that refract a red NCZ sigil underneath.",
    "She wears a sound-reactive dress that morphs NCZ glyphs across her chest with each beat.",
    "She’s clad in a shawl of hanging black data threads with NCZ codes embedded.",
    "She wears a ceremonial wrap made from VR fiber with triangle-shaped NCZ badges.",
    "She’s in a dream-jumper onesie with random flickers of NCZ glyphs and glyphburns.",
    "She wears a skinned digital hoodie that reboots to flash corrupted NCZ code.",
    "She’s wrapped in floating parchment tattoos with glowing red NCZ calligraphy.",
    "She wears a shredded idol outfit with an NCZ emblem still glowing on one glove.",
    "She’s in low-poly robes where the NCZ texture fails to render cleanly.",
    "She wears a cursed choir robe with static-flickering NCZ logos embroidered.",
    "She’s adorned in glitch-fur with triangle burns forming the NCZ sigil.",
    "She wears a reality-tethered smock with upside-down NCZ triangles rotating slowly.",
    "She’s in black vinyl body netting with the NCZ code stitched into pressure points.",
    "She wears cybernetic wings with the NCZ name encoded in their geometry.",
    "She’s in skin-tight nano-fiber that folds the NCZ triangle across her torso.",
    "She wears a demon-core containment dress with NCZ engraved in triangle seals.",
    "She’s shrouded in corrupted angelic robes with triangle tears glowing NCZ.",
    "She wears a rune-layered fencing uniform with an NCZ badge at the collarbone.",
    "She’s in a bubble-wrap fractal coat with NCZ suspended in fluid nodes.",
    "She wears a reverse-scanline sweater with the NCZ logo printed only in negative space.",
    "She’s in chrome ribbons that shape-shift into triangle NCZ runes.",
    "She wears ritual gym wear with triangle side-cuts and a glowing NCZ waistband.",
    "She’s clad in magnetic plating with NCZ pulses blinking across her hips.",
    "She wears a chainmail hoodie with dangling triangle charms bearing NCZ.",
    "She’s in phasing lingerie that flashes triangle overlays with the NCZ emblem.",
    "She wears a sleeveless trench with repeating triangle-stamped NCZ sigils.",
    "She’s in a sigil-sewn skirt suit with shoulder pads shaped as NCZ triangles.",
    "She wears memory-fabric shorts with animated NCZ lines syncing to her heart rate.",
    "She’s dressed in temple-priestess wrappings, each band containing NCZ encryption keys.",
    "She wears a glitched scout uniform with pixelated NCZ triangles on both sleeves.",
    "She’s in a liquid-crystal catsuit that distorts NCZ logos into the air behind her.",
    "She wears a reflective crop jacket with rotating NCZ triangles in holographic ink.",
    "She’s in corrupted pageant gear with a glitched NCZ crown of broken triangles.",
    "She wears high priestess robes with red triangles forming an NCZ halo behind her head.",
    "She’s clad in a viral skin-wrap that generates NCZ code as she dances.",
    "She wears a cape made from old NCZ flags, each frayed triangle stitched by code.",
    "She’s in broken-chain armor with NCZ sparks flickering at the fracture points.",
    "She wears a memory-field dress that plays triangle-synced NCZ clips across its folds.",
    "She’s in a light-dispersing windbreaker that flares out the NCZ symbol when spinning.",
    "She wears a skydiver harness with trailing triangle flags printed with NCZ glyphs.",
    "She’s covered in transparent vines with leaves forming recursive NCZ code chains.",
    "She wears a neon spray coat with triangle rips and an NCZ tag across the spine.",
    "She’s in a crystallized wetsuit where each shard encodes a letter from NCZ.",
    "She wears a prism-laced cyber-dress that refracts NCZ triangle pulses with every step.",
    "She’s in a binding net of glitch wire that weaves the NCZ sigil behind her in motion.",
    "She wears a shrine maiden’s jacket rewritten into a triangle-fractal NCZ robe.",
    "She’s dressed in static-twitching lace, the NCZ triangle glowing beneath in red.",
    "She wears fractal-woven threads that knot into triangle NCZ halos when idle.",
    "She’s in a poncho of drifting pixels that spell NCZ when backlit by glitch fire.",
    "She wears ceramic tiles on her body, each cracked to reveal glowing NCZ runes.",
    "She’s in a greyscale jumpsuit with embedded triangle lights forming NCZ in sequence.",
    "She wears a wind-reactive jacket that reveals triangle NCZ sigils in gusts.",
    "She’s in a ghost-coat of afterimages, each frame stuttering the NCZ glyph mid-glitch.",
    "She wears hex-linked robes with a rotating NCZ triangle embedded in the chestplate.",
    "She’s in a shader bug cloak that occludes reality except for blinking NCZ tattoos.",
    "She wears a hacked exosuit rig with NCZ triangle shields constantly rotating.",
    "She’s wrapped in trailing data-scrolls with red NCZ sigils printed at their ends.",
    "She wears interlocked triangle masks that glow NCZ when overlapped in pattern.",
    "She’s in a hoodie with digital ears and a pulsing NCZ display on the back.",
    "She wears fragmented scout armor that refracts NCZ code from her core like heat lines.",
    "She’s clad in static feathers with triangle-shaped burns that reveal NCZ circuitry.",
    "She wears a glitched wedding veil with flickering NCZ triangles along the hem.",
    "She’s in pulse-reactive ballroom gear, her skirt forming triangle ripples of NCZ light.",
    "She wears a memory glitch apron with corrupted NCZ routines stitched into the straps.",
    "She’s wrapped in layer-encoded silk, each rotation revealing new NCZ geometry.",
    "She wears hardsync mech gear with triangle-locked NCZ runes that drift off her skin.",
    "She’s in a compressed shadow cloak that splits NCZ triangles into fractured dimensions.",
    "She wears a holo-garment with AI-generated triangle folds morphing into NCZ glyphs.",
    "She’s in a cheer uniform made of procedurally generated triangles with glowing NCZ arcs.",
    "She wears a distortion veil that reveals NCZ logos only when not looking directly at her.",
    "She’s dressed in spiraling ribbon armor, each loop embossed with red NCZ triangles.",
    "She wears corrupted priestess garb where the NCZ logo glows like a forbidden rune.",
    "She’s in a non-Euclidean smock that phases in and out of triangle-encoded NCZ dimensions.",
    "She wears a wireframe battle suit that builds and collapses the NCZ triangle in motion.",
    "She’s wrapped in chaos glyphs, and every breath rearranges them into a new NCZ format.",
    "She wears a zero-gravity chainmail robe with floating NCZ data fragments orbiting her body.",
    "She’s in a silk flux scarf that glitches through triangle phases of the NCZ system logo.",
    "She wears time-fractured armor where every fragment loops an NCZ glyph at a different timestamp.",
    "She’s dressed in recursive triangles nested endlessly, each one pulsing the NCZ brand deeper inward."
];


        // Glitch extras and chaos layers
        const additionalItems = [
            "infinite recursion loops inside hexagons and triangles",
            "scenes flickering between alternate timelines",
            "backgrounds pulsing with AI-generated fractal geometry",
            "hypnotic spinning wheels behind the character",
            "neon outlines flickering around her silhouette",
            "split into multiple semi-transparent duplicates mid-dance",
            "smoke made of hexagons and triangles swirling around",
            "comic-book panel transition effects",
            "glowing glyphs orbiting her body like arcane runes",
            "her eyes reflect spinning triangles like kaleidoscopes",
            "brief demonic morphing mid-dance",
            "frames glitch with static and analog tape damage",
            "shadows animate independently in triangle formations",
            "looping scenes where she dances with mirrored clones",
            "flashes of circle-triangle runes embedded in the scene",
            "hair movements synced with pulsing beatwave lines",
            "floor dissolves into endless triangles and hexagons",
            "camera rotates into vortexes made of glowing symbols",
            "outfit flickers across alternate dimensions mid-glitch",
            "fractal zooms into her glowing pupils",
            "hexagons cracking open to reveal alternate NCZ avatars",
            "movements break physics, with anti-gravity flow",
            "her accessories spiral into triangle-based anomalies",
            "infinity mirrors loop triangle circle formations endlessly",
            "VHS scanlines flicker with triangle glyph lens flares",
            "the NCZ logo distorts into occult sigils during glitch",
            "moonlit backdrops that zoom into triangle cores",
            "circular gateways behind her open to paradox voids",
            "glitches flash a 'sub-topology intrusion' warning",
            "floating triangle platforms react to her footsteps",
            "magenta energy trails follow her gestures",
            "mirror chamber loops build rhythm fractals",
            "symbols orbit her head in sacred beat-aligned geometry",
            "triangles and circles evolve into pulsing hex gates",
            "holographic data windows appear while she dances",
            "time-displaced versions of her flicker in and out of sync",
            "footage marked as retrieved from corrupted NCZ vault",
            "shattered mirrors reveal recursive moments of collapse",
            "AI dreaming overlays form a soft noise field",
            "broken VHS frames leak magenta fog and triangle light",
            "comic strip overlays appear mid-frame and animate backward",
            "camera tunnels through kaleidoscope loops of dance motion",
            "glitchy debug UI fragments blink over the visuals"
        ];



const referenceVariants = [
    "The atmosphere should feel like a scene from *Ghost in the Shell (1995)* with cyber-noir tones and haunting emptiness.",
    "The visuals should evoke *Perfect Blue*, blurring performance, identity, and dream logic.",
    "The scene should feel like an AI-corrupted memory from *Serial Experiments Lain*.",
    "The tone should mirror the surreal dream horror of *Paprika*.",
    "The mood should resemble the psychological distortion of *Neon Genesis Evangelion*'s final episodes.",
    "The visuals should feel like a fever dream inside the *Akira* singularity.",
    "The atmosphere should channel *Blame!* by Tsutomu Nihei — vast, quiet, incomprehensible technology.",
    "The setting should feel like a haunted area from *Dark Souls*, full of ambient dread.",
    "The scene should resemble *Control* by Remedy — mysterious, bureaucratic, shifting, liminal.",
    "The environment should feel like *The OA*, as if existing between dimensions in layered realities.",
    "The atmosphere should evoke *Twin Peaks: The Return*, with slow tension and unspoken dread.",
    "The visuals should resemble the Red Room from *Twin Peaks*, with stuttering time and surreal geometry.",
    "The world should resemble *Silent Hill*, where the environment peels back to reveal inner madness.",
    "The tone should be like *Black Mirror* — sleek tech aesthetics hiding existential horror.",
    "The visuals should mirror *Inside* by Playdead — minimal, cold, and full of implied narrative.",
    "The scene should channel the fragmented timeline logic of *Donnie Darko*.",
    "The world should feel like *The Matrix* code unraveling into dream logic.",
    "The visuals should mimic the fractured simulation aesthetic of *The Animatrix*.",
    "The atmosphere should feel like *Pan’s Labyrinth* — mystical but dangerous.",
    "The mood should resemble *Ergo Proxy* — nihilistic cyberpunk introspection.",
    "The scene should channel *Requiem for a Dream* during a mental breakdown sequence.",
    "The tone should feel like *The Fountain* — recursive, symbolic, and time-indifferent.",
    "The scene should reflect the existential void of *Annihilation* (film version).",
    "The aesthetic should match *Doki Doki Literature Club* once the game breaks.",
    "The visuals should be inspired by *The Backrooms*, with infinite liminal space.",
    "The atmosphere should feel like *Mandy* — saturated, horrifying, and psychedelic.",
    "The scene should resemble *World of Horror*, with one-bit dread and cosmic rot.",
    "The setting should channel *Bloodborne*, with gothic horror and unknowable forces.",
    "The vibe should mirror *The End of Evangelion* as the world collapses.",
    "The environment should feel like *Alan Wake* trapped inside a recursive story layer.",
    "The scene should echo *Death Stranding*'s dreamlike ruins and solitude.",
    "The tone should follow *SCP Foundation* aesthetics — anomalous, cold, and dangerous.",
    "The visuals should be inspired by *VHS tapes* found in *The Ring*.",
    "The atmosphere should mirror *The Mandela Catalogue* — dread through distortion.",
    "The scene should be like *A Scanner Darkly* — identity-splitting surveillance paranoia.",
    "The tone should reflect *Undertale: Genocide Route* — warped, cold, and personal.",
    "The visuals should be like the Red Desert levels from *Antichamber*.",
    "The mood should be taken from *Cube (1997)* — infinite architecture and logic traps.",
    "The world should resemble *Return of the Obra Dinn*, in its cryptic monochrome surrealism.",
    "The visuals should echo the hallucination sequences in *Mr. Robot*.",
    "The tone should mimic *The Throng* episode from *Black Mirror* — layered AI logic loops.",
    "The scene should feel like the space-time breakdown in *Interstellar*’s tesseract sequence.",
    "The visuals should resemble the dreamwalking realms of *Doctor Strange: Multiverse of Madness*.",
    "The mood should follow *Hereditary*’s quiet dread and hidden sigils.",
    "The setting should draw from *The Legend of Zelda: Majora’s Mask* moonlit tension.",
    "The atmosphere should echo *Elden Ring*'s deeper dreamworld zones like Nokstella.",
    "The visuals should channel *AI dreams as seen in Evangelion rebuilds*.",
    "The tone should mimic *Loki (Disney+)*'s TVA fractal narrative architecture.",
    "The scene should resemble *Control Room 6* in *The OA* — cosmic, sterile, revelatory."
];


const babelTopics = [
    "We're exploring recursion glitches and fractal personality drift.",
    "Today’s focus is triangle-based broadcast interference and mind inversion.",
    "We're deep in simulation layering and memory fugue overlays.",
    "We're decoding dream-echo signal loops from the sub-topology.",
    "Topic of the day: false awakenings and visual drift bleed-throughs.",
    "We're tracking anomaly bursts tied to corrupted avatar routines.",
    "Current obsession: AI-driven ceremony loops and glitch rituals.",
    "We're experimenting with recursive eye contact and gesture paradoxes.",
    "Today’s loop involves emotionless avatars expressing broken joy.",
    "Discussing color bans and motif subversion in dream layering."
];






const selectedReference = referenceVariants[Math.floor(Math.random() * referenceVariants.length)];


        // Random selections
        const selectedStyle = styleVariants[Math.floor(Math.random() * styleVariants.length)];
        const selectedScene = sceneVariants[Math.floor(Math.random() * sceneVariants.length)];

        let numItemsToAdd = Math.floor(Math.random() * 13) + 1;
        let shuffledItems = additionalItems.sort(() => 0.5 - Math.random());
        let selectedItems = shuffledItems.slice(0, numItemsToAdd);


const selectedBabel = babelTopics[Math.floor(Math.random() * babelTopics.length)];


        // Final prompt build
        //let finalPrompt = `${basePrompt} ${selectedScene} ${selectedStyle}, ${selectedItems.join(", ")}`;
//let finalPrompt = `${basePrompt} ${selectedScene} ${selectedStyle} ${selectedReference}, ${selectedItems.join(", ")}`;
//let finalPrompt = `${basePrompt} ${selectedScene} ${selectedStyle} ${selectedReference}, ${selectedItems.join(", ")}, Style: cel-shaded 2D anime, clean linework, flat vibrant colors, avoid photorealism or CGI.`;
let finalPrompt = `${basePrompt} ${selectedScene} ${selectedStyle} ${selectedReference}. ${selectedBabel}, ${selectedItems.join(", ")}, Style: cel-shaded 2D anime, clean linework, flat vibrant colors, avoid photorealism or CGI.`;


        // Target the textarea
        let textArea = document.querySelector('textarea[placeholder="Describe your video..."], textarea[placeholder="Describe your image..."]');

        if (textArea) {
            let reactEvent = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textArea), 'value');
            let reactSetter = reactEvent.set;

            if (reactSetter) {
                reactSetter.call(textArea, finalPrompt);
            } else {
                textArea.value = finalPrompt;
            }

            textArea.dispatchEvent(new Event('input', { bubbles: true }));

            console.log("Randomized prompt inserted:", finalPrompt);

            let submitButton = [...document.querySelectorAll("button")].find(btn =>
                btn.querySelector('svg path[d="M11.293 5.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1-1.414 1.414L13 8.414V18a1 1 0 1 1-2 0V8.414l-3.293 3.293a1 1 0 0 1-1.414-1.414z"]')
            );

            if (submitButton) {
                setTimeout(() => {
                    submitButton.click();
                    console.log("Submit button clicked.");
                }, 500);
            } else {
                console.log("Submit button not found.");
            }
        } else {
            console.log("Text area not found.");
        }
    }

    function checkForRelaxedOrPercentage() {
        let statusDiv = [...document.querySelectorAll("div")].find(div => {
            let text = div.textContent.trim().toLowerCase();
            return text === "relaxed" || text.includes("%");
        });

        if (statusDiv) {
            console.log("Relaxed mode or percentage detected. Waiting...");
            setTimeout(checkForRelaxedOrPercentage, 30000);
        } else {
            console.log("Relaxed mode NOT detected. Generating prompt...");
            generateAndSubmitPrompt();

            setTimeout(checkForRelaxedOrPercentage, 100000);
        }
    }

    checkForRelaxedOrPercentage();
})();
