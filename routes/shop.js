const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/cart', shopController.getCart);

router.get('/product-list', shopController.getProducts);

router.post('/add-to-cart/:productid', shopController.addToCart);

router.post('/remove-from-cart/:cartitemid', shopController.removeFromCart);

module.exports = router;
