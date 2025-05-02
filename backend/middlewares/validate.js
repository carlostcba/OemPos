// backend/middlewares/validate.js

const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Error de validación', 
      details: errors.array() 
    });
  }
  next();
};