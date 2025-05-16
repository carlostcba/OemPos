const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Image } = require('../models');

// Carpeta donde se guardarán las imágenes
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'images');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

module.exports = {
  async save(file) {
    const extension = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${extension}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Guardar archivo en disco
    fs.writeFileSync(filepath, file.buffer);

    // Crear entrada en DB
    const image = await Image.create({
      path: `uploads/images/${filename}`,
      mime_type: file.mimetype,
      storage_type: 'disk'
    });

    return image;
  },

  async get(id, res) {
    const image = await Image.findByPk(id);

    if (!image || !image.path) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    const absolutePath = path.join(__dirname, '..', '..', image.path);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Archivo físico no encontrado' });
    }

    res.setHeader('Content-Type', image.mime_type || 'application/octet-stream');
    fs.createReadStream(absolutePath).pipe(res);
  },

  async remove(id) {
    const image = await Image.findByPk(id);

    if (image && image.path) {
      const absolutePath = path.join(__dirname, '..', '..', image.path);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }

    if (image) await image.destroy();
  }
};
