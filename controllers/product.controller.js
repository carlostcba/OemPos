const { Product, Category, Subcategory, ProductImage, User } = require('../models');

// ✅ Obtener todos los productos con relaciones
exports.getAll = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: Subcategory, as: 'subcategory' },
        { model: ProductImage, as: 'image' },
        { model: User, as: 'creator', attributes: ['id', 'username'] }
      ]
    });
    res.json(products);
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// ✅ Crear un nuevo producto
exports.create = async (req, res) => {
  try {
    const {
      name,
      price,
      created_by
    } = req.body;

    // Validación básica
    if (!name || !price || !created_by) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: name, price, created_by' });
    }

    const data = {
      ...req.body,
      category_id: req.body.category_id || null,
      subcategory_id: req.body.subcategory_id || null,
      product_image_id: req.body.product_image_id || null
    };

    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error al crear producto');
    console.error('🔹 Mensaje:', error.message);
    console.error('🔹 Detalles:', error.parent?.message || error.original?.message);
    console.error('🔹 SQL:', error.sql);

    res.status(500).json({
      error: 'Error al crear producto',
      message: error.message,
      details: error.parent?.message || error.original?.message,
      sql: error.sql
    });
  }
};

// ✅ Actualizar producto
exports.update = async (req, res) => {
  try {
    await Product.update(req.body, { where: { id: req.params.id } });
    res.sendStatus(204);
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// ✅ Eliminar producto
exports.remove = async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.sendStatus(204);
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
