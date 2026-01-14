// Notable cards for filter view
// Expanded common groups:
const ALLIED_PAINLANDS = ["Adarkar Wastes", "Brushland", "Karplusan Forest", "Sulfurous Springs", "Underground River"];
const ENEMY_PAINLANDS = ["Caves of Koilos", "Llanowar Wastes", "Shivan Reef", "Yavimaya Coast", "Battlefield Forge"];
const ALLIED_FETCHLANDS = ["Flooded Strand", "Polluted Delta", "Bloodstained Mire", "Wooded Foothills", "Windswept Heath"];
const ENEMY_FETCHLANDS = ["Marsh Flats", "Scalding Tarn", "Verdant Catacombs", "Arid Mesa", "Misty Rainforest"];
const SHOCKLANDS = ["Hallowed Fountain", "Watery Grave", "Blood Crypt", "Stomping Ground", "Temple Garden", "Godless Shrine", "Steam Vents", "Overgrown Tomb", "Sacred Foundry", "Breeding Pool"];
const TRIOMES_IKORIA = ["Indatha Triome", "Ketria Triome", "Raugrin Triome", "Savai Triome", "Zagoth Triome"];
const TRIOMES_CAPENNA = ["Jetmir's Garden", "Raffine's Tower", "Spara's Headquarters", "Xander's Lounge", "Ziatora's Proving Ground"];
const FASTLANDS_ALLIED = ["Seachrome Coast", "Darkslick Shores", "Blackcleave Cliffs", "Copperline Gorge", "Razorverge Thicket"];
const FASTLANDS_ENEMY = ["Concealed Courtyard", "Spirebluff Canal", "Blooming Marsh", "Inspiring Vantage", "Botanical Sanctum"];
const CHECKLANDS_ALLIED = ["Glacial Fortress", "Drowned Catacomb", "Dragonskull Summit", "Rootbound Crag", "Sunpetal Grove"];
const MANLANDS_WORLDWAKE = ["Celestial Colonnade", "Creeping Tar Pit", "Lavaclaw Reaches", "Raging Ravine", "Stirring Wildwood"];
const MANLANDS_BFZ = ["Shambling Vent", "Lumbering Falls", "Wandering Fumarole", "Hissing Quagmire", "Needle Spires"];
const MANLANDS_DND = ["Cave of the Frost Dragon", "Hall of Storm Giants", "Hive of the Eye Tyrant", "Den of the Bugbear", "Lair of the Hydra"];
const MANLANDS_WOE = ["Restless Cottage", "Restless Fortress", "Restless Spire", "Restless Bivouac", "Restless Vinestalk"]; // Some might be LCI? Checking... WOE had "Restless X".
// Actually WOE had Restless: Cottage, Fortress, Spire, Bivouac, Vinestalk
// LCI had Restless: Anchorage, Reef, Vents, Prairie, Ridgeline
const MANLANDS_LCI = ["Restless Anchorage", "Restless Reef", "Restless Vents", "Restless Prairie", "Restless Ridgeline"];

const PATHWAY_LANDS_ZNR = ["Barkchannel Pathway", "Blightstep Pathway", "Branchloft Pathway", "Brightclimb Pathway", "Clearwater Pathway", "Cragcrown Pathway", "Darkbore Pathway", "Hengegate Pathway", "Needleverge Pathway", "Riverglide Pathway"]; // Some were KHM?
// ZNR: Branchloft, Brightclimb, Clearwater, Cragcrown, Needleverge, Riverglide. 6.
// KHM: Barkchannel, Blightstep, Darkbore, Hengegate. 4.
// I'll put all pathways in a bucket or precise map.
const PATHWAYS_ZNR = ["Branchloft Pathway", "Brightclimb Pathway", "Clearwater Pathway", "Cragcrown Pathway", "Needleverge Pathway", "Riverglide Pathway"];
const PATHWAYS_KHM = ["Barkchannel Pathway", "Blightstep Pathway", "Darkbore Pathway", "Hengegate Pathway"];

const URZA_LANDS = ["Urza's Mine", "Urza's Power Plant", "Urza's Tower"];
const ARTIFACT_LANDS = ["Ancient Den", "Seat of the Synod", "Vault of Whispers", "Great Furnace", "Tree of Tales", "Darksteel Citadel"];

