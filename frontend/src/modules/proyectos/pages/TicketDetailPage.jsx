import { useParams, useNavigate } from "react-router-dom";
import TicketDetail from "../components/TicketDetail";
import { deleteTicket } from "../../../services/api";

export default function TicketDetailPage({
  tickets,
  users,
  authUser,
  onStatusChange,
  onAddComment,
  onDelete,
  onUpdate,  
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDeleteTicket = async (ticketId) => {
    try {
      const result = await deleteTicket(ticketId, authUser.id);
      if (result.success) {
        navigate('/'); 
        onDelete();     
      }
    } catch (error) {
      alert("Error al eliminar el proyecto.");
    }
  };

  const ticket = tickets.find((t) => t.id === id);

  if (!ticket) return (
    <p className="text-center py-10 text-gray-500 font-medium">Proyecto no encontrado</p>
  );

  return (
    <TicketDetail
      ticket={ticket}
      users={users}
      activeUserId={authUser.id}
      onBack={() => navigate("/")}
      onStatusChange={onStatusChange}
      onAddComment={onAddComment}
      onDelete={handleDeleteTicket}
      onUpdate={onUpdate}  
    />
  );
}