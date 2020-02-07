const db = require('../util/database');

module.exports = class CartItem {
  constructor(p, c) {
    this.product = p;
    this.customer = c;
  }
  save() {
    return db.execute(
      'INSERT INTO cartItems (product, customer) VALUES (?,?)',
      [this.product, this.customer]
    );
  }
  static fetchAll() {
    return db.execute('SELECT * FROM cartItems');
  }

  static findById(id) {
    return db.execute('SELECT * FROM cartItems WHERE cartItems.id = ?', [id]);
  }
  static findByUser(userId) {
    return db.execute('SELECT * FROM cartItems WHERE cartItems.customer = ?', [
      userId
    ]);
  }
  static findByUserAndItem(userId, productId) {
    return db.execute(
      'SELECT * FROM cartItems WHERE cartItems.customer = ? AND cartItems.product = ?',
      [userId, productId]
    );
  }
};
