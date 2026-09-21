'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import SearchAndFilters from '@/components/SearchAndFilters';
import ApplicationTable from '@/components/ApplicationTable';
import ApplicationModal from '@/components/ApplicationModal';
import ApplicationDetail from '@/components/ApplicationDetail';
import DeleteConfirmation from '@/components/DeleteConfirmation';
import {
  Application,
  Technology,
  ApplicationFilters,
  CreateApplicationRequest,
} from '@/types/database';

export default function Home() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [allTechnologies, setAllTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<ApplicationFilters>({});

  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [deletingApp, setDeletingApp] = useState<Application | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });

      const res = await fetch(`/api/applications?${params.toString()}`);
      if (res.ok) {
        const data: Application[] = await res.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch technologies
  const fetchTechnologies = useCallback(async () => {
    try {
      const res = await fetch('/api/technologies');
      if (res.ok) {
        const data: Technology[] = await res.json();
        setAllTechnologies(data);
      }
    } catch (error) {
      console.error('Failed to fetch technologies:', error);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    fetchTechnologies();
  }, [fetchTechnologies]);

  // Derived filter values
  const developers = Array.from(new Set(applications.map((a) => a.developer_name))).sort();
  const technologyNames = Array.from(
    new Set(allTechnologies.map((t) => t.technology_name))
  ).sort();

  // CRUD handlers
  const handleCreateApplication = async (data: CreateApplicationRequest) => {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create application');
    }

    await fetchApplications();
    await fetchTechnologies();
  };

  const handleUpdateApplication = async (data: CreateApplicationRequest) => {
    if (!editingApp) return;

    const res = await fetch(`/api/applications/${editingApp.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update application');
    }

    await fetchApplications();
    await fetchTechnologies();
  };

  const handleDeleteApplication = async () => {
    if (!deletingApp) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/applications/${deletingApp.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeletingApp(null);
        await fetchApplications();
      }
    } catch (error) {
      console.error('Failed to delete application:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <Header
        applicationCount={applications.length}
        onAddClick={() => setShowAddModal(true)}
      />

      {/* Search & Filters */}
      <SearchAndFilters
        filters={filters}
        onFiltersChange={setFilters}
        developers={developers}
        technologies={technologyNames}
      />

      {/* Applications Table */}
      <ApplicationTable
        applications={applications}
        loading={loading}
        onView={(app) => setViewingApp(app)}
        onEdit={(app) => setEditingApp(app)}
        onDelete={(app) => setDeletingApp(app)}
      />

      {/* Add Application Modal */}
      <ApplicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateApplication}
        allApplications={applications}
        allTechnologies={allTechnologies}
      />

      {/* Edit Application Modal */}
      <ApplicationModal
        isOpen={!!editingApp}
        onClose={() => setEditingApp(null)}
        onSubmit={handleUpdateApplication}
        editingApp={editingApp}
        allApplications={applications}
        allTechnologies={allTechnologies}
      />

      {/* View Application Detail */}
      <ApplicationDetail
        application={viewingApp}
        isOpen={!!viewingApp}
        onClose={() => setViewingApp(null)}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        isOpen={!!deletingApp}
        applicationName={deletingApp?.application_name || ''}
        onConfirm={handleDeleteApplication}
        onCancel={() => setDeletingApp(null)}
        deleting={isDeleting}
      />
    </div>
  );
}
