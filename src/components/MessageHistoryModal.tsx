import { X } from 'lucide-react';
import { ProjectType } from '../types/project';

type MessageHistoryModalProps = {
  project: ProjectType;
  onClose: () => void;
};

export function MessageHistoryModal({ project, onClose }: MessageHistoryModalProps) {
  const messages = [];

  // Add project creation
  messages.push({
    type: 'event',
    content: 'Project created',
    date: project.createdAt
  });

  // Add status changes and messages
  if (project.lastMessage) {
    messages.push({
      type: 'message',
      content: project.lastMessage,
      date: project.lastUpdate || project.createdAt
    });
  }

  // Add comments
  if (project.comments?.length) {
    project.comments.forEach(comment => {
      messages.push({
        type: 'comment',
        content: comment.text,
        author: comment.author,
        date: comment.createdAt
      });
    });
  }

  // Sort by date, oldest first
  messages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-[#2a2a2a] rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-2xl font-semibold text-orange-500">
            Message History
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg ${
                  message.type === 'event' 
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-[#1a1a1a]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  {message.author && (
                    <span className="text-orange-400 font-medium">
                      {message.author}
                    </span>
                  )}
                  <span className="text-sm text-gray-400">
                    {new Date(message.date).toLocaleString()}
                  </span>
                </div>
                <p className="text-white">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}