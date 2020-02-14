const db = require('../util/database');
const CartItem = require('../models/cartItem');
const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const { quantifyCart } = require('./util');

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

  // cart not empty
  const quantifiedCart = quantifyCart(userCart);
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
    req.query.imageUrl,
    req.query.author
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

exports.checkout = async (req, res) => {
  const { userId } = req.session;
  const response = await CartItem.findByUser(userId);
  const userCart = response[0];

  // sort cartitems by seller,
  let mostRecentSeller = '';
  let fullOrderArray = [];

  const quantifiedCart = quantifyCart(userCart);

  quantifiedCart.forEach((item, i) => {
    if (item.seller !== mostRecentSeller) {
      // new seller
      mostRecentSeller = item.seller;

      fullOrderArray.push({
        customer: item.customer,
        seller: item.seller,
        count: 1,
        totalPrice: item.price * item.quantity,
        quantifiedProducts: [item]
      });
    } else {
      // new quantified product from same seller
      const existingOrderInArrayForm = fullOrderArray.filter(
        order => order.seller === item.seller
      );
      const existingOrder = existingOrderInArrayForm[0];
      existingOrder.quantifiedProducts.push(item);
      existingOrder.totalPrice =
        existingOrder.totalPrice + item.price * item.quantity;
      existingOrder.count = existingOrder.count + 1;
    }
  });

  async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  const createOrdersInDataBasePromise = orderObject =>
    new Promise((resolve, reject) => {
      const { seller, totalPrice, quantifiedProducts } = orderObject;

      const newOrder = new Order(
        req.session.userId,
        seller,
        totalPrice,
        JSON.stringify(quantifiedProducts),
        'pending'
      );

      newOrder
        .save()
        .then(result => {
          return resolve(result);
        })
        .catch(err => console.log('err: ', err));
    });

  const start = async () => {
    await asyncForEach(fullOrderArray, async orderObject => {
      await createOrdersInDataBasePromise(orderObject);
    });

    CartItem.clearCart(userId);
    res.redirect('/');
  };
  start();
};

exports.getProduct = async (req, res) => {
  const { isLoggedIn } = req.session;
  const responseFromDb = await Product.findById(req.params.id);
  const product = responseFromDb[0][0];
  res.render('shop/product', {
    isLoggedIn: isLoggedIn,
    pageTitle: 'Shop',
    path: '/shop/product',
    product,
    productCSS: true
  });
};

exports.getUser = async (req, res) => {
  const { isLoggedIn } = req.session;
  const userResponseFromDb = await User.findById(req.params.id);
  const foundUser = userResponseFromDb[0][0];
  console.log('req. params.id : ', req.params.id);
  const productsResponseFromDb = await Product.findByAuthor(req.params.id);
  const products = productsResponseFromDb[0][0];
  const hasProducts = products.length > 0;
  res.render('shop/user', {
    isLoggedIn,
    pageTitle: "User's Gallery",
    path: '/shop/user',
    user: foundUser,
    products,
    hasProducts
  });
};
