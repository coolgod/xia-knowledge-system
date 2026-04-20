import { useState, useContext } from 'react';
import { LangContext } from './context';
import { ExpandIcon } from './ExpandIcon';
import { isConcept } from './knowledge';
import { familiarityColors, FamiliarityLegend } from './CheckBadge';
import type { TreeNode } from './knowledge';

function nodeName(item: TreeNode, lang: 'en' | 'cn'): string {
  const name = lang === 'en' ? item.node.nameEn : item.node.nameCn;
  if (isConcept(item.node)) {
    const kw = lang === 'en' ? item.node.keywordsEn : item.node.keywordsCn;
    if (kw?.length) return `${name} (${kw.join(', ')})`;
  }
  return name;
}

function LeafTerms({ items }: { items: TreeNode[] }) {
  const lang = useContext(LangContext);
  return (
    <span className="text-sm">
      {items.map((c, i) => (
        <span key={c.node.id}>
          {c.node.familiarity ? (
            <span style={{ color: familiarityColors[c.node.familiarity], fontWeight: 600 }}>
              {nodeName(c, lang)}
            </span>
          ) : (
            <span>{nodeName(c, lang)}</span>
          )}
          {i < items.length - 1 && ', '}
        </span>
      ))}
    </span>
  );
}

type ListItemProps = {
  item: TreeNode;
  depth?: number;
};

function ListItem({ item, depth = 0 }: ListItemProps) {
  const lang = useContext(LangContext);
  const [expanded, setExpanded] = useState(depth === 0);
  const name = lang === 'en' ? item.node.nameEn : item.node.nameCn;

  const leafChildren = item.children.filter(c => c.children.length === 0);
  const nonLeafChildren = item.children.filter(c => c.children.length > 0);
  const allChildrenAreLeaves = item.children.length > 0 && nonLeafChildren.length === 0;

  // All children are leaves — render inline, no expand toggle
  if (allChildrenAreLeaves) {
    return (
      <li className="list-none py-0.5 ml-5 flex items-baseline gap-1.5">
        <span className="shrink-0">•</span>
        <span>
          <span className={depth <= 1 ? 'font-semibold' : 'font-medium'}>{name}: </span>
          <LeafTerms items={leafChildren} />
        </span>
      </li>
    );
  }

  return (
    <li className="list-none">
      <div className="flex items-center gap-1 py-0.5">
        {nonLeafChildren.length > 0
          ? <ExpandIcon expanded={expanded} onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }} />
          : <span className="w-5 shrink-0" />
        }
        <span className={depth <= 1 ? 'font-semibold' : 'font-medium'}>{name}</span>
        <span className="text-[0.75rem] text-slate-400 ml-1">{item.node.type}</span>
      </div>

      {nonLeafChildren.length > 0 && expanded && (
        <ul className="m-0 p-0 ml-5">
          {nonLeafChildren.map(child => (
            <ListItem key={child.node.id} item={child} depth={depth + 1} />
          ))}
          {leafChildren.length > 0 && (
            <li className="list-none py-0.5 ml-5">
              <LeafTerms items={leafChildren} />
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

type ListViewProps = {
  tree: TreeNode[];
};

export function ListView({ tree }: ListViewProps) {
  return (
    <div className="card p-5 overflow-y-auto">
      <div className="flex justify-end mb-3">
        <FamiliarityLegend />
      </div>
      <ul className="m-0 p-0 grid gap-1">
        {tree.map(item => (
          <ListItem key={item.node.id} item={item} depth={0} />
        ))}
      </ul>
    </div>
  );
}
