import React, { useState } from 'react';

export function CardItem({ card, count, isBanned, onAddCard }) {
    const [isFlipped, setIsFlipped] = useState(false);

    // Determine if card is double-faced (has card_faces AND no top-level image_uris)
    // Some cards have card_faces but stay on one side (e.g. split cards), but they usually have top-level image_uris (art crop etc) in some JSON versions, 
    // but Scryfall usually puts image_uris in card_faces for Transform cards.
    // Transform cards: no image_uris at root, image_uris in card_faces.
    // Split cards: image_uris at root.
    const isTransform = !card.image_uris && card.card_faces && card.card_faces.length > 1;

    const handleFlip = (e) => {
        e.stopPropagation();
        setIsFlipped(!isFlipped);
    };

    // Get current image URI
    let imageUri = '';
    if (isTransform) {
        imageUri = isFlipped
            ? card.card_faces[1].image_uris?.normal
            : card.card_faces[0].image_uris?.normal;
    } else {
        imageUri = card.image_uris?.normal || (card.card_faces ? card.card_faces[0].image_uris?.normal : '');
    }

    if (!imageUri) {
        return (
            <div className="card-item" style={{ aspectRatio: '63/88', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4.75% / 3.5%', color: 'white' }}>
                No Image
            </div>
        );
    }

    return (
        <div className="card-item" onClick={() => onAddCard(card)} style={{ cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }}>
            <img
                src={imageUri}
                alt={card.name}
                style={{
                    width: '100%',
                    borderRadius: '4.75% / 3.5%',
                    opacity: isBanned ? 0.7 : 1,
                    filter: isBanned ? 'grayscale(100%)' : 'none',
                    transition: 'transform 0.4s',
                }}
            />

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

            {/* Count Badge (if in deck) */}
            {count > 0 && (
                <div style={{
                    position: 'absolute', top: '-8px', right: '-8px',
                    background: 'var(--accent-color)', color: 'black',
                    borderRadius: '50%', width: '24px', height: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    fontSize: '0.8rem'
                }}>
                    {count}
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
                <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                    {isTransform && (
                        <button
                            onClick={handleFlip}
                            style={{
                                background: 'rgba(255,255,255,0.2)', border: '1px solid white', borderRadius: '50%',
                                width: '40px', height: '40px', fontSize: '1.2rem', color: 'white', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title="Flip Card"
                        >
                            ↻
                        </button>
                    )}
                </div>

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
    );
}
