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
  let fullOrderObject = {};
  let mostRecentOrder;

  // need to quantize cart first

  const quantifiedCart = quantifyCart(userCart);
  // console.log('quantifiedCart:  ', quantifiedCart);
  quantifiedCart.forEach((item, i) => {
    // console.log('I  ', i, 'item: ', item);

    if (item.seller !== mostRecentSeller) {
      // new seller
      console.log(
        'item seller: ',
        item.seller,
        'most recent seller: ',
        mostRecentSeller
      );
      mostRecentSeller = item.seller;
      // console.log('############');
      // console.log('item is from new seller. item: ', item);
      // console.log('############');
      // const newItem = {item.}
      fullOrderObject[item.seller] = {
        // ...fullOrderObject[item.seller],
        count: 1,
        products: [
          {
            ...item,
            price: item.price * item.quantity
          }
        ]
      };

      // iterate thru cart, if item.seller not most recent,
      // make new array on fullOrderObject and set mostRecent to current

      // when object is fully built, iterate through, create one order per seller
      // MAKE SURE to calculate price (quantity * price)
    } else {
      // item.seller is most recent seller
      // push to current array
      // and increase count
      // console.log('Item is previous seller. item: ', item);
      //
      //
      console.log('111: ', fullOrderObject[item.seller].products);
      console.log('item.products: ', item.products);
      // fullOrderObject[item.seller].products.push({
      //   count: item.count,
      //   products: item.products
      // });
      // fullOrderObject[item.seller].count =
      //   fullOrderObject[item.seller].count + 1;
      //
      //
      // fullOrderObject[item.seller] = {
      //   ...item,
      // // update this seller, with the key of the existing item array
      // // put this item on that array
      // };
      // console.log('item is previous seller: ', item.seller);
    }
  });

  // order
  console.log('############');
  console.log('############');
  console.log('############');
  console.log('############');
  console.log('############');

  console.log('fullOrderObject: ', fullOrderObject);

  // console.log('fullOrderObject: ', fullOrderObject['1'].products);
  // const order = new Order(userId,seller,  );
};

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

const currentObject = {
  sellerId1: { count: 1, products: [] }
};
