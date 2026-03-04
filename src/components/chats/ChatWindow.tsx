import { useEffect, useState, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChatMessageBubble } from './ChatMessageBubble';
import { chatService } from '@/services/chatService';
import { ChatConversation, ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  chat: ChatConversation | null;
  onBack?: () => void; // Para mobile
  className?: string; // Control de visibilidad
}

export function ChatWindow({ chat, onBack, className }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar mensajes cuando cambia el chat seleccionado
  useEffect(() => {
    if (chat) {
      chatService.getMessages(chat.id).then((data) => {
        setMessages(data);
        setIsLoading(false);
      });
    }
  }, [chat]);

  // Scroll al fondo al recibir mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!chat) {
    return (
      <div
        className={cn(
          'hidden md:flex h-full w-full flex-col items-center justify-center bg-muted/20 text-muted-foreground rounded-r-lg',
          className
        )}
      >
        <p>Selecciona una conversación para ver el historial</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          {/* Botón back solo visible en móvil (gestionado por clases padre o condicional) */}
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <Avatar className="h-9 w-9">
            <AvatarImage src={chat.user.avatar} />
            <AvatarFallback>
              {chat.user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-medium leading-none">{chat.user.name}</h3>
          </div>
        </div>
      </div>

      {/* Area de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-muted-foreground animate-pulse">
              Cargando historial...
            </span>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              userAvatar={chat.user.avatar}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
