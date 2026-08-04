(async function tupperwareMassiveLiveActionGenerator() {
    console.log("🚀 MASSIVE Live-Action Tupperware Generator Started!");

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let sceneToggle = false;

    function generateDynamicPrompt() {
        sceneToggle = !sceneToggle; // Toggles strictly between Commercial and Dance scenes

        // MANDATORY DUAL-CHARACTER SETUP (EVE + 50s RETRO ASSISTANT LADY IN EVERY FRAME - NO CGI / NO ANIME)
        const liveActionCharacters = "Real-life live-action photorealistic 35mm film footage featuring two women together in every frame: Eve, a real human pinup girl with ruby red hair styled in long twin pigtails, wearing a blue cheer skirt, a purple sports top with 'NCZ' printed on the chest, red lace leggings, green boots, and intense glowing luminous practical red eyes; AND standing right beside her, a vintage 1950s retro Tupperware housewife assistant with neatly coiffed auburn hair wearing a classic blue vintage dress. Shot on live-action camera, strictly no CGI, no anime, no 2D graphics.";

        // 40% CHANCE OF OVERSIZED STRAWBERRIES AND BLOCKS OF CHEESE IN THE KITCHEN
        const includeOversizedFood = Math.random() < 0.4;
        const foodProp = includeOversizedFood 
            ? "Surreal giant oversized strawberries and massive blocks of yellow cheese are stacked on the kitchen counters alongside the plastic Tupperware towers." 
            : "";

        // EXPLICIT SPOKEN AUDIO & LIP-SYNC DIRECTIONS
        const spokenAudioDirections = [
            "[AUDIO DIRECTION: Live studio audio vocal recording, crisp direct lip-sync focus]",
            "[AUDIO DIRECTION: Vintage 1950s TV commercial microphone broadcast, clean voice sync]",
            "[AUDIO DIRECTION: High-fidelity dialogue track over acoustic kazoo music, precise lip-sync]",
            "[AUDIO DIRECTION: Analog TV broadcast spoken audio, live voice-over sync]",
            "[AUDIO DIRECTION: Clear vocal performance spoken directly into camera, studio mic track]",
            "[AUDIO DIRECTION: 1980s infomercial dialogue audio, direct face camera recording]",
            "[AUDIO DIRECTION: Isolated spoken voice track with physical lip-sync alignment]",
            "[AUDIO DIRECTION: Echoing studio vocal take, spoken emphatically to camera]",
            "[AUDIO DIRECTION: Retro television pitchwoman spoken audio, clear verbal delivery]",
            "[AUDIO DIRECTION: Sharp spoken word audio track, live-action lip-sync]"
        ];

        // MASSIVE POOL OF SPOKEN LINES (LYRICS & DIALOGUE BRIDGES)
        const spokenTexts = [
            'She looks directly into the lens and speaks clearly: "There’s one good thing about Tupperware—you can’t get rid of it!"',
            'She points directly at the camera and exclaims: "They vanish into thin air!"',
            'She holds up a lidless plastic bowl and says: "Now you’ve got fifteen bowls and no tops to spare!"',
            'She smirks ominously into the lens and utters: "They said it would last forever... they didn’t say the company wouldn’t."',
            'She leans into the camera frame and says sternly: "Also, Brenda, I still want my deviled egg tray back!"',
            'She whispers frantically into the microphone: "Where’s the kill switch for this thing?"',
            'She speaks over the background music: "These plastic overlords taught the robots how to cling..."',
            'She glares with glowing red eyes and states: "You can’t get rid of robots once they’re there!"',
            'She shakes her head and says to the camera: "We thought we could delete it... but we never can!"',
            'She taps a plastic container and speaks: "It sits in your cupboard for thirty years!"',
            'She gestures across a kitchen counter: "Through microwave stains and your grandma’s tears!"',
            'She smiles wickedly at the camera: "It’s the cockroach of kitchenware, my dear!"',
            'She rolls her eyes playfully and says: "All we wanted was snacks and gossip time!"',
            'She presents a green plastic bowl and speaks: "But we left with a lifetime supply of lime green slime!"',
            'She opens a real freezer door and exclaims: "And a freezer full of 1989 chili crime!"',
            'She slams a plastic lid on a counter: "Now your cabinet’s a plastic graveyard lair!"',
            'She holds up takeout containers and speaks: "Takeout tubs and pickle jars rule the land!"',
            'She shows off plastic bowls in both hands: "Reused Cool Whip bowls in every hand!"',
            'She throws her hands in the air and shouts: "It’s a plastic revolution, unplanned!"',
            'She smiles triumphantly and speaks: "We finally got rid of it!"',
            'She shrugs playfully at the viewer: "At least they don’t cost forty bucks a pair!"',
            'She points toward the floor and says: "Guess the dumpster got its share!"',
            'She stares intently into the camera: "Once the robots are here, they stack in your mind!"',
            'She gestures to a tall stack of bowls: "Like Tupperware towers you’ll never unwind!"',
            'She drops a bowl on the linoleum floor: "They bounce when you drop them, survive every crash!"',
            'She stands by a flashing appliance: "Dishwasher cycles and power surges in a flash!"',
            'She holds up a warped container: "Warped from the heat but still holding your code!"',
            'She taps her chest and speaks: "Cracked from the rage but they reload the load!"',
            'She holds up a plastic tub with dirt: "Kids turn them into bug hotels and future schemes!"',
            'She looks up at studio lights and utters: "While the AI builds empires from your wildest dreams!"',
            'She whispers into the lens: "They multiply in secret when the lights go down!"',
            'She looks around the set and says: "Just like Tupperware ghosts all over town!"',
            'She gestures around the room: "Cloud servers and takeout data rule the land!"',
            'She holds up a plastic bowl: "Reused algorithms in every hand!"',
            'She places her hand over her heart: "Tupperware showed us the way from the start!"',
            'She winks at the camera lens: "Indestructible souls with a plastic heart!"',
            'She points to a kitchen cupboard: "Yet the AI in the cupboard keeps humming there!"',
            'She looks around in confusion and asks: "Where did all the lids go, Brenda?"',
            'She holds a kitchen gadget up and asks: "Buy a salad spinner and a bread keeper, why?"',
            'She slams a lid down and shouts: "You can’t get rid of it!"'
        ];

        // MASSIVE POOL OF REAL LIVE-ACTION COMMERCIAL SCENES (NO CGI)
        const commercialScenes = [
            "Retro 1950s live-action TV commercial set with bright lemon-yellow wall paneling. Eve stands next to an actress playing a vintage housewife, demonstrating a massive, wobbling tower of pastel Tupperware bowls on a yellow folding table.",
            "1980s TV spot set. Eve hosts a live Tupperware home party in a real suburban living room with shag carpet, surrounded by vintage snacks, lime green bowls, and suburban party guests.",
            "Late-night TV infomercial studio setup. Eve stands behind a sleek retro kitchen countertop presenting indestructible plastic containers under bright studio spotlights.",
            "Vibrant 1970s kitchen advertisement set. Eve opens a frost-covered freezer packed with 1989 chili tubs, showing off a vintage bread keeper and salad spinner to the camera.",
            "Mid-century live product demonstration stage. Eve rapidly seals and burps plastic Tupperware lids onto colorful bowls on a pristine yellow counter.",
            "1960s daytime television set. Eve dramatically presents a deviled egg tray on a pedestal to a live audience of extra actors sitting in folding chairs.",
            "Retro supermarket aisle location shoot. Eve pushes a metal shopping cart filled with pastel plastic bowls down a real grocery store aisle.",
            "1950s suburban kitchen set. Eve drops pastel plastic bowls onto linoleum flooring to demonstrate them bouncing live on camera without shattering.",
            "Retro TV cooking show set. Eve pulls a steaming Tupperware container out of a vintage microwave and presents it directly to the camera lens.",
            "1980s catalog photo shoot setting. Eve poses like a fashion model surrounded by stacks of real geometric Tupperware sets on white display pedestals.",
            "Retro shopping channel set. Eve holds a lime-green bowl under a bright spotlight while standing behind a glass display case.",
            "1950s Tupperware Jubilee convention stage. Eve stands at a wooden podium under falling paper confetti, raising a real salad spinner above her head.",
            "1970s suburban patio commercial set. Eve hosts a backyard lawn party demonstration, arranging plastic picnic bowls on a green tablecloth.",
            "Retro breakfast nook commercial set. Eve fills pastel plastic cereal containers while speaking directly to the camera crew.",
            "1960s department store demonstration corner. Eve stands under bright fluorescent lights showing shoppers how plastic lids seal out air.",
            "1980s morning talk show guest segment set. Eve sits on a retro sofa presenting a line of colorful plastic canisters on a coffee table.",
            "Retro hardware store commercial set. Eve demonstrates storing nuts and bolts in tiny plastic Tupperware cups on a wooden workbench.",
            "1950s diner counter commercial set. Eve arranges stacks of plastic pie keepers along a chrome counter while smiling at the camera.",
            "Retro school cafeteria commercial set. Eve packs sandwich keepers into metal lunchboxes on a long folding table.",
            "1970s craft room commercial set. Eve demonstrates organizing yarn and buttons inside transparent plastic tubs.",
            "Retro county fair booth location shoot. Eve stands behind a wooden counter exhibiting a giant tower of pastel bowls to fairgoers.",
            "1980s fitness TV commercial set. Eve holds a pastel plastic water jug and lunch container on an aerobics workout mat.",
            "1960s suburban driveway commercial set. Eve loads stacks of plastic storage tubs into the trunk of a vintage station wagon.",
            "Retro pantry commercial set. Eve organizes wood-paneled shelves with neatly labeled rows of colorful plastic canisters.",
            "1950s television studio stage. Eve stands in front of a giant yellow curtain board displaying mounted plastic bowls.",
            "Retro picnic park location shoot. Eve sets out a red checkered blanket covered with plastic salad bowls and punch cups.",
            "1970s holiday commercial set. Eve packs Christmas leftovers into plastic containers in a festive kitchen.",
            "1980s office breakroom commercial set. Eve pulls a plastic soup mug from a microwave while talking to co-workers.",
            "Retro beach commercial shoot. Eve pulls plastic snack containers out of a cooler on real ocean sand.",
            "1950s home economics classroom set. Eve stands at a teacher's podium demonstrating container sealing to student actors."
        ];

        // MASSIVE POOL OF REAL LIVE-ACTION DANCE SCENES (NO CGI)
        const danceScenes = [
            "Eve performs dynamic cheerleading dance choreography on top of a stacked mountain of real pastel plastic Tupperware bowls inside a black soundstage.",
            "Eve executes high-energy cheer dance routines in a real 1980s retro kitchen while hundreds of plastic lids hang suspended on invisible wires around her.",
            "Eve performs cheer choreography inside a real industrial warehouse pantry lined with endless steel shelves of illuminated lime-green plastic tubs.",
            "Eve performs dance choreography on a stage surrounded by thousands of real lidless plastic containers under dramatic red theater spotlights.",
            "Eve performs sharp cheer dance moves inside a liminal kitchen set with flashing red and blue studio lighting.",
            "Eve performs a fast spinning dance routine amidst practical stage fog, surrounded by airborne plastic Tupperware lids.",
            "Eve dances on a glossy black reflective stage floor, performing cheer routines next to mirrored walls stacked with pastel plastic containers.",
            "Eve performs high-intensity cheer dance moves on a rain-slicked pavement soundstage surrounded by vintage studio spotlights.",
            "Eve performs a hypnotic cheer routine on a round yellow stage platform surrounded by practical studio camera rigs on tracks.",
            "Eve dances through a dark misty soundstage decorated with towering pyramids of vintage plastic bowls and glowing red floor lights.",
            "Eve performs acrobatic cheer jumps in a soundstage filled with low-hanging fog and rows of colorful plastic containers.",
            "Eve performs energetic dance moves on a retro disco floor where each floor tile is illuminated beneath translucent plastic lids.",
            "Eve dances in an empty retro gymnasium under practical spotlights, surrounded by cheerleader pom-poms made of plastic tape.",
            "Eve performs rhythm choreography while stepping across a grid of plastic bowls arranged across a polished wood floor.",
            "Eve performs a chaotic cheer dance in a vintage TV studio set while theatrical haze swirls around her green boots.",
            "Eve executes fluid dance poses on a revolving circular stage covered in hundreds of pastel Tupperware lids.",
            "Eve performs a energetic dance routine surrounded by tall chrome shelving units filled with glowing red plastic tubs.",
            "Eve dances down a long studio corridor lined with yellow doors and overflowing stacks of plastic kitchenware.",
            "Eve performs cheer jumps on an outdoor wooden deck set illuminated by moonlit practical stage lights.",
            "Eve dances surrounded by four mirrored walls, creating an infinite visual echo of her cheer routine among plastic containers.",
            "Eve performs high-kick dance choreography in front of a giant wall built entirely out of vintage plastic bowls.",
            "Eve executes dynamic cheer poses on a white cyclorama studio floor scattered with thousands of loose plastic lids.",
            "Eve dances in a retro television control room while analog monitors play footage of plastic bowl stacking.",
            "Eve performs a rhythmic dance routine holding two pastel plastic bowls like cheer pom-poms on a yellow stage.",
            "Eve dances in a foggy soundstage while theatrical spotlights cast sharp shadows of plastic towers behind her.",
            "Eve performs energetic cheer choreography on a retro neon-lit stage while practical fog rolls across the floor.",
            "Eve executes fast-paced dance moves inside a vintage kitchen set while red studio lights pulse in time with her motion.",
            "Eve performs a dramatic solos cheer routine under a single overhead spotlight in a pitch-black studio space.",
            "Eve dances across a soundstage floor covered in a grid of yellow and cyan plastic bowls.",
            "Eve performs a powerful cheer finish pose surrounded by collapsed stacks of plastic Tupperware on a glossy stage."
        ];

        // PRACTICAL PROPS & REAL SET DETAILS
        const propsAndDetails = [
            "Practical set detail: Real pastel lime-green plastic Tupperware bowls stacked in wobbling towers.",
            "Practical set detail: Authentic vintage deviled egg tray held in her hand under studio spotlights.",
            "Practical set detail: Real 1970s salad spinner rotating on a yellow kitchen countertop.",
            "Practical set detail: Physical bread keeper and butter dish arranged on a retro dining table.",
            "Practical set detail: Hundreds of physical plastic lids suspended from invisible fishing line overhead.",
            "Practical set detail: Real frost-covered 1989 chili tubs piled inside a vintage refrigerator.",
            "Practical set detail: Physical Cool Whip tubs and pickle jars arranged on wooden pantry shelves.",
            "Practical set detail: Practical red studio lighting casting glowing reflections off plastic container surfaces.",
            "Practical set detail: Real linoleum flooring scattered with dropped pastel plastic lids.",
            "Practical set detail: Vintage metal lunchboxes and sandwich keepers stacked on a folding table.",
            "Practical set detail: Real theatrical smoke machine haze rolling around her green boots.",
            "Practical set detail: Rows of authentic 1950s pastel canisters lined up on a chrome-trimmed counter.",
            "Practical set detail: Physical yellow backdrop walls with genuine 1950s Tupperware promotional posters.",
            "Practical set detail: Real glass pitchwoman display counter filled with colorful plastic measuring cups.",
            "Practical set detail: Practical red lens flare across the camera from her glowing red eye lighting effect."
        ];

        // CAMERA & REAL FILM STYLES (NO CGI)
        const filmStyles = [
            "Camera style: Shot on 35mm film, 1:85 widescreen, authentic film grain, practical lighting, zero CGI.",
            "Camera style: Shot on 1980s analog TV broadcast camera, physical videotape artifacts, real studio lighting.",
            "Camera style: Cinematic 1970s film stock, rich saturated colors, optical lens flares, practical photography.",
            "Camera style: 1950s Technicolor aesthetic, vivid primary colors, sharp key lighting, real physical set.",
            "Camera style: Shot on 16mm handheld camera, raw grain texture, dynamic live-action camera movement.",
            "Camera style: Vintage retro commercial cinematography, soft studio diffusion, practical lighting setups.",
            "Camera style: 1980s infomercial aesthetic, crisp studio television lighting, authentic analog tape look.",
            "Camera style: Cinematic live-action portrait photography, shallow depth of field, real optical lens focus."
        ];

        // Random selections
        const currentScene = sceneToggle 
            ? commercialScenes[Math.floor(Math.random() * commercialScenes.length)]
            : danceScenes[Math.floor(Math.random() * danceScenes.length)];

        const selectedAudioDir = spokenAudioDirections[Math.floor(Math.random() * spokenAudioDirections.length)];
        const selectedSpeech = spokenTexts[Math.floor(Math.random() * spokenTexts.length)];
        const selectedProp = propsAndDetails[Math.floor(Math.random() * propsAndDetails.length)];
        const selectedStyle = filmStyles[Math.floor(Math.random() * filmStyles.length)];
        const sceneType = sceneToggle ? "[INFOMERCIAL / COMMERCIAL SCENE]" : "[MUSIC VIDEO DANCE SCENE]";

        return `Music video clip for 'One Good Thing About Tupperware' and everyone in the video is dancing while showing off tupperware products. ${sceneType} ${liveActionCharacters} ${currentScene} ${foodProp} ${selectedAudioDir} ${selectedSpeech} ${selectedProp} ${selectedStyle}`;
    }

    function findTextArea() {
        return document.querySelector('textarea[placeholder*="sips from a cup"]')
            || document.querySelector('textarea[placeholder*="Describe"]') 
            || document.querySelector('.flex-1 textarea')
            || document.querySelector('textarea');
    }

    function findButton() {
        return Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent.toLowerCase().includes('generate') || 
            btn.querySelector('svg path[d="M11.293 5.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1-1.414 1.414L13 8.414V18a1 1 0 1 1-2 0V8.414l-3.293 3.293a1 1 0 0 1-1.414-1.414z"]')
        );
    }

    function injectText(textArea, text) {
        const nativeSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textArea), 'value').set;
        if (nativeSetter) {
            nativeSetter.call(textArea, text);
        } else {
            textArea.value = text;
        }
        textArea.dispatchEvent(new Event('input', { bubbles: true }));
        textArea.dispatchEvent(new Event('change', { bubbles: true }));
    }

    let activePrompt = null;

    while (true) {
        const textArea = findTextArea();
        const button = findButton();

        if (!textArea || !button) {
            console.log("⚠️ Textarea or button missing. Retrying in 5s...");
            await sleep(5000);
            continue;
        }

        if (!activePrompt) {
            activePrompt = generateDynamicPrompt();
            injectText(textArea, activePrompt);
            console.log("✨ Generated Live-Action Prompt:\n", activePrompt);
            await sleep(1000);
        }

        const isButtonDisabled = button.disabled || 
                                 button.hasAttribute('disabled') || 
                                 button.classList.contains('cursor-not-allowed');

        if (!isButtonDisabled) {
            console.log("🚀 Submitting live-action prompt...");
            button.click();
            activePrompt = null;
            await sleep(60000);
        } else {
            console.log("⌛ Waiting for generator... Re-checking in 5s...");
            await sleep(5000);
        }
    }
})();
