import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { searchCards } from '../api/scryfall';
import { LEGACY_BANS } from '../data/legacyBans';
import { NOTABLE_CARDS } from '../data/notableCards';

export function CardBrowser({ legalSets, onAddCard, externalQuery, onQueryChange, deck = {} }) {
    const [query, setQuery] = useState('');
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    // Sync external query to local if changed
    useEffect(() => {
        if (externalQuery !== undefined && externalQuery !== query) {
            setQuery(externalQuery);
        }
    }, [externalQuery]);

    // Handle input change: update local + notify external
    const handleQueryChange = (val) => {
        setQuery(val);
        if (onQueryChange) onQueryChange(val);
    };

    // Color Filters State
    const [filters, setFilters] = useState({
        W: false, U: false, B: false, R: false, G: false, C: false, M: false
    });

    const COLORS = [
        { code: 'W', label: 'Wait', color: '#F8F6D8' }, // White symbol styling roughly
        { code: 'U', label: 'Blue', color: '#0E68AB' },
        { code: 'B', label: 'Black', color: '#150B00' },
        { code: 'R', label: 'Red', color: '#D3202A' },
        { code: 'G', label: 'Green', color: '#00733E' },
        { code: 'C', label: 'Colorless', color: '#CBC2BF' },
        { code: 'M', label: 'Multi', color: '#D4AF37' },
    ];

    const toggleFilter = (code) => {
        setFilters(prev => {
            const current = prev[code];
            // Cycle: false -> true -> 'exclude' -> false
            let next;
            if (current === false) next = true;
            else if (current === true) next = 'exclude';
            else next = false;

            return { ...prev, [code]: next };
        });
    };

    // Construct the set restriction part of the query
    const getSetQuery = useCallback(() => {
        // null means unrestricted (Deductive Mode)
        // BUT we still want to filter to ONLY sets that are valid in the app (no promos/commander)
        // null means unrestricted (Deductive Mode)
        // Use set_type to filter efficiently instead of listing 100+ sets
        if (legalSets === null) {
            return '(st:core OR st:expansion)';
        }

        // Empty array means standard mode but no sets selected -> Should prevent search
        if (legalSets.length === 0) return null;

        const setClause = legalSets.map(code => `set:${code}`).join(' OR ');
        return `(${setClause})`;
    }, [legalSets]);

    // Construct Color Query
    const getColorQuery = useCallback(() => {
        const entries = Object.entries(filters);
        const includes = entries.filter(([_, val]) => val === true).map(([k]) => k);
        const excludes = entries.filter(([_, val]) => val === 'exclude').map(([k]) => k);

        // If no filters active at all
        if (includes.length === 0 && excludes.length === 0) return '';

        let queryParts = [];

        // 1. Build Includes Clause (Colors)
        // If we have color includes (W, U, B, R, G, C), we search for cards matching ANY of them.
        const colorIncludes = includes.filter(k => k !== 'M');
        const includeMulticolor = includes.includes('M');

        if (colorIncludes.length > 0) {
            const includeClauses = colorIncludes.map(code => {
                if (code === 'C') return 'color:c';
                return `(color:${code} OR mana:{${code}})`;
            });
            queryParts.push(`(${includeClauses.join(' OR ')})`);
        }

        // Apply Multicolor Constraint (AND logic) if 'M' is selected
        // This ensures if W + M is selected, we get (W) AND (Multicolor) -> White Multicolor cards
        if (includeMulticolor) {
            queryParts.push('is:multicolor');
        }

        // 2. Build Excludes Clause (AND NOT logic)
        // Must NOT be any of the excluded colors/types
        excludes.forEach(code => {
            if (code === 'C') queryParts.push('-color:c');
            else if (code === 'M') {
                // Exclude Multicolor:
                // -is:multicolor (Removes Gold/Split of 2+ colors)
                // ids<=1 (Removes Dual Lands, Hybrids, and Off-color activations)
                // This implies "Strictly Mono-color or Colorless Identity"
                queryParts.push('(-is:multicolor ids<=1)');
            }
            else {
                // Use Identity exclusion (-id>=X) to fully exclude the color
                // -color:X might miss cards with off-color activations or hybrids in some contexts
                // -id>=X ensures the card contains NO trace of that color
                queryParts.push(`-id>=${code}`);
            }
        });

        // 3. Edge Case: Only Excludes
        // If we have NO includes but HAVE excludes, we are saying "Show everything EXCEPT these".
        // Scryfall handles "-color:W" fine implies "cards that are not white".
        // But we might need a base if pure negative? usually unique:cards is already prepended in fetchCardsData.

        return queryParts.join(' ');
    }, [filters]);

    // Sort State
    const [sortOrder, setSortOrder] = useState('name');
    const [onlyNotable, setOnlyNotable] = useState(false);

    // Filter displayed cards logic
    // We fetch EVERYTHING (by set/query), then filter locally if "Only Notable" is checked
    const displayedCards = useMemo(() => {
        if (!onlyNotable) return cards;

        return cards.filter(card => {
            const setCode = card.set;
            const notableList = NOTABLE_CARDS[setCode];
            if (!notableList) return false;

            // Check if card name is in list
            // Loose check for DFC names (e.g. "Delver of Secrets // Insectile Aberration" vs "Delver of Secrets")
            // The list usually has front name. Scryfall name usually has " // " if DFC.
            // We'll check if any notable name matches the card name (exact or startswith)
            return notableList.some(name => {
                if (card.name === name) return true;
                if (card.name.includes(' // ') && card.name.startsWith(name)) return true;
                return false;
            });
        });
    }, [cards, onlyNotable]);

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    const getCardCount = (card) => {
        const entry = deck[card.name];
        return entry ? entry.count : 0;
    };

    const [hasMore, setHasMore] = useState(true);

    const abortControllerRef = React.useRef(null);

    const fetchCardsData = useCallback(async (isNewSearch = false) => {
        const setQueryPart = getSetQuery();

        if (setQueryPart === null) {
            setCards([]);
            setHasMore(false);
            return;
        }

        // Cancel previous request if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new controller
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setLoading(true);
        const colorPart = getColorQuery();

        // Build base query
        let fullQueryParts = ['unique:cards', 'game:paper', 'year>=1995'];

        if (setQueryPart) fullQueryParts.push(setQueryPart);
        if (query) fullQueryParts.push(`(${query})`);
        if (colorPart) fullQueryParts.push(colorPart);

        const fullQuery = fullQueryParts.join(' ');
        const currentPage = isNewSearch ? 1 : page;

        // Pass sort order and signal to API
        try {
            const result = await searchCards(fullQuery, currentPage, { order: sortOrder, signal });

            if (result.aborted) return; // Ignore aborted requests

            if (isNewSearch) {
                setCards(result.data || []);
                setPage(2);
                setHasMore(result.has_more);
            } else {
                setCards(prev => [...prev, ...(result.data || [])]);
                setPage(prev => prev + 1);
                setHasMore(result.has_more);
            }
        } catch (err) {
            // Ignore errors here, handled in API or simple catch
        } finally {
            // Only clear loading if we are the current active request (simple check: if not aborted)
            if (!signal.aborted) setLoading(false);
        }
    }, [legalSets, query, page, getSetQuery, getColorQuery, sortOrder]);

    // ... useEffect ...
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCardsData(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [legalSets, query, filters, sortOrder]); // Added sortOrder

    // Automatically fetch more if filtered result is empty/small but we have more cards on server
    // This solves the "Notable Only" issue where Page 1 has no notables, so screen is empty.
    useEffect(() => {
        if (!loading && hasMore && onlyNotable && displayedCards.length < 20) {
            // If we have very few cards shown, try to fetch more immediately
            // Use a small timeout to avoid thrashing
            const timer = setTimeout(() => {
                fetchCardsData(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [displayedCards, loading, hasMore, onlyNotable, fetchCardsData]);

    // ... return ...
    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                {/* Filters Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    {/* Color Filters */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {COLORS.map(({ code, label, color }) => {
                            const isActive = filters[code] === true;
                            const isExclude = filters[code] === 'exclude';
                            return (
                                <button
                                    key={code}
                                    onClick={() => toggleFilter(code)}
                                    style={{
                                        width: '30px', height: '30px', borderRadius: '50%', border: 'none',
                                        background: isExclude ? '#ef4444' : (isActive ? color : 'rgba(255,255,255,0.1)'),
                                        color: (isActive && code === 'W') ? '#333' : 'white',
                                        fontWeight: 'bold', cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: isActive || isExclude ? `0 0 10px ${isExclude ? '#ef4444' : color}` : 'none',
                                        opacity: isActive || isExclude ? 1 : 0.5,
                                        textDecoration: isExclude ? 'line-through' : 'none'
                                    }}
                                    title={isExclude ? `Exclude ${label}` : `Filter ${label}`}
                                >
                                    {code}
                                </button>
                            );
                        })}
                    </div>

                    {/* Combined Sort & Filter Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                            value={onlyNotable ? 'notable' : sortOrder}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'notable') {
                                    setOnlyNotable(true);
                                    // Keep underlying sort as name or whatever, doesn't matter much as we filter locally
                                    // But maybe default to name for consistency
                                    if (sortOrder !== 'name') setSortOrder('name');
                                } else {
                                    setOnlyNotable(false);
                                    setSortOrder(val);
                                }
                            }}
                            style={{
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid rgba(167, 139, 250, 0.3)',
                                background: 'rgba(17, 24, 39, 0.8)',
                                color: '#e5e7eb',
                                outline: 'none'
                            }}
                        >
                            <optgroup label="View">
                                <option value="notable">★ Notable Only</option>
                            </optgroup>
                            <optgroup label="Sort By">
                                <option value="name">Name</option>
                                <option value="edhrec">EDHREC Rank</option>
                                <option value="cmc">Mana Value</option>
                                <option value="usd">Price (USD)</option>
                                <option value="released">Date Released</option>
                            </optgroup>
                        </select>
                    </div>
                </div>

                <input
                    type="text"
                    placeholder="Search cards..."
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    className="glass-input"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)' }}
                />
            </div>

            <div
                style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}
                onScroll={(e) => {
                    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 100; // 100px buffer
                    if (bottom && !loading && hasMore) {
                        fetchCardsData(false);
                    }
                }}
            >
                {loading && cards.length === 0 && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>}

                {!loading && cards.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No cards found. Select formats or refine search.</div>}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '16px'
                }}>
                    {displayedCards.map((card) => {
                        const count = getCardCount(card);
                        const isBanned = LEGACY_BANS.includes(card.name) || LEGACY_BANS.includes(card.name.split(' // ')[0]);

                        return (
                            <div key={card.id} className="card-item" onClick={() => onAddCard(card)} style={{ cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }}>
                                {/* Use normal image */}
                                {card.image_uris ? (
                                    <img src={card.image_uris.normal} alt={card.name} style={{ width: '100%', borderRadius: '4.75% / 3.5%', opacity: isBanned ? 0.7 : 1, filter: isBanned ? 'grayscale(100%)' : 'none' }} />
                                ) : (
                                    // Handle double-faced cards or other weird layouts if needed, placeholder for now
                                    card.card_faces && card.card_faces[0].image_uris ? (
                                        <img src={card.card_faces[0].image_uris.normal} alt={card.name} style={{ width: '100%', borderRadius: '4.75% / 3.5%', opacity: isBanned ? 0.7 : 1, filter: isBanned ? 'grayscale(100%)' : 'none' }} />
                                    ) : (
                                        <div style={{ width: '100%', aspectRatio: '63/88', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                                    )
                                )}

                                {/* Banned Indicator */}
                                {isBanned && (
                                    <div style={{
                                        position: 'absolute', top: '10%', left: '0', right: '0',
                                        background: 'rgba(239, 68, 68, 0.9)', color: 'white',
                                        fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center',
                                        padding: '0.25rem', transform: 'rotate(-5deg)',
                                        pointerEvents: 'none'
                                    }}>
                                        BANNED IN LEGACY
                                    </div>
                                )}

                                <div className="hover-add" style={{
                                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    opacity: 0, transition: 'opacity 0.2s', borderRadius: '4.75% / 3.5%'
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                                >
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onAddCard(card); }}
                                        style={{
                                            background: 'rgba(255,255,255,0.2)', border: '1px solid white', borderRadius: '50%',
                                            width: '40px', height: '40px', fontSize: '1.5rem', color: 'white', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                        title="Add 1"
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onAddCard(card, 'main', 4); }}
                                        style={{
                                            background: 'rgba(255,255,255,0.2)', border: '1px solid white', borderRadius: '20px',
                                            padding: '0.25rem 0.75rem', fontSize: '0.9rem', color: 'white', cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                        title="Add 4 copies"
                                    >
                                        +4
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div >
    );
}
