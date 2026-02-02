// const User = require('../models/User');
// const Role = require('../models/Role');

// module.exports = async () => {
//   try {
//     const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
//     const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
//     const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

//     if (!superAdminEmail || !superAdminPassword) {
//       console.warn('Super Admin env variables not set. Skipping seeding.');
//       return;
//     }

//     const existing = await User.findOne({ email: superAdminEmail });
//     if (existing) {
//       console.log('Super Admin already exists');
//       return;
//     }

//     let superRole = await Role.findOne({ name: 'SYS-ROOT-SUPERADMIN' });
//     if (!superRole) {
//       superRole = await Role.create({
//         name: 'SYS-ROOT-SUPERADMIN',
//         description: "This is deafult Root Admin",
//         permissions: [{ module: '*', actions: ['*'] }]
//       });
//       console.log('Super Admin role created');
//     }

//     await User.create({
//       name: superAdminName,
//       email: superAdminEmail,
//       password: superAdminPassword,
//       role: superRole._id
//     });

//     console.log('Super Admin auto-seeded successfully');
//   } catch (error) {
//     console.error('Error seeding Super Admin:', error.message);
//   }
// };



const User = require('../models/User');
const RootRole = require('../models/Role');

module.exports = async () => {
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    if (!superAdminEmail || !superAdminPassword) {
      console.warn('Super Admin env variables not set. Skipping seeding.');
      return;
    }

    // 1️⃣ Check if Super Admin already exists
    const existing = await User.findOne({ email: superAdminEmail });
    if (existing) {
      console.log('Super Admin already exists');
      return;
    }

    // 2️⃣ Find or Create Super Admin Role
    let superRole = await RootRole.findOne({ name: 'SUPER ADMIN' });

    if (!superRole) {
      superRole = await RootRole.create({
        name: 'SUPER ADMIN',
        description: 'Default Root Super Admin with full access',
        permissions: [
          {
            moduleName: '*',
            actions: ['*']
          }
        ],
        status: 'ACTIVE'
      });

      console.log('Super Admin role created');
    }

    // 3️⃣ Create Super Admin User
    await User.create({
      name: superAdminName,
      email: superAdminEmail.toLowerCase().trim(),
      password: superAdminPassword,
      role: superRole._id,
      status: 'ACTIVE'
      // createdBy: null (system)
    });

    console.log('Super Admin auto-seeded successfully');
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
  }
};
