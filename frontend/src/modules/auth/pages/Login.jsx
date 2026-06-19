import { useState } from "react";
import { loginUser } from "../../../services/api";
import { LockKeyhole, Eye, EyeOff, AlertCircle } from "lucide-react";
import ToyotaLogo from "../../../assets/toyotaname.svg";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // NUEVO ESTADO: UX esencial
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await loginUser(email, password);
      if (result.success) {
        localStorage.setItem("authUser", JSON.stringify(result.data));
        onLoginSuccess(result.data);
      } else {
        // Formateamos el error para que no sea un texto plano aburrido
        setError(result.error || "Credenciales inválidas. Verifica tus datos.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor de autenticación.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Fondo de la app corporativa
    <div className="min-h-screen bg-layout-app flex items-center justify-center p-4">
      {/* Tarjeta del Login */}
      <div className="bg-layout-surface rounded-2xl shadow-xl w-full max-w-md p-8 sm:p-10 border border-layout-border animate-fade-in">
        {/* Branding / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-4">
            <img src={ToyotaLogo} alt="Logo de Toyota" width="200" />
          </div>
          <p className="text-sm text-content-muted mt-1 text-center">
            Ingresa tus credenciales
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo: Correo */}
          <div>
            <label className="block text-sm font-semibold text-content-main mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@toyotaguerrero.com.mx"
              className="w-full bg-layout-surface border border-layout-border rounded-lg px-4 py-3 text-sm text-content-main placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          {/* Campo: Contraseña (Con Toggle de visibilidad) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-content-main">
                Contraseña
              </label>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-layout-surface border border-layout-border rounded-lg pl-4 pr-11 py-3 text-sm text-content-main placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
              {/* Botón para mostrar/ocultar contraseña (UX) */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-main p-1 transition-colors focus:outline-none"
                tabIndex="-1" // Evita que interrumpa el flujo del tabulador
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Alerta de Error Elegante */}
          {error && (
            <div className="bg-status-danger/10 border border-status-danger/20 rounded-lg p-3 flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-status-danger leading-tight">
                {error}
              </p>
            </div>
          )}

          {/* Botón Primario */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-hover focus:ring-4 focus:ring-brand/20 transition-all mt-2 disabled:opacity-70 flex justify-center items-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Autenticando...
              </>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        {/* Footer estético de confianza */}
        <div className="mt-8 pt-6 border-t border-layout-border text-center">
          <p className="text-xs text-content-muted">
            Protegido por cifrado de extremo a extremo. <br />
            Uso exclusivo para personal autorizado.
          </p>
        </div>
      </div>
    </div>
  );
}
