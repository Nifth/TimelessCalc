import { writable } from 'svelte/store';

export const mouseStore = writable({ x: 0, y: 0 });