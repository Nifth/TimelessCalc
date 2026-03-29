import { get } from "svelte/store";
import type {
	Node as TreeNode,
	JewelType,
	Conqueror,
	Stat,
	StatSearchMode,
} from "$lib/types";
import { searchStore } from "$lib/stores/searchStore";
import { treeStore } from "$lib/stores/treeStore";
import { jewelTypes, conquerors } from "$lib/constants/timeless";
import { canvas } from "$lib/canvas/canvasContext";
import { centerOnSocket } from "$lib/canvas/utils/coordinate";
import { findNodeBySkill } from "$lib/utils/nodeUtils";
import { DEBUG } from "$lib/constants/debug";

export interface BaseEntry {
	id: string;
	timestamp: number;
	socket: TreeNode;
	jewelType: JewelType;
	conqueror: Conqueror | null;
	stats: Stat[];
	minTotalWeight: number;
	allocatedSkillIds: string[];
	lockedSkillIds: string[];
	statSearchMode?: StatSearchMode;
}

export function createLocalStorageManager<T>(key: string) {
	function load(): T[] {
		try {
			const stored = localStorage.getItem(key);
			return stored ? JSON.parse(stored) : [];
		} catch (e) {
			const error = e instanceof Error ? e : new Error(String(e));
			if (
				error.name === "QuotaExceededError" ||
				error.message.includes("quota")
			) {
				console.warn(
					`Storage quota exceeded while loading ${key}, returning empty array`,
				);
			} else {
				console.warn(`Failed to load ${key} from localStorage:`, e);
			}
			return [];
		}
	}

	function save(data: T[]): void {
		try {
			localStorage.setItem(key, JSON.stringify(data));
		} catch (e) {
			const error = e instanceof Error ? e : new Error(String(e));
			if (
				error.name === "QuotaExceededError" ||
				error.message.includes("quota")
			) {
				console.warn(
					`Storage quota exceeded while saving ${key}, data not persisted`,
				);
			} else {
				console.warn(`Failed to save ${key} to localStorage:`, e);
			}
		}
	}

	return { load, save };
}

export function hasCurrentConfiguration(): boolean {
	const currentSearchStore = get(searchStore);
	const currentTreeStore = get(treeStore);

	return !!(
		currentTreeStore.chosenSocket ||
		currentSearchStore.jewelType ||
		currentSearchStore.conqueror ||
		currentSearchStore.selectedStats.length > 0
	);
}

export function loadConfiguration(entry: BaseEntry): void {
	// Find the correct object references from constants to ensure proper binding
	const jewelType =
		jewelTypes.find((jt) => jt.name === entry.jewelType.name) ||
		entry.jewelType;
	const conquerorOptions = jewelType ? conquerors[jewelType.name] || [] : [];
	const conqueror =
		conquerorOptions.find((c) => c.id === entry.conqueror?.id) ||
		entry.conqueror;

	// Update search store
	searchStore.update((store) => {
		store.jewelType = jewelType;
		store.conqueror = conqueror;
		store.selectedStats = [...entry.stats];
		store.minTotalWeight = entry.minTotalWeight;
		store.statSearchMode = entry.statSearchMode ?? "occurrences";
		store.mode = "stats";
		store.searched = false; // Will be set to true when search executes
		store.statsResults = {};
		store.currentPage = 0;
		store.totalResults = 0;
		store.orderedSeeds = [];
		store.statsSearched = false;
		return store;
	});

	// Update tree store socket and allocated nodes
	treeStore.update((store) => {
		const nodes = canvas.treeData.nodes;
		const skillIndex = canvas.skillIndex;
		const allocated = new Map<string, TreeNode>();

		for (const skillId of entry.allocatedSkillIds || []) {
			const node = findNodeBySkill(parseInt(skillId, 10), nodes, skillIndex);
			if (node) {
				allocated.set(skillId, node);
			}
		}

		const locked = new Map<string, TreeNode>();
		for (const skillId of entry.lockedSkillIds || []) {
			const node = findNodeBySkill(parseInt(skillId, 10), nodes, skillIndex);
			if (node) {
				locked.set(skillId, node);
			}
		}

		store.chosenSocket = entry.socket as TreeNode | null;
		store.allocated = allocated;
		store.locked = locked;

		if (store.chosenSocket) {
			const viewportScale = centerOnSocket(store.chosenSocket);
			store.scale = viewportScale;
		}
		return store;
	});
}

export function createBaseEntry(): BaseEntry | null {
	const currentSearchStore = get(searchStore);
	const currentTreeStore = get(treeStore);

	if (DEBUG) {
		console.log(
			"Creating entry - allocated nodes:",
			currentTreeStore.allocated.size,
		);
	}

	// Only save if we have required data
	if (
		!currentTreeStore.chosenSocket ||
		!currentSearchStore.jewelType ||
		!currentSearchStore.conqueror
	) {
		return null;
	}

	const allocatedSkillIds = Array.from(currentTreeStore.allocated.keys());
	const lockedSkillIds = Array.from(currentTreeStore.locked.keys());

	const entry: BaseEntry = {
		id: crypto.randomUUID(),
		timestamp: Date.now(),
		socket: currentTreeStore.chosenSocket!,
		jewelType: currentSearchStore.jewelType!,
		conqueror: currentSearchStore.conqueror,
		stats: [...currentSearchStore.selectedStats],
		minTotalWeight: currentSearchStore.minTotalWeight,
		allocatedSkillIds,
		lockedSkillIds,
		statSearchMode: currentSearchStore.statSearchMode,
	};

	if (DEBUG) {
		console.log(
			"Entry allocated skill IDs:",
			allocatedSkillIds.length,
			allocatedSkillIds,
		);
	}

	return entry;
}
