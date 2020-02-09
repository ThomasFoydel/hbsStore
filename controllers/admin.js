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
  // const foundUser = await
  User.findByEmail(email).then(async response => {
    if (response[0][0]) {
      const user = response[0][0];
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (passwordsMatch) {
        ////// SESSION METHOD /////
        req.session.isLoggedIn = true;
        req.session.userId = user.id;
        req.session.name = user.name;
        res.redirect('/');

        // ///////
        // // // // jwt method   // // // //
        // const token = jwt.sign(
        //   {
        //     tokenUser: {
        //       userId: user.id,
        //       email: user.email
        //     }
        //   },
        //   process.env.SECRET,
        //   { expiresIn: '1000hr' }
        // );
        // const userInfo = {
        //   name: user.name,
        //   email: user.email,
        //   id: user.id
        // };
        // console.log('userInfo: ', userInfo, token);
        // res.status(200).send({
        //   status: 'success',
        //   message: 'Login successful',
        //   data: {
        //     user: userInfo,
        //     token
        //   },
        //   headers: {
        //     'x-auth-token': token
        //   }
        // });
      } else {
        return res.json({ err: 'Incorrect password' });
      }
    } else {
      return res.json({ err: 'Incorrect username' });
    }
  });
  // console.log(foundUser[0]);
};

exports.postLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);
    res.redirect('/');
  });
};

exports.getProducts = (req, res) => {
  const isLoggedIn = req.session;
  if (isLoggedIn) {
    res.render('admin/products', {
      isLoggedIn: true,
      pageTitle: 'Products',
      path: '/admin/products',
      productCSS: true,
      activeProductList: true
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
