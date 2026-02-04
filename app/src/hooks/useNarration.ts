import { useState, useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Artifact, Narration, StoryMode } from '../types';
import { NarrationService } from '../services/NarrationService';
import { useAppStore } from '../store/appStore';

interface UseNarrationResult {
  isPlaying: boolean;
  isLoading: boolean;
  currentNarration: Narration | null;
  progress: number;
  error: string | null;
  startNarration: (artifact: Artifact) => Promise<void>;
  togglePlayback: () => void;
  requestMore: () => void;
  stop: () => void;
}

export function useNarration(): UseNarrationResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentNarration, setCurrentNarration] = useState<Narration | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { settings, sessionArtifacts, addSessionArtifact } = useAppStore();
  const soundRef = useRef<Audio.Sound | null>(null);
  const currentArtifactRef = useRef<string | null>(null);

  // Start narration for an artifact
  const startNarration = useCallback(async (artifact: Artifact) => {
    // Don't restart if already narrating this artifact
    if (currentArtifactRef.current === artifact.id && isPlaying) {
      return;
    }

    setIsLoading(true);
    setError(null);
    currentArtifactRef.current = artifact.id;

    try {
      // Generate narration text
      const narrationText = await NarrationService.generate({
        artifact,
        previousArtifacts: sessionArtifacts,
        mode: settings.storyMode,
        language: settings.language,
      });

      // Create narration object
      const narration: Narration = {
        artifactId: artifact.id,
        text: narrationText.text,
        duration: narrationText.estimatedDuration,
        currentTime: 0,
        mode: settings.storyMode,
      };

      setCurrentNarration(narration);
      addSessionArtifact(artifact.id);

      // Start TTS immediately for responsiveness
      if (settings.autoPlay) {
        await playWithTTS(narrationText.text);
      }
    } catch (err) {
      console.error('Narration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate narration');
    } finally {
      setIsLoading(false);
    }
  }, [settings, sessionArtifacts, addSessionArtifact, isPlaying]);

  // Play using device TTS (fast, offline)
  const playWithTTS = async (text: string) => {
    setIsPlaying(true);
    
    const options = {
      language: settings.language === 'ar' ? 'ar-EG' : 'en-US',
      pitch: 1.0,
      rate: 0.9,  // Slightly slower for clarity
      onDone: () => setIsPlaying(false),
      onError: () => {
        setIsPlaying(false);
        setError('Speech synthesis failed');
      },
    };

    Speech.speak(text, options);
  };

  // Toggle play/pause
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
    } else if (currentNarration) {
      playWithTTS(currentNarration.text);
    }
  }, [isPlaying, currentNarration, settings.language]);

  // Request more details
  const requestMore = useCallback(async () => {
    if (!currentNarration) return;

    // Upgrade story mode
    const modeUpgrade: Record<StoryMode, StoryMode> = {
      quick: 'standard',
      standard: 'deep',
      deep: 'deep',
      kids: 'standard',
    };

    const newMode = modeUpgrade[currentNarration.mode];
    if (newMode === currentNarration.mode && currentNarration.mode === 'deep') {
      // Already at deepest level
      return;
    }

    setIsLoading(true);
    Speech.stop();

    // TODO: Fetch artifact from DB and regenerate
    // For now, just indicate loading
    setIsLoading(false);
  }, [currentNarration]);

  // Stop everything
  const stop = useCallback(() => {
    Speech.stop();
    soundRef.current?.unloadAsync();
    setIsPlaying(false);
    setCurrentNarration(null);
    setProgress(0);
    currentArtifactRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
      soundRef.current?.unloadAsync();
    };
  }, []);

  return {
    isPlaying,
    isLoading,
    currentNarration,
    progress,
    error,
    startNarration,
    togglePlayback,
    requestMore,
    stop,
  };
}
