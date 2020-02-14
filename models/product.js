const db = require('../util/database');

module.exports = class Product {
  constructor(t, p, i, d, a) {
    this.title = t;
    this.price = p;
    this.imageUrl = i;
    this.description = d;
    this.author = a;
  }
  save() {
    return db.execute(
      'INSERT INTO products (title, price, imageUrl, description, author) VALUES (?,?,?,?,?)',
      [this.title, this.price, this.description, this.imageUrl, this.author]
    );
  }
  static fetchAll() {
    return db.execute('SELECT * FROM products');
  }

  static findByAuthor(author) {
    return db.execute('SELECT * FROM products WHERE products.author = ?', [
      author
    ]);
  }

  static findById(id) {
    return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
  }
};
