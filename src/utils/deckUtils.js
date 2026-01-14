
export const formatDeckAsArena = (deck) => {
    // Arena format: Count Name (Set) CollectorNumber
    // Since we don't have Collector Number easily available in checking locally without lookup,
    // standard simplified export is: Count Name
    // Or if we have set/number: Count Name (SET) CN

    // For this app, simplified "Count Name" is safest unless we store more metadata.
    // However, users might want imports.
    // Let's do: Count Name

    return Object.values(deck).map(({ card, count }) => {
        return `${count} ${card.name}`;
    }).join('\n');
};

export const formatDeckAsJson = (deck, name) => {
    // Full data export with metadata
    return JSON.stringify({
        name: name || "Untitled Deck",
        deck: deck
    }, null, 2);
};

export const formatDeckAsCod = (deck, name) => {
    // Cockatrice XML Format
    // <cockatrice_deck version="1">
    //   <deckname>Name</deckname>
    //   <zone name="main">
    //     <card number="1" name="Card Name"/>
    //   </zone>
    // </cockatrice_deck>

    const lines = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<cockatrice_deck version="1">');
    lines.push(`  <deckname>${name || "Untitled Deck"}</deckname>`);
    lines.push('  <zone name="main">');

    Object.values(deck).forEach(({ card, count }) => {
        // XML escape if needed (Cockatrice might handle basic ASCII, but strict XML requires escaping & etc)
        // Simple replace for & < > " '

        // Fix for DFC/Split/Adventure: Cockatrice mostly expects the front face name
        // Scryfall provides "Name A // Name B", we just want "Name A"
        const primaryName = card.name.split(' // ')[0];

        const safeName = primaryName
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

        lines.push(`    <card number="${count}" name="${safeName}" set="${card.set ? card.set.toUpperCase() : ''}"/>`);
    });

    lines.push('  </zone>');
    // Sideboard support can be added later if tracked separately
    lines.push('</cockatrice_deck>');

    return lines.join('\n');
};

export const downloadFile = (content, filename, contentType) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
};

export const parseDeckJson = (jsonString) => {
    try {
        const deckData = JSON.parse(jsonString);

        // Handle new format { name, deck } vs old format { cardOrId: ... }
        let deckObj = deckData;
        if (deckData.deck && deckData.name) {
            deckObj = deckData.deck;
        }

        // Basic validation: check if values have card and count
        const valid = Object.values(deckObj).every(item => item.card && typeof item.count === 'number');
        if (!valid) throw new Error("Invalid deck structure");

        // Return original structure so useDeck can handle it
        return deckData;
    } catch (e) {
        console.error("Failed to parse deck JSON", e);
        return null;
    }
};
