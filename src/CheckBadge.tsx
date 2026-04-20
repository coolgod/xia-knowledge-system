import type { FamiliarityLevel } from './knowledge';

export const familiarityColors: Record<FamiliarityLevel, string> = {
  L0: '#bbf7d0',
  L1: '#4ade80',
  L2: '#22c55e',
  L3: '#16a34a',
};

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

type CheckBadgeProps = {
  size?: number;
  familiarity: FamiliarityLevel;
};

export function CheckBadge({ size = 16, familiarity }: CheckBadgeProps) {
  const color = familiarityColors[familiarity];
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7.5" fill={color} stroke={color} strokeWidth="1.5"/>
      <path d="M4.5 8.5L6.8 10.8L11.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
