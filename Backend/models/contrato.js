const mongoose = require('mongoose');

const ContratoSchema = new mongoose.Schema({
    alumnoId: {
        type: String,
        required: true
    },
    alumnoNombre: {
        type: String,
        required: true
    },
    // Nombre del docente a cargo (tal como aparece en usuario.docenteACargo del alumno).
    // No usamos un ObjectId de referencia porque el modelo Usuario no vincula
    // al alumno con el docente por ID, solo por nombre en texto plano.
    docenteNombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        default: ''
    },
    archivo: {
        nombre: { type: String },
        url: { type: String }
    },
    estado: {
        type: String,
        default: 'pendiente',
        enum: ['pendiente', 'aceptado', 'rechazado']
    },
    observacion: {
        type: String,
        default: ''
    },
    fechaEnvio: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contrato', ContratoSchema, 'contratos');