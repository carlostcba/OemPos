// backend/controllers/product.controller.js
const { Product, Category, Subcategory, ProductImage, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// ✅ Obtener todos los productos con relaciones
exports.getAll = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { 
          model: Category, 
          as: 'category',
          attributes: ['id', 'name'],
          required: false
        },
        { 
          model: Subcategory, 
          as: 'subcategory',
          attributes: ['id', 'name'],
          required: false
        },
        { 
          model: ProductImage, 
          as: 'image',
          required: false
        },
        { 
          model: User, 
          as: 'creator', 
          attributes: ['id', 'username'],
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });
    res.json(products);
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// ✅ Obtener producto por ID
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByPk(id, {
      include: [
        { 
          model: Category, 
          as: 'category',
          attributes: ['id', 'name'],
          required: false
        },
        { 
          model: Subcategory, 
          as: 'subcategory',
          attributes: ['id', 'name'],
          required: false
        },
        { 
          model: ProductImage, 
          as: 'image',
          required: false
        },
        { 
          model: User, 
          as: 'creator', 
          attributes: ['id', 'username'],
          required: false
        }
      ]
    });
    
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// ✅ Crear un nuevo producto con validaciones mejoradas
exports.create = async (req, res) => {
  try {
    console.log('📥 === CREAR PRODUCTO ===');
    console.log('📥 Body recibido:', JSON.stringify(req.body, null, 2));
    console.log('👤 Usuario del middleware:', JSON.stringify(req.user, null, 2));

    const {
      name,
      price,
      created_by,
      category_id,
      subcategory_id
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

    // ✅ Validar que la categoría existe si se proporciona
    if (category_id) {
      const categoryExists = await Category.findByPk(category_id);
      if (!categoryExists) {
        return res.status(400).json({ error: 'La categoría especificada no existe' });
      }
      console.log('✅ Categoría válida:', categoryExists.name);
    }

    // ✅ Validar que la subcategoría existe y pertenece a la categoría si se proporciona
    if (subcategory_id) {
      const subcategoryExists = await Subcategory.findByPk(subcategory_id);
      if (!subcategoryExists) {
        return res.status(400).json({ error: 'La subcategoría especificada no existe' });
      }
      
      // Verificar que la subcategoría pertenece a la categoría especificada
      if (category_id && subcategoryExists.category_id !== category_id) {
        return res.status(400).json({ 
          error: 'La subcategoría no pertenece a la categoría especificada' 
        });
      }
      console.log('✅ Subcategoría válida:', subcategoryExists.name);
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
      category_id: category_id || null,
      subcategory_id: subcategory_id || null,
      product_image_id: req.body.product_image_id || null
    };

    console.log('📝 Datos preparados para crear:', productData);

    // Crear el producto
    const product = await Product.create(productData);
    
    console.log('✅ Producto creado exitosamente:', product.id);
    
    // Retornar el producto creado con relaciones
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        { 
          model: Category, 
          as: 'category',
          attributes: ['id', 'name'],
          required: false
        },
        { 
          model: Subcategory, 
          as: 'subcategory',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });
    
    res.status(201).json(createdProduct);
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

// ✅ Actualizar producto con validación y auditoría mejorada
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user?.id || req.body.updated_by || null;

    console.log('📝 === ACTUALIZAR PRODUCTO ===');
    console.log('📝 ID del producto:', id);
    console.log('📝 Datos a actualizar:', JSON.stringify(req.body, null, 2));

    const anterior = await Product.findByPk(id);
    if (!anterior) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const { plu_code, price, category_id, subcategory_id } = req.body;

    // Validaciones
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

    // ✅ Validar que la categoría existe si se proporciona
    if (category_id) {
      const categoryExists = await Category.findByPk(category_id);
      if (!categoryExists) {
        return res.status(400).json({ error: 'La categoría especificada no existe' });
      }
      console.log('✅ Categoría válida para actualización:', categoryExists.name);
    }

    // ✅ Validar que la subcategoría existe y pertenece a la categoría si se proporciona
    if (subcategory_id) {
      const subcategoryExists = await Subcategory.findByPk(subcategory_id);
      if (!subcategoryExists) {
        return res.status(400).json({ error: 'La subcategoría especificada no existe' });
      }
      
      // Obtener la categoría final (la nueva si se especifica, o la actual)
      const finalCategoryId = category_id || anterior.category_id;
      
      // Verificar que la subcategoría pertenece a la categoría
      if (finalCategoryId && subcategoryExists.category_id !== finalCategoryId) {
        return res.status(400).json({ 
          error: 'La subcategoría no pertenece a la categoría especificada' 
        });
      }
      console.log('✅ Subcategoría válida para actualización:', subcategoryExists.name);
    }

    // Si se quita la categoría, también se debe quitar la subcategoría
    if (category_id === null || category_id === '') {
      req.body.subcategory_id = null;
    }

    // Preparar datos de actualización
    const updateData = { ...req.body };
    delete updateData.product_image_id; // No actualizar imagen desde aquí
    updateData.updated_at = new Date();

    console.log('📝 Datos finales para actualizar:', updateData);

    // Actualizar producto
    const [updatedCount] = await Product.update(updateData, { where: { id } });

    if (updatedCount === 0) {
      return res.status(400).json({ error: 'No se realizaron cambios' });
    }

    // Obtener el producto actualizado con relaciones
    const actualizado = await Product.findByPk(id, {
      include: [
        { 
          model: Category, 
          as: 'category',
          attributes: ['id', 'name'],
          required: false
        },
        { 
          model: Subcategory, 
          as: 'subcategory',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    console.log('✅ Producto actualizado exitosamente');
    res.status(200).json(actualizado);
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    
    // Manejar errores específicos
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        error: 'Error de referencia: verifique que las categorías existan',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Error al actualizar producto',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
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