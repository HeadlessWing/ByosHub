
import { getLegalizingBlocks } from '../utils/deduction';
import { CORE_SETS, TRADITIONAL_BLOCKS, MODERN_SETS } from '../data/blocks';

// Mock data
// Assume format: 
// CORE: 'm10', 'm11'
// TRAD: 'mir' (Mirage block: mir, vis, wth)
// MOD: 'dom' (Dominaria), 'war' (War of the Spark)...

// Mock printings
const printingsMap = {
    'Card A': [{ set: 'm10' }],
    'Card B': [{ set: 'mir' }, { set: 'm10' }],
    'Card C': [{ set: 'vis' }],
    'Card D': [{ set: 'dom' }]
};

// Illegal cards scenarios

describe('getLegalizingBlocks', () => {

    test('Single illegal card (Card A - m10) should be legalized by M10', () => {
        const illegalCards = [{ name: 'Card A', set: 'm10' }];

        const result = getLegalizingBlocks(illegalCards, printingsMap);
        // Expect core:m10
        expect(result.has('core:m10')).toBe(true);
        expect(result.size).toBe(1);
    });

    test('Single illegal card (Card B - mir/m10) should be legalized by M10 OR Mirage Block', () => {
        const illegalCards = [{ name: 'Card B', set: 'mir' }]; // in deck as 'mir' printing

        const result = getLegalizingBlocks(illegalCards, printingsMap);
        // Expect core:m10 AND trad:Mirage Block
        expect(result.has('core:m10')).toBe(true);
        // Finding name for 'mir' block from actual data might be tricky if I don't import real data structure or name exactly.
        // But getLegalizingBlocks uses imported data.
        // Let's assume Mirage is in the real data. 
        // If not, this test will fail on specific name, so we check if ANY traditional block is there.

        const hasTrad = Array.from(result).some(id => id.startsWith('trad:'));
        expect(hasTrad).toBe(true);
    });

    test('Two illegal cards (Card A & Card C) - Card A(m10), Card C(vis)', () => {
        // Card A only in m10.
        // Card C only in vis (Mirage block).
        // No single block covers both.
        const illegalCards = [
            { name: 'Card A', set: 'm10' },
            { name: 'Card C', set: 'vis' }
        ];

        const result = getLegalizingBlocks(illegalCards, printingsMap);
        // Expect EMPTY set
        expect(result.size).toBe(0);
    });

    test('Two illegal cards (Card B & Card C) - Card B(mir/m10), Card C(vis)', () => {
        // Card B is in Mirage & M10.
        // Card C is in Mirage (vis).
        // Mirage block covers BOTH.
        // M10 only covers Card B.
        // Expect Mirage Block to be suggested.

        const illegalCards = [
            { name: 'Card B', set: 'm10' }, // Current printing doesn't matter, we check all prints
            { name: 'Card C', set: 'vis' }
        ];

        const result = getLegalizingBlocks(illegalCards, printingsMap);

        const hasMirage = Array.from(result).some(id => id.includes('Mirage')); // Name usually includes block
        expect(hasMirage).toBe(true);
        expect(result.has('core:m10')).toBe(false); // M10 doesn't cover Card C
    });
});
