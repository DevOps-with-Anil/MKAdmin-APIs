const User = require("../models/User");
const RootRole = require("../models/Role");
const RootModule = require("../models/RootModule");
const AuditLog = require("../models/AuditLog");

const SYSTEM_MODULES = require("../config/constants/defaultRootModules");

// =========================================
// 🌱 ROOT SYSTEM BOOTSTRAP
// =========================================
module.exports = async function seedRootSystem() {
  try {
    console.log("🚀 Starting Root System Bootstrap...");

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const superAdminName = process.env.SUPER_ADMIN_NAME || "ROOT ADMIN";

    // ======================================================
    // 1️⃣ SEED SYSTEM MODULES
    // ======================================================
    for (const mod of Object.values(SYSTEM_MODULES)) {
      const existingModule = await RootModule.findOne({ key: mod.key.trim() });

      if (!existingModule) {
        const createdModule = await RootModule.create({
          key: mod.key.trim(),

          moduleName: {
            en: mod.name.en.trim(),
            fr: mod.name.fr.trim(),
            ar: mod.name.ar.trim()
          },

          actions: mod.actions.map((a) => ({
            key: a.key.trim(),
            actionName: {
              en: a.name.en.trim(),
              fr: a.name.fr.trim(),
              ar: a.name.ar.trim()
            },
            isActive: true
          }))
        });

        await AuditLog.create({
          user: null,
          action: "SYSTEM_MODULE_CREATED",
          module: "SYSTEM_MODULES",
          entityId: createdModule._id,
          entityName: mod.name.en,
          message: `System module created: ${mod.key}`
        });

        console.log(`✅ Module created: ${mod.key}`);
      }
    }

    // ======================================================
    // 2️⃣ VALIDATE SUPER ADMIN ENV
    // ======================================================
    if (!superAdminEmail || !superAdminPassword) {
      console.warn(
        "⚠️ SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD missing. Skipping super admin creation."
      );
      return;
    }

    // ======================================================
    // 3️⃣ CREATE ROOT ROLE
    // ======================================================
    let superRole = await RootRole.findOne({ "name.en": "ROOT ADMIN" });

    if (!superRole) {
      superRole = await RootRole.create({
        name: {
          en: "ROOT ADMIN",
          fr: "ADMINISTRATEUR RACINE",
          ar: "المسؤول الجذري"
        },
        description: {
          en: "Default Root Admin with full system access",
          fr: "Administrateur racine avec accès complet",
          ar: "المسؤول الجذري مع وصول كامل للنظام"
        },
        permissions: [],
        status: true
      });

      await AuditLog.create({
        user: null,
        action: "SYSTEM_ROLE_CREATED",
        module: "ROLES",
        entityId: superRole._id,
        entityName: superRole.name.en,
        message: "ROOT ADMIN role created by bootstrap"
      });

      console.log("✅ ROOT ADMIN role created");
    }

    // ======================================================
    // 4️⃣ CREATE SUPER ADMIN USER
    // ======================================================
    const normalizedEmail = superAdminEmail.toLowerCase().trim();

    let existingUser = await User.findOne({ email: normalizedEmail });

    if (!existingUser) {
      const superAdminUser = await User.create({
        name: superAdminName.trim(),
        email: normalizedEmail,
        password: superAdminPassword,
        role: superRole._id,
        status: "ACTIVE"
      });

      await AuditLog.create({
        user: null,
        action: "SYSTEM_SUPER_ADMIN_CREATED",
        module: "USERS",
        entityId: superAdminUser._id,
        entityName: superAdminUser.email,
        message: "Super Admin created by bootstrap"
      });

      console.log("🎉 Super Admin user created");
    } else {
      console.log("ℹ️ Super Admin already exists");
    }

    console.log("✅ Root System Bootstrap completed");
  } catch (error) {
    console.error("❌ Bootstrap Error:", error);
  }
};
