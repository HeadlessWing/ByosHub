import { useState, useMemo } from 'react';
import { CORE_SETS, TRADITIONAL_BLOCKS, MODERN_SETS } from '../data/blocks';

export function useFormat() {
    const [selectedCore, setSelectedCore] = useState(null);
    const [selectedBlocks, setSelectedBlocks] = useState([]);

    const getBlockSetCount = (block) => {
        if (!block) return 0;
        if (block.type === 'traditional') {
            return block.sets.length;
        }
        if (block.type === 'modern') {
            return 3;
        }
        return 0;
    };

    const legalSets = useMemo(() => {
        const sets = new Set();

        // Add Core Set
        if (selectedCore) {
            sets.add(selectedCore.code);
        }

        // Add Blocks
        selectedBlocks.forEach(block => {
            if (!block) return;

            if (block.type === 'traditional') {
                block.sets.forEach(code => sets.add(code));
            } else if (block.type === 'modern') {
                // Modern "block" is 3 adjacent sets starting from the selected one
                const startIndex = MODERN_SETS.findIndex(s => s.code === block.startSet);
                if (startIndex !== -1) {
                    let count = 0;
                    let i = startIndex;
                    // Iterate and pick 3 "main" sets, including any children along the way
                    while (i < MODERN_SETS.length) {
                        const set = MODERN_SETS[i];

                        // If it's a main set (not a child), increment our count
                        if (!set.isChild) {
                            if (count >= 3) break; // We found the start of a 4th block, so stop.
                            count++;
                        }

                        // Add the set code
                        sets.add(set.code);

                        // Also add any associated sets (like 'otp' for 'otj', or 'sta' for 'stx')
                        if (set.associated) {
                            set.associated.forEach(a => sets.add(a));
                        }

                        i++;
                    }
                }
            }
        });

        return Array.from(sets);
    }, [selectedCore, selectedBlocks]);

    const selectCore = (coreSetCode) => {
        const set = CORE_SETS.find(s => s.code === coreSetCode);
        setSelectedCore(set || null);
    };

    const toggleBlock = (blockData) => {
        // Check if already selected
        const existingIndex = selectedBlocks.findIndex(b => {
            if (!b) return false;
            if (blockData.type === 'traditional') {
                return b.type === 'traditional' && b.name === blockData.name;
            } else {
                return b.type === 'modern' && b.startSet === blockData.startSet;
            }
        });

        if (existingIndex !== -1) {
            // Deselect: Remove from array
            const newBlocks = [...selectedBlocks];
            newBlocks.splice(existingIndex, 1);
            setSelectedBlocks(newBlocks);
            return;
        }

        // Select new
        // Check budget
        const newBlockCost = getBlockSetCount(blockData);
        let currentBlocks = [...selectedBlocks];
        let currentTotal = currentBlocks.reduce((acc, b) => acc + getBlockSetCount(b), 0);

        // FIFO Eviction until fits
        // While (currentTotal + newBlockCost > 6) remove first
        while (currentTotal + newBlockCost > 6 && currentBlocks.length > 0) {
            const removed = currentBlocks.shift();
            currentTotal -= getBlockSetCount(removed);
        }

        // If it still doesn't fit (e.g. block size > 6, which shouldn't happen), we don't add.
        // But assuming max block size is 4, it should always fit after clearing enough.

        if (currentTotal + newBlockCost <= 6) {
            currentBlocks.push(blockData);
            setSelectedBlocks(currentBlocks);
        } else {
            console.warn("Block too large to fit in budget", blockData);
        }
    };

    const selectedSetCount = selectedBlocks.reduce((acc, b) => acc + getBlockSetCount(b), 0);

    return {
        selectedCore,
        selectedBlocks,
        selectedSetCount,
        legalSets,
        selectCore,
        toggleBlock,
        CORE_SETS,
        TRADITIONAL_BLOCKS,
        MODERN_SETS
    };
}
