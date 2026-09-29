import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  Download,
  Expand,
  Film,
  Images,
  Megaphone,
  Plus,
  RefreshCw,
  RotateCcw,
  Settings2,
  ShoppingBag,
  Sparkles,
  Trash2,
  UserRound,
  WandSparkles,
  X,
  Zap,
  Share2,
} from 'lucide-react';

import { Sidebar } from './components/Sidebar';
import { PromptPanel } from './components/PromptPanel';
import { GenerationControls } from './components/GenerationControls';
import { useStudio } from './hooks/useStudio';
import type { GeneratedItem } from './types';

type PreviewItem = GeneratedItem;

function App() {
  const studio = useStudio();

  const [previewItem, setPreviewItem] = useState<PreviewItem | null>(null);
  const [upscaleItem, setUpscaleItem] = useState<PreviewItem | null>(null);

  const [enhancing, setEnhancing] = useState(false);
  const [enhanced, setEnhanced] = useState(false);

  const selectedUpscale = upscaleItem || studio.currentResult;

  const activeModel = useMemo(() => {
    return studio.models.find(
      model => model.id === studio.params.modelId
    );
  }, [studio.models, studio.params.modelId]);

  useEffect(() => {
    if (!studio.currentResult) return;

    if (!upscaleItem) {
      setUpscaleItem(studio.currentResult);
    }
  }, [studio.currentResult, upscaleItem]);

  const openPreview = (item: PreviewItem) => {
    setPreviewItem(item);
  };

  const closePreview = () => {
    setPreviewItem(null);
  };

  const openUpscale = (item: PreviewItem) => {
    setUpscaleItem(item);
    setEnhanced(false);
    setEnhancing(false);
    setPreviewItem(null);
    studio.setNavSection('upscale');
  };

  const handleEnhance = () => {
    if (!selectedUpscale) return;

    setEnhancing(true);
    setEnhanced(false);

    window.setTimeout(() => {
      setEnhancing(false);
      setEnhanced(true);
    }, 1800);
  };

  const handleDelete = (item: PreviewItem) => {
    studio.deleteItem(item.id);
    setPreviewItem(null);

    if (upscaleItem?.id === item.id) {
      setUpscaleItem(null);
    }
  };

  const handleCreateVariation = (item: PreviewItem) => {
    studio.setPrompt(item.params.prompt);
    setPreviewItem(null);
    studio.setNavSection('cinema');
  };

  const handleDownload = (item: PreviewItem) => {
    const url = item.mediaUrl || item.thumbnailUrl;

    if (!url) return;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderCinemaStudio = () => {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-dark-border bg-dark-bg/95 px-6 backdrop-blur">
          <div>
            <p className="text-xs text-slate-500">Workspace</p>
            <h1 className="text-lg font-semibold text-white">
              Cinema Studio
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-lg border border-dark-border bg-dark-card px-3 py-2 sm:block">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-brand-400" />
                <span className="text-xs font-medium text-white">
                  Pro Plan
                </span>
                <span className="text-xs text-slate-500">
                  630 / 1000 credits
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                studio.setPrompt('');
                studio.setNavSection('cinema');
              }}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
            >
              <Plus size={16} />
              New generation
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          <section className="mb-8">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
                <Sparkles size={13} />
                AI Creative Studio
              </div>

              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Turn your idea into a cinematic scene.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Create images and videos with controlled composition,
                camera movement, visual style and generation settings.
              </p>
            </div>
          </section>

          <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ['01', 'Create', 'Describe your scene'],
              ['02', 'Refine', 'Tune style & camera'],
              ['03', 'Review', 'Compare generations'],
              ['04', 'Enhance', 'Upscale the final'],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-xl border border-dark-border bg-dark-card p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-400">
                    {number}
                  </span>
                  <ChevronRight size={14} className="text-slate-600" />
                </div>

                <p className="text-sm font-semibold text-white">
                  {title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-dark-border bg-dark-card">
                <div className="flex items-center justify-between border-b border-dark-border px-5 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Preview
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Your latest generation
                    </p>
                  </div>

                  {studio.currentResult && (
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                      {studio.status === 'generating'
                        ? 'Generating'
                        : 'Ready'}
                    </span>
                  )}
                </div>

                <div className="relative min-h-[390px] bg-[#08090b]">
                  {studio.currentResult ? (
                    <button
                      type="button"
                      onClick={() =>
                        openPreview(studio.currentResult as PreviewItem)
                      }
                      className="group relative block h-full min-h-[390px] w-full"
                    >
                      <img
                        src={
                          studio.currentResult.mediaUrl ||
                          studio.currentResult.thumbnailUrl
                        }
                        alt={studio.currentResult.title}
                        className="absolute inset-0 h-full w-full object-contain transition duration-300 group-hover:scale-[1.01]"
                      />

                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 opacity-0 transition group-hover:opacity-100">
                        <div className="text-left">
                          <p className="text-sm font-medium text-white">
                            {studio.currentResult.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-300">
                            Click to inspect
                          </p>
                        </div>

                        <span className="rounded-lg bg-white/10 p-2 text-white backdrop-blur">
                          <Expand size={16} />
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div className="flex min-h-[390px] flex-col items-center justify-center px-6 text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-dark-border bg-dark-surface">
                        <Film size={24} className="text-slate-500" />
                      </div>

                      <h3 className="text-sm font-semibold text-white">
                        Your creation will appear here
                      </h3>

                      <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                        Describe a scene, select your settings and generate
                        your first cinematic result.
                      </p>
                    </div>
                  )}

                  {studio.status === 'generating' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-sm">
                      <div className="w-72 rounded-2xl border border-white/10 bg-black/80 p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              Creating your scene
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Rendering with{' '}
                              {activeModel?.name || 'AI model'}
                            </p>
                          </div>

                          <Sparkles
                            size={18}
                            className="text-brand-400"
                          />
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(5, studio.progress)
                              )}%`,
                            }}
                          />
                        </div>

                        <p className="mt-2 text-right text-[10px] text-slate-500">
                          {Math.round(studio.progress)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <PromptPanel
                prompt={studio.params.prompt}
                onPromptChange={studio.setPrompt}
                negativePrompt={studio.params.negativePrompt}
                onNegativePromptChange={studio.setNegativePrompt}
                enhance={studio.params.enhance}
                onEnhanceToggle={studio.setEnhance}
                activeStyle={studio.params.stylePreset}
                onStyleChange={studio.setStylePreset}
                disabled={studio.status === 'generating'}
              />

              <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Generation settings
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Fine-tune the output before rendering.
                    </p>
                  </div>

                  <Settings2 size={18} className="text-slate-500" />
                </div>

                <div className="mb-5">
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    AI Model
                  </label>

                  <select
                    value={studio.params.modelId}
                    onChange={event =>
                      studio.setModelId(event.target.value)
                    }
                    disabled={studio.status === 'generating'}
                    className="w-full rounded-xl border border-dark-border bg-dark-surface px-3 py-2.5 text-sm text-white outline-none transition focus:border-brand-500"
                  >
                    {studio.models.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>

                  {activeModel?.description && (
                    <p className="mt-2 text-xs text-slate-500">
                      {activeModel.description}
                    </p>
                  )}
                </div>

                <GenerationControls
                  model={activeModel || studio.models[0]}
                  aspectRatio={studio.params.aspectRatio}
                  onAspectRatioChange={studio.setAspectRatio}
                  duration={studio.params.duration}
                  onDurationChange={studio.setDuration}
                  quality={studio.params.quality}
                  onQualityChange={studio.setQuality}
                  seed={studio.params.seed}
                  onSeedChange={studio.setSeed}
                  onRandomiseSeed={studio.randomiseSeed}
                  onClearSeed={studio.clearSeed}
                  disabled={studio.status === 'generating'}
                />

                <div className="mt-6 flex items-center gap-3">
                  {studio.status === 'generating' ? (
                    <button
                      onClick={studio.cancelGeneration}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/15"
                    >
                      <X size={16} />
                      Cancel generation
                    </button>
                  ) : (
                    <button
                      onClick={studio.generate}
                      disabled={!studio.params.prompt.trim()}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Sparkles size={16} />
                      Generate
                    </button>
                  )}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white">
                    Quick start
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Start from a creative direction.
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    [
                      'Cinematic portrait',
                      'A cinematic close-up portrait, soft dramatic lighting, shallow depth of field, premium film look',
                    ],
                    [
                      'Product campaign',
                      'A premium product campaign scene, studio lighting, elegant composition, high-end commercial photography',
                    ],
                    [
                      'Futuristic city',
                      'A futuristic city at night, neon reflections, cinematic atmosphere, wide establishing shot',
                    ],
                  ].map(([title, prompt]) => (
                    <button
                      key={title}
                      onClick={() => studio.setPrompt(prompt)}
                      className="flex w-full items-center justify-between rounded-xl border border-dark-border bg-dark-surface px-3 py-3 text-left transition hover:border-brand-500/40 hover:bg-brand-500/5"
                    >
                      <div>
                        <p className="text-xs font-medium text-white">
                          {title}
                        </p>
                        <p className="mt-1 line-clamp-1 text-[10px] text-slate-500">
                          {prompt}
                        </p>
                      </div>

                      <ChevronRight
                        size={15}
                        className="shrink-0 text-slate-600"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Recent creations
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Continue where you left off.
                    </p>
                  </div>

                  <button
                    onClick={() => studio.setNavSection('gallery')}
                    className="text-xs font-medium text-brand-400 hover:text-brand-300"
                  >
                    View all
                  </button>
                </div>

                {studio.history.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {studio.history.slice(0, 4).map(item => (
                      <button
                        key={item.id}
                        onClick={() => openPreview(item)}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-dark-border bg-dark-surface"
                      >
                        <img
                          src={item.thumbnailUrl || item.mediaUrl}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />

                        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/60 px-2 py-1 opacity-0 backdrop-blur transition group-hover:opacity-100">
                          <p className="truncate text-[10px] text-white">
                            {item.title}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-dark-border p-6 text-center">
                    <Images
                      size={22}
                      className="mx-auto text-slate-600"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      No creations yet.
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    );
  };

  const renderMarketing = () => {
    const cards = [
      {
        title: 'Product Creative',
        description:
          'Create premium visuals for products, launches and campaigns.',
        icon: ShoppingBag,
      },
      {
        title: 'Social Content',
        description:
          'Generate scroll-stopping creative concepts for social channels.',
        icon: Share2,
      },
      {
        title: 'Ad Concepts',
        description:
          'Explore multiple visual directions for advertising campaigns.',
        icon: Megaphone,
      },
    ];

    return (
      <div className="min-h-screen">
        <header className="border-b border-dark-border px-6 py-5">
          <p className="text-xs text-slate-500">Workspace</p>
          <h1 className="mt-1 text-xl font-semibold text-white">
            Marketing Studio
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Turn a campaign idea into a visual direction in a few steps.
          </p>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-4 md:grid-cols-3">
            {cards.map(card => {
              const Icon = card.icon;

              return (
                <button
                  key={card.title}
                  onClick={() => {
                    studio.setPrompt(
                      `Create a premium ${card.title.toLowerCase()} concept with polished commercial lighting, strong composition and a modern visual identity.`
                    );
                    studio.setNavSection('cinema');
                  }}
                  className="group rounded-2xl border border-dark-border bg-dark-card p-6 text-left transition hover:-translate-y-0.5 hover:border-brand-500/40"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                    <Icon size={22} />
                  </div>

                  <h2 className="text-base font-semibold text-white">
                    {card.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {card.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-xs font-medium text-brand-400">
                    Start creative
                    <ChevronRight size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  };

  const renderSoulId = () => {
    return (
      <div className="min-h-screen">
        <header className="border-b border-dark-border px-6 py-5">
          <p className="text-xs text-slate-500">Identity</p>
          <h1 className="mt-1 text-xl font-semibold text-white">
            Soul ID
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Keep a consistent creative identity across your generations.
          </p>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-8">
          <div className="rounded-2xl border border-dark-border bg-dark-card p-6">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400">
                <UserRound size={28} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">
                  Create your creative identity
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                  Define a consistent visual profile that can be reused
                  across future generations.
                </p>
              </div>

              <button
                onClick={() => studio.setNavSection('cinema')}
                className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
              >
                Use in Studio
              </button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ['Identity', 'Consistent subject appearance'],
                ['Style', 'Reusable visual direction'],
                ['Control', 'Better creative continuity'],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-xl border border-dark-border bg-dark-surface p-4"
                >
                  <p className="text-sm font-medium text-white">
                    {title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  };

  const renderGallery = () => {
    return (
      <div className="min-h-screen">
        <header className="border-b border-dark-border px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Library</p>
              <h1 className="mt-1 text-xl font-semibold text-white">
                Gallery
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Browse and refine your previous generations.
              </p>
            </div>

            <span className="rounded-full border border-dark-border bg-dark-card px-3 py-1.5 text-xs text-slate-400">
              {studio.history.length} creations
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          {studio.history.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {studio.history.map(item => (
                <button
                  key={item.id}
                  onClick={() => openPreview(item)}
                  className="group relative overflow-hidden rounded-2xl border border-dark-border bg-dark-card text-left"
                >
                  <div className="aspect-square overflow-hidden bg-black">
                    <img
                      src={item.thumbnailUrl || item.mediaUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="border-t border-dark-border p-3">
                    <p className="truncate text-xs font-medium text-white">
                      {item.title}
                    </p>

                    <p className="mt-1 truncate text-[10px] text-slate-500">
                      {item.params.prompt}
                    </p>
                  </div>

                  <div className="absolute right-3 top-3 rounded-lg bg-black/60 p-2 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                    <Expand size={14} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-dark-border">
              <Images size={30} className="text-slate-600" />
              <h2 className="mt-4 text-sm font-semibold text-white">
                Your gallery is empty
              </h2>
              <p className="mt-2 text-xs text-slate-500">
                Generate something in Cinema Studio to see it here.
              </p>

              <button
                onClick={() => studio.setNavSection('cinema')}
                className="mt-5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
              >
                Create first generation
              </button>
            </div>
          )}
        </main>
      </div>
    );
  };

  const renderUpscale = () => {
    return (
      <div className="min-h-screen">
        <header className="border-b border-dark-border px-6 py-5">
          <p className="text-xs text-slate-500">Enhancement</p>
          <h1 className="mt-1 text-xl font-semibold text-white">
            Upscale
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Refine the resolution and presentation of your final image.
          </p>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">
          {!selectedUpscale ? (
            <div className="flex min-h-[450px] flex-col items-center justify-center rounded-2xl border border-dashed border-dark-border">
              <WandSparkles size={32} className="text-slate-600" />

              <h2 className="mt-4 text-sm font-semibold text-white">
                Select an image to enhance
              </h2>

              <p className="mt-2 max-w-sm text-center text-xs leading-5 text-slate-500">
                Open an image from your Gallery and choose Upscale, or
                generate a new image first.
              </p>

              <button
                onClick={() => studio.setNavSection('gallery')}
                className="mt-5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500"
              >
                Open Gallery
              </button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="overflow-hidden rounded-2xl border border-dark-border bg-dark-card">
                <div className="flex items-center justify-between border-b border-dark-border px-5 py-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Enhancement preview
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {enhanced
                        ? 'Enhanced preview ready'
                        : 'Preview your selected image'}
                    </p>
                  </div>

                  {enhanced && (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
                      <Check size={12} />
                      Enhanced
                    </span>
                  )}
                </div>

                <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden bg-[#070809] p-4">
                  <img
                    src={
                      selectedUpscale.mediaUrl ||
                      selectedUpscale.thumbnailUrl
                    }
                    alt={selectedUpscale.title}
                    className="max-h-[500px] max-w-full rounded-xl object-contain"
                    onError={event => {
                      const image = event.currentTarget;

                      if (
                        selectedUpscale.thumbnailUrl &&
                        image.src !== selectedUpscale.thumbnailUrl
                      ) {
                        image.src = selectedUpscale.thumbnailUrl;
                      }
                    }}
                  />

                  {enhancing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-sm">
                      <div className="w-72 rounded-2xl border border-white/10 bg-black/85 p-6 text-center shadow-2xl">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-brand-500/20 bg-brand-500/10">
                          <RefreshCw
                            size={20}
                            className="animate-spin text-brand-400"
                          />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-white">
                          Enhancing image
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Improving resolution and fine details...
                        </p>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full w-full animate-pulse rounded-full bg-brand-500" />
                        </div>
                      </div>
                    </div>
                  )}

                  {enhanced && !enhancing && (
                    <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur">
                      <Check size={14} />
                      Enhancement complete
                    </div>
                  )}
                </div>
              </section>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
                  <div className="mb-5">
                    <h2 className="text-sm font-semibold text-white">
                      Enhancement settings
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Configure the final output.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-400">
                        Resolution
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        <button className="rounded-xl border border-brand-500/40 bg-brand-500/10 px-3 py-3 text-left">
                          <p className="text-xs font-semibold text-white">
                            2×
                          </p>
                          <p className="mt-1 text-[10px] text-brand-300">
                            Recommended
                          </p>
                        </button>

                        <button className="rounded-xl border border-dark-border bg-dark-surface px-3 py-3 text-left transition hover:border-slate-600">
                          <p className="text-xs font-semibold text-white">
                            4×
                          </p>
                          <p className="mt-1 text-[10px] text-slate-500">
                            Maximum detail
                          </p>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-400">
                        Detail enhancement
                      </label>

                      <select
                        defaultValue="high"
                        className="w-full rounded-xl border border-dark-border bg-dark-surface px-3 py-2.5 text-sm text-white outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-400">
                        Face enhancement
                      </label>

                      <select
                        defaultValue="auto"
                        className="w-full rounded-xl border border-dark-border bg-dark-surface px-3 py-2.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="on">Always on</option>
                        <option value="off">Off</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleEnhance}
                    disabled={enhancing}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {enhancing ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Enhancing...
                      </>
                    ) : enhanced ? (
                      <>
                        <Check size={16} />
                        Enhanced
                      </>
                    ) : (
                      <>
                        <WandSparkles size={16} />
                        Enhance 2×
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
                  <h3 className="text-xs font-semibold text-white">
                    Selected image
                  </h3>

                  <div className="mt-3 flex gap-3">
                    <img
                      src={
                        selectedUpscale.thumbnailUrl ||
                        selectedUpscale.mediaUrl
                      }
                      alt={selectedUpscale.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-white">
                        {selectedUpscale.title}
                      </p>

                      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">
                        {selectedUpscale.params.prompt}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openPreview(selectedUpscale)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dark-border px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-dark-surface hover:text-white"
                  >
                    <Expand size={14} />
                    View original
                  </button>
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    );
  };

  const renderSection = () => {
    switch (studio.navSection) {
      case 'marketing':
        return renderMarketing();

      case 'soul-id':
        return renderSoulId();

      case 'gallery':
        return renderGallery();

      case 'upscale':
        return renderUpscale();

      case 'cinema':
      default:
        return renderCinemaStudio();
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Sidebar
        active={studio.navSection}
        onChange={studio.setNavSection}
        open={studio.sidebarOpen}
        onToggle={() => studio.setSidebarOpen(!studio.sidebarOpen)}
        historyCount={studio.history.length}
      />

      <main
        className={`min-h-screen transition-all duration-200 ${
          studio.sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {renderSection()}
      </main>

      {previewItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0c0f] shadow-2xl lg:flex-row">
            <button
              onClick={closePreview}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-lg bg-black/60 text-slate-300 backdrop-blur transition hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="relative flex min-h-[380px] flex-1 items-center justify-center bg-black p-5 lg:min-h-[650px]">
              <img
                src={previewItem.mediaUrl || previewItem.thumbnailUrl}
                alt={previewItem.title}
                className="max-h-[78vh] max-w-full rounded-lg object-contain"
                onError={event => {
                  const image = event.currentTarget;

                  if (
                    previewItem.thumbnailUrl &&
                    image.src !== previewItem.thumbnailUrl
                  ) {
                    image.src = previewItem.thumbnailUrl;
                  }
                }}
              />
            </div>

            <aside className="w-full overflow-y-auto border-t border-dark-border bg-dark-card lg:w-[340px] lg:border-l lg:border-t-0">
              <div className="p-5">
                <div className="mb-6">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-400">
                    Generation
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-white">
                    {previewItem.title}
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {previewItem.params.prompt}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-dark-border bg-dark-surface p-3">
                    <p className="text-[10px] text-slate-500">
                      Model
                    </p>
                    <p className="mt-1 truncate text-xs font-medium text-white">
                      {previewItem.params.modelId}
                    </p>
                  </div>

                  <div className="rounded-xl border border-dark-border bg-dark-surface p-3">
                    <p className="text-[10px] text-slate-500">
                      Ratio
                    </p>
                    <p className="mt-1 text-xs font-medium text-white">
                      {previewItem.params.aspectRatio}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => openUpscale(previewItem)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
                  >
                    <WandSparkles size={16} />
                    Upscale
                  </button>

                  <button
                    onClick={() => handleCreateVariation(previewItem)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dark-border bg-dark-surface px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-dark-card hover:text-white"
                  >
                    <RotateCcw size={16} />
                    Create variation
                  </button>

                  <button
                    onClick={() => handleDownload(previewItem)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dark-border bg-dark-surface px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-dark-card hover:text-white"
                  >
                    <Download size={16} />
                    Open / download
                  </button>

                  <button
                    onClick={() => studio.toggleLike(previewItem.id)}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      previewItem.liked
                        ? 'border-brand-500/30 bg-brand-500/10 text-brand-400'
                        : 'border-dark-border bg-dark-surface text-slate-300 hover:text-white'
                    }`}
                  >
                    {previewItem.liked && <Check size={16} />}
                    {previewItem.liked
                      ? 'Saved to favorites'
                      : 'Save to favorites'}
                  </button>

                  <button
                    onClick={() => handleDelete(previewItem)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                    Delete generation
                  </button>
                </div>

                <div className="mt-6 border-t border-dark-border pt-5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    Workflow
                  </p>

                  <div className="mt-3 space-y-3">
                    {[
                      ['Create', true],
                      ['Review', true],
                      ['Enhance', true],
                      ['Publish', false],
                    ].map(([label, done]) => (
                      <div
                        key={label as string}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full ${
                            done
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-dark-surface text-slate-600'
                          }`}
                        >
                          {done ? (
                            <Check size={12} />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-current" />
                          )}
                        </div>

                        <span
                          className={`text-xs ${
                            done
                              ? 'text-slate-300'
                              : 'text-slate-600'
                          }`}
                        >
                          {label as string}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;