const db = require('../util/database');

module.exports = class User {
  constructor(n, e, p) {
    this.name = n;
    this.email = e;
    this.password = p;
  }
  save() {
    // console.log('usermodel SAVE!');
    return db.execute(
      'INSERT INTO users (name, email, password) VALUES (?,?,?)',
      [this.name, this.email, this.password]
    );
  }
  static update(property, value, userId) {
    return db.execute(
      'UPDATE users SET ' + property + ' = ? WHERE users.id = ?',
      [value, userId]
    );
  }

  static fetchAll() {
    return db.execute('SELECT * FROM users');
  }

  static findByName(name) {
    return db.execute('SELECT * FROM users WHERE users.id = ?', [name]);
  }

  static findById(id) {
    return db.execute('SELECT * FROM users WHERE users.id = ?', [id]);
  }
  static findByEmail(email) {
    return db.execute('SELECT * FROM users WHERE users.email = ?', [email]);
  }
};
