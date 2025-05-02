// backend/controllers/cashRegister.controller.js

const { CashRegister, CashTransaction, Order, User } = require('../models');
const { Op } = require('sequelize');

// Abrir una nueva caja
exports.openRegister = async (req, res) => {
  try {
    const { opening_amount, opening_notes } = req.body;
    const opened_by = req.user.id;

    // Verificar si ya hay una caja abierta por el usuario
    const existingOpen = await CashRegister.findOne({
      where: {
        opened_by,
        status: 'open'
      }
    });

    if (existingOpen) {
      return res.status(400).json({
        error: 'Ya tienes una caja abierta. Debes cerrarla antes de abrir una nueva.'
      });
    }

    // Crear nueva caja
    const cashRegister = await CashRegister.create({
      opening_amount,
      opening_notes,
      opened_by,
      status: 'open',
      opened_at: new Date()
    });

    res.status(201).json(cashRegister);
  } catch (error) {
    console.error('❌ Error al abrir caja:', error);
    res.status(500).json({ error: 'Error al abrir caja' });
  }
};

// Cerrar una caja
exports.closeRegister = async (req, res) => {
  try {
    const { id } = req.params;
    const { closing_amount, closing_notes } = req.body;
    const closed_by = req.user.id;

    // Verificar si la caja existe y está abierta
    const cashRegister = await CashRegister.findOne({
      where: {
        id,
        status: 'open'
      }
    });

    if (!cashRegister) {
      return res.status(404).json({ 
        error: 'No se encontró una caja abierta con ese ID'
      });
    }

    // Calcular monto esperado (apertura + ingresos - egresos)
    const transactions = await CashTransaction.findAll({
      where: {
        cash_register_id: id,
        payment_method: 'efectivo'
      }
    });

    // Calcula el balance esperado
    let expectedAmount = parseFloat(cashRegister.opening_amount);
    
    for (const tx of transactions) {
      if (['income', 'deposit'].includes(tx.type)) {
        expectedAmount += parseFloat(tx.amount);
      } else if (['expense', 'withdrawal', 'adjustment'].includes(tx.type)) {
        expectedAmount -= parseFloat(tx.amount);
      }
    }

    // Calcular diferencia
    const differenceAmount = parseFloat(closing_amount) - expectedAmount;

    // Actualizar caja
    await cashRegister.update({
      closing_amount,
      closing_notes,
      closed_by,
      expected_amount: expectedAmount,
      difference_amount: differenceAmount,
      status: 'closed',
      closed_at: new Date()
    });

    // Obtener datos actualizados con relaciones
    const closedRegister = await CashRegister.findByPk(id, {
      include: [
        { model: User, as: 'opener', attributes: ['id', 'username'] },
        { model: User, as: 'closer', attributes: ['id', 'username'] }
      ]
    });

    res.json(closedRegister);
  } catch (error) {
    console.error('❌ Error al cerrar caja:', error);
    res.status(500).json({ error: 'Error al cerrar caja' });
  }
};

// Obtener cajas
exports.getAllRegisters = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    // Construir condiciones de filtro
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (startDate && endDate) {
      where.opened_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.opened_at = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.opened_at = {
        [Op.lte]: new Date(endDate)
      };
    }

    const cashRegisters = await CashRegister.findAll({
      where,
      include: [
        { model: User, as: 'opener', attributes: ['id', 'username'] },
        { model: User, as: 'closer', attributes: ['id', 'username'] }
      ],
      order: [['opened_at', 'DESC']]
    });

    res.json(cashRegisters);
  } catch (error) {
    console.error('❌ Error al obtener cajas:', error);
    res.status(500).json({ error: 'Error al obtener cajas' });
  }
};

// Obtener una caja por ID
exports.getRegisterById = async (req, res) => {
  try {
    const { id } = req.params;

    const cashRegister = await CashRegister.findByPk(id, {
      include: [
        { model: User, as: 'opener', attributes: ['id', 'username'] },
        { model: User, as: 'closer', attributes: ['id', 'username'] },
        { 
          model: CashTransaction, 
          as: 'transactions',
          include: [
            { model: User, as: 'creator', attributes: ['id', 'username'] },
            { model: Order, as: 'order', attributes: ['id', 'order_code', 'total_amount'] }
          ]
        },
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'order_code', 'type', 'customer_name', 'total_amount', 'created_at']
        }
      ]
    });

    if (!cashRegister) {
      return res.status(404).json({ error: 'Caja no encontrada' });
    }

    res.json(cashRegister);
  } catch (error) {
    console.error('❌ Error al obtener caja:', error);
    res.status(500).json({ error: 'Error al obtener caja' });
  }
};

