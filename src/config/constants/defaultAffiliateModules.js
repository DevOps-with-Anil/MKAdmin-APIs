/**
 * ======================================================
 * MASTER SYSTEM MODULES & ACTION CONSTANTS
 * ======================================================
 * WHITELABEL PLATFORM
 *
 * IMPORTANT (DO NOT BREAK):
 * -------------------------
 * 1. NEVER change existing keys
 * 2. NEVER delete keys in production
 * 3. ONLY add new modules/actions
 * 4. Keys are permanent identifiers
 *
 * Multi-language Support:
 * name = { en, fr, ar }
 * NEVER localize keys — only labels.
 */

module.exports = {

  /**
   * ======================================================
   * 🏢 AFFILIATES (WHITE LABEL PARTNER MANAGEMENT)
   * ROOT LEVEL CONTROL ONLY
   * ======================================================
   */
  AFFILIATES: {
    key: 'AFFILIATES',
    name: {
      en: 'WhiteLabel Affiliates',
      fr: 'Affiliés en marque blanche',
      ar: 'شركاء العلامة البيضاء'
    },
    actions: [
      { key: 'AFFILIATE_VIEW', name: { en: 'View Affiliates', fr: 'Voir les affiliés', ar: 'عرض الشركاء' } },
      { key: 'AFFILIATE_UPDATE', name: { en: 'Update Affiliate', fr: 'Mettre à jour l’affilié', ar: 'تحديث الشريك' } },

      { key: 'AFFILIATE_KYB_VIEW', name: { en: 'View KYB Documents', fr: 'Voir les documents KYB', ar: 'عرض مستندات KYB' } },

      { key: 'AFFILIATE_UPDATE_BRANDING', name: { en: 'Update Affiliate Branding', fr: 'Mettre à jour la marque', ar: 'تحديث الهوية التجارية' } },
      { key: 'AFFILIATE_SET_DOMAIN', name: { en: 'Set Custom Domain', fr: 'Définir un domaine personnalisé', ar: 'تعيين نطاق مخصص' } },
      { key: 'AFFILIATE_SET_EMAIL_SMTP', name: { en: 'Set Email SMTP Configuration', fr: 'Configurer SMTP Email', ar: 'إعداد SMTP للبريد الإلكتروني' } }
    ]
  },

  /**
   * ======================================================
   * SUBSCRIPTION PLANS (SAAS PRODUCTS)
   * ======================================================
   */
  SUBSCRIPTION_PLANS: {
    key: 'SUBSCRIPTION_PLAN',
    name: {
      en: 'Subscription Plans',
      fr: 'Plans d’abonnement',
      ar: 'خطط الاشتراك'
    },
    actions: [
      { key: 'SUB_PLAN_VIEW', name: { en: 'View Plans', fr: 'Voir les plans', ar: 'عرض الخطط' } },
      { key: 'SUB_PLAN_VIEW_PERMISSIONS', name: { en: 'Assign Plan Permissions', fr: 'Attribuer les autorisations du plan', ar: 'تعيين صلاحيات الخطة' } }
    ]
  },

  /**
   * ======================================================
   * SYSTEM ROLES & PERMISSIONS
   * ======================================================
   */
  SYS_ROLES: {
    key: 'SYS_ROLES',
    name: {
      en: 'System Roles',
      fr: 'Rôles système',
      ar: 'أدوار النظام'
    },
    actions: [
      { key: 'SYS_ROLE_ADD', name: { en: 'Add Role', fr: 'Ajouter un rôle', ar: 'إضافة دور' } },
      { key: 'SYS_ROLE_VIEW', name: { en: 'View Roles', fr: 'Voir les rôles', ar: 'عرض الأدوار' } },
      { key: 'SYS_ROLE_UPDATE', name: { en: 'Update Role', fr: 'Mettre à jour le rôle', ar: 'تحديث الدور' } },
      { key: 'SYS_ROLE_DELETE', name: { en: 'Delete Role', fr: 'Supprimer le rôle', ar: 'حذف الدور' } },

      // Fixed translation (was duplicated wrong)
      { key: 'SYS_ROLE_STATUS', name: { en: 'Update Role Status', fr: 'Mettre à jour le statut', ar: 'تحديث الحالة' } },
      { key: 'SYS_ROLES_CHANGE_STATUS', name: { en: 'Change Role Status', fr: 'Changer le statut du rôle', ar: 'تغيير حالة الدور' } }
    ]
  },

  /**
   * ======================================================
   * SYSTEM ADMINS
   * ======================================================
   */
  SYS_ADMINS: {
    key: 'SYS_ADMINS',
    name: {
      en: 'System Admins',
      fr: 'Administrateurs système',
      ar: 'مدراء النظام'
    },
    actions: [
      { key: 'SYS_ADMIN_ADD', name: { en: 'Add System Admin', fr: 'Ajouter un administrateur système', ar: 'إضافة مدير نظام' } },
      { key: 'SYS_ADMIN_VIEW', name: { en: 'View System Admins', fr: 'Voir les administrateurs système', ar: 'عرض مدراء النظام' } },
      { key: 'SYS_ADMIN_UPDATE', name: { en: 'Update System Admin', fr: 'Mettre à jour l’administrateur système', ar: 'تحديث مدير النظام' } },
      { key: 'SYS_ADMIN_DELETE', name: { en: 'Delete System Admin', fr: 'Supprimer l’administrateur système', ar: 'حذف مدير النظام' } },
      { key: 'SYS_ADMIN_RESET_PASSWORD', name: { en: 'Reset Admin Password', fr: 'Réinitialiser le mot de passe', ar: 'إعادة تعيين كلمة المرور' } },
      { key: 'SYS_ADMIN_CHANGE_STATUS', name: { en: 'Change Admin Status', fr: 'Changer le statut de l’administrateur', ar: 'تغيير حالة المدير' } }
    ]
  },

  /**
   * ======================================================
   * AUDIT LOGS & COMPLIANCE
   * ======================================================
   */
  SYS_AUDIT_LOGS: {
    key: 'SYS_AUDIT_LOGS',
    name: {
      en: 'Audit Logs',
      fr: 'Journaux d’audit',
      ar: 'سجلات التدقيق'
    },
    actions: [
      { key: 'SYS_AUDIT_VIEW', name: { en: 'View Audit Logs', fr: 'Voir les journaux d’audit', ar: 'عرض سجلات التدقيق' } },
      { key: 'SYS_AUDIT_EXPORT', name: { en: 'Export Audit Logs', fr: 'Exporter les journaux d’audit', ar: 'تصدير سجلات التدقيق' } }
    ]
  }

};