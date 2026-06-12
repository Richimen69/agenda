import prisma from './prisma.js';
import bcrypt from 'bcryptjs';

// 1. LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });

    // Comparamos la contraseña enviada con la encriptada en la BD
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });

    // Quitamos el password antes de enviarlo al frontend por seguridad
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. CREAR USUARIO (Solo Admin)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, whatsappPhone, role } = req.body;

    // Encriptamos la contraseña (10 saltos de seguridad)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        whatsappPhone,
        role: role || 'USER'
      }
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, error: 'El correo ya existe o los datos son inválidos' });
  }
};

// 3. OBTENER TODOS LOS USUARIOS
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, whatsappPhone: true, role: true, isActive: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. BORRAR USUARIO
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'No se puede borrar un usuario que tiene proyectos asignados' });
  }
};