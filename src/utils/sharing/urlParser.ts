import { jewelTypes, conquerors } from "$lib/constants/timeless";
import type { TreeData, Stat, Translation, JewelType } from "$lib/types";
import { findNodeBySkill } from "$lib/utils/nodeUtils";
import { canvas } from "$lib/canvas/canvasContext";
import { searchStore } from "$lib/stores/searchStore";
import { treeStore } from "$lib/stores/treeStore";
import {
	initializeSearchStore,
	finalizeSearchStoreInitialization,
} from "$lib/utils/sidebar/searchUtils";
import { reconstructAllocatedNodes } from "$lib/utils/socketNodeProcessor";
import { DEBUG } from "$lib/constants/debug";

function validateStatsArray(data: unknown): Stat[] {
	if (!Array.isArray(data)) return [];
	const maxArrayLength = 50;
	if (data.length > maxArrayLength) return [];

	return data.filter((item): item is Stat => {
		if (typeof item !== "object" || item === null) return false;
		const stat = item as Partial<Stat>;
		return (
			typeof stat.statKey === "number" &&
			stat.statKey >= 0 &&
			typeof stat.label === "string" &&
			stat.label.length <= 200 &&
			typeof stat.weight === "number" &&
			stat.weight >= 0
		);
	});
}

function validateNumberArray(data: unknown, maxLength = 100): number[] {
	if (!Array.isArray(data)) return [];
	if (data.length > maxLength) return [];
	return data.filter(
		(item): item is number => typeof item === "number" && !isNaN(item),
	);
}

/**
 * Parses URL parameters and initializes the application state
 */
