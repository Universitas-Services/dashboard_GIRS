'use client';

import { useEffect, useState } from 'react';
import { ChatSidebar } from '@/components/chats/ChatSidebar';
import { ChatWindow } from '@/components/chats/ChatWindow';
import { chatService } from '@/services/chatService';
import { ChatConversation } from '@/types/chat';
import { cn } from '@/lib/utils';

export default function ChatsPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar conversaciones al montar o al buscar
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await chatService.getConversations(1, 10, searchQuery);
        setConversations(data);
      } catch (error) {
        console.error('Failed to fetch conversations', error);
      }
    };
    fetchConversations();
  }, [searchQuery]);

  const selectedChat =
    conversations.find((c) => c.id === selectedChatId) || null;

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full gap-4 overflow-hidden p-2">
      {/* 
        LOGICA RESPONSIVE MODIFICADA PARA SEPARACION VISUAL:
        - Eliminado el contenedor padre con borde.
        - Agregado gap-4 para separar paneles.
        - Paneles individuales tienen ahora sus propios bordes y rounded.
      */}

      {/* Sidebar Area */}
      <div
        className={cn(
          'h-full w-full md:w-80 md:flex-none transition-all duration-300 rounded-xl border bg-background shadow-sm overflow-hidden',
          selectedChatId ? 'hidden md:block' : 'block'
        )}
      >
        <ChatSidebar
          conversations={conversations}
          selectedId={selectedChatId}
          onSelect={setSelectedChatId}
          onSearch={setSearchQuery}
          className="h-full"
        />
      </div>

      {/* Chat Window Area */}
      <main
        className={cn(
          'h-full flex-1 rounded-xl border bg-background shadow-sm overflow-hidden',
          selectedChatId ? 'block' : 'hidden md:block'
        )}
      >
        <ChatWindow
          key={selectedChat?.id}
          chat={selectedChat}
          onBack={() => setSelectedChatId(null)}
        />
      </main>
    </div>
  );
}
