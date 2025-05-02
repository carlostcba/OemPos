// backend/controllers/dashboard.controller.js

const { Order, OrderItem, Product, Category, CashRegister, CashTransaction, Receipt } = require('../models');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Obtener resumen general del dashboard
exports.getSummary = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Ventas del día
    const todaySales = await Order.sum('total_amount', {
      where: {
        created_at: {
          [Op.between]: [startOfDay, endOfDay]
        },
        status: {
          [Op.in]: ['confirmado', 'entregado']
        }
      }
    }) || 0;
    
    // Ventas de la semana
    const weeklySales = await Order.sum('total_amount', {
      where: {
        created_at: {
          [Op.between]: [startOfWeek, endOfDay]
        },
        status: {
          [Op.in]: ['confirmado', 'entregado']
        }
      }
    }) || 0;
    
    // Ventas del mes
    const monthlySales = await Order.sum('total_amount', {
      where: {
        created_at: {
          [Op.between]: [startOfMonth, endOfDay]
        },
        status: {
          [Op.in]: ['confirmado', 'entregado']
        }
      }
    }) || 0;
    
    // Cantidad de órdenes del día
    const todayOrderCount = await Order.count({
      where: {
        created_at: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });
    
    // Cantidad de órdenes de la semana
    const weeklyOrderCount = await Order.count({
      where: {
        created_at: {
          [Op.between]: [startOfWeek, endOfDay]
        }
      }
    });
    
    // Productos con stock bajo
    const lowStockProducts = await Product.count({
      where: {
        stock: { [Op.lt]: 5 },
        track_stock: true,
        is_active: true
      }
    });
    
    // Ticket promedio del día
    const averageTicket = todayOrderCount > 0 ? todaySales / todayOrderCount : 0;
    
    // Estado de caja actual
    const currentCashRegister = await CashRegister.findOne({
      where: {
        status: 'open'
      },
      include: [{
        model: CashTransaction,
        as: 'transactions'
      }],
      order: [['opened_at', 'DESC']]
    });
    
    let cashRegisterBalance = null;
    if (currentCashRegister) {
      // Calcular saldo actual
      let balance = parseFloat(currentCashRegister.opening_amount);
      
      if (currentCashRegister.transactions && currentCashRegister.transactions.length > 0) {
        currentCashRegister.transactions.forEach(tx => {
          if (['income', 'deposit'].includes(tx.type)) {
            balance += parseFloat(tx.amount);
          } else if (['expense', 'withdrawal', 'adjustment'].includes(tx.type)) {
            balance -= parseFloat(tx.amount);
          }
        });
      }
      
      cashRegisterBalance = {
        id: currentCashRegister.id,
        opened_at: currentCashRegister.opened_at,
        opening_amount: parseFloat(currentCashRegister.opening_amount),
        current_balance: balance,
        transaction_count: currentCashRegister.transactions.length
      };
    }
    
    res.json({
      sales: {
        today: parseFloat(todaySales),
        week: parseFloat(weeklySales),
        month: parseFloat(monthlySales)
      },
      orders: {
        today: todayOrderCount,
        week: weeklyOrderCount,
        average_ticket: Math.round(averageTicket * 100) / 100
      },
      inventory: {
        low_stock_count: lowStockProducts
      },
      cash_register: cashRegisterBalance,
      generated_at: new Date()
    });
    
  } catch (error) {
    console.error('❌ Error al obtener resumen del dashboard:', error);
    res.status(500).json({ error: 'Error al obtener resumen del dashboard' });
  }
};

// Obtener ventas por categoría
exports.getSalesByCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Construir condiciones de fecha
    const dateCondition = {};
    if (startDate && endDate) {
      dateCondition.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      dateCondition.created_at = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      dateCondition.created_at = {
        [Op.lte]: new Date(endDate)
      };
    } else {
      // Por defecto, últimos 30 días
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      dateCondition.created_at = {
        [Op.between]: [thirtyDaysAgo, today]
      };
    }
    
    // Consulta para ventas por categoría
    const salesByCategory = await OrderItem.findAll({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('subtotal')), 'total_amount']
      ],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: [],
          where: {
            ...dateCondition,
            status: {
              [Op.in]: ['confirmado', 'entregado']
            }
          },
          required: true
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name']
            }
          ],
          required: true
        }
      ],
      group: ['product.category.id', 'product.category.name'],
      raw: true
    });
    
    // Formatear resultados
    const result = salesByCategory.map(item => ({
      category_id: item['product.category.id'],
      category_name: item['product.category.name'],
      total_amount: parseFloat(item.total_amount)
    }));
    
    // Ordenar por monto total descendente
    result.sort((a, b) => b.total_amount - a.total_amount);
    
    res.json({
      period: {
        start_date: startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30)),
        end_date: endDate ? new Date(endDate) : new Date()
      },
      data: result,
      generated_at: new Date()
    });
    
  } catch (error) {
    console.error('❌ Error al obtener ventas por categoría:', error);
    res.status(500).json({ error: 'Error al obtener ventas por categoría' });
  }
};

