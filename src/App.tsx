import { Sidebar } from './components/Sidebar';
import { PromptPanel } from './components/PromptPanel';
import { GenerationControls } from './components/GenerationControls';
import { useStudio } from './hooks/useStudio';

export default function App() {
  const studio = useStudio();

  const selectedModel = studio.selectedModel;

  return (
    <div className="min-h-screen bg-dark-bg text-white flex">
      <Sidebar
        active={studio.navSection}
        onChange={studio.setNavSection}
        open={studio.sidebarOpen}
        onToggle={() => studio.setSidebarOpen(!studio.sidebarOpen)}
        historyCount={studio.history.length}
      />

      <main className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-[1500px] p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-white">
                  Cinema Studio
                </h1>
                <p className="mt-1 text-sm text-dark-muted">
                  Create cinematic images and videos with AI
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-dark-muted">Selected model</p>
                <p className="text-sm font-medium text-slate-200">
                  {selectedModel.name}
                </p>
              </div>
            </div>
          </div>

          {/* Main workspace */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-5">
              {/* Prompt */}
              <div className="rounded-xl border border-dark-border bg-dark-surface p-4">
                <PromptPanel
                  prompt={studio.params.prompt}
                  onPromptChange={studio.setPrompt}
                  negativePrompt={studio.params.negativePrompt}
                  onNegativePromptChange={studio.setNegativePrompt}
                  enhance={studio.params.enhance}
                  onEnhanceToggle={studio.setEnhance}
                  activeStyle={studio.params.stylePreset}
                  onStyleChange={studio.setStylePreset}
                  disabled={
                    studio.status === 'queued' ||
                    studio.status === 'generating' ||
                    studio.status === 'upscaling'
                  }
                />
              </div>

              {/* Generation settings */}
              <div className="rounded-xl border border-dark-border bg-dark-surface p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Generation Settings
                    </h2>
                    <p className="mt-0.5 text-xs text-dark-muted">
                      Configure your output before generating
                    </p>
                  </div>

                  <span className="rounded-md border border-brand-600/30 bg-brand-600/10 px-2 py-1 text-[10px] font-medium text-brand-400">
                    {selectedModel.name}
                  </span>
                </div>

                <GenerationControls
                  model={selectedModel}
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
                  disabled={
                    studio.status === 'queued' ||
                    studio.status === 'generating' ||
                    studio.status === 'upscaling'
                  }
                />
              </div>

              {/* Generate button */}
              <button
                onClick={studio.generate}
                disabled={
                  !studio.params.prompt.trim() ||
                  studio.status === 'queued' ||
                  studio.status === 'generating' ||
                  studio.status === 'upscaling'
                }
                className="w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {studio.status === 'queued'
                  ? 'Queued...'
                  : studio.status === 'generating'
                    ? `Generating ${studio.progress}%`
                    : studio.status === 'upscaling'
                      ? `Upscaling ${studio.progress}%`
                      : 'Generate'}
              </button>

              {/* Progress */}
              {(studio.status === 'queued' ||
                studio.status === 'generating' ||
                studio.status === 'upscaling') && (
                <div className="overflow-hidden rounded-lg border border-dark-border bg-dark-card">
                  <div
                    className="h-1 bg-brand-500 transition-all duration-300"
                    style={{ width: `${studio.progress}%` }}
                  />
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs text-dark-muted">
                      {studio.status === 'queued'
                        ? 'Preparing generation...'
                        : studio.status === 'generating'
                          ? 'Creating your result...'
                          : 'Enhancing output...'}
                    </span>

                    <button
                      onClick={studio.cancelGeneration}
                      className="text-xs text-dark-muted hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Result panel */}
            <aside className="rounded-xl border border-dark-border bg-dark-surface p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Preview
                  </h2>
                  <p className="text-xs text-dark-muted">
                    Your latest generation
                  </p>
                </div>

                {studio.currentResult && (
                  <span className="rounded-full bg-green-500/10 px-2 py-1 text-[10px] text-green-400">
                    Ready
                  </span>
                )}
              </div>

              {studio.currentResult ? (
                <div className="overflow-hidden rounded-xl border border-dark-border bg-dark-card">
                  <img
                    src={studio.currentResult.mediaUrl}
                    alt="Generated result"
                    className="aspect-video w-full object-cover"
                  />

                  <div className="p-3">
                    <p className="line-clamp-3 text-xs leading-relaxed text-slate-300">
                      {studio.currentResult.params.prompt}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-dark-border bg-dark-card">
                  <div className="text-center">
                    <p className="text-sm text-dark-muted">
                      No generation yet
                    </p>
                    <p className="mt-1 text-[11px] text-dark-muted/60">
                      Enter a prompt and click Generate
                    </p>
                  </div>
                </div>
              )}

              {/* History */}
              {studio.history.length > 0 && (
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white">
                      Recent generations
                    </h3>
                    <span className="text-[10px] text-dark-muted">
                      {studio.history.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {studio.history.slice(0, 6).map(item => (
                      <button
                        key={item.id}
                        onClick={() => studio.selectHistoryItem(item)}
                        className="overflow-hidden rounded-lg border border-dark-border bg-dark-card text-left transition hover:border-brand-600/50"
                      >
                        <img
                          src={item.mediaUrl}
                          alt="Generation history"
                          className="aspect-video w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}