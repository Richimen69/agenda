import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import TicketDetail from "../components/TicketDetail";
import { deleteTicket } from "../../../services/api";
import { useTicket } from "../../../hooks/useTicket";

export default function TicketDetailPage({ authUser }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    ticket,
    isLoading,
    changeStatus,
    addComment,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    updateAssignees,
    refetch,
  } = useTicket(id, authUser);

  const handleDeleteTicket = async () => {
    try {
      const result = await deleteTicket(id, authUser.id);
      if (result.success) navigate("/");
    } catch {
      alert("Error al eliminar el proyecto.");
    }
  };

  if (isLoading) {
    return <p className="text-center py-10 text-gray-500 font-medium">Cargando...</p>;
  }

  if (!ticket) {
    return <p className="text-center py-10 text-gray-500 font-medium">Proyecto no encontrado</p>;
  }

  return (
    <TicketDetail
      ticket={ticket}
      users={ticket.assignees} // o pásale la lista completa de usuarios si la necesitas para reasignar
      activeUserId={authUser.id}
      onBack={() => navigate("/")}
      onStatusChange={(ticketId, status) => changeStatus(status)}
      onAddComment={(ticketId, text) => addComment(text)}
      onAddSubtask={addSubtask}
      onToggleSubtask={toggleSubtask}
      onDeleteSubtask={deleteSubtask}
      onUpdateAssignees={updateAssignees}
      onDelete={handleDeleteTicket}
      onUpdate={refetch}
    />
  );
}