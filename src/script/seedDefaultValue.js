/**
 * ======================================================
 * ROOT SYSTEM BOOTSTRAP SEEDER (WITH AUDIT LOGGING)
 * ======================================================
 *
 * PURPOSE:
 * --------
 * Seeds critical system data and logs all system-level
 * changes into Audit Logs for traceability.
 *
 * NOTE:
 * -----
 * Audit actor is SYSTEM (no human user).
 * This script is idempotent and safe to run multiple times.
 */

const User = require('../models/User');
const RootRole = require('../models/Role');
const RootModule = require('../models/RootModule');
const SYSTEM_MODULES = require('../config/constants/defaultRootModules');
const AuditLog = require('../models/AuditLog'); 

// System Actor (virtual user for audit)
const SYSTEM_ACTOR = {
  _id: null,
  name: 'SYSTEM',
  email: 'system@root'
};

module.exports = async function seedRootSystem() {
  try {
    console.log('🚀 Starting Root System Bootstrap with Audit Logs...');

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const superAdminName = process.env.SUPER_ADMIN_NAME || 'ROOT ADMIN';

    /**
     * ======================================================
     * 1️⃣ SEED SYSTEM MODULES & ACTIONS
     * ======================================================
     */
    for (const mod of Object.values(SYSTEM_MODULES)) {
      const result = await RootModule.updateOne(
        { key: mod.key.trim() },
        {
          $setOnInsert: {
            key: mod.key.trim(),
            modulename: mod.name.trim(),
            actions: mod.actions.map(a => ({
              key: a.key.trim(),
              actionsname: a.name.trim()
            }))
          }
        },
        { upsert: true }
      );

      // 📝 Audit only if newly inserted
      if (result.upsertedCount > 0) {
        await AuditLog.create({
          user: null,
          action: 'SYSTEM_MODULE_CREATED',
          module: 'SYSTEM_MODULES',
          entityName: mod.name,
          message: `System module created: ${mod.key}`,
          meta: { moduleKey: mod.key }
        });
      }
    }

    /**
     * ======================================================
     * 2️⃣ VALIDATE SUPER ADMIN ENV CONFIG
     * ======================================================
     */
    if (!superAdminEmail || !superAdminPassword) {
      console.warn('⚠️ Super Admin env vars missing. Skipping Super Admin user.');
      return;
    }

    /**
     * ======================================================
     * 3️⃣ FIND OR CREATE ROOT ADMIN ROLE
     * ======================================================
     */
    let superRole = await RootRole.findOne({ name: 'ROOT ADMIN' });

    if (!superRole) {
      superRole = await RootRole.create({
        name: 'ROOT ADMIN',
        description: 'Default Root Admin with full system access',
        permissions: [],
        status: true
      });

      // 📝 Audit ROOT ADMIN role creation
      await AuditLog.create({
        user: null,
        action: 'SYSTEM_ROLE_CREATED',
        module: 'ROLES',
        entityId: superRole._id,
        entityName: superRole.name,
        message: 'ROOT ADMIN role created by system bootstrap'
      });

      console.log('✅ ROOT ADMIN role created');
    }

    /**
     * ======================================================
     * 4️⃣ FIND OR CREATE SUPER ADMIN USER
     * ======================================================
     */
    const normalizedEmail = superAdminEmail.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      console.log('ℹ️ Super Admin user already exists');
      return;
    }

    const superAdminUser = await User.create({
      name: superAdminName.trim(),
      email: normalizedEmail,
      password: superAdminPassword,
      role: superRole._id,
      status: 'ACTIVE'
    });

    // 📝 Audit Super Admin user creation
    await AuditLog.create({
      user: null,
      action: 'SYSTEM_SUPER_ADMIN_CREATED',
      module: 'USERS',
      entityId: superAdminUser._id,
      entityName: superAdminUser.email,
      message: 'Super Admin user created by system bootstrap'
    });

    console.log('🎉 Super Admin user created with audit logs');
    console.log('✅ Root System Bootstrap completed successfully');

  } catch (error) {
    console.error('❌ Error during Root System Bootstrap with Audit Logs:', error);
  }

};
