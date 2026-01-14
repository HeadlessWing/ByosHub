import { NOTABLE_CARDS } from '../src/data/notableCards.js';


const setsToCheck = Object.keys(NOTABLE_CARDS);

async function checkSet(setCode) {
    const notableList = NOTABLE_CARDS[setCode];
    if (!notableList) {
        console.log(`No notable list for ${setCode}`);
        return;
    }

    console.log(`\nChecking ${setCode.toUpperCase()} (${notableList.length} notables)...`);

    // Fetch all cards from set (using concise Scryfall search)
    // q=set:ice
    let allSetCards = [];
    let hasMore = true;
    let page = 1;

    try {
        while (hasMore) {
            const resp = await fetch(`https://api.scryfall.com/cards/search?q=set:${setCode}&page=${page}`);
            if (!resp.ok) break;
            const data = await resp.json();
            allSetCards = [...allSetCards, ...data.data];
            hasMore = data.has_more;
            page++;
            await new Promise(r => setTimeout(r, 100)); // be nice
        }
    } catch (e) {
        console.error("Fetch error:", e);
        return;
    }

    const setCardNames = new Set(allSetCards.map(c => c.name));

    const missing = [];
    const found = [];

    notableList.forEach(name => {
        // Reproduce the logic in CardBrowser
        const match = allSetCards.find(c => {
            if (c.name === name) return true;
            if (c.name.includes(' // ') && c.name.startsWith(name)) return true;
            return false;
        });

        if (match) {
            found.push(name);
        } else {
            // Try to find a close match for debugging
            const fuzzy = allSetCards.find(c => c.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(c.name.toLowerCase()));
            missing.push({ name, suggested: fuzzy ? fuzzy.name : "???" });
        }
    });

    if (missing.length > 0) {
        console.log(`❌ MISSING ${missing.length} cards:`);
        missing.forEach(m => console.log(`   - "${m.name}" (Did you mean: "${m.suggested}")`));
    } else {
        console.log(`✅ All ${found.length} found.`);
    }
}

async function run() {
    for (const set of setsToCheck) {
        await checkSet(set);
    }
    console.log("Done checking.");
}

run().catch(err => console.error(err));
