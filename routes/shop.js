const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/cart', shopController.getCart);

router.get('/products', shopController.getProducts);

router.get('/product/:id', shopController.getProduct);

router.get('/store/:id', shopController.getStore);

router.post('/add-to-cart/:productid', shopController.addToCart);

router.post('/remove-from-cart/:cartitemid', shopController.removeFromCart);

// router.post('/checkout', shopController.checkout);

router.get('/checkout', shopController.getCheckout);

router.get('/checkout-success', shopController.getCheckoutSuccess);

module.exports = router;