export async function parseUrlAndInitialize(
	treeData: TreeData,
	_canvas: null,
	performSearch: (
		mode: "seed" | "stats" | null,
		seedInput: number | null,
		translation: Record<string, Translation[]>,
		jewelType: JewelType | null,
		selectedStats: Stat[],
	) => Promise<void>,
	translation: Record<string, Translation[]>,
): Promise<boolean> {
	const urlParams = new URLSearchParams(window.location.search);

	// If no URL parameters, nothing to do
	if (urlParams.toString() === "") {
		return false;
	}

	if (DEBUG) {
		console.log(
			"Initializing from URL parameters:",
			Object.fromEntries(urlParams.entries()),
		);
	}

	// Check for required parameters
	const jewelTypeName = urlParams.get("jt");
	const conquerorLabel = urlParams.get("c");
	const selectedStatsJson = urlParams.get("s");
	const seedStr = urlParams.get("seed");
	const socketSkillStr = urlParams.get("so");

	if (
		!jewelTypeName ||
		!conquerorLabel ||
		!socketSkillStr ||
		(!selectedStatsJson && !seedStr)
	) {
		console.log(
			"Missing required URL parameters (jt, c, so, and s or seed), skipping initialization",
		);
		return false;
	}

	// Parse jewel type
	const jewelType = jewelTypes.find((jt) => jt.name === jewelTypeName) || null;
	if (!jewelType) {
		console.warn("Invalid jewel type:", jewelTypeName);
		return false;
	}

	// Parse conqueror
	const jewelTypeConquerors = conquerors[jewelType.name] || [];
	const conqueror =
		jewelTypeConquerors.find((c) => c.label === conquerorLabel) || null;
	if (!conqueror) {
		console.warn("Invalid conqueror:", conquerorLabel);
		return false;
	}

	// Parse selected stats
	let selectedStats: Stat[] = [];
	if (selectedStatsJson) {
		try {
			const parsed = JSON.parse(selectedStatsJson);
			selectedStats = validateStatsArray(parsed);
		} catch (e) {
			console.error("Failed to parse selected stats from URL:", e);
			return false;
		}
	}

	// Parse seed
	let seed: number | null = null;
	if (seedStr) {
		seed = parseInt(seedStr, 10) || null;
		if (seed === null || isNaN(seed)) {
			console.warn("Invalid seed:", seedStr);
			return false;
		}
	}

	// Parse league
	// Todo: change default value to retrieve from API
	const league = urlParams.get("l") || "Keepers";

	// Parse platform
	const platform =
		(urlParams.get("p") as "PC" | "Xbox" | "Playstation") || "PC";

	// Parse mode
	const modeStr = urlParams.get("m");
	let mode: "seed" | "stats" | null = null;
	if (modeStr === "seed" || modeStr === "stats") {
		mode = modeStr;
	} else if (selectedStats.length > 0) {
		mode = "stats";
	} else if (seed) {
		mode = "seed";
	}

	const minTotalWeight = urlParams.get("tw") ? Number(urlParams.get("tw")) : 0;

	// Parse stat search mode (occurrences or totalValue)
	// Default to 'occurrences' for backward compatibility
	const statSearchModeParam = urlParams.get("sm");
	let statSearchMode: "occurrences" | "totalValue" = "occurrences";
	if (
		statSearchModeParam === "occurrences" ||
		statSearchModeParam === "totalValue"
	) {
		statSearchMode = statSearchModeParam;
	}

	// Parse chosen socket
	const socketSkill = parseInt(socketSkillStr, 10);
	if (isNaN(socketSkill)) {
		console.warn("Invalid socket skill:", socketSkillStr);
		return false;
	}
	const chosenSocket = findNodeBySkill(socketSkill, treeData.nodes, canvas.skillIndex);
	if (!chosenSocket) {
		console.warn("Socket not found:", socketSkill);
		return false;
	}

	let allocatedSkills: number[] | null = null;
	let unallocatedSkills: number[] | null = null;
	let lockedSkills: number[] = [];

	try {
		const allocatedRaw = urlParams.get("a");
		if (allocatedRaw) {
			const parsed = JSON.parse(allocatedRaw);
			allocatedSkills = validateNumberArray(parsed);
		}
	} catch (e) {
		console.error("Failed to parse allocated nodes from URL:", e);
	}

	try {
		const unallocatedRaw = urlParams.get("un");
		if (unallocatedRaw) {
			const parsed = JSON.parse(unallocatedRaw);
			unallocatedSkills = validateNumberArray(parsed);
		}
	} catch (e) {
		console.error("Failed to parse unallocated nodes from URL:", e);
	}

	try {
		const lockedRaw = urlParams.get("lk");
		if (lockedRaw) {
			const parsed = JSON.parse(lockedRaw);
			lockedSkills = validateNumberArray(parsed);
		}
	} catch (e) {
		console.error("Failed to parse locked nodes from URL:", e);
	}

	const allocated = reconstructAllocatedNodes(
		socketSkillStr,
		allocatedSkills,
		unallocatedSkills,
		treeData,
	);

	const locked = new Map<string, import("$lib/types").Node>();
	for (const skill of lockedSkills) {
		const node = treeData.nodes[skill.toString()];
		if (node) {
			locked.set(skill.toString(), node);
		}
	}

	// Update stores
	initializeSearchStore({
		jewelType,
		conqueror,
		selectedStats,
		seed,
		league,
		platform,
		mode,
		minTotalWeight: Number(minTotalWeight),
		statSearchMode,
	});

	treeStore.update((t) => {
		t.chosenSocket = chosenSocket;
		t.allocated = allocated;
		t.locked = locked;
		t.search = "";
		t.scale = 0.1;
		t.hovered = null;
		return t;
	});

	// Trigger search if we have search parameters
	if (jewelType && conqueror && selectedStats.length > 0) {
		await performSearch("stats", null, translation, jewelType, selectedStats);
		searchStore.update((s) => {
			s.statsSearched = true;
			return s;
		});
	} else if (jewelType && conqueror && seed) {
		// For seed mode, just set stores without calling applySeed to preserve allocated from URL
		searchStore.update((s) => {
			s.searched = true;
			s.seed = seed;
			s.seedSearched = true;
			return s;
		});
	}

	// Clear URL parameters after successful parsing to prevent re-initialization on reload
	window.history.replaceState(null, "", window.location.pathname);
	finalizeSearchStoreInitialization();
	return true;
}
