const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Informe = require('../models/Informe');

// ====================================================================
// CONFIGURACIÓN DE MULTER PARA INFORMES (carpeta separada)
// ====================================================================
const uploadDir = path.join(__dirname, '..', 'uploads', 'informes');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const sufijoUnico = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${sufijoUnico}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
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

// Normaliza un nombre para comparar sin importar mayúsculas, tildes o espacios extra
function normalizarNombre(str) {
    return (str || '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}

// ====================================================================
// 1. POST: El alumno envía un informe
// ====================================================================
router.post('/', upload.single('informe'), async (req, res) => {
    try {
        const { alumnoId, alumnoNombre, docenteNombre, titulo } = req.body;

        if (!alumnoId || !alumnoNombre || !docenteNombre || !titulo) {
            return res.status(400).json({ mensaje: 'Faltan campos críticos: alumnoId, alumnoNombre, docenteNombre o titulo.' });
        }
        if (!req.file) {
            return res.status(400).json({ mensaje: 'Debes adjuntar un archivo de informe.' });
        }

        const nuevoInforme = new Informe({
            alumnoId,
            alumnoNombre,
            docenteNombre,
            titulo,
            archivo: {
                nombre: req.file.originalname,
                url: `/uploads/informes/${req.file.filename}`
            },
            estado: 'pendiente'
        });

        await nuevoInforme.save();
        return res.status(200).send("OK");
    } catch (error) {
        console.error('Error al registrar informe:', error);
        return res.status(500).json({ mensaje: error.message || 'Error interno al registrar el informe.' });
    }
});

// ====================================================================
// 2. GET: Informes enviados por un alumno (para "Mis informes")
// ====================================================================
router.get('/alumno/:alumnoId', async (req, res) => {
    try {
        const informes = await Informe.find({ alumnoId: req.params.alumnoId }).sort({ fechaEnvio: -1 });
        return res.status(200).json(informes);
    } catch (error) {
        console.error('Error al obtener informes del alumno:', error);
        return res.status(500).json({ mensaje: 'Error al consultar la base de datos.' });
    }
});

// ====================================================================
// 3. GET: Informes asignados a un docente (para "Evaluar informes")
// ====================================================================
router.get('/docente/:nombreDocente', async (req, res) => {
    try {
        const nombreBuscado = normalizarNombre(decodeURIComponent(req.params.nombreDocente));

        const todosLosInformes = await Informe.find().sort({ fechaEnvio: -1 });
        const informesDocente = todosLosInformes.filter(i => normalizarNombre(i.docenteNombre) === nombreBuscado);

        return res.status(200).json(informesDocente);
    } catch (error) {
        console.error('Error al obtener informes del docente:', error);
        return res.status(500).json({ mensaje: 'Error al consultar la base de datos.' });
    }
});

// ====================================================================
// 4. PUT: El docente evalúa (o edita la evaluación) de un informe
// ====================================================================
router.put('/:id/evaluar', async (req, res) => {
    try {
        const { id } = req.params;
        const { calificacion, comentario } = req.body;

        if (!calificacion) {
            return res.status(400).json({ mensaje: 'La calificación es obligatoria.' });
        }

        const informeActualizado = await Informe.findByIdAndUpdate(
            id,
            { calificacion, comentario: comentario || '', estado: 'calificado' },
            { new: true }
        );

        if (!informeActualizado) {
            return res.status(404).json({ mensaje: 'No se encontró el informe a evaluar.' });
        }

        return res.status(200).send("OK");
    } catch (error) {
        console.error('Error al evaluar informe:', error);
        return res.status(500).json({ mensaje: 'Error interno al evaluar el informe.' });
    }
});

// ====================================================================
// 5. DELETE: El alumno anula su envío (solo permitido si está pendiente)
// ====================================================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const informe = await Informe.findById(id);
        if (!informe) {
            return res.status(404).json({ mensaje: 'No se encontró el informe.' });
        }

        if (informe.estado !== 'pendiente') {
            return res.status(400).json({ mensaje: 'Solo se pueden anular informes pendientes.' });
        }

        await Informe.findByIdAndDelete(id);
        return res.status(200).send("OK");
    } catch (error) {
        console.error('Error al anular informe:', error);
        return res.status(500).json({ mensaje: 'Error interno al anular el informe.' });
    }
});

module.exports = router;