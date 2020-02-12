const db = require('../util/database');
const Product = require('../models/product');
const CartItem = require('../models/cartItem');
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

  // cart is not empty. determine quantities:
  // get quantity of each item from usercart

  // let productsSoFar = [];
  // let quantifiedCart = [];
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
  const { isLoggedIn, userId } = req.session;
  const response = await CartItem.findByUser(userId);
  const userCart = response[0];

  // sort cartitems by seller,
  let mostRecentSeller = '';
  let fullOrderArray = [];
  let mostRecentOrder;

  const quantifiedCart = quantifyCart(userCart);

  quantifiedCart.forEach((item, i) => {
    if (item.seller !== mostRecentSeller) {
      mostRecentSeller = item.seller;

      fullOrderArray.push({
        customer: item.customer,
        seller: item.seller,
        count: 1,
        totalPrice: item.price * item.quantity,
        quantifiedProducts: [item]
      });

      // iterate thru cart, if item.seller not most recent,
      // make new array on fullOrderArray and set mostRecent to current

      // when object is fully built, iterate through, create one order per seller
      // MAKE SURE to calculate price (quantity * price)
    } else {
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

  asyncForEach(fullOrderArray, async orderObject => {
    const { seller, totalPrice, quantifiedProducts, customer } = orderObject;

    // const newOrder = new Order()

    const newOrder = new Order(
      req.session.userId,
      seller,
      totalPrice,
      JSON.stringify(quantifiedProducts),
      'pending'
    );

    console.log('new order: ', newOrder);
    newOrder
      .save()
      .then(result => console.log('result: ', result))
      .catch(err => console.log('err: ', err));
  });
};

// this.customer = c;
// this.seller = s;
// this.price = p1;
// this.productid = p2;
// this.date = d;
// this.quantity = q;

// this.customer = c;
// this.seller = s;
// this.price = pri;
// this.product = pro;
// this.date = d;

const separateProductsWithQuantity = [
  {
    id: 42,
    product: 8,
    price: 89779079,
    imageUrl:
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone11-red-select-2019?wid=940',
    seller: 1,
    quantity: 1
  },
  {
    id: 43,
    product: 7,
    price: 10,
    imageUrl:
      'https://pics.me.me/im-boo-boo-the-fool-im-boo-boo-the-fucking-49773182.png',
    seller: 1,
    quantity: 3
  }
];

const separateOrdersWithTotalPrice = [
  {
    seller: 1,
    totalPrice: 34,
    products: [{}, {}]
  },
  {
    seller: 4,
    totalPrice: 34,
    products: [{}, {}]
  }
];

const simpleModelOfSeparatedIntoOrders = {
  sellerId1: [{ product1: 1 }, { product2: 2 }],
  sellerId2: [{ product: 2 }, { product2: 2 }]
};

const arrayVersion = [
  { sellerId1: 42, quantifiedProducts: [{ prop1: 1 }, { prop2: 2 }] },
  { sellerId2: 40, quantifiedProducts: [{ prop1: 2 }, { prop2: 2 }] }
];

const currentObject = {
  sellerId1: { count: 1, products: [] }
};

const orderObject = {
  customer: 3,
  seller: 1,
  price: 2292,
  seller: 4,
  products: [
    /*json array object here? */
  ],
  date: 109129287298
};
