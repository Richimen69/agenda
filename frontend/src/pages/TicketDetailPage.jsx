import { useParams, useNavigate } from 'react-router-dom';
import TicketDetail from '../components/TicketDetail';

export default function TicketDetailPage({ tickets, authUser, onStatusChange, onAddComment }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const ticket = tickets.find(t => t.id === id);

  if (!ticket) {
    return <p className="text-center py-10 text-gray-500 font-medium">Proyecto no encontrado</p>;
  }

  return (
    <TicketDetail
      ticket={ticket}
      activeUserId={authUser.id}
      onBack={() => navigate('/')}
      onStatusChange={onStatusChange}
      onAddComment={onAddComment}
    />
  );
}