// Obtener caja actual del usuario
exports.getCurrentRegister = async (req, res) => {
  try {
    const userId = req.user.id;

    const cashRegister = await CashRegister.findOne({
      where: {
        opened_by: userId,
        status: 'open'
      },
      include: [
        { 
          model: CashTransaction, 
          as: 'transactions',
          include: [
            { model: Order, as: 'order', attributes: ['id', 'order_code', 'total_amount'] }
          ]
        }
      ]
    });

    if (!cashRegister) {
      return res.status(404).json({ error: 'No tienes una caja abierta actualmente' });
    }

    // Calcular saldo actual
    let currentBalance = parseFloat(cashRegister.opening_amount);
    
    cashRegister.transactions.forEach(tx => {
      if (['income', 'deposit'].includes(tx.type)) {
        currentBalance += parseFloat(tx.amount);
      } else if (['expense', 'withdrawal', 'adjustment'].includes(tx.type)) {
        currentBalance -= parseFloat(tx.amount);
      }
    });

    const response = cashRegister.toJSON();
    response.current_balance = currentBalance;

    res.json(response);
  } catch (error) {
    console.error('❌ Error al obtener caja actual:', error);
    res.status(500).json({ error: 'Error al obtener caja actual' });
  }
};

// Registrar transacción en la caja
exports.addTransaction = async (req, res) => {
  try {
    const { 
      cash_register_id, 
      order_id, 
      type, 
      amount, 
      payment_method, 
      description, 
      reference 
    } = req.body;

    // Verificar si la caja existe y está abierta
    const cashRegister = await CashRegister.findOne({
      where: {
        id: cash_register_id,
        status: 'open'
      }
    });

    if (!cashRegister) {
      return res.status(404).json({ error: 'No se encontró una caja abierta con ese ID' });
    }

    // Crear transacción
    const transaction = await CashTransaction.create({
      cash_register_id,
      order_id,
      type,
      amount,
      payment_method: payment_method || 'efectivo',
      description,
      reference,
      created_by: req.user.id,
      created_at: new Date()
    });

    // Recuperar transacción con relaciones
    const createdTransaction = await CashTransaction.findByPk(transaction.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username'] },
        { model: Order, as: 'order', attributes: ['id', 'order_code', 'total_amount'] }
      ]
    });

    res.status(201).json(createdTransaction);
  } catch (error) {
    console.error('❌ Error al registrar transacción:', error);
    res.status(500).json({ error: 'Error al registrar transacción' });
  }
};

// Generar reporte de caja
exports.generateReport = async (req, res) => {
  try {
    const { id } = req.params;

    const cashRegister = await CashRegister.findByPk(id, {
      include: [
        { model: User, as: 'opener', attributes: ['id', 'username'] },
        { model: User, as: 'closer', attributes: ['id', 'username'] },
        { 
          model: CashTransaction, 
          as: 'transactions' 
        },
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'order_code', 'type', 'customer_name', 'total_amount', 'created_at']
        }
      ]
    });

    if (!cashRegister) {
      return res.status(404).json({ error: 'Caja no encontrada' });
    }

    // Agrupar transacciones por tipo y método de pago
    const transactions = cashRegister.transactions;
    
    // Inicializar totales
    const totals = {
      cash: {
        income: 0,
        expense: 0,
        deposit: 0,
        withdrawal: 0,
        adjustment: 0
      },
      card: {
        income: 0,
        expense: 0
      },
      transfer: {
        income: 0,
        expense: 0
      },
      other: {
        income: 0,
        expense: 0
      },
      total: {
        income: 0,
        expense: 0,
        balance: 0
      }
    };

    // Calcular totales
    transactions.forEach(tx => {
      const amount = parseFloat(tx.amount);
      const isIncome = ['income', 'deposit'].includes(tx.type);
      const isExpense = ['expense', 'withdrawal', 'adjustment'].includes(tx.type);

      if (tx.payment_method === 'efectivo') {
        if (isIncome) {
          totals.cash[tx.type] += amount;
          totals.cash.income += amount;
          totals.total.income += amount;
        } else if (isExpense) {
          totals.cash[tx.type] += amount;
          totals.cash.expense += amount;
          totals.total.expense += amount;
        }
      } else if (tx.payment_method === 'tarjeta') {
        if (isIncome) {
          totals.card.income += amount;
          totals.total.income += amount;
        } else if (isExpense) {
          totals.card.expense += amount;
          totals.total.expense += amount;
        }
      } else if (tx.payment_method === 'transferencia') {
        if (isIncome) {
          totals.transfer.income += amount;
          totals.total.income += amount;
        } else if (isExpense) {
          totals.transfer.expense += amount;
          totals.total.expense += amount;
        }
      } else {
        // Otro método de pago
        if (isIncome) {
          totals.other.income += amount;
          totals.total.income += amount;
        } else if (isExpense) {
          totals.other.expense += amount;
          totals.total.expense += amount;
        }
      }
    });

    // Calcular balance total
    totals.total.balance = totals.total.income - totals.total.expense;

    // Preparar informe
    const report = {
      cash_register: {
        id: cashRegister.id,
        opened_by: cashRegister.opener?.username || 'Sistema',
        closed_by: cashRegister.closer?.username || 'Pendiente',
        opened_at: cashRegister.opened_at,
        closed_at: cashRegister.closed_at,
        status: cashRegister.status,
        opening_amount: parseFloat(cashRegister.opening_amount),
        closing_amount: parseFloat(cashRegister.closing_amount || 0),
        expected_amount: parseFloat(cashRegister.expected_amount || 0),
        difference_amount: parseFloat(cashRegister.difference_amount || 0)
      },
      totals,
      order_count: cashRegister.orders?.length || 0,
      transaction_count: transactions.length,
      generated_at: new Date()
    };

    res.json(report);
  } catch (error) {
    console.error('❌ Error al generar reporte:', error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};