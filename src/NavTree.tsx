import { useContext } from 'react';
import { LangContext } from './context';
import { ExpandIcon } from './ExpandIcon';
import { countLeafNodes, countLeafNodesWithFamiliarity } from './knowledge';
import type { TreeNode } from './knowledge';

type NavTreeProps = {
  items: TreeNode[];
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  depth?: number;
};

export function NavTree({ items, selectedId, expandedIds, onSelect, onToggle, depth = 0 }: NavTreeProps) {
  const lang = useContext(LangContext);
  return (
    <ul className="nav-tree m-0 p-0 list-none grid gap-2">
      {items.map(({ node, children }) => {
        const canExpand = depth === 0 && children.length > 0;
        const isExpanded = expandedIds.has(node.id);
        const isSelected = selectedId === node.id;
        const treeItem = { node, children };
        const total = countLeafNodes(treeItem);
        const familiar = countLeafNodesWithFamiliarity(treeItem);
        return (
          <li key={node.id}>
            <button
              className={[
                'w-full border rounded-[5px] bg-white text-inherit text-left',
                'flex justify-between items-start gap-2.5 px-3 py-2.5 text-sm',
                isSelected
                  ? 'border-[rgba(31,79,120,0.45)] bg-[rgba(31,79,120,0.08)]'
                  : 'border-slate-900/[0.08]',
              ].join(' ')}
              onClick={() => onSelect(node.id)}
              type="button"
              title={lang === 'en' ? node.nameEn : node.nameCn}
            >
              <span className="flex items-center gap-1 min-w-0">
                {canExpand && (
                  <ExpandIcon
                    expanded={isExpanded}
                    onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
                  />
                )}
                <span className="break-words">{lang === 'en' ? node.nameEn : node.nameCn}</span>
              </span>
              <span className="inline-flex flex-wrap gap-1.5 justify-end shrink-0">
                <span className="badge">{familiar}/{total}</span>
              </span>
            </button>
            {canExpand && isExpanded ? (
              <div className="mt-2 ml-4">
                <NavTree
                  items={children}
                  selectedId={selectedId}
                  expandedIds={expandedIds}
                  onSelect={onSelect}
                  onToggle={onToggle}
                  depth={depth + 1}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
