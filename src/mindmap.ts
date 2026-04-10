import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { countConcepts } from './knowledge';
import type { KnowledgeNode, TreeNode } from './knowledge';

export const NODE_W = 200;
export const NODE_H = 80;
export const H_GAP = 100;
export const V_GAP = 10;

export type GNodeData = { node: KnowledgeNode; conceptCount: number; isLeaf: boolean };

type Direction = 'right' | 'left';

export function subtreeHeight(item: TreeNode): number {
  if (item.children.length === 0) return NODE_H;
  return Math.max(
    NODE_H,
    item.children.reduce((s, c) => s + subtreeHeight(c), 0) + V_GAP * (item.children.length - 1),
  );
}

function placeBranch(
  item: TreeNode,
  edgeX: number,
  centerY: number,
  dir: Direction,
  rfNodes: RFNode[],
  rfEdges: RFEdge[],
  parentId: string,
) {
  const nodeX = dir === 'right' ? edgeX : edgeX - NODE_W;

  rfNodes.push({
    id: item.node.id,
    type: item.node.type,
    position: { x: nodeX, y: centerY - NODE_H / 2 },
    data: { node: item.node, conceptCount: countConcepts(item), isLeaf: item.children.length === 0 },
    style: { width: NODE_W },
  });

  rfEdges.push({
    id: `${parentId}__${item.node.id}`,
    source: parentId,
    sourceHandle: dir === 'right' ? 'right-src' : 'left-src',
    target: item.node.id,
    targetHandle: dir === 'right' ? 'left-tgt' : 'right-tgt',
    type: 'default',
    style: { stroke: '#b0b8cc', strokeWidth: 1.5 },
  });

  if (item.children.length === 0) return;

  const nextEdgeX = dir === 'right' ? edgeX + NODE_W + H_GAP : edgeX - NODE_W - H_GAP;
  const totalH =
    item.children.reduce((s, c) => s + subtreeHeight(c), 0) + V_GAP * (item.children.length - 1);
  let topY = centerY - totalH / 2;

  for (const child of item.children) {
    const childH = subtreeHeight(child);
    placeBranch(child, nextEdgeX, topY + childH / 2, dir, rfNodes, rfEdges, item.node.id);
    topY += childH + V_GAP;
  }
}

export function buildMindMap(root: TreeNode): { nodes: RFNode[]; edges: RFEdge[] } {
  const rfNodes: RFNode[] = [];
  const rfEdges: RFEdge[] = [];

  rfNodes.push({
    id: root.node.id,
    type: root.node.type,
    position: { x: -NODE_W / 2, y: -NODE_H / 2 },
    data: { node: root.node, conceptCount: countConcepts(root) },
    style: { width: NODE_W },
  });

  const { children } = root;
  if (children.length === 0) return { nodes: rfNodes, edges: rfEdges };

  const half = Math.ceil(children.length / 2);
  const rightChildren = children.slice(0, half);
  const leftChildren = children.slice(half);

  function layoutSide(group: TreeNode[], edgeX: number, dir: Direction) {
    const totalH =
      group.reduce((s, c) => s + subtreeHeight(c), 0) + V_GAP * (group.length - 1);
    let topY = -totalH / 2;
    for (const child of group) {
      const childH = subtreeHeight(child);
      placeBranch(child, edgeX, topY + childH / 2, dir, rfNodes, rfEdges, root.node.id);
      topY += childH + V_GAP;
    }
  }

  layoutSide(rightChildren, NODE_W / 2 + H_GAP, 'right');
  layoutSide(leftChildren, -NODE_W / 2 - H_GAP, 'left');

  return { nodes: rfNodes, edges: rfEdges };
}
