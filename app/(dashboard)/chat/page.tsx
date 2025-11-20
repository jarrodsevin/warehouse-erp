import ChatInterface from '@/components/chat/ChatInterface';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ERP Assistant</h1>
            <p className="text-sm text-gray-500">Ask questions about your warehouse data</p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 bg-gray-50">
        <div className="max-w-5xl mx-auto h-full">
          <ChatInterface className="h-full bg-white" />
        </div>
      </div>
    </div>
  );
}