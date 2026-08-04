import jwt from "jsonwebtoken";

/**
 * Verifica el JWT del header Authorization y llena req.user.
 * Debe ir ANTES de cualquier ruta que dependa de req.user.
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization; // "Bearer <token>"

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "No se proporcionó token de acceso" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded trae lo que firmamos en login: { id, role, moduleRoles }
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Token expirado, inicia sesión de nuevo" });
    }
    return res.status(401).json({ success: false, error: "Token inválido" });
  }
};

/**
 * Exige que el usuario sea ADMIN global (Role, no ModuleRole).
 * Úsalo para acciones de sistema completo (crear/borrar usuarios, etc.)
 */
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ success: false, error: "Requiere permisos de administrador" });
  }
  next();
};

/**
 * Exige acceso a un módulo específico. ADMIN global siempre pasa.
 * Uso: requireModuleAccess("LEADS_ADMIN", "LEADS_AUX")
 */
export const requireModuleAccess = (...allowedRoles) => {
  return (req, res, next) => {
    if (req.user?.role === "ADMIN") return next();

    const userModuleRoles = req.user?.moduleRoles || [];
    const hasAccess = allowedRoles.some((r) => userModuleRoles.includes(r));

    if (!hasAccess) {
      return res.status(403).json({ success: false, error: "No tienes acceso a este módulo" });
    }
    next();
  };
};