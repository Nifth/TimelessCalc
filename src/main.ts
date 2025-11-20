import { renderTree } from './components/tree/renderer';
import type { TreeData } from './components/tree/types';

import './style.css';

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
  appDiv.innerHTML = '';
  const canvasDiv = document.createElement('div');
  canvasDiv.id = 'tree-canvas';
  appDiv.appendChild(canvasDiv);

  fetch('src/data/tree.json')
    .then((res) => res.json())
    .then((treeData: TreeData) => {
      // Adapter la taille du conteneur selon les bornes du tree
      if (treeData.max_x !== undefined && treeData.min_x !== undefined && treeData.max_y !== undefined && treeData.min_y !== undefined) {
        const width = treeData.max_x - treeData.min_x;
        const height = treeData.max_y - treeData.min_y;
        canvasDiv.style.width = width + 'px';
        canvasDiv.style.height = height + 'px';
      } else {
        canvasDiv.style.width = '1200px';
        canvasDiv.style.height = '900px';
      }
      renderTree(canvasDiv, treeData);
    });
}
