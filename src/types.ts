// ─── Core domain types ──────────────────────────────────────────────────────

export type GenerationType = 'video' | 'image';

export type ModelFamily =
  | 'soul'       // Higgsfield's cinematic model
  | 'kling'      // Kling AI
  | 'veo'        // Google Veo
  | 'wan'        // WAN
  | 'flux'       // FLUX image
  | 'popcorn'    // Storyboard / rapid iteration
  | 'seedance';  // Seedance

export interface AIModel {
  id: string;
  name: string;
  family: ModelFamily;
  tag: string;          // short badge label e.g. "NEW", "FAST", "HD"
  tagColor: string;     // tailwind text color
  type: GenerationType | 'both';
  description: string;
  maxDuration: number;  // seconds for video, 0 for image
  strengths: string[];
  aspectRatios: AspectRatio[];
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9';

export type CameraMove =
  | 'static'
  | 'pan-left'
  | 'pan-right'
  | 'tilt-up'
  | 'tilt-down'
  | 'zoom-in'
  | 'zoom-out'
  | 'orbit-left'
  | 'orbit-right'
  | 'dolly-in'
  | 'dolly-out'
  | 'crane-up'
  | 'crane-down';

export type LensType = '24mm' | '35mm' | '50mm' | '85mm' | '135mm' | '200mm';
export type ApertureValue = 'f/1.4' | 'f/1.8' | 'f/2.8' | 'f/4' | 'f/5.6' | 'f/8';
export type QualityLevel = 'draft' | 'standard' | 'cinematic';

export interface CameraSettings {
  movement: CameraMove;
  speed: number;        // 0–100
  lens: LensType;
  aperture: ApertureValue;
  stabilization: boolean;
}

export interface GenerationParams {
  prompt: string;
  negativePrompt: string;
  modelId: string;
  aspectRatio: AspectRatio;
  duration: number;     // seconds
  quality: QualityLevel;
  seed: number | null;  // null = random
  camera: CameraSettings;
  stylePreset: string | null;
  enhance: boolean;
}

export type GenerationStatus = 'idle' | 'queued' | 'generating' | 'upscaling' | 'done' | 'error';

export interface GeneratedItem {
  id: string;
  createdAt: Date;
  params: GenerationParams;
  status: GenerationStatus;
  thumbnailUrl: string;
  mediaUrl: string;
  type: GenerationType;
  duration?: number;    // actual duration
  liked: boolean;
  title: string;
}

export type NavSection = 'cinema' | 'marketing' | 'soul-id' | 'gallery' | 'upscale';

export interface SoulProfile {
  id: string;
  name: string;
  avatarUrl: string;
  trained: boolean;
}

export interface StylePreset {
  id: string;
  label: string;
  emoji: string;
  description: string;
}
