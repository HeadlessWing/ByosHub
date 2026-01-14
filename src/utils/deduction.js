import { CORE_SETS, TRADITIONAL_BLOCKS, MODERN_SETS } from '../data/blocks';

// Helper: Get all block options that contain a specific set code
export function getBlocksContainingSet(setCode) {
    const options = [];
    const lowerCode = setCode.toLowerCase();

    // 1. Check Core Sets
    const coreMatch = CORE_SETS.find(s => s.code === lowerCode);
    if (coreMatch) {
        options.push({ type: 'core', code: lowerCode, name: coreMatch.name });
    }

    // 2. Check Traditional Blocks
    TRADITIONAL_BLOCKS.forEach(block => {
        if (block.sets.includes(lowerCode)) {
            options.push({ type: 'traditional', name: block.name, sets: block.sets });
        }
    });

    // 3. Check Modern Sets
    // Simplify deduction: Only consider the block STARTING at this set.
    // This ensures a 1:1 mapping so that 'uniqueOptions' can find a single match and trigger the highlight.
    // While technically a set like 'DOM' could be the 2nd or 3rd set of a previous block,
    // for "Recommendation/Highlight" purposes, it's clearest to suggest the block that *starts* with the card's set.
    const setIndex = MODERN_SETS.findIndex(s => s.code === lowerCode);
    if (setIndex !== -1) {
        // Only return if it can actually start a block (has 2 following sets? Or do we allow partials at end?)
        // The UI assumes 3 sets.
        // If it's near the end, maybe we shouldn't recommend it?
        // Or just let the UI handle valid blocks.
        // Let's assume valid start for now or check bounds.
        // Actually, existing logic allowed any sliding window.
        // Let's just push the block starting here (Option A).

        options.push({
            type: 'modern',
            startSet: MODERN_SETS[setIndex].code,
            name: `${MODERN_SETS[setIndex].name} Block`
        });
    }

    return options;
}

/**
 * Deduce which blocks MUST be selected for the deck to be legal.
 * @param {Array} cards - Array of card objects from the deck.
 * @param {Object} printingsMap - Map of cardName -> Array of printings { set: 'code' }.
 * @returns {Object} result - { lockedCore: code|null, lockedBlocks: Array<BlockData> }
 */
export function deduceLockedFormat(cards, printingsMap) {
    // Current simpler logic:
    // If a Card is present in the deck:
    // 1. If we have printingsMap for it, consider ALL its sets.
    // 2. If not, consider ONLY its current set.
    // Flatten list of "possible blocks" for each card.
    // If a card has ONLY ONE possible block option across all its printings -> That block is REQUIRED.

    // Note: This logic is "optimistic". It locks if a card forces a block.
    // It does NOT solve the complex constraint of "Find min cover".
    // User asked: "If they are in only one set then it will lock that set in as a choice."

    let lockedCore = null;
    let lockedBlocks = []; // format compatible with useFormat's selectedBlocks string or object identifier?
    // useFormat stores objects: { type, name/startSet }
    // We'll return objects.

    // To dedup, we can use a Set of unique IDs strings
    const lockedIds = new Set();

    const getBlockId = (b) => b.type === 'traditional' ? `trad:${b.name}` : `mod:${b.startSet}`;

    cards.forEach(card => {
        // Collect all sets this card is in
        const setsToCheck = new Set();

        // Always include current set
        setsToCheck.add(card.set);

        // Include reprints if available
        if (printingsMap[card.name]) {
            printingsMap[card.name].forEach(p => setsToCheck.add(p.set));
        }

        // Basic lands don't enforce blocks
        if (card.type_line && card.type_line.includes("Basic Land")) return;

        // Find all possible blocks that could legalize this card
        // A block legalizes the card if it contains AT LEAST ONE of the setsToCheck
        const viableBlocks = [];

        // We need to iterate ALL possible blocks in the universe? 
        // Or get options for each set and merge?
        // Let's get options for each set.

        const allOptions = [];
        setsToCheck.forEach(sCode => {
            const opts = getBlocksContainingSet(sCode);
            allOptions.push(...opts);
        });

        // Unique viable blocks for this card
        // We filter by ID to deduplicate
        const uniqueOptions = [];
        const seenIds = new Set();

        allOptions.forEach(opt => {
            let id;
            if (opt.type === 'core') id = `core:${opt.code}`;
            else id = getBlockId(opt);

            if (!seenIds.has(id)) {
                seenIds.add(id);
                uniqueOptions.push(opt);
            }
        });

        // DEDUCTION: If uniqueOptions.length === 1, that block is REQUIRED.
        if (uniqueOptions.length === 1) {
            const required = uniqueOptions[0];
            if (required.type === 'core') {
                // If multiple cards require different cores, that's a conflict (impossible deck), but we just lock the last one seen or handle distinct
                // The user logic allows 1 core.
                lockedCore = required.code;
            } else {
                const bId = getBlockId(required);
                if (!lockedIds.has(bId)) {
                    lockedIds.add(bId);
                    lockedBlocks.push(required);
                }
            }
        }
    });

    return { lockedCore, lockedBlocks };
}
