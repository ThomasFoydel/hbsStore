const bcrypt = require('bcryptjs');
const Product = require('../models/product');
const User = require('../models/user');
// const jwt = require('jsonwebtoken');

const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname.replace('/util', '') + '/.env')
});

exports.getRegister = (req, res) => {
  const { isLoggedIn } = req.session;
  if (isLoggedIn) {
    return res.redirect('/');
  } else {
    res.render('admin/register', {
      isLoggedIn: false,
      pageTitle: 'Register',
      path: '/admin/register',
      formCSS: true,
      activeRegister: true
    });
  }
};

exports.postRegister = async (req, res) => {
  let errors = [];
  const { name, email, password, confirmpassword } = req.body;
  if (password !== confirmpassword) {
    let newError = 'passwords do not match';
    errors.push(newError);
  }
  const hashedPw = await bcrypt.hash(password, 12);
  if (errors.length > 0) {
    res.send({ errorMessage: errors });
  } else {
    const user = new User(name, email, hashedPw);
    user.save().then(result => {
      console.log('result: ', result);
      res.redirect('/');
    });
  }
};

exports.getLogin = (req, res) => {
  const { isLoggedIn } = req.session;
  if (isLoggedIn) {
    return res.redirect('/');
  } else {
    res.render('admin/login', {
      isLoggedIn: false,
      pageTitle: 'Login',
      path: '/admin/login',
      formCSS: true,
      activeLogin: true
    });
  }
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  User.findByEmail(email).then(async response => {
    if (response[0][0]) {
      const user = response[0][0];
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (passwordsMatch) {
        req.session.isLoggedIn = true;
        req.session.userId = user.id;
        req.session.name = user.name;
        res.redirect('/');
      } else {
        return res.render('admin/login', {
          isLoggedIn: false,
          pageTitle: 'Login',
          path: '/admin/login',
          formCSS: true,
          activeLogin: true,
          errorMessage: 'Incorrect password'
        });
      }
    } else {
      return res.render('admin/login', {
        isLoggedIn: false,
        pageTitle: 'Login',
        path: '/admin/login',
        formCSS: true,
        activeLogin: true,
        errorMessage: 'Incorrect username'
      });
    }
  });
};

exports.postLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);
    res.redirect('/');
  });
};

exports.getProducts = async (req, res) => {
  const { isLoggedIn, userId } = req.session;
  if (isLoggedIn) {
    const responseFromDb = await Product.findByAuthor(userId);
    const listOfCurrentUsersProducts = responseFromDb[0];
    const thisUserHasProducts = listOfCurrentUsersProducts.length > 0;

    res.render('admin/products', {
      isLoggedIn: true,
      pageTitle: 'My Products',
      path: '/admin/products',
      productCSS: true,
      activeProductList: true,
      hasProducts: thisUserHasProducts,
      products: listOfCurrentUsersProducts
    });
  } else {
    res.redirect('/admin/login');
  }
};

exports.getAddProduct = (req, res) => {
  const isLoggedIn = req.session;
  if (isLoggedIn) {
    res.render('admin/add-product', {
      isLoggedIn: isLoggedIn,
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true
    });
  } else {
    return res.redirect('/admin/login');
  }
};

exports.postAddProduct = (req, res) => {
  const { title, price, imageUrl, description } = req.body;
  const { userId } = req.session;
  const product = new Product(title, price, description, imageUrl, userId);
  product.save().then(result => {
    res.redirect('/');
  });
};
