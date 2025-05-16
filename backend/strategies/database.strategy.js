const { Image } = require('../models');

module.exports = {
  // Guarda la imagen en la base y devuelve el registro
  async save(file) {
    const { buffer, mimetype } = file;

    const image = await Image.create({
      image: buffer,
      mime_type: mimetype,
      storage_type: 'database'
    });

    return image;
  },

  // Devuelve el contenido de la imagen como stream al cliente
  async get(id, res) {
    const image = await Image.findByPk(id);

    if (!image || !image.image) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    res.setHeader('Content-Type', image.mime_type || 'image/jpeg');
    res.send(image.image);
  },

  // Elimina la imagen de la base de datos
  async remove(id) {
    const image = await Image.findByPk(id);
    if (image) {
      await image.destroy();
    }
  }
};
