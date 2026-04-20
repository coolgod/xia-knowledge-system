import { useState } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import knowledge from '../data/knowledge.json';
import {
  buildTree,
  collectSubtreeNodes,
  findTreeNode,
  isConcept,
  validateKnowledge,
  type KnowledgeData,
} from './knowledge';
import { LangContext, type Lang } from './context';
import { buildMindMap } from './mindmap';
import { nodeTypes } from './GNode';
import { NavTree } from './NavTree';
import { ListView } from './ListView';
import { FamiliarityLegend } from './CheckBadge';

const data = knowledge as KnowledgeData;
const tree = buildTree(data);
const validationErrors = validateKnowledge(data);
const totalConcepts = data.nodes.filter(isConcept).length;

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const [mode, setMode] = useState<'graph' | 'list'>('graph');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(tree[0]?.node.id ?? null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const selectedTree = findTreeNode(tree, selectedNodeId) ?? tree[0] ?? null;
  const selectedNode = selectedTree?.node ?? null;
  const selectedSubtreeNodes = selectedTree ? collectSubtreeNodes(selectedTree) : [];
  const { nodes: rfNodes, edges: rfEdges } = selectedTree
    ? buildMindMap(selectedTree)
    : { nodes: [], edges: [] };

  function handleToggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <LangContext.Provider value={lang}>
      <div className="h-svh flex flex-col max-w-[1440px] mx-auto px-5 pt-8 pb-6">

        {/* Header */}
        <header className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-baseline gap-5">
            <h1 className="m-0 text-[1.8rem] font-semibold tracking-tight">Xia Knowledge System</h1>
            <span className="text-[#6a748b] text-sm">
              {tree.length} domains · {totalConcepts} leaf nodes
              {validationErrors.length > 0 && ` · ${validationErrors.length} issues`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-2.5 py-1 border border-slate-900/[0.15] rounded-[5px] bg-white text-[#2f405a] text-[0.8rem] hover:bg-[#f1ecdf] transition-colors"
              onClick={() => setMode(m => m === 'graph' ? 'list' : 'graph')}
              type="button"
            >
              {mode === 'graph' ? 'List' : 'Graph'}
            </button>
            <button
              className="px-2.5 py-1 border border-slate-900/[0.15] rounded-[5px] bg-white text-[#2f405a] text-[0.8rem] hover:bg-[#f1ecdf] transition-colors"
              onClick={() => setLang((l) => (l === 'en' ? 'cn' : 'en'))}
              type="button"
            >
              {lang === 'en' ? '中文' : 'EN'}
            </button>
          </div>
        </header>

        {mode === 'list' ? (
          <ListView tree={tree} />
        ) : (
        <main className="grid grid-cols-[320px_1fr] max-[1080px]:grid-cols-1 gap-4 items-start flex-1 min-h-0">

          {/* Sidebar */}
          <aside className="card self-start p-5 min-w-0 overflow-hidden">
            <h2 className="m-0 text-[1.05rem] mb-4">Knowledge</h2>
            {tree.length > 0 ? (
              <NavTree
                items={tree}
                selectedId={selectedNode?.id ?? null}
                expandedIds={expandedIds}
                onSelect={setSelectedNodeId}
                onToggle={handleToggle}
              />
            ) : (
              <p className="m-0 text-slate-400">No data available.</p>
            )}
          </aside>

          {/* Content */}
          <section className="grid gap-4 h-full">

            {/* Graph panel */}
            <section className="card flex flex-col p-5 min-h-0">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h2 className="m-0 text-[1.05rem]">Graph</h2>
                  <p className="mt-1.5 text-[#6a748b] text-sm">
                    {selectedNode
                      ? `${lang === 'en' ? selectedNode.nameEn : selectedNode.nameCn} — ${selectedSubtreeNodes.length} nodes`
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
                    onNodeClick={(_, node) => setSelectedNodeId(node.id)}
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


            {/* Validation errors */}
            {validationErrors.length > 0 ? (
              <section className="card p-5">
                <div className="flex justify-between items-baseline gap-4 mb-4">
                  <h2 className="m-0 text-[1.05rem]">Validation</h2>
                </div>
                <ul className="grid gap-2 m-0 p-0 list-none">
                  {validationErrors.map((error) => (
                    <li key={error} className="border-l-[3px] border-[#8f3e2c] pl-3 text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

          </section>
        </main>
        )}
      </div>
    </LangContext.Provider>
  );
}
