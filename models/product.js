const db = require('../util/database');

module.exports = class Product {
  constructor(t, p, i, d, s) {
    this.title = t;
    this.price = p;
    this.imageUrl = i;
    this.description = d;
    this.seller = s;
  }
  save() {
    return db.execute(
      'INSERT INTO products (title, price, imageUrl, description, seller) VALUES (?,?,?,?,?)',
      [this.title, this.price, this.description, this.imageUrl, this.seller]
    );
  }
  static fetchAll() {
    return db.execute('SELECT * FROM products');
  }

  static FindBySeller() {
    return db.execute('SELECT * FROM products WHERE products.seller = ?', [
      seller
    ]);
  }

  static findById(id) {
    return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
  }
};