// Obtener ventas diarias
exports.getDailySales = async (req, res) => {
  try {
    // Obtener datos de los últimos 30 días por defecto
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : thirtyDaysAgo;
    const end = endDate ? new Date(endDate) : today;
    
    // Consulta para ventas diarias
    const dailySales = await Order.findAll({
      attributes: [
        [Sequelize.fn('CONVERT', Sequelize.literal('DATE'), Sequelize.col('created_at')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'order_count'],
        [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'total_amount']
      ],
      where: {
        created_at: {
          [Op.between]: [start, end]
        },
        status: {
          [Op.in]: ['confirmado', 'entregado']
        }
      },
      group: [Sequelize.fn('CONVERT', Sequelize.literal('DATE'), Sequelize.col('created_at'))],
      order: [Sequelize.fn('CONVERT', Sequelize.literal('DATE'), Sequelize.col('created_at'))],
      raw: true
    });
    
    // Formatear resultados y asegurar que existan datos para todos los días
    const dateRange = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      dateRange.push(new Date(currentDate).toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const formattedData = dateRange.map(date => {
      const saleData = dailySales.find(item => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        return itemDate === date;
      });
      
      return {
        date,
        order_count: saleData ? parseInt(saleData.order_count) : 0,
        total_amount: saleData ? parseFloat(saleData.total_amount) : 0
      };
    });
    
    res.json({
      period: {
        start_date: start,
        end_date: end
      },
      data: formattedData,
      summary: {
        total_orders: formattedData.reduce((sum, day) => sum + day.order_count, 0),
        total_amount: formattedData.reduce((sum, day) => sum + day.total_amount, 0),
        avg_daily_amount: formattedData.reduce((sum, day) => sum + day.total_amount, 0) / formattedData.length
      },
      generated_at: new Date()
    });
    
  } catch (error) {
    console.error('❌ Error al obtener ventas diarias:', error);
    res.status(500).json({ error: 'Error al obtener ventas diarias' });
  }
};

// Obtener top productos
exports.getTopProducts = async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;
    const productLimit = parseInt(limit) || 10;
    
    // Construir condiciones de fecha
    const dateCondition = {};
    if (startDate && endDate) {
      dateCondition.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      dateCondition.created_at = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      dateCondition.created_at = {
        [Op.lte]: new Date(endDate)
      };
    } else {
      // Por defecto, últimos 30 días
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      dateCondition.created_at = {
        [Op.between]: [thirtyDaysAgo, today]
      };
    }
    
    // Consulta para top productos
    const topProducts = await OrderItem.findAll({
      attributes: [
        'product_id',
        'product_name',
        [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total_quantity'],
        [Sequelize.fn('SUM', Sequelize.col('subtotal')), 'total_amount'],
        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('order_id'))), 'order_count']
      ],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: [],
          where: {
            ...dateCondition,
            status: {
              [Op.in]: ['confirmado', 'entregado']
            }
          },
          required: true
        }
      ],
      group: ['product_id', 'product_name'],
      order: [[Sequelize.literal('total_amount'), 'DESC']],
      limit: productLimit,
      raw: true
    });
    
    // Formatear resultados
    const formattedProducts = topProducts.map(product => ({
      product_id: product.product_id,
      product_name: product.product_name,
      total_quantity: parseFloat(product.total_quantity),
      total_amount: parseFloat(product.total_amount),
      order_count: parseInt(product.order_count)
    }));
    
    res.json({
      period: {
        start_date: startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30)),
        end_date: endDate ? new Date(endDate) : new Date()
      },
      data: formattedProducts,
      generated_at: new Date()
    });
    
  } catch (error) {
    console.error('❌ Error al obtener top productos:', error);
    res.status(500).json({ error: 'Error al obtener top productos' });
  }
};

