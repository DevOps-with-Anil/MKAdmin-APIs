/**
 * ======================================================
 * MASTER SYSTEM MODULES & ACTION CONSTANTS
 * ======================================================
 * ROOT + SAAS + WHITELABEL PLATFORM
 *
 * IMPORTANT:
 * ----------
 * 1. NEVER change existing keys
 * 2. NEVER delete keys in production
 * 3. ONLY add new actions/modules
 * 4. Keys are permanent system identifiers
 *
 * Used in:
 * - DB (RootModule)
 * - RBAC Middleware
 * - UI Permissions
 * - Audit Logs
 * - Historical Tracking
 */

module.exports = {

  /**
   * ======================================================
   * SYSTEM MODULE REGISTRY (ROOT ONLY)
   * Controls feature & permission definitions
   * ======================================================
   */
  
  SYS_MODULES: {
    key: 'SYS_MODULES',
    name: 'System Modules',
    actions: [
      { key: 'SYS_MODULE_ADD', name: 'Add Module' },
      { key: 'SYS_MODULE_VIEW', name: 'View Modules' },
      { key: 'SYS_MODULE_UPDATE', name: 'Update Module Name' },
      { key: 'SYS_MODULE_DISABLE', name: 'Disable Module' },

      // Action-level management
      { key: 'SYS_MODULE_ADD_ACTION', name: 'Add Module Action' },
      { key: 'SYS_MODULE_UPDATE_ACTION', name: 'Update Module Action' },
      { key: 'SYS_MODULE_DISABLE_ACTION', name: 'Disable Module Action' }
    ]
  },

  /**
   * ======================================================
   * SYSTEM ROLES & PERMISSIONS
   * ======================================================
   */
  SYS_ROLES: {
    key: 'SYS_ROLES',
    name: 'System Roles',
    actions: [
      { key: 'SYS_ROLE_ADD', name: 'Add Role' },
      { key: 'SYS_ROLE_VIEW', name: 'View Roles' },
      { key: 'SYS_ROLE_UPDATE', name: 'Update Role' },
      { key: 'SYS_ROLE_DELETE', name: 'Delete Role' },

      // Permission mapping
      { key: 'SYS_ROLE_ASSIGN_PERMISSIONS', name: 'Assign Permissions to Role' }
    ]
  },

  /**
   * ======================================================
   * SYSTEM ADMINS (ROOT USERS)
   * ======================================================
   */
  SYS_ADMINS: {
    key: 'SYS_ADMINS',
    name: 'System Admins',
    actions: [
      { key: 'SYS_ADMIN_ADD', name: 'Add System Admin' },
      { key: 'SYS_ADMIN_VIEW', name: 'View System Admins' },
      { key: 'SYS_ADMIN_UPDATE', name: 'Update System Admin' },
      { key: 'SYS_ADMIN_DELETE', name: 'Delete System Admin' },

      // Security operations
      { key: 'SYS_ADMIN_RESET_PASSWORD', name: 'Reset Admin Password' },
      { key: 'SYS_ADMIN_CHANGE_STATUS', name: 'Change Admin Status' },
      { key: 'SYS_ADMIN_FORCE_LOGOUT', name: 'Force Logout Admin' }
    ]
  },

  /**
   * ======================================================
   * WHITELABEL AFFILIATES / TENANTS
   * ======================================================
   */
  WL_AFFILIATES: {
    key: 'WL_AFFILIATES',
    name: 'WhiteLabel Affiliates',
    actions: [
      { key: 'WL_AFFILIATE_ADD', name: 'Create Affiliate' },
      { key: 'WL_AFFILIATE_VIEW', name: 'View Affiliates' },
      { key: 'WL_AFFILIATE_UPDATE', name: 'Update Affiliate' },
      { key: 'WL_AFFILIATE_DELETE', name: 'Delete Affiliate' },

      // Business lifecycle
      { key: 'WL_AFFILIATE_ASSIGN_PLAN', name: 'Assign Subscription Plan' },
      { key: 'WL_AFFILIATE_CHANGE_PLAN', name: 'Change Subscription Plan' },
      { key: 'WL_AFFILIATE_SUSPEND', name: 'Suspend Affiliate' },
      { key: 'WL_AFFILIATE_REACTIVATE', name: 'Reactivate Affiliate' }
    ]
  },

  /**
   * ======================================================
   * SUBSCRIPTION PLANS (SAAS PRODUCTS)
   * ======================================================
   */
  SUBSCRIPTION_PLANS: {
    key: 'SUBSCRIPTION_PLANS',
    name: 'Subscription Plans',
    actions: [
      { key: 'SUB_PLAN_ADD', name: 'Create Plan' },
      { key: 'SUB_PLAN_VIEW', name: 'View Plans' },
      { key: 'SUB_PLAN_UPDATE', name: 'Update Plan' },
      { key: 'SUB_PLAN_DELETE', name: 'Delete Plan' },

      // Feature control
      { key: 'SUB_PLAN_ASSIGN_FEATURES', name: 'Assign Plan Permissions' },
      { key: 'SUB_PLAN_CLONE', name: 'Clone Subscription Plan' },
      { key: 'SUB_PLAN_DISABLE', name: 'Disable Plan' }
    ]
  },

  /**
   * ======================================================
   * PLAN ASSIGNMENTS & BILLING CONTROL
   * ======================================================
   */
  PLAN_ASSIGNMENTS: {
    key: 'PLAN_ASSIGNMENTS',
    name: 'Plan Assignments',
    actions: [
      { key: 'PLAN_ASSIGN_TO_AFFILIATE', name: 'Assign Plan to Affiliate' },
      { key: 'PLAN_CHANGE_FOR_AFFILIATE', name: 'Change Affiliate Plan' },
      { key: 'PLAN_CANCEL_FOR_AFFILIATE', name: 'Cancel Affiliate Plan' },
      { key: 'PLAN_VIEW_HISTORY', name: 'View Plan Assignment History' }
    ]
  },

  /**
   * ======================================================
   * SYSTEM SETTINGS (GLOBAL CONFIGURATION)
   * ======================================================
   */
  SYS_SETTINGS: {
    key: 'SYS_SETTINGS',
    name: 'System Settings',
    actions: [
      { key: 'SYS_SETTINGS_VIEW', name: 'View System Settings' },
      { key: 'SYS_SETTINGS_UPDATE', name: 'Update System Settings' },

      // Contact & Support
      { key: 'SYS_SETTINGS_CONTACT_UPDATE', name: 'Update Contact Settings' },

      // Email / SMTP / Notifications
      { key: 'SYS_SETTINGS_EMAIL_UPDATE', name: 'Update Email/SMTP Settings' },

      // Branding / WhiteLabel Defaults
      { key: 'SYS_SETTINGS_BRANDING_UPDATE', name: 'Update System Branding' },

      // Security & Compliance
      { key: 'SYS_SETTINGS_SECURITY_UPDATE', name: 'Update Security Settings' }
    ]
  },

  /**
   * ======================================================
   * AUDIT LOGS & COMPLIANCE
   * ======================================================
   */
  SYS_AUDIT_LOGS: {
    key: 'SYS_AUDIT_LOGS',
    name: 'Audit Logs',
    actions: [
      { key: 'SYS_AUDIT_VIEW', name: 'View Audit Logs' },
      { key: 'SYS_AUDIT_EXPORT', name: 'Export Audit Logs' }
    ]
  },

  /**
   * ======================================================
   * MODULE & ACTION HISTORY (INTERNAL / COMPLIANCE)
   * For RootModuleHistory collection
   * ======================================================
   */
  SYS_MODULE_HISTORY: {
    key: 'SYS_MODULE_HISTORY',
    name: 'System Module History',
    actions: [
      { key: 'MODULE_CREATED', name: 'Module Created' },
      { key: 'MODULE_UPDATED', name: 'Module Updated' },
      { key: 'MODULE_DISABLED', name: 'Module Disabled' },

      { key: 'ACTION_ADDED', name: 'Action Added' },
      { key: 'ACTION_UPDATED', name: 'Action Updated' },
      { key: 'ACTION_DISABLED', name: 'Action Disabled' }
    ]
  }

};
