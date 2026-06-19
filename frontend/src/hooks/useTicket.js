import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  getTicketById,
  updateTicketStatus,
  addTicketComment,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  updateTicketAssignees,
} from '../services/api';

export function useTicket(ticketId, authUser) {
  const queryClient = useQueryClient();

  const ticketQuery = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => getTicketById(ticketId),
    enabled: !!ticketId,
    refetchInterval: 5000,               // polling cada 5s
    refetchIntervalInBackground: false,  // se detiene si la pestaña no está activa
    select: (res) => res.data,           // ya extraemos el ticket directo, sin el wrapper {success, data}
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });

  const statusMutation = useMutation({
    mutationFn: (newStatus) => updateTicketStatus(ticketId, newStatus, authUser.id),
    onSuccess: invalidate,
  });

  const commentMutation = useMutation({
    mutationFn: (text) => addTicketComment(ticketId, authUser.id, text),
    onSuccess: invalidate,
  });

  const addSubtaskMutation = useMutation({
    mutationFn: ({ title, assigneeId }) => addSubtask(ticketId, title, assigneeId),
    onSuccess: invalidate,
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: ({ subtaskId, isDone }) => toggleSubtask(subtaskId, isDone, authUser.id),
    onSuccess: invalidate,
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: (subtaskId) => deleteSubtask(subtaskId, authUser.id),
    onSuccess: invalidate,
  });

  const assigneesMutation = useMutation({
    mutationFn: (assigneeIds) => updateTicketAssignees(ticketId, assigneeIds, authUser.id),
    onSuccess: invalidate,
  });

  return {
    ticket: ticketQuery.data,
    isLoading: ticketQuery.isLoading,
    isError: ticketQuery.isError,
    refetch: ticketQuery.refetch,
    changeStatus: statusMutation.mutate,
    addComment: commentMutation.mutate,
    addSubtask: addSubtaskMutation.mutate,
    toggleSubtask: toggleSubtaskMutation.mutate,
    deleteSubtask: deleteSubtaskMutation.mutate,
    updateAssignees: assigneesMutation.mutate,
  };
}