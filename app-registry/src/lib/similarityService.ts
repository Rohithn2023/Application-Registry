import { SimilarRealWorldApplication } from '@/types/database';

/**
 * ============================================================================
 * SIMILAR REAL-WORLD APPLICATION DISCOVERY SERVICE
 * ============================================================================
 * 
 * Clean, API-only approach using Google Gemini to discover real-world
 * similar applications. No hardcoded catalogs — pure AI intelligence.
 * 
 * Requires GEMINI_API_KEY in .env.local
 * Get a free key at: https://aistudio.google.com/app/apikey
 * ============================================================================
 */

export interface ExternalSearchInput {
  applicationName: string;
  applicationType?: string;
  category?: string;
  description?: string;
  purpose?: string;
  coreFunctions?: string[];
}

export interface ExternalSearchResponse {
  source: 'gemini-ai' | 'web';
  results: SimilarRealWorldApplication[];
  error?: string;
}

/**
 * Build a rich prompt for Gemini to discover similar real-world applications.
 */
function buildDiscoveryPrompt(input: ExternalSearchInput): string {
  const appName = input.applicationName || 'Unknown';
  const category = input.category || input.applicationType || 'Software Platform';
  const purpose = input.purpose || 'Not specified';
  const description = input.description || 'Not specified';
  const coreFunctions = (input.coreFunctions || []).join(', ') || 'Not specified';

  return `You are an expert enterprise software architect and market analyst with deep knowledge of real-world applications across all industries.

Analyze the following application and find 4 to 6 REAL, well-known, production software applications or platforms that are most similar to it:

APPLICATION DETAILS:
- Name: ${appName}
- Category / Industry: ${category}
- Purpose: ${purpose}
- Description: ${description}
- Core Functions: ${coreFunctions}

CRITICAL RULES:
1. Return ONLY real, existing, production consumer or enterprise software applications (e.g., Swiggy, DoorDash, Uber, Slack, Stripe, Shopify, Notion).
2. Do NOT return technologies, programming languages, databases, cloud infrastructure, or dev tools (e.g., NOT PostgreSQL, Docker, AWS, React, Tailwind) unless the target app itself is a developer tool.
3. Do NOT return the target application itself ("${appName}").
4. Each result must be a genuinely similar application in terms of core features, user experience, and business domain.
5. Provide a realistic similarityScore between 75 and 96 based on actual feature overlap.
6. Provide the exact official website URL (e.g., https://www.doordash.com).
7. Explain clearly in 1-2 sentences WHY it is similar in terms of core features and domain.
8. The description should be 1-2 sentences about what the application actually does.

Return ONLY a valid JSON array in this exact format (no markdown, no code fences, no extra text):
[
  {
    "name": "Application Name",
    "category": "Industry Category",
    "description": "Short 1-2 sentence description of what the application does",
    "website": "https://official-website.com",
    "similarityScore": 88,
    "similarityReason": "Similar to ${appName} because both provide [specific shared features] in the [domain] space."
  }
]`;
}

/**
 * Call Google Gemini API to discover similar applications.
 * Tries multiple model versions for resilience.
 */
async function callGeminiAPI(
  prompt: string,
  apiKey: string
): Promise<SimilarRealWorldApplication[] | null> {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[SIMILARITY] Gemini (${model}) HTTP ${res.status}:`, errorText);
        continue;
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const parsed = JSON.parse(rawText);
      if (!Array.isArray(parsed) || parsed.length === 0) continue;

      return parsed;
    } catch (err) {
      console.warn(`[SIMILARITY] Gemini (${model}) error:`, err);
    }
  }

  return null;
}

/**
 * Process and validate Gemini results into the standard format.
 */
function processResults(
  raw: Record<string, unknown>[],
  targetName: string,
  category: string
): SimilarRealWorldApplication[] {
  const targetLower = targetName.toLowerCase().trim();
  const results: SimilarRealWorldApplication[] = [];

  for (const item of raw) {
    const name = (String(item.name || '')).trim();
    if (!name || name.toLowerCase() === targetLower) continue;

    const score = typeof item.similarityScore === 'number'
      ? Math.min(96, Math.max(75, Math.round(item.similarityScore)))
      : 85;

    results.push({
      name,
      category: String(item.category || category || 'Software Platform'),
      description: String(item.description || `Real-world application in the ${category} domain.`),
      website: String(item.website || '') || undefined,
      sourceUrl: String(item.website || '') || undefined,
      similarityReason: String(item.similarityReason || `Comparable application in the ${category} space.`),
      reason: String(item.similarityReason || `Comparable application in the ${category} space.`),
      source: 'Google Gemini AI',
      similarityScore: score,
    });
  }

  return results;
}

/**
 * ─────────────────────────────────────────────────────────────────
 * MAIN ENTRY POINT
 * ─────────────────────────────────────────────────────────────────
 * Discovers similar real-world applications using Google Gemini AI.
 */
export async function searchExternalSimilarApplications(
  input: ExternalSearchInput
): Promise<ExternalSearchResponse> {
  const appName = (input.applicationName || '').trim();
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;

  console.log(`[SIMILARITY] Discovering similar apps for: "${appName}"`);

  if (!apiKey) {
    console.warn('[SIMILARITY] No GEMINI_API_KEY found in .env.local');
    return {
      source: 'gemini-ai',
      results: [],
      error: 'Gemini API key is not configured. Add GEMINI_API_KEY to your .env.local file.',
    };
  }

  try {
    const prompt = buildDiscoveryPrompt(input);
    const rawResults = await callGeminiAPI(prompt, apiKey);

    if (!rawResults || rawResults.length === 0) {
      return {
        source: 'gemini-ai',
        results: [],
        error: 'Gemini AI returned no results. Please try again.',
      };
    }

    const results = processResults(
      rawResults as unknown as Record<string, unknown>[],
      appName,
      input.category || input.applicationType || 'Software Platform'
    );

    console.log(`[SIMILARITY] Found ${results.length} similar applications via Gemini AI`);

    return {
      source: 'gemini-ai',
      results,
    };
  } catch (err) {
    console.error('[SIMILARITY] Error:', err);
    return {
      source: 'gemini-ai',
      results: [],
      error: 'Failed to discover similar applications. Please try again.',
    };
  }
}

/**
 * Backward-compatible helper for legacy calls.
 */
export async function findSimilarRealWorldApplications(
  appName: string,
  category?: string,
  description?: string,
  purpose?: string,
  coreFunctions?: string[]
): Promise<SimilarRealWorldApplication[]> {
  const res = await searchExternalSimilarApplications({
    applicationName: appName,
    category,
    description,
    purpose,
    coreFunctions,
  });

  return res.results;
}
