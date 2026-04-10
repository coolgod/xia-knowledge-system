import type { FamiliarityLevel } from './knowledge';

export const familiarityColors: Record<FamiliarityLevel, string> = {
  L0: '#bbf7d0',
  L1: '#4ade80',
  L2: '#22c55e',
  L3: '#16a34a',
};

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
