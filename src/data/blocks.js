// Core Sets
export const CORE_SETS = [
    { code: '5ed', name: 'Fifth Edition' },
    { code: '6ed', name: 'Classic Sixth Edition' },
    { code: '7ed', name: 'Seventh Edition' },
    { code: '8ed', name: 'Eighth Edition' },
    { code: '9ed', name: 'Ninth Edition' },
    { code: '10e', name: 'Tenth Edition' },
    { code: 'm10', name: 'Magic 2010' },
    { code: 'm11', name: 'Magic 2011' },
    { code: 'm12', name: 'Magic 2012' },
    { code: 'm13', name: 'Magic 2013' },
    { code: 'm14', name: 'Magic 2014' },
    { code: 'm15', name: 'Magic 2015' },
    { code: 'ori', name: 'Magic Origins' },
    { code: 'm19', name: 'Core Set 2019' },
    { code: 'm20', name: 'Core Set 2020' },
    { code: 'm21', name: 'Core Set 2021' },
    { code: 'fdn', name: 'Foundations' },
];

// Traditional Blocks (Pre-Tarkir)
// Structure: { name: "Block Name", sets: ["code1", "code2", "code3"] }
export const TRADITIONAL_BLOCKS = [
    { name: 'Ice Age Block', sets: ['ice', 'all', 'csp'] }, // Coldsnap is weird but part of it
    { name: 'Mirage Block', sets: ['mir', 'vis', 'wth'] },
    { name: 'Tempest Block', sets: ['tmp', 'sth', 'exo'] },
    { name: 'Urza\'s Block', sets: ['usg', 'ulg', 'uds'] },
    { name: 'Masques Block', sets: ['mmq', 'nem', 'pcy'] },
    { name: 'Invasion Block', sets: ['inv', 'pls', 'apc'] },
    { name: 'Odyssey Block', sets: ['ody', 'tor', 'jud'] },
    { name: 'Onslaught Block', sets: ['ons', 'lgn', 'scg'] },
    { name: 'Mirrodin Block', sets: ['mrd', 'dst', '5dn'] },
    { name: 'Kamigawa Block', sets: ['chk', 'bok', 'sok'] },
    { name: 'Ravnica Block', sets: ['rav', 'gpt', 'dis'] },
    { name: 'Time Spiral Block', sets: ['tsp', 'tsb', 'plc', 'fut'] },
    { name: 'Lorwyn-Shadowmoor Block', sets: ['lrw', 'mor', 'shm', 'eve'] },
    { name: 'Alara Block', sets: ['ala', 'con', 'arb'] },
    { name: 'Zendikar Block', sets: ['zen', 'wwk', 'roe'] },
    { name: 'Scars of Mirrodin Block', sets: ['som', 'mbs', 'nph'] },
    { name: 'Innistrad Block', sets: ['isd', 'dka', 'avr'] },
    { name: 'Return to Ravnica Block', sets: ['rtr', 'gtc', 'dgm'] },
    { name: 'Theros Block', sets: ['ths', 'bng', 'jou'] },
    { name: 'Khans of Tarkir Block', sets: ['ktk', 'frf', 'dtk'] },
];

/**
 * Modern Sets for "Build Your Own Block" (Post-Tarkir)
 * These are all standard-legal expansions released starting from BFZ.
 * Users must pick 3 adjacent sets from this list to form a block.
 */
export const MODERN_SETS = [
    { code: 'bfz', name: 'Battle for Zendikar' },
    { code: 'ogw', name: 'Oath of the Gatewatch' },
    { code: 'soi', name: 'Shadows over Innistrad' },
    { code: 'emn', name: 'Eldritch Moon' },
    { code: 'kld', name: 'Kaladesh' },
    { code: 'aer', name: 'Aether Revolt' },
    { code: 'akh', name: 'Amonkhet' },
    { code: 'hou', name: 'Hour of Devastation' },
    { code: 'xln', name: 'Ixalan' },
    { code: 'rix', name: 'Rivals of Ixalan' },
    { code: 'dom', name: 'Dominaria' },
    { code: 'grn', name: 'Guilds of Ravnica' },
    { code: 'rna', name: 'Ravnica Allegiance' },
    { code: 'war', name: 'War of the Spark' },
    { code: 'eld', name: 'Throne of Eldraine' },
    { code: 'thb', name: 'Theros Beyond Death' },
    { code: 'iko', name: 'Ikoria: Lair of Behemoths' },
    { code: 'znr', name: 'Zendikar Rising' },
    { code: 'khm', name: 'Kaldheim' },
    { code: 'stx', name: 'Strixhaven: School of Mages', associated: ['sta'] },
    { code: 'afr', name: 'Adventures in the Forgotten Realms' },
    { code: 'mid', name: 'Innistrad: Midnight Hunt' },
    { code: 'vow', name: 'Innistrad: Crimson Vow' },
    { code: 'neo', name: 'Kamigawa: Neon Dynasty' },
    { code: 'snc', name: 'Streets of New Capenna' },
    { code: 'dmu', name: 'Dominaria United' },
    { code: 'bro', name: 'The Brothers\' War', associated: ['brr'] },
    { code: 'one', name: 'Phyrexia: All Will Be One' },
    { code: 'mom', name: 'March of the Machine', associated: ['mat', 'mul'] },
    { code: 'mat', name: 'March of the Machine: The Aftermath', isChild: true }, // Child of MOM
    { code: 'woe', name: 'Wilds of Eldraine', associated: ['wot'] },
    { code: 'lci', name: 'The Lost Caverns of Ixalan', associated: ['rex'] },
    { code: 'mkm', name: 'Murders at Karlov Manor' },
    { code: 'otj', name: 'Outlaws of Thunder Junction', associated: ['big', 'otp'] },
    { code: 'big', name: 'The Big Score', isChild: true }, // Child of OTJ
    { code: 'blb', name: 'Bloomburrow' },
    { code: 'dsk', name: 'Duskmourn: House of Horror' },
    { code: 'dft', name: 'Aetherdrift' },
    { code: 'tdm', name: 'Tarkir: Dragonstorm' },
    { code: 'fin', name: 'Final Fantasy' },
    { code: 'eoe', name: 'Edge of Eternities' },
    { code: 'spm', name: 'Marvel\'s Spider-Man' },
    { code: 'tla', name: 'Avatar: The Last Airbender' },
    { code: 'ecl', name: 'Lorwyn Eclipsed' }
];

export function getExpandedSetList(setCodes) {
    const allSets = new Set(setCodes);
    setCodes.forEach(code => {
        const modernSet = MODERN_SETS.find(s => s.code === code);
        if (modernSet && modernSet.associated) {
            modernSet.associated.forEach(assoc => allSets.add(assoc));
        }
        // Traditional blocks handle TSB via the sets array directly
        // But if someone passes 'tsp', they might expect 'tsb' if not using block logic?
        // Current logic: Traditional Blocks are arrays of sets. Modern Sets are single codes.
        // We only need to expand Modern Sets here.
    });
    return Array.from(allSets);
}

export function getFullBlockList() {
    return {
        coreSets: CORE_SETS,
        traditionalBlocks: TRADITIONAL_BLOCKS,
        modernSets: MODERN_SETS
    };
}

export function getAllChoosableSets() {
    const sets = new Set();

    // Core
    CORE_SETS.forEach(s => sets.add(s.code));

    // Traditional
    TRADITIONAL_BLOCKS.forEach(b => {
        b.sets.forEach(s => sets.add(s));
    });

    // Modern
    MODERN_SETS.forEach(s => sets.add(s.code));

    return Array.from(sets);
}
