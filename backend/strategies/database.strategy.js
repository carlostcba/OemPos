const { Image, ImageBinary } = require('../models');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async save(file) {
    const id = uuidv4();

    try {
      logger.info(`Iniciando proceso de guardado de imagen (ID: ${id})`);

      if (!file || !file.buffer) {
        throw new Error('El archivo está vacío o no contiene datos en buffer');
      }

      if (!file.originalname) {
        throw new Error('El archivo no tiene nombre original');
      }

      const t = await Image.sequelize.transaction();

      try {
        // Metadatos
        const image = await Image.create({
          id,
          filename: file.originalname || 'sin_nombre.png',
          original_name: file.originalname,
          mime_type: file.mimetype || 'application/octet-stream',
          size: file.size || null,
          storage_type: 'database',
          metadata: JSON.stringify({ uploaded_at: new Date().toISOString() })
        }, { transaction: t });

        // Binario
        await ImageBinary.create({
          id,
          data: file.buffer
        }, { transaction: t });

        await t.commit();
        logger.info(`✅ Imagen guardada correctamente (ID: ${id})`);
        return image;

      } catch (innerErr) {
        await t.rollback();
        logger.error(`❌ Error interno al guardar imagen ${file.originalname}: ${innerErr.message}`);
        console.error(innerErr);
        throw innerErr;
      }

    } catch (err) {
      logger.error(`❌ Error general al guardar imagen: ${err.message}`);
      console.error('Detalles:', err);
      throw err;
    }
  },

  async get(id, res) {
    try {
      const [image, binary] = await Promise.all([
        Image.findByPk(id),
        ImageBinary.findByPk(id)
      ]);
  
      if (!image || !binary || !binary.data) return false;
  
      res.setHeader('Content-Type', image.mime_type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${image.filename}"`);
      if (image.size) res.setHeader('Content-Length', image.size);
  
      res.send(binary.data);
      return true; // ✅ Devuelve true si la imagen fue servida correctamente
  
    } catch (error) {
      logger.error(`Error al servir imagen ${id}:`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al servir imagen' });
      }
      return false; // ✅ Importante para que el controller no siga procesando
    }
  },

  async remove(id) {
    const t = await Image.sequelize.transaction();

    try {
      const binaryDeleted = await ImageBinary.destroy({ where: { id }, transaction: t });
      const imageDeleted = await Image.destroy({ where: { id }, transaction: t });

      await t.commit();

      if (!binaryDeleted && !imageDeleted) {
        logger.warn(`No se encontró imagen para eliminar: ${id}`);
      } else {
        logger.info(`✅ Imagen eliminada correctamente (ID: ${id})`);
      }

    } catch (error) {
      await t.rollback();
      logger.error(`❌ Error al eliminar imagen (ID: ${id})`, error);
      throw error;
    }
  }
};
