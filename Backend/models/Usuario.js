const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  rol: { type: String, required: true }, // 'alumno', 'docente', 'empresa'

  // Agregamos todos los campos que envían tus formularios de Angular
  nombres: String,
  apellidos: String,
  dni: String,
  correoInstitucional: String,
  genero: String,
  fechaNacimiento: String,
  carrera: String,
  curso: String,
  docenteACargo: String,
  codigoEstudiante: String,
  codigoCurso: String,
  nombreEmpresa: String,
  ruc: String,
  nombreContacto: String,
  cargo: String,
  telefono: String
}, { collection: 'usuarios', timestamps: true }); // Mantiene tu colección 'usuarios'

module.exports = mongoose.model('Usuario', UsuarioSchema);