import React, { useState } from 'react';

export function FormatSelector({
    selectedCore,
    selectedBlocks,
    selectCore,
    toggleBlock,
    CORE_SETS,
    TRADITIONAL_BLOCKS,
    MODERN_SETS,
    selectedSetCount,
    requiredBlocks,
    restrictToSelected,
    onToggleRestriction,
    onToggleView,
    viewingSets,
    onClearViews,

    potentialSets,
    onBatchView,
    legalizingBlocks
}) {
    const [openSection, setOpenSection] = useState('core'); // 'core', 'traditional', 'modern'

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    const isBlockSelected = (id, type) => {
        return selectedBlocks.some(b =>
            b && (type === 'traditional' ? b.name === id : b.startSet === id)
        );
    };

    const isViewing = (code) => viewingSets.has(code);

    const isRequired = (id, type) => {
        if (!requiredBlocks) return false;
        // IDs: core:code, trad:name, mod:startSet
        let checkId;
        if (type === 'core') checkId = `core:${id}`;
        else if (type === 'traditional') checkId = `trad:${id}`;
        else if (type === 'modern') checkId = `mod:${id}`;
        return requiredBlocks.has(checkId);
    };

    const isPotential = (code) => {
        return potentialSets && potentialSets.has(code);
    };

    const isLegalizing = (id, type) => {
        if (!legalizingBlocks) return false;
        let checkId;
        if (type === 'core') checkId = `core:${id}`;
        else if (type === 'traditional') checkId = `trad:${id}`;
        else if (type === 'modern') checkId = `mod:${id}`;
        return legalizingBlocks.has(checkId);
    };

    const handleModernDoubleClick = (code, e) => {
        e.stopPropagation();
        const initialIdx = MODERN_SETS.findIndex(s => s.code === code);

        if (initialIdx !== -1) {
            let idx = initialIdx;

            // IF CHILD: Treat as parent
            if (MODERN_SETS[idx].isChild) {
                let parentIndex = idx - 1;
                while (parentIndex >= 0 && MODERN_SETS[parentIndex].isChild) {
                    parentIndex--;
                }
                if (parentIndex >= 0) {
                    idx = parentIndex; // Update center to parent
                }
            }

            // Find 2 "real" sets before and 2 "real" sets after
            // But include all child sets in between

            // Walk backward to find start index (2 non-child sets before)
            let realCountBefore = 0;
            let startIdx = idx;
            while (realCountBefore < 2 && startIdx > 0) {
                startIdx--;
                if (!MODERN_SETS[startIdx].isChild) {
                    realCountBefore++;
                }
            }

            // Walk forward to find end index (2 non-child sets after)
            let realCountAfter = 0;
            let endIdx = idx;
            while (realCountAfter < 2 && endIdx < MODERN_SETS.length - 1) {
                endIdx++;
                if (!MODERN_SETS[endIdx].isChild) {
                    realCountAfter++;
                }
            }

            // EXTENSION: If the set AFTER endIdx is a child of endIdx (or just a child set), include it too.
            while (endIdx < MODERN_SETS.length - 1 && MODERN_SETS[endIdx + 1].isChild) {
                endIdx++;
            }

            const batch = [];
            for (let i = startIdx; i <= endIdx; i++) {
                batch.push(MODERN_SETS[i].code);
            }
            onBatchView && onBatchView(batch);
        }
    };

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: '280px' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Format Setup</h2>



                {/* Restriction Checkbox & Clear View */}
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', color: 'white' }}>
                        <input
                            type="checkbox"
                            checked={restrictToSelected}
                            onChange={(e) => onToggleRestriction()}
                            style={{ marginRight: '0.5rem' }}
                        />
                        Show only selected sets
                    </label>

                    {viewingSets && viewingSets.size > 0 && (
                        <button
                            onClick={onClearViews}
                            style={{
                                background: 'transparent', border: '1px solid var(--glass-border)',
                                color: 'var(--text-secondary)', borderRadius: '12px',
                                padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer'
                            }}
                            title="Clear all viewed sets"
                        >
                            Clear View ({viewingSets.size})
                        </button>
                    )}
                </div>

                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    1 Core Set • Max 6 Sets ({selectedSetCount || 0}/6)
                </p>
                {/* Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    <span style={{ color: '#10b981' }}>● Required</span>
                    <span style={{ color: '#a855f7' }}>● Legalizes Deck</span>
                    <span style={{ color: '#fbbf24' }}>● Contains Cards</span>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>

                {/* Core Sets */}
                <div style={{ marginBottom: '1rem' }}>
                    <button
                        onClick={() => toggleSection('core')}
                        style={{ width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.05)', border: 'none', padding: '1rem', color: 'white', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}
                    >
                        Core Sets
                        <span>{openSection === 'core' ? '−' : '+'}</span>
                    </button>
                    {openSection === 'core' && (
                        <div style={{ marginTop: '0.5rem', paddingLeft: '0.5rem' }}>
                            {CORE_SETS.map(set => {
                                const required = isRequired(set.code, 'core');
                                const legalizing = isLegalizing(set.code, 'core');
                                const potential = isPotential(set.code) && !required && !legalizing && selectedCore?.code !== set.code;
                                const viewing = isViewing(set.code);
                                return (
                                    <div key={set.code} style={{
                                        display: 'flex', alignItems: 'center', marginBottom: '0.5rem',
                                        padding: '0.25rem', borderRadius: '4px',
                                        background: viewing ? 'rgba(255, 255, 255, 0.1)' : 'transparent', // Highlight viewed
                                        border: required ? '1px solid #10b981' : (legalizing ? '1px solid #a855f7' : (potential ? '1px dashed #fbbf24' : 'none')),
                                        boxShadow: required && selectedCore?.code !== set.code ? '0 0 5px #10b981' : (legalizing ? '0 0 5px #a855f7' : (potential ? '0 0 3px rgba(251, 191, 36, 0.5)' : 'none'))
                                    }}>
                                        <input
                                            type="radio"
                                            name="coreSet"
                                            value={set.code}
                                            checked={selectedCore?.code === set.code}
                                            onChange={() => selectCore(set.code)}
                                            onClick={() => {
                                                if (selectedCore?.code === set.code) {
                                                    selectCore(null);
                                                }
                                            }}
                                            style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                                        />
                                        <div
                                            // toggle view
                                            onClick={() => onToggleView(set.code)}
                                            style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: viewing ? 1 : 0.7 }}
                                            title="Click to toggle view in browser"
                                        >
                                            <span style={{ color: legalizing ? '#a855f7' : (potential ? '#fbbf24' : 'inherit') }}>{set.name}</span>
                                            {viewing && <span style={{ marginLeft: '0.5rem' }}>👁</span>}
                                            {required && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>Required</span>}
                                            {legalizing && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#a855f7', fontWeight: 'bold' }}>Legalizes Deck</span>}
                                            {potential && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#fbbf24', fontStyle: 'italic' }}>Contains Cards</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Traditional Blocks */}
                <div style={{ marginBottom: '1rem' }}>
                    <button
                        onClick={() => toggleSection('traditional')}
                        style={{ width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.05)', border: 'none', padding: '1rem', color: 'white', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}
                    >
                        Traditional Blocks
                        <span>{openSection === 'traditional' ? '−' : '+'}</span>
                    </button>
                    {openSection === 'traditional' && (
                        <div style={{ marginTop: '0.5rem', paddingLeft: '0.5rem' }}>
                            {TRADITIONAL_BLOCKS.map(block => {
                                const isSelected = isBlockSelected(block.name, 'traditional');
                                const required = isRequired(block.name, 'traditional');
                                const legalizing = isLegalizing(block.name, 'traditional');
                                const isAnyViewed = block.sets.some(s => isViewing(s));
                                // Check if ANY set in block is potential
                                const isAnyPotential = block.sets.some(s => isPotential(s));
                                const potential = isAnyPotential && !required && !legalizing && !isSelected;

                                return (
                                    <div key={block.name} style={{
                                        display: 'flex', alignItems: 'center', marginBottom: '0.5rem',
                                        padding: '0.25rem', borderRadius: '4px',
                                        background: isAnyViewed ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                        border: required ? '1px solid #10b981' : (legalizing ? '1px solid #a855f7' : (potential ? '1px dashed #fbbf24' : 'none')),
                                        boxShadow: required && !isSelected ? '0 0 5px #10b981' : (legalizing ? '0 0 5px #a855f7' : (potential ? '0 0 3px rgba(251, 191, 36, 0.5)' : 'none'))
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleBlock({ type: 'traditional', ...block })}
                                            style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                                        />
                                        <div
                                            onClick={() => {
                                                // Toggle ALL sets in block? Or just toggle block leader?
                                                // User expects to browse the block.
                                                // If I toggle view, should I add ALL sets to viewingSets?
                                                // Yes.
                                                block.sets.forEach(s => onToggleView(s));
                                            }}
                                            style={{ flex: 1, cursor: 'pointer', opacity: isAnyViewed ? 1 : 0.7 }}
                                            title="Click to toggle browsing this block"
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ color: legalizing ? '#a855f7' : (potential ? '#fbbf24' : 'inherit') }}>{block.name}</span>
                                                {isAnyViewed && <span>👁</span>}
                                                {required && <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>Required</span>}
                                                {legalizing && <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 'bold' }}>Legalizes Deck</span>}
                                                {potential && <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontStyle: 'italic' }}>Contains Cards</span>}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{block.sets.join(' • ').toUpperCase()}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Modern Blocks */}
                <div style={{ marginBottom: '1rem' }}>
                    <button
                        onClick={() => toggleSection('modern')}
                        style={{ width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.05)', border: 'none', padding: '1rem', color: 'white', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}
                    >
                        Modern Era (3 Sets)
                        <span>{openSection === 'modern' ? '−' : '+'}</span>
                    </button>
                    {openSection === 'modern' && (
                        <div style={{ marginTop: '0.5rem', paddingLeft: '0.5rem' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select start set to form block:</p>
                            {MODERN_SETS.map((set, idx) => {
                                const isStartSet = selectedBlocks.some(b => b.type === 'modern' && b.startSet === set.code);
                                const required = isRequired(set.code, 'modern');
                                const legalizing = isLegalizing(set.code, 'modern');

                                const includedInBlock = selectedBlocks.find(b => {
                                    if (b.type !== 'modern') return false;
                                    const startIdx = MODERN_SETS.findIndex(s => s.code === b.startSet);
                                    if (startIdx === -1) return false;

                                    // Calculate the indices of the 3 "real" sets in this block
                                    let count = 0;
                                    let currentIdx = startIdx;
                                    const indices = [];

                                    while (count < 3 && currentIdx < MODERN_SETS.length) {
                                        if (!MODERN_SETS[currentIdx].isChild) {
                                            count++;
                                        }
                                        indices.push(currentIdx);
                                        currentIdx++;
                                    }

                                    return indices.includes(idx);
                                });

                                const isIncluded = !!includedInBlock;
                                const isImplied = isIncluded && !isStartSet;
                                const viewing = isViewing(set.code);
                                const potential = isPotential(set.code) && !required && !legalizing && !isIncluded;

                                return (
                                    <div key={set.code} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '0.5rem',
                                        padding: '0.25rem',
                                        borderRadius: '4px',
                                        background: viewing ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                        marginLeft: isImplied || set.isChild ? '1.5rem' : '0', // Indent child sets too
                                        border: required ? '1px solid #10b981' : (legalizing ? '1px solid #a855f7' : (potential ? '1px dashed #fbbf24' : 'none')),
                                        boxShadow: required && !isStartSet ? '0 0 5px #10b981' : (legalizing ? '0 0 5px #a855f7' : (potential ? '0 0 3px rgba(251, 191, 36, 0.5)' : 'none'))
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={isIncluded}
                                            disabled={isImplied || set.isChild}
                                            onChange={() => !isImplied && !set.isChild && toggleBlock({ type: 'modern', startSet: set.code, name: set.name + ' Block' })}
                                            style={{ marginRight: '0.75rem', opacity: isImplied || set.isChild ? 0.5 : 1, cursor: isImplied ? 'default' : 'pointer' }}
                                        />
                                        <div
                                            onClick={() => onToggleView(set.code)}
                                            onDoubleClick={(e) => handleModernDoubleClick(set.code, e)}
                                            style={{ flex: 1, opacity: viewing ? 1 : 0.7, display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                                            title="Click to view, Double-Click to view context (+/- 2 sets)"
                                        >
                                            <span style={{ fontSize: '0.9rem', color: legalizing ? '#a855f7' : (potential ? '#fbbf24' : 'inherit') }}>{set.name}</span>
                                            {viewing && <span style={{ marginLeft: '0.5rem' }}>👁</span>}
                                            {isStartSet && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: required ? '#10b981' : '#cyan', fontWeight: 'bold' }}>
                                                {required ? '(Required)' : '(Block Leader)'}
                                            </span>}
                                            {isImplied && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', fontStyle: 'italic' }}>(Included in {includedInBlock.name})</span>}
                                            {required && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>Required</span>}
                                            {legalizing && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#a855f7', fontWeight: 'bold' }}>Legalizes Deck</span>}
                                            {potential && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#fbbf24', fontStyle: 'italic' }}>Contains Cards</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
