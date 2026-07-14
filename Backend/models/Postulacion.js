const mongoose = require('mongoose');

const PostulacionSchema = new mongoose.Schema({
    ofertaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Oferta',
        required: true
    },
    alumnoId: {
        type: String,
        required: true
    },
    nombreAlumno: {
        type: String,
        required: true
    },
    nombres: {
        type: String,
        required: true
    },
    apellidos: {
        type: String,
        required: true
    },
    genero: {
        type: String
    },
    fechaNacimiento: {
        type: String
    },
    dni: {
        type: String,
        required: true
    },
    correoInstitucional: {
        type: String,
        required: true
    },
    carrera: {
        type: String
    },
    puesto: {
        type: String
    },
    empresa: {
        type: String
    },
    // FIX: guardamos modalidad y área directamente en la postulación
    // (antes se perdían porque el schema no las tenía declaradas).
    modalidad: {
        type: String
    },
    area: {
        type: String
    },
    // CAMBIO: ahora cada documento adjunto guarda su nombre original
    // Y la URL real donde quedó guardado el archivo en el servidor,
    // en vez de guardar solo el nombre como texto plano.
    documentosAdjuntos: {
        type: [{
            nombre: { type: String },
            url: { type: String }
        }],
        default: []
    },
    estado: {
        type: String,
        default: 'pendiente',
        enum: ['pendiente', 'aceptado', 'rechazado']
    },
    fechaPostulacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Postulacion', PostulacionSchema, 'postulaciones');