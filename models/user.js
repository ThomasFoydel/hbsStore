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
  static fetchAll() {
    return db.execute('SELECT * FROM users');
  }

  static findById(id) {
    return db.execute('SELECT * FROM users WHERE users.id = ?', [id]);
  }
  static findByEmail(email) {
    console.log('find by email');
    return db.execute('SELECT * FROM users WHERE users.email = ?', [email]);
  }
};
