const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario'); // Importa el modelo ordenado

// 1. NUEVA RUTA DE REGISTRO
router.post('/register', async (req, res) => {
  try {
    const datosRecibidos = req.body;

    // Verificar si el correo ya existe en MongoDB Atlas
    const existeUsuario = await Usuario.findOne({ email: datosRecibidos.email });
    if (existeUsuario) {
      return res.status(400).json({ ok: false, msg: 'El correo electrónico ya se encuentra registrado.' });
    }

    // Crear y guardar el nuevo usuario con todos los campos dinámicos
    const nuevoUsuario = new Usuario(datosRecibidos);
    await nuevoUsuario.save();

    return res.status(201).json({
      ok: true,
      msg: 'Usuario registrado exitosamente en MongoDB Atlas',
      usuario: nuevoUsuario
    });

  } catch (error) {
    console.error('Error en el registro:', error);
    return res.status(500).json({ ok: false, msg: 'Error interno en el servidor al registrar.' });
  }
});

// 2. TU RUTA DE LOGIN ACTUAL (Mejorada para devolver el usuario completo)
// --- EN TU BACKEND (Node.js) ---
router.post('/login', async (req, res) => {
  try {
    // 1. Asegúrate de recibir exactamente lo que manda Angular:
    const { email, contrasena, rol } = req.body;

    // 2. Buscar al usuario en MongoDB usando el 'email' recibido
    const usuario = await Usuario.findOne({ email: email });
    
    if (!usuario) {
      return res.status(400).json({ ok: false, msg: 'El usuario no existe' });
    }

    // 3. Validar que la contraseña coincida
    if (usuario.contrasena !== contrasena) {
      return res.status(400).json({ ok: false, msg: 'Contraseña incorrecta' });
    }

    // 4. Validar que el rol coincida
    if (usuario.rol !== rol) {
      return res.status(400).json({ ok: false, msg: 'Rol incorrecto' });
    }

    // Si todo está bien, respondes con éxito
    return res.status(200).json({
      ok: true,
      msg: 'Login exitoso',
      usuario
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: 'Error interno en el servidor' });
  }
});

// 3. TU RUTA DE PRUEBA EN VIVO ACTUAL
router.get('/prueba-conexion', async (req, res) => {
  try {
    const usuarios = await Usuario.find({});
    res.json({
      ok: true,
      msg: '¡Conexión verificada con éxito!',
      totalUsuarios: usuarios.length,
      usuarios: usuarios
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al leer datos de Atlas' });
  }
});

module.exports = router;