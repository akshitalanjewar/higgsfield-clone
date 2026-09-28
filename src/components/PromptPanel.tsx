import { useRef, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { STYLE_PRESETS } from '../data/studioData';
import { cn } from './ui';

interface Props {
  prompt: string;
  onPromptChange: (v: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (v: string) => void;
  enhance: boolean;
  onEnhanceToggle: (v: boolean) => void;
  activeStyle: string | null;
  onStyleChange: (id: string | null) => void;
  disabled?: boolean;
}

export function PromptPanel({
  prompt, onPromptChange,
  negativePrompt, onNegativePromptChange,
  enhance, onEnhanceToggle,
  activeStyle, onStyleChange,
  disabled,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [prompt]);

  const placeholder = [
    'A lone cosmonaut floats in the ISS cupola, Earth glowing below, weightless coffee beads drift past, golden hour light...',
    'An ancient dragon lands on a snow-capped mountain peak at sunset, wings casting long dramatic shadows...',
    'Slow tracking shot through a neon-lit Tokyo alley in heavy rain, reflections dancing on wet cobblestones...',
    'Two astronauts discover a monolith on the Moon\'s surface, long shadows, Kubrickian wide angle...',
  ][Math.floor(Date.now() / 60000) % 4];

  return (
    <div className="flex flex-col gap-2.5">
      {/* Style presets */}
      <div className="flex gap-1.5 flex-wrap">
        {STYLE_PRESETS.map(preset => (
          <button
            key={preset.id}
            disabled={disabled}
            onClick={() => onStyleChange(activeStyle === preset.id ? null : preset.id)}
            title={preset.description}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
              activeStyle === preset.id
                ? 'bg-brand-600/20 border-brand-600/50 text-brand-300'
                : 'bg-dark-card border-dark-border text-dark-muted hover:border-dark-borderLight hover:text-slate-300',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className="text-sm leading-none">{preset.emoji}</span>
            {preset.label}
          </button>
        ))}
      </div>

      {/* Main prompt box */}
      <div className={cn(
        'relative rounded-xl border bg-dark-card transition-all duration-200',
        disabled ? 'opacity-70' : 'focus-within:border-brand-600/50 focus-within:bg-dark-cardHover',
        'border-dark-border'
      )}>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={e => onPromptChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-transparent text-sm text-slate-200 placeholder-dark-muted resize-none px-4 pt-3 pb-10 focus:outline-none leading-relaxed min-h-[88px]"
        />

        {/* Bottom toolbar */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
          {/* Enhance toggle */}
          <button
            disabled={disabled}
            onClick={() => onEnhanceToggle(!enhance)}
            className={cn(
              'flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border transition-all',
              enhance
                ? 'bg-brand-600/15 border-brand-600/40 text-brand-400'
                : 'border-dark-border text-dark-muted hover:text-slate-400 hover:border-dark-borderLight',
              disabled && 'cursor-not-allowed'
            )}
          >
            <Sparkles className="w-3 h-3" />
            Enhance
          </button>

          {/* Character count */}
          <span className={cn(
            'text-[10px] tabular-nums',
            prompt.length > 900 ? 'text-cinema-red' : 'text-dark-muted'
          )}>
            {prompt.length} / 1000
          </span>
        </div>

        {/* Clear button */}
        {prompt && !disabled && (
          <button
            onClick={() => onPromptChange('')}
            className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-dark-border/50 flex items-center justify-center text-dark-muted hover:text-slate-300 hover:bg-dark-border transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Negative prompt (collapsible feel) */}
      <div className="relative rounded-lg border border-dark-border bg-dark-card/50 transition-all focus-within:border-dark-borderLight">
        <input
          type="text"
          value={negativePrompt}
          onChange={e => onNegativePromptChange(e.target.value)}
          disabled={disabled}
          placeholder="Negative prompt: blurry, watermark, low quality..."
          className="w-full bg-transparent text-xs text-slate-400 placeholder-dark-muted/60 px-3 py-2 focus:outline-none"
        />
      </div>
    </div>
  );
}