// Obtener estadísticas por método de pago
exports.getPaymentMethodStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Construir condiciones de fecha
    const dateCondition = {};
    if (startDate && endDate) {
      dateCondition.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      dateCondition.created_at = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      dateCondition.created_at = {
        [Op.lte]: new Date(endDate)
      };
    } else {
      // Por defecto, últimos 30 días
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      dateCondition.created_at = {
        [Op.between]: [thirtyDaysAgo, today]
      };
    }
    
    // Consulta para estadísticas por método de pago
    const paymentStats = await Receipt.findAll({
      attributes: [
        'payment_method',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'receipt_count'],
        [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'total_amount']
      ],
      where: {
        ...dateCondition,
        is_voided: false
      },
      group: ['payment_method'],
      raw: true
    });
    
    // Formatear resultados
    const formattedStats = paymentStats.map(stat => ({
      payment_method: stat.payment_method,
      receipt_count: parseInt(stat.receipt_count),
      total_amount: parseFloat(stat.total_amount),
      percentage: 0 // Calcular después
    }));
    
    // Calcular porcentajes
    const totalAmount = formattedStats.reduce((sum, stat) => sum + stat.total_amount, 0);
    formattedStats.forEach(stat => {
      stat.percentage = Math.round((stat.total_amount / totalAmount) * 100 * 100) / 100;
    });
    
    // Ordenar por monto total descendente
    formattedStats.sort((a, b) => b.total_amount - a.total_amount);
    
    res.json({
      period: {
        start_date: startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30)),
        end_date: endDate ? new Date(endDate) : new Date()
      },
      data: formattedStats,
      summary: {
        total_amount: totalAmount,
        total_receipts: formattedStats.reduce((sum, stat) => sum + stat.receipt_count, 0)
      },
      generated_at: new Date()
    });
    
  } catch (error) {
    console.error('❌ Error al obtener estadísticas por método de pago:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas por método de pago' });
  }
};

// Obtener estadísticas de inventario
exports.getInventoryStats = async (req, res) => {
  try {
    // Consulta para estadísticas de inventario
    const inventoryStats = await Product.findAll({
      attributes: [
        [Sequelize.literal('CASE WHEN track_stock = 1 THEN \'tracked\' ELSE \'untracked\' END'), 'tracking_type'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'product_count'],
        [Sequelize.fn('SUM', Sequelize.col('stock')), 'total_stock'],
        [Sequelize.literal('SUM(price * stock)'), 'total_value']
      ],
      where: {
        is_active: true
      },
      group: ['track_stock'],
      raw: true
    });
    
    // Productos con stock bajo (menos de 5 unidades)
    const lowStockProducts = await Product.findAll({
      attributes: ['id', 'name', 'plu_code', 'stock', 'price'],
      where: {
        stock: { [Op.lt]: 5 },
        stock: { [Op.gt]: 0 },
        track_stock: true,
        is_active: true
      },
      order: [['stock', 'ASC']],
      limit: 10,
      raw: true
    });
    
    // Productos sin stock
    const outOfStockProducts = await Product.count({
      where: {
        stock: 0,
        track_stock: true,
        is_active: true
      }
    });
    
    // Formatear resultados
    const stats = {
      tracked: {
        product_count: 0,
        total_stock: 0,
        total_value: 0
      },
      untracked: {
        product_count: 0,
        total_stock: 0,
        total_value: 0
      }
    };
    
    inventoryStats.forEach(stat => {
      const type = stat.tracking_type;
      stats[type] = {
        product_count: parseInt(stat.product_count),
        total_stock: parseFloat(stat.total_stock || 0),
        total_value: parseFloat(stat.total_value || 0)
      };
    });
    
    // Formatear productos con stock bajo
    const formattedLowStock = lowStockProducts.map(product => ({
      id: product.id,
      name: product.name,
      plu_code: product.plu_code,
      stock: parseFloat(product.stock),
      price: parseFloat(product.price),
      value: parseFloat(product.stock) * parseFloat(product.price)
    }));
    
    res.json({
      summary: {
        tracked_products: stats.tracked.product_count,
        untracked_products: stats.untracked.product_count,
        total_products: stats.tracked.product_count + stats.untracked.product_count,
        total_stock_value: stats.tracked.total_value,
        low_stock_count: formattedLowStock.length,
        out_of_stock_count: outOfStockProducts
      },
      low_stock_products: formattedLowStock,
      generated_at: new Date()
    });
    
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de inventario:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de inventario' });
  }
};

module.exports = exports;