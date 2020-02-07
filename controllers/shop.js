const db = require('../util/database');
const Product = require('../models/product');
const CartItem = require('../models/cartItem');

exports.getCart = async (req, res) => {
  const { isLoggedIn, userId } = req.session;
  const response = await CartItem.findByUser(userId);
  const userCart = response[0];

  // get quantity of each item from usercart
  let productsSoFar = [];
  let quantifiedCart = [];

  userCart.forEach(item => {
    if (productsSoFar.indexOf(item.product) === -1) {
      productsSoFar.push(item.product);
      quantifiedCart.push({ product: item.product, quantity: 1 });
    } else {
      let filteredCart = quantifiedCart.filter(element => {
        return element.product === item.product;
      });

      let alreadyExistingItem = filteredCart[0];

      let newQuantity = alreadyExistingItem.quantity + 1;
      let itemWithNewQuantity = {
        product: item.product,
        quantity: newQuantity
      };

      let arrayWithoutNewItem = quantifiedCart.filter(i => {
        return i.product !== item.product;
      });
      let updatedQuantifiedCart = [...arrayWithoutNewItem, itemWithNewQuantity];
      quantifiedCart = updatedQuantifiedCart;
    }
  });

  let cartWithDetails = [];

  async function detailGetter() {
    quantifiedCart.forEach(item => {
      async function getDetails() {
        let foundItem = await Product.findById(item.product);
        let { title, price, description, imageUrl } = foundItem[0][0];
        let itemWithDetails = {
          title,
          price,
          description,
          imageUrl,
          quantity: item.quantity,
          productId: item.product
        };
        cartWithDetails.push(itemWithDetails);
      }

      async function returnAfterPushing() {
        await getDetails();
        if (quantifiedCart.indexOf(item) === quantifiedCart.length - 1) {
          res.render('shop/cart', {
            isLoggedIn: isLoggedIn,
            pageTitle: 'Cart',
            path: '/shop/cart',
            activeCart: true,
            cartItems: cartWithDetails
          });
        }
      }
      returnAfterPushing();
    });
  }
  detailGetter();
};

exports.addToCart = (req, res) => {
  const newCartItem = new CartItem(req.params.productid, req.session.userId);
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
