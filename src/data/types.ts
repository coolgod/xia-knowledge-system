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
