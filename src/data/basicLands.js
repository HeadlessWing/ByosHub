export const BASIC_LANDS = [
    {
        name: 'Plains',
        type_line: 'Basic Land — Plains',
        set: 'fdn', // Using Foundations or a generic code. Scryfall API often returns specific prints.
        // We'll use a generic placeholder object that matches what the app expects (name, type_line, images?)
        // Images might be needed for the card view, but for the deck list, just name/type is critical.
        // Let's include image_uris if possible, or just standard ones.
        // Using "fdn" sets for now as a safe modern default.
        image_uris: {
            normal: "https://cards.scryfall.io/normal/front/1/4/14f5f561-39fa-4e72-9643-d8cd59e7e600.jpg" // Random FDN Plains
        }
    },
    {
        name: 'Island',
        type_line: 'Basic Land — Island',
        set: 'fdn',
        image_uris: {
            normal: "https://cards.scryfall.io/normal/front/b/6/b679123b-586b-45bc-b27b-e104b9019800.jpg"
        }
    },
    {
        name: 'Swamp',
        type_line: 'Basic Land — Swamp',
        set: 'fdn',
        image_uris: {
            normal: "https://cards.scryfall.io/normal/front/2/4/24eeb430-67a6-4191-bb27-775677e59df9.jpg"
        }
    },
    {
        name: 'Mountain',
        type_line: 'Basic Land — Mountain',
        set: 'fdn',
        image_uris: {
            normal: "https://cards.scryfall.io/normal/front/8/e/8e44f808-1cc6-4161-8208-1e4347781b0f.jpg"
        }
    },
    {
        name: 'Forest',
        type_line: 'Basic Land — Forest',
        set: 'fdn',
        image_uris: {
            normal: "https://cards.scryfall.io/normal/front/0/e/0ef6639c-5136-476c-847e-89a320d750c1.jpg"
        }
    }
];
