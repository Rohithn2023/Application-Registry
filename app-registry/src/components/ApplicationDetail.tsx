'use client';

import React, { useState, useEffect } from 'react';
import { Application, Technology, ApplicationRelationship, SimilarRealWorldApplication } from '@/types/database';

interface ApplicationDetailProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

interface SimilarAppsState {
  loading: boolean;
  results: SimilarRealWorldApplication[];
  source: string;
  error: string | null;
}

function getTechTypeColor(type?: string): string {
  switch ((type || '').toLowerCase()) {
    case 'programming language': return 'tech-tag-lang';
    case 'frontend': return 'tech-tag-frontend';
    case 'backend': return 'tech-tag-backend';
    case 'database': return 'tech-tag-database';
    case 'framework': return 'tech-tag-framework';
    case 'library': return 'tech-tag-library';
    default: return 'tech-tag-lang';
  }
}

function getStatusBadge(status?: string): string {
  switch ((status || '').toLowerCase()) {
    case 'active': return 'badge-active';
    case 'in development': return 'badge-development';
    case 'beta': return 'badge-beta';
    case 'maintenance': return 'badge-maintenance';
    case 'deprecated': return 'badge-deprecated';
    case 'retired': return 'badge-retired';
    default: return 'badge-active';
  }
}

function getRelationIcon(type?: string): string {
  switch (type) {
    case 'Similar To': return '≈';
    case 'Related To': return '↔';
    case 'Improved Version Of': return '↑';
    case 'Alternative To': return '⇄';
    case 'Depends On': return '→';
    case 'Replaces': return '⟶';
    default: return '→';
  }
}

function getScoreColor(score?: number): string {
  if (!score) return 'text-zinc-600 bg-zinc-50 border-zinc-200';
  if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 80) return 'text-teal-700 bg-teal-50 border-teal-200';
  return 'text-sky-700 bg-sky-50 border-sky-200';
}

function getSourceLabel(source: string): string {
  if (source.toLowerCase().includes('gemini')) return '✦ Gemini AI';
  if (source.toLowerCase().includes('catalog') || source.toLowerCase().includes('enterprise')) return '📚 Knowledge Base';
  return source;
}

