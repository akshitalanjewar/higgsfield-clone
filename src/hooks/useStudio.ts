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

const GENERATION_DURATIONS: Record<
  QualityLevel,
  [number, number]
> = {
  draft: [3000, 6000],
  standard: [6000, 12000],
  cinematic: [12000, 22000],
};

function rand(
  min: number,
  max: number
) {
  return (
    Math.floor(
      Math.random() *
        (max - min + 1)
    ) + min
  );
}

/* ============================================================
   GENERATION PROMPT
   ============================================================ */

function buildGenerationPrompt(
  params: GenerationParams
): string {
  const camera = params.camera;

  const stabilizationInstruction =
    camera.stabilization
      ? 'Stable camera, controlled composition, smooth professional camera movement, no camera shake'
      : 'Natural handheld camera movement, subtle organic camera shake, dynamic documentary-style composition';

  return [
    params.prompt.trim(),

    params.negativePrompt.trim()
      ? `Negative prompt: ${params.negativePrompt.trim()}`
      : '',

    `Camera movement: ${camera.movement}`,

    `Camera speed: ${camera.speed}`,

    `Lens: ${camera.lens}`,

    `Aperture: ${camera.aperture}`,

    stabilizationInstruction,

    params.stylePreset
      ? `Visual style: ${params.stylePreset}`
      : '',

    params.enhance
      ? 'Highly detailed, polished professional image, refined lighting and composition'
      : '',
  ]
    .filter(Boolean)
    .join('. ');
}

/* ============================================================
   IMAGE URL
   ============================================================ */

