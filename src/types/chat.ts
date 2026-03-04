export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  email: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string; // ISO string
  isMine: boolean; // Helper para frontend (true = bot, false = usuario)
}

export interface ChatConversation {
  id: string;
  user: ChatUser;
  lastMessage: string;
  lastMessageTime: string; // ISO string
  unreadCount: number;
}

// --- Tipos API: Lista de Usuarios ---
export interface ApiChatUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  telefono: string;
  cargo: string;
  institucion: string;
  totalMensajes: number;
  totalSesiones: number;
  ultimoMensaje: {
    texto: string;
    esDelUsuario: boolean;
    timestamp: string;
  };
  ultimaActividad: string;
  createdAt: string;
}

// --- Tipos API: Detalle de Conversación ---
export interface ApiChatMessage {
  id: string;
  tipo: 'usuario' | 'bot';
  contenido: string;
  timestamp: string;
  sessionId?: string;
  hora?: string;
}

export interface ApiChatDetail {
  userId: string;
  userInfo: {
    email: string;
    nombre: string;
    apellido: string;
    nombreCompleto: string;
    telefono: string;
    cargo: string;
    institucion: string;
  };
  totalMensajes: number;
  totalSesiones: number;
  conversacion: ApiChatMessage[];
  agrupadoPorFecha?: Record<string, ApiChatMessage[]>;
}
