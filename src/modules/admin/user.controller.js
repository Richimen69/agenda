import prisma from "#config/prisma";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 1. LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: "Usuario desactivado" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: "Contraseña incorrecta" });
    }

    // Payload del token: lo mínimo necesario para autorizar requests futuros
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        moduleRoles: user.moduleRoles,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, data: { user: userWithoutPassword, token } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        moduleRoles: true,
        whatsappPhone: true,
        area: { select: { id: true, name: true } },
      },
    });
    if (!user) return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. CREAR USUARIO (Solo Admin)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, whatsappPhone, role, areaId } = req.body;

    // Encriptamos la contraseña (10 saltos de seguridad)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        whatsappPhone,
        role: role || "USER",
        areaId: areaId || null,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error("ERROR REAL AL CREAR USUARIO:", error);
    res.status(500).json({
      success: false,
      error: "El correo ya existe o los datos son inválidos",
    });
  }
};

// 3. OBTENER TODOS LOS USUARIOS
export const getUsers = async (req, res) => {
  const { moduleRoles } = req.query; // ej. ?moduleRoles=LEADS_RESPONSABLE,LEADS_ADMIN

  try {
    const users = await prisma.user.findMany({
      where: moduleRoles
        ? { moduleRoles: { hasSome: moduleRoles.split(",") } }
        : undefined, // sin el query param, se comporta exactamente como antes (trae todos)
      select: {
        id: true,
        area: {
          select: {
            name: true,
            parent: { select: { name: true } },
          },
        },
        name: true,
        email: true,
        whatsappPhone: true,
        role: true,
        moduleRoles: true, // opcional, útil si el frontend quiere mostrar el rol del módulo
        isActive: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        whatsappPhone: true,
        area: {
          select: {
            name: true, // "Asesores de Ventas"
            parent: { select: { name: true } }, // "Ventas"
            id: true, // ID del área
          },
        },
      },
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. BORRAR USUARIO
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "No se puede borrar un usuario que tiene proyectos asignados",
    });
  }
};
// BORRADO FÍSICO (Hard Delete - Solo para uso desde Postman)
export const hardDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Usuario borrado DEFINITIVAMENTE de la base de datos",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        "No se puede borrar físicamente porque el usuario ya creó proyectos o eventos. Debes borrar sus proyectos primero. Detalle: " +
        error.message,
    });
  }
};

export const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, areaId, whatsappPhone, moduleRoles } = req.body;

    const data = { name, email, areaId, whatsappPhone }; // <- declaración necesaria
    console.log("req.user:", req.user);

    if (req.user?.role === "ADMIN") {
      if (role !== undefined) data.role = role;
      if (moduleRoles !== undefined) data.moduleRoles = moduleRoles;
    }
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        moduleRoles: true,
        whatsappPhone: true,
        area: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
