import { useState } from 'react';

export function useDeck() {
    const [deck, setDeck] = useState({}); // { cardName: { card, count } }
    const [sideboard, setSideboard] = useState({});

    const addCard = (card, destination = 'main', quantity = 1) => {
        const targetSet = destination === 'main' ? deck : sideboard;
        const setTarget = destination === 'main' ? setDeck : setSideboard;
        const currentEntry = targetSet[card.name];

        let newCount = (currentEntry?.count || 0) + quantity;

        // Basic rules: max 4 copies (unless basic land or specific card effects)
        // We'll enforce strict 4 limit for now for simplicity, can handle Relentless Rats later
        if (!card.type_line?.includes('Basic Land')) {
            if (newCount > 4) newCount = 4; // Cap at 4
        }

        setTarget(prev => ({
            ...prev,
            [card.name]: {
                card,
                count: newCount
            }
        }));
    };

    const removeCard = (cardName, destination = 'main') => {
        const setTarget = destination === 'main' ? setDeck : setSideboard;

        setTarget(prev => {
            const current = prev[cardName];
            if (!current) return prev;

            if (current.count <= 1) {
                const newState = { ...prev };
                delete newState[cardName];
                return newState;
            }

            return {
                ...prev,
                [cardName]: {
                    ...current,
                    count: current.count - 1
                }
            };
        });
    };

    const deckCount = Object.values(deck).reduce((acc, item) => acc + item.count, 0);
    const sideboardCount = Object.values(sideboard).reduce((acc, item) => acc + item.count, 0);

    const [deckName, setDeckName] = useState("New Deck");

    const importDeck = (deckData) => {
        // Support both old format (raw deck object) and new format ({ name, deck })
        if (deckData.deck && deckData.name) {
            setDeck(deckData.deck);
            setDeckName(deckData.name);
        } else {
            setDeck(deckData);
            setDeckName("Imported Deck");
        }
        setSideboard({});
    };

    const clearDeck = () => {
        setDeck({});
        setSideboard({});
        setDeckName("New Deck");
    };

    return {
        deck,
        sideboard,
        addCard,
        removeCard,
        importDeck,
        clearDeck,
        deckCount,
        sideboardCount,
        deckName,
        setDeckName
    };
}
