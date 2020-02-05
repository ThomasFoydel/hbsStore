const Product = require('../models/product');
const db = require('../util/database');

// exports.getAddProduct = (req, res, next) => {
//   res.render('admin/add-product', {
//     pageTitle: 'Add Product',
//     path: '/admin/add-product',
//     formsCSS: true,
//     productCSS: true,
//     activeAddProduct: true
//   });
// };

// exports.postAddProduct = (req, res, next) => {
//   const product = new Product(req.body.title);
//   product.save();
//   res.redirect('/');
// };

exports.getCart = (req, res) => {
  const { isLoggedIn } = req.session;
  res.render('shop/cart', {
    isLoggedIn: isLoggedIn,
    pageTitle: 'Cart',
    path: '/shop/cart',
    activeCart: true
  });
};

exports.getProducts = (req, res, next) => {
  const { isLoggedIn } = req.session;

  db.execute('SELECT * FROM products').then(result => {
    let products = result[0];
    const hasProducts = products ? products.length > 0 : null;
    res.render('shop/product-list', {
      isLoggedIn: isLoggedIn,
      prods: products,
      pageTitle: 'Shop',
      path: '/shop/product-list',
      hasProducts,
      activeProducts: true,
      productCSS: true
    });
  });
};
