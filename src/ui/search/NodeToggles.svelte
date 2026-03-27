<script lang="ts">
  import type { Node } from "$lib/types";
  import { treeStore } from "$lib/stores/treeStore";
  import { canvas } from "$lib/canvas/canvasContext";

  function updateAllocatedDisplay() {
    canvas.state.highlightVersion++;
  }

  function toggleNotableNodes() {
    const chosenSocket = $treeStore.chosenSocket;
    if (!chosenSocket) return;

    const socketNodeIds = canvas.treeData.socketNodes[chosenSocket.skill];
    const notableNodes = socketNodeIds
      .map((id) => canvas.treeData.nodes[id])
      .filter((n): n is Node => n && n.isNotable === true);

    const allNotableAllocated =
      notableNodes.length > 0 &&
      notableNodes.every((n) => $treeStore.allocated.has(n.skill.toString()));

    treeStore.update((state) => {
      if (allNotableAllocated) {
        for (const node of notableNodes) {
          state.allocated.delete(node.skill.toString());
          state.locked.delete(node.skill.toString());
        }
      } else {
        for (const node of notableNodes) {
          state.allocated.set(node.skill.toString(), node);
        }
      }
      return state;
    });

    updateAllocatedDisplay();
  }

  function toggleSmallNodes() {
    const chosenSocket = $treeStore.chosenSocket;
    if (!chosenSocket) return;

    const socketNodeIds = canvas.treeData.socketNodes[chosenSocket.skill];
    const smallNodes = socketNodeIds
      .map((id) => canvas.treeData.nodes[id])
      .filter(
        (n): n is Node =>
          n &&
          !n.isNotable &&
          !n.isMastery &&
          !n.isKeystone &&
          !n.isJewelSocket,
      );

    const allSmallAllocated =
      smallNodes.length > 0 &&
      smallNodes.every((n) => $treeStore.allocated.has(n.skill.toString()));

    treeStore.update((state) => {
      if (allSmallAllocated) {
        for (const node of smallNodes) {
          state.allocated.delete(node.skill.toString());
          state.locked.delete(node.skill.toString());
        }
      } else {
        for (const node of smallNodes) {
          state.allocated.set(node.skill.toString(), node);
        }
      }
      return state;
    });
    updateAllocatedDisplay();
  }
</script>

<div class="flex gap-2 mt-6">
  <button
    type="button"
    onclick={toggleNotableNodes}
    class="flex-1 py-2 px-4 bg-amber-700 hover:bg-amber-600 text-white rounded-lg font-medium cursor-pointer transition-all duration-200"
  >
    Notable
  </button>
  <button
    type="button"
    onclick={toggleSmallNodes}
    class="flex-1 py-2 px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-medium cursor-pointer transition-all duration-200"
  >
    Small
  </button>
</div>
