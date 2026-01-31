const User = require('../models/User');
const Role = require('../models/Role');

module.exports = async () => {
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    if (!superAdminEmail || !superAdminPassword) {
      console.warn('Super Admin env variables not set. Skipping seeding.');
      return;
    }

    const existing = await User.findOne({ email: superAdminEmail });
    if (existing) {
      console.log('Super Admin already exists');
      return;
    }

    let superRole = await Role.findOne({ name: 'SYS-ROOT-SUPERADMIN' });
    if (!superRole) {
      superRole = await Role.create({
        name: 'SYS-ROOT-SUPERADMIN',
        permissions: [{ module: '*', actions: ['*'] }]
      });
      console.log('Super Admin role created');
    }

    await User.create({
      name: superAdminName,
      email: superAdminEmail,
      password: superAdminPassword,
      role: superRole._id
    });

    console.log('Super Admin auto-seeded successfully');
  } catch (error) {
    console.error('Error seeding Super Admin:', error.message);
  }
};
