// The Chronicle of the Third War — an original retelling of the story of
// Warcraft III: Reign of Chaos and The Frozen Throne, set down as one
// continuous illuminated scroll.

export type Chapter = {
  numeral: string
  heading: string // "Prologue", "Chapter the First", ...
  title: string
  epigraph: string
  attribution: string
  paragraphs: string[]
}

export const TITLE = 'The Chronicle of the Third War'
export const SUBTITLE = 'Being the full story of Warcraft III, as it was told, from the Prophet’s first warning to the silence upon the Frozen Throne.'
export const COLOPHON = 'Here ends the Chronicle of the Third War. The armies upon this page will fight for as long as you keep reading.'

export const FOREWORD: string[] = [
  'Reader, be warned: this is no quiet page. Two armies contest the very parchment beneath these words — a king’s bastion at the foot of the folio, a black necropolis at its head. The soldiers you muster will shoulder the sentences aside as they march, and the letters will spring back like reeds after rain. Read on, and command well.',
]

export const chapters: Chapter[] = [
  {
    numeral: 'I',
    heading: 'Prologue',
    title: 'The Exodus of the Horde',
    epigraph: 'The sands of time have run out for the children of this world. The dream is over — and the nightmare has only begun.',
    attribution: 'the Prophet, to any who would listen',
    paragraphs: [
      'In the years after the Second War, the orcs who had once burned across the Eastern Kingdoms sat listless in internment camps, their bloodlust drained away like water into sand. It was Thrall, son of Durotan — raised as a slave, schooled as a gladiator, and awakened as a shaman — who broke the camps open and gathered the scattered clans beneath the banner of a new Horde. He preached the old ways: the ancestors, the elements, the honor that had belonged to his people before the demons’ bargain poisoned their blood.',
      'It was to Thrall that the Prophet first came, a storm-crow riding the thunderheads, wearing the shape of a raven and the voice of doom. Leave this land, the Prophet said. Your destiny does not lie in the smoke of old battlefields, but across the Great Sea, upon the shores of a continent whose name no human map remembered: Kalimdor. Thrall, who trusted dreams more than kings ever had, obeyed.',
      'The Horde stole ships from the port of Southshore and struck west into open water. Grom Hellscream of the Warsong clan — Thrall’s oldest friend, and the first orc ever to drink of demon blood — was freed from human custody on the way, howling with joy at the prospect of one more voyage toward war. The crossing was cruel. Storms scattered the fleet upon the Darkspear isles, where the trolls of that broken tribe joined their fate to the Horde’s after Thrall pulled them from the wreck of their own drowned kingdom.',
      'When at last the green hills of Kalimdor rose out of the sea-haze, the orcs came ashore into a land older than any of their wars — a land of towering kodo beasts, of harpies and centaur, of forests that watched. The Prophet’s voice followed them ashore like weather: gather your strength, climb toward the setting sun, and wait. The end of the world was coming to meet them all.',
    ],
  },
  {
    numeral: 'II',
    heading: 'Chapter the First',
    title: 'The Scourge of Lordaeron',
    epigraph: 'A plague that does not kill, but harvests — every soul it takes stands up again to serve.',
    attribution: 'from the last report of the Dalaran observers',
    paragraphs: [
      'In the human kingdom of Lordaeron, peace had grown fat and comfortable. King Terenas Menethil ruled from a marble throne; his son, Prince Arthas, was young, golden, beloved, and impatient — a paladin of the Silver Hand trained by Uther the Lightbringer himself. When word came of a strange plague creeping through the northern granaries, it seemed at first a small errand for a prince: ride out, calm the villagers, find the source.',
      'Arthas rode north with Jaina Proudmoore, sorceress of Dalaran, his oldest friend and almost more than that. What they found unmade the world beneath their feet. The plague did not merely kill. It shipped death in grain-sacks — and the dead rose. Behind it stood the necromancer Kel’Thuzad and his Cult of the Damned, and behind him something colder still: a demon called Mal’Ganis, herding the peasantry of Lordaeron like cattle toward the grave and past it.',
      'At Stratholme the choice was waiting for Arthas like a drawn blade. The city’s grain was already tainted; its people were already dead, though they still walked and wept and begged. Burn the city, and stop the plague from marching. Or spare it, and hand ten thousand corpses to the enemy. Uther refused the order and was dismissed on the spot as a traitor. Jaina turned away and could not watch. Arthas went in with those soldiers who would still follow him, and Stratholme burned from noon to nightfall, and the thing that came out of that fire wearing the prince’s face was never entirely Arthas again.',
      'Mal’Ganis fled across the sea to icy Northrend, and Arthas followed — long past the edge of his orders, past the edge of reason. In the frozen waste he found his father’s old vassal Muradin Bronzebeard hunting a legend: a runeblade called Frostmourne, locked in a cavern of black ice, promising power enough to avenge any wrong. The blade’s pedestal bore a warning that whosoever wielded it would be damned, and Muradin read it aloud, and Arthas answered that he would gladly pay any price. When the ice shattered, a shard struck Muradin down. Arthas did not look back. He lifted Frostmourne, and somewhere in the dark beneath the world, the Lich King smiled.',
      'With the hungering blade in his hand, Arthas slew Mal’Ganis — the errand no longer mattering, only the hunt — and then he walked into the snows alone, and his soldiers who searched for him found only footprints filling with frost. Months later the prince came home to Lordaeron. Bells rang. Roses fell upon the road. He strode up the long carpet of his father’s hall with the runeblade wrapped at his side, knelt before the throne, and Terenas laid a hand upon his son’s bowed head. Then Arthas rose and drove Frostmourne through the king. Succeeding you, father, he is said to have whispered, does not require that you be alive to see it.',
      'So fell the kingdom of Lordaeron — not to invasion, but to homecoming. The plague-born dead poured through its cities with the prince at their head, and the survivors gave the horror its lasting name: the Scourge.',
    ],
  },
  {
    numeral: 'III',
    heading: 'Chapter the Second',
    title: 'The Path of the Damned',
    epigraph: 'Even in death, I serve. The difference, my prince, is that I chose it — and you are still pretending you did not.',
    attribution: 'the shade of Kel’Thuzad',
    paragraphs: [
      'Arthas woke into his new existence as a death knight of the Scourge, Frostmourne having eaten what remained of his mercy and fed his soul to the Lich King in the frozen north. His first task was gravedigger’s work: to exhume the bones of Kel’Thuzad, the necromancer he himself had slain, for the Lich King had further use of that cunning mind. The bones were carried in a stolen urn — the urn that had held King Terenas’s ashes, which Arthas tipped out onto the wind without ceremony.',
      'But dead flesh could not carry Kel’Thuzad’s spirit far, and so the Scourge marched on Quel’Thalas, the shining kingdom of the high elves, where an ancient fountain of arcane power called the Sunwell burned like a captive star. Sylvanas Windrunner, Ranger-General of Silvermoon, fought the invaders for every bridge, every gate, every yard of her forest. When at last she fell, Arthas denied her the dignity of death: he tore her spirit from her body and bound it as a banshee, a weapon made from her own grief. Then the Scourge waded into the Sunwell, and in its desecrated light Kel’Thuzad rose again — no longer a man at all, but a lich of ice and hatred.',
      'The lich unveiled the truth that had hidden behind every horror so far: the plague, the Scourge, the Lich King himself — all of it was scaffolding, raised at the command of the Burning Legion, the demon host that had devoured a thousand worlds and twice already reached for this one. To open the door for its coming, the Legion required the spellbook of Medivh, the Last Guardian, kept under lock and ward in the wizard city of Dalaran.',
      'Dalaran’s archmagi stood upon their walls, and it did not save them. Arthas and Kel’Thuzad took the Book of Medivh from the Violet Citadel, and in the ruins outside the city the lich began the summoning. The sky opened. Through it stepped Archimonde the Defiler, left hand of the Legion’s dark titan, a being that had ended worlds the way a scythe ends wheat. His first act upon this one was almost casual: he gathered a handful of dust, breathed upon it, and shook Dalaran’s towers into rubble from a mile away.',
      'With the Legion’s true lords arrived, the demons had no further need of their instruments. Archimonde stripped command of the Scourge from the Lich King’s servants and gave it to the dreadlords, and the burning host turned west — toward the sea, toward Kalimdor, toward the same shore the Prophet had been herding every surviving power on the continent to reach. Lordaeron was left behind: a kingdom of empty cities, where the dead kept watch over the dead.',
    ],
  },
  {
    numeral: 'IV',
    heading: 'Chapter the Third',
    title: 'The Invasion of Kalimdor',
    epigraph: 'If we are to be damned, let it be for what we chose — not for what was poured down our throats.',
    attribution: 'Grom Hellscream, before Mannoroth',
    paragraphs: [
      'The Horde’s landfall on Kalimdor was a shipwreck wearing the costume of an invasion. Scattered along a hostile coast, harried by centaur, the orcs fought their way inland — and there met the tauren: great bison-folk, nomads of the plains, led by the aged chieftain Cairne Bloodhoof. In the tauren Thrall recognized what his own people had lost and were trying to reclaim: a way of living with the land and the spirits rather than upon them. The two peoples bound their fates together on the plains of Mulgore, a friendship that would outlast the war.',
      'The Prophet’s voice drew Thrall onward toward a mountain called Stonetalon Peak, where an Oracle was said to dwell. But the humans had come to Kalimdor too — Jaina Proudmoore, who alone among Lordaeron’s leaders had heeded the Prophet’s warning, had sailed west with every soul she could persuade onto a ship. Orc and human skirmished across the dry hills, each believing the other the vanguard of something worse, until both of them chased their quarry into the Oracle’s cavern and found him waiting: the Prophet, unhooded at last. He was Medivh, the Last Guardian — the same corrupted wizard whose treachery had first let the orcs into this world, returned from death to spend his redemption warning it. He named their true enemy, the Burning Legion, and told them the only road left: stand together, or be ash separately.',
      'But redemption’s road ran through darker country for some. Grom Hellscream, sent to cut timber in the forests of Ashenvale, ran afoul of the forest’s divine guardian — the demigod Cenarius, antlered and ancient, who saw in every orc only the demon-tainted vandals of the last war. Cornered and outmatched, Grom led his Warsong warriors to a fouled fountain where demon blood ran in the water, and he knew exactly what it was, and he drank anyway. The old red fury came roaring back. Cenarius fell — a god, slain by a mortal with borrowed fire — and the pit lord Mannoroth, whose blood it was, stepped from the shadows to collect the clan he had just repurchased.',
      'Thrall and Jaina, allied now beneath Medivh’s hand, lured the enthralled Warsong into ambush and dragged Grom back in chains — not to punish him, but to save him. In a rite that cost the lives of spirit-walkers to hold, the demon’s hold was burned out of Grom’s soul. He woke weeping, and asked only one thing: to be pointed at Mannoroth.',
      'In a red canyon the two orcs found the pit lord waiting, amused. Thrall was swatted aside like a pup. Grom charged alone, axe singing his clan’s name, and buried Gorehowl in Mannoroth’s chest. The demon’s death-blast charred the life from him, and Thrall held his oldest friend as he died. The blood pact was broken — not by a shaman’s rite, but by the same warrior who had first signed it. Thrall spoke his epitaph to the smoke: Grom Hellscream had freed them all.',
    ],
  },
  {
    numeral: 'V',
    heading: 'Chapter the Fourth',
    title: 'Eternity’s End',
    epigraph: 'Ten thousand years of vigil, and the world still insists on ending during my watch.',
    attribution: 'Tyrande Whisperwind, High Priestess of Elune',
    paragraphs: [
      'Kalimdor was not an empty land. In its moonlit northern forests the night elves had kept a vigil ten thousand years long — since the first invasion of the Legion, since the Sundering that broke the ancient world into continents. Tyrande Whisperwind, High Priestess of Elune, woke to find outlanders felling her trees, demons walking her groves, and Cenarius — friend of her people since the dawn of days — dead in Ashenvale. She answered the only way a priestess of war knows: she began waking things that had slept for centuries. First the druids, chief among them Malfurion Stormrage, her beloved, dreaming the long dream in his barrow den.',
      'Then she woke something the druids would never have permitted. In a prison beneath the mountains sat Illidan Stormrage, Malfurion’s twin — sorcerer, traitor, hero, depending on which century told the tale — blinded by a god and jailed ten millennia for loving magic more than it is safe to love anything. Tyrande cut down his wardens and set him free, wagering that a hungry blade pointed at demons was better than a caged one. Illidan, still half in love with her after ten thousand years, went hunting to prove himself.',
      'What he found was the Skull of Gul’dan, the crystallized power of the dead warlock, being used by the dreadlord Tichondrius to rot the forests into a demon’s garden. Illidan destroyed the guardians, seized the Skull — and then, being Illidan, consumed it. Power webbed him in horns and hooves and green fire. In that borrowed shape he tore Tichondrius apart, a demon slaying a demon, and turned to his brother expecting thanks. Malfurion banished him from the forests instead. Illidan walked south along the shore, monstrous and vindicated and alone, and the sea wind carried off whatever he said.',
      'The Legion’s answer came from the top of the world. Archimonde disdained maneuver: he would climb Mount Hyjal and drink the World Tree Nordrassil dry, tearing immortality out by its roots. So the Prophet gathered his flock one final time — Thrall’s Horde, Jaina’s refugees, Tyrande’s elves, three peoples with two wars’ worth of blood between them — and set them in the demon’s path like stones in a river. Jaina’s base fell first, and she teleported out of the wreck at the last heartbeat. Thrall’s palisade fell second, and he spat defiance as it burned. Every hour bought was the point; the mountain was a hourglass.',
      'For at the summit, among the roots of the World Tree, Malfurion had prepared a horn and a heresy. When Archimonde at last laid his hand upon Nordrassil’s bark, the horn of Cenarius sounded across the slopes, and a thousand thousand wisps — the ancestral spirits of every night elf who had ever lived — descended upon the Defiler like fireflies onto a corpse. The detonation unmade him down to the memory. The World Tree burned, the night elves’ immortality burned with it, and the Third War, in every way that mattered to the living, was won on that hillside by three armies that had hated each other the season before.',
      'Medivh, his guardianship at last discharged not by power but by persuasion, spoke a quiet valediction and passed out of the world he had twice doomed and once saved. The peoples he had gathered buried their dead and, for a little while, believed the story was over.',
    ],
  },
  {
    numeral: 'VI',
    heading: 'Chapter the Fifth',
    title: 'The Terror of the Tides',
    epigraph: 'The wardens do not forgive. The wardens do not forget. The wardens, gods help us, do not even sleep.',
    attribution: 'marginal note in a Kul Tiras log-book',
    paragraphs: [
      'Peace lasted about as long as it usually does. In the season after Hyjal, Illidan Stormrage knelt on a beach before Kil’jaeden the Deceiver, last great lord of the diminished Legion, and accepted a commission: destroy the Frozen Throne — the icy prison-engine in Northrend from which the Lich King was quietly slipping the Legion’s leash. In payment Illidan would have power, and standing, and somewhere to belong, which had always been the only coin he actually wanted.',
      'From the drowned ruins of the old world Illidan called up the naga — serpent-elves, remade in the crushing dark by ten thousand years of exile, led by the witch Lady Vashj. With them he sailed for the Broken Isles, where the Tomb of Sargeras held an artifact called the Eye of Sargeras, dense with the buried power of a dead god’s lieutenant. He raised the Tomb from the seabed and took the Eye from its altar.',
      'Behind him came the law. Maiev Shadowsong, Warden of Illidan’s ten-thousand-year imprisonment, had made his captivity her religion and took his freedom as apostasy. She hunted him island to island, losing her lieutenant Naisha and most of her Watchers when Illidan brought the Tomb down upon their heads, and the loss burned her from jailer into zealot. Her summons brought Malfurion and Tyrande across the sea to join the hunt.',
      'The chase ran ashore in the wreck of Lordaeron, where the pursuers made brief common cause with a prince of the fallen high elves — Kael’thas Sunstrider, whose people, the self-named blood elves, fought the Scourge amid the corpses of their kingdom. Escorting his retreat across the river Arevass, Tyrande held a bridge alone against the dead until it collapsed beneath her and the flood took her. Malfurion, mad with grief, believed her lost; Illidan, told of it, went visibly still — and it was Illidan, when the brothers finally collided, who said the thing that stopped the war between them: she is not dead, and I know the river, and help me and we will pull her out of it. They did. For one hour on that riverbank, ten thousand years of enmity stood down.',
      'It did not last past the hour. For Illidan had already used the Eye once: from the ruins of Dalaran he had aimed its power north and cracked the roof of the world, splitting the glacier above the Frozen Throne before Malfurion tore the spell apart. Forgiven for the rescue but not for the ritual, Illidan fled through a dimensional gate with Vashj and his naga, out of the world entire, to the shattered land of Outland — and Maiev, who forgives nothing, followed him through.',
    ],
  },
  {
    numeral: 'VII',
    heading: 'Chapter the Sixth',
    title: 'The Curse of the Blood Elves',
    epigraph: 'They named themselves for the blood of their dead. The living, as usual, were left to pay the bill.',
    attribution: 'a Dalaran remnant’s history, unfinished',
    paragraphs: [
      'The blood elves’ reward for surviving the Scourge was to be handed a new master and an old prejudice. Grand Marshal Othmar Garithos, commander of what remained of the Alliance in Lordaeron, was a small man with a large hatred of everything not human, and he spent Kael’thas’s people like bad coin — sending them against impossible positions with no support, then charging them with treason for accepting the help that saved them. For the help had come from the water: Lady Vashj and her naga, who remembered the elves of old, surfacing to fight beside their sundered kin.',
      'For the crime of being rescued, Kael’thas and his officers were thrown into the Violet Citadel’s dungeons to await execution. Vashj broke them out through the sewers of Dalaran, and with Garithos’s cavalry on their heels the fugitives ran for the only door out of the world: the portal Kel’Thuzad had once opened for Archimonde, still humming in the ruins. They went through blind, and came out under the broken sky of Outland — the orcs’ sundered homeworld, a floating archipelago of red rock and old sins.',
      'They had come to petition Illidan. Instead they found his trail ending in a warden’s cage: Maiev had run her quarry down at last and was hauling him back toward a cell measured in millennia. Vashj and Kael’thas broke the convoy, spilled the Watchers, and cut Illidan free — and the blood elves knelt to him, because he could do the one thing no one else in any world had offered: feed the addiction. Every elf of Quel’Thalas had lived their whole life inside the Sunwell’s glow, and its destruction had left a hunger in them like a missing organ. Illidan knew that hunger. He had eaten a Skull for it. He taught them to draw magic from the world’s raw veins, and they were his.',
      'To secure Outland he took its throne: the fortress called the Black Temple, held by the pit lord Magtheridon, whose fel-orc legions had terrorized the shattered land for years. Illidan’s new host — naga below, blood elves above, and the draenei survivors of Akama’s Broken rising in ambush — closed every gate to Magtheridon’s dungeon dimensions and stormed the temple. The pit lord was cast down and chained beneath his own house, kept alive as a wine-cellar keeps a cask, and Illidan Stormrage, jailbird of ten thousand years, was for one bright moment the lord of an entire world.',
      'Then the sky spoke. Kil’jaeden does not accept resignations. The Frozen Throne still stood; the commission was still owed; and the Deceiver’s patience, he made clear, had a body count. So Illidan gathered naga and blood elves onto ships of bone and storm and turned them toward Northrend — toward the glacier he had already cracked — to finish the errand he had fled. Maiev, inevitable as winter, gathered what remained of her Watchers and sailed after.',
    ],
  },
  {
    numeral: 'VIII',
    heading: 'Chapter the Seventh',
    title: 'The Legacy of the Damned',
    epigraph: 'There is no shame in a throne of ice. It is the only seat that never asks you to be warm again.',
    attribution: 'attributed, perhaps unfairly, to the Lich King',
    paragraphs: [
      'Far to the north, the crack Illidan had opened in the glacier was bleeding out the Lich King’s power like heat from a wound, and every servant bound to him felt the chain slacken. In the ruins of Lordaeron’s capital, King Arthas — for he had taken the crown he made vacant — collapsed mid-audience as his borrowed strength guttered. And in the same hour, Sylvanas Windrunner, the banshee bound against her will, felt her own will come back to her like blood into a numb limb.',
      'The dreadlords of the Legion chose that moment for their coup, and the ruined kingdom split three ways: the Scourge loyal to Arthas, the demons’ puppets, and Sylvanas’s growing host of freed undead who now called themselves the Forsaken. Sylvanas hunted Arthas through his own capital and put an arrow in him that should have ended the story; he was dragged away half-dead by Kel’Thuzad while she consoled herself with lesser vengeances. She took the dreadlord Varimathras as a chastened vassal, drowned and burned the armies sent against her, and when Grand Marshal Garithos came to reclaim the city for humanity, she gave him her word he could have it — then fed him to her new pet and kept the city. The Undercity was born in the sewers of Arthas’s own palace: a kingdom of the discarded, ruled by the woman he had discarded first.',
      'Arthas fled north with the Lich King’s summons ringing in his skull, his power failing by the mile. On Northrend’s shore he found Illidan’s host already ashore and entrenched, and the race for the Frozen Throne became a war of two convalescents: the death knight losing his strength, the demon hunter spending his. From the deep tunnels came unlooked-for help — Anub’arak, the crypt lord, once king of the spider-kingdom of Azjol-Nerub, sent by the Lich King to bring his champion home the short way: down, through the buried dark, through his own conquered and desecrated halls, past horrors older than the Scourge itself, things with no faces that whispered in the roots of the world.',
      'On the glacier’s crown the rivals met at last: Arthas and Illidan, runeblade and warglaives, the damned against the disowned, with the Frozen Throne watching from its pinnacle of ice. It is recorded that the duel was brief. Frostmourne opened Illidan from hip to rib, and the demon hunter fell into the snow — alive, because Arthas no longer killed anything the Lich King did not require killed, and the Lich King required only one thing now. Kil’jaeden’s bill would have to find its debtor in another world. Vashj and Kael’thas carried their lord home broken.',
      'Arthas climbed the long stair of the pinnacle alone, while the voices of everyone he had been — Jaina’s grief, Uther’s judgment, Muradin’s warning, his father’s love — fell away behind him one by one like torn pages. At the summit sat the Frozen Throne, and within its ice, the horned helm of Ner’zhul, the orc shaman whose punishment and ambition had begun every chapter of this chronicle. Arthas shattered the ice with Frostmourne and set the crown of domination upon his own head.',
    ],
  },
  {
    numeral: 'IX',
    heading: 'Epilogue',
    title: 'The Silence of the Throne',
    epigraph: 'Now we are one.',
    attribution: 'two voices, speaking together, beneath the ice',
    paragraphs: [
      'The spirit of Ner’zhul and the soul of Arthas Menethil closed around each other like the two lips of a wound, and what sat down upon the Frozen Throne was neither the shaman nor the prince but the thing they had been building between them since a sword first whispered in a cavern of black ice. The new Lich King did not march. He did not need to. He sat, and the storm knelt around him, and the dead everywhere in the world stood a little straighter. Northrend went quiet — the patient quiet of a held breath, which the world would not hear released for years.',
      'Far to the south, the survivors did what survivors do. Thrall’s Horde raised the nation of Durotar on Kalimdor’s red coast and named its capital Orgrimmar, for the liberator Orgrim Doomhammer; Cairne’s tauren raised Thunder Bluff upon the mesas; Jaina’s refugees built the island city of Theramore, and its lady kept peace with the orcs her father had died fighting — a peace she paid for in ways this chronicle is too short to weigh. The night elves, mortal now, learned to count the years they had once spent like rain. And in Quel’Thalas and the Undercity and Outland, the war’s orphans — blood elves, Forsaken, the broken and the freed — began writing the stranger histories that would follow.',
      'Of the great actors of the Third War, the ledger closes thus: Medivh redeemed and departed; Archimonde unmade upon Hyjal; Mannoroth dead by Hellscream’s axe, and Hellscream dead by Mannoroth’s fire; Cenarius slain and Nordrassil scarred; Kel’Thuzad enthroned in cold Naxxramas; Sylvanas a queen of the twice-born; Illidan a broken king licking his wounds in a broken world, with a warden still standing outside his gate like a shadow that has learned patience. And upon the roof of the world, a king on a throne of ice, dreaming with his eyes open, waiting for the chronicle’s next volume to be written in frost.',
      'Reader — the page you have been fighting over this whole while is yours now. The words will settle back into their lines, as words do. Whether the little war below ends in victory or ruin, the ink remembers everything.',
    ],
  },
]
