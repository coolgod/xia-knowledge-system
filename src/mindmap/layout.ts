import { countConcepts } from '../data/tree';
import { H_GAP, NODE_H, NODE_W, V_GAP } from './constants';

import type { TreeNode } from '../data/types';
import type { Edge as RFEdge,Node as RFNode } from '@xyflow/react';

type Direction = 'right' | 'left';

const NODE_CONTENT_W = NODE_W - 28;

function charWidth(ch: string): number {
  return /[一-鿿぀-ヿ]/.test(ch) ? 12 : 7;
}

function pillWidth(kw: string): number {
  let w = 13;
  for (const ch of kw) w += charWidth(ch);
  return w;
}

function estimateKwRows(keywords?: string[]): number {
  if (!keywords?.length) return 0;
  let rows = 1;
  let rowW = 0;
  for (const kw of keywords) {
    const pw = pillWidth(kw);
    if (rowW === 0 || rowW + pw <= NODE_CONTENT_W) {
      rowW += pw;
    } else {
      rows++;
      rowW = pw;
    }
  }
  return rows;
}

function nodeHeight(item: TreeNode): number {
  const rows = Math.max(
    estimateKwRows(item.node.keywordsEn),
    estimateKwRows(item.node.keywordsCn),
  );
  if (rows === 0) return NODE_H;
  return Math.max(NODE_H, 60 + rows * 20);
}

export function subtreeHeight(item: TreeNode): number {
  if (item.children.length === 0) return nodeHeight(item);
  return Math.max(
    nodeHeight(item),
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
  const h = nodeHeight(item);

  rfNodes.push({
    id: item.node.id,
    type: item.node.type,
    position: { x: nodeX, y: centerY - h / 2 },
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

  const rootH = nodeHeight(root);
  rfNodes.push({
    id: root.node.id,
    type: root.node.type,
    position: { x: -NODE_W / 2, y: -rootH / 2 },
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
