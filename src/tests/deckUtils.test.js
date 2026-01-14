import { describe, it, expect } from 'vitest';
import { formatDeckAsCod, formatDeckAsArena } from '../utils/deckUtils';

describe('Deck Utils', () => {
    describe('formatDeckAsCod (Cockatrice)', () => {
        it('should format a basic deck correctly', () => {
            const deck = {
                'Lightning Bolt': { card: { name: 'Lightning Bolt', set: 'm10' }, count: 4 },
                'Mountain': { card: { name: 'Mountain', set: 'lea' }, count: 20 }
            };
            const result = formatDeckAsCod(deck, 'Burn');

            expect(result).toContain('<deckname>Burn</deckname>');
            expect(result).toContain('<card number="4" name="Lightning Bolt" set="M10"/>');
            expect(result).toContain('<card number="20" name="Mountain" set="LEA"/>');
        });

        it('should use front face name for DFCs/Split cards', () => {
            const deck = {
                'Delver': {
                    card: { name: 'Delver of Secrets // Insectile Aberration', set: 'isd' },
                    count: 4
                }
            };
            const result = formatDeckAsCod(deck, 'Delver Deck');
            expect(result).toContain('<card number="4" name="Delver of Secrets" set="ISD"/>');
            expect(result).not.toContain('Insectile Aberration');
        });

        it('should escape XML special characters', () => {
            const deck = {
                'Rand': {
                    card: { name: 'Fire & Ice', set: 'mma' },
                    count: 1
                }
            };
            const result = formatDeckAsCod(deck);
            expect(result).toContain('name="Fire &amp; Ice"');
        });
    });

    describe('formatDeckAsArena', () => {
        it('should format simple Count Name list', () => {
            const deck = {
                'Lightning Bolt': { card: { name: 'Lightning Bolt' }, count: 4 }
            };
            const result = formatDeckAsArena(deck);
            expect(result).toBe('4 Lightning Bolt');
        });
    });
});
