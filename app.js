const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');

const errorController = require('./controllers/404');
const db = require('./util/database');

require('dotenv').config({
  path: path.resolve(__dirname.replace('/util', '') + '/.env')
});

const app = express();

app.use(cors());

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

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const options = {
  host: process.env.MYSQL_CONNECTION,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  expiration: 86400000,
  endConnectionOnClose: true,
  charset: 'utf8mb4_bin',
  clearExpired: true,
  checkExpirationInterval: 9000000,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
};

const sessionStore = new MySQLStore(options);

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use('/shop', shopRoutes);
app.use('/', (req, res) => {
  const { isLoggedIn } = req.session;
  res.render('shop/home', {
    isLoggedIn: isLoggedIn,
    pageTitle: 'Home',
    path: '/',
    homeActive: true
  });
});

app.use(errorController.getPageNotFound);

app.listen(process.env.PORT || 3000);
