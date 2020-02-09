const db = require('../util/database');

module.exports = class Order {
  constructor(c, s, pri, pro, d, q) {
    this.customer = c;
    this.seller = s;
    this.price = pri;
    this.product = pro;
    this.date = d;
    this.quantity = q;
  }
  save() {
    return db.execute(
      'INSERT INTO orders (customer, seller, price, product, date) VALUES (?,?,?,?,?,?)',
      [this.customer, this.seller, this.price, this.product, this.date]
    );
  }
  static fetchAll() {
    return db.execute('SELECT * FROM orders');
  }

  static FindBySeller(seller) {
    return db.execute('SELECT * FROM orders WHERE orders.seller = ?', [seller]);
  }

  static FindByCustomer(customer) {
    return db.execute('SELECT * FROM orders WHERE orders.cusomer = ?', [
      customer
    ]);
  }

  static findById(id) {
    return db.execute('SELECT * FROM orders WHERE orders.id = ?', [id]);
  }
};
