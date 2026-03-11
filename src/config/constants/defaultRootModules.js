
/**
 * ======================================================
 * MASTER SYSTEM MODULES & ACTION CONSTANTS
 * ======================================================
 * ROOT + SAAS + WHITELABEL PLATFORM
 *
 * IMPORTANT (DO NOT BREAK):
 * -------------------------
 * 1. NEVER change existing keys (used as system identifiers)
 * 2. NEVER delete keys in production
 * 3. ONLY add new modules/actions
 * 4. Keys are permanent and stored in DB & logs
 
 * Multi-language Support:
 * -----------------------
 * name = { en: 'English', fr: 'Français', ar: 'العربية' }
 * NEVER localize keys — only name labels.
 */


module.exports = {

  /**
   * ======================================================
   * SYSTEM MODULE REGISTRY (ROOT ONLY)
   * Defines all system modules & their actions
   * ======================================================
   */
  SYS_MODULES: {
    key: 'SYS_MODULES', // System internal module key
    name: { en: 'System Modules', fr: 'Modules système', ar: 'وحدات النظام' },
    actions: [

      // ----- Module CRUD Operations -----
      { key: 'SYS_MODULE_ADD', name: { en: 'Add Module', fr: 'Ajouter un module', ar: 'إضافة وحدة' } },
      { key: 'SYS_MODULE_UPDATE', name: { en: 'Update Module Name', fr: 'Mettre à jour le nom du module', ar: 'تحديث اسم الوحدة' } },
      { key: 'SYS_MODULE_DISABLE', name: { en: 'Disable Module', fr: 'Désactiver le module', ar: 'تعطيل الوحدة' } },

      // ----- Action-level Management -----
      { key: 'SYS_MODULE_ADD_ACTION', name: { en: 'Add Module Action', fr: 'Ajouter une action de module', ar: 'إضافة إجراء للوحدة' } },
      { key: 'SYS_MODULE_UPDATE_ACTION', name: { en: 'Update Module Action', fr: 'Mettre à jour l’action du module', ar: 'تحديث إجراء الوحدة' } },
      { key: 'SYS_MODULE_DISABLE_ACTION', name: { en: 'Disable Module Action', fr: 'Désactiver l’action du module', ar: 'تعطيل إجراء الوحدة' } }
    ]
  },

  /**
   * ======================================================
   * SYSTEM ROLES & PERMISSIONS
   * Manages roles & permission mappings
   * ======================================================
   */
  SYS_ROLES: {
    key: 'SYS_ROLES',
    name: { en: 'System Roles', fr: 'Rôles système', ar: 'أدوار النظام' },
    actions: [

      // ----- Role Management -----
      { key: 'SYS_ROLE_ADD', name: { en: 'Add Role', fr: 'Ajouter un rôle', ar: 'إضافة دور' } },
      { key: 'SYS_ROLE_UPDATE', name: { en: 'Update Role', fr: 'Mettre à jour le rôle', ar: 'تحديث الدور' } },
      { key: 'SYS_ROLE_DELETE', name: { en: 'Delete Role', fr: 'Supprimer le rôle', ar: 'حذف الدور' } },
      { key: 'SYS_ROLE_ASSIGN_PERMISSIONS', name: { en: 'Assign Permissions to Role', fr: 'Attribuer des autorisations au rôle', ar: 'تعيين الصلاحيات للدور' } }
    ]
  },

  /**
   * ======================================================
   * SYSTEM ADMINS (ROOT USERS)
   * Root-level admin user management
   * ======================================================
   */
  SYS_ADMINS: {
    key: 'SYS_ADMINS',
    name: { en: 'System Admins', fr: 'Administrateurs système', ar: 'مدراء النظام' },
    actions: [

      // ----- Admin CRUD -----
      { key: 'SYS_ADMIN_ADD', name: { en: 'Add System Admin', fr: 'Ajouter un administrateur', ar: 'إضافة مدير نظام' } },
      { key: 'SYS_ADMIN_UPDATE', name: { en: 'Update System Admin', fr: 'Mettre à jour l’administrateur', ar: 'تحديث مدير النظام' } },
      { key: 'SYS_ADMIN_DELETE', name: { en: 'Delete System Admin', fr: 'Supprimer l’administrateur', ar: 'حذف مدير النظام' } },

      // ----- Security Operations -----
      { key: 'SYS_ADMIN_RESET_PASSWORD', name: { en: 'Reset Admin Password', fr: 'Réinitialiser le mot de passe', ar: 'إعادة تعيين كلمة المرور' } },
      { key: 'SYS_ADMIN_CHANGE_STATUS', name: { en: 'Change Admin Status', fr: 'Changer le statut', ar: 'تغيير حالة المدير' } },

    ]
  },


  /**
 * ======================================================
 * SUBSCRIPTION PLANS (SAAS PRODUCTS)
 * Product & plan catalog
 * ======================================================
 */
  SUBSCRIPTION_PLANS: {
    key: 'SUBSCRIPTION_PLANS',
    name: { en: 'Subscription Plans', fr: 'Plans d’abonnement', ar: 'خطط الاشتراك' },
    actions: [

      // ----- Plan CRUD -----
      { key: 'SUB_PLAN_ADD', name: { en: 'Create Plan', fr: 'Créer un plan', ar: 'إنشاء خطة' } },
      { key: 'SUB_PLAN_UPDATE', name: { en: 'Update Plan', fr: 'Mettre à jour le plan', ar: 'تحديث الخطة' } },
      { key: 'SUB_PLAN_DELETE', name: { en: 'Delete Plan', fr: 'Supprimer le plan', ar: 'حذف الخطة' } },

      // ----- Feature Control -----
      { key: 'SUB_PLAN_ASSIGN_FEATURES', name: { en: 'Assign Plan Permissions', fr: 'Attribuer les autorisations', ar: 'تعيين صلاحيات الخطة' } },
      { key: 'SUB_PLAN_DISABLE', name: { en: 'Disable Plan', fr: 'Désactiver le plan', ar: 'تعطيل الخطة' } }
    ]
  },


  /**
 * ======================================================
 * 🏢 AFFILIATES (WHITE LABEL PARTNER MANAGEMENT)
 * Access Level:
 * - ROOT Admins & authorized ROOT users only
 * 
 * ======================================================
 */
  AFFILIATES: {
    key: 'AFFILIATES',
    name: { en: 'WhiteLabel Affiliates', fr: 'Affiliés en marque blanche', ar: 'شركاء العلامة البيضاء' },
    actions: [
      // ----- Affiliate CRUD -----
      { key: 'AFFILIATE_CREATE', name: { en: 'Create Affiliate', fr: 'Créer un affilié', ar: 'إنشاء شريك' } },
      { key: 'AFFILIATE_UPDATE', name: { en: 'Update Affiliate', fr: 'Mettre à jour l’affilié', ar: 'تحديث الشريك' } },
      { key: 'AFFILIATE_DELETE', name: { en: 'Delete Affiliate', fr: 'Supprimer l’affilié', ar: 'حذف الشريك' } },

      // ----- Status Control -----
      { key: 'AFFILIATE_SUSPEND', name: { en: 'Suspend Affiliate', fr: 'Suspendre l’affilié', ar: 'تعليق الشريك' } },
      { key: 'AFFILIATE_REACTIVATE', name: { en: 'Reactivate Affiliate', fr: 'Réactiver l’affilié', ar: 'إعادة تفعيل الشريك' } },
    ]
  },

  /**
* ======================================================
* 🏢 AFFILIATES (WHITE LABEL PARTNER KYB MANAGEMENT)
* Access Level:
* - ROOT Admins & authorized ROOT users only
* 
* ======================================================
*/
  AFFILIATESKYB: {
    key: 'AFFILIATES KYB',
    name: { en: 'WhiteLabel Affiliates KYB', fr: 'Affiliés en marque blanche', ar: 'شركاء العلامة البيضاء' },
    actions: [
      // ----- KYB / Compliance -----
      { key: 'AFFILIATE_KYB_VIEW_ALL', name: { en: 'View All KYB Verification Requests', fr: 'Voir toutes les demandes KYB', ar: 'عرض جميع طلبات التحقق من KYB' } },
      { key: 'AFFILIATE_KYB_VERIFY', name: { en: 'Verify KYB Documents', fr: 'Vérifier les documents KYB', ar: 'التحقق من مستندات KYB' } },
      { key: 'AFFILIATE_KYB_REJECT', name: { en: 'Reject KYB Documents', fr: 'Rejeter les documents KYB', ar: 'رفض مستندات KYB' } },
      { key: 'AFFILIATE_KYB_SUSPEND', name: { en: 'Suspend Affiliate for KYB Non-Compliance', fr: 'Suspendre pour non-conformité KYB', ar: 'تعليق الشريك بسبب عدم الامتثال KYB' } },
      { key: 'AFFILIATE_KYB_MARK_EXPIRED', name: { en: 'Mark KYB as Expired', fr: 'Marquer KYB comme expiré', ar: 'وضع علامة انتهاء صلاحية KYB' } },
      { key: 'AFFILIATE_KYB_NOTIFY', name: { en: 'Notify Affiliate for KYB Status', fr: 'Notifier l’affilié du statut KYB', ar: 'إشعار الشريك بحالة KYB' } },

      // ----- Subscription & Billing -----
      { key: 'AFFILIATE_ASSIGN_PLAN', name: { en: 'Assign Subscription Plan', fr: 'Attribuer un plan', ar: 'تعيين خطة الاشتراك' } },
      { key: 'AFFILIATE_CHANGE_PLAN', name: { en: 'Change Subscription Plan', fr: 'Changer de plan', ar: 'تغيير خطة الاشتراك' } },
      { key: 'AFFILIATE_VIEW_BILLING', name: { en: 'View Affiliate Billing', fr: 'Voir la facturation', ar: 'عرض الفواتير' } },

      // ----- Whitelabel & Branding -----
      { key: 'AFFILIATE_UPDATE_BRANDING', name: { en: 'Update Affiliate Branding', fr: 'Mettre à jour la marque', ar: 'تحديث العلامة التجارية' } },
      { key: 'AFFILIATE_SET_DOMAIN', name: { en: 'Set Custom Domain', fr: 'Définir un domaine', ar: 'تعيين نطاق مخصص' } },
      { key: 'AFFILIATE_SET_EMAIL_SMTP', name: { en: 'Set Email SMTP Configuration', fr: 'Configurer SMTP Email', ar: 'إعداد SMTP للبريد الإلكتروني' } },

      // ----- Data Export & Legal -----
      { key: 'AFFILIATE_EXPORT_DATA', name: { en: 'Export Affiliate Data', fr: 'Exporter les données', ar: 'تصدير البيانات' } },

    ]
  },


  /**
   * ======================================================
   * AUDIT LOGS & COMPLIANCE
   * Security & compliance audit system
   * ======================================================
   */


  SYS_AUDIT_LOGS: {
    key: 'SYS_AUDIT_LOGS',
    name: { en: 'Audit Logs', fr: 'Journaux d’audit', ar: 'سجلات التدقيق' },
    actions: [
      { key: 'SYS_AUDIT_VIEW', name: { en: 'View Audit Logs', fr: 'Voir les journaux', ar: 'عرض سجلات التدقيق' } },
      { key: 'SYS_AUDIT_EXPORT', name: { en: 'Export Audit Logs', fr: 'Exporter les journaux', ar: 'تصدير سجلات التدقيق' } }
    ]
  }

};
