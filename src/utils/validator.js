const validator = require('validator');

module.exports = {
  isValidEmail(v) {
    return validator.isEmail((v || '').toString()); // Validate standard email format
  },

  isValidPhone(v) {
    return validator.isMobilePhone((v || '').toString(), 'any', {
      strictMode: false // Allow relaxed phone validation for international numbers
    });
  },

  isValidPassword(v) {
    return validator.isStrongPassword((v || '').toString(), {
      minLength: 8,      // Minimum password length
      minLowercase: 1,   // Require at least one lowercase letter
      minUppercase: 1,   // Require at least one uppercase letter
      minNumbers: 1,     // Require at least one number
      minSymbols: 1      // Require at least one special character
    });
  },

  isValidName(v) {
    return validator.isLength((v || '').toString().trim(), {
      min: 2,            // Minimum name length
      max: 50            // Maximum name length
    });
  },

  isValidObjectId(v) {
    return validator.isMongoId((v || '').toString()); // Validate MongoDB ObjectId format
  }
};
