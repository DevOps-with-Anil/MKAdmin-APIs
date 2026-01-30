const User = require('../models/User');
const Role = require('../models/Role');

module.exports = async () => {
  const existing = await User.findOne({ email: 'super@admin.com' });
  if (existing) {
    console.log('Super Admin already exists');
    return;
  }

  let superRole = await Role.findOne({ name: 'SUPER_ADMIN' });
  if (!superRole) {
    superRole = await Role.create({
      name: 'SYS-ROOT-SUPERADMIN',
      permissions: [{ module: '*', actions: ['*'] }]
    });
  }

  await User.create({
    name: 'Super Admin',
    email: 'super@admin.com',
    password: 'admin123',
    role: superRole._id
  });

  console.log('Super Admin auto-seeded');
};
