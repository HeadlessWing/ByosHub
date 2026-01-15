import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { searchCards } from '../api/scryfall';
import { LEGACY_BANS } from '../data/legacyBans';
import { NOTABLE_CARDS } from '../data/notableCards';
import { AdvancedSearchModal } from './AdvancedSearchModal';

export function CardBrowser({ legalSets, onAddCard, externalQuery, onQueryChange, deck = {} }) {
    const [query, setQuery] = useState('');
    const [advancedFilters, setAdvancedFilters] = useState(null); // { oracleText, typeLine, ... }
    const [showAdvanced, setShowAdvanced] = useState(false);
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
        W: false, U: false, B: false, R: false, G: false, C: false
    });
    const [multiMode, setMultiMode] = useState('default'); // 'default', 'yes' (only), 'no' (exclude)

    const COLORS = [
        { code: 'W', label: 'White', color: '#F8F6D8' },
        { code: 'U', label: 'Blue', color: '#0E68AB' },
        { code: 'B', label: 'Black', color: '#150B00' },
        { code: 'R', label: 'Red', color: '#D3202A' },
        { code: 'G', label: 'Green', color: '#00733E' },
        { code: 'C', label: 'Colorless', color: '#CBC2BF' },
    ];

    const toggleFilter = (code) => {
        setFilters(prev => ({ ...prev, [code]: !prev[code] }));
    };

    const toggleMulti = () => {
        setMultiMode(prev => {
            if (prev === 'default') return 'yes';
            if (prev === 'yes') return 'no';
            return 'default';
        });
    };

    // Construct the set restriction part of the query
    const getSetQuery = useCallback(() => {
        if (legalSets === null) {
            return '(st:core OR st:expansion)';
        }
        if (legalSets.length === 0) return null;
        const setClause = legalSets.map(code => `set:${code}`).join(' OR ');
        return `(${setClause})`;
    }, [legalSets]);

    // Construct Color Query
    const getColorQuery = useCallback(() => {
        const activeColors = Object.entries(filters)
            .filter(([_, val]) => val)
            .map(([k]) => k);

        let queryParts = [];

        // 1. Identity Logic
        if (activeColors.length > 0) {
            // "Show only cards within these colors"
            // id<=W means identity is W or Colorless.
            // id<=WU means identity is W, U, WU, or Colorless.
            const idString = activeColors.join('').toLowerCase();
            queryParts.push(`id<=${idString}`);

            // 2. Ensure Colored (unless C is selected or M is active)
            // If we select 'W', we generally mean W cards, NOT colorless (user: "colorless only when C hit").
            // So if 'C' is NOT selected, we exclude pure colorless cards by requiring at least one color.
            if (!filters.C) {
                // Must have at least one of the selected colors
                // OR be multicolor (if M is handled separately? No, multicolor implies color)

                // If W is selected: (c>=w). 
                // If W+U selected: (c>=w OR c>=u).
                const colorReqs = activeColors.filter(c => c !== 'C').map(c => `c>=${c.toLowerCase()}`);
                if (colorReqs.length > 0) {
                    queryParts.push(`(${colorReqs.join(' OR ')})`);
                } else {
                    // Only 'C' was removed? If activeColors has entries but no colors (impossible if C is not in it)
                }
            }
        }
        // If NO colors selected -> Default behavior (Show all? or Show None?)
        // Standard app behavior usually shows all if filters are clear.

        // 3. Multicolor Logic
        if (multiMode === 'yes') {
            queryParts.push('is:multicolor');
        } else if (multiMode === 'no') {
            queryParts.push('-is:multicolor');
        }

        return queryParts.join(' ');
    }, [filters, multiMode]);

    // Construct Advanced Query
    const getAdvancedQuery = useCallback(() => {
        if (!advancedFilters) return '';
        const parts = [];

        // Oracle & Type
        if (advancedFilters.oracleText) parts.push(`o:"${advancedFilters.oracleText}"`);
        if (advancedFilters.typeLine) parts.push(`t:"${advancedFilters.typeLine}"`);

        // Mana Value (mv)
        if (advancedFilters.mvMin) parts.push(`mv>=${advancedFilters.mvMin}`);
        if (advancedFilters.mvMax) parts.push(`mv<=${advancedFilters.mvMax}`);

        // Power (pow)
        if (advancedFilters.powerMin) parts.push(`pow>=${advancedFilters.powerMin}`);
        if (advancedFilters.powerMax) parts.push(`pow<=${advancedFilters.powerMax}`);

        // Toughness (tou)
        if (advancedFilters.touMin) parts.push(`tou>=${advancedFilters.touMin}`);
        if (advancedFilters.touMax) parts.push(`tou<=${advancedFilters.touMax}`);

        // Rarities
        const rarities = [];
        if (advancedFilters.rarities?.common) rarities.push('r:common');
        if (advancedFilters.rarities?.uncommon) rarities.push('r:uncommon');
        if (advancedFilters.rarities?.rare) rarities.push('r:rare');
        if (advancedFilters.rarities?.mythic) rarities.push('r:mythic');

        if (rarities.length > 0) {
            parts.push(`(${rarities.join(' OR ')})`);
        }

        return parts.join(' ');
    }, [advancedFilters]);

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
        const advancedPart = getAdvancedQuery();

        // Build base query
        let fullQueryParts = ['unique:cards', 'game:paper', 'year>=1995'];

        if (setQueryPart) fullQueryParts.push(setQueryPart);
        if (query) fullQueryParts.push(`(${query})`);
        if (colorPart) fullQueryParts.push(colorPart);
        if (advancedPart) fullQueryParts.push(advancedPart);

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
    }, [legalSets, query, page, getSetQuery, getColorQuery, getAdvancedQuery, sortOrder]);

    // ... useEffect ...
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCardsData(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [legalSets, query, filters, sortOrder, advancedFilters]); // Added advancedFilters

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
                    <div style={{ display: 'flex', gap: '0.25rem', paddingRight: '1rem', borderRight: '1px solid var(--glass-border)' }}>
                        {COLORS.map(({ code, label, color }) => {
                            const active = filters[code];
                            return (
                                <button
                                    key={code}
                                    onClick={() => toggleFilter(code)}
                                    title={`${label} (${active ? 'Active' : 'Off'})`}
                                    style={{
                                        width: '2rem', height: '2rem',
                                        borderRadius: '50%',
                                        border: active ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.1)',
                                        background: active ? color : 'transparent',
                                        color: active ? (['W', 'C'].includes(code) ? 'black' : 'white') : 'rgba(255,255,255,0.5)',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    {code}
                                </button>
                            );
                        })}

                        {/* Multicolor Toggle */}
                        <button
                            onClick={toggleMulti}
                            title={`Multicolor: ${multiMode === 'default' ? 'Allow' : multiMode === 'yes' ? 'Only' : 'None'}`}
                            style={{
                                width: '2rem', height: '2rem',
                                borderRadius: '50%',
                                border: multiMode !== 'default' ? '2px solid #D4AF37' : '2px solid rgba(255,255,255,0.1)',
                                background: multiMode === 'yes' ? '#D4AF37' : 'transparent',
                                color: multiMode === 'yes' ? 'black' : multiMode === 'no' ? '#ef4444' : 'rgba(255,255,255,0.5)',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginLeft: '0.25rem'
                            }}
                        >
                            {multiMode === 'no' ? '🚫' : 'M'}
                        </button>
                    </div>

                    {/* Sort & View Options */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                        {/* Notable Toggle */}
                        <label style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            cursor: 'pointer', color: onlyNotable ? 'var(--accent-color)' : 'var(--text-secondary)',
                            fontWeight: onlyNotable ? 'bold' : 'normal',
                            fontSize: '0.9rem'
                        }}>
                            <input
                                type="checkbox"
                                checked={onlyNotable}
                                onChange={(e) => setOnlyNotable(e.target.checked)}
                                style={{ accentColor: 'var(--accent-color)' }}
                            />
                            ★ Notable Only
                        </label>

                        {/* Sort Dropdown */}
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            style={{
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid rgba(167, 139, 250, 0.3)',
                                background: 'rgba(17, 24, 39, 0.8)',
                                color: '#e5e7eb',
                                outline: 'none'
                            }}
                        >
                            <option value="name">Name</option>
                            <option value="edhrec">EDHREC Rank</option>
                            <option value="cmc">Mana Value</option>
                            <option value="usd">Price (USD)</option>
                            <option value="released">Date Released</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        className="glass-input"
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)' }}
                    />
                    <button
                        onClick={() => setShowAdvanced(true)}
                        className="glass-button"
                        style={{
                            padding: '0 1rem',
                            background: advancedFilters ? 'rgba(167, 139, 250, 0.3)' : 'rgba(255,255,255,0.05)',
                            borderColor: advancedFilters ? 'var(--accent-color)' : 'var(--glass-border)',
                            color: advancedFilters ? 'white' : 'var(--text-secondary)'
                        }}
                        title="Advanced Filters"
                    >
                        ⚙
                    </button>
                    {advancedFilters && (
                        <button
                            onClick={() => setAdvancedFilters(null)}
                            title="Clear Filters"
                            style={{
                                background: 'transparent', border: 'none', color: '#ef4444',
                                cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem'
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            <AdvancedSearchModal
                isOpen={showAdvanced}
                onClose={() => setShowAdvanced(false)}
                onApply={setAdvancedFilters}
                initialFilters={advancedFilters}
            />

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
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onAddCard(card, 'sideboard', 1); }}
                                        style={{
                                            background: 'rgba(255,255,255,0.2)', border: '1px solid white', borderRadius: '20px',
                                            padding: '0.25rem 0.75rem', fontSize: '0.9rem', color: '#fbbf24', cursor: 'pointer',
                                            fontWeight: 'bold', marginTop: '0.25rem'
                                        }}
                                        title="Add to Sideboard"
                                    >
                                        +SB
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
