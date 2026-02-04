import { useState, useCallback, useRef, useEffect } from 'react';
import { CameraView } from 'expo-camera';
import { Artifact, BoundingBox, DetectionResult } from '../types';
import { DetectionService } from '../services/DetectionService';
import { ArtifactDatabase } from '../services/ArtifactDatabase';

interface UseDetectionResult {
  isDetecting: boolean;
  detectedArtifact: Artifact | null;
  boundingBox: BoundingBox | null;
  confidence: number;
  error: string | null;
  startDetection: () => void;
  stopDetection: () => void;
}

export function useDetection(cameraRef: React.RefObject<CameraView>): UseDetectionResult {
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectedArtifact, setDetectedArtifact] = useState<Artifact | null>(null);
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const detectionInterval = useRef<NodeJS.Timeout | null>(null);
  const lastDetectionTime = useRef(0);
  const stableDetectionCount = useRef(0);
  const lastDetectedId = useRef<string | null>(null);

  const DETECTION_INTERVAL_MS = 500;  // Run detection every 500ms
  const STABLE_THRESHOLD = 3;          // Need 3 consistent detections

  const processFrame = useCallback(async () => {
    if (!cameraRef.current || !isDetecting) return;

    try {
      // Capture frame
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        skipProcessing: true,
      });

      if (!photo?.base64) return;

      // Run detection pipeline
      const result = await DetectionService.detect(photo.base64);

      if (result) {
        // Check if same artifact as before
        if (result.artifact.id === lastDetectedId.current) {
          stableDetectionCount.current++;
        } else {
          stableDetectionCount.current = 1;
          lastDetectedId.current = result.artifact.id;
        }

        // Only update UI after stable detection
        if (stableDetectionCount.current >= STABLE_THRESHOLD) {
          setDetectedArtifact(result.artifact);
          setBoundingBox(result.boundingBox);
          setConfidence(result.confidence);
        }
      } else {
        // No detection - reset after a few frames
        stableDetectionCount.current = 0;
        if (Date.now() - lastDetectionTime.current > 2000) {
          setDetectedArtifact(null);
          setBoundingBox(null);
          setConfidence(0);
          lastDetectedId.current = null;
        }
      }

      lastDetectionTime.current = Date.now();
    } catch (err) {
      console.error('Detection error:', err);
      setError(err instanceof Error ? err.message : 'Detection failed');
    }
  }, [cameraRef, isDetecting]);

  // Start detection loop
  useEffect(() => {
    if (isDetecting) {
      detectionInterval.current = setInterval(processFrame, DETECTION_INTERVAL_MS);
    }

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, [isDetecting, processFrame]);

  const startDetection = useCallback(() => setIsDetecting(true), []);
  const stopDetection = useCallback(() => setIsDetecting(false), []);

  return {
    isDetecting,
    detectedArtifact,
    boundingBox,
    confidence,
    error,
    startDetection,
    stopDetection,
  };
}
