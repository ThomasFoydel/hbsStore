const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/cart', shopController.getCart);

router.get('/product-list', shopController.getProducts);

module.exports = router;
