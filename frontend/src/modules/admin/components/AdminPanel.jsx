import { useState } from 'react';
import { createUser, deleteUser } from '../../../services/api';
import { Trash2, UserPlus } from 'lucide-react';

export default function AdminPanel({ users, onUsersChange }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [role, setRole] = useState('USER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const whats = "521" + whatsappPhone.replace(/\D/g, '');
      const result = await createUser({ name, email, password, whats, role });
      if (result.success) {
        alert('Usuario creado con éxito');
        setName(''); setEmail(''); setPassword(''); setWhatsappPhone('');
        onUsersChange(); // Recarga la lista
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Error al crear usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de borrar este usuario?')) return;
    try {
      const result = await deleteUser(userId);
      if (result.success) onUsersChange();
      else alert(result.error);
    } catch (error) {
      alert('Error al borrar usuario');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Panel de Administración</h2>
        <p className="text-gray-500 text-sm">Gestiona los accesos de tu equipo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULARIO CREAR USUARIO */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5 text-indigo-600"/> Nuevo Usuario</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <input type="text" placeholder="Nombre completo" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" />
            <input type="email" placeholder="Correo electrónico" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" />
            <input type="password" placeholder="Contraseña" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" />
            <input type="text" placeholder="WhatsApp (Ej: 7441234567)" required value={whatsappPhone} onChange={e => setWhatsappPhone(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" />
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-semibold">
              <option value="USER">Usuario Normal</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700">
              {isSubmitting ? 'Creando...' : 'Crear Usuario'}
            </button>
          </form>
        </div>

        {/* LISTA DE USUARIOS */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Directorio del Equipo</h3>
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="font-bold text-gray-900">{user.name} <span className={`ml-2 text-[10px] px-2 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span></p>
                  <p className="text-xs text-gray-500">{user.email} • WA: {user.whatsappPhone}</p>
                </div>
                <button onClick={() => handleDelete(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}