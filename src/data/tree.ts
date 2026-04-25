import type { ConceptNode, KnowledgeData, KnowledgeNode, TreeNode } from './types';

export function isConcept(node: KnowledgeNode): node is ConceptNode {
  return node.type === 'concept';
}

export function getNode(data: KnowledgeData, id: string | null): KnowledgeNode | undefined {
  if (!id) {
    return undefined;
  }

  return data.nodes.find((node) => node.id === id);
}

export function getParentId(data: KnowledgeData, nodeId: string): string | null {
  return data.edges.find((edge) => edge.relation === 'contains' && edge.to === nodeId)?.from ?? null;
}

export function buildTree(data: KnowledgeData): TreeNode[] {
  const nodeMap = new Map(data.nodes.map((node) => [node.id, node]));
  const childrenByParent = new Map<string, KnowledgeNode[]>();

  for (const edge of data.edges) {
    const child = nodeMap.get(edge.to);

    if (!child) {
      continue;
    }

    const siblings = childrenByParent.get(edge.from) ?? [];
    siblings.push(child);
    childrenByParent.set(edge.from, siblings);
  }

  const visit = (node: KnowledgeNode): TreeNode => ({
    node,
    children: (childrenByParent.get(node.id) ?? []).map(visit),
  });

  return data.nodes
    .filter((node) => node.type === 'domain' && !getParentId(data, node.id))
    .map(visit);
}

export function findTreeNode(items: TreeNode[], id: string | null): TreeNode | null {
  if (!id) {
    return null;
  }

  for (const item of items) {
    if (item.node.id === id) {
      return item;
    }

    const child = findTreeNode(item.children, id);

    if (child) {
      return child;
    }
  }

  return null;
}

export function collectSubtreeNodes(item: TreeNode): KnowledgeNode[] {
  return [item.node, ...item.children.flatMap(collectSubtreeNodes)];
}

export function countConcepts(item: TreeNode): number {
  return collectSubtreeNodes(item).filter(isConcept).length;
}

export function countLeafNodes(item: TreeNode): number {
  if (item.children.length === 0) return 1;
  return item.children.reduce((sum, child) => sum + countLeafNodes(child), 0);
}

export function countLeafNodesWithFamiliarity(item: TreeNode): number {
  if (item.children.length === 0) return item.node.familiarity != null ? 1 : 0;
  return item.children.reduce((sum, child) => sum + countLeafNodesWithFamiliarity(child), 0);
}

export function countConceptsWithFamiliarity(item: TreeNode): number {
  return collectSubtreeNodes(item).filter((n) => isConcept(n) && n.familiarity != null).length;
}

export function getPath(data: KnowledgeData, nodeId: string): KnowledgeNode[] {
  const path: KnowledgeNode[] = [];
  let current = getNode(data, nodeId);

  while (current) {
    path.unshift(current);
    current = getNode(data, getParentId(data, current.id));
  }

  return path;
}
