const config = require('../config/config');
const { Image, ImageLink } = require('../models');

// Estrategias disponibles
const dbStrategy = require('../strategies/database.strategy');
const diskStrategy = require('../strategies/disk.strategy');
const cloudStrategy = require('../strategies/cloud.strategy');

// Selección de estrategia activa
const strategies = {
  database: dbStrategy,
  disk: diskStrategy,
  cloud: cloudStrategy
};

const strategy = strategies[config.image.storage]; 


if (!strategy) {
  throw new Error(`Estrategia de almacenamiento inválida: ${config.IMAGE_STORAGE}`);
}

module.exports = {
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

    const results = [];

    for (const file of files) {
      // Guarda imagen en la estrategia seleccionada
      const image = await strategy.save(file);

      // Crea vínculo en image_links
      const link = await ImageLink.create({
        image_id: image.id,
        owner_type,
        owner_id,
        tag
      });

      results.push({ ...image.toJSON(), link_id: link.id });
    }

    return results;
  },

  /**
   * Obtiene las imágenes vinculadas a un objeto
   * @param {String} owner_type
   * @param {Number} owner_id
   * @param {String|null} tag
   */
  async getImages(owner_type, owner_id, tag = null) {
    const where = { owner_type, owner_id };
    if (tag) where.tag = tag;

    return ImageLink.findAll({
      where,
      include: [{ model: Image, as: 'image' }],
      order: [['created_at', 'DESC']]
    });
  },

  /**
   * Sirve el contenido de una imagen individual (stream o redirect)
   * @param {Number} id
   * @param {Object} res - Express Response
   */
  async get(id, res) {
    return strategy.get(id, res);
  },

  /**
   * Elimina una imagen completamente (imagen + vínculos)
   * @param {Number} id - ID de la imagen
   */
  async remove(id) {
    // Primero eliminamos los vínculos
    await ImageLink.destroy({ where: { image_id: id } });

    // Luego la imagen física
    return strategy.remove(id);
  }
};
