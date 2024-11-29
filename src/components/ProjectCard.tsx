import { useState } from 'react';
import { Clock, Calendar, DollarSign, User, MessageCircle, Trash2, MessageSquare, Edit, Eye, Send, ChevronRight, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QuoteResponseModal } from './QuoteResponseModal';
import { QuoteDetailsModal } from './QuoteDetailsModal';
import { CommentModal } from './CommentModal';
import { ProjectType } from '../types/project';

type ProjectCardProps = {
  project: ProjectType;
  onUpdateProject: (projectId: string, updates: Partial<ProjectType>) => void;
  onDeleteProject: () => void;
};

export function ProjectCard({ project, onUpdateProject, onDeleteProject }: ProjectCardProps) {
  const [showResponse, setShowResponse] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const { user } = useAuth();

  const handleResponse = (response: { 
    type: string; 
    message?: string;
    quotedPrice?: string;
    estimatedDuration?: string;
    includedServices?: string[];
  }) => {
    if (!user) return;

    const updates: Partial<ProjectType> = {
      status: response.type === 'accept' ? 'quoted' :
              response.type === 'decline' ? 'declined' :
              'awaiting_info',
      lastMessage: response.message,
      lastUpdate: new Date().toISOString(),
      quotedPrice: response.quotedPrice,
      estimatedDuration: response.estimatedDuration,
      includedServices: response.includedServices
    };
    
    onUpdateProject(project.id, updates);
    setShowResponse(false);
  };

  const handleAddComment = (comment: string) => {
    if (!user) return;

    const newComment = {
      id: `comment_${Date.now()}`,
      text: comment,
      createdAt: new Date().toISOString(),
      author: user.name,
      authorId: user.id
    };

    onUpdateProject(project.id, {
      comments: [...(project.comments || []), newComment],
      lastUpdate: new Date().toISOString()
    });
    setShowCommentModal(false);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'quoted':
        return 'bg-purple-500/20 text-purple-300';
      case 'accepted':
        return 'bg-green-500/20 text-green-300';
      case 'declined':
        return 'bg-red-500/20 text-red-300';
      case 'awaiting_info':
        return 'bg-blue-500/20 text-blue-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'awaiting_info':
        return 'Awaiting Response';
      case 'quoted':
        return 'Quote Sent';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Sort messages by date, newest first
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

  // Sort by date, newest first
  messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <div className="bg-[#2a2a2a] rounded-lg p-6 hover:bg-[#333] transition-colors group">
        <div className="flex justify-between items-start mb-4">
          <h3 
            className="text-xl font-semibold text-white group-hover:text-orange-400 transition-colors cursor-pointer"
            onClick={() => setShowDetails(true)}
          >
            {project.projectName}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(project.status)}`}>
              {getStatusText(project.status)}
            </span>
            <button
              onClick={onDeleteProject}
              className="text-gray-400 hover:text-red-400 transition-colors p-1"
              title="Delete project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div 
          className="cursor-pointer"
          onClick={() => setShowDetails(true)}
        >
          <p className="text-gray-400 mb-4 line-clamp-2">{project.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(project.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <User className="w-4 h-4 mr-2" />
                <span>{project.clientName}</span>
              </div>
            </div>
            <div className="space-y-2">
              {project.quotedPrice ? (
                <div className="flex items-center text-gray-300">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>{project.quotedPrice}</span>
                </div>
              ) : null}
              <div className="flex items-center text-gray-300">
                <Clock className="w-4 h-4 mr-2" />
                <span>{project.estimatedDuration || project.location}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {(project.includedServices || project.deliverables).map((service) => (
              <span
                key={service}
                className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm"
              >
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* Message Preview Section */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setShowMessages(!showMessages);
          }}
          className="mb-4 p-3 bg-[#1a1a1a] rounded-lg cursor-pointer hover:bg-[#222] transition-colors group/messages"
        >
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm text-gray-400">Messages</p>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showMessages ? 'rotate-180' : ''}`} />
          </div>
          {messages[0] && (
            <p className="text-white line-clamp-2">{messages[0].content}</p>
          )}
        </div>

        {/* Expanded Messages Section */}
        {showMessages && (
          <div className="mt-4 space-y-3 border-t border-gray-700 pt-4">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg ${
                  message.type === 'event' 
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-[#1a1a1a]'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  {message.author && (
                    <span className="text-orange-400 text-sm font-medium">
                      {message.author}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(message.date).toLocaleString()}
                  </span>
                </div>
                <p className="text-white">{message.content}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {/* Videographer Actions */}
          {user?.userType === 'videographer' && project.status === 'pending' && (
            <button
              onClick={() => setShowResponse(true)}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Prepare Quote
            </button>
          )}

          {/* Client Actions */}
          {user?.userType === 'client' && (
            <>
              {project.status === 'quoted' && (
                <button
                  onClick={() => setShowDetails(true)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Quote
                </button>
              )}
              {project.status === 'awaiting_info' && (
                <button
                  onClick={() => setShowCommentModal(true)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Respond
                </button>
              )}
              <button
                onClick={() => setShowCommentModal(true)}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg flex items-center justify-center"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Comment
              </button>
            </>
          )}
        </div>
      </div>

      {showResponse && (
        <QuoteResponseModal
          project={project}
          onClose={() => setShowResponse(false)}
          onSubmit={handleResponse}
        />
      )}

      {showDetails && (
        <QuoteDetailsModal
          project={project}
          onClose={() => setShowDetails(false)}
          onUpdateProject={onUpdateProject}
        />
      )}

      {showCommentModal && (
        <CommentModal
          onClose={() => setShowCommentModal(false)}
          onSubmit={handleAddComment}
        />
      )}
    </>
  );
}