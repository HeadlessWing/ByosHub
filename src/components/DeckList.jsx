import { formatDeckAsArena, formatDeckAsJson, formatDeckAsCod, downloadFile, parseDeckJson, parseDeckText, parseDeckCod } from '../utils/deckUtils';
import { useRef, useState, useEffect } from 'react';
import { BASIC_LANDS } from '../data/basicLands';
import { LEGACY_BANS } from '../data/legacyBans';
import { getCardPrintings, getCardsByCollection } from '../api/scryfall';
import { getAllChoosableSets } from '../data/blocks';

export function DeckList({ deck, sideboard = {}, onRemoveCard, onMoveCard, onImportDeck, deckName, onRenameDeck, onAddCard, legalSets, printingsMap, setPrintingsMap }) {
    const fileInputRef = useRef(null);
    const cards = Object.values(deck);
    const sbCards = Object.values(sideboard);

    const mainCount = cards.reduce((acc, item) => acc + item.count, 0);
    const sbCount = sbCards.reduce((acc, item) => acc + item.count, 0);
    const totalCards = mainCount + sbCount; // Or just display separately, usually users care about 60/15 split

    // Calculate Land Count
    const landCount = cards.reduce((acc, { card, count }) => {
        return acc + ((card.type_line && card.type_line.toLowerCase().includes('land')) ? count : 0);
    }, 0);

    const choosableSets = new Set(getAllChoosableSets());

    // Legality Check Helper
    const isCardLegal = (card) => {
        // Basic Lands are always legal
        if (card.type_line && card.type_line.includes("Basic Land")) return true;

        // 1. Primary Check: Is specific printing legal?
        if (legalSets && legalSets.includes(card.set)) return true;

        // 2. Secondary Check: Is it legal via reprint?
        if (printingsMap[card.name]) {
            // Check if ANY of the printings are in legalSets
            return printingsMap[card.name].some(p => legalSets.includes(p.set));
        }

        return false;
    };

    // Hover State for Printings
    const [hoveredCard, setHoveredCard] = useState(null);

    const [loadingPrints, setLoadingPrints] = useState(false);

    // Auto-fetch printings for potentially illegal cards
    // Auto-fetch printings for potentially illegal cards (Main + Side)
    useEffect(() => {
        if (!legalSets) return;

        const allCards = [...Object.values(deck), ...Object.values(sideboard)];

        const cardsToCheck = allCards.filter(({ card }) => {
            // Check if card fails primary legality check (specific printing)
            const isPrintedLegal = legalSets.includes(card.set);
            if (isPrintedLegal) return false;

            // Basic lands always ignored here (handled in isCardLegal)
            if (card.type_line && card.type_line.includes("Basic Land")) return false;

            // Check if we already have printings loaded
            if (printingsMap[card.name]) return false;

            return true;
        });

        cardsToCheck.forEach(({ card }) => {
            const fetchPrints = async () => {
                const prints = await getCardPrintings(card.name);
                const printData = prints.map(p => ({ set: p.set, set_name: p.set_name }));
                setPrintingsMap(prev => ({ ...prev, [card.name]: printData }));
            };
            fetchPrints();
        });

    }, [deck, sideboard, legalSets, printingsMap]);


    const handleMouseEnter = async (cardName) => {
        setHoveredCard(cardName);
        if (!printingsMap[cardName]) {
            setLoadingPrints(true);
            const prints = await getCardPrintings(cardName);
            // Store simple array of objects: { set: 'dmu', set_name: 'Dominaria United' }
            const printData = prints.map(p => ({ set: p.set, set_name: p.set_name }));
            setPrintingsMap(prev => ({ ...prev, [cardName]: printData }));
            setLoadingPrints(false);
        }
    };

    const handleMouseLeave = () => {
        setHoveredCard(null);
    };

    // ... (inside getTooltip)
    const getTooltip = (card, legal) => {
        let baseMsg = legal
            ? `Set: ${card.set_name} (${card.set.toUpperCase()})`
            : `Illegal: ${card.set_name} (${card.set.toUpperCase()}) is not in your selected blocks.`;

        if (hoveredCard === card.name) {
            if (loadingPrints && !printingsMap[card.name]) {
                baseMsg += "\n\nLoading other sets...";
            } else if (printingsMap[card.name]) {
                const prints = printingsMap[card.name];

                // Filter prints to ONLY show choosable ones (Standard/Modern blocks)
                // We keep specific legal prints separate for legality verification?
                // Actually, "All Prints" should probably be "All Valid Format Prints".
                // If a card was in "Battle Bond" (not choosable), user doesn't care usually unless they play legacy.
                // User said: "we only should show sets that are choosable".

                // Filter prints to ONLY show choosable ones
                const visiblePrints = prints.filter(p => choosableSets.has(p.set));

                // Deduplicate sets (e.g. if multiple printings in M11, only show M11 once)
                const uniqueSets = Array.from(new Set(visiblePrints.map(p => p.set)));

                // Map back to set info for display
                // We pick the first occurrence of set_name for the set code
                const uniquePrints = uniqueSets.map(setCode => visiblePrints.find(p => p.set === setCode));

                // Of those, which are legal in current selection?
                const legalPrints = uniquePrints.filter(p => legalSets && legalSets.includes(p.set));

                if (uniquePrints.length === 0) {
                    baseMsg += `\n\n⚠ No printings found in any valid Block/Core set.`;
                } else {
                    const allSetsList = uniquePrints.map(p => p.set.toUpperCase()).join(", ");
                    baseMsg += `\n\nAll Choosable Prints: ${allSetsList}`;

                    if (!legal && legalPrints.length > 0) {
                        baseMsg += `\n\n✅ Also LEGAL in: ${legalPrints.map(p => `${p.set_name} (${p.set.toUpperCase()})`).join(", ")}`;
                    } else if (!legal) {
                        baseMsg += `\n\n❌ No legal printings in current format choice.`;
                    }
                }
            }
        }
        return baseMsg;
    };

    const illegalCardsMain = cards.filter(({ card }) => !isCardLegal(card));
    const illegalCardsSb = sbCards.filter(({ card }) => !isCardLegal(card));
    const isDeckLegal = illegalCardsMain.length === 0 && illegalCardsSb.length === 0;

    const handleExport = async (type) => {
        if (cards.length === 0 && sbCards.length === 0) return;

        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${deckName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${timestamp}`;

        let content = '';
        let ext = '';
        let mime = '';

        if (type === 'arena') {
            content = formatDeckAsArena(deck, sideboard);
            ext = 'txt';
            mime = 'text/plain';
        } else if (type === 'cod') {
            content = formatDeckAsCod(deck, deckName, sideboard);
            ext = 'cod';
            mime = 'text/xml';
        } else {
            content = formatDeckAsJson(deck, deckName, sideboard);
            ext = 'json';
            mime = 'application/json';
        }

        // Electron Export
        if (window.electronAPI) {
            const result = await window.electronAPI.saveFile(content, `${filename}.${ext}`, type);
            if (result.status === 'success') {
                console.log("Saved to:", result.filePath);
            } else if (result.status === 'error') {
                alert(`Failed to save: ${result.error}`);
            }
        } else {
            // Web Fallback
            downloadFile(content, `${filename}.${ext}`, mime);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const processImportedList = async (parsedData, sourceName = "Imported Deck") => {
        if (parsedData.main.length === 0 && parsedData.side.length === 0) {
            alert("No cards found in imported data.");
            return;
        }

        // Collect all unique names to fetch
        const allItems = [...parsedData.main, ...parsedData.side];
        const uniqueNames = [...new Set(allItems.map(i => i.name))];

        if (uniqueNames.length === 0) return;

        // Fetch cards from Scryfall
        const identifiers = uniqueNames.map(name => ({ name }));
        // TODO: show loading state properly in UI
        const foundCards = await getCardsByCollection(identifiers);

        // Map back to deck structure
        const cardMap = {};
        foundCards.forEach(card => {
            cardMap[card.name] = card;
        });

        // Build new deck object
        const newDeck = {};
        const newSideboard = {};

        parsedData.main.forEach(item => {
            const card = cardMap[item.name] || Object.values(cardMap).find(c => c.name.startsWith(item.name)); // loose match fallback
            if (card) {
                newDeck[card.name] = { card, count: item.count };
            }
        });

        parsedData.side.forEach(item => {
            const card = cardMap[item.name] || Object.values(cardMap).find(c => c.name.startsWith(item.name));
            if (card) {
                newSideboard[card.name] = { card, count: item.count };
            }
        });

        onImportDeck({
            name: sourceName,
            deck: newDeck,
            sideboard: newSideboard
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target.result;

            // Try parsing as COD (XML) first if extension or content matches
            if (file.name.endsWith('.cod') || content.trim().startsWith('<?xml') || content.includes('<cockatrice_deck')) {
                const parsed = parseDeckCod(content);
                await processImportedList(parsed, file.name.replace('.cod', ''));
            } else {
                // Fallback to JSON (Legacy)
                const parsedDeck = parseDeckJson(content);
                if (parsedDeck) {
                    onImportDeck(parsedDeck);
                } else {
                    alert("Invalid deck file. Please use .cod or legacy .json files.");
                }
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = null;
    };

    const handlePasteImport = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) return;

            // Detect Format
            let parsed = { main: [], side: [] };
            if (text.trim().startsWith('<?xml') || text.includes('<cockatrice_deck')) {
                parsed = parseDeckCod(text);
            } else {
                parsed = parseDeckText(text);
            }

            await processImportedList(parsed);

        } catch (err) {
            console.error("Paste failed", err);
            alert("Failed to read clipboard or fetch cards.");
        }
    };

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                <input
                    type="text"
                    value={deckName}
                    onChange={(e) => onRenameDeck(e.target.value)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        width: '100%',
                        outline: 'none',
                        marginBottom: '0.5rem'
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Main: {mainCount}
                        <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>({landCount} Lands)</span>
                        {mainCount < 60 && <span style={{ color: 'var(--warning)', marginLeft: '0.5rem' }}>(Min 60)</span>}
                        {sbCount > 0 && <span style={{ marginLeft: '1rem' }}>Side: {sbCount}</span>}
                    </span>
                    {!isDeckLegal && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--error)', fontWeight: 'bold' }}>
                            ⚠ Illegal Cards
                        </span>
                    )}
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {cards.length === 0 && sbCards.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                        Deck is empty.<br />Click cards to add them.
                    </div>
                ) : (
                    <>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {cards.map(({ card, count }) => {
                                const legal = isCardLegal(card);
                                const isBanned = LEGACY_BANS.includes(card.name) || LEGACY_BANS.includes(card.name.split(' // ')[0]);

                                return (
                                    <li key={card.name}
                                        onMouseEnter={() => handleMouseEnter(card.name)}
                                        onMouseLeave={handleMouseLeave}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '0.5rem', marginBottom: '0.5rem',
                                            background: isBanned ? 'rgba(239, 68, 68, 0.2)' : (legal ? 'rgba(255,255,255,0.05)' : 'rgba(239, 68, 68, 0.1)'),
                                            border: isBanned ? '1px solid var(--error)' : (legal ? 'none' : '1px solid var(--error)'),
                                            borderRadius: '6px'
                                        }}
                                        title={isBanned ? `BANNED: ${card.name} is banned in Legacy.` : getTooltip(card, legal)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                                            <span style={{ fontWeight: 'bold', marginRight: '0.5rem', minWidth: '1.5rem', color: (legal && !isBanned) ? 'inherit' : 'var(--error)' }}>{count}x</span>
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: (legal && !isBanned) ? 'inherit' : 'var(--error)', textDecoration: isBanned ? 'line-through' : 'none' }}>{card.name}</span>
                                            {isBanned && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'var(--error)', color: 'white', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>BANNED</span>}
                                        </div>
                                        <button
                                            onClick={() => onRemoveCard(card.name)}
                                            style={{
                                                background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)',
                                                padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', marginLeft: '0.5rem'
                                            }}
                                        >
                                            -
                                        </button>
                                        <button
                                            onClick={() => onMoveCard(card.name, 'main', 'sideboard')}
                                            style={{
                                                background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)',
                                                padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', marginLeft: '0.25rem',
                                                fontSize: '0.8rem'
                                            }}
                                            title="Move to Sideboard"
                                        >
                                            SB
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>

                        {sbCards.length > 0 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <div style={{
                                    fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-color)',
                                    borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.25rem', marginBottom: '0.5rem'
                                }}>
                                    Sideboard ({sbCount})
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {sbCards.map(({ card, count }) => {
                                        const legal = isCardLegal(card);
                                        const isBanned = LEGACY_BANS.includes(card.name) || LEGACY_BANS.includes(card.name.split(' // ')[0]);

                                        return (
                                            <li key={`sb-${card.name}`}
                                                onMouseEnter={() => handleMouseEnter(card.name)}
                                                onMouseLeave={handleMouseLeave}
                                                style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '0.5rem', marginBottom: '0.5rem',
                                                    background: isBanned ? 'rgba(239, 68, 68, 0.2)' : (legal ? 'rgba(255,255,255,0.05)' : 'rgba(239, 68, 68, 0.1)'),
                                                    border: isBanned ? '1px solid var(--error)' : (legal ? 'none' : '1px solid var(--error)'),
                                                    borderRadius: '6px'
                                                }}
                                                title={isBanned ? `BANNED: ${card.name} is banned in Legacy.` : getTooltip(card, legal)}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                                                    <span style={{ fontWeight: 'bold', marginRight: '0.5rem', minWidth: '1.5rem', color: (legal && !isBanned) ? 'inherit' : 'var(--error)' }}>{count}x</span>
                                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: (legal && !isBanned) ? 'inherit' : 'var(--error)', textDecoration: isBanned ? 'line-through' : 'none' }}>{card.name}</span>
                                                    {isBanned && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'var(--error)', color: 'white', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>BANNED</span>}
                                                </div>
                                                <button
                                                    onClick={() => onRemoveCard(card.name, 'sideboard')}
                                                    style={{
                                                        background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)',
                                                        padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', marginLeft: '0.5rem'
                                                    }}
                                                >
                                                    -
                                                </button>
                                                <button
                                                    onClick={() => onMoveCard(card.name, 'sideboard', 'main')}
                                                    style={{
                                                        background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)',
                                                        padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', marginLeft: '0.25rem',
                                                        fontSize: '0.8rem'
                                                    }}
                                                    title="Move to Main Deck"
                                                >
                                                    MD
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Basic Lands Quick Add */}
            <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Basic Lands</div>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                    {BASIC_LANDS.map(land => {
                        let color = '#ccc';
                        let label = land.name.charAt(0);

                        // Map to standard WUBRG colors
                        switch (land.name) {
                            case 'Plains': color = '#F9FAFB'; label = 'W'; break; // Zinc-50 roughly
                            case 'Island': color = '#3B82F6'; label = 'U'; break; // Blue-500
                            case 'Swamp': color = '#1F2937'; label = 'B'; break; // Gray-800
                            case 'Mountain': color = '#EF4444'; label = 'R'; break; // Red-500
                            case 'Forest': color = '#10B981'; label = 'G'; break; // Emerald-500
                            case 'Wastes': color = '#9CA3AF'; label = 'C'; break; // Gray-400
                        }

                        return (
                            <button
                                key={land.name}
                                onClick={() => onAddCard(land)}
                                className="glass-button"
                                style={{
                                    padding: '0.25rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    flex: 1,
                                    minWidth: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: color,
                                    color: land.name === 'Plains' ? '#333' : 'white',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                }}
                                title={`Add ${land.name}`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer with Actions */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => handleExport('cod')} className="glass-button" style={{ flex: 1, fontSize: '0.85rem' }} disabled={cards.length === 0}>
                    Export COD
                </button>
                <button onClick={() => handleExport('arena')} className="glass-button secondary" style={{ flex: 1, fontSize: '0.85rem' }} disabled={cards.length === 0}>
                    Export TXT
                </button>
                <button onClick={() => handleExport('json')} className="glass-button secondary" style={{ flex: 1, fontSize: '0.85rem' }} disabled={cards.length === 0}>
                    Backup
                </button>
                <button onClick={handleImportClick} className="glass-button secondary" style={{ flex: 1, fontSize: '0.85rem' }}>
                    Load
                </button>
                <button onClick={handlePasteImport} className="glass-button secondary" style={{ flex: 1, fontSize: '0.85rem' }} title="Import from Clipboard">
                    Paste
                </button>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".cod,.json"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}
