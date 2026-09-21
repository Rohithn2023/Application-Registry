'use client';

interface DeleteConfirmationProps {
  isOpen: boolean;
  applicationName: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}

export default function DeleteConfirmation({
  isOpen,
  applicationName,
  onConfirm,
  onCancel,
  deleting,
}: DeleteConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-dialog bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-zinc-900 mb-1">Delete Application</h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="text-zinc-900 font-semibold">{applicationName}</span>?
              This action cannot be undone. Associated technology and relationship links will also be removed.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-zinc-200">
          <button
            id="cancel-delete-btn"
            onClick={onCancel}
            className="btn-secondary text-xs"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            onClick={onConfirm}
            className="btn-danger text-xs flex items-center gap-1.5"
            disabled={deleting}
          >
            {deleting ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deleting...
              </>
            ) : (
              'Delete Application'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
