const BASE_URL = 'https://api.scryfall.com';

const searchCache = new Map();

/**
 * Search for cards using Scryfall search syntax
 * @param {string} query - Scryfall syntax query
 * @param {number} page - Page number (1-indexed)
 * @param {object} options - Options object
 * @param {string} [options.order] - Sort order
 * @param {AbortSignal} [options.signal] - Abort signal for cancellation
 */
export async function searchCards(query, page = 1, options = {}) {
    const { order, dir, signal } = options;
    const cacheKey = `${query}|${page}|${order || ''}|${dir || ''}`;

    if (searchCache.has(cacheKey)) {
        return searchCache.get(cacheKey);
    }

    try {
        let url = `${BASE_URL}/cards/search?q=${encodeURIComponent(query)}&page=${page}`;
        if (order) url += `&order=${order}`;
        if (dir) url += `&dir=${dir}`;

        const response = await fetch(url, { signal });

        if (!response.ok) {
            // Scryfall 404s if no results found, handle gracefully
            if (response.status === 404) return { data: [], total_cards: 0, has_more: false };
            throw new Error('Scryfall API error');
        }

        const data = await response.json();

        // Cache successful results
        // Limit cache size to prevent memory leaks (simple LRU-ish: delete oldest if too big)
        if (searchCache.size > 200) {
            const firstKey = searchCache.keys().next().value;
            searchCache.delete(firstKey);
        }
        searchCache.set(cacheKey, data);

        return data;
    } catch (error) {
        if (error.name === 'AbortError') return { aborted: true };
        console.error('Error fetching cards:', error);
        return { data: [], total_cards: 0, has_more: false };
    }
}

/**
 * Get a single card by exact name
 * @param {string} name 
 */
export async function getCardByName(name) {
    try {
        const response = await fetch(`${BASE_URL}/cards/named?exact=${encodeURIComponent(name)}`);
        if (!response.ok) throw new Error('Card not found');
        return await response.json();
    } catch (error) {
        console.error('Error fetching card:', error);
        return null;
    }
}

/**
 * Get all printings of a card by name
 * @param {string} name 
 */
export async function getCardPrintings(name) {
    try {
        // Search for exact name, unique prints
        // Syntax: !"Card Name" unique:prints
        const query = `!"${name}" unique:prints`;
        const result = await searchCards(query, 1);
        return result.data || [];
    } catch (error) {
        console.error('Error fetching printings:', error);
        return [];
    }
}

/**
 * Get multiple cards by identifiers (for batch import)
 * @param {Array<object>} identifiers - Array of { name: 'Card Name' } or { id: 'uuid' }
 */
export async function getCardsByCollection(identifiers) {
    if (!identifiers || identifiers.length === 0) return [];

    try {
        const response = await fetch(`${BASE_URL}/cards/collection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifiers }),
        });

        if (!response.ok) throw new Error('Batch fetch failed');
        const data = await response.json();

        // Data contains { data: [found_cards], not_found: [missing_identifiers] }
        // We might want to handle not_found appropriately, but for now returning found ones
        return data.data || [];
    } catch (error) {
        console.error('Error batch fetching cards:', error);
        return [];
    }
}
