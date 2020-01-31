const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');
const session = require('express-session');

const errorController = require('./controllers/404');
const db = require('./util/database');

const app = express();

app.engine(
  'hbs',
  expressHbs({
    layoutsDir: 'views/layouts',
    defaultLayout: 'main-layout',
    extname: 'hbs'
  })
);
app.set('view engine', 'hbs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// db.execute('SELECT * FROM products')
//   .then(res => {
//     console.log(res[0]);
//   })
//   .catch(err => console.log(err));

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use('/shop', shopRoutes);
app.use('/', (req, res) => {
  db.execute('SELECT * FROM products')
    .then(result => {
      res.render('shop/index', {
        pageTitle: 'home',
        path: '/',
        indexActive: true,
        productCSS: true,
        hasProducts: true,
        products: result[0]
      });
    })
    .catch(err => console.log(err));
});

app.use(errorController.getPageNotFound);

app.listen(3000);
