// backend/controllers/image.controller.js

const { ProductImage } = require('../models');

// Función para subir imágenes
exports.upload = async (req, res) => {
  const { buffer, mimetype } = req.file;

  try {
    const image = await ProductImage.create({
      image: buffer,
      mime_type: mimetype
    });

    res.status(201).json({ id: image.id });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
};

// Función para eliminar imágenes
exports.remove = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Buscar la imagen por ID
    const image = await ProductImage.findByPk(id);
    
    // Verificar si la imagen existe
    if (!image) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    
    // Eliminar la imagen
    await image.destroy();
    
    res.status(200).json({ message: `Imagen ${id} eliminada exitosamente` });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ error: 'Error al eliminar la imagen' });
  }
};