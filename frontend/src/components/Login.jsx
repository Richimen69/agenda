import { useState } from 'react';
import { loginUser } from '../services/api';
import { Lock } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // NUEVO ESTADO
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginUser(email, password); // Pasamos el password
      if (result.success) {
        localStorage.setItem('authUser', JSON.stringify(result.data));
        onLoginSuccess(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 border border-gray-100">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-8">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Correo Electrónico</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
          
          {/* NUEVO CAMPO DE CONTRASEÑA */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Contraseña</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button type="submit" disabled={isLoading} className="w-full py-4 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors mt-4">
            {isLoading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}