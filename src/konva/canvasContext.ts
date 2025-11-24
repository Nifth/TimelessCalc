import type { TreeData } from '$lib/types';
import Konva from 'konva';

export const canvas = {
  stage: null as Konva.Stage | null,
  mainLayer: null as Konva.Layer | null,
  backgroundLayer: null as Konva.Layer | null,
  lineLayer: null as Konva.Layer | null,
  hitLayer: null as Konva.Layer | null,

  treeData: {} as TreeData,
  jewelImages: new Map<number, Konva.Image>(),
  jewelRadiusImages: new Map<string, {a: Konva.Image, b: Konva.Image}>(),
  nodeImages: new Map<number, {icon: Konva.Image, frame: Konva.Image}>(),
};