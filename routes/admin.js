const express = require('express');

// const productsController = require('../controllers/products');
const adminController = require('../controllers/admin');

const router = express.Router();

// admin login => GET
router.get('/login', adminController.getLogin);

// admin login => POST
router.post('/login', adminController.postLogin);

// adming logout => POST
router.post('/logout', adminController.postLogout);

// admin register => GET
router.get('/register', adminController.getRegister);

// admin register => POST
router.post('/register', adminController.postRegister);

// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/my-shop => GET
router.get('/my-shop', adminController.getMyShop);

// /admin/edit-shop => GET
router.get('/edit-shop', adminController.getEditShop);

// /admin/edit-shop => POST
router.post('/edit-shop', adminController.postEditShop);

// /admin/edit-product => GET
router.get('/edit-product/:id', adminController.getEditProduct);

// /admin/edit-product => POST
router.post('/edit-product/:id', adminController.postEditProduct);

module.exports = router;
