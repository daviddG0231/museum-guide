# Museum Guide App — Architecture

> Point. Listen. Learn.

## Vision
An AI-powered museum companion that automatically recognizes artifacts and tells their stories. No typing, no menus, no friction — just point your camera and the artifact speaks.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MUSEUM GUIDE APP                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  CAMERA  │───▶│ DETECTION│───▶│ NARRATION│───▶│  VOICE   │  │
│  │  INPUT   │    │  LAYER   │    │  LAYER   │    │  OUTPUT  │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                        │                              ▲         │
│                        ▼                              │         │
│                 ┌─────────────────────────────────────┤         │
│                 │         KNOWLEDGE BASE              │         │
│                 │  (Artifacts DB + Embeddings + RAG)  │         │
│                 └─────────────────────────────────────┘         │
│                                                                 │
│                 ┌─────────────────────────────────────┐         │
│                 │         CONTEXT TRACKER             │         │
│                 │   (What user has seen this visit)   │         │
│                 └─────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer Details

### 1. Camera Input Layer
**Purpose:** Capture frames for detection

**Components:**
- React Native Camera (react-native-vision-camera)
- Frame processor for real-time analysis
- Throttling (don't process every frame — maybe 2-3 FPS)

**Behavior:**
- Continuous capture while app is active
- Pass frames to Detection Layer
- Show viewfinder with subtle detection indicator

---

### 2. Detection Layer
**Purpose:** Identify which artifact the user is looking at

**Strategy: Three-Tier Detection**

```
┌─────────────────────────────────────────────────────┐
│                  DETECTION PIPELINE                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│   TIER 1: YOLO Category Detection                   │
│   ─────────────────────────────────                 │
│   • Trained on 50-100 artifact categories           │
│   • Fast, runs on-device                            │
│   • Output: category + bounding box + confidence    │
│                                                     │
│              │ if confidence > 0.7                  │
│              ▼                                      │
│                                                     │
│   TIER 2: Similarity Search                         │
│   ─────────────────────────────                     │
│   • Crop detected region                            │
│   • Extract embedding (MobileNet/EfficientNet)      │
│   • Search against artifact embeddings DB           │
│   • Output: exact artifact match + similarity score │
│                                                     │
│              │ if no match OR low confidence        │
│              ▼                                      │
│                                                     │
│   TIER 3: OCR Fallback                              │
│   ────────────────────                              │
│   • Detect text regions (plaques)                   │
│   • Extract text via OCR (ML Kit / Tesseract)       │
│   • Fuzzy match against artifact names in DB        │
│   • Output: artifact match from name                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Models Needed:**
- [ ] YOLOv12 trained on artifact categories
- [ ] Embedding model (MobileNetV3 / EfficientNet-Lite)
- [ ] Artifact embeddings database (pre-computed)
- [ ] OCR model (Google ML Kit recommended for mobile)

---

### 3. Knowledge Base
**Purpose:** Store all artifact information for RAG

**Schema (per artifact):**
```json
{
  "id": "gem_001234",
  "name": "Golden Mask of Tutankhamun",
  "name_arabic": "قناع توت عنخ آمون الذهبي",
  "category": "funerary_mask",
  "dynasty": "18th Dynasty",
  "period": "New Kingdom",
  "date_approx": "-1323 BCE",
  "material": ["gold", "lapis lazuli", "obsidian", "quartz"],
  "dimensions": "54 cm height, 39.3 cm width",
  "weight": "11 kg",
  "discovery": {
    "date": "1925",
    "location": "Valley of the Kings, KV62",
    "discoverer": "Howard Carter"
  },
  "location_in_museum": "Gallery 2, Main Hall",
  "story_facts": [
    "Covered the head of the mummified pharaoh",
    "Made of 11 kg of solid gold",
    "The beard was knocked off and glued back with epoxy in 2014",
    "Eyes are made of obsidian and quartz"
  ],
  "connections": ["gem_001235", "gem_001240"],  // Related artifacts
  "embedding": [0.123, -0.456, ...],  // For similarity search
  "tags": ["iconic", "must_see", "gold", "pharaoh"]
}
```

**Storage:**
- SQLite for structured data (offline)
- Vector store for embeddings (FAISS / Annoy / hnswlib)
- All bundled in downloadable "Museum Pack"

---

### 4. Narration Layer (The Brain)
**Purpose:** Generate contextual, engaging stories from artifact data

**Flow:**
```
Artifact Data + User Context + Story Mode
              │
              ▼
     ┌────────────────┐
     │  PROMPT BUILD  │
     │                │
     │ "You are a    │
     │  storyteller   │
     │  at the Grand  │
     │  Egyptian      │
     │  Museum..."    │
     └────────────────┘
              │
              ▼
     ┌────────────────┐
     │   LLM (Local   │
     │   or Cloud)    │
     └────────────────┘
              │
              ▼
     Generated Story
```

**Story Modes:**
- **Quick** (15-30 sec): Hook + one fascinating fact
- **Standard** (1-2 min): Full story with context
- **Deep Dive** (3-5 min): Academic detail, connections
- **Kids Mode**: Simpler language, fun analogies

**Prompt Engineering:**
```
SYSTEM: You are a master storyteller at the Grand Egyptian Museum. 
You bring artifacts to life with vivid, accurate narratives.

RULES:
- Use ONLY the provided facts. Never invent details.
- Speak as if the artifact could tell its own story
- Be engaging but historically accurate
- Keep it to {duration} of spoken content (~150 words/minute)

CONTEXT:
- User has already seen: {list of previous artifacts}
- Make connections when relevant

ARTIFACT DATA:
{artifact JSON}

Generate a {story_mode} narration.
```

**LLM Options:**
- **Offline:** Llama 3.2 (3B quantized) / Phi-3-mini / Gemma 2B
- **Online:** Gemini API (current), GPT-4o-mini, Claude Haiku

**Anti-Hallucination:**
- All facts come from database
- LLM only structures and presents, doesn't invent
- Optional: fact verification pass before TTS

---

### 5. Voice Output Layer
**Purpose:** Convert narration to speech instantly

**Priority: SPEED**

**Options (fast to slow):**

| Method | Latency | Quality | Offline |
|--------|---------|---------|---------|
| Pre-cached audio | Instant | High | ✅ |
| On-device TTS (iOS/Android) | ~200ms | Medium | ✅ |
| Edge TTS (Microsoft) | ~500ms | Good | ❌ |
| ElevenLabs | ~1-2s | Excellent | ❌ |
| Google Cloud TTS | ~800ms | Good | ❌ |

**Recommended Strategy:**
1. **First sentence:** Use on-device TTS for instant start
2. **Rest of narration:** Stream from better TTS if online, fallback to on-device
3. **Popular artifacts:** Pre-generate and cache high-quality audio

**Voice Character:**
- Warm, knowledgeable, slightly mysterious
- Could have different voices for different eras (Old Kingdom vs Ptolemaic)
- Arabic option for local visitors

---

### 6. Context Tracker
**Purpose:** Remember what user has seen, enable connections

**Tracks:**
- Artifacts viewed this session
- Time spent on each
- Story mode preferences
- Favorites / bookmarks

**Enables:**
- "Remember that canopic jar? This one held a different organ..."
- "You've seen 3 items from Tutankhamun's tomb. Want to see the rest?"
- Smart suggestions for what to see next
- Post-visit summary

**Storage:** Local AsyncStorage / SQLite

---

### 7. UI Layer
**Purpose:** Minimal, immersive interface

**Screens:**

```
┌─────────────────────────────────────┐
│                                     │
│        ┌─────────────────┐          │
│        │                 │          │
│        │   CAMERA VIEW   │          │
│        │                 │          │
│        │    [artifact    │          │
│        │     detected]   │          │
│        │                 │          │
│        └─────────────────┘          │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🎭 Golden Mask of Tutankhamun│   │
│  │ ▶️ Playing... (0:23 / 1:45)  │    │
│  └─────────────────────────────┘    │
│                                     │
│    [⏸️]     [🔄 More]    [⭐]       │
│                                     │
└─────────────────────────────────────┘
```

**Key Principles:**
- Camera is primary — always visible
- NO text input anywhere
- Big, touch-friendly controls
- Works one-handed
- Dark mode for museum lighting

**Controls:**
- Tap anywhere: Pause/Resume
- "More" button: Go deeper / hear more
- Star: Bookmark for later
- Swipe up: See transcript
- Swipe left: Skip to next artifact (if queue)

---

## Data Flow Example

```
User points at golden mask
         │
         ▼
Camera captures frame
         │
         ▼
YOLO: "funerary_mask" (0.94 confidence)
         │
         ▼
Crop + Extract embedding
         │
         ▼
Similarity search → "gem_001234" (0.97 match)
         │
         ▼
Fetch artifact data from Knowledge Base
         │
         ▼
Check Context: "User hasn't seen this"
         │
         ▼
Build prompt with artifact data + context
         │
         ▼
LLM generates 30-second narration
         │
         ▼
TTS converts to audio (streaming)
         │
         ▼
Audio plays, UI shows artifact name
         │
         ▼
Update Context: "User has seen gem_001234"
```

---

## Offline Package Structure

```
museum_pack_gem_v1/
├── models/
│   ├── yolo_artifacts.tflite       # Category detection
│   ├── embeddings.tflite           # Feature extraction
│   └── ocr.tflite                  # Text recognition
├── data/
│   ├── artifacts.sqlite            # All artifact data
│   ├── embeddings.index            # FAISS/Annoy index
│   └── audio_cache/                # Pre-generated audio (optional)
├── assets/
│   ├── voices/                     # On-device TTS voices
│   └── images/                     # Artifact thumbnails
└── manifest.json                   # Version, checksum, etc.
```

**Estimated Size:**
- Models: ~50-100 MB
- Data (20k artifacts): ~200-500 MB
- Audio cache (optional): Variable
- **Total: ~300 MB - 1 GB**

---

## Tech Stack Summary

| Component | Technology | Notes |
|-----------|------------|-------|
| App Framework | React Native | Cross-platform |
| Camera | react-native-vision-camera | Frame processing |
| Detection | YOLOv12 (TFLite/CoreML) | David training this |
| Embeddings | MobileNetV3 / EfficientNet | On-device |
| Vector Search | FAISS / Annoy | Offline similarity |
| OCR | Google ML Kit | Free, fast |
| Database | SQLite | Offline storage |
| LLM (offline) | Llama 3.2 3B / Phi-3 | TBD |
| LLM (online) | Gemini API | Current |
| TTS (offline) | iOS/Android native | Instant |
| TTS (online) | ElevenLabs / Edge TTS | Better quality |
| State | Zustand / Redux | Context tracking |

---

## Development Phases

### Phase 1: Core Magic (MVP)
- [ ] Camera + YOLO detection working
- [ ] 10-20 hero artifacts in database
- [ ] Basic similarity search
- [ ] Gemini API narration
- [ ] On-device TTS
- [ ] Minimal UI
- **Goal:** Demo that makes people go "woah"

### Phase 2: Scale & Polish
- [ ] Expand to 100+ artifacts
- [ ] OCR fallback
- [ ] Context tracking
- [ ] Multiple story modes
- [ ] Better TTS voice
- [ ] Offline capability
- **Goal:** Actually usable in museum

### Phase 3: Product
- [ ] 1000+ artifacts
- [ ] Multi-language
- [ ] Analytics
- [ ] Museum admin panel
- [ ] Licensing model
- **Goal:** Ready to sell

---

## Open Questions

1. **LLM for offline:** Which small model gives best quality/speed?
2. **Embeddings:** Train custom or use pretrained?
3. **Museum partnership:** Can we get official artifact data/images?
4. **Monetization:** B2B (license to museums) vs B2C (user subscriptions)?

---

## Next Steps

1. David: Train YOLO on artifact categories
2. David: Set up Gemini API integration
3. Milo: Help design database schema
4. Milo: Write prompt templates
5. Together: Build Phase 1 MVP

---

*Let's make museums talk.* 🏛️🦊
