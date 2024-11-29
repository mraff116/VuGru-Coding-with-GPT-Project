import { Trash2, AlertTriangle } from 'lucide-react';

type DeleteProjectModalProps = {
  projectName: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function DeleteProjectModal({ projectName, onConfirm, onClose }: DeleteProjectModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[70]">
      <div className="bg-[#2a2a2a] rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-center text-red-500 mb-4">
          <AlertTriangle className="w-12 h-12" />
        </div>
        
        <h3 className="text-2xl font-semibold text-white text-center mb-2">
          Delete Project?
        </h3>
        
        <p className="text-gray-400 text-center mb-6">
          Are you sure you want to delete "{projectName}"? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}