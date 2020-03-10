const db = require('../util/database');
const CartItem = require('../models/cartItem');
const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const { quantifyCart, makeLineItems } = require('./util');

exports.getCart = async (req, res) => {
  const { isLoggedIn, userId } = req.session;
  if (isLoggedIn && userId) {
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

    const lineItems = makeLineItems(quantifiedCart);

    // make stripe session id

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url:
        'http://localhost:3000/shop/checkout-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/shop/cart'
    });
    // console.log(stripeSession);

    res.render('shop/cart', {
      isLoggedIn: isLoggedIn,
      pageTitle: 'Cart',
      path: '/shop/cart',
      activeCart: true,
      hasItems: true,
      cartItems: quantifiedCart,
      stripeKey: process.env.STRIPE_API,
      stripeSession: stripeSession
    });
  } else {
    res.redirect('/admin/login');
  }
};

exports.addToCart = (req, res) => {
  if (req.session.userId) {
    const newCartItem = new CartItem(
      req.params.productid,
      req.session.userId,
      req.query.price,
      req.query.imageUrl,
      req.query.author,
      req.query.title
    );
    newCartItem
      .save()
      .then(result => {
        res.redirect('/shop/cart');
      })
      .catch(error => console.log('new cart item err: ', error));
  } else {
    res.redirect('/admin/login');
  }
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.getProducts = (req, res) => {
  const { isLoggedIn, userId } = req.session;

  db.execute('SELECT * FROM products').then(result => {
    let products = result[0];
    const hasProducts = products ? products.length > 0 : null;

    const asyncNameFetch = async () => {
      await asyncForEach(products, async product => {
        const userDbResponse = await User.findById(product.author);
        product.seller = userDbResponse[0][0].name;
        if (product.author === userId) {
          product.authorIsCurrentUser = true;
        }
      });
      return products;
    };

    asyncNameFetch().then(prods => {
      res.render('shop/products', {
        isLoggedIn: isLoggedIn,
        prods: prods,
        pageTitle: 'Shop',
        path: '/shop/products',
        hasProducts,
        activeProducts: true,
        productCSS: true
      });
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

exports.getProduct = async (req, res) => {
  const { isLoggedIn } = req.session;
  const productResponseFromDb = await Product.findById(req.params.id);
  const product = productResponseFromDb[0][0];
  const userResponseFromDb = await User.findById(product.author);
  const foundUser = userResponseFromDb[0][0];

  res.render('shop/product', {
    isLoggedIn: isLoggedIn,
    pageTitle: product.title,
    path: '/shop/product',
    product,
    productCSS: true,
    authorName: foundUser.name,
    author: foundUser.id
  });
};

exports.getStore = async (req, res) => {
  const { isLoggedIn } = req.session;
  const userResponseFromDb = await User.findById(req.params.id);
  const foundUser = userResponseFromDb[0][0];
  const productsResponseFromDb = await Product.findByAuthor(req.params.id);
  const products = productsResponseFromDb[0];
  const hasProducts = products.length > 0;
  const { shopTitle, coverPic, profilePic, name, email, bio } = foundUser;
  res.render('shop/store', {
    isLoggedIn,
    pageTitle: "User's Gallery",
    path: '/shop/store',
    user: foundUser,
    products,
    hasProducts,
    productCSS: true,
    shopTitle,
    coverPic,
    profilePic,
    name,
    email,
    bio
  });
};

// exports.checkout = async (req, res) => {
//   const { userId, isLoggedIn } = req.session;
//   const { fullName, address } = req.body;
//   console.log('checkout req query: ', req.query);

//   if (fullName && address) {
//     const response = await CartItem.findByUser(userId);
//     const userCart = response[0];

//     // sort cartitems by seller,
//     let mostRecentSeller = '';
//     let fullOrderArray = [];

//     const quantifiedCart = quantifyCart(userCart);

//     quantifiedCart.forEach((item, i) => {
//       if (item.seller !== mostRecentSeller) {
//         // new seller
//         mostRecentSeller = item.seller;

//         fullOrderArray.push({
//           customer: item.customer,
//           seller: item.seller,
//           count: 1,
//           totalPrice: item.price * item.quantity,
//           quantifiedProducts: [item]
//         });
//       } else {
//         // new quantified product from same seller
//         const existingOrderInArrayForm = fullOrderArray.filter(
//           order => order.seller === item.seller
//         );
//         const existingOrder = existingOrderInArrayForm[0];
//         existingOrder.quantifiedProducts.push(item);
//         existingOrder.totalPrice =
//           existingOrder.totalPrice + item.price * item.quantity;
//         existingOrder.count = existingOrder.count + 1;
//       }
//     });

//     async function asyncForEach(array, callback) {
//       for (let index = 0; index < array.length; index++) {
//         await callback(array[index], index, array);
//       }
//     }

//     const createOrdersInDataBasePromise = orderObject =>
//       new Promise((resolve, reject) => {
//         const { seller, totalPrice, quantifiedProducts } = orderObject;

//         const newOrder = new Order(
//           req.session.userId,
//           seller,
//           totalPrice,
//           JSON.stringify(quantifiedProducts),
//           'pending',
//           JSON.stringify({ fullName: fullName, address: address })
//         );

//         newOrder
//           .save()
//           .then(result => {
//             return resolve(result);
//           })
//           .catch(err => console.log('err: ', err));
//       });

//     const start = async () => {
//       await asyncForEach(fullOrderArray, async orderObject => {
//         await createOrdersInDataBasePromise(orderObject);
//       });

//       // CartItem.clearCart(userId);
//       res.render('shop/checkout-success', {
//         isLoggedIn: isLoggedIn,
//         pageTitle: 'Checkout Success',
//         path: '/shop/checkout-success',
//         productCSS: true,
//         authorName: foundUser.name,
//         author: foundUser.id
//       });
//     };
//     start();
//   } else {
//     console.log('NEGATIVE!');
//   }
// };

exports.getCheckout = async (req, res) => {
  const { userId, isLoggedIn } = req.session;
  const { session_id } = req.query;
  console.log('get checkout success');
  console.log('getCheckoutSuccess fullName: ', fullName);

  // put logic for creating order db objects
  // and clearing user's cart here
  // send emails to both sellers and buyer

  if (session_id) {
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
          'pending',
          JSON.stringify({ fullName: fullName, address: address })
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
      console.log('CHUNGUS!!!');
      CartItem.clearCart(userId);

      res.render('shop/checkout-success', {
        isLoggedIn: isLoggedIn,
        pageTitle: 'Checkout Success',
        path: '/shop/checkout-success',
        productCSS: true,
        authorName: foundUser.name,
        author: foundUser.id
      });
    };
    start();
  }

  res.redirect('/shop/checkout-success');
};

exports.getCheckoutSuccess = (req, res) => {
  const { isLoggedIn, userId } = req.session;

  return res.render('shop/checkout-success', {
    isLoggedIn: isLoggedIn,
    pageTitle: 'Checkout Success',
    path: '/shop/checkout-success',
    activeCart: true,
    hasItems: false,
    cartItems: []
  });
};
