// backend/controllers/image.controller.js

const imageService = require('../services/imageStorage.service');
const logger = require('../utils/logger');

// SUBIR imágenes asociadas a una entidad
exports.upload = async (req, res) => {
  try {
    const { owner_type, owner_id, tag } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se recibieron archivos' });
    }

    if (!owner_type || !owner_id) {
      return res.status(400).json({ error: 'owner_type y owner_id son obligatorios' });
    }

    logger.info('Solicitud de carga de imágenes recibida', {
      owner_type,
      owner_id,
      tag,
      files: req.files.length
    });

    // Para cada archivo, registrar su aceptación
    req.files.forEach(file => {
      logger.info('Archivo aceptado para carga', {
        originalname: file.originalname,
        mimetype: file.mimetype
      });
    });

    logger.info('Iniciando carga de imágenes', {
      files: req.files.length,
      owner_type,
      owner_id
    });

    const result = await imageService.saveMany(req.files, { owner_type, owner_id, tag });
    
    // Determinar el código de estado adecuado según los resultados
    let statusCode = 201; // Created por defecto
    
    if (result.totalSuccess === 0) {
      statusCode = 500; // Error interno del servidor
    } else if (result.totalErrors > 0) {
      statusCode = 207; // Multi-Status - éxitos y errores mezclados
    }
    
    res.status(statusCode).json({
      message: 'Proceso de carga de imágenes completado',
      totalProcesadas: req.files.length,
      exitosas: result.totalSuccess,
      fallidas: result.totalErrors,
      imagenes: result.results,
      errores: result.errors
    });
  } catch (err) {
    logger.error('Error general en carga de imágenes:', err);
    res.status(500).json({ 
      error: 'Error al subir imágenes',
      message: err.message
    });
  }
};

// LISTAR imágenes por entidad
exports.getByOwner = async (req, res) => {
  try {
    const { owner_type, owner_id, tag } = req.query;

    if (!owner_type || !owner_id) {
      return res.status(400).json({ error: 'owner_type y owner_id son obligatorios' });
    }

    logger.info(`Solicitando imágenes para ${owner_type}/${owner_id}`, { tag });
    
    const images = await imageService.getImages(owner_type, owner_id, tag);
    
    res.json({
      owner_type,
      owner_id,
      tag: tag || 'all',
      count: images.length,
      images
    });
  } catch (err) {
    logger.error('Error al listar imágenes:', err);
    res.status(500).json({ error: 'Error al listar imágenes' });
  }
};

// VER una imagen
// controllers/image.controller.js
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Solicitando contenido de imagen: ${id}`);

    const found = await imageService.get(id, res);

    if (!found && !res.headersSent) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

  } catch (err) {
    logger.error('Error inesperado al servir imagen:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'No se pudo obtener la imagen' });
    }
  }
};



// ELIMINAR imagen
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Solicitando eliminación de imagen: ${id}`);
    
    await imageService.remove(id);
    
    res.json({ 
      success: true,
      message: `Imagen ${id} eliminada correctamente` 
    });
  } catch (err) {
    logger.error('Error al eliminar imagen:', err);
    res.status(500).json({ error: 'No se pudo eliminar la imagen' });
  }
};

// INFO sobre almacenamiento (ruta adicional)
exports.getStorageInfo = (req, res) => {
  try {
    const info = imageService.getStorageInfo();
    res.json(info);
  } catch (err) {
    logger.error('Error al obtener información de almacenamiento:', err);
    res.status(500).json({ error: 'Error al obtener información de almacenamiento' });
  }
};

exports.updateImageLink = async (req, res) => {
  try {
    const { owner_type, owner_id, image_id, tag = 'default' } = req.body;

    // Validar parámetros requeridos
    if (!owner_type || !owner_id || !image_id) {
      logger.error('Faltan parámetros requeridos', { body: req.body });
      return res.status(400).json({ 
        error: 'Faltan parámetros requeridos (owner_type, owner_id, image_id)' 
      });
    }

    logger.info('Actualizando vínculo de imagen', {
      owner_type,
      owner_id,
      image_id,
      tag
    });

    // Verificar que la imagen existe
    const { Image } = require('../models');
    const imageExists = await Image.findByPk(image_id);
    if (!imageExists) {
      logger.error('Imagen no encontrada', { image_id });
      return res.status(404).json({ 
        error: `Imagen con ID ${image_id} no encontrada` 
      });
    }

    logger.info('Imagen encontrada', { 
      imageId: imageExists.id, 
      filename: imageExists.filename 
    });

    // Eliminar vínculos previos del mismo tipo y entidad
    const { ImageLink } = require('../models');
    const deletedCount = await ImageLink.destroy({ 
      where: { 
        owner_type, 
        owner_id 
      } 
    });

    logger.info(`Vínculos anteriores eliminados: ${deletedCount}`);

    // Crear nuevo vínculo
    const newLink = await ImageLink.create({
      image_id,
      owner_type,
      owner_id,
      tag
    });

    logger.info('Nuevo vínculo creado exitosamente', { 
      linkId: newLink.id,
      image_id: newLink.image_id,
      owner_type: newLink.owner_type,
      owner_id: newLink.owner_id
    });

    res.json({
      success: true,
      message: 'Vínculo actualizado correctamente',
      link: {
        id: newLink.id,
        image_id: newLink.image_id,
        owner_type: newLink.owner_type,
        owner_id: newLink.owner_id,
        tag: newLink.tag
      }
    });

  } catch (err) {
    logger.error('Error al actualizar vínculo de imagen:', {
      error: err.message,
      stack: err.stack,
      body: req.body,
      sqlMessage: err.original?.message,
      sqlCode: err.original?.code
    });
    
    // Manejar errores específicos
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        error: 'La imagen especificada no existe en el sistema',
        details: 'Verifique que el ID de imagen sea correcto'
      });
    }
    
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: err.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      error: 'No se pudo actualizar el vínculo',
      details: err.message 
    });
  }
};