export const TREE_CONSTANTS = {
	SPRITES: {
		// sprite keys
		GROUP_BACKGROUND: "groupBackground",
		START_NODE: "startNode",
		FRAME: "frame",
		MASTERY_INACTIVE: "masteryInactive",
		MASTERY: "mastery",
		KEYSTONE_INACTIVE: "keystoneInactive",
		KEYSTONE_ACTIVE: "keystoneActive",
		NOTABLE_INACTIVE: "notableInactive",
		NOTABLE_ACTIVE: "notableActive",
		NORMAL_INACTIVE: "normalInactive",
		NORMAL_ACTIVE: "normalActive",
		JEWEL_RADIUS: "jewelRadius",
		// sprite icons
		DEFAULT_ICON: "DefaultInactive",
		KEYSTONE_FRAME_UNALLOCATED: "KeystoneFrameUnallocated",
		KEYSTONE_FRAME_ACTIVE: "KeystoneFrameAllocated",
		NOTABLE_FRAME_UNALLOCATED: "NotableFrameUnallocated",
		NOTABLE_FRAME_ACTIVE: "NotableFrameAllocated",
		DEFAULT_FRAME: "PSSkillFrame",
		DEFAULT_FRAME_ACTIVE: "PSSkillFrameActive",
		JEWEL_FRAME_UNALLOCATED: "JewelFrameUnallocated",
		JEWEL_FRAME_ACTIVE: "JewelFrameAllocated",
		CLUSTER_UNALLOCATED: "JewelSocketAltNormal",
		CLUSTER_ACTIVE: "JewelSocketAltActive",
		START_BACKGROUND: "PSStartNodeBackgroundInactive",
		// sprite config
		HALF_UP: "halfUp",
		HALF_DOWN: "halfDown",
	},
	SOCKET: {
		RADIUS: 1800,
		RADIUS_SPRITES: {
			default: {
				default: "JewelCircle1",
				inverse: "JewelCircle1Inverse",
			},
			karui: {
				default: "KaruiJewelCircle1",
				inverse: "KaruiJewelCircle2",
			},
			vaal: {
				default: "VaalJewelCircle1",
				inverse: "VaalJewelCircle2",
			},
			templar: {
				default: "TemplarJewelCircle1",
				inverse: "TemplarJewelCircle2",
			},
			eternal: {
				default: "EternalEmpireJewelCircle1",
				inverse: "EternalEmpireJewelCircle2",
			},
			maraketh: {
				default: "MarakethJewelCircle1",
				inverse: "MarakethJewelCircle2",
			},
		},
		OPACITY: 0.5,
		DEFAULT: "default",
	},
	LINE_COLOR: "#9f7140",
	LINE_WIDTH: 3,
} as const;

export type HalfDirectionValue = (typeof TREE_CONSTANTS.SPRITES)[
	| "HALF_UP"
	| "HALF_DOWN"];
export type JewelCode = "karui" | "vaal" | "templar" | "eternal" | "maraketh";
