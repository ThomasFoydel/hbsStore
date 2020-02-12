const db = require('../util/database');

module.exports = class Order {
  constructor(c, s, t, p, st) {
    this.customer = c;
    this.seller = s;
    this.totalPrice = t;
    this.products = p;
    this.status = st;
  }
  save() {
    return db.execute(
      'INSERT INTO orders (customer, seller, price, products, status) VALUES (?,?,?,?,?)',
      [this.customer, this.seller, this.totalPrice, this.products, this.status]
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

// const orderObject = {
//   customer: 3,
//   seller: 1,
//   price: 2292,
//   products: [
//     /*json array object here? */
//   ],
//   date: 109129287298
// };
