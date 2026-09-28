import { Hash, Shuffle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { AIModel, AspectRatio, QualityLevel } from '../types';
import { cn, SectionLabel } from './ui';

interface Props {
  model: AIModel;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (v: AspectRatio) => void;
  duration: number;
  onDurationChange: (v: number) => void;
  quality: QualityLevel;
  onQualityChange: (v: QualityLevel) => void;
  seed: number | null;
  onSeedChange: (v: number | null) => void;
  onRandomiseSeed: () => void;
  onClearSeed: () => void;
  disabled?: boolean;
}

const ASPECT_RATIO_SHAPES: Record<AspectRatio, string> = {
  '16:9':  'w-8 h-[18px]',
  '9:16':  'w-[10px] h-5',
  '1:1':   'w-5 h-5',
  '4:3':   'w-[26px] h-5',
  '3:4':   'w-5 h-[26px]',
  '21:9':  'w-10 h-[17px]',
};

const QUALITY_LABELS: Record<QualityLevel, { label: string; desc: string; color: string }> = {
  draft:    { label: 'Draft',    desc: 'Fast preview', color: 'text-slate-400' },
  standard: { label: 'Standard', desc: 'Balanced',     color: 'text-cinema-cyan' },
  cinematic:{ label: 'Cinematic',desc: 'Best quality', color: 'text-cinema-gold' },
};

export function GenerationControls({
  model, aspectRatio, onAspectRatioChange,
  duration, onDurationChange,
  quality, onQualityChange,
  seed, onSeedChange, onRandomiseSeed, onClearSeed,
  disabled,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isImage = model.type === 'image';
  const availableRatios = model.aspectRatios;

  return (
    <div className="flex flex-col gap-4">
      {/* Aspect Ratio */}
      <div>
        <SectionLabel>Aspect Ratio</SectionLabel>
        <div className="flex gap-2 flex-wrap">
          {availableRatios.map(ratio => (
            <button
              key={ratio}
              disabled={disabled}
              onClick={() => onAspectRatioChange(ratio)}
              className={cn(
                'flex flex-col items-center gap-1.5 px-2.5 py-2 rounded-lg border text-[10px] font-medium transition-all',
                aspectRatio === ratio
                  ? 'bg-brand-600/15 border-brand-600/50 text-brand-300'
                  : 'border-dark-border text-dark-muted hover:border-dark-borderLight hover:text-slate-300 bg-dark-card',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className={cn(
                'border-2 rounded-sm flex-shrink-0',
                aspectRatio === ratio ? 'border-brand-400' : 'border-dark-muted'
              ) + ' ' + ASPECT_RATIO_SHAPES[ratio]} />
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Duration (video only) */}
      {!isImage && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel className="mb-0">Duration</SectionLabel>
            <span className="text-xs font-semibold text-white tabular-nums">{duration}s</span>
          </div>
          <input
            type="range"
            min={2}
            max={model.maxDuration}
            step={1}
            value={duration}
            disabled={disabled}
            onChange={e => onDurationChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-dark-muted">2s</span>
            <span className="text-[10px] text-dark-muted">{model.maxDuration}s</span>
          </div>
        </div>
      )}

      {/* Quality */}
      <div>
        <SectionLabel>Quality</SectionLabel>
        <div className="flex gap-2">
          {(['draft', 'standard', 'cinematic'] as QualityLevel[]).map(q => {
            const info = QUALITY_LABELS[q];
            return (
              <button
                key={q}
                disabled={disabled}
                onClick={() => onQualityChange(q)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border text-xs font-medium transition-all',
                  quality === q
                    ? 'bg-brand-600/15 border-brand-600/50'
                    : 'bg-dark-card border-dark-border hover:border-dark-borderLight',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span className={quality === q ? info.color : 'text-slate-400'}>{info.label}</span>
                <span className="text-[9px] text-dark-muted">{info.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(v => !v)}
        className="flex items-center gap-1.5 text-[11px] text-dark-muted hover:text-slate-300 transition-colors w-fit"
      >
        {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        Advanced options
      </button>

      {/* Seed */}
      {showAdvanced && (
        <div>
          <SectionLabel>Seed</SectionLabel>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-muted pointer-events-none" />
              <input
                type="number"
                value={seed ?? ''}
                onChange={e => onSeedChange(e.target.value ? Number(e.target.value) : null)}
                disabled={disabled}
                placeholder="Random"
                className="w-full bg-dark-card border border-dark-border rounded-lg pl-7 pr-8 py-2 text-xs text-slate-300 placeholder-dark-muted focus:outline-none focus:border-brand-600/50 disabled:opacity-50"
              />
              {seed !== null && (
                <button
                  onClick={onClearSeed}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-muted hover:text-slate-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              onClick={onRandomiseSeed}
              disabled={disabled}
              title="Random seed"
              className="px-2.5 py-2 rounded-lg bg-dark-card border border-dark-border text-dark-muted hover:text-slate-300 hover:border-dark-borderLight transition-all disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-dark-muted mt-1">Use the same seed to reproduce results</p>
        </div>
      )}
    </div>
  );
}
