// backend/strategies/disk.strategy.js

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Image } = require('../models');
const config = require('../config/config');
const logger = require('../utils/logger');

// Asegurar que exista el directorio
const uploadDir = path.resolve(config.image.disk.basePath);

// Función para crear directorios recursivamente
async function ensureDirectoryExists(directory) {
  try {
    await fs.mkdir(directory, { recursive: true });
    logger.info(`Directorio asegurado: ${directory}`);
  } catch (error) {
    logger.error(`Error al crear directorio ${directory}:`, error);
    throw error;
  }
}

// Inicializar directorio al cargar el módulo
(async () => {
  try {
    await ensureDirectoryExists(uploadDir);
  } catch (error) {
    logger.error('Error al inicializar directorio de imágenes:', error);
  }
})();

module.exports = {
  async save(file) {
    const id = uuidv4();
    const extension = path.extname(file.originalname).toLowerCase() || '.bin';
    const filename = `${id}${extension}`;
    const filepath = path.join(uploadDir, filename);
    
    // Crear subdirectorios basados en UUID para mejor organización
    const subDir = path.join(uploadDir, id.substring(0, 2));
    await ensureDirectoryExists(subDir);
    
    const finalPath = path.join(subDir, filename);
    const relativePath = path.relative(path.resolve(config.image.disk.basePath), finalPath);
    
    try {
      // Guardar archivo en disco
      await fs.writeFile(finalPath, file.buffer);
      
      // Calcular URL relativa para acceso
      const baseUrl = config.image.disk.baseUrl;
      const accessUrl = `${baseUrl}/${relativePath.replace(/\\/g, '/')}`;
      
      // Crear entrada en base de datos (metadatos)
      const image = await Image.create({
        id,
        path: relativePath,
        url: accessUrl,
        filename,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        storage_type: 'disk',
        metadata: JSON.stringify({
          uploaded_at: new Date().toISOString()
        })
      });

      logger.info(`Imagen guardada en disco: ${finalPath}`);
      return image;
    } catch (error) {
      logger.error(`Error al guardar imagen en disco: ${error.message}`);
      // Intentar limpiar el archivo si se creó
      try {
        await fs.unlink(finalPath);
      } catch (unlinkError) {
        // Ignorar error si el archivo no existe
      }
      throw error;
    }
  },

  async get(id, res) {
    try {
      const image = await Image.findByPk(id);

      if (!image || !image.path) {
        logger.warn(`Imagen no encontrada: ${id}`);
        return res.status(404).json({ error: 'Imagen no encontrada' });
      }

      const imagePath = path.join(uploadDir, image.path);
      
      // Verificar si el archivo existe
      try {
        await fs.access(imagePath);
      } catch (error) {
        logger.warn(`Archivo físico no encontrado: ${imagePath}`);
        return res.status(404).json({ error: 'Archivo no encontrado en disco' });
      }

      // Si existe una URL y es externa, redirigir
      if (image.url && /^https?:\/\//.test(image.url)) {
        return res.redirect(image.url);
      }

      // Configurar headers
      res.setHeader('Content-Type', image.mime_type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${image.filename}"`);
      if (image.size) {
        res.setHeader('Content-Length', image.size);
      }
      
      // Enviar archivo
      const fileStream = fs.createReadStream(imagePath);
      fileStream.pipe(res);
      
      // Manejar errores de stream
      fileStream.on('error', (error) => {
        logger.error(`Error al leer archivo ${imagePath}:`, error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error al leer archivo' });
        }
      });
    } catch (error) {
      logger.error(`Error al servir imagen ${id}:`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al servir imagen' });
      }
    }
  },

  async remove(id) {
    try {
      const image = await Image.findByPk(id);
      
      if (!image) {
        logger.warn(`Intento de eliminar imagen inexistente: ${id}`);
        return;
      }
      
      if (image.path) {
        const imagePath = path.join(uploadDir, image.path);
        try {
          await fs.unlink(imagePath);
          logger.info(`Archivo eliminado: ${imagePath}`);
          
          // Intentar eliminar directorio si está vacío
          const directory = path.dirname(imagePath);
          const files = await fs.readdir(directory);
          if (files.length === 0) {
            await fs.rmdir(directory);
            logger.info(`Directorio vacío eliminado: ${directory}`);
          }
        } catch (error) {
          // Si el archivo no existe, ignorar el error
          if (error.code !== 'ENOENT') {
            logger.warn(`Error al eliminar archivo ${imagePath}:`, error);
          }
        }
      }
      
      // Eliminar registro de la base de datos
      await image.destroy();
      logger.info(`Registro de imagen eliminado: ${id}`);
    } catch (error) {
      logger.error(`Error al eliminar imagen ${id}:`, error);
      throw error;
    }
  }
};