// backend/controllers/receipt.controller.js
const { Receipt, Order, OrderItem, Product, User } = require('../models');
const { Op, Sequelize } = require('sequelize');

// Generar un nuevo comprobante
exports.generateReceipt = async (req, res) => {
  try {
    const { order_id, payment_method, is_partial, notes } = req.body;

    // Verificar si la orden existe
    const order = await Order.findByPk(order_id, {
      include: [
        { model: OrderItem, as: 'items' }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Verificar si ya existe un comprobante para esta orden
    const existingReceipt = await Receipt.findOne({
      where: { 
        order_id,
        is_voided: false
      }
    });

    if (existingReceipt && !is_partial) {
      return res.status(400).json({ 
        error: 'Ya existe un comprobante para esta orden',
        receipt_id: existingReceipt.id 
      });
    }

    // Generar número único de comprobante (formato: YYYYMMDD-XXXX)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Buscar el último número de comprobante del día
    const lastReceipt = await Receipt.findOne({
      where: {
        receipt_number: {
          [Op.like]: `${dateStr}-%`
        }
      },
      order: [['receipt_number', 'DESC']]
    });

    let sequenceNumber = 1;
    if (lastReceipt) {
      const lastSeq = parseInt(lastReceipt.receipt_number.split('-')[1]);
      sequenceNumber = lastSeq + 1;
    }

    const receiptNumber = `${dateStr}-${String(sequenceNumber).padStart(4, '0')}`;

    // Crear comprobante
    const receipt = await Receipt.create({
      order_id,
      receipt_number: receiptNumber,
      total_amount: order.total_amount,
      payment_method: payment_method || order.payment_method,
      is_partial: is_partial || false,
      customer_name: order.customer_name,
      issued_by: req.user.id,
      issued_at: new Date(),
      notes
    });

    // Si el comprobante es completo, actualizar estado de la orden
    if (!is_partial) {
      await order.update({
        status: 'entregado',
        updated_at: new Date()
      });
    }

    // Recuperar comprobante con relaciones
    const createdReceipt = await Receipt.findByPk(receipt.id, {
      include: [
        { 
          model: Order, 
          as: 'order',
          include: [
            { model: OrderItem, as: 'items' }
          ]
        },
        { model: User, as: 'issuer', attributes: ['id', 'username'] }
      ]
    });

    res.status(201).json(createdReceipt);
  } catch (error) {
    console.error('❌ Error al generar comprobante:', error);
    res.status(500).json({ error: 'Error al generar comprobante' });
  }
};

// Obtener comprobantes
exports.getAllReceipts = async (req, res) => {
  try {
    const { startDate, endDate, order_id } = req.query;

    // Construir condiciones de filtro
    const where = {};
    
    if (order_id) {
      where.order_id = order_id;
    }
    
    if (startDate && endDate) {
      where.issued_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.issued_at = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.issued_at = {
        [Op.lte]: new Date(endDate)
      };
    }

    const receipts = await Receipt.findAll({
      where,
      include: [
        { model: User, as: 'issuer', attributes: ['id', 'username'] },
        { 
          model: Order, 
          as: 'order',
          attributes: ['id', 'order_code', 'type', 'customer_name', 'total_amount']
        }
      ],
      order: [['issued_at', 'DESC']]
    });

    res.json(receipts);
  } catch (error) {
    console.error('❌ Error al obtener comprobantes:', error);
    res.status(500).json({ error: 'Error al obtener comprobantes' });
  }
};

// Obtener un comprobante por ID
exports.getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await Receipt.findByPk(id, {
      include: [
        { model: User, as: 'issuer', attributes: ['id', 'username'] },
        { model: User, as: 'voider', attributes: ['id', 'username'] },
        { 
          model: Order, 
          as: 'order',
          include: [
            { model: OrderItem, as: 'items' }
          ]
        }
      ]
    });

    if (!receipt) {
      return res.status(404).json({ error: 'Comprobante no encontrado' });
    }

    res.json(receipt);
  } catch (error) {
    console.error('❌ Error al obtener comprobante:', error);
    res.status(500).json({ error: 'Error al obtener comprobante' });
  }
};

// Anular un comprobante
exports.voidReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Se requiere un motivo para anular el comprobante' });
    }

    const receipt = await Receipt.findByPk(id);

    if (!receipt) {
      return res.status(404).json({ error: 'Comprobante no encontrado' });
    }

    if (receipt.is_voided) {
      return res.status(400).json({ error: 'Este comprobante ya fue anulado' });
    }

    // Anular comprobante
    await receipt.update({
      is_voided: true,
      voided_at: new Date(),
      voided_by: req.user.id,
      voided_reason: reason
    });

    // Si no hay otros comprobantes válidos, actualizar estado de la orden
    const validReceipts = await Receipt.count({
      where: {
        order_id: receipt.order_id,
        is_voided: false
      }
    });

    if (validReceipts === 0) {
      await Order.update(
        { status: 'pendiente' },
        { where: { id: receipt.order_id } }
      );
    }

    // Recuperar comprobante con relaciones
    const voidedReceipt = await Receipt.findByPk(id, {
      include: [
        { model: User, as: 'issuer', attributes: ['id', 'username'] },
        { model: User, as: 'voider', attributes: ['id', 'username'] },
        { model: Order, as: 'order' }
      ]
    });

    res.json(voidedReceipt);
  } catch (error) {
    console.error('❌ Error al anular comprobante:', error);
    res.status(500).json({ error: 'Error al anular comprobante' });
  }
};

