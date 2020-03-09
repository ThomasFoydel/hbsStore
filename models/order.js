const db = require('../util/database');

module.exports = class Order {
  constructor(c, s, t, p, st, sh) {
    this.customer = c;
    this.seller = s;
    this.totalPrice = t;
    this.products = p;
    this.status = st;
    this.shippingInfo = sh;
  }
  save() {
    return db.execute(
      'INSERT INTO orders (customer, seller, price, products, status, shippingInfo) VALUES (?,?,?,?,?,?)',
      [
        this.customer,
        this.seller,
        this.totalPrice,
        this.products,
        this.status,
        this.shippingInfo
      ]
    );
  }
  static fetchAll() {
    return db.execute('SELECT * FROM orders');
  }

  static findBySeller(seller) {
    return db.execute('SELECT * FROM orders WHERE orders.seller = ?', [seller]);
  }

  static findByCustomer(customer) {
    return db.execute('SELECT * FROM orders WHERE orders.cusomer = ?', [
      customer
    ]);
  }

  static findById(id) {
    return db.execute('SELECT * FROM orders WHERE orders.id = ?', [id]);
  }
};
