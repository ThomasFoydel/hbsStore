const bcrypt = require('bcryptjs');
const Product = require('../models/product');
const User = require('../models/user');

const registerValidator = require('../util/registerValidator');

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
  // let errors = {};
  const { name, email, password, confirmpassword } = req.body;
  let errors = await registerValidator({
    name,
    email,
    password,
    confirmpassword
  });

  if (errors.size(errors) > 0) {
    return res.render('admin/register', {
      isLoggedIn: false,
      pageTitle: 'Register',
      path: '/admin/register',
      formCSS: true,
      activeRegister: true,
      nameMissing: errors.nameMissing,
      emailMissing: errors.emailMissing,
      passwordMissing: errors.passwordMissing,
      confirmpasswordMissing: errors.confirmpasswordMissing,
      userEmailAlreadyExists: errors.userEmailAlreadyExists,
      userNameAlreadyExists: errors.userNameAlreadyExists,
      passwordsNotMatch: errors.passwordsNotMatch,
      nameWrongLength: errors.nameWrongLength,
      passwordWrongLength: errors.passwordWrongLength
    });
  }

  const hashedPw = await bcrypt.hash(password, 12);
  const user = new User(name, email, hashedPw);
  user.save().then(result => {
    console.log('new user saved. result: ', result);
    res.redirect('/admin/login');
  });
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
          passwordError: true
        });
      }
    } else {
      return res.render('admin/login', {
        isLoggedIn: false,
        pageTitle: 'Login',
        path: '/admin/login',
        formCSS: true,
        activeLogin: true,
        emailError: true
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
      activeMyProducts: true,
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

exports.getMyShop = async (req, res) => {
  const { userId, isLoggedIn } = req.session;

  if (isLoggedIn) {
    const dbProductsResponse = await Product.findByAuthor(userId);
    const listOfCurrentUsersProducts = dbProductsResponse[0];
    const thisUserHasProducts = listOfCurrentUsersProducts.length > 0;

    const dbUserResponse = await User.findById(userId);
    const foundUser = dbUserResponse[0][0];
    const { name, email, shopTitle, coverPic, profilePic, bio } = foundUser;
    res.render('admin/myshop', {
      isLoggedIn: isLoggedIn,
      path: '/admin/myshop',
      activeMyShop: true,
      productCSS: true,
      pageTitle: shopTitle ? shopTitle : 'my shop',
      name: name,
      email: email,
      shopTitle: shopTitle,
      coverPic: coverPic,
      profilePic: profilePic,
      bio: bio,
      hasProducts: thisUserHasProducts,
      products: listOfCurrentUsersProducts
    });
  } else {
    res.redirect('/admin/login');
  }
};

exports.getEditShop = async (req, res) => {
  const { userId, isLoggedIn } = req.session;
  User.findById(userId).then(response => {
    const foundUser = response[0][0];
    const { name, email, shopTitle, coverPic, profilePic, bio } = foundUser;
    res.render('admin/editshop', {
      isLoggedIn: isLoggedIn,
      pageTitle: 'Edit Shop',
      path: '/admin/editshop',
      userId: userId,
      name: name,
      email: email,
      shopTitle: shopTitle,
      coverPic: coverPic,
      profilePic: profilePic,
      bio: bio
    });
  });
};

exports.postEditShop = async (req, res) => {
  const { userId, isLoggedIn } = req.session;
  const { email, name, shopTitle, profilePic, coverPic, bio } = req.body;

  const renderEditShop = () => {
    User.findById(userId).then(response => {
      const foundUser = response[0][0];
      const { name, email, shopTitle, coverPic, profilePic, bio } = foundUser;
      res.render('admin/editshop', {
        isLoggedIn: isLoggedIn,
        pageTitle: 'Edit Shop',
        path: '/admin/editshop',
        userId: userId,
        name: name,
        email: email,
        shopTitle: shopTitle,
        coverPic: coverPic,
        profilePic: profilePic,
        bio: bio
      });
    });
  };

  if (name) {
    const updatedUser = await User.update('email', shoptitle, userId);
    renderEditShop();
  }
  if (email) {
    const updatedUser = await User.update('email', shoptitle, userId);
    renderEditShop();
  }
  if (shopTitle) {
    User.update('shopTitle', shoptitle, userId).then(res => {
      renderEditShop();
    });
  }
  if (profilePic) {
    const updatedUser = await User.update('profilePic', profilePic, userId);
    renderEditShop();
  }
  if (coverPic) {
    const updatedUser = await User.update('coverPic', coverPic, userId);
    renderEditShop();
  }
  if (bio) {
    const updatedUser = await User.update('bio', bio, userId);
    renderEditShop();
  }
};
