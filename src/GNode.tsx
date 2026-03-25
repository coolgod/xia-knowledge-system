import { useContext } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeTypes } from '@xyflow/react';
import { LangContext, useName } from './context';
import { isConcept } from './knowledge';
import type { GNodeData } from './mindmap';

export function GNode({ data: { node } }: { data: GNodeData }) {
  const lang = useContext(LangContext);
  const name = useName(node);
  const keywords = isConcept(node)
    ? (lang === 'en' ? node.keywordsEn : node.keywordsCn)
    : undefined;

  return (
    <div className={`gnode gnode-${node.type}`}>
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
    </div>
  );
}

export const nodeTypes: NodeTypes = {
  domain: GNode,
  subdomain: GNode,
  topic: GNode,
  concept: GNode,
};
