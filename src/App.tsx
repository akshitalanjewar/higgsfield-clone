import { Sidebar } from './components/Sidebar';
import { PromptPanel } from './components/PromptPanel';
import { GenerationControls } from './components/GenerationControls';
import { useStudio } from './hooks/useStudio';

export default function App() {
  const studio = useStudio();
  const selectedModel = studio.selectedModel;

  const isBusy =
    studio.status === 'queued' ||
    studio.status === 'generating' ||
    studio.status === 'upscaling';

  const renderCinemaStudio = () => (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-5">
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
            disabled={isBusy}
          />
        </div>

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
            disabled={isBusy}
          />
        </div>

        <button
          onClick={studio.generate}
          disabled={!studio.params.prompt.trim() || isBusy}
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

        {isBusy && (
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

      <aside className="rounded-xl border border-dark-border bg-dark-surface p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Preview</h2>
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
      </aside>
    </div>
  );

  const renderMarketing = () => (
    <div className="space-y-5">
      <div className="rounded-xl border border-dark-border bg-dark-surface p-6">
        <span className="text-xs font-medium text-brand-400">
          MARKETING STUDIO
        </span>

        <h2 className="mt-2 text-2xl font-semibold text-white">
          Create marketing content with AI
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-dark-muted">
          Turn a product idea into social creatives, campaign visuals,
          promotional videos, and reusable marketing assets.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Product Creative', 'Generate product-focused visuals and campaigns.'],
          ['Social Content', 'Create assets for social media and short-form content.'],
          ['Ad Concepts', 'Explore multiple creative directions from one idea.'],
        ].map(([title, description]) => (
          <div
            key={title}
            className="rounded-xl border border-dark-border bg-dark-surface p-5"
          >
            <div className="mb-4 h-10 w-10 rounded-lg bg-brand-600/10" />

            <h3 className="text-sm font-semibold text-white">{title}</h3>

            <p className="mt-2 text-xs leading-5 text-dark-muted">
              {description}
            </p>

            <button
              onClick={() => studio.setNavSection('cinema')}
              className="mt-4 text-xs font-medium text-brand-400 hover:text-brand-300"
            >
              Start creating →
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSoulId = () => (
    <div className="space-y-5">
      <div className="rounded-xl border border-dark-border bg-dark-surface p-6">
        <span className="text-xs font-medium text-brand-400">SOUL ID</span>

        <h2 className="mt-2 text-2xl font-semibold text-white">
          Build a consistent AI identity
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-dark-muted">
          Create a reusable identity profile for keeping characters and
          visual subjects consistent across generations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-dark-border bg-dark-surface p-5">
          <h3 className="text-sm font-semibold text-white">
            Identity Profile
          </h3>

          <div className="mt-4 rounded-lg border border-dashed border-dark-border p-6 text-center">
            <p className="text-sm text-dark-muted">
              No Soul ID created yet
            </p>

            <button
              onClick={() => studio.setNavSection('cinema')}
              className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500"
            >
              Create with Studio
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-dark-border bg-dark-surface p-5">
          <h3 className="text-sm font-semibold text-white">
            Consistency
          </h3>

          <p className="mt-2 text-xs leading-5 text-dark-muted">
            Reuse your visual identity across images and videos to maintain
            a consistent creative direction.
          </p>
        </div>
      </div>
    </div>
  );

  const renderGallery = () => (
    <div className="space-y-5">
      <div className="rounded-xl border border-dark-border bg-dark-surface p-6">
        <span className="text-xs font-medium text-brand-400">GALLERY</span>

        <h2 className="mt-2 text-2xl font-semibold text-white">
          Your generations
        </h2>

        <p className="mt-2 text-sm text-dark-muted">
          Browse your recent AI creations.
        </p>
      </div>

      {studio.history.length === 0 ? (
        <div className="rounded-xl border border-dashed border-dark-border bg-dark-surface p-12 text-center">
          <p className="text-sm text-dark-muted">
            Your gallery is empty.
          </p>

          <button
            onClick={() => studio.setNavSection('cinema')}
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500"
          >
            Create your first generation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {studio.history.map(item => (
            <button
              key={item.id}
              onClick={() => studio.selectHistoryItem(item)}
              className="group overflow-hidden rounded-xl border border-dark-border bg-dark-surface text-left transition hover:border-brand-600/50"
            >
              <div className="relative">
                <img
                  src={item.mediaUrl}
                  alt={item.title || 'Generated content'}
                  className="aspect-video w-full object-cover transition group-hover:scale-[1.02]"
                />

                {item.liked && (
                  <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white">
                    ♥
                  </span>
                )}
              </div>

              <div className="p-3">
                <p className="line-clamp-2 text-xs text-slate-300">
                  {item.title || item.params.prompt}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderUpscale = () => (
    <div className="space-y-5">
      <div className="rounded-xl border border-dark-border bg-dark-surface p-6">
        <span className="text-xs font-medium text-brand-400">UPSCALER</span>

        <h2 className="mt-2 text-2xl font-semibold text-white">
          Enhance your creations
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-dark-muted">
          Improve the resolution and presentation quality of your generated
          media before exporting it.
        </p>
      </div>

      <div className="rounded-xl border border-dark-border bg-dark-surface p-8 text-center">
        {studio.currentResult ? (
          <>
            <img
              src={studio.currentResult.mediaUrl}
              alt="Selected generation"
              className="mx-auto max-h-[420px] rounded-xl object-contain"
            />

            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => studio.setNavSection('cinema')}
                className="rounded-lg border border-dark-border px-4 py-2 text-xs font-medium text-slate-300 hover:bg-dark-card"
              >
                Back to Studio
              </button>

              <button
                onClick={() => studio.generate()}
                className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500"
              >
                Enhance Generation
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-600/10 text-2xl">
              ↑
            </div>

            <h3 className="mt-5 text-sm font-semibold text-white">
              No generation selected
            </h3>

            <p className="mt-2 text-xs text-dark-muted">
              Generate content in Cinema Studio first, then enhance it here.
            </p>

            <button
              onClick={() => studio.setNavSection('cinema')}
              className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-500"
            >
              Open Cinema Studio
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
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

  const pageTitles: Record<string, string> = {
    cinema: 'Cinema Studio',
    marketing: 'Marketing Studio',
    'soul-id': 'Soul ID',
    gallery: 'Gallery',
    upscale: 'Upscale',
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
        className={`min-h-screen overflow-auto transition-all duration-200 ${
          studio.sidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        <div className="mx-auto max-w-[1500px] p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white">
              {pageTitles[studio.navSection]}
            </h1>

            <p className="mt-1 text-sm text-dark-muted">
              AI-powered creative workspace
            </p>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
}