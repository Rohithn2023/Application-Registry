/**
 * ============================================================================
 * SIMILARITY SERVICE ADAPTER (BACKWARD COMPATIBILITY)
 * ============================================================================
 * Redirects legacy calls from webSearchSimilarity to the new Hybrid
 * similarityService (Gemini Free AI + Zero-Config Semantic Knowledge Base).
 * ============================================================================
 */

export {
  searchExternalSimilarApplications,
  findSimilarRealWorldApplications,
  type ExternalSearchInput,
  type ExternalSearchResponse,
} from './similarityService';
