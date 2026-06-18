import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

function getInitials(name) {
  return name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "UN";
}

function CommentBubble({ comment, activeUserId }) {
  const isMe = comment.userId === activeUserId;
  const fechaObjeto = new Date(comment.createdAt);

  const fechaExacta = fechaObjeto.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const tiempoRelativo = formatDistanceToNow(fechaObjeto, {
    addSuffix: true,
    locale: es,
  });

  return (
    <div
      className={`flex gap-3 group animate-fade-in ${isMe ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-sm transition-colors ${
          isMe ? "bg-brand" : "bg-status-neutral"
        }`}
      >
        {getInitials(comment.user.name)}
      </div>

      <div
        className={`flex flex-col min-w-0 max-w-[85%] md:max-w-[75%] ${isMe ? "items-end" : "items-start"}`}
      >
        <div
          className={`flex items-baseline gap-2 mb-1.5 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}
        >
          <span className="text-sm font-semibold text-content-main truncate">
            {isMe ? "Tú" : comment.user.name}
          </span>
          <span
            title={fechaExacta}
            className="text-[11px] font-medium text-content-muted hover:text-content-main transition-colors cursor-help"
          >
            {tiempoRelativo}
          </span>
        </div>
        <div
          className={`border rounded-xl p-3.5 shadow-sm inline-block ${
            isMe
              ? "bg-brand-subtle border-brand/20 rounded-tr-sm"
              : "bg-layout-hover border-layout-border rounded-tl-sm"
          }`}
        >
          <p className="text-sm text-content-main leading-relaxed whitespace-pre-wrap break-words">
            {comment.text}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TicketBitacora({ ticket, activeUserId, onAddComment }) {
  const [commentText, setCommentText] = useState("");

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    onAddComment(ticket.id, commentText);
    setCommentText("");
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-[400px]">
      <div className="mb-4">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Bitacora de seguimiento ({ticket.comments?.length || 0})
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Soporte y discusiones tecnicas con el equipo en tiempo real
        </p>
      </div>

      {/* Lista de comentarios */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {!ticket.comments || ticket.comments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in text-center">
            <div className="w-12 h-12 rounded-full bg-layout-hover border border-layout-border flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-content-muted/50" />
            </div>
            <p className="text-sm font-semibold text-content-main">
              Bitácora en blanco
            </p>
            <p className="text-xs font-medium text-content-muted mt-1 max-w-[250px]">
              No hay registros aún. Escribe un mensaje abajo para iniciar el
              seguimiento.
            </p>
          </div>
        ) : (
          <div className="space-y-5 p-2">
            {ticket.comments.map((comment) => (
              <CommentBubble
                key={comment.id}
                comment={comment}
                activeUserId={activeUserId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="relative mt-auto">
        <input
          type="text"
          placeholder="Escribe un comentario..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
          className="w-full bg-gray-50 border-none rounded-xl py-4 pl-4 pr-14 text-sm"
        />
        <button
          onClick={handleSendComment}
          className="cursor-pointer absolute right-2 top-2 bottom-2 bg-brand hover:bg-brand-hover text-white rounded-lg w-10 flex items-center justify-center transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}