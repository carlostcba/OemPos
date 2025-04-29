// backend/controllers/coupon.controller.js
const { Coupon, Category } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los cupones
exports.getAll = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      include: [
        { 
          model: Category, 
          as: 'category',
          attributes: ['id', 'name'],
          required: false 
        }
      ]
    });
    res.json(coupons);
  } catch (error) {
    console.error('❌ Error al obtener cupones:', error);
    res.status(500).json({ error: 'Error al obtener cupones' });
  }
};

// Obtener un cupón por código
exports.getByCode = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ 
      where: { 
        code: req.params.code,
        is_active: true,
        valid_from: { [Op.lte]: new Date() },
        [Op.or]: [
          { valid_to: null },
          { valid_to: { [Op.gte]: new Date() }}
        ],
        [Op.or]: [
          { max_uses: null },
          { usage_count: { [Op.lt]: sequelize.col('max_uses') }}
        ]
      }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Cupón no encontrado o no válido' });
    }

    res.json(coupon);
  } catch (error) {
    console.error('❌ Error al buscar cupón:', error);
    res.status(500).json({ error: 'Error al buscar cupón' });
  }
};

// Crear un nuevo cupón
exports.create = async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      created_by
    } = req.body;

    // Validación básica
    if (!code || !discount_type || !discount_value || !created_by) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Verificar si ya existe el código
    const existing = await Coupon.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({ error: 'El código de cupón ya existe' });
    }

    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    console.error('❌ Error al crear cupón:', error);
    res.status(500).json({ error: 'Error al crear cupón' });
  }
};

// Actualizar un cupón existente
exports.update = async (req, res) => {
  try {
    const [updated] = await Coupon.update(req.body, { 
      where: { id: req.params.id } 
    });

    if (updated === 0) {
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }

    const updatedCoupon = await Coupon.findByPk(req.params.id);
    res.json(updatedCoupon);
  } catch (error) {
    console.error('❌ Error al actualizar cupón:', error);
    res.status(500).json({ error: 'Error al actualizar cupón' });
  }
};

// Eliminar un cupón
exports.remove = async (req, res) => {
  try {
    const deleted = await Coupon.destroy({ where: { id: req.params.id } });
    
    if (!deleted) {
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    
    res.status(200).json({ message: 'Cupón eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error al eliminar cupón:', error);
    res.status(500).json({ error: 'Error al eliminar cupón' });
  }
};

// Verificar validez de un cupón
exports.verify = async (req, res) => {
  try {
    const { code, total_amount } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Falta el código de cupón' });
    }
    
    const coupon = await Coupon.findOne({ 
      where: { 
        code,
        is_active: true,
        valid_from: { [Op.lte]: new Date() },
        [Op.or]: [
          { valid_to: null },
          { valid_to: { [Op.gte]: new Date() }}
        ],
        [Op.or]: [
          { max_uses: null },
          { usage_count: { [Op.lt]: sequelize.col('max_uses') }}
        ]
      }
    });
    
    if (!coupon) {
      return res.status(404).json({ error: 'Cupón no válido o expirado' });
    }
    
    // Verificar monto mínimo si corresponde
    if (total_amount && coupon.min_purchase_amount > 0 && total_amount < coupon.min_purchase_amount) {
      return res.status(400).json({ 
        error: 'El monto total no alcanza el mínimo requerido', 
        minAmount: coupon.min_purchase_amount 
      });
    }
    
    // Calcular el descuento según el tipo
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = total_amount ? (total_amount * coupon.discount_value / 100) : null;
    } else {
      discountAmount = coupon.discount_value;
    }
    
    res.json({
      valid: true,
      coupon,
      discountAmount
    });
  } catch (error) {
    console.error('❌ Error al verificar cupón:', error);
    res.status(500).json({ error: 'Error al verificar cupón' });
  }
};

// Incrementar el contador de usos de un cupón
exports.incrementUsage = async (req, res) => {
  try {
    const { code } = req.params;
    
    const coupon = await Coupon.findOne({ where: { code } });
    
    if (!coupon) {
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    
    await Coupon.update(
      { usage_count: sequelize.literal('usage_count + 1') },
      { where: { code } }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error al incrementar uso de cupón:', error);
    res.status(500).json({ error: 'Error al incrementar uso de cupón' });
  }
};