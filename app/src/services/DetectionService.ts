/**
 * DetectionService - Three-tier artifact detection pipeline
 * 
 * Tier 1: YOLO category detection
 * Tier 2: Embedding similarity search
 * Tier 3: OCR fallback
 * 
 * Also includes DEMO MODE for testing without trained models
 */

import { Artifact, BoundingBox, DetectionResult } from '../types';
import { ArtifactDatabase } from './ArtifactDatabase';
import { sampleArtifacts } from '../data/sampleArtifacts';

// Demo mode - enable this to test without ML models
const DEMO_MODE = true;
const DEMO_DETECTION_CHANCE = 0.15; // 15% chance to "detect" each frame

interface YOLOResult {
  category: string;
  confidence: number;
  boundingBox: BoundingBox;
}

interface EmbeddingMatch {
  artifactId: string;
  similarity: number;
}

class DetectionServiceClass {
  private isModelLoaded = false;
  private yoloModel: any = null;
  private embeddingModel: any = null;
  private demoIndex = 0;
  private lastDemoDetection = 0;

  /**
   * Initialize detection models
   * Call this on app startup
   */
  async initialize(): Promise<void> {
    if (this.isModelLoaded) return;

    try {
      if (DEMO_MODE) {
        console.log('🎭 Detection running in DEMO MODE');
        // Load sample artifacts into database for demo
        await ArtifactDatabase.initialize();
        await ArtifactDatabase.bulkInsert(sampleArtifacts);
        this.isModelLoaded = true;
        return;
      }

      // TODO: Load TFLite models for production
      // this.yoloModel = await tf.loadGraphModel(bundleResourceIO(modelJSON, modelWeights));
      // this.embeddingModel = await tf.loadGraphModel(...);
      
      console.log('Detection models loaded');
      this.isModelLoaded = true;
    } catch (error) {
      console.error('Failed to load detection models:', error);
      throw error;
    }
  }

  /**
   * Main detection pipeline
   */
  async detect(imageBase64: string): Promise<DetectionResult | null> {
    // Ensure initialized
    if (!this.isModelLoaded) {
      await this.initialize();
    }

    // DEMO MODE: Randomly "detect" artifacts for testing
    if (DEMO_MODE) {
      return this.demoDetect();
    }

    // Production pipeline
    // Tier 1: YOLO category detection
    const yoloResult = await this.runYOLO(imageBase64);
    
    if (yoloResult && yoloResult.confidence > 0.7) {
      // Tier 2: Similarity search within category
      const match = await this.findSimilarArtifact(imageBase64, yoloResult.category);
      
      if (match && match.similarity > 0.85) {
        const artifact = await ArtifactDatabase.getById(match.artifactId);
        if (artifact) {
          return {
            artifact,
            confidence: match.similarity,
            boundingBox: yoloResult.boundingBox,
            detectionMethod: 'visual',
          };
        }
      }
    }

    // Tier 3: OCR fallback
    const ocrResult = await this.runOCR(imageBase64);
    if (ocrResult) {
      const artifact = await ArtifactDatabase.searchByName(ocrResult);
      if (artifact) {
        return {
          artifact,
          confidence: 0.7,
          boundingBox: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
          detectionMethod: 'ocr',
        };
      }
    }

    return null;
  }

  /**
   * DEMO MODE: Simulate detection for testing
   */
  private async demoDetect(): Promise<DetectionResult | null> {
    const now = Date.now();
    
    // Throttle detections - minimum 3 seconds between new detections
    if (now - this.lastDemoDetection < 3000) {
      return null;
    }

    // Random chance to trigger detection
    if (Math.random() > DEMO_DETECTION_CHANCE) {
      return null;
    }

    // Cycle through sample artifacts
    const artifact = sampleArtifacts[this.demoIndex % sampleArtifacts.length];
    this.demoIndex++;
    this.lastDemoDetection = now;

    // Generate random-ish bounding box in center area
    const x = 0.15 + Math.random() * 0.2;
    const y = 0.2 + Math.random() * 0.2;
    const width = 0.4 + Math.random() * 0.2;
    const height = 0.3 + Math.random() * 0.2;

    console.log(`🎭 DEMO: Detected "${artifact.name}"`);

    return {
      artifact,
      confidence: 0.85 + Math.random() * 0.1,
      boundingBox: { x, y, width, height },
      detectionMethod: 'visual',
    };
  }

  /**
   * Tier 1: Run YOLO for category detection
   */
  private async runYOLO(imageBase64: string): Promise<YOLOResult | null> {
    // TODO: Implement actual YOLO inference
    // 1. Decode base64 to tensor
    // 2. Preprocess (resize, normalize)
    // 3. Run model inference
    // 4. Post-process (NMS, threshold)
    // 5. Return top detection
    
    console.log('Running YOLO detection...');
    return null;
  }

  /**
   * Tier 2: Extract embedding and search for similar artifacts
   */
  private async findSimilarArtifact(
    imageBase64: string,
    category: string
  ): Promise<EmbeddingMatch | null> {
    // TODO: Implement embedding extraction and similarity search
    // 1. Crop to bounding box
    // 2. Extract embedding with MobileNet/EfficientNet
    // 3. Search against artifact embeddings in category
    // 4. Return best match above threshold
    
    console.log(`Searching for similar artifact in category: ${category}`);
    return null;
  }

  /**
   * Tier 3: OCR fallback - read artifact name from plaque
   */
  private async runOCR(imageBase64: string): Promise<string | null> {
    // TODO: Implement OCR using ML Kit or Tesseract
    // 1. Detect text regions
    // 2. Extract text
    // 3. Clean and normalize
    // 4. Return artifact name if found
    
    console.log('Running OCR fallback...');
    return null;
  }

  /**
   * Manual search by text query
   */
  async searchByQuery(query: string): Promise<Artifact | null> {
    if (!this.isModelLoaded) {
      await this.initialize();
    }
    return ArtifactDatabase.searchByName(query);
  }

  /**
   * Check if running in demo mode
   */
  isDemoMode(): boolean {
    return DEMO_MODE;
  }
}

export const DetectionService = new DetectionServiceClass();
