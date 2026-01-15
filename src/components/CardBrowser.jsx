import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { searchCards } from '../api/scryfall';
import { LEGACY_BANS } from '../data/legacyBans';
import { NOTABLE_CARDS } from '../data/notableCards';
import { AdvancedSearchModal } from './AdvancedSearchModal';
import { CardItem } from './CardItem';

// Optimizing lookups: Convert arrays to Sets once
const NOTABLE_SETS = Object.fromEntries(
    Object.entries(NOTABLE_CARDS).map(([code, list]) => [code, new Set(list)])
);

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
    const [sortDirection, setSortDirection] = useState('auto');
    const [onlyNotable, setOnlyNotable] = useState(false);

    // Filter displayed cards logic
    // We fetch EVERYTHING (by set/query), then filter locally if "Only Notable" is checked
    const displayedCards = useMemo(() => {
        if (!onlyNotable) return cards;

        return cards.filter(card => {
            const setCode = card.set;
            const notableSet = NOTABLE_SETS[setCode];
            if (!notableSet) return false;

            // Direct match (O(1))
            if (notableSet.has(card.name)) return true;

            // DFC check: if card name has " // ", check if the front part is in the set
            // Optimization: Only split if it looks like a DFC and not found directly
            if (card.name.indexOf(' // ') !== -1) {
                const frontName = card.name.split(' // ')[0];
                return notableSet.has(frontName);
            }

            return false;
        });
    }, [cards, onlyNotable]);

    // Handle sort change helper not needed as we use inline setters now, but keeping for reference if expanded
    // const handleSortChange = ... 

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
            const result = await searchCards(fullQuery, currentPage, { order: sortOrder, dir: sortDirection, signal });

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
    }, [legalSets, query, page, getSetQuery, getColorQuery, getAdvancedQuery, sortOrder, sortDirection]);

    // ... useEffect ...
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCardsData(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [legalSets, query, filters, sortOrder, sortDirection, advancedFilters]); // Added advancedFilters

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
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                style={{
                                    padding: '8px',
                                    borderRadius: '4px 0 0 4px',
                                    border: '1px solid rgba(167, 139, 250, 0.3)',
                                    borderRight: 'none',
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
                                <option value="power">Power</option>
                                <option value="toughness">Toughness</option>
                                <option value="rarity">Rarity</option>
                                <option value="color">Color</option>
                                <option value="set">Set/Number</option>
                            </select>
                            <button
                                onClick={() => setSortDirection(prev => prev === 'auto' ? 'asc' : prev === 'asc' ? 'desc' : 'auto')}
                                title={`Sort Direction: ${sortDirection}`}
                                style={{
                                    padding: '8px 10px',
                                    borderRadius: '0 4px 4px 0',
                                    border: '1px solid rgba(167, 139, 250, 0.3)',
                                    borderLeft: '1px solid rgba(167, 139, 250, 0.3)', // Visual separation
                                    background: 'rgba(17, 24, 39, 0.8)',
                                    color: '#e5e7eb',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    minWidth: '34px'
                                }}
                            >
                                {sortDirection === 'auto' ? '↕' : sortDirection === 'asc' ? '▲' : '▼'}
                            </button>
                        </div>
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
                            <CardItem
                                key={card.id}
                                card={card}
                                count={count}
                                isBanned={isBanned}
                                onAddCard={onAddCard}
                            />
                        );
                    })}
                </div>
            </div>
        </div >
    );
}