export const NOTABLE_CARDS = {
    // ICE AGE BLOCK
    'ice': ["Enduring Renewal", "Dark Ritual", "Illusions of Grandeur", ...ALLIED_PAINLANDS, "Jokulhaups", "Brainstorm", "Incinerate", "Pox", "Pyroclasm", "Pyroblast", "Swords to Plowshares", "Tinder Wall", "Fyndhorn Elves", "Urza's Bauble", "Zuran Orb", "Glacial Chasm", "Fire Covenant", "Counterspell", "Portent", "Dance of the Dead", "Mystic Remora", "Songs of the Damned", "Nature's Lore", "Orcish Lumberjack"],
    'all': ["Force of Will", "Contagion", "Pyrokinesis", "Elvish Spirit Guide", "Lake of the Dead", "Lim-Dûl's Vault", "Diminishing Returns", "Helm of Obedience", "Phyrexian Devourer", "Arcane Denial", "Gorilla Shaman"],
    'csp': ["Rite of Flame", "Jötun Grunt", "Counterbalance", "Dark Depths", "Mishra's Bauble", "Haakon, Stromgald Scourge", "Skred", "Rune Snag"],

    // MIRAGE BLOCK
    'mir': ["Dark Ritual", "Lion's Eye Diamond", "Infernal Contract", "Incinerate", "Phyrexian Dreadnought", "Shallow Grave", "Enlightened Tutor", "Worldly Tutor", "Wall of Roots", "Memory Lapse"],
    'vis': ["Fireblast", "Impulse", "Necromancy", "Natural Order", "Prosperity", "Tithe", "Undiscovered Paradise", "Quirion Ranger"],
    'wth': ["Abeyance", "Ophidian", "Firestorm", "Buried Alive", "Doomsday", "Gaea's Blessing", "Null Rod", "Lotus Vale", "Aura of Silence", "Veteran Explorer", "Gemstone Mine", "Serenity"],

    // TEMPEST BLOCK
    'tmp': ["Aluren", "Ancient Tomb", "Cursed Scroll", "Dark Ritual", "Intuition", "Humility", "Lotus Petal", "Mana Severance", "Meditate", "Reanimate", "Sapphire Medallion", "Scroll Rack", "Time Warp", "Tradewind Rider", "Wasteland", "Grindstone", "Static Orb", "Living Death", "Sarcomancy", "Counterspell", "Winds of Rath", "Capsize", "Corpse Dance", "Diabolic Edict"],
    'sth': ["Mox Diamond", "Volrath's Shapeshifter", "Volrath's Stronghold", "Dream Halls", "Ensnaring Bridge", "Horn of Greed", "Ruination", "Mana Leak"],
    'exo': ["Mind Over Matter", "City of Traitors", "Cataclysm", "Recurring Nightmare", "Sphere of Resistance", "Price of Progress", "Forbid", "Hatred", "Carnophage", "Manabond"],

    // URZA BLOCK
    'usg': ["Ill-Gotten Gains", "Argothian Enchantress", "Dark Ritual", "Energy Field", "Exploration", "Fluctuator", "Goblin Lackey", "Goblin Matron", "Persecute", "Show and Tell", "Exhume", "Sneak Attack", "Stroke of Genius", "Turnabout", "Priest of Titania", "Gaea's Cradle", "Serra's Sanctum", "Back to Basics", "Voltaic Key", "Gilded Drake", "Duress", "Gamble", "Time Spiral"],
    'ulg': ["Defense of the Heart", "Goblin Welder", "Crop Rotation", "Grim Monolith", "Defense Grid", "Mother of Runes", "Miscalculation"],
    'uds': ["Academy Rector", "Pattern of Rebirth", "Donate", "Gamekeeper", "Masticore", "Opposition", "Replenish", "Metalworker", "Rofellos, Llanowar Emissary", "Powder Keg", "Phyrexian Negator"],

    // MASQUES BLOCK
    'mmq': ["Misdirection", "Thwart", "Squee, Goblin Nabob", "Brainstorm", "Dark Ritual", "Land Grant", "Rishadan Port", "Food Chain", "Unmask", "Dust Bowl", "Snuff Out", "Counterspell", "Nether Spirit"], // "Rebels" ?
    'nem': ["Accumulated Knowledge", "Daze", "Tangle Wire", "Parallax Wave", "Divining Witch", "Flame Rift", "Saproling Burst", "Blastoderm"],
    'pcy': ["Foil"],

    // INVASION BLOCK
    'inv': ["Fact or Fiction", "Obliterate", "Opt", "Rout", "Disrupt", "Harrow", "Absorb", "Artifact Mutation"],
    'pls': ["Flametongue Kavu", "Orim's Chant", "Destructive Flow", "Eladamri's Call", "Draco", "Meddling Mage", "Terminate", "Nightscape Familiar", "Diabolic Intent", "Cavern Harpy"],
    'apc': ["Fire // Ice", "Pernicious Deed", "Vindicate", ...ENEMY_PAINLANDS, "Phyrexian Arena", "Gerrard's Verdict", "Goblin Ringleader", "Goblin Trenches", "Life // Death"],

    // ODYSSEY BLOCK
    'ody': ["Psychatog", "Werebear", "Balancing Act", "Zombie Infestation", "Buried Alive", "Standstill", "Tainted Pact", "Terravore", "Upheaval", "Entomb", "Cephalid Coliseum", "Careful Study", "Nimble Mongoose", "Wild Mongrel", "Innocent Blood", "Firebolt", "Predict"],
    'tor': ["Nantuko Shade", "Mutilate", "Cabal Coffers", "Deep Analysis", "Ichorid", "Devastating Dreams", "Nostalgic Dreams", "Cabal Ritual", "Grim Lavamancer", "Circular Logic", "Arrogant Wurm", "Putrid Imp", "Basking Rootwalla", "Mesmeric Fiend", "Breakthrough", "Cephalid Illusionist"],
    'jud': ["Golden Wish", "Cunning Wish", "Death Wish", "Burning Wish", "Living Wish", "Mirari's Wake", "Wonder", "Anger", "Genesis", "Cabal Therapy", "Solitary Confinement", "Sylvan Safekeeper", "Worldgorger Dragon", "Flash of Insight"],

    // ONSLAUGHT BLOCK
    'ons': [...ALLIED_FETCHLANDS, "Exalted Angel", "Astral Slide", "Lightning Rift", "Akroma's Vengeance", "Future Sight", "Patriarch's Bidding", "Goblin Piledriver", "Chain of Vapor", "Chain of Smog", "Enchantress's Presence", "Skirk Prospector", "Dwarven Blastminer", "Blistering Firecat"], // "Cycling lands" -> Ash Barrens? No, Secluded Steppe etc.
    'lgn': ["Akroma, Angel of Wrath", "Glowrider", "Gempalm Incinerator"],
    'scg': ["Tendrils of Agony", "Stifle", "Decree of Justice", "Form of the Dragon", "Xantid Swarm", "Mind's Desire", "Brain Freeze", "Dragonstorm", "Siege-Gang Commander", "Sulfuric Vortex", "Pyrostatic Pillar", "Goblin Warchief", "Wirewood Symbiote"],

    // MIRRODIN BLOCK
    'mrd': ["Chrome Mox", "Chalice of the Void", "Rule of Law", "Platinum Angel", ...ARTIFACT_LANDS, "Disciple of the Vault", "Sylvan Scrying", "Thoughtcast", "Goblin Charbelcher", "Frogmite", "Myr Enforcer", "Cloudpost", "Thirst for Knowledge", "Mindslaver", "Molten Rain"],
    'dst': ["Sword of Fire and Ice", "Trinisphere", "Arcbound Ravager", "Aether Vial", "Darksteel Colossus", "Blinkmoth Nexus", "Serum Powder", "Darksteel Citadel"],
    '5dn': ["Krark-Clan Ironworks", "Engineered Explosives", "Crucible of Worlds", "Vedalken Shackles", "Night's Whisper", "Serum Visions", "Cranial Plating", "Magma Jet", "Trinket Mage", "Auriok Salvagers"],

    // KAMIGAWA BLOCK
    'chk': ["Glimpse of Nature", "Isamaru, Hound of Konda", "Boseiju, Who Shelters All", "Desperate Ritual", "Sakura-Tribe Elder", "Azusa, Lost but Seeking", "Gifts Ungiven", "Through the Breach", "Lava Spike"],
    'bok': ["Umezawa's Jitte", "Goryo's Vengeance", "Shuko", "Ninja of the Deep Hours"],
    'sok': ["Kataki, War's Wage", "Pithing Needle"],

    // RAVNICA BLOCK
    'rav': ["Overgrown Tomb", "Watery Grave", "Temple Garden", "Sacred Foundry", "Dark Confidant", "Life from the Loam", "Chord of Calling", "Birds of Paradise", "Remand", "Putrefy", "Lightning Helix", "Suppression Field", "Char", "Loxodon Hierarch", "Elves of Deep Shadow"],
    'gpt': ["Steam Vents", "Godless Shrine", "Stomping Ground", "Leyline of the Void", "Shattering Spree", "Electrolyze", "Repeal"],
    'dis': ["Hallowed Fountain", "Blood Crypt", "Breeding Pool", "Protean Hulk", "Infernal Tutor", "Utopia Sprawl", "Ghost Quarter", "Tidespout Tyrant", "Spell Snare"],

    // TIME SPIRAL BLOCK
    'tsp': ["Living End", "Gemstone Caverns", "Academy Ruins", "Ancestral Vision", "Lotus Bloom", "Hypergenesis", "Vesuva", "Grapeshot", "Empty the Warrens", "Rift Bolt", "Serra Avenger", "Search for Tomorrow", "Smallpox"],
    'tsb': ["Gemstone Mine", "Dragonstorm", "Akroma, Angel of Wrath", "Wall of Roots", "Lord of Atlantis", "Tormod's Crypt", "Enduring Renewal", "Dauthi Slayer", "Soltari Priest", "Psionic Blast", "Mystic Enforcer", "Shadowmage Infiltrator", "Fiery Justice", "Meroke", "Unstable Mutation"], // Expanded based on known TSB notables
    'plc': ["Urborg, Tomb of Yawgmoth", "Damnation", "Pongify", "Mesa Enchantress", "Extirpate", "Dead // Gone", "Kavu Predator", "Sulfur Elemental", "Simian Spirit Guide"],
    'fut': ["Tarmogoyf", "Pact of Negation", "Magus of the Moon", "Summoner's Pact", "Bridge from Below", "Narcomoeba", "Street Wraith", "Delay", "Aven Mindcensor", "Tombstalker", "Grove of the Burnwillows", "Tolaria West"],

    // LORWYN BLOCK
    'lrw': ["Thoughtseize", "Cryptic Command", "Garruk Wildspeaker", "Scion of Oona", "Thorn of Amethyst", "Ponder", "Sower of Temptation", "Spellstutter Sprite", "Silvergill Adept", "Merrow Reejerey", "Shriekmaw"],
    'mor': ["Bitterblossom", "Mutavault", "Scapeshift", "Vendilion Clique", "Negate", "Mind Spring", "Heritage Druid", "Countryside Crusher"],
    'shm': ["Painter's Servant", "Woodfall Primus", "Cursecatcher", "Kitchen Finks", "Devoted Druid", "Fulminator Mage", "Smash to Smithereens"],
    'eve': ["Glen Elendra Archmage", "Flickerwisp", "Nettle Sentinel", "Figure of Destiny"],

    // ALARA BLOCK
    'ala': ["Tezzeret the Seeker", "Ad Nauseam", "Ethersworn Canonist", "Elvish Visionary", "Tidehollow Sculler", "Elspeth, Knight-Errant"],
    'con': ["Noble Hierarch", "Path to Exile", "Progenitus", "Knight of the Reliquary"],
    'arb': ["Meddling Mage", "Terminate", "Sphinx of the Steel Wind", "Sovereigns of Lost Alara", "Thopter Foundry", "Maelstrom Pulse", "Qasali Pridemage", "Bloodbraid Elf"],

    // ZENDIKAR BLOCK
    'zen': ["Mindbreak Trap", "Valakut, the Molten Pinnacle", ...ENEMY_FETCHLANDS, "Warren Instigator", "Lotus Cobra", "Goblin Guide", "Spell Pierce", "Expedition Map", "Bloodghast", "Vampire Hexmage", "Vampire Lacerator", "Punishing Fire", "Spreading Seas"],
    'wwk': ["Jace, the Mind Sculptor", "Amulet of Vigor", "Stoneforge Mystic", "Death's Shadow", "Lodestone Golem", ...MANLANDS_WORLDWAKE, "Bojuka Bog", "Searing Blaze", "Eye of Ugin"],
    'roe': ["Emrakul, the Aeons Torn", "Splinter Twin", "Eldrazi Temple", "Inquisition of Kozilek", "Ancient Stirrings", "Forked Bolt", "All Is Dust", "Oust"],

    // SCARS BLOCK
    'som': ["Mox Opal", "Mindslaver", "Memnite", "Galvanic Blast", "Platinum Emperion", "Ratchet Bomb", "Koth of the Hammer"],
    'mbs': ["Blightsteel Colossus", "Sword of Feast and Famine", "Inkmoth Nexus", "Green Sun's Zenith", "Go for the Throat", "Phyrexian Revoker", "Signal Pest", "Hero of Oxid Ridge", "Mirran Crusader", "Wurmcoil Engine"],
    'nph': ["Karn Liberated", "Birthing Pod", "Jin-Gitaxias, Core Augur", "Dismember", "Surgical Extraction", "Beast Within", "Shrine of Burning Rage", "Tempered Steel", "Deceiver Exarch", "Spellskite", "Sword of War and Peace", "Batterskull", "Chancellor of the Annex", "Mutagenic Growth", "Phyrexian Obliterator", "Melira, Sylvok Outcast", "Blade Splicer"],

    // INNISTRAD BLOCK
    'isd': ["Snapcaster Mage", "Liliana of the Veil", "Laboratory Maniac", "Stony Silence", "Past in Flames", "Ghost Quarter", "Geist of Saint Traft", "Delver of Secrets", "Garruk Relentless", "Champion of the Parish"],
    'dka': ["Grafdigger's Cage", "Thalia, Guardian of Thraben", "Faithless Looting", "Stromkirk Noble", "Hellrider", "Huntmaster of the Fells", "Lingering Souls", "Thought Scour"],
    'avr': ["Cavern of Souls", "Griselbrand", "Terminus", "Craterhoof Behemoth", "Temporal Mastery", "Restoration Angel", "Bonfire of the Damned", "Abundant Growth"],

    // RTR BLOCK
    'rtr': ["Overgrown Tomb", "Steam Vents", "Blood Crypt", "Temple Garden", "Hallowed Fountain", "Rest in Peace", "Pithing Needle", "Supreme Verdict", "Sphinx's Revelation", "Pack Rat", "Underworld Connections", "Judge's Familiar", "Jace, Architect of Thought", "Grisly Salvage", "Rakdos Cackler"],
    'gtc': ["Legion Loyalist", "Rapid Hybridization", "Boros Charm", "Abrupt Decay", "Thespian's Stage", "Skullcrack", ...SHOCKLANDS],
    'dgm': ["Putrefy", "Notion Thief", "Aetherling", "Voice of Resurgence"],

    // THEROS BLOCK
    'ths': ["Thoughtseize", "Swan Song", "Nykthos, Shrine to Nyx", "Stormbreath Dragon", "Firedrinker Satyr", "Gray Merchant of Asphodel", "Magma Jet", "Anger of the Gods", "Ashiok, Nightmare Weaver", "Chained to the Rocks"],
    'bng': ["Spirit of the Labyrinth", "Brimaz, King of Oreskos", "Courser of Kruphix"],
    'jou': ["Mana Confluence", "Eidolon of the Great Revel", "Eidolon of Rhetoric"],

    // KHANS BLOCK
    'ktk': [...ALLIED_FETCHLANDS, "Stubborn Denial", "Siege Rhino", "Monastery Swiftspear", "Hooting Mandrills", "Jeskai Ascendancy", "Temur Ascendancy"],
    'frf': ["Ugin, the Spirit Dragon", "Monastery Mentor", "Dark Deal", "Rally the Ancestors", "Gurmag Angler", "Tasigur, the Golden Fang"],
    'dtk': ["Collected Company", "Kolaghan's Command", "Negate", "Duress", "Atarka's Command"],

    // BFZ BLOCK
    'bfz': ["Ulamog, the Ceaseless Hunger", "Gideon, Ally of Zendikar", "Ob Nixilis Reignited", "Painful Truths", "Drana, Liberator of Malakir", ...MANLANDS_BFZ, "Sylvan Scrying"],
    'ogw': ["Thought-Knot Seer", "Eldrazi Mimic", "Kozilek, the Great Distortion", "Eldrazi Displacer", "Matter Reshaper", "Negate", ...MANLANDS_BFZ, "Reflector Mage", "Kalitas, Traitor of Ghet"],

    // SOI BLOCK
    'soi': ["Tireless Tracker", "Thalia's Lieutenant", "Thraben Inspector", "Anguished Unmaking", "Archacyn, the Purifier", "Nahiri, the Harbinger", "Thing in the Ice", "Prized Amalgam"], // Avacyn? Archangel Avacyn
    'emn': ["Thalia, Heretic Cathar", "Emrakul, the Promised End", "Mausoleum Wanderer", "Spell Queller", "Unsubstantiate", "Liliana, the Last Hope", "Bedlam Reveler", "Collective Brutality", "Grim Flayer"],

    // NEW ERA (MODERN SETS)
    'kld': [...FASTLANDS_ENEMY, "Aetherflux Reservoir", "Aetherworks Marvel", "Smuggler's Copter", "Saheeli Rai", "Paradoxical Outcome", "Foundry Inspector", "Scrapheap Scrounger", "Torrential Gearhulk", "Chandra, Torch of Defiance", "Bomat Courier", "Fairgrounds Warden"],
    'aer': ["Felidar Guardian", "Walking Ballista", "Disallow", "Fatal Push", "Negate", "Baral, Chief of Compliance", "Winding Constrictor", "Renegade Rallier"],
    'akh': ["As Foretold", "Hazoret the Fervent", "Glorybringer", "Pull from Tomorrow", "By Force", "Soul-Scar Mage"],
    'hou': ["Abrade", "Ramunap Ruins", "The Scarab God", "Ramunap Excavator", "Scavenger Grounds", "Strategic Planning", "Hollow One"],
    'xln': ["Kitesail Freebooter", "Spell Pierce", "Field of Ruin", "Chart a Course", "Search for Azcanta", "Duress", "Sorcerous Spyglass", "Hostage Taker", "Opt"],
    'rix': ["Ravenous Chupacabra", "Adanto Vanguard", "Legion's Landing", "Blood Sun", "Silvergill Adept", "Dire Fleet Daredevil"],
    'dom': ["Goblin Chainwhirler", "Teferi, Hero of Dominaria", "Cast Down", "Dauntless Bodyguard", "Karn, Scion of Urza", "Siege-Gang Commander", "Goblin Warchief", "Opt"],
    'grn': [...SHOCKLANDS, "Runaway Steam-Kin", "Assassin's Trophy", "Arclight Phoenix", "Legion Warboss", "Thief of Sanity", "Lazav, the Multifarious", "Knight of Autumn"],
    'rna': [...SHOCKLANDS, "Wilderness Reclamation", "Light Up the Stage", "Growth Spiral", "Hydroid Krasis", "Skewer the Critics", "Tithe Taker", "Lavinia, Azorius Renegade"],
    'war': ["Teferi, Time Raveler", "Nissa, Who Shakes the World", "Karn, the Great Creator", "Finale of Devastation", "Bolas's Citadel", "Narset, Parter of Veils", "Ashiok, Dream Render", "Feather, the Redeemed", "Krenko, Tin Street Kingpin", "Dovin's Veto", "Angrath's Rampage", "Arboreal Grazer", "Blast Zone"],
    'eld': ["Once Upon a Time", "Fires of Invention", "Escape to the Wilds", "Lucky Clover", "Bonecrusher Giant", "Murderous Rider", "Embercleave", "Brazen Borrower", "Stonecoil Serpent", "Emry, Lurker of the Loch", "Torbran, Thane of Red Fell", "Castle Locthwain", "Cauldron Familiar", "Charming Prince", "Sorcerous Spyglass", "Drown in the Loch", "Wishclaw Talisman", "Opt", "Questing Beast", "Gilded Goose", "Mystical Dispute", "Embereth Shieldbreaker", "Mystic Sanctuary", "Fabled Passage", "Robber of the Rich"],
    'thb': ["Uro, Titan of Nature's Wrath", "Kroxa, Titan of Death's Hunger", "Elspeth Conquers Death", "Shadowspear", "Thassa's Oracle", "Ox of Agonas", "Field of Ruin", "Klothys, God of Destiny", "Cling to Dust", "Heliod, Sun-Crowned"],
    'iko': ["Jegantha, the Wellspring", "Obosh, the Preypiercer", "Yorion, Sky Nomad", "Shark Typhoon", "Winota, Joiner of Forces", "Fiend Artisan", "Ominous Seas", "Sprite Dragon", "Yidaro, Wandering Monster", "Serrated Scorpion", "Call of the Death-Dweller", ...TRIOMES_IKORIA],
    'znr': ["Omnath, Locus of Creation", "Scute Swarm", "Skyclave Apparition", "Lotus Cobra", "Luminarch Aspirant", "Thieving Skydiver", "Bloodchief's Thirst", "Skyclave Shade", "Glasspool Mimic", "Archon of Emeria", "Emeria's Call", "Ondu Inversion", "Sejiri Shelter", "Agadeem's Awakening", "Hagra Mauling", "Malakir Rebirth", "Kazuul's Fury", "Shatterskull Smashing", "Valakut Awakening", "Bala Ged Recovery", "Turntimber Symbiosis", "Crawling Barrens", ...PATHWAYS_ZNR],
    'khm': ["Alrund's Epiphany", "Faceless Haven", "Tibalt's Trickery", ...PATHWAYS_KHM, "Showdown of the Skalds", "Esika's Chariot", "Goldspan Dragon", "Old-Growth Troll", "Realmwalker", "Toski, Bearer of Secrets", "Ascendant Spirit", "Magda, Brazen Outlaw"],
    'stx': ["Divide by Zero", "Elite Spellbinder", "Solve the Equation", "Strict Proctor", "Sedgemoor Witch", "Witherbloom Apprentice", "Galazeth Prismari", "Prismari Command", "Hall Monitor", "Magma Opus", "Witherbloom Command"],
    'afr': ["Portable Hole", ...MANLANDS_DND, "Lolth, Spider Queen", "Skullport Merchant", "Power Word Kill", "Ingenious Smith", "Ranger Class", "Oswald Fiddlebender"],
    'mid': ["The Meathook Massacre", "Field of Ruin", "Play with Fire", "Adeline, Resplendent Cathar", "Graveyard Trespasser", "Consider", "Dennick, Pious Apprentice", "Infernal Grasp", "Brutal Cathar", "Cathar Commando", "Delver of Secrets", "Memory Deluge", "Galvanic Iteration", "Bloodthirsty Adversary", "Lier, Disciple of the Drowned", "Outland Liberator", "Moonveil Regent", "Faithful Mending", "Duress", "Reckless Stormseeker", "Suspicious Stowaway"],
    'vow': ["Voldaren Epicure", "Thalia, Guardian of Thraben", "Bloodtithe Harvester", "Abrade", "Wedding Announcement", "Thirst for Discovery", "End the Festivities", "Concealing Curtains", "Sorin the Mirthless"],
    'neo': ["Fable of the Mirror-Breaker", "Invoke Despair", "Reckoner Bankbuster", "Kumano Faces Kakkazan", "The Wandering Emperor", "Kaito Shizuki", "Spirited Companion", "The Restoration of Eiganjo", "Touch the Spirit Realm", "Spell Pierce", "March of Otherworldly Light", "Patchwork Automaton"], // "Channel Lands" -> Boseiju, Otawara, etc.
    'snc': ["Make Disappear", "Big Score", "Unlicensed Hearse", "Ledger Shredder", "Tenacious Underdog", "Scheming Fence", "Tainted Indulgence", ...TRIOMES_CAPENNA, "Raffine, Scheming Seer"],
    'dmu': ["Phoenix Chick", "Squee, Dubious Monarch", "Cut Down", "Liliana of the Veil", "Sheoldred, the Apocalypse", "Evolved Sleeper", "Anointed Peacekeeper", "Vodalian Hexcatcher", ...ALLIED_PAINLANDS, "Serra Paragon", "Leyline Binding", "Archangel of Wrath", "Ertai Resurrected"],
    'bro': ["Feldon, Ronom Excavator", "Monastery Swiftspear", "Mechanized Warfare", "Go for the Throat", "Brotherhood's End", "Recruitment Officer", "Myrel, Shield of Argive", "Phyrexian Fleshgorger", "Lay Down Arms", "Loran of the Third Path", "Haywire Mite", "Misery's Shadow", "Gix, Yawgmoth Praetor", "Teferi, Temporal Pilgrim", "Scrapwork Mutt", "Steel Seraph", ...ENEMY_PAINLANDS],
    'one': ["Armored Scrapgorger", "Phyrexian Arena", "Ossification", "Atraxa, Grand Unifier", "Duress", "Sheoldred's Edict", "Kaito, Dancing Shadow", "Skrelv's Hive", ...FASTLANDS_ALLIED, "Deeproot Wayfinder", "Invasion of Ikoria"],
    'mom': ["Faerie Mastermind", "Sheoldred", "Pile On", "Calix, Guided by Fate", "Sunfall", "Cosmic Rebirth", "Monastery Mentor", "Chrome Host Seedshark"],
    // MAT (Aftermath)
    'mat': ["Nissa, Resurgent Animist", "Ob Nixilis, Captive Kingpin", "Karn, Legacy Reforged", "Sarkhan, Soul Aflame", "Nahiri, Forged in Fury", "Jorael, Voice of Zhalfir"], // Corrected MAT list

    'woe': ["Agatha's Soul Cauldron", "Beseech the Mirror", "Virtue of Persistence", "Blossoming Tortoise", "Up the Beanstalk", "Questing Druid", "Mosswood Dreadknight", "Sleep-Cursed Faerie", "Sleight of Hand", "Bramble Familiar", ...MANLANDS_WOE, "Virtue of Loyalty"],
    'lci': ["Cavern of Souls", "Aclazotz, Deepest Betrayal", "Bonehoard Dracosaur", "Get Lost", "Tishana's Tidebinder", "Deep-Cavern Bat", "Preacher of the Schism", "Spelunking", "Inti, Seneschal of the Sun", "Sanguine Evangelist", "Trumpeting Carnosaur", "Sentinel of the Nameless City", ...MANLANDS_LCI, "Warden of the Inner Sky", "Spyglass Siren", "Subterranean Schooner", "Kitesail Larcenist", "Molten Collapse", "Stalactite Stalker", "Malcolm, Alluring Scoundrel"],
    'mkm': ["Leyline of the Guildpact", "Aftermath Analyst", "Assassin's Trophy", "No More Lies", "Insidious Roots", "Forensic Gadgeteer", "Doorkeeper Thrull", "Cryptic Coat", "Case of the Crimson Pulse", "Pick Your Poison", "Lightning Helix"], // Surveil Lands? Manned lands?
    'otj': ["Bristly Bill, Spine Sower", "Slickshot Show-Off", "Aven Interrupter", "Caustic Bronco", "Goldvein Hydra", "The Gitrog, Ravenous Ride", "Smuggler's Surprise", ...FASTLANDS_ENEMY, "Bonny Pall, Clearcutter", "Freestrider Lookout", "Outcaster Liberator", "Duelist of the Mind", "Railway Brawler", "Stoic Sphinx"],
    'big': ["Vaultborn Tyrant", "Simulacrum Synthesizer", "Pest Control", "Legion Extruder", "Harvester of Misery", "Sandstorm Salvager"],
    'otp': ["Rest in Peace", "Torpor Orb", "Thoughtseize"], // Added known OTP if user wants them, or just explicit ones

    'blb': ["Beza, the Bounding Spring", "Fabled Passage", "Fountainport", "Innkeeper's Talent", "Caretaker's Talent", "Iridescent Vinelasher", "Darkstar Augur", "Cruelclaw's Heist", "Keen-Eyed Curator", "Fireglass Mentor", "Thought-Stalker Warlock", "Heaped Harvest", "Parting Gust", "Mockingbird", "Thundertrap Trainer", "Stormchaser's Talent"],
    'dsk': ["Enduring Curiosity", "Sheltered by Ghosts", "Ghost Vacuum", "Valgavoth, Terror Eater", "Unstoppable Slasher", "Unholy Annex // Ritual Chamber", "Fear of Missing Out", "Screaming Nemesis", "Abhorrent Oculus", "Enduring Innocence", "Floodpits Drowner", "Unable to Scream", "Kaito, Bane of Nightmares", "Razorkin Needlehead"],
    'dft': ["Spell Pierce", "Ketramose, the New Dawn", "Stock Up", "Marauding Mako", "Brightglass Gearhulk", "Loot, the Pathfinder"],

    'tdm': ["Voice of Victory", "Tersa Lightshatter", "Surrak, Elusive Hunter", "Descendent of Storms", "Clarion Conqueror", "Rakshasa's Bargain", "Cori-Steel Cutter", "Warden of the Grove", "Sage of the Skies", "Elspeth, Storm Slayer", "Heritage Reclamation"],
    'fin': ["Sephiroth", "Vivi", "Astrologian's Planisphere", "Tifa", "Rydia", "Suplex", "Sin, Spira's Punishment", "Starting Town", "Ultima"],
    'eoe': ["Seam Rip", "Consult the Star Charts", "Sunset Saboteur", "Terminal Velocity", "Pinnacle Emissary", "Tezzeret, Cruel Captain", "The Endstone", ...SHOCKLANDS, "Quantum Riddler"],

    // CORE SETS
    '5ed': [...ALLIED_PAINLANDS, "Armageddon", "Animate Dead", "Birds of Paradise", "Brainstorm", "City of Brass", "Counterspell", "Dark Ritual", "Hurkyl's Recall", "Incinerate", "Jokulhaups", "Llanowar Elves", "Nevinyrral's Disk", "Stasis", "Sylvan Library", "Winter Orb", ...URZA_LANDS, "Wild Growth", "Wrath of God", "Lord of Atlantis", "Urza's Bauble", "Ball Lightning", "Pox", "Memory Lapse", "Pyroblast"],
    '6ed': [...ALLIED_PAINLANDS, "Armageddon", "Birds of Paradise", "Diminishing Returns", "Doomsday", "Enlightened Tutor", "Infernal Contract", "Llanowar Elves", "Opposition", "Prosperity", "Wild Growth", "Worldly Tutor", "Wrath of God", "Lord of Atlantis", "Summer Bloom", "Memory Lapse", "Counterspell"],
    '7ed': [...ALLIED_PAINLANDS, "City of Brass", "Wrath of God", "Static Orb", "Verduran Enchantress", "Goblin Matron", "Llanowar Elves", "Counterspell", "Memory Lapse", "Wild Growth", "Opposition", "Sleight of Hand", "Birds of Paradise", "Duress", "Ensnaring Bridge", "Lord of Atlantis"],
    '8ed': ["Birds of Paradise", "City of Brass", "Ensnaring Bridge", "Blood Moon", "Merchant Scroll", "Verduran Enchantress", "Wrath of God", "Phyrexian Arena", ...URZA_LANDS, "Mana Leak", "Defense Grid"],
    '9ed': [...ALLIED_PAINLANDS, "Verduran Enchantress", "Seething Song", "Blood Moon", ...URZA_LANDS, "Llanowar Elves", "Wrath of God", "Mana Leak", "Sleight of Hand", "Phyrexian Arena", "Hypnotic Specter", "Defense Grid", "Summer Bloom"],

    '10e': ["Birds of Paradise", "Platinum Angel", "Wrath of God", ...ALLIED_PAINLANDS, "Hurkyl's Recall", "Sylvan Scrying", "Pithing Needle", "Hypnotic Specter", "Squee, Goblin Nabob", "Siege-Gang Commander", "Rule of Law", "Treetop Village", "Llanowar Elves", "Crucible of Worlds", "Aura of Silence"],

    'm10': ["Time Warp", "Darksteel Colossus", "Birds of Paradise", "Garruk Wildspeaker", "Platinum Angel", "Ponder", "Pithing Needle", "Siege-Gang Commander", "Lightning Bolt", "Ball Lightning", "Llanowar Elves", "Silence", "Elvish Archdruid", "Elvish Visionary", "Duress", "Mesa Enchantress", "Mind Spring", "Sign in Blood", "Hypnotic Specter", ...CHECKLANDS_ALLIED],
    'm11': ["Leyline of the Void", "Silence", "Birds of Paradise", "Primeval Titan", "Garruk Wildspeaker", "Platinum Angel", "Voltaic Key", "Day of Judgment", "Preordain", "Elvish Archdruid", "Steel Overseer", "Lightning Bolt", "Viscera Seer", "Negate", "Llanowar Elves", "Mana Leak", "Doom Blade", "Duress", "Squadron Hawk", "Sign in Blood", ...CHECKLANDS_ALLIED],
    'm12': ["Birds of Paradise", "Phantasmal Image", "Primeval Titan", "Ponder", "Day of Judgment", "Elvish Archdruid", "Llanowar Elves", "Grim Lavamancer", "Negate", "Doom Blade", "Goblin Chieftain", "Smallpox", "Mesa Enchantress", "Chandra's Phoenix", "Incinerate", "Timely Reinforcements", "Mana Leak", ...CHECKLANDS_ALLIED],
    'm13': ["Elvish Archdruid", "Serra Avenger", "Thragtusk", "Negate", "Tormod's Crypt", "Mutilate", "Duress", "Searing Spear", "Master of the Pearl Trident", ...CHECKLANDS_ALLIED],
    'm14': ["Mutavault", "Silence", "Elvish Mystic", "Negate", "Scavenging Ooze", "Doom Blade", "Duress", "Chandra's Phoenix", "Ratchet Bomb", "Young Pyromancer"],
    'm15': ["Waste Not", "Urborg, Tomb of Yawgmoth", "Chord of Calling", "Goblin Rabblemaster", ...ENEMY_PAINLANDS, "Elvish Mystic", "Phyrexian Revoker", "Negate", "Tormod's Crypt", "Stoke the Flames", "Shrapnel Blast", "Ulcerate", "Sign in Blood"],
    'ori': ["Jace, Vryn's Prodigy", "Dark Petition", "Day's Undoing", "Hangarback Walker", "Goblin Piledriver", ...ENEMY_PAINLANDS, "Vryn Wingmare", "Abbot of Keral Keep", "Negate", "Pia and Kiran Nalaar", "Smash to Smithereens", "Exquisite Firecraft", "Kytheon, Hero of Akros", "Languish", "Avaricious Dragon"],

    'm19': ["Crucible of Worlds", "Scapeshift", "Omniscience", "Nexus of Fate", "Llanowar Elves", "Duress", "Remorseful Cleric"],
    'm20': ["Field of the Dead", "Elvish Reclaimer", "Golos, Tireless Pilgrim", "Lotus Field", "Scheming Symmetry", "Agent of Treachery", "Colossus Hammer", "Mystic Forge", "Grafdigger's Cage", "Steel Overseer", "Manifold Key", "Rule of Law", "Goblin Ringleader", "Negate", "Duress", "Veil of Summer", "Chandra, Awakened Inferno", "Leyline of the Void"],
    'm21': ["Ugin, the Spirit Dragon", "Grim Tutor", "Teferi, Master of Time", "Peer into the Abyss", "Miscast", "Containment Priest", "Opt", "Scavenging Ooze", "Unsubstantiate", "Duress", "Vryn Wingmare", "Kitesail Freebooter", "Azusa, Lost but Seeking", "Kaervek, the Spiteful", "Tormod's Crypt", "Grasp of Darkness", "Eliminate", "Elder Gargaroth", "Fabled Passage", "Chandra's Incinerator"],

    'fdn': ["Sphinx of Forgotten Lore", "Kellan, Planar Trailblazer", "Boltwave", "Kiora, the Rising Tide", "Kaito, Cunning Infiltrator", "Opt", "Duress", "Wishclaw Talisman", "Soulstone Sanctuary", "Abrade", "Progenitus", "Scavenging Ooze", "Cathar Commando", "Soul-Guide Lantern", "Omniscience", "Koma, World-Eater", "Sire of Seven Deaths", "Chart a Course", "Sorcerous Spyglass", "Llanowar Elves", "Elvish Archdruid", "Expedition Map", "Burst Lightning", "Boros Charm"]
};
