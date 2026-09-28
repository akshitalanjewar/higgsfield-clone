import {
  Clapperboard, Megaphone, UserCircle2, Image, Sparkles,
  ChevronLeft, ChevronRight, LayoutGrid, Wand2,
} from 'lucide-react';
import type { NavSection } from '../types';
import { cn } from './ui';

interface Props {
  active: NavSection;
  onChange: (s: NavSection) => void;
  open: boolean;
  onToggle: () => void;
  historyCount: number;
}

const ITEMS: { id: NavSection; icon: typeof Clapperboard; label: string; badge?: string }[] = [
  { id: 'cinema',    icon: Clapperboard, label: 'Cinema Studio' },
  { id: 'marketing', icon: Megaphone,    label: 'Marketing' },
  { id: 'soul-id',   icon: UserCircle2,  label: 'Soul ID' },
  { id: 'gallery',   icon: LayoutGrid,   label: 'Gallery',  badge: '8' },
  { id: 'upscale',   icon: Wand2,        label: 'Upscale' },
];

export function Sidebar({ active, onChange, open, onToggle, historyCount }: Props) {
  return (
    <aside className={cn(
      'relative flex flex-col flex-shrink-0 bg-dark-surface border-r border-dark-border transition-all duration-300 overflow-hidden',
      open ? 'w-[200px]' : 'w-[56px]'
    )}>
      {/* Logo area */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-dark-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-glow-sm flex-shrink-0">
          <Image className="w-4 h-4 text-white" />
        </div>
        {open && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white leading-none tracking-tight whitespace-nowrap">Higgsfield</p>
            <p className="text-[10px] text-brand-400 font-medium leading-none mt-0.5 whitespace-nowrap">Studio Pro</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {ITEMS.map(({ id, icon: Icon, label, badge }) => {
          const isActive = active === id;
          const count = id === 'gallery' ? historyCount : undefined;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              title={!open ? label : undefined}
              className={cn(
                'w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-150 group relative',
                isActive
                  ? 'bg-brand-600/15 text-brand-400 border border-brand-600/30'
                  : 'text-dark-muted hover:bg-dark-card hover:text-slate-300 border border-transparent'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-brand-400' : 'text-dark-muted group-hover:text-slate-400')} />
              {open && (
                <>
                  <span className="flex-1 text-left truncate leading-none">{label}</span>
                  {count !== undefined && (
                    <span className="text-[10px] font-semibold bg-brand-600/30 text-brand-400 rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none">
                      {count}
                    </span>
                  )}
                </>
              )}
              {/* Active indicator line */}
              {isActive && <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-brand-500 rounded-full" />}
            </button>
          );
        })}
      </nav>

      {/* Plan info */}
      {open && (
        <div className="m-2 p-2.5 rounded-lg bg-brand-600/10 border border-brand-600/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-brand-400" />
            <span className="text-[11px] font-semibold text-brand-400">Pro Plan</span>
          </div>
          <div className="w-full h-1 rounded-full bg-dark-border overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full" style={{ width: '63%' }} />
          </div>
          <p className="text-[10px] text-dark-muted mt-1">630 / 1000 credits</p>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute top-1/2 -right-3 z-10 w-6 h-6 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-dark-muted hover:text-slate-300 hover:bg-dark-cardHover transition-all shadow-md"
      >
        {open ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </aside>
  );
}
