const { ProductImage } = require('../models');

exports.upload = async (req, res) => {
  const { buffer, mimetype } = req.file;

  const image = await ProductImage.create({
    image: buffer,
    mime_type: mimetype
  });

  res.status(201).json({ id: image.id });
};
