const db = require('../util/database');
const Product = require('../models/product');
const CartItem = require('../models/cartItem');

exports.getCart = async (req, res) => {
  const { isLoggedIn, userId } = req.session;
  const response = await CartItem.findByUser(userId);
  const userCart = response[0];

  if (JSON.stringify(userCart) === JSON.stringify([])) {
    // cart is empty
    return res.render('shop/cart', {
      isLoggedIn: isLoggedIn,
      pageTitle: 'Cart',
      path: '/shop/cart',
      activeCart: true,
      hasItems: false,
      cartItems: []
    });
  }

  // cart is not empty. determine quantities:
  // get quantity of each item from usercart
  let productsSoFar = [];
  let quantifiedCart = [];

  userCart.forEach(item => {
    if (productsSoFar.indexOf(item.product) === -1) {
      productsSoFar.push(item.product);
      quantifiedCart.push({
        id: item.id,
        product: item.product,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: 1
      });
    } else {
      let filteredCart = quantifiedCart.filter(element => {
        return element.product === item.product;
      });
      let alreadyExistingItem = filteredCart[0];
      let newQuantity = alreadyExistingItem.quantity + 1;
      let itemWithNewQuantity = {
        id: item.id,
        product: item.product,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: newQuantity
      };
      let arrayWithoutNewItem = quantifiedCart.filter(i => {
        return i.product !== item.product;
      });
      let updatedQuantifiedCart = [...arrayWithoutNewItem, itemWithNewQuantity];
      quantifiedCart = updatedQuantifiedCart;
    }
  });

  res.render('shop/cart', {
    isLoggedIn: isLoggedIn,
    pageTitle: 'Cart',
    path: '/shop/cart',
    activeCart: true,
    hasItems: true,
    cartItems: quantifiedCart
  });
};

exports.addToCart = (req, res) => {
  const newCartItem = new CartItem(
    req.params.productid,
    req.session.userId,
    req.query.price,
    req.query.imageUrl
  );
  newCartItem
    .save()
    .then(result => {
      res.redirect('/shop/cart');
    })
    .catch(error => console.log('new cart item err: ', error));
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

exports.removeFromCart = (req, res) => {
  const { cartitemid } = req.params;
  db.execute('DELETE FROM cartItems WHERE id = ?', [cartitemid])
    .then(result => {
      res.redirect('/shop/cart');
    })
    .catch(err => {
      console.log('delete operation error. error message: ', err);
    });
};
