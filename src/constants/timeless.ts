import type { Conqueror, JewelType } from "$lib/types";

export const jewelTypes = [
	{ label: "Glorious Vanity", name: "vaal", id: 1, min: 100, max: 8000 },
	{ label: "Lethal Pride", name: "karui", id: 2, min: 10000, max: 18000 },
	{ label: "Brutal Restraint", name: "maraketh", id: 3, min: 500, max: 8000 },
	{ label: "Militant Faith", name: "templar", id: 4, min: 2000, max: 10000 },
	{ label: "Elegant Hubris", name: "eternal", id: 5, min: 2000, max: 160000 },
	{ label: "Heroic Tragedy", name: "kalguur", id: 6, min: 100, max: 8000 },
] as JewelType[];

export const conquerors = {
	vaal: [
		{ label: "Any", id: 1, keystone: "Any", type: "vaal" },
		{ label: "Doryani", id: 2, keystone: "Corrupted Soul", type: "vaal" },
		{ label: "Xibaqua", id: 3, keystone: "Divine Flesh", type: "vaal" },
		{ label: "Ahuana", id: 4, keystone: "Immortal Ambition", type: "vaal" },
	],
	karui: [
		{ label: "Any", id: 1, keystone: "Any", type: "karui" },
		{ label: "Kaom", id: 2, keystone: "Strength of Blood", type: "karui" },
		{ label: "Rakiata", id: 3, keystone: "Tempered by War", type: "karui" },
		{ label: "Akoya", id: 4, keystone: "Chainbreaker", type: "karui" },
	],
	maraketh: [
		{ label: "Any", id: 1, keystone: "Any", type: "maraketh" },
		{ label: "Asenath", id: 2, keystone: "Dance with Death", type: "maraketh" },
		{ label: "Nasima", id: 3, keystone: "Second Sight", type: "maraketh" },
		{ label: "Balbala", id: 4, keystone: "The Traitor", type: "maraketh" },
	],
	templar: [
		{ label: "Any", id: 1, keystone: "Any", type: "templar" },
		{ label: "Avarius", id: 2, keystone: "Power of Purpose", type: "templar" },
		{ label: "Dominus", id: 3, keystone: "Inner Conviction", type: "templar" },
		{ label: "Maxarius", id: 4, keystone: "Transcendence", type: "templar" },
	],
	eternal: [
		{ label: "Any", id: 1, keystone: "Any", type: "eternal" },
		{ label: "Cadiro", id: 2, keystone: "Supreme Decadence", type: "eternal" },
		{
			label: "Victario",
			id: 3,
			keystone: "Supreme Grandstanding",
			type: "eternal",
		},
		{
			label: "Caspiro",
			id: 4,
			keystone: "Supreme Ostentation",
			type: "eternal",
		},
    ],
    kalguur: [
        { label: "Any", id: 1, keystone: "Any", type: "kalguur"},
        { label: "Vorana", id: 2, keystone: "Black Scythe Training", type: "kalguur"},
        { label: "Uhtred", id: 3, keystone: "The Unbreaking Circle", type: "kalguur"},
        { label: "Medved", id: 4, keystone: "Celestial Mathematics", type: "kalguur"},
	]
} as Record<string, Conqueror[]>;
