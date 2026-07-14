const mongoose = require('mongoose');

const InformeSchema = new mongoose.Schema({
    alumnoId: {
        type: String,
        required: true
    },
    alumnoNombre: {
        type: String,
        required: true
    },
    // Igual que en Contrato: se enlaza por nombre, no por ID,
    // porque Usuario.docenteACargo es un campo de texto plano.
    docenteNombre: {
        type: String,
        required: true
    },
    titulo: {
        type: String,
        required: true
    },
    archivo: {
        nombre: { type: String },
        url: { type: String }
    },
    estado: {
        type: String,
        default: 'pendiente',
        enum: ['pendiente', 'calificado']
    },
    calificacion: {
        type: String,
        default: ''
    },
    comentario: {
        type: String,
        default: ''
    },
    fechaEnvio: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Informe', InformeSchema, 'informes');