function buildImageUrl(
  params: GenerationParams
): string {
  const generationPrompt =
    buildGenerationPrompt(params);

  const isPortrait =
    params.aspectRatio === '9:16' ||
    params.aspectRatio === '3:4';

  const isSquare =
    params.aspectRatio === '1:1';

  let width = 1280;
  let height = 720;

  if (isPortrait) {
    width = 768;
    height = 1280;
  } else if (isSquare) {
    width = 1024;
    height = 1024;
  }

  const query =
    new URLSearchParams();

  query.set(
    'width',
    String(width)
  );

  query.set(
    'height',
    String(height)
  );

  /*
   * Pollinations logo setting.
   */
  query.set(
    'nologo',
    'true'
  );

  /*
   * Keep generation private.
   */
  query.set(
    'private',
    'true'
  );

  /*
   * Use selected seed when available.
   */
  if (params.seed !== null) {
    query.set(
      'seed',
      String(params.seed)
    );
  }

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    generationPrompt
  )}?${query.toString()}`;
}

/* ============================================================
   DEFAULT CAMERA
   ============================================================ */

const DEFAULT_CAMERA: CameraSettings = {
  movement: 'static',
  speed: 30,
  lens: '35mm',
  aperture: 'f/2.8',
  stabilization: true,
};

/* ============================================================
   DEFAULT PARAMETERS
   ============================================================ */

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

/* ============================================================
   HOOK
   ============================================================ */

export function useStudio() {
  const [navSection, setNavSection] =
    useState<NavSection>('cinema');

  const [params, setParams] =
    useState<GenerationParams>(
      DEFAULT_PARAMS
    );

  const [status, setStatus] =
    useState<GenerationStatus>('idle');

  const [progress, setProgress] =
    useState(0);

  const [currentResult, setCurrentResult] =
    useState<GeneratedItem | null>(
      null
    );

  const [history, setHistory] =
    useState<GeneratedItem[]>(
      buildGallery()
    );

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [rightPanelTab, setRightPanelTab] =
    useState<
      'controls' | 'camera'
    >('controls');

  const abortRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const selectedModel: AIModel =
    MODELS.find(
      model =>
        model.id ===
        params.modelId
    ) ?? MODELS[0];

  /* ==========================================================
     PROMPT
     ========================================================== */

  const setPrompt = useCallback(
    (prompt: string) => {
      setParams(prev => ({
        ...prev,
        prompt,
      }));
    },
    []
  );

  const setNegativePrompt =
    useCallback(
      (negativePrompt: string) => {
        setParams(prev => ({
          ...prev,
          negativePrompt,
        }));
      },
      []
    );

  /* ==========================================================
     MODEL
     ========================================================== */

  const setModelId = useCallback(
    (modelId: string) => {
      const model =
        MODELS.find(
          item =>
            item.id === modelId
        );

      setParams(prev => ({
        ...prev,

        modelId,

        duration: model
          ? Math.min(
              prev.duration,
              Math.max(
                model.maxDuration,
                1
              )
            )
          : prev.duration,

        aspectRatio:
          model &&
          !model.aspectRatios.includes(
            prev.aspectRatio
          )
            ? model.aspectRatios[0]
            : prev.aspectRatio,
      }));
    },
    []
  );

  /* ==========================================================
     OUTPUT SETTINGS
     ========================================================== */

  const setAspectRatio =
    useCallback(
      (
        aspectRatio: AspectRatio
      ) => {
        setParams(prev => ({
          ...prev,
          aspectRatio,
        }));
      },
      []
    );

  const setDuration =
    useCallback(
      (duration: number) => {
        setParams(prev => ({
          ...prev,
          duration,
        }));
      },
      []
    );

  const setQuality =
    useCallback(
      (quality: QualityLevel) => {
        setParams(prev => ({
          ...prev,
          quality,
        }));
      },
      []
    );

  /* ==========================================================
     SEED
     ========================================================== */

  const setSeed = useCallback(
    (seed: number | null) => {
      setParams(prev => ({
        ...prev,
        seed,
      }));
    },
    []
  );

  const randomiseSeed =
    useCallback(() => {
      setSeed(
        rand(1, 999999)
      );
    }, [setSeed]);

  const clearSeed =
    useCallback(() => {
      setSeed(null);
    }, [setSeed]);

  /* ==========================================================
     STYLE / ENHANCE
     ========================================================== */

  const setStylePreset =
    useCallback(
      (
        stylePreset: string | null
      ) => {
        setParams(prev => ({
          ...prev,
          stylePreset,
        }));
      },
      []
    );

  const setEnhance =
    useCallback(
      (enhance: boolean) => {
        setParams(prev => ({
          ...prev,
          enhance,
        }));
      },
      []
    );

  /* ==========================================================
     CAMERA
     ========================================================== */

  const setCameraMovement =
    useCallback(
      (movement: CameraMove) => {
        setParams(prev => ({
          ...prev,

          camera: {
            ...prev.camera,
            movement,
          },
        }));
      },
      []
    );

  const setCameraSpeed =
    useCallback(
      (speed: number) => {
        setParams(prev => ({
          ...prev,

          camera: {
            ...prev.camera,
            speed,
          },
        }));
      },
      []
    );

  const setLens = useCallback(
    (lens: LensType) => {
      setParams(prev => ({
        ...prev,

        camera: {
          ...prev.camera,
          lens,
        },
      }));
    },
    []
  );

  const setAperture =
    useCallback(
      (aperture: ApertureValue) => {
        setParams(prev => ({
          ...prev,

          camera: {
            ...prev.camera,
            aperture,
          },
        }));
      },
      []
    );

  const setStabilization =
    useCallback(
      (stabilization: boolean) => {
        setParams(prev => ({
          ...prev,

          camera: {
            ...prev.camera,
            stabilization,
          },
        }));
      },
      []
    );

  /* ==========================================================
     GENERATE
     ========================================================== */

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

    const [
      minMs,
      maxMs,
    ] =
      GENERATION_DURATIONS[
        params.quality
      ];

    const totalMs =
      rand(minMs, maxMs);

    const genPhaseMs =
      Math.round(
        totalMs * 0.85
      );

    setStatus('queued');
    setProgress(0);
    setCurrentResult(null);

    const startTs =
      Date.now();

    const id =
      `gen-${Date.now()}-${rand(
        1000,
        9999
      )}`;

    const tick = () => {
      const elapsed =
        Date.now() - startTs;

      if (
        elapsed < genPhaseMs
      ) {
        const pct =
          Math.min(
            (elapsed /
              genPhaseMs) *
              100,
            99
          );

        if (elapsed < 500) {
          setStatus('queued');
        } else {
          setStatus(
            'generating'
          );
        }

        setProgress(
          Math.round(pct)
        );

        abortRef.current =
          setTimeout(
            tick,
            80
          );
      } else if (
        elapsed < totalMs
      ) {
        setStatus(
          'upscaling'
        );

        setProgress(99);

        abortRef.current =
          setTimeout(
            tick,
            100
          );
      } else {
        const mediaUrl =
          buildImageUrl(params);

        const item: GeneratedItem =
          {
            id,

            createdAt:
              new Date(),

            params: {
              ...params,

              camera: {
                ...params.camera,
              },
            },

            status: 'done',

            thumbnailUrl:
              mediaUrl,

            mediaUrl,

            type:
              selectedModel.type ===
              'image'
                ? 'image'
                : 'video',

            duration:
              selectedModel.type ===
              'image'
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

        abortRef.current =
          null;
      }
    };

    abortRef.current =
      setTimeout(
        tick,
        80
      );
  }, [
    params,
    status,
    selectedModel.type,
  ]);

  /* ==========================================================
     CANCEL
     ========================================================== */

  const cancelGeneration =
    useCallback(() => {
      if (abortRef.current) {
        clearTimeout(
          abortRef.current
        );

        abortRef.current =
          null;
      }

      setStatus('idle');
      setProgress(0);
    }, []);

  /* ==========================================================
     RESET
     ========================================================== */

  const resetStudio =
    useCallback(() => {
      if (abortRef.current) {
        clearTimeout(
          abortRef.current
        );

        abortRef.current =
          null;
      }

      setParams({
        ...DEFAULT_PARAMS,

        camera: {
          ...DEFAULT_CAMERA,
        },
      });

      setStatus('idle');
      setProgress(0);
      setCurrentResult(null);

      setNavSection('cinema');
    }, []);

  /* ==========================================================
     LIKE
     ========================================================== */

  const toggleLike =
    useCallback(
      (itemId: string) => {
        setHistory(prev =>
          prev.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  liked:
                    !item.liked,
                }
              : item
          )
        );

        setCurrentResult(prev =>
          prev?.id === itemId
            ? {
                ...prev,

                liked:
                  !prev.liked,
              }
            : prev
        );
      },
      []
    );

  /* ==========================================================
     DELETE
     ========================================================== */

  const deleteItem =
    useCallback(
      (itemId: string) => {
        setHistory(prev =>
          prev.filter(
            item =>
              item.id !== itemId
          )
        );

        setCurrentResult(prev =>
          prev?.id === itemId
            ? null
            : prev
        );
      },
      []
    );

  /* ==========================================================
     SELECT HISTORY ITEM
     ========================================================== */

  const selectHistoryItem =
    useCallback(
      (item: GeneratedItem) => {
        setCurrentResult(item);

        setParams(prev => ({
          ...prev,

          ...item.params,

          camera: {
            ...item.params.camera,
          },
        }));

        setStatus('done');
        setProgress(100);
      },
      []
    );

  /* ==========================================================
     RETURN
     ========================================================== */

  return {
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

    generate,
    cancelGeneration,
    resetStudio,

    toggleLike,
    deleteItem,
    selectHistoryItem,
  };
}