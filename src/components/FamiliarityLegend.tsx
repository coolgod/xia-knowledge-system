import { CheckBadge } from './CheckBadge';

import type { FamiliarityLevel } from '../data/types';

const familiarityMeta: Record<FamiliarityLevel, { name: string; description: string }> = {
  L0: { name: 'Awareness', description: 'I know it exists and understand the basic idea' },
  L1: { name: 'Familiar', description: 'I understand the concept and can follow along with reference material' },
  L2: { name: 'Proficient', description: 'I can apply it independently, explain it clearly, and reason through problems' },
  L3: { name: 'Expert', description: 'I can derive it from first principles, teach it, and handle edge cases' },
};

export function FamiliarityLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] text-slate-500">
      {(['L0', 'L1', 'L2', 'L3'] as FamiliarityLevel[]).map(level => (
        <span key={level} className="flex items-center gap-1" title={familiarityMeta[level].description}>
          <CheckBadge size={12} familiarity={level} />
          <span>{familiarityMeta[level].name}</span>
        </span>
      ))}
    </div>
  );
}
