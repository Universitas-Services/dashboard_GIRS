'use client';

import { useState } from 'react';
import { Megaphone, Send, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';

export default function AvisosPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePublish = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Por favor, completa el título y el contenido del aviso.');
      return;
    }

    setIsLoading(true);
    try {
      await adminService.createNews({
        title,
        content: message,
      });
      toast.success('Aviso publicado correctamente.');
      setTitle('');
      setMessage('');
    } catch (error) {
      console.error('Error al publicar aviso:', error);
      toast.error('Hubo un error al publicar el aviso. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const user = {
    name: 'Admin',
    role: 'Administrador',
    avatar: 'https://github.com/shadcn.png',
  };

  return (
    <div className="flex flex-col gap-4 w-full pt-1">
      {/* Header Unificado - Más compacto */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex flex-col">
          <h1
            className="text-2xl font-extrabold whitespace-nowrap"
            style={{ color: 'var(--admin-text-title)' }}
          >
            Publicar Nuevo Aviso Global
          </h1>
          <p className="text-muted-foreground text-xs font-medium mt-0.5">
            Difunde información importante a todos los usuarios de la
            plataforma.
          </p>
        </div>

        <div className="flex items-center gap-3 justify-end min-w-[120px]">
          <NotificationBell />
          <Avatar className="h-8 w-8 border-2 border-emerald-500 cursor-pointer">
            <AvatarImage src={user.avatar} />
            <AvatarFallback
              style={{
                color: 'var(--admin-avatar-text)',
                backgroundColor: 'var(--admin-avatar-bg)',
              }}
            >
              AD
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-2 items-stretch">
        {/* Formulario de Creación (3 columnas) */}
        <div className="lg:col-span-3 flex">
          <Card
            className="border-none shadow-sm overflow-hidden flex flex-col w-full"
            style={{ backgroundColor: 'var(--admin-filter-bg)' }}
          >
            <CardHeader className="py-3 px-5 border-b border-slate-200/50">
              <CardTitle
                className="text-sm font-bold flex items-center gap-2"
                style={{ color: 'var(--admin-text-title)' }}
              >
                <Megaphone className="h-4 w-4 text-emerald-600" />
                Detalles del Mensaje
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-4 flex-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Título del Anuncio
                </label>
                <Input
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Escribe el título aquí..."
                  className="bg-white border-none h-9 text-xs font-medium shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Contenido del Mensaje
                </label>
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm flex-1 flex flex-col">
                  <Textarea
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setMessage(e.target.value)
                    }
                    placeholder="Escribe el contenido detallado aquí..."
                    className="flex-1 min-h-[180px] border-none focus-visible:ring-0 resize-none p-3 text-xs leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  onClick={handlePublish}
                  disabled={isLoading}
                  className="h-10 px-8 font-bold bg-[var(--primary)] hover:opacity-90 text-white flex items-center gap-2 rounded-lg shadow-md shadow-blue-900/10 text-xs"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Publicando...
                    </span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Publicar Aviso
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vista Previa (2 columnas) */}
        <div className="lg:col-span-2 flex">
          <Card
            className="border-none shadow-sm overflow-hidden flex flex-col w-full"
            style={{ backgroundColor: 'var(--admin-filter-bg)' }}
          >
            <CardHeader className="py-3 px-5 border-b border-slate-200/50">
              <CardTitle
                className="text-sm font-bold flex items-center gap-2"
                style={{ color: 'var(--admin-text-title)' }}
              >
                <Eye className="h-4 w-4 text-emerald-600" />
                Vista Previa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center justify-center bg-slate-400/20 flex-1 rounded-b-xl relative overflow-hidden min-h-[400px]">
              {/* Modal de Aviso (Escalado para ser más compacto) */}
              <div className="w-full max-w-[320px] min-h-[320px] bg-white rounded-[32px] shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500 z-10 border border-white/50">
                <div className="p-6 flex flex-col gap-4 flex-1 justify-center">
                  <h3 className="text-base font-black text-slate-900 leading-tight text-center px-1">
                    {title || 'TÍTULO DEL AVISO'}
                  </h3>

                  <div className="max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                    <p className="text-[11px] text-slate-700 leading-relaxed text-center">
                      {message || 'El contenido aparecerá aquí...'}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 mt-2">
                    <Avatar className="h-7 w-7 border-2 border-white shadow-sm">
                      <AvatarImage
                        src="/Julio-AI-Fospuca.png"
                        alt="Universitas"
                      />
                      <AvatarFallback className="text-[9px] font-bold">
                        UN
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                      Universitas
                    </span>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-1 flex flex-col">
                  <Button className="w-full h-10 rounded-xl bg-[var(--girs-green)] hover:opacity-90 text-white font-black text-xs tracking-widest uppercase border-none shadow-md shadow-green-900/10">
                    Aceptar
                  </Button>
                </div>
              </div>

              <div className="mt-4 text-center px-4">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest opacity-50">
                  Vista Previa del Aviso
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
