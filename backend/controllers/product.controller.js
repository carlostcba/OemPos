// backend/controllers/product.controller.js
const { Product, Category, Subcategory, ProductImage, User } = require('../models');
const { Op } = require('sequelize');


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

// ✅ Actualizar producto con validación de existencia
// ✅ Actualizar producto con validación y auditoría
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user?.id || req.body.updated_by || null;

    const anterior = await Product.findByPk(id);
    if (!anterior) return res.status(404).json({ error: 'Producto no encontrado' });

    const { plu_code, price } = req.body;

    if (price !== undefined && price <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }

    if (plu_code && Number(plu_code) <= 0) {
      return res.status(400).json({ error: 'El código PLU debe ser mayor a 0' });
    }

    if (plu_code && !/^\d+$/.test(plu_code)) {
      return res.status(400).json({ error: 'El código PLU debe contener solo números' });
    }

    if (plu_code) {
      const existente = await Product.findOne({
        where: { plu_code, id: { [Op.ne]: id } }
      });
      if (existente) {
        return res.status(409).json({ error: 'El código PLU ya está en uso' });
      }
    }

    // Actualizar producto
    req.body.updated_at = new Date();
    const [updatedCount] = await Product.update(req.body, { where: { id } });

    if (updatedCount === 0) {
      return res.status(400).json({ error: 'No se realizaron cambios' });
    }

    const actualizado = await Product.findByPk(id);

    // Auditoría de cambios (comentada temporalmente hasta ajustar esquema)
    /*
    const changes = {};
    for (const campo in req.body) {
      if (anterior[campo] !== undefined && anterior[campo] !== req.body[campo]) {
        changes[campo] = {
          before: anterior[campo],
          after: req.body[campo]
        };
      }
    }

    if (Object.keys(changes).length > 0) {
      await AuditLog.create({
        entity_type: 'Product',
        entity_id: id,
        action: 'update',
        // 🔧 TODO: guardar como JSON o usar campo tipo JSON en el modelo
        changes: JSON.stringify(changes),
        previous_values: JSON.stringify(anterior),
        performed_by: userId,
        source: 'backend'
      });
    }
    */

    res.status(200).json(actualizado);
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};



// ✅ Eliminar producto con validación
exports.remove = async (req, res) => {
  try {
    const deletedCount = await Product.destroy({ where: { id: req.params.id } });

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};


exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};