'use client';

function getStatusBadgeClass(status) {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return 'badge-active';
    case 'in development':
      return 'badge-development';
    case 'beta':
      return 'badge-beta';
    case 'maintenance':
      return 'badge-maintenance';
    case 'deprecated':
      return 'badge-deprecated';
    case 'retired':
      return 'badge-retired';
    default:
      return 'badge-active';
  }
}

function getTechTagClass(type) {
  switch ((type || '').toLowerCase()) {
    case 'programming language':
      return 'tech-tag-lang';
    case 'frontend':
      return 'tech-tag-frontend';
    case 'backend':
      return 'tech-tag-backend';
    case 'database':
      return 'tech-tag-database';
    case 'framework':
      return 'tech-tag-framework';
    case 'library':
      return 'tech-tag-library';
    default:
      return 'tech-tag-lang';
  }
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="skeleton h-5 w-36" />
          <div className="skeleton h-5 w-24" />
          <div className="skeleton h-5 w-28" />
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-5 w-16" />
          <div className="skeleton h-5 w-32" />
          <div className="skeleton h-5 w-12" />
          <div className="skeleton h-5 w-24" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-14 h-14 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-3.5 border border-zinc-200 text-zinc-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-zinc-900 mb-1">No applications found</h3>
      <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">
        No applications match your current search or filters. Try adjusting your criteria or add a new application.
      </p>
    </div>
  );
}

export default function ApplicationTable({
  applications,
  loading,
  onView,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Application Directory</h2>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between bg-white">
        <h2 className="text-sm font-semibold text-zinc-900">Application Directory</h2>
        <span className="text-xs text-zinc-700 bg-zinc-100 border border-zinc-300 px-2.5 py-0.5 rounded-full font-medium">
          {applications.length} result{applications.length !== 1 ? 's' : ''}
        </span>
      </div>

      {applications.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="registry-table">
            <thead>
              <tr>
                <th>Application Name</th>
                <th>Developer</th>
                <th>Category</th>
                <th>Technologies</th>
                <th>Status</th>
                <th>Similar Applications</th>
                <th>Version</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const similarApps = (app.relationships || [])
                  .filter((r) => r.relationship_type === 'Similar To')
                  .map((r) => r.related_application?.application_name)
                  .filter(Boolean);

                return (
                  <tr key={app.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-zinc-900">
                            {app.application_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-zinc-900 text-[13.5px]">
                              {app.application_name}
                            </span>
                            {app.is_existing ? (
                              <span className="text-[10px] text-zinc-600 bg-zinc-100 border border-zinc-300 px-1.5 py-0.2 rounded font-medium uppercase tracking-wider">
                                Existing
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-900 bg-zinc-200 border border-zinc-300 px-1.5 py-0.2 rounded font-medium uppercase tracking-wider">
                                New
                              </span>
                            )}
                          </div>
                          {app.purpose && (
                            <p className="text-[11.5px] text-zinc-500 truncate max-w-[200px] mt-0.5">
                              {app.purpose}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-zinc-800 font-medium text-[13px]">{app.developer_name}</span>
                    </td>
                    <td>
                      <span className="text-zinc-600 text-[13px]">{app.category || '—'}</span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {(app.technologies || []).slice(0, 3).map((tech, idx) => (
                          <span
                            key={idx}
                            className={`tech-tag ${getTechTagClass(tech.technology_type)}`}
                          >
                            {tech.technology_name}
                          </span>
                        ))}
                        {(app.technologies || []).length > 3 && (
                          <span className="tech-tag tech-tag-lang">
                            +{(app.technologies || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <div className="max-w-[180px]">
                        {similarApps.length > 0 ? (
                          <span className="text-[13px] text-zinc-800">
                            {similarApps.join(', ')}
                          </span>
                        ) : (
                          <span className="text-[13px] text-zinc-400">—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-[12.5px] text-zinc-600 font-mono">
                        {app.version || '—'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`view-btn-${app.id}`}
                          onClick={() => onView(app)}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
                          title="View Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          id={`edit-btn-${app.id}`}
                          onClick={() => onEdit(app)}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          id={`delete-btn-${app.id}`}
                          onClick={() => onDelete(app)}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
