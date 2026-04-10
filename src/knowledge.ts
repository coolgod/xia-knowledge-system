export const nodeTypes = ['domain', 'subdomain', 'topic', 'concept'] as const;

export type NodeType = (typeof nodeTypes)[number];

type BaseNode = {
  id: string;
  nameCn: string;
  nameEn: string;
  prerequisites?: string[];
  familiarity?: FamiliarityLevel;
  keywordsEn?: string[];
  keywordsCn?: string[];
};

export type StructuredNode = BaseNode & {
  type: Exclude<NodeType, 'concept'>;
};

export type ConceptNode = BaseNode & {
  type: 'concept';
};

export type KnowledgeNode = StructuredNode | ConceptNode;

export type KnowledgeEdge = {
  from: string;
  to: string;
  relation: 'contains';
};

export type FamiliarityLevel = 'L0' | 'L1' | 'L2' | 'L3';

export type KnowledgeData = {
  meta?: {
    title?: string;
    familiarity?: Record<FamiliarityLevel, { name: string; description: string }>;
  };
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
};

export type TreeNode = {
  node: KnowledgeNode;
  children: TreeNode[];
};

export const allowedParentTypes: Record<NodeType, NodeType[]> = {
  domain: [],
  subdomain: ['domain'],
  topic: ['subdomain'],
  concept: ['domain', 'subdomain', 'topic'],
};

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

export function validateKnowledge(data: KnowledgeData): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const idPattern = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
  const nodeMap = new Map(data.nodes.map((node) => [node.id, node]));
  const parentCounts = new Map<string, number>();
  const edgeKeys = new Set<string>();

  for (const node of data.nodes) {
    if (!node.id || !idPattern.test(node.id)) {
      errors.push(`Node "${node.nameCn || '(unnamed)'}" has an invalid id.`);
    }

    if (ids.has(node.id)) {
      errors.push(`Node id "${node.id}" is duplicated.`);
    }

    ids.add(node.id);

    if (!node.nameCn.trim()) {
      errors.push(`Node "${node.id}" must have a name.`);
    }

    if (isConcept(node)) {
      // concept-specific validation can go here
    } else if ('priority' in node) {
      errors.push(`Only concept nodes may have priority (${node.id}).`);
    }
  }

  for (const edge of data.edges) {
    const key = `${edge.from}:${edge.to}:${edge.relation}`;

    if (edge.relation !== 'contains') {
      errors.push(`Unsupported relation "${edge.relation}" for edge ${edge.from} -> ${edge.to}.`);
    }

    if (edgeKeys.has(key)) {
      errors.push(`Edge ${edge.from} -> ${edge.to} is duplicated.`);
    }

    edgeKeys.add(key);

    const parent = nodeMap.get(edge.from);
    const child = nodeMap.get(edge.to);

    if (!parent || !child) {
      errors.push(`Edge ${edge.from} -> ${edge.to} references a missing node.`);
      continue;
    }

    if (!allowedParentTypes[child.type].includes(parent.type)) {
      errors.push(`Invalid hierarchy ${parent.type} -> ${child.type} for edge ${edge.from} -> ${edge.to}.`);
    }

    parentCounts.set(child.id, (parentCounts.get(child.id) ?? 0) + 1);
  }

  for (const node of data.nodes) {
    const parentCount = parentCounts.get(node.id) ?? 0;

    if (node.type === 'domain' && parentCount > 0) {
      errors.push(`Domain "${node.id}" cannot have a parent.`);
    }

    if (node.type !== 'domain' && parentCount !== 1) {
      errors.push(`Node "${node.id}" must have exactly one parent.`);
    }
  }

  return errors;
}
