'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  APPLICATION_STATUSES,
  APPLICATION_CATEGORIES,
  Application,
  Technology,
  SimilarAppDetail,
  CreateApplicationRequest,
  TechnologyType,
  ApplicationStatus,
  ApplicationCategory,
} from '@/types/database';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateApplicationRequest) => Promise<void>;
  editingApp?: Application | null;
  allApplications?: Application[];
  allTechnologies?: Technology[];
}

interface FormDataState {
  application_name: string;
  description: string;
  developer_name: string;
  development_team: string;
  category: ApplicationCategory | '';
  status: ApplicationStatus;
  version: string;
  purpose: string;
  is_existing: boolean;
  additional_notes: string;
  technologies: {
    technology_name: string;
    technology_type: TechnologyType;
  }[];
  similar_applications: string[];
  related_applications: string[];
}

export default function ApplicationModal({
  isOpen,
  onClose,
  onSubmit,
  editingApp,
}: ApplicationModalProps) {
  const [formData, setFormData] = useState<FormDataState>({
    application_name: '',
    description: '',
    developer_name: '',
    development_team: '',
    category: '',
    status: 'Active',
    version: '1.0',
    purpose: '',
    is_existing: true,
    additional_notes: '',
    technologies: [],
    similar_applications: [],
    related_applications: [],
  });

  const [technologies, setTechnologies] = useState<
    { technology_name: string; technology_type: TechnologyType }[]
  >([]);
  const [similarApps, setSimilarApps] = useState<string[]>([]);
  const [relatedApps, setRelatedApps] = useState<string[]>([]);
  const [detectedSimilarDetails, setDetectedSimilarDetails] = useState<SimilarAppDetail[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Document Upload States
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEditing = !!editingApp;

  // Populate form when editing or opening
  useEffect(() => {
    if (editingApp) {
      setFormData({
        application_name: editingApp.application_name,
        description: editingApp.description || '',
        developer_name: editingApp.developer_name,
        development_team: editingApp.development_team || '',
        category: (editingApp.category as ApplicationCategory) || '',
        status: (editingApp.status as ApplicationStatus) || 'Active',
        version: editingApp.version || '1.0',
        purpose: editingApp.purpose || '',
        is_existing: editingApp.is_existing,
        additional_notes: editingApp.additional_notes || '',
        technologies: (editingApp.technologies || []).map((t) => ({
          technology_name: t.technology_name,
          technology_type: t.technology_type,
        })),
        similar_applications: (editingApp.relationships || [])
          .filter((r) => r.relationship_type === 'Similar To')
          .map((r) => r.related_application?.id || '')
          .filter(Boolean),
        related_applications: (editingApp.relationships || [])
          .filter((r) => r.relationship_type === 'Related To')
          .map((r) => r.related_application?.id || '')
          .filter(Boolean),
      });
      setTechnologies(
        (editingApp.technologies || []).map((t) => ({
          technology_name: t.technology_name,
          technology_type: t.technology_type,
        }))
      );
      setSimilarApps(
        (editingApp.relationships || [])
          .filter((r) => r.relationship_type === 'Similar To')
          .map((r) => r.related_application?.id || '')
          .filter(Boolean)
      );
      setRelatedApps(
        (editingApp.relationships || [])
          .filter((r) => r.relationship_type === 'Related To')
          .map((r) => r.related_application?.id || '')
          .filter(Boolean)
      );
      setDetectedSimilarDetails([]);
      setShowManualForm(true);
    } else {
      resetForm();
    }
  }, [editingApp, isOpen]);

  const resetForm = () => {
    setFormData({
      application_name: '',
      description: '',
      developer_name: '',
      development_team: '',
      category: '',
      status: 'Active',
      version: '1.0',
      purpose: '',
      is_existing: true,
      additional_notes: '',
      technologies: [],
      similar_applications: [],
      related_applications: [],
    });
    setTechnologies([]);
    setSimilarApps([]);
    setRelatedApps([]);
    setDetectedSimilarDetails([]);
    setUploadedFileName(null);
    setExtractionError(null);
    setIsExtracting(false);
    setShowManualForm(false);
  };

  // Handle Document Upload & Auto-Extraction
  const handleFileUpload = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    if (
      !lowerName.endsWith('.pdf') &&
      !lowerName.endsWith('.pptx') &&
      !lowerName.endsWith('.ppt')
    ) {
      setExtractionError('Please upload a PDF or PPT/PPTX file.');
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);
    setUploadedFileName(file.name);

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/extract', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to extract information from document');
      }

      const ext = json.extracted;
      setFormData(ext);
      setTechnologies(ext.technologies || []);
      setSimilarApps(ext.similar_applications || []);
      setRelatedApps(ext.related_applications || []);
      setDetectedSimilarDetails(ext.similar_app_details || []);
    } catch (err) {
      console.error('File extraction error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to parse document';
      setExtractionError(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.application_name) {
      setExtractionError('Application name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        category: formData.category ? (formData.category as ApplicationCategory) : undefined,
        technologies,
        similar_applications: similarApps,
        related_applications: relatedApps,
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const removeTechnology = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              {isEditing
                ? 'Edit Application'
                : uploadedFileName && formData.application_name
                ? 'Review Extracted Application'
                : 'Upload Project Documentation'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isEditing
                ? 'Update application documentation'
                : uploadedFileName && formData.application_name
                ? `Extracted from ${uploadedFileName}`
                : 'Upload your PDF or PPT/PPTX project documentation to automatically extract and register details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* 1. DOCUMENT UPLOAD VIEW (When adding a new app and not yet extracted) */}
          {!isEditing && !formData.application_name && !isExtracting && (
            <div className="space-y-4">
              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-zinc-900 bg-zinc-50'
                    : 'border-zinc-300 hover:border-zinc-600 bg-zinc-50/50 hover:bg-zinc-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center mx-auto mb-4 text-zinc-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>

                <h3 className="text-sm font-semibold text-zinc-900 mb-1">
                  Upload Project Documentation
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
                  Drag and drop your project document here, or click to browse.
                </p>

                <div className="flex items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-700 bg-white border border-zinc-200 px-2.5 py-1 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    PDF Document
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-700 bg-white border border-zinc-200 px-2.5 py-1 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    PPT / PPTX Presentation
                  </span>
                </div>
              </div>

              {extractionError && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {extractionError}
                </div>
              )}

              {/* Alternative: Switch to manual entry */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualForm(true)}
                  className="text-xs text-zinc-500 hover:text-zinc-900 underline transition-colors"
                >
                  Or enter application details manually
                </button>
              </div>
            </div>
          )}

          {/* 2. EXTRACTING LOADING STATE */}
          {isExtracting && (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin mx-auto" />
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Extracting Information...
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Parsing {uploadedFileName} and discovering similar real-world applications.
                </p>
              </div>
            </div>
          )}

          {/* 3. EXTRACTED PREVIEW (Quick Confirmation View) */}
          {!isEditing && formData.application_name && !showManualForm && !isExtracting && (
            <div className="space-y-5">
              {/* Top Banner */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold">
                    {formData.application_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">
                      {formData.application_name}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Extracted from <span className="font-medium text-zinc-700">{uploadedFileName}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowManualForm(true)}
                  className="text-xs text-zinc-700 hover:text-black font-medium px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 transition-colors"
                >
                  Edit Details
                </button>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 gap-3.5 p-4 rounded-xl bg-white border border-zinc-200">
                <div>
                  <label className="text-[10.5px] uppercase tracking-wider font-semibold text-zinc-500">Developer</label>
                  <p className="text-xs sm:text-sm font-medium text-zinc-900 mt-0.5">{formData.developer_name}</p>
                </div>
                <div>
                  <label className="text-[10.5px] uppercase tracking-wider font-semibold text-zinc-500">Team</label>
                  <p className="text-xs sm:text-sm text-zinc-800 mt-0.5">{formData.development_team || '—'}</p>
                </div>
                <div>
                  <label className="text-[10.5px] uppercase tracking-wider font-semibold text-zinc-500">Category</label>
                  <p className="text-xs sm:text-sm text-zinc-800 mt-0.5">{formData.category || '—'}</p>
                </div>
                <div>
                  <label className="text-[10.5px] uppercase tracking-wider font-semibold text-zinc-500">Version</label>
                  <p className="text-xs sm:text-sm text-zinc-800 mt-0.5 font-mono">{formData.version || '1.0'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-[10.5px] uppercase tracking-wider font-semibold text-zinc-500">Purpose / Description</label>
                  <p className="text-xs sm:text-sm text-zinc-800 mt-0.5 leading-relaxed">{formData.purpose || formData.description || '—'}</p>
                </div>
              </div>

              {/* Technologies Extracted */}
              <div className="p-4 rounded-xl bg-white border border-zinc-200">
                <label className="text-[10.5px] uppercase tracking-wider font-semibold text-zinc-500 block mb-2">
                  Extracted Technologies ({technologies.length})
                </label>
                {technologies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {technologies.map((t, idx) => (
                      <span
                        key={idx}
                        className="tech-tag py-1 px-2.5 bg-zinc-100 border border-zinc-300 text-zinc-900"
                      >
                        {t.technology_name}
                        <span className="text-[9.5px] text-zinc-500 ml-1">({t.technology_type})</span>
                        <button
                          type="button"
                          onClick={() => removeTechnology(idx)}
                          className="ml-1 text-zinc-400 hover:text-black"
                          title="Remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No specific technologies identified in document.</p>
                )}
              </div>

              {/* Similar Real-World Applications */}
              <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    Similar Real-World Applications ({detectedSimilarDetails.length})
                  </label>
                  <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {detectedSimilarDetails[0]?.source || 'Similarity Engine'}
                  </span>
                </div>

                {detectedSimilarDetails.length > 0 ? (
                  <div className="space-y-3">
                    {detectedSimilarDetails.map((simApp) => (
                      <div
                        key={simApp.id || simApp.application_name}
                        className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/90 hover:border-zinc-300 transition-all shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-zinc-900 tracking-tight">
                                {simApp.application_name}
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
                            <span className="shrink-0 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              {simApp.similarityScore}% Match
                            </span>
                          )}
                        </div>

                        {/* Similarity explanation */}
                        <div className="mt-2 text-xs text-zinc-800 bg-white/90 p-2.5 rounded-lg border border-zinc-200/70 leading-relaxed">
                          <span className="font-semibold text-zinc-900">Why similar: </span>
                          {simApp.similarity_reason || simApp.match_reason || 'Provides a comparable product experience in this domain.'}
                        </div>

                        {/* Footer: Source & Visit Application Link */}
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-200/60 text-[11px]">
                          <span className="text-zinc-500 flex items-center gap-1 font-medium">
                            <span className="text-zinc-400">Source:</span> {simApp.source || 'Official Website'}
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
                            <span className="text-zinc-400 italic">Web search result</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                    No real-world similar applications could be retrieved.
                  </p>
                )}
              </div>

              {/* Action Buttons for Extracted View */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-zinc-500 hover:text-zinc-900 underline"
                >
                  Upload different file
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-extracted-app-btn"
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={submitting}
                    className="btn-primary text-xs"
                  >
                    {submitting ? 'Saving...' : 'Confirm & Add to Registry'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. FULL FORM (For Editing or Manual adjustments) */}
          {(isEditing || showManualForm) && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Back to upload option */}
              {!isEditing && (
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="text-xs text-zinc-600 hover:text-black flex items-center gap-1"
                  >
                    ← Back to Document Upload
                  </button>
                  {uploadedFileName && (
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Extracted from: {uploadedFileName}
                    </span>
                  )}
                </div>
              )}

              {/* Basic Information */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3.5 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="md:col-span-2">
                    <label className="form-label">Application Name *</label>
                    <input
                      id="field-app-name"
                      type="text"
                      required
                      value={formData.application_name}
                      onChange={(e) =>
                        setFormData({ ...formData, application_name: e.target.value })
                      }
                      className="form-input"
                      placeholder="e.g., Google Search"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Description</label>
                    <textarea
                      id="field-description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="form-textarea"
                      placeholder="Brief description of the application..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="form-label">Developer Name *</label>
                    <input
                      id="field-developer"
                      type="text"
                      required
                      value={formData.developer_name}
                      onChange={(e) =>
                        setFormData({ ...formData, developer_name: e.target.value })
                      }
                      className="form-input"
                      placeholder="e.g., Google"
                    />
                  </div>
                  <div>
                    <label className="form-label">Development Team</label>
                    <input
                      id="field-team"
                      type="text"
                      value={formData.development_team}
                      onChange={(e) =>
                        setFormData({ ...formData, development_team: e.target.value })
                      }
                      className="form-input"
                      placeholder="e.g., Search Core Team"
                    />
                  </div>
                  <div>
                    <label className="form-label">Category</label>
                    <select
                      id="field-category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as ApplicationCategory })
                      }
                      className="form-select"
                    >
                      <option value="">Select category</option>
                      {APPLICATION_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Status</label>
                    <select
                      id="field-status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as ApplicationStatus })
                      }
                      className="form-select"
                    >
                      {APPLICATION_STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Version</label>
                    <input
                      id="field-version"
                      type="text"
                      value={formData.version}
                      onChange={(e) =>
                        setFormData({ ...formData, version: e.target.value })
                      }
                      className="form-input"
                      placeholder="e.g., 1.0.0"
                    />
                  </div>
                  <div>
                    <label className="form-label">Application State</label>
                    <select
                      id="field-existing"
                      value={formData.is_existing ? 'true' : 'false'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_existing: e.target.value === 'true',
                        })
                      }
                      className="form-select"
                    >
                      <option value="true">Existing Application</option>
                      <option value="false">New Application</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Purpose / Use Case</label>
                    <textarea
                      id="field-purpose"
                      value={formData.purpose}
                      onChange={(e) =>
                        setFormData({ ...formData, purpose: e.target.value })
                      }
                      className="form-textarea"
                      placeholder="What is this application used for?"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Technologies (Extracted from Documentation) */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                  Technologies (Extracted from Documentation)
                </h3>

                {technologies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                    {technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="tech-tag flex items-center gap-1.5 py-1 px-2.5 bg-white border border-zinc-300 text-zinc-900 shadow-sm"
                      >
                        {tech.technology_name}
                        <span className="text-[9.5px] text-zinc-500">({tech.technology_type})</span>
                        <button
                          type="button"
                          onClick={() => removeTechnology(idx)}
                          className="ml-0.5 text-zinc-400 hover:text-black transition-colors"
                          title="Remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                    No technologies added. Upload a document (PDF/PPT) to automatically extract technologies.
                  </p>
                )}
              </div>

              {/* Similar Applications */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Similar Real-World Applications
                </h3>

                {detectedSimilarDetails.length > 0 ? (
                  <div className="space-y-2 p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                    {detectedSimilarDetails.map((simApp) => (
                      <div
                        key={simApp.id || simApp.application_name}
                        className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-zinc-200 text-xs shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="font-semibold text-zinc-900">{simApp.application_name}</span>
                          {simApp.category && (
                            <span className="text-[10px] text-zinc-500 font-mono">({simApp.category})</span>
                          )}
                          {simApp.similarityScore && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {simApp.similarityScore}%
                            </span>
                          )}
                        </div>
                        {simApp.website && (
                          <a
                            href={simApp.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-600 hover:text-black text-[11px] font-medium underline flex items-center gap-1"
                          >
                            Visit Application
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                    Real-world similar applications are discovered dynamically when documentation is uploaded.
                  </p>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3.5 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Additional Notes
                </h3>
                <textarea
                  id="field-notes"
                  value={formData.additional_notes}
                  onChange={(e) =>
                    setFormData({ ...formData, additional_notes: e.target.value })
                  }
                  className="form-textarea"
                  placeholder="Any additional notes or architectural context..."
                  rows={2}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-200 bg-zinc-50 rounded-b-14">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary text-xs"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  id="submit-app-btn"
                  type="submit"
                  className="btn-primary text-xs"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isEditing ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      {isEditing ? 'Update Application' : 'Add to Registry'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
