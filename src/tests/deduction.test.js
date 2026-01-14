import { describe, it, expect } from 'vitest';
import { getBlocksContainingSet, deduceLockedFormat } from '../utils/deduction';
import { MODERN_SETS } from '../data/blocks';

describe('Deduction Logic', () => {
    describe('getBlocksContainingSet', () => {
        it('should identify Innistrad block for ISD set', () => {
            const options = getBlocksContainingSet('isd');
            expect(options).toHaveLength(1); // Traditional (innistrad block) only
            // Wait, ISD is checking traditional blocks logic.
            // TRADITIONAL contains Innistrad Block: isd, dka, avr.
            // MODERN_SETS starts from BFZ. ISD is not in MODERN_SETS.

            const traditionalOption = options.find(o => o.type === 'traditional');
            expect(traditionalOption).toBeDefined();
            expect(traditionalOption.name).toBe('Innistrad Block');
        });

        it('should identify Modern block for KLD', () => {
            // Kaladesh is in MODERN_SETS
            const options = getBlocksContainingSet('kld');
            const modernOption = options.find(o => o.type === 'modern');
            expect(modernOption).toBeDefined();
            expect(modernOption.startSet).toBe('kld');
        });
    });

    describe('deduceLockedFormat', () => {
        it('should return nulls for empty deck', () => {
            const { lockedCore, lockedBlocks } = deduceLockedFormat([], {});
            expect(lockedCore).toBeNull();
            expect(lockedBlocks).toHaveLength(0);
        });

        it('should lock a block if a card is unique to it', () => {
            // Assume we have a card "Fake Card" only in "isd". 
            // Mock map: { "Fake Card": [{set: 'isd'}] }
            // Actually deduceLockedFormat checks printingsMap.

            const cards = [{ name: 'Fake Card', set: 'isd' }];
            const printingsMap = { 'Fake Card': [{ set: 'isd' }] };

            const { lockedBlocks } = deduceLockedFormat(cards, printingsMap);
            expect(lockedBlocks.length).toBeGreaterThan(0);
            expect(lockedBlocks[0].name).toContain('Innistrad');
        });
    });
});
