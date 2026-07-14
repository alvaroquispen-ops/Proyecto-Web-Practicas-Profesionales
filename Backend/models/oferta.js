const mongoose = require('mongoose');

const OfertaSchema = new mongoose.Schema({
  empresaId: { type: String, required: true },
  titulo: { type: String, required: true },
  distrito: { type: String },
  area: { type: String },
  puesto: { type: String },
  fechaInicio: { type: String }, // Guardado como string simple desde el input html
  fechaFin: { type: String },
  modalidad: { type: String },
  descripcion: { type: String },
  habilidades: { type: String },
  contacto: { type: String },
  estado: { type: String, default: 'Activo' },
  fechaPublicacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Oferta', OfertaSchema);