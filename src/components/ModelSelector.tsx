import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Video, Image } from 'lucide-react';
import type { AIModel } from '../types';
import { cn } from './ui';

interface Props {
  models: AIModel[];
  selectedId: string;
  onChange: (id: string) => void;
}

const FAMILY_COLORS: Record<string, string> = {
  soul:     'bg-brand-600/20 text-brand-400 border-brand-600/30',
  kling:    'bg-cinema-amber/15 text-cinema-amber border-cinema-amber/30',
  veo:      'bg-cinema-emerald/15 text-cinema-emerald border-cinema-emerald/30',
  wan:      'bg-slate-500/15 text-slate-400 border-slate-500/30',
  flux:     'bg-purple-500/15 text-purple-400 border-purple-500/30',
  popcorn:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  seedance: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
};

const SECTION_LABELS: Record<string, string> = {
  soul: 'Higgsfield',
  kling: 'Kling AI',
  veo: 'Google',
  wan: 'Open Source',
  flux: 'Black Forest Labs',
  popcorn: 'Higgsfield',
  seedance: 'Seedance',
};

export function ModelSelector({ models, selectedId, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = models.find(m => m.id === selectedId) ?? models[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Group models by family
  const grouped = models.reduce<Record<string, AIModel[]>>((acc, m) => {
    (acc[m.family] ??= []).push(m);
    return acc;
  }, {});

  const families = [...new Set(models.map(m => m.family))];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium',
          open
            ? 'bg-dark-card border-brand-600/50 text-white'
            : 'bg-dark-card border-dark-border text-slate-300 hover:border-dark-borderLight hover:text-white'
        )}
      >
        {/* Type icon */}
        {selected.type === 'image'
          ? <Image className="w-4 h-4 text-purple-400 flex-shrink-0" />
          : <Video className="w-4 h-4 text-brand-400 flex-shrink-0" />
        }

        <span className="max-w-[140px] truncate">{selected.name}</span>

        <span className={cn(
          'text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border',
          FAMILY_COLORS[selected.family] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/30'
        )}>
          {selected.tag}
        </span>

        <ChevronDown className={cn('w-3.5 h-3.5 text-dark-muted transition-transform flex-shrink-0', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-[340px] glass-dropdown rounded-xl overflow-hidden">
          <div className="max-h-[440px] overflow-y-auto divide-y divide-dark-border/50">
            {families.map(family => (
              <div key={family}>
                <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-dark-muted">
                  {SECTION_LABELS[family] ?? family}
                </p>
                {grouped[family].map(model => (
                  <button
                    key={model.id}
                    onClick={() => { onChange(model.id); setOpen(false); }}
                    className={cn(
                      'w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5',
                      model.id === selectedId && 'bg-brand-600/10'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'mt-0.5 w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 border',
                      FAMILY_COLORS[model.family] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                    )}>
                      {model.type === 'image'
                        ? <Image className="w-3.5 h-3.5" />
                        : <Video className="w-3.5 h-3.5" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{model.name}</span>
                        <span className={cn(
                          'text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border',
                          FAMILY_COLORS[model.family]
                        )}>
                          {model.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-dark-muted mt-0.5 leading-snug line-clamp-2">{model.description}</p>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {model.strengths.slice(0, 3).map(s => (
                          <span key={s} className="text-[9px] bg-dark-border/60 text-slate-400 rounded px-1.5 py-0.5 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Checkmark */}
                    {model.id === selectedId && (
                      <Check className="w-4 h-4 text-brand-400 flex-shrink-0 mt-1" />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