export default function ApplicationDetail({
  application,
  isOpen,
  onClose,
}: ApplicationDetailProps) {
  const [similarApps, setSimilarApps] = useState<SimilarAppsState>({
    loading: false,
    results: [],
    source: '',
    error: null,
  });

  // Fetch similar real-world applications when the panel opens
  useEffect(() => {
    if (!isOpen || !application) {
      setSimilarApps({ loading: false, results: [], source: '', error: null });
      return;
    }

    const controller = new AbortController();

    const fetchSimilarApps = async () => {
      setSimilarApps({ loading: true, results: [], source: '', error: null });

      try {
        const res = await fetch('/api/similar-applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            applicationName: application.application_name,
            category: application.category || '',
            description: application.description || '',
            purpose: application.purpose || '',
            coreFunctions: [],
          }),
        });

        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }

        const data = await res.json();
        setSimilarApps({
          loading: false,
          results: data.results || [],
          source: data.source || '',
          error: data.error || null,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setSimilarApps({
          loading: false,
          results: [],
          source: '',
          error: 'Unable to discover similar applications at this time.',
        });
      }
    };

    fetchSimilarApps();

    return () => controller.abort();
  }, [isOpen, application]);

  if (!isOpen || !application) return null;

  const techByType: Record<string, NonNullable<Application['technologies']>> = {};
  (application.technologies || []).forEach((tech) => {
    const type = tech.technology_type || 'Other';
    if (!techByType[type]) techByType[type] = [];
    techByType[type].push(tech);
  });

  // Group relationships by type
  const relByType: Record<string, NonNullable<Application['relationships']>> = {};
  (application.relationships || []).forEach((rel) => {
    if (!relByType[rel.relationship_type]) relByType[rel.relationship_type] = [];
    relByType[rel.relationship_type].push(rel);
  });

  return (
    <>
      <div className="side-panel-overlay" onClick={onClose} />
      <div className="side-panel bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-zinc-50 border-b border-zinc-200 p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <span>
                  {application.application_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
                  {application.application_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${getStatusBadge(application.status)}`}>
                    {application.status}
                  </span>
                  {application.is_existing ? (
                    <span className="text-[10px] text-zinc-700 bg-zinc-100 border border-zinc-300 px-1.5 py-0.2 rounded font-medium uppercase tracking-wider">
                      Existing
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-900 bg-zinc-200 border border-zinc-300 px-1.5 py-0.2 rounded font-medium uppercase tracking-wider">
                      New
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              id="close-detail-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Application Information */}
          <section>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Application Information
            </h3>
            <div className="glass-card-subtle p-4 space-y-3.5 bg-zinc-50 border border-zinc-200">
              {application.description && (
                <div>
                  <label className="text-[10.5px] text-zinc-500 uppercase tracking-wider font-semibold">Description</label>
                  <p className="text-xs sm:text-sm text-zinc-800 mt-1 leading-relaxed">{application.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10.5px] text-zinc-500 uppercase tracking-wider font-semibold">Developer</label>
                  <p className="text-xs sm:text-sm text-zinc-900 mt-0.5 font-medium">{application.developer_name}</p>
                </div>
                <div>
                  <label className="text-[10.5px] text-zinc-500 uppercase tracking-wider font-semibold">Team</label>
                  <p className="text-xs sm:text-sm text-zinc-800 mt-0.5">{application.development_team || '—'}</p>
                </div>
                <div>
                  <label className="text-[10.5px] text-zinc-500 uppercase tracking-wider font-semibold">Category</label>
                  <p className="text-xs sm:text-sm text-zinc-800 mt-0.5">{application.category || '—'}</p>
                </div>
                <div>
                  <label className="text-[10.5px] text-zinc-500 uppercase tracking-wider font-semibold">Version</label>
                  <p className="text-xs sm:text-sm text-zinc-700 mt-0.5 font-mono">{application.version || '—'}</p>
                </div>
              </div>
              {application.purpose && (
                <div>
                  <label className="text-[10.5px] text-zinc-500 uppercase tracking-wider font-semibold">Purpose / Use Case</label>
                  <p className="text-xs sm:text-sm text-zinc-800 mt-1 leading-relaxed">{application.purpose}</p>
                </div>
              )}
              {application.additional_notes && (
                <div>
                  <label className="text-[10.5px] text-zinc-500 uppercase tracking-wider font-semibold">Additional Notes</label>
                  <p className="text-xs sm:text-sm text-zinc-700 mt-1 leading-relaxed">{application.additional_notes}</p>
                </div>
              )}
              <div className="flex items-center gap-6 pt-3 border-t border-zinc-200">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Created</label>
                  <p className="text-[11.5px] text-zinc-700 mt-0.5 font-medium">
                    {new Date(application.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Updated</label>
                  <p className="text-[11.5px] text-zinc-700 mt-0.5 font-medium">
                    {new Date(application.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Technology Information */}
          <section>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              Technology Stack
            </h3>
            <div className="glass-card-subtle p-4 space-y-3 bg-zinc-50 border border-zinc-200">
              {Object.keys(techByType).length > 0 ? (
                Object.entries(techByType).map(([type, techs]) => (
                  <div key={type}>
                    <label className="text-[10.5px] text-zinc-500 uppercase tracking-wider font-semibold">{type}</label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {techs.map((tech, idx) => (
                        <span key={idx} className={`tech-tag ${getTechTypeColor(tech.technology_type)} py-1 px-2.5`}>
                          {tech.technology_name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 italic">No technologies documented</p>
              )}
            </div>
          </section>

          {/* Application Relationships */}
          <section>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Application Relationships
            </h3>
            <div className="glass-card-subtle p-4 bg-zinc-50 border border-zinc-200">
              {Object.keys(relByType).length > 0 ? (
                <div className="space-y-3.5">
                  {Object.entries(relByType).map(([type, rels]) => (
                    <div key={type}>
                      <label className="text-[10.5px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">
                        {type}
                      </label>
                      <div className="space-y-1.5">
                        {rels.map((rel) => (
                          <div
                            key={rel.id}
                            className="flex items-center gap-2 text-xs py-2 px-3 rounded-md bg-white border border-zinc-200 hover:border-zinc-300 transition-colors"
                          >
                            <span className="text-sm font-semibold text-zinc-600">
                              {getRelationIcon(rel.relationship_type)}
                            </span>
                            <span className="text-zinc-900 font-medium">
                              {rel.related_application?.application_name || 'Unknown'}
                            </span>
                            <span className="text-[10.5px] ml-auto text-zinc-500 font-mono">
                              {rel.relationship_type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No relationships documented</p>
              )}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              LIVE SIMILAR REAL-WORLD APPLICATIONS (via API)
              ══════════════════════════════════════════════════════════════════ */}
          <section>
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Similar Real-World Applications
              {similarApps.source && !similarApps.loading && (
                <span className="ml-auto text-[10px] text-zinc-500 font-medium flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 normal-case tracking-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {getSourceLabel(similarApps.source)}
                </span>
              )}
            </h3>

            <div className="glass-card-subtle p-4 bg-zinc-50 border border-zinc-200">
              {/* Loading Skeleton */}
              {similarApps.loading && (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-white border border-zinc-200">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-28 bg-zinc-200 rounded" />
                            <div className="h-3.5 w-16 bg-zinc-100 rounded" />
                          </div>
                          <div className="h-3 w-full bg-zinc-100 rounded" />
                        </div>
                        <div className="h-5 w-16 bg-zinc-100 rounded-full shrink-0" />
                      </div>
                      <div className="h-10 w-full bg-zinc-50 rounded-lg mt-2" />
                      <div className="flex justify-between mt-2.5 pt-2 border-t border-zinc-100">
                        <div className="h-3 w-24 bg-zinc-100 rounded" />
                        <div className="h-3 w-20 bg-zinc-100 rounded" />
                      </div>
                    </div>
                  ))}
                  <p className="text-[11px] text-zinc-400 text-center pt-1">
                    Discovering similar applications online…
                  </p>
                </div>
              )}

              {/* Error State */}
              {!similarApps.loading && similarApps.error && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {similarApps.error}
                </div>
              )}

              {/* Results */}
              {!similarApps.loading && !similarApps.error && similarApps.results.length > 0 && (
                <div className="space-y-3">
                  {similarApps.results.map((simApp, idx) => (
                    <div
                      key={`${simApp.name}-${idx}`}
                      className="p-3.5 rounded-xl bg-white border border-zinc-200/90 hover:border-zinc-300 transition-all shadow-xs"
                    >
                      {/* Name + Category + Score */}
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-900 tracking-tight">
                              {simApp.name}
                            </span>
                            {simApp.category && (
                              <span className="text-[9.5px] font-semibold text-zinc-600 uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-200/80 border border-zinc-300/60">
                                {simApp.category}
                              </span>
                            )}
                          </div>
                          {simApp.description && (
                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                              {simApp.description}
                            </p>
                          )}
                        </div>
                        {simApp.similarityScore && (
                          <span className={`shrink-0 text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${getScoreColor(simApp.similarityScore)}`}>
                            {simApp.similarityScore}% Match
                          </span>
                        )}
                      </div>

                      {/* Similarity Reason */}
                      <div className="mt-2 text-xs text-zinc-800 bg-zinc-50/80 p-2.5 rounded-lg border border-zinc-200/70 leading-relaxed">
                        <span className="font-semibold text-zinc-900">Why similar: </span>
                        {simApp.similarityReason || simApp.reason || 'Provides a comparable product experience in this domain.'}
                      </div>

                      {/* Footer: Source & Visit Link */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-200/60 text-[11px]">
                        <span className="text-zinc-500 flex items-center gap-1 font-medium">
                          <span className="text-zinc-400">Source:</span> {simApp.source || 'Web'}
                        </span>
                        {simApp.website ? (
                          <a
                            href={simApp.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-zinc-900 hover:text-black hover:underline"
                          >
                            Visit Application
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-zinc-400 italic">No website available</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!similarApps.loading && !similarApps.error && similarApps.results.length === 0 && (
                <p className="text-xs text-zinc-500 italic">
                  No real-world similar applications found for this application.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
