// backend/controllers/product.controller.js
const { Product, Category, Subcategory, ProductImage, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

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

// ✅ Crear un nuevo producto con validaciones mejoradas
exports.create = async (req, res) => {
   try {
    console.log('📥 === CREAR PRODUCTO ===');
    console.log('📥 Body recibido:', JSON.stringify(req.body, null, 2));
    console.log('👤 Usuario del middleware:', JSON.stringify(req.user, null, 2));
    console.log('🔍 Headers de autorización:', req.headers.authorization ? 'Presente' : 'Ausente');
    console.log('📥 Datos recibidos para crear producto:', req.body);
    console.log('👤 Usuario autenticado:', req.user);

    const {
      name,
      price,
      created_by
    } = req.body;

    // Validaciones detalladas
    if (!name || name.trim() === '') {
      console.log('❌ Error: Nombre requerido');
      return res.status(400).json({ error: 'El nombre del producto es requerido' });
    }

    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      console.log('❌ Error: Precio inválido:', price);
      return res.status(400).json({ error: 'El precio debe ser un número mayor a 0' });
    }

    if (!created_by) {
      console.log('❌ Error: created_by requerido');
      return res.status(400).json({ error: 'El campo created_by es requerido' });
    }

    // Validar PLU si se proporciona
    if (req.body.plu_code && req.body.plu_code !== '') {
      if (!/^\d+$/.test(req.body.plu_code)) {
        return res.status(400).json({ error: 'El código PLU debe contener solo números' });
      }
      
      // Verificar que no exista otro producto con el mismo PLU
      const existingPLU = await Product.findOne({ 
        where: { plu_code: req.body.plu_code } 
      });
      if (existingPLU) {
        return res.status(409).json({ error: 'El código PLU ya está en uso por otro producto' });
      }
    }

    // Preparar datos para crear el producto
    const productData = {
      name: name.trim(),
      price: parseFloat(price),
      created_by,
      plu_code: req.body.plu_code || null,
      description: req.body.description?.trim() || null,
      is_weighable: req.body.is_weighable || false,
      unit_label: req.body.unit_label || 'unidad',
      stock: req.body.track_stock ? (parseFloat(req.body.stock) || 0) : 0,
      track_stock: req.body.track_stock !== false,
      is_active: req.body.is_active !== false,
      allow_discount: req.body.allow_discount !== false,
      category_id: req.body.category_id || null,
      subcategory_id: req.body.subcategory_id || null,
      product_image_id: req.body.product_image_id || null
    };

    console.log('📝 Datos preparados para crear:', productData);

    // Crear el producto
    const product = await Product.create(productData);
    
    console.log('✅ Producto creado exitosamente:', product.id);
    
    // Retornar el producto creado
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error al crear producto:');
    console.error('🔹 Mensaje:', error.message);
    console.error('🔹 Stack:', error.stack);
    
    // Manejar errores específicos de Sequelize
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        error: 'Error de validación en los datos', 
        details: errors 
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        error: 'Ya existe un producto con datos similares',
        details: error.errors?.map(err => err.message).join(', ')
      });
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        error: 'Referencia inválida a otra tabla',
        details: 'Verifique que las categorías o usuario existan'
      });
    }

    // Error genérico
    res.status(500).json({
      error: 'Error interno del servidor al crear el producto',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

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

    // Preparar datos de actualización
    const updateData = { ...req.body };
    delete updateData.product_image_id; // No actualizar imagen desde aquí
    updateData.updated_at = new Date();

    // Actualizar producto
    const [updatedCount] = await Product.update(updateData, { where: { id } });

    if (updatedCount === 0) {
      return res.status(400).json({ error: 'No se realizaron cambios' });
    }

    const actualizado = await Product.findByPk(id);

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
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Subcategory, as: 'subcategory' },
        { model: ProductImage, as: 'image' },
        { model: User, as: 'creator', attributes: ['id', 'username'] }
      ]
    });
    
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};