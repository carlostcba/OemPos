const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // adaptá si tu path cambia

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    comment: 'Identificador único del evento de auditoría'
  },
  entity_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Tipo de entidad afectada (Product, User, Order, etc.)'
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID del registro afectado'
  },
  action: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Acción realizada: CREATE, UPDATE, DELETE, etc.'
  },
  changes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Detalle de los cambios (formato JSON)'
  },
  previous_values: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Valores previos si se desean guardar (formato JSON)'
  },
  performed_by: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID del usuario que realizó el cambio'
  },
  performed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora de la acción'
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP del cliente que ejecutó la acción'
  },
  user_agent: {
    type: DataTypes.STRING(510),
    allowNull: true,
    comment: 'User-agent del navegador o cliente HTTP'
  },
  source: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'system',
    comment: 'Origen del evento: panel, API, sistema automático...'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas adicionales del sistema o el desarrollador'
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Información técnica adicional o contexto en JSON'
  }
}, {
  tableName: 'AuditLogs',
  timestamps: false,
  comment: 'Registra todas las acciones del sistema realizadas sobre cualquier entidad'
});

module.exports = AuditLog;
