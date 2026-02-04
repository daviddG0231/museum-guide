/**
 * NarrationService - Generate contextual stories from artifact data
 * 
 * Uses LLM to create engaging narratives grounded in factual data.
 * No hallucination - only uses provided facts.
 */

import { Artifact, NarrationContext, GeneratedNarration, StoryMode, Language } from '../types';

// API configuration - replace with your keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class NarrationServiceClass {
  /**
   * Generate narration for an artifact
   */
  async generate(context: NarrationContext): Promise<GeneratedNarration> {
    const prompt = this.buildPrompt(context);
    
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt,
            }],
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: this.getMaxTokens(context.mode),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        text: text.trim(),
        estimatedDuration: this.estimateDuration(text),
      };
    } catch (error) {
      console.error('Narration generation failed:', error);
      // Fallback to basic narration
      return this.generateFallback(context.artifact, context.mode);
    }
  }

  /**
   * Build the LLM prompt with all context
   */
  private buildPrompt(context: NarrationContext): string {
    const { artifact, previousArtifacts, mode, language } = context;
    
    const durationGuide = {
      quick: '15-30 seconds (~50-75 words)',
      standard: '1-2 minutes (~150-300 words)',
      deep: '3-5 minutes (~450-750 words)',
      kids: '30-45 seconds (~75-110 words, simple language)',
    };

    const modeInstructions = {
      quick: 'Give a punchy, memorable hook followed by one fascinating fact. Make them want to know more.',
      standard: 'Tell the full story: what it is, why it matters, one surprising detail, and its historical significance.',
      deep: 'Provide comprehensive detail: historical context, creation/discovery, artistic significance, cultural meaning, and connections to other artifacts.',
      kids: 'Use simple words and fun comparisons. Make it exciting and relatable to a child\'s world.',
    };

    const languageInstructions = language === 'ar' 
      ? 'Respond in Arabic (Egyptian dialect preferred for natural flow).'
      : 'Respond in English.';

    const previousContext = previousArtifacts.length > 0
      ? `\nThe visitor has already seen these artifacts: ${previousArtifacts.join(', ')}. Make connections if relevant.`
      : '';

    return `You are a master storyteller at the Grand Egyptian Museum. You bring ancient artifacts to life with vivid, accurate narratives that captivate visitors.

CRITICAL RULES:
- Use ONLY the facts provided below. Never invent details.
- Speak as if you're standing next to the visitor, sharing something wonderful
- Be engaging but historically accurate
- Keep to ${durationGuide[mode]}
- ${languageInstructions}

STYLE FOR THIS MODE (${mode}):
${modeInstructions[mode]}
${previousContext}

ARTIFACT DATA:
Name: ${artifact.name}
${artifact.nameArabic ? `Arabic Name: ${artifact.nameArabic}` : ''}
Category: ${artifact.category}
${artifact.dynasty ? `Dynasty: ${artifact.dynasty}` : ''}
${artifact.period ? `Period: ${artifact.period}` : ''}
${artifact.dateApprox ? `Date: ${artifact.dateApprox}` : ''}
${artifact.material ? `Materials: ${artifact.material.join(', ')}` : ''}
${artifact.dimensions ? `Dimensions: ${artifact.dimensions}` : ''}
${artifact.weight ? `Weight: ${artifact.weight}` : ''}
${artifact.discovery ? `Discovery: Found in ${artifact.discovery.location} (${artifact.discovery.date})${artifact.discovery.discoverer ? ` by ${artifact.discovery.discoverer}` : ''}` : ''}

Key Facts:
${artifact.storyFacts.map((fact, i) => `${i + 1}. ${fact}`).join('\n')}

Now, create the narration:`;
  }

  /**
   * Get max tokens based on story mode
   */
  private getMaxTokens(mode: StoryMode): number {
    const tokenLimits: Record<StoryMode, number> = {
      quick: 150,
      standard: 500,
      deep: 1000,
      kids: 200,
    };
    return tokenLimits[mode];
  }

  /**
   * Estimate spoken duration from text
   * Average speaking rate: ~150 words per minute
   */
  private estimateDuration(text: string): number {
    const words = text.split(/\s+/).length;
    return Math.ceil((words / 150) * 60);  // seconds
  }

  /**
   * Fallback narration when API fails
   */
  private generateFallback(artifact: Artifact, mode: StoryMode): GeneratedNarration {
    const facts = artifact.storyFacts.slice(0, mode === 'quick' ? 1 : 3);
    
    let text = `This is ${artifact.name}`;
    if (artifact.dynasty) text += ` from the ${artifact.dynasty}`;
    if (artifact.period) text += ` during the ${artifact.period}`;
    text += '. ';
    text += facts.join(' ');

    return {
      text,
      estimatedDuration: this.estimateDuration(text),
    };
  }
}

export const NarrationService = new NarrationServiceClass();
