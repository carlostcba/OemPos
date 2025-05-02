// backend/scripts/validateData.js

const { sequelize, Product, Order, OrderItem } = require('../models');
const logger = require('../utils/logger');

async function validateData() {
  logger.info('Iniciando validación de datos...');
  
  try {
    // 1. Verificar integridad de datos de productos
    logger.info('Verificando productos...');
    
    // Encontrar productos con precios negativos o cero
    const invalidPriceProducts = await Product.findAll({
      where: {
        [sequelize.or]: [
          { price: { [sequelize.lte]: 0 } },
          { price: null }
        ]
      },
      attributes: ['id', 'name', 'price']
    });
    
    if (invalidPriceProducts.length > 0) {
      logger.warn('⚠️ Se encontraron productos con precios inválidos:', {
        count: invalidPriceProducts.length,
        products: invalidPriceProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price
        }))
      });
    } else {
      logger.info('✅ No se encontraron productos con precios inválidos');
    }
    
    // 2. Verificar integridad de órdenes
    logger.info('Verificando órdenes...');
    
    // Encontrar órdenes sin ítems
    const ordersWithoutItems = await Order.findAll({
      attributes: ['id', 'order_code', 'created_at'],
      include: [{
        model: OrderItem,
        as: 'items',
        required: false
      }],
      having: sequelize.literal('COUNT(items.id) = 0'),
      group: ['Order.id']
    });
    
    if (ordersWithoutItems.length > 0) {
      logger.warn('⚠️ Se encontraron órdenes sin ítems:', {
        count: ordersWithoutItems.length,
        orders: ordersWithoutItems.map(o => ({
          id: o.id,
          order_code: o.order_code,
          created_at: o.created_at
        }))
      });
    } else {
      logger.info('✅ No se encontraron órdenes sin ítems');
    }
    
    // 3. Verificar totales de órdenes
    logger.info('Verificando totales de órdenes...');
    
    const ordersWithIncorrectTotals = [];
    const orders = await Order.findAll({
      include: [{
        model: OrderItem,
        as: 'items'
      }]
    });
    
    for (const order of orders) {
      let calculatedTotal = 0;
      
      if (order.items && order.items.length > 0) {
        calculatedTotal = order.items.reduce((sum, item) => {
          return sum + parseFloat(item.subtotal || 0);
        }, 0);
      }
      
      const orderTotal = parseFloat(order.total_amount || 0);
      
      // Permitir una pequeña diferencia por redondeo
      if (Math.abs(calculatedTotal - orderTotal) > 0.1) {
        ordersWithIncorrectTotals.push({
          id: order.id,
          order_code: order.order_code,
          stored_total: orderTotal,
          calculated_total: calculatedTotal,
          difference: calculatedTotal - orderTotal
        });
      }
    }
    
    if (ordersWithIncorrectTotals.length > 0) {
      logger.warn('⚠️ Se encontraron órdenes con totales incorrectos:', {
        count: ordersWithIncorrectTotals.length,
        orders: ordersWithIncorrectTotals
      });
    } else {
      logger.info('✅ No se encontraron órdenes con totales incorrectos');
    }
    
    logger.info('Validación de datos completada');
    
  } catch (error) {
    logger.error('❌ Error durante la validación de datos:', {
      error: error.message,
      stack: error.stack
    });
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  validateData()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error en script de validación:', err);
      process.exit(1);
    });
}

module.exports = validateData;