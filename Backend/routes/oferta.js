const express = require('express');
const router = express.Router();
const Oferta = require('../models/Oferta');

// POST: Publicar una nueva oferta
router.post('/publicar', async (req, res) => {
  try {
    const nuevaOferta = new Oferta(req.body);
    await nuevaOferta.save();
    res.status(201).json({ mensaje: 'Oferta registrada con éxito en Atlas', nuevaOferta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hubo un problema al publicar la oferta' });
  }
});

router.get('/mis-ofertas/:empresaId', async (req, res) => {
  try {
    const { empresaId } = req.params;
    // Buscamos solo las ofertas creadas por esta empresa
    const ofertas = await Oferta.find({ empresaId: empresaId });
    res.json(ofertas);
  } catch (error) {
    console.error("Error al obtener ofertas de la empresa:", error);
    res.status(500).json({ error: 'Error al obtener las ofertas de la empresa' });
  }
});

// GET: Obtener las ofertas de una empresa específica
// 🌟 NUEVO GET: Obtener ABSOLUTAMENTE TODAS las ofertas (Para el Catálogo del Alumno)
router.get('/todas', async (req, res) => {
  try {
    // Buscamos en la colección sin ningún filtro para traer todo el catálogo
    const ofertas = await Oferta.find(); 
    res.json(ofertas);
  } catch (error) {
    console.error("Error al obtener catálogo global para alumnos:", error);
    res.status(500).json({ error: 'Error al obtener el catálogo completo de ofertas' });
  }
});

// DELETE: Eliminar una oferta por ID
router.delete('/eliminar/:id', async (req, res) => {
  try {
    await Oferta.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Oferta eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la oferta' });
  }
});

// 🌟 Asegúrate de que use router.put y que reciba el parámetro :id
router.put('/ofertas/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const datosActualizados = req.body;

        // Suponiendo que usas Mongoose para conectarte a MongoDB Atlas:
        const ofertaActualizada = await Oferta.findByIdAndUpdate(id, datosActualizados, { new: true });

        if (!ofertaActualizada) {
            return res.status(404).json({ mensaje: 'No se encontró la oferta para actualizar' });
        }

        // 🌟 Es vital responder un JSON para que Angular no entre en el bloque de error
        return res.status(200).json({ ok: true, data: ofertaActualizada });
        
    } catch (error) {
        console.error("Error al actualizar la oferta:", error);
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

module.exports = router;