const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

router.post('/', async (req, res) => {
  try {
    const {
      entity_type,
      entity_id,
      action,
      changes,
      previous_values,
      performed_by,
      ip_address,
      user_agent,
      source,
      notes,
      metadata
    } = req.body;

    await AuditLog.create({
      entity_type,
      entity_id,
      action,
      changes: JSON.stringify(changes),
      previous_values: JSON.stringify(previous_values),
      performed_by,
      ip_address: ip_address || req.ip,
      user_agent: user_agent || req.headers['user-agent'],
      source: source || 'admin_panel',
      notes,
      metadata
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error al registrar auditoría:', err);
    res.status(500).json({ error: 'Error al registrar auditoría' });
  }
});

module.exports = router;
