import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ChatConversation } from '@/types/chat';

interface ChatSidebarProps {
  conversations: ChatConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSearch?: (search: string) => void;
  className?: string; // Para control de responsividad desde el padre
}

export function ChatSidebar({
  conversations,
  selectedId,
  onSelect,
  onSearch,
  className,
}: ChatSidebarProps) {
  const [query, setQuery] = useState('');

  // Efecto de debounce para delegar la búsqueda al padre (llama al backend)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(query);
      }
    }, 400); // 400ms de retraso

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-background/50 backdrop-blur-sm',
        className
      )}
    >
      {/* Header del Sidebar */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Mensajes</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar chat..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Chats */}
      {/* Usamos un div con overflow si ScrollArea no está disponible, pero intentaremos usar div nativo por seguridad si ScrollArea falla, 
          aunque el usuario dijo que use componentes existentes. Asumiré que ScrollArea existe o usaré fallback seguro. 
          En la lista de archivos no vi scroll-area.tsx, así que usaré div native con clases de Tailwind.
      */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No se encontraron conversaciones.
          </div>
        ) : (
          <div className="flex flex-col gap-1 p-2">
            {conversations.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelect(chat.id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50',
                  selectedId === chat.id ? 'bg-muted' : 'bg-transparent'
                )}
              >
                <div className="relative">
                  <Avatar className="h-11 w-11 border border-slate-200/60 shadow-sm bg-slate-50">
                    <AvatarImage 
                      src={chat.user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${chat.user.name}`} 
                      className="object-cover"
                    />
                    <AvatarFallback className="font-bold text-slate-700 text-xs bg-slate-100">
                      {chat.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 overflow-hidden text-left">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-sm truncate">
                      {chat.user.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(chat.lastMessageTime).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
