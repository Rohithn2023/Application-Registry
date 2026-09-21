import { extractText } from 'unpdf';
import AdmZip from 'adm-zip';
import {
  CreateApplicationRequest,
  APPLICATION_CATEGORIES,
  APPLICATION_STATUSES,
  TechnologyType,
  SimilarRealWorldApplication,
} from '../types/database';

export interface ExtractedApplicationResult extends CreateApplicationRequest {
  target_users?: string;
  business_domain?: string;
  core_purpose?: string;
  core_functions?: string[];
  major_modules?: string[];
  similar_app_details?: Array<{
    id: string;
    application_name: string;
    category?: string;
    description?: string;
    website?: string;
    similarity_reason?: string;
    match_reason?: string;
    source?: string;
    similarityScore?: number;
  }>;
  similar_real_world_apps?: SimilarRealWorldApplication[];
}

// Known technologies reference dictionary
const TECH_DICTIONARY: { name: string; type: TechnologyType; aliases?: string[] }[] = [
  // Programming Languages
  { name: 'TypeScript', type: 'Programming Language', aliases: ['ts'] },
  { name: 'JavaScript', type: 'Programming Language', aliases: ['js', 'ecmascript'] },
  { name: 'Python', type: 'Programming Language', aliases: ['py', 'python3'] },
  { name: 'Java', type: 'Programming Language' },
  { name: 'C++', type: 'Programming Language', aliases: ['cpp'] },
  { name: 'C#', type: 'Programming Language', aliases: ['csharp', '.net c#'] },
  { name: 'Go', type: 'Programming Language', aliases: ['golang'] },
  { name: 'Rust', type: 'Programming Language' },
  { name: 'Ruby', type: 'Programming Language' },
  { name: 'PHP', type: 'Programming Language' },
  { name: 'Swift', type: 'Programming Language' },
  { name: 'Kotlin', type: 'Programming Language' },
  { name: 'SQL', type: 'Programming Language' },

  // Frontend
  { name: 'React', type: 'Frontend', aliases: ['reactjs', 'react.js'] },
  { name: 'Next.js', type: 'Frontend', aliases: ['nextjs', 'next'] },
  { name: 'Vue.js', type: 'Frontend', aliases: ['vue', 'vuejs'] },
  { name: 'Angular', type: 'Frontend', aliases: ['angularjs'] },
  { name: 'Svelte', type: 'Frontend', aliases: ['sveltekit'] },
  { name: 'Tailwind CSS', type: 'Frontend', aliases: ['tailwind', 'tailwindcss'] },
  { name: 'HTML5', type: 'Frontend', aliases: ['html'] },
  { name: 'CSS3', type: 'Frontend', aliases: ['css'] },
  { name: 'Redux', type: 'Frontend', aliases: ['redux toolkit'] },

  // Backend
  { name: 'Node.js', type: 'Backend', aliases: ['nodejs', 'node'] },
  { name: 'Express', type: 'Backend', aliases: ['express.js', 'expressjs'] },
  { name: 'Django', type: 'Backend' },
  { name: 'FastAPI', type: 'Backend' },
  { name: 'Flask', type: 'Backend' },
  { name: 'Spring Boot', type: 'Backend', aliases: ['spring'] },
  { name: 'NestJS', type: 'Backend', aliases: ['nest.js'] },
  { name: 'GraphQL', type: 'Backend' },

  // Database
  { name: 'PostgreSQL', type: 'Database', aliases: ['postgres', 'psql'] },
  { name: 'MySQL', type: 'Database' },
  { name: 'MongoDB', type: 'Database', aliases: ['mongo'] },
  { name: 'Redis', type: 'Database' },
  { name: 'SQLite', type: 'Database' },
  { name: 'Supabase', type: 'Database' },
  { name: 'Firebase', type: 'Database', aliases: ['firestore'] },
  { name: 'DynamoDB', type: 'Database' },
  { name: 'Elasticsearch', type: 'Database' },

  // Framework
  { name: 'Docker', type: 'Framework' },
  { name: 'Kubernetes', type: 'Framework', aliases: ['k8s'] },
  { name: 'Electron', type: 'Framework' },
  { name: 'React Native', type: 'Framework' },
  { name: 'Flutter', type: 'Framework' },

  // Library
  { name: 'PyTorch', type: 'Library' },
  { name: 'TensorFlow', type: 'Library' },
  { name: 'Pandas', type: 'Library' },
  { name: 'Prisma', type: 'Library' },

  // Cloud & Infrastructure Services (Strictly extracted as technologies)
  { name: 'AWS', type: 'Backend', aliases: ['amazon web services'] },
  { name: 'Google Cloud Platform', type: 'Backend', aliases: ['gcp'] },
  { name: 'Microsoft Azure', type: 'Backend', aliases: ['azure'] },
  { name: 'Cloudflare', type: 'Backend' },

  // Supporting APIs & Third-Party Integrations (Strictly extracted as technologies)
  { name: 'Google Maps API', type: 'Library', aliases: ['google maps', 'mapping api'] },
  { name: 'Stripe', type: 'Library', aliases: ['stripe api', 'payment gateway'] },
  { name: 'Razorpay', type: 'Library', aliases: ['razorpay api'] },
  { name: 'Twilio', type: 'Library', aliases: ['twilio api', 'sms service'] },
  { name: 'SendGrid', type: 'Library', aliases: ['sendgrid api'] },
  { name: 'Auth0', type: 'Library', aliases: ['auth0 api', 'authentication service'] },
];