// Generar reporte de comprobantes
exports.generateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Se requieren fechas de inicio y fin para generar el reporte' 
      });
    }

    // Buscar comprobantes en el rango de fechas
    const receipts = await Receipt.findAll({
      where: {
        is_voided: false,
        issued_at: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      include: [
        { model: Order, as: 'order' }
      ]
    });

    // Calcular estadísticas
    const stats = {
      total_count: receipts.length,
      total_amount: 0,
      by_payment_method: {
        efectivo: { count: 0, amount: 0 },
        tarjeta: { count: 0, amount: 0 },
        transferencia: { count: 0, amount: 0 },
        mixto: { count: 0, amount: 0 },
        otros: { count: 0, amount: 0 }
      },
      by_order_type: {
        orden: { count: 0, amount: 0 },
        pedido: { count: 0, amount: 0 },
        delivery: { count: 0, amount: 0 },
        salon: { count: 0, amount: 0 }
      },
      by_date: {}
    };

    // Procesar cada comprobante
    receipts.forEach(receipt => {
      const amount = parseFloat(receipt.total_amount);
      stats.total_amount += amount;

      // Por método de pago
      const paymentMethod = receipt.payment_method?.toLowerCase() || 'otros';
      if (stats.by_payment_method[paymentMethod]) {
        stats.by_payment_method[paymentMethod].count++;
        stats.by_payment_method[paymentMethod].amount += amount;
      } else {
        stats.by_payment_method.otros.count++;
        stats.by_payment_method.otros.amount += amount;
      }

      // Por tipo de orden
      const orderType = receipt.order?.type?.toLowerCase() || 'orden';
      if (stats.by_order_type[orderType]) {
        stats.by_order_type[orderType].count++;
        stats.by_order_type[orderType].amount += amount;
      }

      // Por fecha
      const dateStr = receipt.issued_at.toISOString().split('T')[0];
      if (!stats.by_date[dateStr]) {
        stats.by_date[dateStr] = { count: 0, amount: 0 };
      }
      stats.by_date[dateStr].count++;
      stats.by_date[dateStr].amount += amount;
    });

    // Preparar informe
    const report = {
      period: {
        start_date: new Date(startDate),
        end_date: new Date(endDate)
      },
      stats,
      generated_at: new Date()
    };

    res.json(report);
  } catch (error) {
    console.error('❌ Error al generar reporte:', error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};