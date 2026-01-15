import React, { useState } from 'react';

export function AdvancedSearchModal({ isOpen, onClose, onApply, initialFilters }) {
    if (!isOpen) return null;

    const [localFilters, setLocalFilters] = useState(initialFilters || {
        oracleText: '',
        typeLine: '',
        mvMin: '',
        mvMax: '',
        powerMin: '',
        powerMax: '',
        touMin: '',
        touMax: '',
        rarities: { common: false, uncommon: false, rare: false, mythic: false },
    });

    const handleRarityChange = (r) => {
        setLocalFilters(prev => ({
            ...prev,
            rarities: { ...prev.rarities, [r]: !prev.rarities[r] }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onApply(localFilters);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={onClose}>
            <div style={{
                background: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '1.5rem',
                width: '500px',
                maxWidth: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }} onClick={e => e.stopPropagation()}>

                <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Advanced Search</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Oracle Text */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>
                            Oracle Text
                        </label>
                        <input
                            type="text"
                            className="glass-input"
                            style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }}
                            placeholder="e.g. 'destroy all creatures'"
                            value={localFilters.oracleText}
                            onChange={(e) => setLocalFilters({ ...localFilters, oracleText: e.target.value })}
                        />
                    </div>

                    {/* Type Line */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>
                            Type Line
                        </label>
                        <input
                            type="text"
                            className="glass-input"
                            style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }}
                            placeholder="e.g. Elf Warrior"
                            value={localFilters.typeLine}
                            onChange={(e) => setLocalFilters({ ...localFilters, typeLine: e.target.value })}
                        />
                    </div>

                    {/* Mana Value */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>
                            Mana Value (CMC)
                        </label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input
                                type="number"
                                min="0" max="20"
                                className="glass-input"
                                style={{ width: '80px', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }}
                                placeholder="Min"
                                value={localFilters.mvMin}
                                onChange={(e) => setLocalFilters({ ...localFilters, mvMin: e.target.value })}
                            />
                            <span style={{ color: '#aaa' }}>to</span>
                            <input
                                type="number"
                                min="0" max="20"
                                className="glass-input"
                                style={{ width: '80px', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }}
                                placeholder="Max"
                                value={localFilters.mvMax}
                                onChange={(e) => setLocalFilters({ ...localFilters, mvMax: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Power & Toughness */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>
                                Power
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    className="glass-input"
                                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }}
                                    placeholder="Min"
                                    value={localFilters.powerMin}
                                    onChange={(e) => setLocalFilters({ ...localFilters, powerMin: e.target.value })}
                                />
                                -
                                <input
                                    type="number"
                                    className="glass-input"
                                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }}
                                    placeholder="Max"
                                    value={localFilters.powerMax}
                                    onChange={(e) => setLocalFilters({ ...localFilters, powerMax: e.target.value })}
                                />
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>
                                Toughness
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    className="glass-input"
                                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }}
                                    placeholder="Min"
                                    value={localFilters.touMin}
                                    onChange={(e) => setLocalFilters({ ...localFilters, touMin: e.target.value })}
                                />
                                -
                                <input
                                    type="number"
                                    className="glass-input"
                                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px' }}
                                    placeholder="Max"
                                    value={localFilters.touMax}
                                    onChange={(e) => setLocalFilters({ ...localFilters, touMax: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rarity */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>
                            Rarity
                        </label>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {['common', 'uncommon', 'rare', 'mythic'].map(r => (
                                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#eee' }}>
                                    <input
                                        type="checkbox"
                                        checked={localFilters.rarities[r]}
                                        onChange={() => handleRarityChange(r)}
                                        style={{ accentColor: 'var(--accent-color)' }}
                                    />
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                background: 'transparent',
                                border: '1px solid var(--glass-border)',
                                color: '#ccc',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                background: 'var(--accent-color)',
                                border: 'none',
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(167, 139, 250, 0.3)'
                            }}
                        >
                            Apply Filters
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
