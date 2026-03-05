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
    // 3️⃣ CREATE/UPDATE DEFAULT ROLES
    // ======================================================
    const upsertSystemRole = async ({ name, description, permissions }) => {
      const existingRole = await RootRole.findOne({ "name.en": name.en });

      const role = await RootRole.findOneAndUpdate(
        { "name.en": name.en },
        {
          $set: {
            name,
            description,
            permissions,
            status: true
          }
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      if (!existingRole) {
        await AuditLog.create({
          user: null,
          action: "SYSTEM_ROLE_CREATED",
          module: "ROLES",
          entityId: role._id,
          entityName: role.name.en,
          message: `${role.name.en} role created by bootstrap`
        });
        console.log(`✅ ${role.name.en} role created`);
      } else {
        console.log(`🔄 ${role.name.en} role permissions refreshed`);
      }

      return role;
    };

    const superRole = await upsertSystemRole({
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
      permissions: [
        { moduleKey: 'SYS_MODULES', allowed: true, actions: [
          { actionKey: 'SYS_MODULE_ADD', allowed: true },
          { actionKey: 'SYS_MODULE_VIEW', allowed: true },
          { actionKey: 'SYS_MODULE_UPDATE', allowed: true },
          { actionKey: 'SYS_MODULE_DISABLE', allowed: true },
          { actionKey: 'SYS_MODULE_ADD_ACTION', allowed: true },
          { actionKey: 'SYS_MODULE_UPDATE_ACTION', allowed: true },
          { actionKey: 'SYS_MODULE_DISABLE_ACTION', allowed: true }
        ]},
        { moduleKey: 'SYS_ROLES', allowed: true, actions: [
          { actionKey: 'SYS_ROLE_ADD', allowed: true },
          { actionKey: 'SYS_ROLE_VIEW', allowed: true },
          { actionKey: 'SYS_ROLE_UPDATE', allowed: true },
          { actionKey: 'SYS_ROLE_DELETE', allowed: true },
          { actionKey: 'SYS_ROLE_ASSIGN_PERMISSIONS', allowed: true }
        ]},
        { moduleKey: 'SYS_ADMINS', allowed: true, actions: [
          { actionKey: 'SYS_ADMIN_ADD', allowed: true },
          { actionKey: 'SYS_ADMIN_VIEW', allowed: true },
          { actionKey: 'SYS_ADMIN_UPDATE', allowed: true },
          { actionKey: 'SYS_ADMIN_DELETE', allowed: true },
          { actionKey: 'SYS_ADMIN_RESET_PASSWORD', allowed: true },
          { actionKey: 'SYS_ADMIN_CHANGE_STATUS', allowed: true },
          { actionKey: 'SYS_ADMIN_FORCE_LOGOUT', allowed: true }
        ]},
        { moduleKey: 'SUBSCRIPTION_PLANS', allowed: true, actions: [
          { actionKey: 'SUB_PLAN_ADD', allowed: true },
          { actionKey: 'SUB_PLAN_VIEW', allowed: true },
          { actionKey: 'SUB_PLAN_UPDATE', allowed: true },
          { actionKey: 'SUB_PLAN_DELETE', allowed: true },
          { actionKey: 'SUB_PLAN_ASSIGN_FEATURES', allowed: true },
          { actionKey: 'SUB_PLAN_CLONE', allowed: true },
          { actionKey: 'SUB_PLAN_DISABLE', allowed: true }
        ]},
        { moduleKey: 'AFFILIATES', allowed: true, actions: [
          { actionKey: 'AFFILIATE_CREATE', allowed: true },
          { actionKey: 'AFFILIATE_VIEW', allowed: true },
          { actionKey: 'AFFILIATE_UPDATE', allowed: true },
          { actionKey: 'AFFILIATE_DELETE', allowed: true },
          { actionKey: 'AFFILIATE_RESTORE', allowed: true },
          { actionKey: 'AFFILIATE_SUSPEND', allowed: true },
          { actionKey: 'AFFILIATE_REACTIVATE', allowed: true },
          { actionKey: 'AFFILIATE_TERMINATE', allowed: true },
          { actionKey: 'AFFILIATE_KYB_VIEW_ALL', allowed: true },
          { actionKey: 'AFFILIATE_KYB_VIEW', allowed: true },
          { actionKey: 'AFFILIATE_KYB_VERIFY', allowed: true },
          { actionKey: 'AFFILIATE_KYB_REJECT', allowed: true },
          { actionKey: 'AFFILIATE_KYB_SUSPEND', allowed: true },
          { actionKey: 'AFFILIATE_KYB_MARK_EXPIRED', allowed: true },
          { actionKey: 'AFFILIATE_KYB_NOTIFY', allowed: true },
          { actionKey: 'AFFILIATE_MARK_COMPLIANT', allowed: true },
          { actionKey: 'AFFILIATE_MARK_NON_COMPLIANT', allowed: true },
          { actionKey: 'AFFILIATE_ASSIGN_PLAN', allowed: true },
          { actionKey: 'AFFILIATE_CHANGE_PLAN', allowed: true },
          { actionKey: 'AFFILIATE_VIEW_BILLING', allowed: true },
          { actionKey: 'AFFILIATE_ADJUST_BILLING', allowed: true },
          { actionKey: 'AFFILIATE_UPDATE_BRANDING', allowed: true },
          { actionKey: 'AFFILIATE_SET_DOMAIN', allowed: true },
          { actionKey: 'AFFILIATE_SET_EMAIL_SMTP', allowed: true },
          { actionKey: 'AFFILIATE_IMPERSONATE', allowed: true },
          { actionKey: 'AFFILIATE_FORCE_LOGOUT_ALL', allowed: true },
          { actionKey: 'AFFILIATE_VIEW_AUDIT_LOGS', allowed: true },
          { actionKey: 'AFFILIATE_VIEW_ACTIVITY', allowed: true },
          { actionKey: 'AFFILIATE_VIEW_RISK_SCORE', allowed: true },
          { actionKey: 'AFFILIATE_EXPORT_DATA', allowed: true },
          { actionKey: 'AFFILIATE_PURGE_DATA', allowed: true }
        ]},
        { moduleKey: 'SYS_AUDIT_LOGS', allowed: true, actions: [
          { actionKey: 'SYS_AUDIT_VIEW', allowed: true },
          { actionKey: 'SYS_AUDIT_EXPORT', allowed: true }
        ]},
        { moduleKey: 'MODULES_ACTIONS', allowed: true, actions: [
          { actionKey: 'MOD_ACT_VIEW', allowed: true },
          { actionKey: 'MOD_ACT_ADD', allowed: true },
          { actionKey: 'MOD_ACT_UPDATE', allowed: true },
          { actionKey: 'MOD_ACT_DELETE', allowed: true },
          { actionKey: 'MOD_ACT_ADD_ACTION', allowed: true },
          { actionKey: 'MOD_ACT_UPDATE_ACTION', allowed: true },
          { actionKey: 'MOD_ACT_DELETE_ACTION', allowed: true },
          { actionKey: 'MOD_ACT_REORDER', allowed: true }
        ]},
        { moduleKey: 'PERMISSION_PACKAGES', allowed: true, actions: [
          { actionKey: 'PERM_PKG_VIEW', allowed: true },
          { actionKey: 'PERM_PKG_ADD', allowed: true },
          { actionKey: 'PERM_PKG_UPDATE', allowed: true },
          { actionKey: 'PERM_PKG_DELETE', allowed: true },
          { actionKey: 'PERM_PKG_ASSIGN', allowed: true }
        ]},
        { moduleKey: 'SETTINGS', allowed: true, actions: [
          { actionKey: 'SETTINGS_VIEW', allowed: true },
          { actionKey: 'SETTINGS_UPDATE', allowed: true },
          { actionKey: 'SETTINGS_RESET', allowed: true },
          { actionKey: 'SETTINGS_EXPORT', allowed: true }
        ]},
        { moduleKey: 'COUNTRIES', allowed: true, actions: [
          { actionKey: 'COUNTRY_VIEW', allowed: true },
          { actionKey: 'COUNTRY_ADD', allowed: true },
          { actionKey: 'COUNTRY_UPDATE', allowed: true },
          { actionKey: 'COUNTRY_DELETE', allowed: true },
          { actionKey: 'COUNTRY_SET_DEFAULT', allowed: true }
        ]},
        { moduleKey: 'SUB_ADMINS', allowed: true, actions: [
          { actionKey: 'SUB_ADMIN_VIEW', allowed: true },
          { actionKey: 'SUB_ADMIN_ADD', allowed: true },
          { actionKey: 'SUB_ADMIN_UPDATE', allowed: true },
          { actionKey: 'SUB_ADMIN_DELETE', allowed: true },
          { actionKey: 'SUB_ADMIN_RESET_PASSWORD', allowed: true },
          { actionKey: 'SUB_ADMIN_CHANGE_STATUS', allowed: true },
          { actionKey: 'SUB_ADMIN_ASSIGN_ROLE', allowed: true }
        ]},
        { moduleKey: 'CMS', allowed: true, actions: [
          { actionKey: 'CMS_VIEW', allowed: true },
          { actionKey: 'CMS_ADD', allowed: true },
          { actionKey: 'CMS_UPDATE', allowed: true },
          { actionKey: 'CMS_DELETE', allowed: true },
          { actionKey: 'CMS_PUBLISH', allowed: true },
          { actionKey: 'CMS_UNPUBLISH', allowed: true }
        ]},
        { moduleKey: 'ARTICLES', allowed: true, actions: [
          { actionKey: 'ARTICLE_VIEW', allowed: true },
          { actionKey: 'ARTICLE_ADD', allowed: true },
          { actionKey: 'ARTICLE_UPDATE', allowed: true },
          { actionKey: 'ARTICLE_DELETE', allowed: true },
          { actionKey: 'ARTICLE_PUBLISH', allowed: true },
          { actionKey: 'ARTICLE_UNPUBLISH', allowed: true },
          { actionKey: 'ARTICLE_FEATURED', allowed: true }
        ]},
        { moduleKey: 'VIDEOS', allowed: true, actions: [
          { actionKey: 'VIDEO_VIEW', allowed: true },
          { actionKey: 'VIDEO_ADD', allowed: true },
          { actionKey: 'VIDEO_UPDATE', allowed: true },
          { actionKey: 'VIDEO_DELETE', allowed: true },
          { actionKey: 'VIDEO_PUBLISH', allowed: true },
          { actionKey: 'VIDEO_UNPUBLISH', allowed: true },
          { actionKey: 'VIDEO_FEATURED', allowed: true }
        ]},
        { moduleKey: 'CATEGORIES', allowed: true, actions: [
          { actionKey: 'CATEGORY_VIEW', allowed: true },
          { actionKey: 'CATEGORY_ADD', allowed: true },
          { actionKey: 'CATEGORY_UPDATE', allowed: true },
          { actionKey: 'CATEGORY_DELETE', allowed: true },
          { actionKey: 'CATEGORY_REORDER', allowed: true }
        ]},
        { moduleKey: 'CHALLENGES', allowed: true, actions: [
          { actionKey: 'CHALLENGE_VIEW', allowed: true },
          { actionKey: 'CHALLENGE_ADD', allowed: true },
          { actionKey: 'CHALLENGE_UPDATE', allowed: true },
          { actionKey: 'CHALLENGE_DELETE', allowed: true },
          { actionKey: 'CHALLENGE_PUBLISH', allowed: true },
          { actionKey: 'CHALLENGE_UNPUBLISH', allowed: true },
          { actionKey: 'CHALLENGE_FEATURED', allowed: true }
        ]},
        { moduleKey: 'ADS', allowed: true, actions: [
          { actionKey: 'AD_VIEW', allowed: true },
          { actionKey: 'AD_ADD', allowed: true },
          { actionKey: 'AD_UPDATE', allowed: true },
          { actionKey: 'AD_DELETE', allowed: true },
          { actionKey: 'AD_PUBLISH', allowed: true },
          { actionKey: 'AD_UNPUBLISH', allowed: true },
          { actionKey: 'AD_APPROVE', allowed: true },
          { actionKey: 'AD_REJECT', allowed: true }
        ]},
        { moduleKey: 'SUPPORT_TICKETS', allowed: true, actions: [
          { actionKey: 'TICKET_VIEW', allowed: true },
          { actionKey: 'TICKET_ADD', allowed: true },
          { actionKey: 'TICKET_UPDATE', allowed: true },
          { actionKey: 'TICKET_DELETE', allowed: true },
          { actionKey: 'TICKET_ASSIGN', allowed: true },
          { actionKey: 'TICKET_CLOSE', allowed: true },
          { actionKey: 'TICKET_REOPEN', allowed: true },
          { actionKey: 'TICKET_ESCALATE', allowed: true }
        ]},
        { moduleKey: 'POLICIES_FAQ', allowed: true, actions: [
          { actionKey: 'POLICY_VIEW', allowed: true },
          { actionKey: 'POLICY_ADD', allowed: true },
          { actionKey: 'POLICY_UPDATE', allowed: true },
          { actionKey: 'POLICY_DELETE', allowed: true },
          { actionKey: 'FAQ_VIEW', allowed: true },
          { actionKey: 'FAQ_ADD', allowed: true },
          { actionKey: 'FAQ_UPDATE', allowed: true },
          { actionKey: 'FAQ_DELETE', allowed: true }
        ]},
        { moduleKey: 'PROFILE', allowed: true, actions: [
          { actionKey: 'PROFILE_VIEW', allowed: true },
          { actionKey: 'PROFILE_UPDATE', allowed: true },
          { actionKey: 'PROFILE_CHANGE_PASSWORD', allowed: true },
          { actionKey: 'PROFILE_UPDATE_AVATAR', allowed: true }
        ]},
        { moduleKey: 'VERIFICATION', allowed: true, actions: [
          { actionKey: 'VERIFICATION_VIEW', allowed: true },
          { actionKey: 'VERIFICATION_APPROVE', allowed: true },
          { actionKey: 'VERIFICATION_REJECT', allowed: true },
          { actionKey: 'VERIFICATION_REVIEW', allowed: true },
          { actionKey: 'VERIFICATION_REVERT', allowed: true }
        ]},
        { moduleKey: 'AUDIT_LOGS', allowed: true, actions: [
          { actionKey: 'AUDIT_VIEW', allowed: true },
          { actionKey: 'AUDIT_EXPORT', allowed: true },
          { actionKey: 'AUDIT_DELETE', allowed: true }
        ]}
      ]
    });

    const managerRole = await upsertSystemRole({
      name: {
        en: "MANAGER",
        fr: "GESTIONNAIRE",
        ar: "مدير"
      },
      description: {
        en: "Manager with plans and affiliate operations access",
        fr: "Gestionnaire avec accès aux plans et opérations affiliés",
        ar: "مدير مع وصول إلى الخطط وعمليات الشركاء"
      },
      permissions: [
        { moduleKey: 'SYS_MODULES', allowed: false, actions: [] },
        { moduleKey: 'SYS_ROLES', allowed: false, actions: [] },
        { moduleKey: 'SYS_ADMINS', allowed: false, actions: [] },
        { moduleKey: 'SUBSCRIPTION_PLANS', allowed: true, actions: [
          { actionKey: 'SUB_PLAN_VIEW', allowed: true },
          { actionKey: 'SUB_PLAN_ADD', allowed: true },
          { actionKey: 'SUB_PLAN_UPDATE', allowed: true }
        ]},
        { moduleKey: 'AFFILIATES', allowed: true, actions: [
          { actionKey: 'AFFILIATE_CREATE', allowed: true },
          { actionKey: 'AFFILIATE_VIEW', allowed: true },
          { actionKey: 'AFFILIATE_UPDATE', allowed: true },
          { actionKey: 'AFFILIATE_DELETE', allowed: true },
          { actionKey: 'AFFILIATE_RESTORE', allowed: true },
          { actionKey: 'AFFILIATE_SUSPEND', allowed: true },
          { actionKey: 'AFFILIATE_REACTIVATE', allowed: true },
          { actionKey: 'AFFILIATE_TERMINATE', allowed: true },
          { actionKey: 'AFFILIATE_KYB_VIEW_ALL', allowed: true },
          { actionKey: 'AFFILIATE_KYB_VIEW', allowed: true },
          { actionKey: 'AFFILIATE_KYB_VERIFY', allowed: true },
          { actionKey: 'AFFILIATE_KYB_REJECT', allowed: true },
          { actionKey: 'AFFILIATE_KYB_SUSPEND', allowed: true },
          { actionKey: 'AFFILIATE_KYB_MARK_EXPIRED', allowed: true },
          { actionKey: 'AFFILIATE_KYB_NOTIFY', allowed: true },
          { actionKey: 'AFFILIATE_MARK_COMPLIANT', allowed: true },
          { actionKey: 'AFFILIATE_MARK_NON_COMPLIANT', allowed: true },
          { actionKey: 'AFFILIATE_ASSIGN_PLAN', allowed: true },
          { actionKey: 'AFFILIATE_CHANGE_PLAN', allowed: true },
          { actionKey: 'AFFILIATE_VIEW_BILLING', allowed: true },
          { actionKey: 'AFFILIATE_ADJUST_BILLING', allowed: true },
          { actionKey: 'AFFILIATE_UPDATE_BRANDING', allowed: true },
          { actionKey: 'AFFILIATE_SET_DOMAIN', allowed: true },
          { actionKey: 'AFFILIATE_SET_EMAIL_SMTP', allowed: true },
          { actionKey: 'AFFILIATE_IMPERSONATE', allowed: true },
          { actionKey: 'AFFILIATE_FORCE_LOGOUT_ALL', allowed: true },
          { actionKey: 'AFFILIATE_VIEW_AUDIT_LOGS', allowed: true },
          { actionKey: 'AFFILIATE_VIEW_ACTIVITY', allowed: true },
          { actionKey: 'AFFILIATE_VIEW_RISK_SCORE', allowed: true },
          { actionKey: 'AFFILIATE_EXPORT_DATA', allowed: true },
          { actionKey: 'AFFILIATE_PURGE_DATA', allowed: true }
        ]},
        { moduleKey: 'SYS_AUDIT_LOGS', allowed: false, actions: [] }
      ]
    });

    const subAdminRole = await upsertSystemRole({
      name: {
        en: "SUB ADMIN",
        fr: "SOUS-ADMINISTRATEUR",
        ar: "مدير فرعي"
      },
      description: {
        en: "Sub Admin with limited plans and affiliate access",
        fr: "Sous-admin avec accès limité aux plans et affiliés",
        ar: "مدير فرعي مع وصول محدود إلى الخطط والشركاء"
      },
      permissions: [
        { moduleKey: 'SYS_MODULES', allowed: false, actions: [] },
        { moduleKey: 'SYS_ROLES', allowed: false, actions: [] },
        { moduleKey: 'SYS_ADMINS', allowed: false, actions: [] },
        { moduleKey: 'SUBSCRIPTION_PLANS', allowed: true, actions: [
          { actionKey: 'SUB_PLAN_VIEW', allowed: true }
        ]},
        { moduleKey: 'AFFILIATES', allowed: true, actions: [
          { actionKey: 'AFFILIATE_VIEW', allowed: true },
          { actionKey: 'AFFILIATE_UPDATE', allowed: true },
          { actionKey: 'AFFILIATE_KYB_VIEW', allowed: true },
          { actionKey: 'AFFILIATE_KYB_VIEW_ALL', allowed: true },
          { actionKey: 'AFFILIATE_KYB_VERIFY', allowed: true },
          { actionKey: 'AFFILIATE_KYB_REJECT', allowed: true }
        ]},
        { moduleKey: 'SYS_AUDIT_LOGS', allowed: false, actions: [] }
      ]
    });

    const supportRole = await upsertSystemRole({
      name: {
        en: "SUPPORT",
        fr: "SUPPORT",
        ar: "دعم فني"
      },
      description: {
        en: "Support role with view-only access",
        fr: "Rôle support avec accès en lecture seule",
        ar: "دور دعم بوصول عرض فقط"
      },
      permissions: [
        { moduleKey: 'SYS_MODULES', allowed: true, actions: [
          { actionKey: 'SYS_MODULE_VIEW', allowed: true }
        ]},
        { moduleKey: 'SYS_ROLES', allowed: true, actions: [
          { actionKey: 'SYS_ROLE_VIEW', allowed: true }
        ]},
        { moduleKey: 'SYS_ADMINS', allowed: true, actions: [
          { actionKey: 'SYS_ADMIN_VIEW', allowed: true }
        ]},
        { moduleKey: 'SUBSCRIPTION_PLANS', allowed: true, actions: [
          { actionKey: 'SUB_PLAN_VIEW', allowed: true }
        ]},
        { moduleKey: 'AFFILIATES', allowed: true, actions: [
          { actionKey: 'AFFILIATE_VIEW', allowed: true },
          { actionKey: 'AFFILIATE_KYB_VIEW', allowed: true },
          { actionKey: 'AFFILIATE_KYB_VIEW_ALL', allowed: true },
          { actionKey: 'AFFILIATE_VIEW_ACTIVITY', allowed: true },
          { actionKey: 'AFFILIATE_VIEW_AUDIT_LOGS', allowed: true }
        ]},
        { moduleKey: 'SYS_AUDIT_LOGS', allowed: true, actions: [
          { actionKey: 'SYS_AUDIT_VIEW', allowed: true }
        ]}
      ]
    });

    const viewerRole = await upsertSystemRole({
      name: {
        en: "VIEWER",
        fr: "LECTEUR",
        ar: "مشاهد"
      },
      description: {
        en: "Read-only viewer with affiliates and plans access",
        fr: "Lecteur en lecture seule pour affiliés et plans",
        ar: "مشاهد للقراءة فقط مع وصول للشركاء والخطط"
      },
      permissions: [
        { moduleKey: 'SYS_MODULES', allowed: false, actions: [] },
        { moduleKey: 'SYS_ROLES', allowed: false, actions: [] },
        { moduleKey: 'SYS_ADMINS', allowed: false, actions: [] },
        { moduleKey: 'SUBSCRIPTION_PLANS', allowed: true, actions: [
          { actionKey: 'SUB_PLAN_VIEW', allowed: true }
        ]},
        { moduleKey: 'AFFILIATES', allowed: true, actions: [
          { actionKey: 'AFFILIATE_VIEW', allowed: true }
        ]},
        { moduleKey: 'SYS_AUDIT_LOGS', allowed: false, actions: [] }
      ]
    });

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

    // ======================================================
    // 4.5️⃣ CREATE MANAGER USER
    // ======================================================
    const managerEmail = process.env.MANAGER_EMAIL || "manager@example.com";
    const managerPassword = process.env.MANAGER_PASSWORD || "manager123";
    const managerName = process.env.MANAGER_NAME || "Manager User";

    const normalizedManagerEmail = managerEmail.toLowerCase().trim();
    let existingManager = await User.findOne({ email: normalizedManagerEmail });

    if (!existingManager) {
      const managerUser = await User.create({
        name: managerName.trim(),
        email: normalizedManagerEmail,
        password: managerPassword,
        role: managerRole._id,
        status: "ACTIVE"
      });

      await AuditLog.create({
        user: null,
        action: "SYSTEM_MANAGER_CREATED",
        module: "USERS",
        entityId: managerUser._id,
        entityName: managerUser.email,
        message: "Manager user created by bootstrap"
      });

      console.log("🎉 Manager user created");
    } else {
      console.log("ℹ️ Manager user already exists");
    }

    // ======================================================
    // 4.6️⃣ CREATE SUB ADMIN USER
    // ======================================================
    const subAdminEmail = "subadmin@system.com";
    const subAdminPassword = "SubAdmin@123";
    const subAdminName = "Sub Admin User";

    const normalizedSubAdminEmail = subAdminEmail.toLowerCase().trim();
    let existingSubAdmin = await User.findOne({ email: normalizedSubAdminEmail });

    if (!existingSubAdmin && subAdminRole) {
      const subAdminUser = await User.create({
        name: subAdminName.trim(),
        email: normalizedSubAdminEmail,
        password: subAdminPassword,
        role: subAdminRole._id,
        status: "ACTIVE"
      });

      await AuditLog.create({
        user: null,
        action: "SYSTEM_SUB_ADMIN_CREATED",
        module: "USERS",
        entityId: subAdminUser._id,
        entityName: subAdminUser.email,
        message: "Sub Admin user created by bootstrap"
      });

      console.log("🎉 Sub Admin user created");
    } else {
      console.log("ℹ️ Sub Admin user already exists or role not found");
    }

    // ======================================================
    // 4.7️⃣ CREATE SUPPORT USER
    // ======================================================
    const supportEmail = "support@system.com";
    const supportPassword = "Support@123";
    const supportName = "Support Staff";

    const normalizedSupportEmail = supportEmail.toLowerCase().trim();
    let existingSupport = await User.findOne({ email: normalizedSupportEmail });

    if (!existingSupport && supportRole) {
      const supportUser = await User.create({
        name: supportName.trim(),
        email: normalizedSupportEmail,
        password: supportPassword,
        role: supportRole._id,
        status: "ACTIVE"
      });

      await AuditLog.create({
        user: null,
        action: "SYSTEM_SUPPORT_CREATED",
        module: "USERS",
        entityId: supportUser._id,
        entityName: supportUser.email,
        message: "Support user created by bootstrap"
      });

      console.log("🎉 Support user created");
    } else {
      console.log("ℹ️ Support user already exists or role not found");
    }

    // ======================================================
    // 4.8️⃣ CREATE VIEWER USER
    // ======================================================
    const viewerEmail = "viewer@system.com";
    const viewerPassword = "Viewer@123";
    const viewerName = "Viewer User";

    const normalizedViewerEmail = viewerEmail.toLowerCase().trim();
    let existingViewer = await User.findOne({ email: normalizedViewerEmail });

    if (!existingViewer && viewerRole) {
      const viewerUser = await User.create({
        name: viewerName.trim(),
        email: normalizedViewerEmail,
        password: viewerPassword,
        role: viewerRole._id,
        status: "ACTIVE"
      });

      await AuditLog.create({
        user: null,
        action: "SYSTEM_VIEWER_CREATED",
        module: "USERS",
        entityId: viewerUser._id,
        entityName: viewerUser.email,
        message: "Viewer user created by bootstrap"
      });

      console.log("🎉 Viewer user created");
    } else {
      console.log("ℹ️ Viewer user already exists or role not found");
    }

    console.log("✅ Root System Bootstrap completed");
  } catch (error) {
    console.error("❌ Bootstrap Error:", error);
  }
};
