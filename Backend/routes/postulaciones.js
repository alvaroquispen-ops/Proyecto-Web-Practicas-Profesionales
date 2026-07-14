const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Postulacion = require('../models/Postulacion');

// ====================================================================
// CONFIGURACIÓN DE MULTER: dónde y cómo se guardan los archivos subidos
// ====================================================================
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Prefijo único para que dos alumnos no se pisen el mismo nombre de archivo,
        // pero conservamos el nombre original para mostrarlo después.
        const sufijoUnico = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${sufijoUnico}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB por archivo
    fileFilter: (req, file, cb) => {
        const permitidos = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (permitidos.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF, DOC o DOCX.'));
        }
    }
});

// ====================================================================
// 1. POST: Registrar una nueva postulación (ahora recibe multipart/form-data)
// ====================================================================
router.post('/', upload.array('documentos', 3), async (req, res) => {
    try {
        console.log("Datos recibidos en el Backend (texto):", req.body);
        console.log("Archivos recibidos en el Backend:", req.files);

        const {
            ofertaId,
            alumnoId,
            nombreAlumno,
            nombres,
            apellidos,
            genero,
            fechaNacimiento,
            dni,
            correoInstitucional,
            carrera,
            ciclo,
            puesto,
            empresa,
            modalidad,
            area
        } = req.body;

        if (!ofertaId || !alumnoId || !nombreAlumno) {
            return res.status(400).json({ mensaje: 'Faltan campos críticos: ofertaId, alumnoId o nombreAlumno.' });
        }

        // Construimos el arreglo de documentos a partir de los archivos que
        // multer ya guardó en disco (req.files), no de lo que mande el frontend.
        const documentosAdjuntos = (req.files || []).map(f => ({
            nombre: f.originalname,
            url: `/uploads/${f.filename}`
        }));

        const nuevaPostulacion = new Postulacion({
            ofertaId,
            alumnoId,
            nombreAlumno,
            nombres: nombres || nombreAlumno.split(' ')[0] || '',
            apellidos: apellidos || nombreAlumno.split(' ')[1] || '',
            genero: genero || 'No especificado',
            fechaNacimiento: fechaNacimiento || '',
            dni: dni || '00000000',
            correoInstitucional: correoInstitucional || '',
            carrera: carrera || 'General',
            ciclo: ciclo || '',
            documentosAdjuntos,
            puesto: puesto || 'Puesto de Prácticas',
            empresa: empresa || 'Empresa Privada',
            modalidad: modalidad || '',
            area: area || '',
            estado: 'pendiente'
        });

        await nuevaPostulacion.save();
        return res.status(200).send("OK");
    } catch (error) {
        console.error('Error crítico al registrar postulación:', error);
        return res.status(500).json({ mensaje: error.message || 'Error interno del servidor al postular.' });
    }
});

// ====================================================================
// 2. GET: Listar postulaciones de un Alumno (Para "Mis Postulaciones")
// ====================================================================
router.get('/alumno/:alumnoId', async (req, res) => {
    try {
        const idBuscado = req.params.alumnoId;
        const historial = await Postulacion.find({ alumnoId: idBuscado }).populate('ofertaId');
        return res.status(200).json(historial);
    } catch (error) {
        console.error("Error al obtener historial:", error);
        return res.status(500).json({ mensaje: "Error al consultar la base de datos." });
    }
});

// ====================================================================
// 3. GET: Historial de Postulaciones Recibidas (Para la Vista Empresa)
// ====================================================================
router.get('/empresa/:empresaId', async (req, res) => {
    try {
        const { empresaId } = req.params;

        const todasLasPostulaciones = await Postulacion.find()
            .populate('ofertaId')
            .sort({ fechaPostulacion: -1 });

        const postulacionesEmpresa = todasLasPostulaciones.filter(p => {
            return p.ofertaId && (p.ofertaId.empresaId === empresaId || p.ofertaId.empresa === empresaId);
        });

        return res.status(200).json(postulacionesEmpresa);
    } catch (error) {
        console.error('Error al obtener postulaciones para la empresa:', error);
        return res.status(500).json({ mensaje: 'Error al recuperar historial de postulaciones.' });
    }
});

// ====================================================================
// 4. PUT: Evaluar / Cambiar Estado (Desde la ventana Evaluar de Empresa)
// ====================================================================
router.put('/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!['aceptado', 'rechazado'].includes(estado)) {
            return res.status(400).json({ mensaje: 'Estado de evaluación inválido.' });
        }

        const postulacionActualizada = await Postulacion.findByIdAndUpdate(
            id,
            { estado },
            { new: true }
        );

        if (!postulacionActualizada) {
            return res.status(404).json({ mensaje: 'No se encontró la postulación a evaluar.' });
        }

        return res.status(200).send("OK");
    } catch (error) {
        console.error('Error al actualizar estado de postulación:', error);
        return res.status(500).json({ mensaje: 'Error interno al evaluar la postulación.' });
    }
});

// ====================================================================
// 5. DELETE: Eliminar una postulación (solo permitido si está pendiente)
// ====================================================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const postulacion = await Postulacion.findById(id);
        if (!postulacion) {
            return res.status(404).json({ mensaje: 'No se encontró la postulación.' });
        }

        // Seguro en el backend: nunca permitimos borrar una postulación
        // ya evaluada, aunque alguien se salte el frontend.
        if (postulacion.estado !== 'pendiente') {
            return res.status(400).json({ mensaje: 'Solo se pueden eliminar postulaciones pendientes.' });
        }

        await Postulacion.findByIdAndDelete(id);
        return res.status(200).send("OK");
    } catch (error) {
        console.error('Error al eliminar postulación:', error);
        return res.status(500).json({ mensaje: 'Error interno al eliminar la postulación.' });
    }
});

module.exports = router;