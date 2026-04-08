import { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  userAvatar?: string; // Opcional, para mostrar avatar del otro
}

export function ChatMessageBubble({
  message,
  userAvatar,
}: ChatMessageBubbleProps) {
  const isMine = message.isMine;

  return (
    <div
      className={cn(
        'flex w-full items-end gap-2',
        isMine ? 'justify-end' : 'justify-start'
      )}
    >
      {!isMine && (
        <Avatar className="h-8 w-8 border border-slate-200/60 shadow-sm bg-slate-50">
          <AvatarImage src={userAvatar || `https://api.dicebear.com/7.x/notionists/svg?seed=User`} alt="Sender" />
          <AvatarFallback className="text-[10px] font-bold bg-slate-100">U</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm',
          isMine
            ? 'bg-chat-bubble text-chat-bubble-foreground rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <span
          className={cn(
            'mt-1 block text-[10px] opacity-70',
            isMine ? 'text-chat-bubble-foreground/80' : 'text-muted-foreground'
          )}
        >
          {new Date(message.timestamp).toLocaleString([], {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
