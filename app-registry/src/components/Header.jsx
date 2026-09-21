'use client';

export default function Header({ applicationCount, onAddClick }) {
  return (
    <header className="glass-card p-5 sm:p-6 mb-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">Application Registry</h1>
            </div>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm ml-[48px]">
            Centralized application documentation and relationship management
          </p>
          <div className="ml-[48px] mt-2">
            <span className="badge badge-active text-[11px] bg-zinc-100 text-zinc-800 border border-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 inline-block" />
              {applicationCount} Application{applicationCount !== 1 ? 's' : ''} Registered
            </span>
          </div>
        </div>
        <button
          id="add-application-btn"
          onClick={onAddClick}
          className="btn-primary text-xs sm:text-sm shrink-0 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload & Add Application
        </button>
      </div>
    </header>
  );
}
