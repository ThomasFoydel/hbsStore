const db = require('../util/database');

module.exports = class CartItem {
  constructor(p, c, pr, iU, s) {
    console.log('req constructor: ', p, c, pr, iU, s);
    this.product = p;
    this.customer = c;
    this.price = pr;
    this.imageUrl = iU;
    this.seller = s;
  }
  save() {
    return db.execute(
      'INSERT INTO cartItems (product, customer, price, imageUrl, seller) VALUES (?,?,?,?,?)',
      [this.product, this.customer, this.price, this.imageUrl, this.seller]
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
