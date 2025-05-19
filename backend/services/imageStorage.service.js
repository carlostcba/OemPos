// backend/services/imageStorage.service.js

const config = require('../config/config');
const { Image, ImageLink } = require('../models');
const logger = require('../utils/logger');

// Importar estrategias
const dbStrategy = require('../strategies/database.strategy');
const diskStrategy = require('../strategies/disk.strategy');
const cloudStrategy = require('../strategies/cloud.strategy');

// Definir estrategias disponibles
const strategies = {
  database: dbStrategy,
  disk: diskStrategy,
  cloud: cloudStrategy
};

// Obtener configuración
const selectedStrategy = config.image?.storage || 'disk';

// Verificar que exista la estrategia seleccionada
if (!strategies[selectedStrategy]) {
  logger.error(`Estrategia de almacenamiento no válida: ${selectedStrategy}. Usando 'disk' como fallback.`);
}

// Seleccionar estrategia (con fallback a disk)
const strategy = strategies[selectedStrategy] || strategies.disk;

logger.info(`Servicio de almacenamiento de imágenes inicializado con estrategia: ${selectedStrategy}`);

class ImageStorageService {
  /**
   * Valida una imagen antes de procesarla
   * @param {Object} file - Objeto de archivo de multer
   * @returns {Boolean} - True si es válida
   * @throws {Error} - Si la validación falla
   */
  validateImage(file) {
    // Verificar mime type
    if (!config.image.limits.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Tipo de archivo no permitido: ${file.mimetype}. Permitidos: ${config.image.limits.allowedMimeTypes.join(', ')}`);
    }
    
    // Verificar tamaño
    if (file.size > config.image.limits.maxSize) {
      throw new Error(`Archivo demasiado grande: ${file.size} bytes. Máximo permitido: ${config.image.limits.maxSize} bytes`);
    }
    
    return true;
  }

  /**
   * Guarda múltiples imágenes con asociación polimórfica
   * @param {Array} files - Archivos de multer
   * @param {Object} meta - { owner_type, owner_id, tag }
   */
  async saveMany(files = [], { owner_type, owner_id, tag }) {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No se proporcionaron archivos');
    }
    
    if (!owner_type || !owner_id) {
      throw new Error('Faltan owner_type u owner_id');
    }

    logger.info(`Iniciando guardado de ${files.length} imágenes`, {
      owner_type,
      owner_id,
      tag: tag || 'default'
    });

    const results = [];
    const errors = [];

    // Procesar cada archivo
    for (const file of files) {
      try {
        // Validar imagen
        this.validateImage(file);
        
        logger.info(`Procesando archivo: ${file.originalname}`, {
          mimetype: file.mimetype,
          size: file.size
        });
        
        // Guardar imagen usando la estrategia seleccionada
        const image = await strategy.save(file);

        // Crear vínculo en image_links
        const link = await ImageLink.create({
          image_id: image.id,
          owner_type,
          owner_id,
          tag: tag || 'default'
        });

        // Añadir a resultados
        results.push({
          id: image.id,
          filename: image.filename || image.original_name,
          mime_type: image.mime_type,
          size: image.size,
          url: image.url,
          link_id: link.id,
          tag: tag || 'default'
        });
      } catch (error) {
        logger.error(`Error al guardar imagen ${file.originalname}:`, error);
        errors.push({
          fileName: file.originalname,
          error: error.message
        });
      }
    }

    return {
      success: results.length > 0,
      results,
      errors: errors.length > 0 ? errors : undefined,
      totalSuccess: results.length,
      totalErrors: errors.length,
      totalProcessed: files.length
    };
  }

  /**
   * Obtiene las imágenes vinculadas a un objeto
   * @param {String} owner_type - Tipo de entidad propietaria
   * @param {String} owner_id - ID de la entidad propietaria
   * @param {String|null} tag - Etiqueta opcional para filtrar
   */
  async getImages(owner_type, owner_id, tag = null) {
    try {
      const where = { owner_type, owner_id };
      if (tag) where.tag = tag;

      const links = await ImageLink.findAll({
        where,
        include: [{ model: Image, as: 'image' }],
        order: [['created_at', 'DESC']]
      });

      // Transformar resultado para tener una estructura más limpia
      return links.map(link => ({
        id: link.image?.id,
        link_id: link.id,
        filename: link.image?.filename || link.image?.original_name,
        mime_type: link.image?.mime_type,
        url: link.image?.url || `/api/images/${link.image?.id}`,
        size: link.image?.size,
        tag: link.tag,
        created_at: link.created_at
      }));
    } catch (error) {
      logger.error(`Error al obtener imágenes para ${owner_type}/${owner_id}:`, error);
      throw error;
    }
  }

  /**
   * Sirve el contenido de una imagen individual
   * @param {String} id - ID de la imagen
   * @param {Object} res - Express Response
   */
  async get(id, res) {
    return strategy.get(id, res);
  }

  /**
   * Elimina una imagen completamente (imagen + vínculos)
   * @param {String} id - ID de la imagen
   */
  async remove(id) {
    try {
      // Primero eliminamos los vínculos
      await ImageLink.destroy({ where: { image_id: id } });
      logger.info(`Enlaces de imagen ${id} eliminados`);
      
      // Luego la imagen usando la estrategia correspondiente
      await strategy.remove(id);
      logger.info(`Imagen ${id} eliminada completamente`);
      
      return true;
    } catch (error) {
      logger.error(`Error al eliminar imagen ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene información sobre la estrategia de almacenamiento actual
   */
  getStorageInfo() {
    return {
      currentStrategy: selectedStrategy,
      availableStrategies: Object.keys(strategies),
      config: {
        maxSize: config.image.limits.maxSize,
        allowedMimeTypes: config.image.limits.allowedMimeTypes
      }
    };
  }
}

module.exports = new ImageStorageService();