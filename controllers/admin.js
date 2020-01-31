const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Product = require('../models/product');
const User = require('../models/user');
// const auth = require('../middlewares/auth');

const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname.replace('/util', '') + '/.env')
});

exports.getRegister = (req, res) => {
  res.render('admin/register', {
    pageTitle: 'Register',
    path: '/admin/register',
    formCSS: true,
    activeRegister: true
  });
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
  res.render('admin/login', {
    pageTitle: 'Login',
    path: '/admin/login',
    formCSS: true,
    activeLogin: true
  });
};

exports.postLogin = async (req, res) => {
  // console.log('login REQ BODY: ', req.body.password);

  const { email, password } = req.body;
  // const foundUser = await
  User.findByEmail(email).then(async response => {
    if (response[0][0]) {
      const user = response[0][0];
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (passwordsMatch) {
        const token = jwt.sign(
          {
            tokenUser: {
              userId: user.id,
              email: user.email
            }
          },
          process.env.SECRET,
          { expiresIn: '1000hr' }
        );

        const userInfo = {
          name: user.name,
          email: user.email,
          id: user.id
        };
        console.log('userInfo: ', userInfo, token);
        res.status(301).send({
          status: 'success',
          message: 'Login successful',
          data: {
            user: userInfo,
            token
          },
          headers: {
            'x-auth-token': token
          }
        });
      } else {
        return res.json({ err: 'Incorrect password' });
      }
    } else {
      return res.json({ err: 'Incorrect username' });
    }
  });
  // console.log(foundUser[0]);
};

exports.getProducts = (req, res) => {
  res.render('admin/products', {
    pageTitle: 'Products',
    path: '/admin/products',
    productCSS: true,
    activeProductList: true
  });
};

exports.getAddProduct = (req, res) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
};

exports.postAddProduct = (req, res) => {
  const { title, price, imageUrl, description } = req.body;

  console.log(title, price, imageUrl, description);
  const product = new Product(title, price, description, imageUrl);
  product.save().then(result => {
    res.redirect('/');
  });
};
