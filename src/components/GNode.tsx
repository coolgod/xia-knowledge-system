import { Handle, Position } from '@xyflow/react';
import { useContext } from 'react';
import { LangContext, useName } from '../context';
import { CheckBadge } from './CheckBadge';

import type { GNodeData } from '../mindmap/types';
import type { NodeTypes } from '@xyflow/react';

export function GNode({ data: { node, isLeaf } }: { data: GNodeData }) {
  const lang = useContext(LangContext);
  const name = useName(node);
  const keywords = lang === 'en' ? node.keywordsEn : node.keywordsCn;
  const colorClass = isLeaf ? 'gnode-concept' : `gnode-${node.type}`;

  return (
    <div className={`gnode ${colorClass}`}>
      <Handle type="target" position={Position.Left} id="left-tgt" />
      <Handle type="target" position={Position.Right} id="right-tgt" />
      <Handle type="source" position={Position.Right} id="right-src" />
      <Handle type="source" position={Position.Left} id="left-src" />
      <p className="gnode-name">{name}</p>
      {keywords?.length ? (
        <div className="gnode-keywords">
          {keywords.map((k) => <span key={k} className="gnode-keyword">{k}</span>)}
        </div>
      ) : null}
      {node.familiarity && (
        <div className="gnode-badge">
          <CheckBadge size={20} familiarity={node.familiarity} />
        </div>
      )}
    </div>
  );
}

export const nodeTypes: NodeTypes = {
  domain: GNode,
  subdomain: GNode,
  topic: GNode,
  concept: GNode,
};
