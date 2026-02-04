// Core artifact type - matches database schema
export interface Artifact {
  id: string;
  name: string;
  nameArabic?: string;
  category: string;
  dynasty?: string;
  period?: string;
  dateApprox?: string;
  material?: string[];
  dimensions?: string;
  weight?: string;
  discovery?: {
    date: string;
    location: string;
    discoverer?: string;
  };
  locationInMuseum?: string;
  storyFacts: string[];
  connections?: string[];
  tags?: string[];
}

// Detection result from YOLO + similarity search
export interface DetectionResult {
  artifact: Artifact;
  confidence: number;
  boundingBox: BoundingBox;
  detectionMethod: 'visual' | 'ocr' | 'manual';
}

export interface BoundingBox {
  x: number;      // 0-1, relative to screen width
  y: number;      // 0-1, relative to screen height
  width: number;  // 0-1
  height: number; // 0-1
}

// Narration state
export interface Narration {
  artifactId: string;
  text: string;
  audioUri?: string;
  duration: number;      // seconds
  currentTime: number;   // seconds
  mode: StoryMode;
}

export type StoryMode = 'quick' | 'standard' | 'deep' | 'kids';

export type Language = 'en' | 'ar';

// App settings
export interface AppSettings {
  storyMode: StoryMode;
  language: Language;
  autoPlay: boolean;
  hapticFeedback: boolean;
  offlineMode: boolean;
}

// History entry
export interface HistoryEntry {
  id: string;
  name: string;
  category: string;
  dynasty?: string;
  viewedAt: number;     // timestamp
  duration: number;     // seconds listened
}

// LLM prompt context
export interface NarrationContext {
  artifact: Artifact;
  previousArtifacts: string[];  // IDs of previously viewed
  mode: StoryMode;
  language: Language;
}

// API responses
export interface GeneratedNarration {
  text: string;
  estimatedDuration: number;
}
