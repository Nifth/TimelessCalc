export interface Group {
	x: number;
	y: number;
	isProxy: boolean;
	orbits: number[];
	background: {
		image: string;
	};
	nodes: string[];
}

export interface Node {
	skill: number;
	name: string;
	icon?: string;
	isNotable?: boolean;
	isMastery?: boolean;
	stats?: string[];
	group?: number;
	orbit?: number;
	orbitIndex?: number;
	out?: string[];
	in?: string[];
	reminderText?: string[];
	inactiveIcon?: string;
}

export interface TreeData {
	tree: string;
	groups: Record<string, Group>;
	nodes: Record<string, Node>;
	constants?: {
		orbitRadii: number[];
		skillsPerOrbit?: number[];
		[key: string]: any;
	};
	min_x?: number;
	min_y?: number;
	max_x?: number;
	max_y?: number;
	imageZoomLevels?: number[];
}
