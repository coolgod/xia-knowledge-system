type ExpandIconProps = {
  expanded: boolean;
  onClick: (e: React.MouseEvent) => void;
};

export function ExpandIcon({ expanded, onClick }: ExpandIconProps) {
  return (
    <span
      className="shrink-0 flex items-center justify-center w-5 h-5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
      onClick={onClick}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
      >
        <path d="M3 2L7 5L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}
