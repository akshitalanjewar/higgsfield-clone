import {
  Camera,
  ChevronDown,
  CircleHelp,
  Gauge,
  KeyRound,
  Move3d,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

import type {
  AIModel,
  ApertureValue,
  AspectRatio,
  CameraMove,
  LensType,
  QualityLevel,
} from '../types';

interface GenerationControlsProps {
  model: AIModel;

  aspectRatio: AspectRatio;
  onAspectRatioChange: (
    value: AspectRatio
  ) => void;

  duration: number;
  onDurationChange: (
    value: number
  ) => void;

  quality: QualityLevel;
  onQualityChange: (
    value: QualityLevel
  ) => void;

  seed: number | null;
  onSeedChange: (
    value: number | null
  ) => void;

  onRandomiseSeed: () => void;
  onClearSeed: () => void;

  cameraMovement: CameraMove;
  onCameraMovementChange: (
    value: CameraMove
  ) => void;

  cameraSpeed: number;
  onCameraSpeedChange: (
    value: number
  ) => void;

  lens: LensType;
  onLensChange: (
    value: LensType
  ) => void;

  aperture: ApertureValue;
  onApertureChange: (
    value: ApertureValue
  ) => void;

  stabilization: boolean;
  onStabilizationChange: (
    value: boolean
  ) => void;

  disabled?: boolean;
}

const aspectRatios: AspectRatio[] = [
  '16:9',
  '9:16',
  '1:1',
  '4:3',
  '3:4',
  '21:9',
];

const cameraMoves: {
  value: CameraMove;
  label: string;
}[] = [
  {
    value: 'static',
    label: 'Static',
  },
  {
    value: 'pan-left',
    label: 'Pan left',
  },
  {
    value: 'pan-right',
    label: 'Pan right',
  },
  {
    value: 'tilt-up',
    label: 'Tilt up',
  },
  {
    value: 'tilt-down',
    label: 'Tilt down',
  },
  {
    value: 'zoom-in',
    label: 'Zoom in',
  },
  {
    value: 'zoom-out',
    label: 'Zoom out',
  },
  {
    value: 'orbit-left',
    label: 'Orbit left',
  },
  {
    value: 'orbit-right',
    label: 'Orbit right',
  },
  {
    value: 'dolly-in',
    label: 'Dolly in',
  },
  {
    value: 'dolly-out',
    label: 'Dolly out',
  },
  {
    value: 'crane-up',
    label: 'Crane up',
  },
  {
    value: 'crane-down',
    label: 'Crane down',
  },
];

const lenses: LensType[] = [
  '24mm',
  '35mm',
  '50mm',
  '85mm',
  '135mm',
  '200mm',
];

const apertures: ApertureValue[] = [
  'f/1.4',
  'f/1.8',
  'f/2.8',
  'f/4',
  'f/5.6',
  'f/8',
];

export function GenerationControls({
  model,

  aspectRatio,
  onAspectRatioChange,

  duration,
  onDurationChange,

  quality,
  onQualityChange,

  seed,
  onSeedChange,

  onRandomiseSeed,
  onClearSeed,

  cameraMovement,
  onCameraMovementChange,

  cameraSpeed,
  onCameraSpeedChange,

  lens,
  onLensChange,

  aperture,
  onApertureChange,

  stabilization,
  onStabilizationChange,

  disabled = false,
}: GenerationControlsProps) {
  const maxDuration = Math.max(
    model.maxDuration,
    1
  );

  return (
    <div className="space-y-7">

      {/* ================================================== */}
      {/* OUTPUT */}
      {/* ================================================== */}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles
            size={15}
            className="text-brand-400"
          />

          <h3 className="text-xs font-semibold text-white">
            Output
          </h3>
        </div>

        {/* ASPECT RATIO */}

        <div>
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Aspect ratio
          </label>

          <div className="grid grid-cols-3 gap-2">
            {aspectRatios
              .filter((ratio) =>
                model.aspectRatios.includes(
                  ratio
                )
              )
              .map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    onAspectRatioChange(
                      ratio
                    )
                  }
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    aspectRatio === ratio
                      ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                      : 'border-dark-border bg-dark-surface text-slate-400 hover:border-slate-600 hover:text-white'
                  } ${
                    disabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer'
                  }`}
                >
                  {ratio}
                </button>
              ))}
          </div>
        </div>

        {/* DURATION */}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-slate-400">
              Duration
            </label>

            <span className="text-xs font-semibold text-white">
              {duration}s
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={maxDuration}
            value={Math.min(
              duration,
              maxDuration
            )}
            disabled={disabled}
            onChange={(event) =>
              onDurationChange(
                Number(event.target.value)
              )
            }
            className="w-full accent-brand-500"
          />

          <div className="mt-1 flex justify-between text-[10px] text-slate-600">
            <span>1s</span>

            <span>
              {maxDuration}s
            </span>
          </div>
        </div>

        {/* QUALITY */}

        <div className="mt-5">
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Quality
          </label>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                'draft',
                'standard',
                'cinematic',
              ] as QualityLevel[]
            ).map((level) => (
              <button
                key={level}
                type="button"
                disabled={disabled}
                onClick={() =>
                  onQualityChange(
                    level
                  )
                }
                className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize transition ${
                  quality === level
                    ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                    : 'border-dark-border bg-dark-surface text-slate-400 hover:border-slate-600 hover:text-white'
                } ${
                  disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-dark-border" />

      {/* ================================================== */}
      {/* CAMERA */}
      {/* ================================================== */}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Camera
            size={15}
            className="text-brand-400"
          />

          <h3 className="text-xs font-semibold text-white">
            Camera
          </h3>
        </div>

        {/* CAMERA MOVEMENT */}

        <div>
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Camera movement
          </label>

          <div className="relative">
            <Move3d
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <select
              value={cameraMovement}
              disabled={disabled}
              onChange={(event) =>
                onCameraMovementChange(
                  event.target
                    .value as CameraMove
                )
              }
              className="w-full appearance-none rounded-xl border border-dark-border bg-dark-surface py-2.5 pl-9 pr-9 text-sm text-white outline-none transition focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cameraMoves.map(
                (movement) => (
                  <option
                    key={
                      movement.value
                    }
                    value={
                      movement.value
                    }
                  >
                    {movement.label}
                  </option>
                )
              )}
            </select>

            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>
        </div>

        {/* CAMERA SPEED */}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge
                size={14}
                className="text-slate-500"
              />

              <label className="text-xs font-medium text-slate-400">
                Camera speed
              </label>
            </div>

            <span className="text-xs font-semibold text-white">
              {cameraSpeed}%
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={cameraSpeed}
            disabled={disabled}
            onChange={(event) =>
              onCameraSpeedChange(
                Number(event.target.value)
              )
            }
            className="w-full accent-brand-500"
          />

          <div className="mt-1 flex justify-between text-[10px] text-slate-600">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        {/* LENS */}

        <div className="mt-5">
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Lens
          </label>

          <div className="grid grid-cols-3 gap-2">
            {lenses.map(
              (lensValue) => (
                <button
                  key={lensValue}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    onLensChange(
                      lensValue
                    )
                  }
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    lens === lensValue
                      ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                      : 'border-dark-border bg-dark-surface text-slate-400 hover:border-slate-600 hover:text-white'
                  } ${
                    disabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer'
                  }`}
                >
                  {lensValue}
                </button>
              )
            )}
          </div>
        </div>

        {/* APERTURE */}

        <div className="mt-5">
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Aperture
          </label>

          <div className="relative">
            <select
              value={aperture}
              disabled={disabled}
              onChange={(event) =>
                onApertureChange(
                  event.target
                    .value as ApertureValue
                )
              }
              className="w-full appearance-none rounded-xl border border-dark-border bg-dark-surface px-3 py-2.5 pr-9 text-sm text-white outline-none transition focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {apertures.map(
                (apertureValue) => (
                  <option
                    key={
                      apertureValue
                    }
                    value={
                      apertureValue
                    }
                  >
                    {apertureValue}
                  </option>
                )
              )}
            </select>

            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>
        </div>

        {/* ================================================== */}
        {/* IMAGE STABILIZATION */}
        {/* ================================================== */}

        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-dark-border bg-dark-surface p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <RefreshCw
                size={14}
                className="shrink-0 text-slate-500"
              />

              <p className="text-xs font-medium text-slate-300">
                Image Stabilization
              </p>

              <div className="group relative">
                <CircleHelp
                  size={12}
                  className="cursor-help text-slate-600"
                />

                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-52 -translate-x-1/2 rounded-lg border border-dark-border bg-[#111318] p-2.5 text-[10px] leading-4 text-slate-400 shadow-xl group-hover:block">
                  Keeps the composition
                  controlled and reduces
                  simulated camera shake.
                </div>
              </div>
            </div>

            <p className="mt-1 max-w-sm text-[10px] leading-4 text-slate-500">
              {stabilization
                ? 'Stable and controlled camera composition.'
                : 'Natural handheld camera variation.'}
            </p>
          </div>

          {/* ================================================== */}
          {/* FIXED TOGGLE */}
          {/* ================================================== */}

          <button
            type="button"
            role="switch"
            aria-checked={
              stabilization
            }
            aria-label="Toggle image stabilization"
            disabled={disabled}
            onClick={() =>
              onStabilizationChange(
                !stabilization
              )
            }
            className={`relative flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition-colors duration-200 ${
              stabilization
                ? 'border-brand-500 bg-brand-500'
                : 'border-dark-border bg-[#202329]'
            } ${
              disabled
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer'
            }`}
          >
            <span
              className={`block h-4 w-4 shrink-0 rounded-full bg-white shadow-md transition-transform duration-200 ${
                stabilization
                  ? 'translate-x-5'
                  : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      <div className="h-px bg-dark-border" />

      {/* ================================================== */}
      {/* ADVANCED */}
      {/* ================================================== */}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <KeyRound
            size={15}
            className="text-brand-400"
          />

          <h3 className="text-xs font-semibold text-white">
            Advanced
          </h3>
        </div>

        <div className="rounded-xl border border-dark-border bg-dark-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-300">
                Seed
              </p>

              <p className="mt-1 text-[10px] leading-4 text-slate-500">
                Use the same seed for more
                repeatable results.
              </p>
            </div>

            <button
              type="button"
              disabled={disabled}
              onClick={
                onRandomiseSeed
              }
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-dark-border bg-[#111318] px-2.5 py-1.5 text-[10px] font-medium text-slate-400 transition hover:border-brand-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={11}
              />

              Random
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="number"
              value={
                seed === null
                  ? ''
                  : seed
              }
              disabled={disabled}
              placeholder="Random"
              onChange={(event) => {
                const value =
                  event.target.value;

                if (
                  value === ''
                ) {
                  onSeedChange(
                    null
                  );
                  return;
                }

                const parsed =
                  Number(value);

                if (
                  Number.isFinite(
                    parsed
                  )
                ) {
                  onSeedChange(
                    Math.max(
                      0,
                      Math.floor(
                        parsed
                      )
                    )
                  );
                }
              }}
              className="min-w-0 flex-1 rounded-lg border border-dark-border bg-[#111318] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-600 focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            />

            {seed !== null && (
              <button
                type="button"
                disabled={disabled}
                onClick={
                  onClearSeed
                }
                className="rounded-lg border border-dark-border bg-[#111318] px-3 text-xs text-slate-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}