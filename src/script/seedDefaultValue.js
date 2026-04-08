const User = require("../models/rbac/RootAdmin");
const RootRole = require("../models/rbac/SystemRole");
const RootModule = require("../models/rbac/SystemModule");
const AuditLog = require("../models/audit/AuditLog");

const ROOT_SYSTEM_MODULES = require("../config/constants/defaultRootModules");
const AFFILIATE_SYSTEM_MODULES = require("../config/constants/defaultTenantModules");

const AffiliateModule = require("../models/rbac/TenantModule");
const { isSystemRole } = require("../utils/rbac");

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
    // 1️⃣ SEED ROOT SYSTEM MODULES
    // ======================================================
    for (const mod of Object.values(ROOT_SYSTEM_MODULES)) {
      const existingModule = await RootModule.findOne({ key: mod.key.trim() });

      if (!existingModule) {
        const createdModule = await RootModule.create({
          key: mod.key.trim(),
          moduleName: {
            en: mod.name.en.trim(),
            fr: mod.name.fr.trim(),
            
          },
          actions: mod.actions.map((a) => ({
            key: a.key.trim(),
            actionName: {
              en: a.name.en.trim(),
              fr: a.name.fr.trim(),
              
            },
            isActive: true
          }))
        });

        await AuditLog.create({
          userId: null,
          userType: "ROOT",
          action: "SYSTEM_MODULE_CREATED",
          module: mod.key,
          entityId: createdModule._id,
          entityName: mod.name.en,
          message: "Default system module created by bootstrap",
          status: "SUCCESS"
        });

        console.log(`✅ Root Module created: ${mod.key}`);
      }
    }

    // ======================================================
    // 2️⃣ SEED AFFILIATE SYSTEM MODULES
    // ======================================================
    for (const mod of Object.values(AFFILIATE_SYSTEM_MODULES)) {
      const existingModule = await AffiliateModule.findOne({
        key: mod.key.trim()
      });

      if (!existingModule) {
        const createdModule = await AffiliateModule.create({
          key: mod.key.trim(),
          moduleName: {
            en: mod.name.en.trim(),
            fr: mod.name.fr.trim(),
          },
          actions: mod.actions.map((a) => ({
            key: a.key.trim(),
            actionName: {
              en: a.name.en.trim(),
              fr: a.name.fr.trim(),
            },
            isActive: true
          }))
        });

        await AuditLog.create({
          userId: null,
          userType: "ROOT",
          action: "TENANT_MODULE_CREATED",
          module: mod.key,
          entityId: createdModule._id,
          entityName: mod.name.en,
          message: "Default affiliate module created by bootstrap",
          status: "SUCCESS"
        });

        console.log(`✅ Affiliate Module created: ${mod.key}`);
      }
    }

    // ======================================================
    // 3️⃣ VALIDATE SUPER ADMIN ENV
    // ======================================================
    if (!superAdminEmail || !superAdminPassword) {
      console.warn(
        "⚠️ SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD missing. Skipping super admin creation."
      );
      return;
    }

    // ======================================================
    // 4️⃣ CREATE ROOT ROLE
    // ======================================================
    let superRole = await RootRole.findOne({ "name.en": "ROOT ADMIN" });

    if (!superRole) {
      superRole = await RootRole.create({
        name: {
          en: "ROOT ADMIN",
          fr: "ADMINISTRATEUR RACINE",
        },
        description: {
          en: "Default Root Admin with full system access",
          fr: "Administrateur racine avec accès complet",
        },
        permissions: [],
        status: "ACTIVE",
        isSystemRole: true
      });

      await AuditLog.create({
        userId: null,
        userType: "ROOT",
        action: "ROOT_ROLE_CREATED",
        module: "ROLES",
        entityId: superRole._id,
        entityName: superRole.name.en,
        message: "Root admin role created by bootstrap",
        status: "SUCCESS"
      });

      console.log("✅ ROOT ADMIN role created");
    }

    // ======================================================
    // 5️⃣ CREATE SUPER ADMIN USER
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
        userId: null,
        userType: "ROOT",
        action: "SYSTEM_ROOT_ADMIN_CREATED",
        module: "USERS",
        entityId: superAdminUser._id,
        entityName: superAdminUser.email,
        message: "Super admin created by bootstrap",
        status: "SUCCESS"
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