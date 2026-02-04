# 🏛️ Museum Guide

> Point. Listen. Learn.

AI-powered museum companion that recognizes artifacts and tells their stories. No typing, no menus — just point your camera.

## Quick Start

```bash
cd app
npm install
npx expo start
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system design.

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  CAMERA  │───▶│ DETECTION│───▶│ NARRATION│───▶│  VOICE   │
│  INPUT   │    │  LAYER   │    │  LAYER   │    │  OUTPUT  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

## Detection Pipeline

1. **YOLO** - Detect artifact category (statue, mask, jewelry, etc.)
2. **Similarity Search** - Match exact artifact from embeddings
3. **OCR Fallback** - Read name from plaque if visual detection fails

## Project Structure

```
museum-guide/
├── ARCHITECTURE.md          # System design document
├── README.md                 # This file
├── app/                      # React Native app
│   ├── App.tsx              # Entry point
│   ├── src/
│   │   ├── screens/         # App screens
│   │   ├── components/      # UI components
│   │   ├── hooks/           # React hooks
│   │   ├── services/        # Core services
│   │   │   ├── DetectionService.ts
│   │   │   ├── NarrationService.ts
│   │   │   └── ArtifactDatabase.ts
│   │   ├── store/           # State management
│   │   ├── types/           # TypeScript types
│   │   └── data/            # Sample data
│   └── package.json
├── models/                   # ML models (you add these)
│   ├── yolo_artifacts.tflite
│   └── embeddings.tflite
└── data/                     # Museum data packs
    └── gem_pack_v1.json
```

## Setup Checklist

### Phase 1: Core Magic
- [ ] Camera + basic UI working
- [ ] Sample artifacts in database
- [ ] Narration generation with Gemini
- [ ] On-device TTS playback
- [ ] Test with 5-10 artifacts manually

### Phase 2: Detection
- [ ] Train YOLO on artifact categories
- [ ] Implement embedding extraction
- [ ] Build similarity search index
- [ ] Add OCR fallback
- [ ] End-to-end detection pipeline

### Phase 3: Polish
- [ ] Offline museum pack download
- [ ] Context tracking (what user has seen)
- [ ] Multiple story modes
- [ ] Arabic language support
- [ ] Better TTS voices

## Tech Stack

| Component | Tech |
|-----------|------|
| App | React Native + Expo |
| Detection | YOLOv12 (TFLite) |
| Embeddings | MobileNetV3 |
| Vector Search | FAISS |
| OCR | Google ML Kit |
| LLM | Gemini API |
| TTS | Expo Speech (device) |
| Database | SQLite |
| State | Zustand |

## Environment Variables

Create `.env` in the app folder:

```
GEMINI_API_KEY=your_key_here
```

## Adding Artifacts

1. Add to `src/data/sampleArtifacts.ts` for testing
2. Or create a museum pack JSON file:

```json
{
  "version": "1.0",
  "museum": "Grand Egyptian Museum",
  "artifacts": [
    {
      "id": "gem_001",
      "name": "Golden Mask of Tutankhamun",
      "category": "funerary_mask",
      ...
    }
  ]
}
```

## Training YOLO

Categories to train on:
- funerary_mask
- statue
- sarcophagus
- canopic
- jewelry
- papyrus
- stele
- mummy
- amulet
- scarab
- ushabti
- vessel
- weapon
- furniture
- relief

## Credits

Built by David & Milo 🦊

---

*Making museums talk, one artifact at a time.*
