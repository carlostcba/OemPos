// backend/controllers/subcategory.controller.js
const { Subcategory, Category, Product } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Obtener todas las subcategorías
exports.getAll = async (req, res) => {
  try {
    const { category_id } = req.query;
    
    const where = {};
    if (category_id) {
      where.category_id = category_id;
    }
    
    const subcategories = await Subcategory.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['name', 'ASC']]
    });
    
    logger.info('Subcategorías obtenidas exitosamente', { 
      count: subcategories.length,
      category_id: category_id || 'all'
    });
    res.json(subcategories);
  } catch (error) {
    logger.error('Error al obtener subcategorías:', error);
    res.status(500).json({ error: 'Error al obtener subcategorías' });
  }
};

// Obtener una subcategoría por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subcategory = await Subcategory.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategoría no encontrada' });
    }
    
    res.json(subcategory);
  } catch (error) {
    logger.error('Error al obtener subcategoría:', error);
    res.status(500).json({ error: 'Error al obtener subcategoría' });
  }
};

// Crear nueva subcategoría
exports.create = async (req, res) => {
  try {
    const { name, category_id } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la subcategoría es requerido' });
    }
    
    if (!category_id) {
      return res.status(400).json({ error: 'La categoría es requerida' });
    }
    
    // Verificar que la categoría existe
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({ error: 'La categoría especificada no existe' });
    }
    
    // Verificar que no exista una subcategoría con el mismo nombre en la misma categoría
    const existingSubcategory = await Subcategory.findOne({
      where: { 
        name: name.trim(),
        category_id
      }
    });
    
    if (existingSubcategory) {
      return res.status(409).json({ error: 'Ya existe una subcategoría con ese nombre en esta categoría' });
    }
    
    const subcategory = await Subcategory.create({
      name: name.trim(),
      category_id
    });
    
    // Obtener la subcategoría creada con la relación de categoría
    const createdSubcategory = await Subcategory.findByPk(subcategory.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });
    
    logger.info('Subcategoría creada exitosamente', { 
      id: subcategory.id, 
      name: subcategory.name,
      category_id
    });
    res.status(201).json(createdSubcategory);
  } catch (error) {
    logger.error('Error al crear subcategoría:', error);
    res.status(500).json({ error: 'Error al crear subcategoría' });
  }
};

// Actualizar subcategoría
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la subcategoría es requerido' });
    }
    
    const subcategory = await Subcategory.findByPk(id);
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategoría no encontrada' });
    }
    
    // Si se cambió la categoría, verificar que existe
    if (category_id && category_id !== subcategory.category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(404).json({ error: 'La categoría especificada no existe' });
      }
    }
    
    // Verificar que no exista otra subcategoría con el mismo nombre en la misma categoría
    const existingSubcategory = await Subcategory.findOne({
      where: { 
        name: name.trim(),
        category_id: category_id || subcategory.category_id,
        id: { [Op.ne]: id }
      }
    });
    
    if (existingSubcategory) {
      return res.status(409).json({ error: 'Ya existe otra subcategoría con ese nombre en esta categoría' });
    }
    
    const updateData = { name: name.trim() };
    if (category_id) {
      updateData.category_id = category_id;
    }
    
    await subcategory.update(updateData);
    
    // Obtener la subcategoría actualizada con la relación de categoría
    const updatedSubcategory = await Subcategory.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });
    
    logger.info('Subcategoría actualizada exitosamente', { id, name: name.trim() });
    res.json(updatedSubcategory);
  } catch (error) {
    logger.error('Error al actualizar subcategoría:', error);
    res.status(500).json({ error: 'Error al actualizar subcategoría' });
  }
};

// Eliminar subcategoría
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si la subcategoría tiene productos asociados
    const productCount = await Product.count({
      where: { subcategory_id: id }
    });
    
    if (productCount > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar la subcategoría porque tiene ${productCount} producto(s) asociado(s)` 
      });
    }
    
    const deletedCount = await Subcategory.destroy({
      where: { id }
    });
    
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Subcategoría no encontrada' });
    }
    
    logger.info('Subcategoría eliminada exitosamente', { id });
    res.json({ message: 'Subcategoría eliminada exitosamente' });
  } catch (error) {
    logger.error('Error al eliminar subcategoría:', error);
    res.status(500).json({ error: 'Error al eliminar subcategoría' });
  }
};