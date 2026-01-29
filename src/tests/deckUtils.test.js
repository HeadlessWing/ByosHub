import { describe, it, expect } from 'vitest';
import { formatDeckAsCod, formatDeckAsArena, parseDeckText, parseDeckCod } from '../utils/deckUtils';

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

    describe('parseDeckText (Clipboard)', () => {
        it('should parse "Count Name" format correctly', () => {
            const input = `
4 Lightning Bolt
20 Mountain
            `;
            const result = parseDeckText(input);
            expect(result.main).toHaveLength(2);
            expect(result.main).toContainEqual({ name: 'Lightning Bolt', count: 4 });
            expect(result.main).toContainEqual({ name: 'Mountain', count: 20 });
        });

        it('should parse Sideboard section', () => {
            const input = `
4 Lightning Bolt
Sideboard
3 Pyroblast
            `;
            const result = parseDeckText(input);
            expect(result.main).toHaveLength(1);
            expect(result.side).toHaveLength(1);
            expect(result.side).toContainEqual({ name: 'Pyroblast', count: 3 });
        });

        it('should handle "1x Name" format', () => {
            const input = "1x Sol Ring";
            const result = parseDeckText(input);
            expect(result.main).toContainEqual({ name: 'Sol Ring', count: 1 });
        });
    });

    describe('parseDeckCod (XML)', () => {
        it('should parse Cockatrice XML correctly', () => {
            const xml = `
            <cockatrice_deck version="1">
              <deckname>Test</deckname>
              <zone name="main">
                <card number="4" name="Brainstorm"/>
              </zone>
              <zone name="side">
                <card number="2" name="Force of Will"/>
              </zone>
            </cockatrice_deck>
            `;
            const result = parseDeckCod(xml);
            expect(result.main).toContainEqual({ name: 'Brainstorm', count: 4 });
            expect(result.side).toContainEqual({ name: 'Force of Will', count: 2 });
        });

        it('should be robust to missing sideboards', () => {
            const xml = `
            <cockatrice_deck version="1">
              <zone name="main">
                <card number="1" name="Ponder"/>
              </zone>
            </cockatrice_deck>
            `;
            const result = parseDeckCod(xml);
            expect(result.main).toHaveLength(1);
            expect(result.side).toHaveLength(0);
        });
    });
});
