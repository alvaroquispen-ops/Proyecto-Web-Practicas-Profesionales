require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const postulacionesRoutes = require('./routes/postulaciones');
const contratosRoutes = require('./routes/contratos');
const informesRoutes = require('./routes/informes');

const app = express();
const PORT = process.env.PORT || 3000;

// 🌟 CONFIGURACIÓN DE CORS DETALLADA PARA EVITAR EL BLOQUEO DE PREFLIGHT
app.use(cors({
  origin: '*', // Permite que cualquier origen (como StackBlitz) se conecte
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Habilitar la lectura de JSON después de pasar el filtro CORS
app.use(express.json());

// NUEVO: servimos la carpeta /uploads como archivos estáticos, para que
// los documentos que suban los alumnos se puedan abrir/descargar por URL,
// ej: http://localhost:3000/uploads/1234567-cv.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1. ESCUCHAR EL PUERTO (Express)
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express ordenado corriendo en http://localhost:${PORT}`);
});

// 2. CADENA DE CONEXIÓN: ahora se lee desde el archivo .env (nunca se sube a GitHub)
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('❌ Falta la variable MONGO_URI en tu archivo .env. Revisa que el archivo .env exista y tenga esa clave.');
  process.exit(1);
}

// 3. CONEXIÓN A MONGODB ATLAS
console.log('Intentando conectar a MongoDB Atlas...');
mongoose
  .connect(mongoURI)
  .then(() => console.log('✅ Conectado con éxito a la base de datos REAL MongoDB Atlas'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

// ================= ENLAZAR RUTAS DISTRIBUIDAS =================
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/oferta'));
app.use('/api/postulaciones', postulacionesRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/informes', informesRoutes);