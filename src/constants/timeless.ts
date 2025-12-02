import type { Conqueror, JewelType } from "$lib/types";

export const jewelTypes = [
    { label: "Glorious Vanity", name: "vaal", id: 1 },
    { label: "Lethal Pride", name: "karui", id: 2 },
    { label: "Brutal Restraint", name: "maraketh", id: 3 },
    { label: "Militant Faith", name: "templar", id: 4 },
    { label: "Elegant Hubris", name: "eternal", id: 5 },
] as JewelType[];

export const conquerors = {
    vaal: [
        { label: 'Any', id: 1, keystone: 'Any' },
        { label: 'Doryani', id: 2, keystone: 'Corrupted Soul' },
        { label: 'Xibaqua', id: 3, keystone: 'Divine Flesh' },
        { label: 'Ahuana', id: 4, keystone: 'Immortal Ambition' },
    ],
    karui: [
        { label: 'Any', id: 1, keystone: 'Any' },
        { label: 'Kaom', id: 2, keystone: 'Strength of Blood' },
        { label: 'Rakiata', id: 3, keystone: 'Tempered by War' },
        { label: 'Akoya', id: 4, keystone: 'Chainbreaker' },
    ],
    maraketh: [
        { label: 'Any', id: 1, keystone: 'Any' },
        { label: 'Asenath', id: 2, keystone: 'Dance with Death' },
        { label: 'Nasima', id: 3, keystone: 'Second Sight' },
        { label: 'Balbala', id: 4, keystone: 'The Traitor' },
    ],
    templar: [
        { label: 'Any', id: 1, keystone: 'Any' },
        { label: 'Avarius', id: 2, keystone: 'Power of Purpose' },
        { label: 'Dominus', id: 3, keystone: 'Inner Conviction' },
        { label: 'Maxarius', id: 4, keystone: 'Transcendence' },
    ],
    eternal: [
        { label: 'Any', id: 1, keystone: 'Any' },
        { label: 'Cadiro', id: 2, keystone: 'Supreme Decadence' },
        { label: 'Victario', id: 3, keystone: 'Supreme Grandstanding' },
        { label: 'Caspiro', id: 4, keystone: 'Supreme Ostentation' },
    ],  
} as Record<string, Conqueror[]>;