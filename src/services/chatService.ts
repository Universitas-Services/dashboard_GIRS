import {
  ChatConversation,
  ChatMessage,
  ApiChatUser,
  ApiChatDetail,
} from '@/types/chat';
import api from '@/lib/axios';

class ChatService {
  private static instance: ChatService;

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // Obtener lista de usuarios (conversaciones)
  public async getConversations(
    page = 1,
    limit = 10,
    search?: string
  ): Promise<ChatConversation[]> {
    try {
      const { data } = await api.get('/ai/admin/users', {
        params: { page, limit, search: search || undefined },
      });

      // Compatibilidad con objeto paginado o array directo
      const usersData: ApiChatUser[] = Array.isArray(data)
        ? data
        : data?.data || data?.users || data?.items || [];

      return usersData.map((apiUser) => ({
        id: apiUser.id,
        user: {
          id: apiUser.id,
          name:
            apiUser.nombreCompleto ||
            `${apiUser.nombre} ${apiUser.apellido}`.trim(),
          email: apiUser.email,
          avatar: '',
          status: 'offline',
        },
        lastMessage: apiUser.ultimoMensaje?.texto || 'Sin mensajes',
        lastMessageTime:
          apiUser.ultimoMensaje?.timestamp || apiUser.ultimaActividad,
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Error fetching chat users:', error);
      return [];
    }
  }

  // Obtener historial completo de mensajes de un usuario
  public async getMessages(userId: string): Promise<ChatMessage[]> {
    try {
      const { data } = await api.get<ApiChatDetail>(
        `/ai/admin/users/${userId}/conversations`
      );

      // Mapeamos `conversacion` plana a `ChatMessage`
      return data.conversacion.map((msg) => ({
        id: msg.id,
        senderId: msg.tipo === 'usuario' ? userId : 'bot',
        content: msg.contenido,
        timestamp: msg.timestamp,
        // En el dashboard: Bot (nosotros) = Derecha (isMine=true), Usuario = Izquierda (isMine=false)
        isMine: msg.tipo === 'bot',
      }));
    } catch (error) {
      console.error('Error fetching chat details:', error);
      return [];
    }
  }

  // Enviar mensaje (No implementado en backend aún, mantenemos mock o error)
  public async sendMessage(
    userId: string,
    content: string
  ): Promise<ChatMessage> {
    // Implementación mock temporal para que no rompa si se intentara usar
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMessage: ChatMessage = {
          id: Math.random().toString(36).substring(7),
          senderId: 'me',
          content,
          timestamp: new Date().toISOString(),
          isMine: true,
        };
        resolve(newMessage);
      }, 200);
    });
  }
}

export const chatService = ChatService.getInstance();
