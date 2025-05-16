const imageService = require('../services/imageStorage.service');

// SUBIR imágenes asociadas a una entidad
exports.upload = async (req, res) => {
  try {
    const { owner_type, owner_id, tag } = req.body;

    if (!req.files?.length) {
      return res.status(400).json({ error: 'No se recibieron archivos' });
    }

    if (!owner_type || !owner_id) {
      return res.status(400).json({ error: 'owner_type y owner_id son obligatorios' });
    }

    const result = await imageService.saveMany(req.files, { owner_type, owner_id, tag });
    res.status(201).json({ message: 'Imágenes subidas', images: result });
  } catch (err) {
    console.error('Error al subir imágenes:', err);
    res.status(500).json({ error: 'Error al subir imágenes' });
  }
};

// LISTAR imágenes por entidad
exports.getByOwner = async (req, res) => {
  try {
    const { owner_type, owner_id, tag } = req.query;

    if (!owner_type || !owner_id) {
      return res.status(400).json({ error: 'owner_type y owner_id son obligatorios' });
    }

    const images = await imageService.getImages(owner_type, owner_id, tag);
    res.json(images);
  } catch (err) {
    console.error('Error al listar imágenes:', err);
    res.status(500).json({ error: 'Error al listar imágenes' });
  }
};

// VER una imagen
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    await imageService.get(id, res);
  } catch (err) {
    console.error('Error al servir imagen:', err);
    res.status(500).json({ error: 'No se pudo obtener la imagen' });
  }
};

// ELIMINAR imagen
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await imageService.remove(id);
    res.json({ message: `Imagen ${id} eliminada correctamente` });
  } catch (err) {
    console.error('Error al eliminar imagen:', err);
    res.status(500).json({ error: 'No se pudo eliminar la imagen' });
  }
};
