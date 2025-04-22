const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // memoria
const controller = require('../controllers/image.controller');

router.post('/', upload.single('image'), controller.upload);

module.exports = router;
