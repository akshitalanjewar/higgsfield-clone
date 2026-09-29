import { useState, useCallback, useRef } from 'react';
import type {
  GenerationParams,
  GeneratedItem,
  GenerationStatus,
  NavSection,
  AIModel,
  CameraSettings,
  AspectRatio,
  QualityLevel,
  CameraMove,
  LensType,
  ApertureValue,
} from '../types';
import { MODELS, buildGallery } from '../data/studioData';

// ─── Simulated generation time by quality ───────────────────────────────────

const GENERATION_DURATIONS: Record<QualityLevel, [number, number]> = {
  draft: [3000, 6000],
  standard: [6000, 12000],
  cinematic: [12000, 22000],
};

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Result images ───────────────────────────────────────────────────────────

const RESULT_POOL: Record<string, string[]> = {
  'soul_16:9': [
    'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1280&q=90',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&q=90',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1280&q=90',
    'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1280&q=90',
  ],

  'soul_9:16': [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=720&q=90',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=720&q=90',
  ],

  'kling_16:9': [
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1280&q=90',
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1280&q=90',
  ],

  'veo_16:9': [
    'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=1280&q=90',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1280&q=90',
  ],

  'flux_1:1': [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=90',
    'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=900&q=90',
  ],

  'flux_9:16': [
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=720&q=90',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=720&q=90',
  ],

  'flux_16:9': [
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1280&q=90',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1280&q=90',
  ],

  default: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&q=90',
    'https://images.unsplash.com/photo-1519638831568-d9897f54ed69?w=1280&q=90',
    'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1280&q=90',
  ],
};

function pickResult(
  modelId: string,
  aspectRatio: AspectRatio
): string {
  const model = MODELS.find(m => m.id === modelId);
  const family = model?.family ?? 'default';

  const key = `${family}_${aspectRatio}`;
  const pool = RESULT_POOL[key] ?? RESULT_POOL.default;

  return pool[rand(0, pool.length - 1)];
}

// ─── Default generation params ───────────────────────────────────────────────

const DEFAULT_CAMERA: CameraSettings = {
  movement: 'static',
  speed: 30,
  lens: '35mm',
  aperture: 'f/2.8',
  stabilization: true,
};