/**
 * Extracts raw text from PDF or PPTX documents.
 */
export async function extractRawTextFromBuffer(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<string> {
  const lowerName = filename.toLowerCase();

  // 1. PDF handling
  if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
    try {
      const { text } = await extractText(new Uint8Array(buffer));
      if (Array.isArray(text)) {
        return text.join('\n\n');
      }
      return text || '';
    } catch (err) {
      console.error('PDF extraction failed:', err);
      throw new Error('Failed to parse PDF document. Please ensure the file is not encrypted.');
    }
  }

  // 2. PPTX handling
  if (
    lowerName.endsWith('.pptx') ||
    lowerName.endsWith('.ppt') ||
    mimeType?.includes('presentation')
  ) {
    try {
      const zip = new AdmZip(buffer);
      const entries = zip.getEntries();
      const slideTexts: string[] = [];

      const slideEntries = entries
        .filter(
          (e) =>
            e.entryName.startsWith('ppt/slides/slide') &&
            e.entryName.endsWith('.xml')
        )
        .sort((a, b) => {
          const numA = parseInt(a.entryName.replace(/\D/g, '')) || 0;
          const numB = parseInt(b.entryName.replace(/\D/g, '')) || 0;
          return numA - numB;
        });

      for (const entry of slideEntries) {
        const content = entry.getData().toString('utf8');
        const paragraphs = content.match(/<a:p[\s\S]*?<\/a:p>/gi) || [content];
        const lines: string[] = [];

        for (const p of paragraphs) {
          const matches = p.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/gi);
          if (matches) {
            const line = matches
              .map((m) => m.replace(/<\/?a:t[^>]*>/gi, '').trim())
              .filter(Boolean)
              .join(' ');
            if (line) lines.push(line);
          }
        }

        if (lines.length > 0) {
          slideTexts.push(lines.join('\n'));
        }
      }

      return slideTexts.join('\n\n');
    } catch (err) {
      console.error('PPTX extraction failed:', err);
      throw new Error('Failed to parse PowerPoint document. Please ensure it is a valid PPTX file.');
    }
  }

  throw new Error('Unsupported file format. Please upload a PDF or PPTX file.');
}

/**
 * Intelligent semantic extractor that parses raw text from documents into a structured
 * CreateApplicationRequest containing application identity, purpose, domain, and technologies.
 *
 * NOTE: This function does NOT perform similarity search against any database or registry.
 * Similarity discovery is handled exclusively via real-time external web search.
 */
export async function parseApplicationMetadata(
  rawText: string,
  filename: string
): Promise<ExtractedApplicationResult> {
  if (process.env.GEMINI_API_KEY) {
    try {
      const aiExtracted = await extractWithGemini(rawText);
      if (aiExtracted && aiExtracted.application_name) {
        return aiExtracted;
      }
    } catch (e) {
      console.warn('Gemini extraction fallback to heuristic parser:', e);
    }
  }

  return extractWithHeuristics(rawText, filename);
}

/**
 * Heuristic semantic rule engine to extract structured application details.
 */
