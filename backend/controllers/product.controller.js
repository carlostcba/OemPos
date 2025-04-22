const { Product, Category, Subcategory, ProductImage, User } = require('../models');

exports.getAll = async (req, res) => {
  const products = await Product.findAll({
    include: [
      { model: Category, as: 'category' },
      { model: Subcategory, as: 'subcategory' },
      { model: ProductImage, as: 'image' },
      { model: User, as: 'creator', attributes: ['id', 'username'] }
    ]
  });
  res.json(products);
};

exports.create = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
};

exports.update = async (req, res) => {
  await Product.update(req.body, { where: { id: req.params.id } });
  res.sendStatus(204);
};

exports.remove = async (req, res) => {
  await Product.destroy({ where: { id: req.params.id } });
  res.sendStatus(204);
};
