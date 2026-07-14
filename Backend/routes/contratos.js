const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Contrato = require('../models/Contrato');

// ====================================================================
// CONFIGURACIÓN DE MULTER PARA CONTRATOS (carpeta separada de postulaciones)
// ====================================================================
const uploadDir = path.join(__dirname, '..', 'uploads', 'contratos');
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
// 1. POST: El alumno envía/adjunta su contrato
// ====================================================================
router.post('/', upload.single('contrato'), async (req, res) => {
    try {
        const { alumnoId, alumnoNombre, docenteNombre, descripcion } = req.body;

        if (!alumnoId || !alumnoNombre || !docenteNombre) {
            return res.status(400).json({ mensaje: 'Faltan campos críticos: alumnoId, alumnoNombre o docenteNombre.' });
        }
        if (!req.file) {
            return res.status(400).json({ mensaje: 'Debes adjuntar un archivo de contrato.' });
        }

        const nuevoContrato = new Contrato({
            alumnoId,
            alumnoNombre,
            docenteNombre,
            descripcion: descripcion || '',
            archivo: {
                nombre: req.file.originalname,
                url: `/uploads/contratos/${req.file.filename}`
            },
            estado: 'pendiente'
        });

        await nuevoContrato.save();
        return res.status(200).send("OK");
    } catch (error) {
        console.error('Error al registrar contrato:', error);
        return res.status(500).json({ mensaje: error.message || 'Error interno al registrar el contrato.' });
    }
});

// ====================================================================
// 2. GET: Contratos enviados por un alumno (para "Adjuntar contrato")
// ====================================================================
router.get('/alumno/:alumnoId', async (req, res) => {
    try {
        const contratos = await Contrato.find({ alumnoId: req.params.alumnoId }).sort({ fechaEnvio: -1 });
        return res.status(200).json(contratos);
    } catch (error) {
        console.error('Error al obtener contratos del alumno:', error);
        return res.status(500).json({ mensaje: 'Error al consultar la base de datos.' });
    }
});

// ====================================================================
// 3. GET: Contratos asignados a un docente (para "Revisar contrato")
// Se recibe el nombre del docente codificado en la URL y se compara
// normalizado contra el campo docenteNombre de cada contrato.
// ====================================================================
router.get('/docente/:nombreDocente', async (req, res) => {
    try {
        const nombreBuscado = normalizarNombre(decodeURIComponent(req.params.nombreDocente));

        const todosLosContratos = await Contrato.find().sort({ fechaEnvio: -1 });
        const contratosDocente = todosLosContratos.filter(c => normalizarNombre(c.docenteNombre) === nombreBuscado);

        return res.status(200).json(contratosDocente);
    } catch (error) {
        console.error('Error al obtener contratos del docente:', error);
        return res.status(500).json({ mensaje: 'Error al consultar la base de datos.' });
    }
});

// ====================================================================
// 4. PUT: El docente evalúa (acepta/rechaza) un contrato, con observación
// ====================================================================
router.put('/:id/evaluar', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, observacion } = req.body;

        if (!['aceptado', 'rechazado'].includes(estado)) {
            return res.status(400).json({ mensaje: 'Estado de evaluación inválido.' });
        }

        const contratoActualizado = await Contrato.findByIdAndUpdate(
            id,
            { estado, observacion: observacion || '' },
            { new: true }
        );

        if (!contratoActualizado) {
            return res.status(404).json({ mensaje: 'No se encontró el contrato a evaluar.' });
        }

        return res.status(200).send("OK");
    } catch (error) {
        console.error('Error al evaluar contrato:', error);
        return res.status(500).json({ mensaje: 'Error interno al evaluar el contrato.' });
    }
});

// ====================================================================
// 5. DELETE: El alumno anula su envío (solo permitido si está pendiente)
// ====================================================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const contrato = await Contrato.findById(id);
        if (!contrato) {
            return res.status(404).json({ mensaje: 'No se encontró el contrato.' });
        }

        if (contrato.estado !== 'pendiente') {
            return res.status(400).json({ mensaje: 'Solo se pueden anular contratos pendientes.' });
        }

        await Contrato.findByIdAndDelete(id);
        return res.status(200).send("OK");
    } catch (error) {
        console.error('Error al anular contrato:', error);
        return res.status(500).json({ mensaje: 'Error interno al anular el contrato.' });
    }
});

module.exports = router;