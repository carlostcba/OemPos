const { Image } = require('../models');

// Ejemplo: podrías usar AWS S3, Cloudinary, etc.
module.exports = {
  async save(file) {
    // Acá deberías subir a tu servicio en la nube y obtener la URL
    const fakeCloudUrl = `https://example.com/uploads/${file.originalname}`;

    const image = await Image.create({
      url: fakeCloudUrl,
      mime_type: file.mimetype,
      storage_type: 'cloud'
    });

    return image;
  },

  async get(id, res) {
    const image = await Image.findByPk(id);

    if (!image || !image.url) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    res.redirect(image.url); // Redirige al contenido cloud
  },

  async remove(id) {
    const image = await Image.findByPk(id);
    if (!image) return;

    // Acá podrías hacer una llamada a la API del cloud para eliminarla
    await image.destroy();
  }
};