function extractWithHeuristics(
  text: string,
  filename: string
): ExtractedApplicationResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let appName = '';
  let appType = '';
  let developerName = '';
  let developmentTeam = '';
  let category = '';
  let status = 'Active';
  let version = '1.0';
  let purpose = '';
  let description = '';
  let targetUsers = '';
  let additionalNotes = '';
  const coreFunctions: string[] = [];
  const majorModules: string[] = [];

  // Line-by-line inspection for labeled key-value pairs
  for (const line of lines) {
    // Application Name
    if (!appName) {
      const m = line.match(/^(?:application\s*name|project\s*name|system\s*name|title)\s*[:=-]\s*(.+)$/i);
      if (m) appName = m[1].trim().replace(/^["']|["']$/g, '');
    }

    // Application Type
    if (!appType) {
      const m = line.match(/^(?:application\s*type|system\s*type|product\s*type|platform\s*type|type)\s*[:=-]\s*(.+)$/i);
      if (m) appType = m[1].trim();
    }

    // Developer Name
    if (!developerName) {
      const m = line.match(/^(?:developer(?:\s*name)?|author|organization|company|created\s*by)\s*[:=-]\s*(.+)$/i);
      if (m) developerName = m[1].trim().replace(/^["']|["']$/g, '');
    }

    // Development Team
    if (!developmentTeam) {
      const m = line.match(/^(?:development\s*team|engineering\s*team|team|group)\s*[:=-]\s*(.+)$/i);
      if (m) developmentTeam = m[1].trim().replace(/^["']|["']$/g, '');
    }

    // Category
    if (!category) {
      const m = line.match(/^(?:category|domain|business\s*domain|industry)\s*[:=-]\s*(.+)$/i);
      if (m) {
        const candidate = m[1].trim();
        const matched = APPLICATION_CATEGORIES.find(
          (c) =>
            c.toLowerCase() === candidate.toLowerCase() ||
            candidate.toLowerCase().includes(c.toLowerCase()) ||
            c.toLowerCase().includes(candidate.toLowerCase())
        );
        category = matched || candidate;
      }
    }

    // Target Users
    if (!targetUsers) {
      const m = line.match(/^(?:target\s*users?|target\s*audience|users?|audience)\s*[:=-]\s*(.+)$/i);
      if (m) targetUsers = m[1].trim();
    }

    // Core Business Functionality
    const funcMatch = line.match(/^(?:core\s*(?:business\s*)?functionality|key\s*features?|core\s*features?|main\s*functions?)\s*[:=-]\s*(.+)$/i);
    if (funcMatch) {
      const funcs = funcMatch[1].split(/[,;]/).map((s) => s.trim()).filter(Boolean);
      coreFunctions.push(...funcs);
    }

    // Major Modules
    const moduleMatch = line.match(/^(?:major\s*modules?|modules?|components?|subsystems?)\s*[:=-]\s*(.+)$/i);
    if (moduleMatch) {
      const mods = moduleMatch[1].split(/[,;]/).map((s) => s.trim()).filter(Boolean);
      majorModules.push(...mods);
    }

    // Status
    const statusMatch = line.match(/^status\s*[:=-]\s*(.+)$/i);
    if (statusMatch) {
      const candidate = statusMatch[1].trim();
      const matched = APPLICATION_STATUSES.find(
        (s) => s.toLowerCase() === candidate.toLowerCase()
      );
      if (matched) status = matched;
    }

    // Version
    if (version === '1.0') {
      const m = line.match(/^(?:version|ver|release|v\.?)\s*[:=-]?\s*([0-9]+(?:\.[0-9]+)*(?:-[a-z0-9.]+)?)/i);
      if (m) version = m[1].trim();
    }

    // Purpose / Objective
    if (!purpose) {
      const m = line.match(/^(?:main\s*purpose|purpose|use\s*case|objective|goals?)\s*[:=-]\s*(.+)$/i);
      if (m) purpose = m[1].trim();
    }

    // Description / Overview
    if (!description) {
      const m = line.match(/^(?:description|overview|summary|about)\s*[:=-]\s*(.+)$/i);
      if (m) description = m[1].trim();
    }

    // Notes
    if (!additionalNotes) {
      const m = line.match(/^(?:notes|additional\s*notes|architecture\s*notes)\s*[:=-]\s*(.+)$/i);
      if (m) additionalNotes = m[1].trim();
    }
  }

  // Fallback for Application Name if not explicitly labeled
  if (!appName) {
    for (const line of lines.slice(0, 4)) {
      if (
        line.length > 2 &&
        line.length < 60 &&
        !line.includes(':') &&
        !/^(documentation|overview|architecture|spec|draft)/i.test(line)
      ) {
        appName = line.replace(/(?:application|system|platform)$/i, '').trim();
        break;
      }
    }
    if (!appName) {
      appName = filename
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  // Fallback for Developer
  if (!developerName) {
    developerName = developmentTeam || 'Core Engineering';
  }

  // Fallback for Category if missing
  if (!category) {
    if (/food|restaurant|dining|meal|grocery|dish|swiggy|zomato/i.test(text)) {
      category = 'E-Commerce';
    } else if (/movie|video|stream|tv shows|watch|netflix/i.test(text)) {
      category = 'Entertainment';
    } else if (/ride|cab|taxi|driver|uber|mobility|commute/i.test(text)) {
      category = 'Transportation / Mobility';
    } else {
      for (const cat of APPLICATION_CATEGORIES) {
        if (new RegExp(`\\b${escapeRegExp(cat)}\\b`, 'i').test(text)) {
          category = cat;
          break;
        }
      }
      if (!category) category = 'Other';
    }
  }

  // Fallback for Description & Purpose
  if (!purpose && appType) {
    purpose = `A ${appType} platform.`;
  }
  if (!description) {
    description = purpose || `Documentation for ${appName}`;
  }
  if (!purpose) {
    purpose = description;
  }

  // Technologies extraction: Strictly separate technologies, databases, APIs, frameworks
  const foundTechs: { technology_name: string; technology_type: TechnologyType }[] = [];
  const addedSet = new Set<string>();

  for (const item of TECH_DICTIONARY) {
    const patterns = [item.name, ...(item.aliases || [])];
    const regex = new RegExp(`\\b(${patterns.map(escapeRegExp).join('|')})\\b`, 'i');
    if (regex.test(text) && !addedSet.has(item.name.toLowerCase())) {
      foundTechs.push({
        technology_name: item.name,
        technology_type: item.type,
      });
      addedSet.add(item.name.toLowerCase());
    }
  }

  // Check for explicit "Technologies:" or "Tech Stack:" bullet list
  const techSectionMatch = text.match(
    /(?:technologies|tech\s*stack|tools\s*used|integrations?|services\s*used)\s*[:=-]\s*([^\r\n]+)/i
  );
  if (techSectionMatch) {
    const items = techSectionMatch[1]
      .split(/[,;\n•\-\*]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 40);
    for (const item of items) {
      if (!addedSet.has(item.toLowerCase()) && !/^(and|or|etc|used|with|including)$/i.test(item)) {
        foundTechs.push({
          technology_name: item,
          technology_type: 'Other' as TechnologyType,
        });
        addedSet.add(item.toLowerCase());
      }
    }
  }

  return {
    application_name: appName,
    description: description,
    developer_name: developerName,
    development_team: developmentTeam,
    category: category,
    status: status,
    version: version,
    purpose: purpose,
    is_existing: true,
    additional_notes: additionalNotes,
    technologies: foundTechs,
    similar_applications: [],
    related_applications: [],
    target_users: targetUsers,
    business_domain: appType || category,
    core_purpose: purpose,
    core_functions: coreFunctions,
    major_modules: majorModules,
  };
}

/**
 * Optional Gemini LLM extraction when GEMINI_API_KEY is available.
 */
async function extractWithGemini(rawText: string): Promise<ExtractedApplicationResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are an expert system architecture and product analyst. Extract application metadata from the following documentation text.
Focus on identifying the COMPLETE APPLICATION / PRODUCT identity, business domain, and purpose.
Strictly separate supporting technologies (APIs, databases, frameworks, infrastructure) into the technologies array.

Return ONLY valid JSON matching this schema:
{
  "application_name": "string (required)",
  "description": "string",
  "developer_name": "string (required)",
  "development_team": "string",
  "category": "one of: Search Engine, Mapping & Navigation, News & Media, Communication, Productivity, Cloud Storage, Entertainment, Finance, Developer Tools, Social Media, E-Commerce, Transportation / Mobility, Analytics, Security, Other",
  "status": "one of: Active, In Development, Beta, Maintenance, Deprecated, Retired",
  "version": "string (e.g. 1.0)",
  "purpose": "string",
  "target_users": "string",
  "business_domain": "string",
  "core_functions": ["string"],
  "major_modules": ["string"],
  "is_existing": true,
  "additional_notes": "string",
  "technologies": [
    {
      "technology_name": "string",
      "technology_type": "one of: Programming Language, Frontend, Backend, Database, Framework, Library, Other"
    }
  ]
}

Documentation text:
"""
${rawText.slice(0, 8000)}
"""`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) return null;

  const parsed = JSON.parse(textOutput);
  return {
    ...parsed,
    similar_applications: [],
    related_applications: [],
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
