const db = require('../util/database');

module.exports = class Product {
  constructor(t, p, i, d) {
    this.title = t;
    this.price = p;
    this.imageUrl = i;
    this.description = d;
  }
  save() {
    return db.execute(
      'INSERT INTO products (title, price, imageUrl, description) VALUES (?,?,?,?)',
      [this.title, this.price, this.description, this.imageUrl]
    );
  }
  static fetchAll() {
    return db.execute('SELECT * FROM products');
  }

  static findById(id) {
    return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
  }
};