const DEFAULT_PARAMS: GenerationParams = {
  prompt: '',
  negativePrompt: '',
  modelId: 'soul-v2',
  aspectRatio: '16:9',
  duration: 6,
  quality: 'cinematic',
  seed: null,
  camera: DEFAULT_CAMERA,
  stylePreset: 'cinematic',
  enhance: true,
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useStudio() {
  const [navSection, setNavSection] =
    useState<NavSection>('cinema');

  const [params, setParams] =
    useState<GenerationParams>(DEFAULT_PARAMS);

  const [status, setStatus] =
    useState<GenerationStatus>('idle');

  const [progress, setProgress] =
    useState(0);

  const [currentResult, setCurrentResult] =
    useState<GeneratedItem | null>(null);

  const [history, setHistory] =
    useState<GeneratedItem[]>(buildGallery());

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [rightPanelTab, setRightPanelTab] =
    useState<'controls' | 'camera'>('controls');

  const abortRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedModel: AIModel =
    MODELS.find(m => m.id === params.modelId) ?? MODELS[0];

  // ── Param setters ─────────────────────────────────────────────────────────

  const setPrompt = useCallback((prompt: string) => {
    setParams(p => ({
      ...p,
      prompt,
    }));
  }, []);

  const setNegativePrompt = useCallback((negativePrompt: string) => {
    setParams(p => ({
      ...p,
      negativePrompt,
    }));
  }, []);

  const setModelId = useCallback((modelId: string) => {
    const model = MODELS.find(m => m.id === modelId);

    setParams(p => ({
      ...p,
      modelId,

      duration: model
        ? Math.min(
            p.duration,
            Math.max(model.maxDuration, 1)
          )
        : p.duration,

      aspectRatio:
        model && !model.aspectRatios.includes(p.aspectRatio)
          ? model.aspectRatios[0]
          : p.aspectRatio,
    }));
  }, []);

  const setAspectRatio = useCallback(
    (aspectRatio: AspectRatio) => {
      setParams(p => ({
        ...p,
        aspectRatio,
      }));
    },
    []
  );

  const setDuration = useCallback((duration: number) => {
    setParams(p => ({
      ...p,
      duration,
    }));
  }, []);

  const setQuality = useCallback(
    (quality: QualityLevel) => {
      setParams(p => ({
        ...p,
        quality,
      }));
    },
    []
  );

  const setSeed = useCallback(
    (seed: number | null) => {
      setParams(p => ({
        ...p,
        seed,
      }));
    },
    []
  );

  const setStylePreset = useCallback(
    (stylePreset: string | null) => {
      setParams(p => ({
        ...p,
        stylePreset,
      }));
    },
    []
  );

  const setEnhance = useCallback((enhance: boolean) => {
    setParams(p => ({
      ...p,
      enhance,
    }));
  }, []);

  const setCameraMovement = useCallback(
    (movement: CameraMove) => {
      setParams(p => ({
        ...p,
        camera: {
          ...p.camera,
          movement,
        },
      }));
    },
    []
  );

  const setCameraSpeed = useCallback((speed: number) => {
    setParams(p => ({
      ...p,
      camera: {
        ...p.camera,
        speed,
      },
    }));
  }, []);

  const setLens = useCallback((lens: LensType) => {
    setParams(p => ({
      ...p,
      camera: {
        ...p.camera,
        lens,
      },
    }));
  }, []);

  const setAperture = useCallback(
    (aperture: ApertureValue) => {
      setParams(p => ({
        ...p,
        camera: {
          ...p.camera,
          aperture,
        },
      }));
    },
    []
  );

  const setStabilization = useCallback(
    (stabilization: boolean) => {
      setParams(p => ({
        ...p,
        camera: {
          ...p.camera,
          stabilization,
        },
      }));
    },
    []
  );

  // ── Generation ────────────────────────────────────────────────────────────

  const generate = useCallback(() => {
    if (
      status === 'generating' ||
      status === 'queued' ||
      status === 'upscaling'
    ) {
      return;
    }

    if (!params.prompt.trim()) {
      return;
    }

    const [minMs, maxMs] =
      GENERATION_DURATIONS[params.quality];

    const totalMs = rand(minMs, maxMs);

    const genPhaseMs =
      Math.round(totalMs * 0.85);

    setStatus('queued');
    setProgress(0);
    setCurrentResult(null);

    const startTs = Date.now();

    const id =
      `gen-${Date.now()}-${rand(1000, 9999)}`;

    const tick = () => {
      const elapsed =
        Date.now() - startTs;

      if (elapsed < genPhaseMs) {
        const pct =
          Math.min(
            (elapsed / genPhaseMs) * 100,
            99
          );

        if (elapsed < 500) {
          setStatus('queued');
        } else {
          setStatus('generating');
        }

        setProgress(Math.round(pct));

        abortRef.current =
          setTimeout(tick, 80);

      } else if (elapsed < totalMs) {
        setStatus('upscaling');
        setProgress(99);

        abortRef.current =
          setTimeout(tick, 100);

      } else {
        const mediaUrl =
          pickResult(
            params.modelId,
            params.aspectRatio
          );

        const item: GeneratedItem = {
          id,

          createdAt: new Date(),

          params: {
            ...params,
            camera: {
              ...params.camera,
            },
          },

          status: 'done',

          thumbnailUrl: mediaUrl,
          mediaUrl,

          type:
            selectedModel.type === 'image'
              ? 'image'
              : 'video',

          duration:
            selectedModel.type === 'image'
              ? undefined
              : params.duration,

          liked: false,

          title:
            params.prompt
              .split(' ')
              .slice(0, 5)
              .join(' '),
        };

        setStatus('done');
        setProgress(100);
        setCurrentResult(item);

        setHistory(prev => [
          item,
          ...prev,
        ]);
      }
    };

    abortRef.current =
      setTimeout(tick, 80);
  }, [
    params,
    status,
    selectedModel.type,
  ]);

  // ── Cancel generation ─────────────────────────────────────────────────────

  const cancelGeneration = useCallback(() => {
    if (abortRef.current) {
      clearTimeout(abortRef.current);
      abortRef.current = null;
    }

    setStatus('idle');
    setProgress(0);
  }, []);

  // ── Reset for New Generation ──────────────────────────────────────────────

  const resetStudio = useCallback(() => {
    // Stop any running generation
    if (abortRef.current) {
      clearTimeout(abortRef.current);
      abortRef.current = null;
    }

    // Reset creation state
    setParams({
      ...DEFAULT_PARAMS,
      camera: {
        ...DEFAULT_CAMERA,
      },
    });

    setStatus('idle');
    setProgress(0);
    setCurrentResult(null);

    // Return to the main creation section
    setNavSection('cinema');

    // Keep gallery/history intact
  }, []);

  // ── Gallery actions ───────────────────────────────────────────────────────

  const toggleLike = useCallback((itemId: string) => {
    setHistory(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              liked: !item.liked,
            }
          : item
      )
    );

    setCurrentResult(prev =>
      prev?.id === itemId
        ? {
            ...prev,
            liked: !prev.liked,
          }
        : prev
    );
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    setHistory(prev =>
      prev.filter(item => item.id !== itemId)
    );

    setCurrentResult(prev =>
      prev?.id === itemId
        ? null
        : prev
    );
  }, []);

  const selectHistoryItem = useCallback(
    (item: GeneratedItem) => {
      setCurrentResult(item);

      setParams(prev => ({
        ...prev,
        ...item.params,
      }));

      setStatus('done');
      setProgress(100);
    },
    []
  );

  // ── Seed ──────────────────────────────────────────────────────────────────

  const randomiseSeed = useCallback(() => {
    setSeed(rand(1, 999999));
  }, [setSeed]);

  const clearSeed = useCallback(() => {
    setSeed(null);
  }, [setSeed]);

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    // State
    navSection,
    setNavSection,

    params,

    status,
    progress,

    currentResult,

    history,

    sidebarOpen,
    setSidebarOpen,

    rightPanelTab,
    setRightPanelTab,

    selectedModel,
    models: MODELS,

    // Param setters
    setPrompt,
    setNegativePrompt,

    setModelId,
    setAspectRatio,

    setDuration,
    setQuality,

    setSeed,
    randomiseSeed,
    clearSeed,

    setStylePreset,
    setEnhance,

    setCameraMovement,
    setCameraSpeed,

    setLens,
    setAperture,
    setStabilization,

    // Actions
    generate,
    cancelGeneration,
    resetStudio,

    toggleLike,
    deleteItem,
    selectHistoryItem,
  };
}