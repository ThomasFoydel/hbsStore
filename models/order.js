const db = require('../util/database');

module.exports = class Order {
  constructor(c, s, p1, p2, d, q) {
    this.customer = c;
    this.seller = s;
    this.price = p1;
    this.productid = p2;
    this.date = d;
    this.quantity = q;
  }
  save() {
    return db.execute(
      'INSERT INTO orders (customer, seller, price, product, date) VALUES (?,?,?,?,?,?)',
      [
        this.customer,
        this.seller,
        this.price,
        { productid: this.productid, quantity: this.quantity },
        this.date
      ]
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

// const order = {
//   seller: 1,
//   customer: 4,
//   product: {
//     productid: 4,
//     quantity: 3
//   },
//   price: 45
// };
