import { isConcept } from './tree';
import { allowedParentTypes } from './types';

import type { KnowledgeData } from './types';

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
