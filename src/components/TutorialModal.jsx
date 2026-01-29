import React from 'react';

export function TutorialModal({ onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                color: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }} onClick={e => e.stopPropagation()}>
                <h2 style={{
                    marginTop: 0,
                    borderBottom: '1px solid var(--glass-border)',
                    paddingBottom: '1rem',
                    marginBottom: '1rem',
                    color: '#22d3ee'
                }}>Application Features</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <section>
                        <h3 style={{ color: '#a78bfa', marginBottom: '0.5rem' }}>📋 Deck Import</h3>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                            You can import decks directly from your clipboard!
                            <br />
                            1. Copy a deck list (Arena, MTGO text, or .COD XML).
                            <br />
                            2. Click the <strong>Paste</strong> button in the bottom right corner.
                        </p>
                    </section>

                    <section>
                        <h3 style={{ color: '#a78bfa', marginBottom: '0.5rem' }}>🔍 Search Tips</h3>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                            Use Scryfall syntax for advanced searching:
                            <br />
                            - <code>t:creature c:red</code> (Red Creatures)
                            <br />
                            - <code>r:rare cmc&lt;3</code> (Cheap Rares)
                            <br />
                            - <code>o:flying o:haste</code> (Keywords)
                        </p>
                    </section>

                    <section>
                        <h3 style={{ color: '#a78bfa', marginBottom: '0.5rem' }}>🔄 Card Movement</h3>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                            Easily move cards between Main Deck and Sideboard.
                            <br />
                            - Click <strong>SB</strong> on a card to move one copy to the Sideboard.
                            <br />
                            - Click <strong>MD</strong> on a sideboard card to move it back to the Main Deck.
                        </p>
                    </section>

                    <section>
                        <h3 style={{ color: '#a78bfa', marginBottom: '0.5rem' }}>💾 Exporting</h3>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                            When exporting your deck, the application now remembers your last used folder, making it easier to save multiple versions.
                        </p>
                    </section>

                    <section>
                        <h3 style={{ color: '#a78bfa', marginBottom: '0.5rem' }}>🏔 Land Counter</h3>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                            The Main Deck header now displays the total number of lands in your deck (e.g., "24 Lands") to help you balance your mana base.
                        </p>
                    </section>
                    <section>
                        <h3 style={{ color: '#a78bfa', marginBottom: '0.5rem' }}>⚖️ Legalities & Format</h3>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                            The sidebar allows you to select Core Sets and Blocks.
                            <br />
                            - <strong>Locked Sets:</strong> Once you add a card, the application automatically locks into potential sets.
                            <br />
                            - <strong>Restrict View:</strong> Toggle to only show cards legal in your current selection.
                        </p>
                    </section>
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                    <button
                        onClick={onClose}
                        className="glass-button"
                        style={{ padding: '0.5rem 1.5rem' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
