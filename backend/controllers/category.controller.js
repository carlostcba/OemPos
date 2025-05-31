// backend/controllers/category.controller.js
const { Category, Subcategory, Product } = require('../models');
const logger = require('../utils/logger');

// Obtener todas las categorías
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Subcategory,
          as: 'subcategories',
          attributes: ['id', 'name']
        }
      ],
      order: [['name', 'ASC']]
    });
    
    logger.info('Categorías obtenidas exitosamente', { count: categories.length });
    res.json(categories);
  } catch (error) {
    logger.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// Obtener una categoría por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByPk(id, {
      include: [
        {
          model: Subcategory,
          as: 'subcategories',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json(category);
  } catch (error) {
    logger.error('Error al obtener categoría:', error);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
};

// Crear nueva categoría
exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }
    
    // Verificar que no exista una categoría con el mismo nombre
    const existingCategory = await Category.findOne({
      where: { name: name.trim() }
    });
    
    if (existingCategory) {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    
    const category = await Category.create({
      name: name.trim()
    });
    
    logger.info('Categoría creada exitosamente', { id: category.id, name: category.name });
    res.status(201).json(category);
  } catch (error) {
    logger.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

// Actualizar categoría
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }
    
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    // Verificar que no exista otra categoría con el mismo nombre
    const existingCategory = await Category.findOne({
      where: { 
        name: name.trim(),
        id: { [Op.ne]: id }
      }
    });
    
    if (existingCategory) {
      return res.status(409).json({ error: 'Ya existe otra categoría con ese nombre' });
    }
    
    await category.update({ name: name.trim() });
    
    logger.info('Categoría actualizada exitosamente', { id, name: name.trim() });
    res.json(category);
  } catch (error) {
    logger.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

// Eliminar categoría
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si la categoría tiene productos asociados
    const productCount = await Product.count({
      where: { category_id: id }
    });
    
    if (productCount > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar la categoría porque tiene ${productCount} producto(s) asociado(s)` 
      });
    }
    
    // Verificar si la categoría tiene subcategorías
    const subcategoryCount = await Subcategory.count({
      where: { category_id: id }
    });
    
    if (subcategoryCount > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar la categoría porque tiene ${subcategoryCount} subcategoría(s) asociada(s)` 
      });
    }
    
    const deletedCount = await Category.destroy({
      where: { id }
    });
    
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    logger.info('Categoría eliminada exitosamente', { id });
    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    logger.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};