// ============================================
// Database Types
// ============================================

export interface Application {
  id: string;
  application_name: string;
  description: string | null;
  developer_name: string;
  development_team: string | null;
  category: string | null;
  status: string;
  version: string | null;
  purpose: string | null;
  is_existing: boolean;
  additional_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Technology {
  id: string;
  technology_name: string;
  technology_type: TechnologyType;
}

export type TechnologyType =
  | 'Programming Language'
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'Framework'
  | 'Library';

export interface ApplicationTechnology {
  id: string;
  application_id: string;
  technology_id: string;
  technology?: Technology;
}

export interface ApplicationRelationship {
  id: string;
  application_id: string;
  related_application_id: string;
  relationship_type: RelationshipType;
  related_application?: Application;
}

export type RelationshipType =
  | 'Similar To'
  | 'Related To'
  | 'Improved Version Of'
  | 'Alternative To'
  | 'Depends On'
  | 'Replaces';

// ============================================
// API Request/Response Types
// ============================================

export interface ApplicationWithDetails extends Application {
  technologies: Technology[];
  relationships: {
    id: string;
    relationship_type: RelationshipType;
    related_application: {
      id: string;
      application_name: string;
    };
  }[];
}

export interface SimilarAppDetail {
  id: string;
  application_name: string;
  category?: string | null;
  similarity_reason: string;
  match_reason?: string;
}

export interface SimilarRealWorldApplication {
  name: string;
  website?: string;
  sourceUrl?: string;
  category: string;
  description: string;
  reason?: string;
  similarityReason: string;
  source: string;
  similarityScore?: number;
}

export interface ApplicationRegistryRecord {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  targetUsers?: string;
  businessDomain?: string;
  corePurpose?: string;
  coreFunctions?: string[];
  additionalNotes?: string | null;
  technologies?: string[];
}

export interface CreateApplicationRequest {
  application_name: string;
  description?: string;
  developer_name: string;
  development_team?: string;
  category?: string;
  status?: string;
  version?: string;
  purpose?: string;
  is_existing?: boolean;
  additional_notes?: string;
  technologies?: {
    technology_name: string;
    technology_type: TechnologyType;
  }[];
  similar_applications?: string[];
  related_applications?: string[];
}

export interface UpdateApplicationRequest extends CreateApplicationRequest {
  id: string;
}

export interface ApplicationFilters {
  search?: string;
  category?: string;
  status?: string;
  technology?: string;
  is_existing?: string;
  developer?: string;
}

// ============================================
// Constants
// ============================================

export const APPLICATION_STATUSES = [
  'Active',
  'In Development',
  'Beta',
  'Maintenance',
  'Deprecated',
  'Retired',
] as const;

export const APPLICATION_CATEGORIES = [
  'Search Engine',
  'Communication',
  'Mapping & Navigation',
  'News & Media',
  'Social Media',
  'Productivity',
  'E-Commerce',
  'Healthcare',
  'Finance',
  'Education',
  'Entertainment',
  'Developer Tools',
  'Security',
  'Analytics',
  'Cloud Services',
  'Other',
] as const;

export const TECHNOLOGY_TYPES: TechnologyType[] = [
  'Programming Language',
  'Frontend',
  'Backend',
  'Database',
  'Framework',
  'Library',
];

export const RELATIONSHIP_TYPES: RelationshipType[] = [
  'Similar To',
  'Related To',
  'Improved Version Of',
  'Alternative To',
  'Depends On',
  'Replaces',
];
