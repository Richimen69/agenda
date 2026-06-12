import { Navigate } from 'react-router-dom';
import AdminPanel from '../features/admin/AdminPanel';

export default function AdminPage({ authUser, users, onUsersChange }) {
  if (authUser.role !== 'ADMIN') return <Navigate to="/" />;

  return <AdminPanel users={users} onUsersChange={onUsersChange} />;
}