import { useContext } from 'react';
import { LangContext } from './context';
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
        return (
          <li key={node.id}>
            <button
              className={[
                'w-full border rounded-2xl bg-white text-inherit text-left',
                'flex justify-between items-center gap-2.5 px-3 py-2.5 text-sm',
                isSelected
                  ? 'border-[rgba(31,79,120,0.45)] bg-[rgba(31,79,120,0.08)]'
                  : 'border-slate-900/[0.08]',
              ].join(' ')}
              onClick={() => {
                onSelect(node.id);
                if (canExpand) onToggle(node.id);
              }}
              type="button"
              title={lang === 'en' ? node.nameEn : node.nameCn}
            >
              <span className="flex items-center gap-1.5 min-w-0">
                {canExpand && (
                  <span className="shrink-0 w-3.5 text-[0.8rem] text-slate-400">
                    {isExpanded ? '▾' : '▸'}
                  </span>
                )}
                <span className="truncate">{lang === 'en' ? node.nameEn : node.nameCn}</span>
              </span>
              <span className="inline-flex flex-wrap gap-1.5 justify-end shrink-0">
                <span className="badge">{node.type}</span>
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
