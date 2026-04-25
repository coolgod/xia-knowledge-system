import '@xyflow/react/dist/style.css';

import { Background, Controls,ReactFlow } from '@xyflow/react';
import { useContext } from 'react';
import { LangContext } from '../context';
import { collectSubtreeNodes } from '../data/tree';
import { buildMindMap } from '../mindmap/layout';
import { FamiliarityLegend } from './FamiliarityLegend';
import { nodeTypes } from './GNode';

import type { TreeNode } from '../data/types';

type GraphViewProps = {
  selectedTree: TreeNode | null;
  onNodeClick: (id: string) => void;
};

export function GraphView({ selectedTree, onNodeClick }: GraphViewProps) {
  const lang = useContext(LangContext);
  const selectedNode = selectedTree?.node ?? null;
  const subtreeNodes = selectedTree ? collectSubtreeNodes(selectedTree) : [];
  const { nodes: rfNodes, edges: rfEdges } = selectedTree
    ? buildMindMap(selectedTree)
    : { nodes: [], edges: [] };

  return (
    <section className="card flex flex-col p-5 min-h-0">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h2 className="m-0 text-[1.05rem]">Graph</h2>
          <p className="mt-1.5 text-[#6a748b] text-sm">
            {selectedNode
              ? `${lang === 'en' ? selectedNode.nameEn : selectedNode.nameCn} — ${subtreeNodes.length} nodes`
              : 'Select a node.'}
          </p>
        </div>
        <FamiliarityLegend />
      </div>
      <div className="flex-1 min-h-0 rounded-[5px] overflow-hidden">
        {selectedTree ? (
          <ReactFlow
            key={selectedNode?.id}
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1}
            maxZoom={2}
            nodesDraggable={false}
            nodesConnectable={false}
            onNodeClick={(_, node) => onNodeClick(node.id)}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={20} size={1} color="#e0ddd6" />
            <Controls showInteractive={false} />
          </ReactFlow>
        ) : (
          <p className="m-0 text-slate-400">No node selected.</p>
        )}
      </div>
    </section>
  );
}
