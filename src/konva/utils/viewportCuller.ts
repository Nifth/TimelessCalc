import Konva from "konva";
import type { Node } from "$lib/types";
import { canvas } from "$lib/konva/canvasContext";

export class ViewportCuller {
  private visibleNodes: Set<number> = new Set();
  private nodeElements: Map<number, Konva.Node> = new Map();
  private bufferSize: number = 100;

  constructor() {
    this.updateBufferSize();
  }

  updateBufferSize(zoomScale: number = 0.2) {
    this.bufferSize = 100 * (1 / zoomScale);
  }

  updateViewport(stage: Konva.Stage) {
    const scale = stage.scaleX();
    this.updateBufferSize(scale);

    const viewport = {
      left: -stage.x() / scale,
      top: -stage.y() / scale,
      right: (-stage.x() + stage.width()) / scale,
      bottom: (-stage.y() + stage.height()) / scale
    };

    const newVisible: Set<number> = new Set();

    // Check which nodes are visible
    Object.values(canvas.treeData.nodes).forEach((node: Node) => {
      if (this.isNodeVisible(node, viewport)) {
        newVisible.add(node.skill);
      }
    });

    // Add newly visible nodes
    newVisible.forEach(skill => {
      if (!this.visibleNodes.has(skill)) {
        this.renderNode(skill);
      }
    });

    // Remove no longer visible nodes
    this.visibleNodes.forEach(skill => {
      if (!newVisible.has(skill)) {
        this.hideNode(skill);
      }
    });

    this.visibleNodes = newVisible;
  }

  private isNodeVisible(node: Node, viewport: { left: number; top: number; right: number; bottom: number }): boolean {
    const buffer = this.bufferSize;
    return !(
      node.x + 50 < viewport.left - buffer ||
      node.x - 50 > viewport.right + buffer ||
      node.y + 50 < viewport.top - buffer ||
      node.y - 50 > viewport.bottom + buffer
    );
  }

  private renderNode(skill: number) {
    const nodeData = canvas.nodes.get(skill);
    if (nodeData) {
      // Node already exists, just make it visible
      const element = this.nodeElements.get(skill);
      if (element) {
        element.visible(true);
        canvas.mainLayer?.batchDraw();
      }
    }
  }

  private hideNode(skill: number) {
    const element = this.nodeElements.get(skill);
    if (element) {
      element.visible(false);
      canvas.mainLayer?.batchDraw();
    }
  }

  registerNode(skill: number, element: Konva.Node) {
    this.nodeElements.set(skill, element);
  }

  getVisibleCount(): number {
    return this.visibleNodes.size;
  }

  forceUpdate() {
    if (canvas.stage) {
      this.updateViewport(canvas.stage);
    }
  }
}

export const viewportCuller = new ViewportCuller();