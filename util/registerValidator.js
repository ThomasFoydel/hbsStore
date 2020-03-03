const User = require('../models/user');

module.exports = async ({ name, email, password, confirmpassword }) => {
  let errors = {};
  if (!name) {
    errors.nameMissing = true;
  }
  if (!email) {
    errors.emailMissing = true;
  }
  if (!password) {
    errors.passwordMissing = true;
  }
  if (!confirmpassword) {
    errors.confirmpasswordMissing = true;
  }
  if (password !== confirmpassword) {
    errors.passwordsNotMatch = true;
  }
  if (password && (password.length < 8 || password.length > 25)) {
    errors.passwordWrongLength = true;
  }
  if (name && (name.length < 6 || name.length > 25)) {
    errors.nameWrongLength = true;
  }
  const foundEmail = await User.findByEmail(email);

  if (foundEmail[0].length !== 0) {
    errors.userEmailAlreadyExists = true;
  }

  const foundName = await User.findByName(name);
  if (foundName[0].length !== 0) {
    errors.userNameAlreadyExists = true;
  }

  errors.size = function(obj) {
    var total = 0,
      key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) total++;
    }
    return total - 1;
  };

  return errors;
};
