import { useState, useEffect } from 'react'
import { useFormat } from './hooks/useFormat'
import { useDeck } from './hooks/useDeck'
import { FormatSelector } from './components/FormatSelector'
import { CardBrowser } from './components/CardBrowser'
import { DeckList } from './components/DeckList'
import { TutorialModal } from './components/TutorialModal'
import { getCardPrintings } from './api/scryfall'
import { deduceLockedFormat, getLegalizingBlocks } from './utils/deduction'
import { getExpandedSetList } from './data/blocks'

function App() {
  const {
    selectedCore,
    selectedBlocks,
    legalSets,
    selectCore,
    toggleBlock,
    CORE_SETS,
    TRADITIONAL_BLOCKS,
    MODERN_SETS,
    selectedSetCount
  } = useFormat();

  const { deck, sideboard, addCard, removeCard, moveCard, importDeck, deckName, setDeckName } = useDeck();


  // Navigation State
  const [restrictToSelected, setRestrictToSelected] = useState(false);
  const [browserQuery, setBrowserQuery] = useState(''); // Lifted query for external control
  const [viewingSets, setViewingSets] = useState(new Set());

  // Deductive Logic (Always Active)
  const [requiredBlocks, setRequiredBlocks] = useState(new Set());
  const [legalizingBlocks, setLegalizingBlocks] = useState(new Set());
  const [printingsMap, setPrintingsMap] = useState({});

  // Deductive Logic Effect
  useEffect(() => {
    // Logic always runs now
    const cards = Object.values(deck).map(d => d.card);
    if (cards.length === 0) {
      setRequiredBlocks(new Set());
      setLegalizingBlocks(new Set());
      return;
    }

    // 1. Ensure printings loaded for all cards
    cards.forEach(card => {
      if (!printingsMap[card.name] && !card.type_line?.includes("Basic Land")) {
        getCardPrintings(card.name).then(prints => {
          const printData = prints.map(p => ({ set: p.set, set_name: p.set_name }));
          setPrintingsMap(prev => ({ ...prev, [card.name]: printData }));
        });
      }
    });

    // 2. Run deduction (Required blocks)
    const { lockedCore, lockedBlocks: newLockedBlocks } = deduceLockedFormat(cards, printingsMap);

    // 3. Identification (Passive)
    const newRequiredIds = new Set();
    if (lockedCore) newRequiredIds.add(`core:${lockedCore}`);
    newLockedBlocks.forEach(block => {
      const id = block.type === 'traditional' ? `trad:${block.name}` : `mod:${block.startSet}`;
      newRequiredIds.add(id);
    });
    setRequiredBlocks(newRequiredIds);
  }, [deck, printingsMap]);

  // Legalizing Logic Effect (Depends on legalSets)
  useEffect(() => {
    const cards = Object.values(deck).map(d => d.card);
    if (cards.length === 0) {
      setLegalizingBlocks(new Set());
      return;
    }

    // Identify illegal cards
    const illegalCards = cards.filter(card => {
      if (card.type_line?.includes("Basic Land")) return false;

      const prints = printingsMap[card.name] || [{ set: card.set }];
      // Legal if ANY print is in legalSets
      // legalSets is array of codes
      return !prints.some(p => legalSets.includes(p.set));
    });

    if (illegalCards.length > 0) {
      const helping = getLegalizingBlocks(illegalCards, printingsMap);
      setLegalizingBlocks(helping);
    } else {
      setLegalizingBlocks(new Set());
    }
  }, [deck, printingsMap, legalSets]);

  // Calculate potential sets (sets that contain cards currently in deck)
  const potentialSets = new Set();
  Object.values(deck).forEach(item => {
    const prints = printingsMap[item.card.name];
    if (prints) {
      prints.forEach(p => potentialSets.add(p.set));
    }
  });

  // Calculate effective sets to search/filter
  let effectiveLegalSets = null;
  if (restrictToSelected) {
    effectiveLegalSets = getExpandedSetList(legalSets); // From useFormat (Locked sets)
  } else if (viewingSets.size > 0) {
    effectiveLegalSets = getExpandedSetList(Array.from(viewingSets)); // Explicitly viewing specific sets
  } else {
    effectiveLegalSets = null; // Browse All
  }

  const handleToggleView = (setCode) => {
    setViewingSets(prev => {
      const next = new Set(prev);
      if (next.has(setCode)) {
        next.delete(setCode);
      } else {
        next.add(setCode);
      }
      return next;
    });
    // If viewing sets, ensure we aren't restricted to locked triggers
    if (restrictToSelected) {
      setRestrictToSelected(false);
    }
  };

  const handleClearViews = () => {
    setViewingSets(new Set());
  };

  const handleBatchView = (setCodes) => {
    // Add batch to current view
    setViewingSets(prev => {
      const next = new Set(prev);
      setCodes.forEach(code => next.add(code));
      return next;
    });
    // Unrestrict to allow browsing
    if (restrictToSelected) {
      setRestrictToSelected(false);
    }
  };

  const handleBrowseSet = (setCode) => {
    // If we want to browse a set, we must ensure we aren't restricting to selected (unless that set IS selected, but safer to unrestrict)
    // Actually, user might want to search WITHIN restricted?
    // "Browse cards in sets" usually implies "Show me this set".
    setBrowserQuery(`set:${setCode}`);
    // Optional: Auto-disable restriction if browsing a specific set?
    // setRestrictToSelected(false); 
  };



  // Panel Visibility State
  const [showSidebar, setShowSidebar] = useState(true);
  const [showDecklist, setShowDecklist] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onTutorial) {
      window.electronAPI.onTutorial(() => setShowTutorial(true));
    }
  }, []);

  // ... (Deductive Logic Effect and other code remains same, skipping to return)

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <header style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(15, 23, 42, 0.95)', zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={{
              background: 'transparent', border: '1px solid var(--glass-border)', color: showSidebar ? 'var(--accent-color)' : 'var(--text-secondary)',
              borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: '40px'
            }}
            title={showSidebar ? "Hide Sets" : "Show Sets"}
          >
            {showSidebar ? '◀' : '▶'}
          </button>
          <h1 style={{
            fontSize: '1.5rem',
            background: 'linear-gradient(to right, #a78bfa, #22d3ee)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            BYOS Hub
            <span style={{
              fontSize: '0.8rem',
              background: 'rgba(255,255,255,0.1)',
              color: '#a78bfa',
              WebkitTextFillColor: '#a78bfa',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid rgba(167, 139, 250, 0.3)'
            }}>v1.8.0</span>
          </h1>
        </div>

        <button
          onClick={() => setShowDecklist(!showDecklist)}
          style={{
            background: 'transparent', border: '1px solid var(--glass-border)', color: showDecklist ? 'var(--accent-color)' : 'var(--text-secondary)',
            borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            minWidth: '40px'
          }}
          title={showDecklist ? "Hide Decklist" : "Show Decklist"}
        >
          {showDecklist ? '▶' : '◀'}
        </button>
      </header >

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        {showSidebar && (
          <aside style={{ width: '320px', borderRight: '1px solid var(--glass-border)', background: 'rgba(15, 23, 42, 0.6)' }}>
            <FormatSelector
              selectedCore={selectedCore}
              selectedBlocks={selectedBlocks}
              selectCore={selectCore}
              toggleBlock={toggleBlock}
              CORE_SETS={CORE_SETS}
              TRADITIONAL_BLOCKS={TRADITIONAL_BLOCKS}
              MODERN_SETS={MODERN_SETS}
              selectedSetCount={selectedSetCount}
              requiredBlocks={requiredBlocks}
              restrictToSelected={restrictToSelected}
              onToggleRestriction={() => setRestrictToSelected(!restrictToSelected)}
              onToggleView={handleToggleView}
              viewingSets={viewingSets}
              potentialSets={potentialSets}
              legalizingBlocks={legalizingBlocks}
              onClearViews={handleClearViews}
              onBatchView={handleBatchView}
            />
          </aside>
        )}

        {/* Main Content */}
        <main style={{ flex: 1, padding: '1.5rem', display: 'flex', gap: '1.5rem', overflow: 'hidden' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <CardBrowser
              legalSets={effectiveLegalSets}
              onAddCard={addCard}
              externalQuery={browserQuery}
              onQueryChange={setBrowserQuery}
              deck={deck}
            />
          </div>
          {showDecklist && (
            <div style={{ width: '350px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <DeckList
                deck={deck}
                sideboard={deck.sideboard || sideboard} // handle potential structure mismatch or just pass sideboard directly
                onRemoveCard={removeCard}
                onImportDeck={importDeck}
                deckName={deckName}
                onRenameDeck={setDeckName}
                onAddCard={addCard}
                onMoveCard={moveCard}
                legalSets={legalSets}
                printingsMap={printingsMap} // Pass these down
                setPrintingsMap={setPrintingsMap}
              />
            </div>
          )}
        </main>
      </div>
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </div >
  )
}

export default App
