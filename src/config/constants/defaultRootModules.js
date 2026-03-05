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
 *
 * Used in:
 * --------
 * - RootModule collection
 * - RBAC Middleware
 * - UI Permission Matrix
 * - Audit Logs
 * - Compliance & Historical Tracking
 *
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
      { key: 'SYS_MODULE_VIEW', name: { en: 'View Modules', fr: 'Voir les modules', ar: 'عرض الوحدات' } },
      { key: 'SYS_MODULE_UPDATE', name: { en: 'Update Module Name', fr: 'Mettre à jour le nom du module', ar: 'تحديث اسم الوحدة' } },
      { key: 'SYS_MODULE_DISABLE', name: { en: 'Disable Module', fr: 'Désactiver le module', ar: 'تعطيل الوحدة' } },

      // ----- Action-level Management -----
      { key: 'SYS_MODULE_ADD_ACTION', name: { en: 'Add Module Action', fr: 'Ajouter une action de module', ar: 'إضافة إجراء للوحدة' } },
      { key: 'SYS_MODULE_UPDATE_ACTION', name: { en: 'Update Module Action', fr: 'Mettre à jour l\'action du module', ar: 'تحديث إجراء الوحدة' } },
      { key: 'SYS_MODULE_DISABLE_ACTION', name: { en: 'Disable Module Action', fr: 'Désactiver l\'action du module', ar: 'تعطيل إجراء الوحدة' } }
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
      { key: 'SYS_ROLE_VIEW', name: { en: 'View Roles', fr: 'Voir les rôles', ar: 'عرض الأدوار' } },
      { key: 'SYS_ROLE_UPDATE', name: { en: 'Update Role', fr: 'Mettre à jour le rôle', ar: 'تحديث الدور' } },
      { key: 'SYS_ROLE_DELETE', name: { en: 'Delete Role', fr: 'Supprimer le rôle', ar: 'حذف الدور' } },

      // ----- Permission Mapping -----
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
      { key: 'SYS_ADMIN_VIEW', name: { en: 'View System Admins', fr: 'Voir les administrateurs', ar: 'عرض مدراء النظام' } },
      { key: 'SYS_ADMIN_UPDATE', name: { en: 'Update System Admin', fr: 'Mettre à jour administrateur', ar: 'تحديث مدير النظام' } },
      { key: 'SYS_ADMIN_DELETE', name: { en: 'Delete System Admin', fr: 'Supprimer administrateur', ar: 'حذف مدير النظام' } },

      // ----- Security Operations -----
      { key: 'SYS_ADMIN_RESET_PASSWORD', name: { en: 'Reset Admin Password', fr: 'Réinitialiser le mot de passe', ar: 'إعادة تعيين كلمة المرور' } },
      { key: 'SYS_ADMIN_CHANGE_STATUS', name: { en: 'Change Admin Status', fr: 'Changer le statut', ar: 'تغيير حالة المدير' } },
      { key: 'SYS_ADMIN_FORCE_LOGOUT', name: { en: 'Force Logout Admin', fr: 'Forcer la déconnexion', ar: 'فرض تسجيل الخروج' } }
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
    name: { en: 'Subscription Plans', fr: 'Plans da abonnement', ar: 'خطط الاشتراك' },
    actions: [

      // ----- Plan CRUD -----
      { key: 'SUB_PLAN_ADD', name: { en: 'Create Plan', fr: 'Créer un plan', ar: 'إنشاء خطة' } },
      { key: 'SUB_PLAN_VIEW', name: { en: 'View Plans', fr: 'Voir les plans', ar: 'عرض الخطط' } },
      { key: 'SUB_PLAN_UPDATE', name: { en: 'Update Plan', fr: 'Mettre à jour le plan', ar: 'تحديث الخطة' } },
      { key: 'SUB_PLAN_DELETE', name: { en: 'Delete Plan', fr: 'Supprimer le plan', ar: 'حذف الخطة' } },

      // ----- Feature Control -----
      { key: 'SUB_PLAN_ASSIGN_FEATURES', name: { en: 'Assign Plan Permissions', fr: 'Attribuer les autorisations', ar: 'تعيين صلاحيات الخطة' } },
      { key: 'SUB_PLAN_CLONE', name: { en: 'Clone Subscription Plan', fr: 'Cloner le plan', ar: 'استنساخ الخطة' } },
      { key: 'SUB_PLAN_DISABLE', name: { en: 'Disable Plan', fr: 'Désactiver le plan', ar: 'تعطيل الخطة' } }
    ]
  },

  /**
 * ======================================================
 * AFFILIATES (WHITE LABEL PARTNER MANAGEMENT)
 * 
 * Root-level management of all WhiteLabel affiliates,
 * including lifecycle control, compliance, billing,
 * branding, monitoring, and legal operations.
 * 
 * Scope:
 * - Affiliate creation, updates, suspension, termination
 * - KYB/KYC compliance & verification workflows
 * - Subscription plans & billing authority
 * - Risk monitoring, audits & impersonation
 * - Data export, GDPR & legal enforcement
 * 
 * Access Level:
 * - ROOT Admins & authorized ROOT users only
 * 
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
      // ----- Affiliate CRUD -----
      { key: 'AFFILIATE_CREATE', name: { en: 'Create Affiliate', fr: 'Créer un affilié', ar: 'إنشاء شريك' } },
      { key: 'AFFILIATE_VIEW', name: { en: 'View Affiliates', fr: 'Voir les affiliés', ar: 'عرض الشركاء' } },
      { key: 'AFFILIATE_UPDATE', name: { en: 'Update Affiliate', fr: 'Mettre à jour affilié', ar: 'تحديث الشريك' } },
      { key: 'AFFILIATE_DELETE', name: { en: 'Delete Affiliate', fr: 'Supprimer affilié', ar: 'حذف الشريك' } },
      { key: 'AFFILIATE_RESTORE', name: { en: 'Restore Affiliate', fr: 'Restaurer affilié', ar: 'استعادة الشريك' } },

      // ----- Status Control -----
      { key: 'AFFILIATE_SUSPEND', name: { en: 'Suspend Affiliate', fr: 'Suspendre affilié', ar: 'تعليق الشريك' } },
      { key: 'AFFILIATE_REACTIVATE', name: { en: 'Reactivate Affiliate', fr: 'Réactiver affilié', ar: 'إعادة تفعيل الشريك' } },
      { key: 'AFFILIATE_TERMINATE', name: { en: 'Terminate Affiliate', fr: 'Terminer affilié', ar: 'إنهاء الشريك' } },

      // ----- KYB / Compliance -----
      { key: 'AFFILIATE_KYB_VIEW_ALL', name: { en: 'View All KYB Verification Requests', fr: 'Voir toutes les demandes KYB', ar: 'عرض جميع طلبات التحقق من KYB' } },
      { key: 'AFFILIATE_KYB_VIEW', name: { en: 'View KYB Documents', fr: 'Voir les documents KYB', ar: 'عرض مستندات KYB' } },
      { key: 'AFFILIATE_KYB_VERIFY', name: { en: 'Verify KYB Documents', fr: 'Vérifier les documents KYB', ar: 'التحقق من مستندات KYB' } },
      { key: 'AFFILIATE_KYB_REJECT', name: { en: 'Reject KYB Documents', fr: 'Rejeter les documents KYB', ar: 'رفض مستندات KYB' } },
      { key: 'AFFILIATE_KYB_SUSPEND', name: { en: 'Suspend Affiliate for KYB Non-Compliance', fr: 'Suspendre pour non-conformité KYB', ar: 'تعليق الشريك بسبب عدم الامتثال KYB' } },
      { key: 'AFFILIATE_KYB_MARK_EXPIRED', name: { en: 'Mark KYB as Expired', fr: 'Marquer KYB comme expiré', ar: 'وضع علامة انتهاء صلاحية KYB' } },
      { key: 'AFFILIATE_KYB_NOTIFY', name: { en: 'Notify Affiliate for KYB Status', fr: 'Notifier affilié du statut KYB', ar: 'إشعار الشريك بحالة KYB' } },
      { key: 'AFFILIATE_MARK_COMPLIANT', name: { en: 'Mark Affiliate Compliant', fr: 'Marquer conforme', ar: 'تعيين كمتوافق' } },
      { key: 'AFFILIATE_MARK_NON_COMPLIANT', name: { en: 'Mark Affiliate Non-Compliant', fr: 'Marquer non conforme', ar: 'تعيين كغير متوافق' } },

      // ----- Subscription & Billing -----
      { key: 'AFFILIATE_ASSIGN_PLAN', name: { en: 'Assign Subscription Plan', fr: 'Attribuer un plan', ar: 'تعيين خطة الاشتراك' } },
      { key: 'AFFILIATE_CHANGE_PLAN', name: { en: 'Change Subscription Plan', fr: 'Changer de plan', ar: 'تغيير خطة الاشتراك' } },
      { key: 'AFFILIATE_VIEW_BILLING', name: { en: 'View Affiliate Billing', fr: 'Voir la facturation', ar: 'عرض الفواتير' } },
      { key: 'AFFILIATE_ADJUST_BILLING', name: { en: 'Adjust Billing / Credits', fr: 'Ajuster la facturation', ar: 'تعديل الفوترة' } },

      // ----- Whitelabel & Branding -----
      { key: 'AFFILIATE_UPDATE_BRANDING', name: { en: 'Update Affiliate Branding', fr: 'Mettre à jour la marque', ar: 'تحديث العلامة التجارية' } },
      { key: 'AFFILIATE_SET_DOMAIN', name: { en: 'Set Custom Domain', fr: 'Définir un domaine', ar: 'تعيين نطاق مخصص' } },
      { key: 'AFFILIATE_SET_EMAIL_SMTP', name: { en: 'Set Email SMTP Configuration', fr: 'Configurer SMTP Email', ar: 'إعداد SMTP للبريد الإلكتروني' } },

      // ----- Impersonation & Support -----
      { key: 'AFFILIATE_IMPERSONATE', name: { en: 'Login as Affiliate Admin', fr: 'Se connecter en tant qu affilié', ar: 'الدخول كمسؤول شريك' } },
      { key: 'AFFILIATE_FORCE_LOGOUT_ALL', name: { en: 'Force Logout All Affiliate Users', fr: 'Forcer la déconnexion', ar: 'فرض تسجيل خروج جميع المستخدمين' } },

      // ----- Monitoring & Audit -----
      { key: 'AFFILIATE_VIEW_AUDIT_LOGS', name: { en: 'View Affiliate Audit Logs', fr: 'Voir les journaux', ar: 'عرض سجلات التدقيق' } },
      { key: 'AFFILIATE_VIEW_ACTIVITY', name: { en: 'View Affiliate Activity', fr: 'Voir activité', ar: 'عرض نشاط الشريك' } },
      { key: 'AFFILIATE_VIEW_RISK_SCORE', name: { en: 'View Risk Score', fr: 'Voir le score de risque', ar: 'عرض درجة المخاطر' } },

      // ----- Data Export & Legal -----
      { key: 'AFFILIATE_EXPORT_DATA', name: { en: 'Export Affiliate Data', fr: 'Exporter les données', ar: 'تصدير البيانات' } },
      { key: 'AFFILIATE_PURGE_DATA', name: { en: 'Purge Affiliate Data (Legal)', fr: 'Purger les données', ar: 'حذف البيانات نهائياً' } }
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
    name: { en: 'Audit Logs', fr: 'Journaux d\'audit', ar: 'سجلات التدقيق' },
    actions: [
      { key: 'SYS_AUDIT_VIEW', name: { en: 'View Audit Logs', fr: 'Voir les journaux', ar: 'عرض سجلات التدقيق' } },
      { key: 'SYS_AUDIT_EXPORT', name: { en: 'Export Audit Logs', fr: 'Exporter les journaux', ar: 'تصدير سجلات التدقيق' } }
    ]
  },

  /**
   * ======================================================
   * MODULES & ACTIONS MANAGEMENT
   * Root module management system
   * ======================================================
   */
  MODULES_ACTIONS: {
    key: 'MODULES_ACTIONS',
    name: { en: 'Modules & Actions', fr: 'Modules et actions', ar: 'الوحدات والإجراءات' },
    actions: [
      { key: 'MOD_ACT_VIEW', name: { en: 'View Modules', fr: 'Voir les modules', ar: 'عرض الوحدات' } },
      { key: 'MOD_ACT_ADD', name: { en: 'Add Module', fr: 'Ajouter un module', ar: 'إضافة وحدة' } },
      { key: 'MOD_ACT_UPDATE', name: { en: 'Update Module', fr: 'Mettre à jour le module', ar: 'تحديث الوحدة' } },
      { key: 'MOD_ACT_DELETE', name: { en: 'Delete Module', fr: 'Supprimer le module', ar: 'حذف الوحدة' } },
      { key: 'MOD_ACT_ADD_ACTION', name: { en: 'Add Action', fr: 'Ajouter une action', ar: 'إضافة إجراء' } },
      { key: 'MOD_ACT_UPDATE_ACTION', name: { en: 'Update Action', fr: 'Mettre à jour action', ar: 'تحديث الإجراء' } },
      { key: 'MOD_ACT_DELETE_ACTION', name: { en: 'Delete Action', fr: 'Supprimer action', ar: 'حذف الإجراء' } },
      { key: 'MOD_ACT_REORDER', name: { en: 'Reorder Actions', fr: 'Réordonner les actions', ar: 'إعادة ترتيب الإجراءات' } }
    ]
  },

  /**
   * ======================================================
   * PERMISSION PACKAGES
   * Pre-defined permission bundles
   * ======================================================
   */
  PERMISSION_PACKAGES: {
    key: 'PERMISSION_PACKAGES',
    name: { en: 'Permission Packages', fr: 'Paquets autorisations', ar: 'حزم الأذونات' },
    actions: [
      { key: 'PERM_PKG_VIEW', name: { en: 'View Packages', fr: 'Voir les paquets', ar: 'عرض الحزم' } },
      { key: 'PERM_PKG_ADD', name: { en: 'Create Package', fr: 'Créer un paquet', ar: 'إنشاء حزمة' } },
      { key: 'PERM_PKG_UPDATE', name: { en: 'Update Package', fr: 'Mettre à jour le paquet', ar: 'تحديث الحزمة' } },
      { key: 'PERM_PKG_DELETE', name: { en: 'Delete Package', fr: 'Supprimer le paquet', ar: 'حذف الحزمة' } },
      { key: 'PERM_PKG_ASSIGN', name: { en: 'Assign Package', fr: 'Attribuer le paquet', ar: 'تعيين الحزمة' } }
    ]
  },

  /**
   * ======================================================
   * SETTINGS
   * System configuration management
   * ======================================================
   */
  SETTINGS: {
    key: 'SETTINGS',
    name: { en: 'Settings', fr: 'Paramètres', ar: 'الإعدادات' },
    actions: [
      { key: 'SETTINGS_VIEW', name: { en: 'View Settings', fr: 'Voir les paramètres', ar: 'عرض الإعدادات' } },
      { key: 'SETTINGS_UPDATE', name: { en: 'Update Settings', fr: 'Mettre à jour les paramètres', ar: 'تحديث الإعدادات' } },
      { key: 'SETTINGS_RESET', name: { en: 'Reset Settings', fr: 'Réinitialiser les paramètres', ar: 'إعادة تعيين الإعدادات' } },
      { key: 'SETTINGS_EXPORT', name: { en: 'Export Settings', fr: 'Exporter les paramètres', ar: 'تصدير الإعدادات' } }
    ]
  },

  /**
   * ======================================================
   * COUNTRIES
   * Country and region management
   * ======================================================
   */
  COUNTRIES: {
    key: 'COUNTRIES',
    name: { en: 'Countries', fr: 'Pays', ar: 'الدول' },
    actions: [
      { key: 'COUNTRY_VIEW', name: { en: 'View Countries', fr: 'Voir les pays', ar: 'عرض الدول' } },
      { key: 'COUNTRY_ADD', name: { en: 'Add Country', fr: 'Ajouter un pays', ar: 'إضافة دولة' } },
      { key: 'COUNTRY_UPDATE', name: { en: 'Update Country', fr: 'Mettre à jour le pays', ar: 'تحديث الدولة' } },
      { key: 'COUNTRY_DELETE', name: { en: 'Delete Country', fr: 'Supprimer le pays', ar: 'حذف الدولة' } },
      { key: 'COUNTRY_SET_DEFAULT', name: { en: 'Set Default Country', fr: 'Définir le pays par défaut', ar: 'تعيين الدولة الافتراضية' } }
    ]
  },

  /**
   * ======================================================
   * SUB ADMINS
   * Sub-admin user management
   * ======================================================
   */
  SUB_ADMINS: {
    key: 'SUB_ADMINS',
    name: { en: 'Sub Admins', fr: 'Sous-administrateurs', ar: 'المسؤولون الفرعيون' },
    actions: [
      { key: 'SUB_ADMIN_VIEW', name: { en: 'View Sub Admins', fr: 'Voir les sous-admins', ar: 'عرض المسؤولين الفرعيين' } },
      { key: 'SUB_ADMIN_ADD', name: { en: 'Add Sub Admin', fr: 'Ajouter un sous-admin', ar: 'إضافة مسؤول فرعي' } },
      { key: 'SUB_ADMIN_UPDATE', name: { en: 'Update Sub Admin', fr: 'Mettre à jour le sous-admin', ar: 'تحديث المسؤول الفرعي' } },
      { key: 'SUB_ADMIN_DELETE', name: { en: 'Delete Sub Admin', fr: 'Supprimer le sous-admin', ar: 'حذف المسؤول الفرعي' } },
      { key: 'SUB_ADMIN_RESET_PASSWORD', name: { en: 'Reset Sub Admin Password', fr: 'Réinitialiser le mot de passe', ar: 'إعادة تعيين كلمة المرور' } },
      { key: 'SUB_ADMIN_CHANGE_STATUS', name: { en: 'Change Sub Admin Status', fr: 'Changer le statut', ar: 'تغيير الحالة' } },
      { key: 'SUB_ADMIN_ASSIGN_ROLE', name: { en: 'Assign Role to Sub Admin', fr: 'Attribuer un rôle', ar: 'تعيين دور' } }
    ]
  },

  /**
   * ======================================================
   * CMS
   * Content Management System
   * ======================================================
   */
  CMS: {
    key: 'CMS',
    name: { en: 'CMS', fr: 'Gestion de contenu', ar: 'إدارة المحتوى' },
    actions: [
      { key: 'CMS_VIEW', name: { en: 'View CMS', fr: 'Voir le CMS', ar: 'عرض إدارة المحتوى' } },
      { key: 'CMS_ADD', name: { en: 'Add Content', fr: 'Ajouter du contenu', ar: 'إضافة محتوى' } },
      { key: 'CMS_UPDATE', name: { en: 'Update Content', fr: 'Mettre à jour le contenu', ar: 'تحديث المحتوى' } },
      { key: 'CMS_DELETE', name: { en: 'Delete Content', fr: 'Supprimer le contenu', ar: 'حذف المحتوى' } },
      { key: 'CMS_PUBLISH', name: { en: 'Publish Content', fr: 'Publier le contenu', ar: 'نشر المحتوى' } },
      { key: 'CMS_UNPUBLISH', name: { en: 'Unpublish Content', fr: 'Dépublier le contenu', ar: 'إلغاء نشر المحتوى' } }
    ]
  },

  /**
   * ======================================================
   * ARTICLES
   * Article management
   * ======================================================
   */
  ARTICLES: {
    key: 'ARTICLES',
    name: { en: 'Articles', fr: 'Articles', ar: 'المقالات' },
    actions: [
      { key: 'ARTICLE_VIEW', name: { en: 'View Articles', fr: 'Voir les articles', ar: 'عرض المقالات' } },
      { key: 'ARTICLE_ADD', name: { en: 'Add Article', fr: 'Ajouter un article', ar: 'إضافة مقالة' } },
      { key: 'ARTICLE_UPDATE', name: { en: 'Update Article', fr: 'Mettre à jour article', ar: 'تحديث المقالة' } },
      { key: 'ARTICLE_DELETE', name: { en: 'Delete Article', fr: 'Supprimer article', ar: 'حذف المقالة' } },
      { key: 'ARTICLE_PUBLISH', name: { en: 'Publish Article', fr: 'Publier article', ar: 'نشر المقالة' } },
      { key: 'ARTICLE_UNPUBLISH', name: { en: 'Unpublish Article', fr: 'Dépublier article', ar: 'إلغاء نشر المقالة' } },
      { key: 'ARTICLE_FEATURED', name: { en: 'Toggle Featured', fr: 'Basculer en vedette', ar: 'تحديد المميزة' } }
    ]
  },

  /**
   * ======================================================
   * VIDEOS
   * Video content management
   * ======================================================
   */
  VIDEOS: {
    key: 'VIDEOS',
    name: { en: 'Videos', fr: 'Videos', ar: 'الفيديوهات' },
    actions: [
      { key: 'VIDEO_VIEW', name: { en: 'View Videos', fr: 'Voir les videos', ar: 'عرض الفيديوهات' } },
      { key: 'VIDEO_ADD', name: { en: 'Add Video', fr: 'Ajouter une video', ar: 'إضافة فيديو' } },
      { key: 'VIDEO_UPDATE', name: { en: 'Update Video', fr: 'Mettre à jour la video', ar: 'تحديث الفيديو' } },
      { key: 'VIDEO_DELETE', name: { en: 'Delete Video', fr: 'Supprimer la video', ar: 'حذف الفيديو' } },
      { key: 'VIDEO_PUBLISH', name: { en: 'Publish Video', fr: 'Publier la video', ar: 'نشر الفيديو' } },
      { key: 'VIDEO_UNPUBLISH', name: { en: 'Unpublish Video', fr: 'Dépublier la video', ar: 'إلغاء نشر الفيديو' } },
      { key: 'VIDEO_FEATURED', name: { en: 'Toggle Featured', fr: 'Basculer en vedette', ar: 'تحديد المميز' } }
    ]
  },

  /**
   * ======================================================
   * CATEGORIES
   * Category management
   * ======================================================
   */
  CATEGORIES: {
    key: 'CATEGORIES',
    name: { en: 'Categories', fr: 'Categories', ar: 'الفئات' },
    actions: [
      { key: 'CATEGORY_VIEW', name: { en: 'View Categories', fr: 'Voir les categories', ar: 'عرض الفئات' } },
      { key: 'CATEGORY_ADD', name: { en: 'Add Category', fr: 'Ajouter une categorie', ar: 'إضافة فئة' } },
      { key: 'CATEGORY_UPDATE', name: { en: 'Update Category', fr: 'Mettre à jour la categorie', ar: 'تحديث الفئة' } },
      { key: 'CATEGORY_DELETE', name: { en: 'Delete Category', fr: 'Supprimer la categorie', ar: 'حذف الفئة' } },
      { key: 'CATEGORY_REORDER', name: { en: 'Reorder Categories', fr: 'Réordonner les categories', ar: 'إعادة ترتيب الفئات' } }
    ]
  },

  /**
   * ======================================================
   * CHALLENGES
   * Challenge management
   * ======================================================
   */
  CHALLENGES: {
    key: 'CHALLENGES',
    name: { en: 'Challenges', fr: 'Défis', ar: 'التحديات' },
    actions: [
      { key: 'CHALLENGE_VIEW', name: { en: 'View Challenges', fr: 'Voir les defis', ar: 'عرض التحديات' } },
      { key: 'CHALLENGE_ADD', name: { en: 'Add Challenge', fr: 'Ajouter un defi', ar: 'إضافة تحدي' } },
      { key: 'CHALLENGE_UPDATE', name: { en: 'Update Challenge', fr: 'Mettre à jour le defi', ar: 'تحديث التحدي' } },
      { key: 'CHALLENGE_DELETE', name: { en: 'Delete Challenge', fr: 'Supprimer le defi', ar: 'حذف التحدي' } },
      { key: 'CHALLENGE_PUBLISH', name: { en: 'Publish Challenge', fr: 'Publier le defi', ar: 'نشر التحدي' } },
      { key: 'CHALLENGE_UNPUBLISH', name: { en: 'Unpublish Challenge', fr: 'Dépublier le defi', ar: 'إلغاء نشر التحدي' } },
      { key: 'CHALLENGE_FEATURED', name: { en: 'Toggle Featured', fr: 'Basculer en vedette', ar: 'تحديد المميز' } }
    ]
  },

  /**
   * ======================================================
   * ADS
   * Advertisement management
   * ======================================================
   */
  ADS: {
    key: 'ADS',
    name: { en: 'Ads', fr: 'Publicités', ar: 'الإعلانات' },
    actions: [
      { key: 'AD_VIEW', name: { en: 'View Ads', fr: 'Voir les publicites', ar: 'عرض الإعلانات' } },
      { key: 'AD_ADD', name: { en: 'Add Ad', fr: 'Ajouter une publicite', ar: 'إضافة إعلان' } },
      { key: 'AD_UPDATE', name: { en: 'Update Ad', fr: 'Mettre à jour la publicite', ar: 'تحديث الإعلان' } },
      { key: 'AD_DELETE', name: { en: 'Delete Ad', fr: 'Supprimer la publicite', ar: 'حذف الإعلان' } },
      { key: 'AD_PUBLISH', name: { en: 'Publish Ad', fr: 'Publier la publicite', ar: 'نشر الإعلان' } },
      { key: 'AD_UNPUBLISH', name: { en: 'Unpublish Ad', fr: 'Dépublier la publicite', ar: 'إلغاء نشر الإعلان' } },
      { key: 'AD_APPROVE', name: { en: 'Approve Ad', fr: 'Approuver la publicite', ar: 'الموافقة على الإعلان' } },
      { key: 'AD_REJECT', name: { en: 'Reject Ad', fr: 'Rejeter la publicite', ar: 'رفض الإعلان' } }
    ]
  },

  /**
   * ======================================================
   * SUPPORT TICKETS
   * Support ticket management
   * ======================================================
   */
  SUPPORT_TICKETS: {
    key: 'SUPPORT_TICKETS',
    name: { en: 'Support Tickets', fr: 'Tickets de support', ar: 'تذاكر الدعم' },
    actions: [
      { key: 'TICKET_VIEW', name: { en: 'View Tickets', fr: 'Voir les tickets', ar: 'عرض التذاكر' } },
      { key: 'TICKET_ADD', name: { en: 'Create Ticket', fr: 'Créer un ticket', ar: 'إنشاء تذكرة' } },
      { key: 'TICKET_UPDATE', name: { en: 'Update Ticket', fr: 'Mettre à jour le ticket', ar: 'تحديث التذكرة' } },
      { key: 'TICKET_DELETE', name: { en: 'Delete Ticket', fr: 'Supprimer le ticket', ar: 'حذف التذكرة' } },
      { key: 'TICKET_ASSIGN', name: { en: 'Assign Ticket', fr: 'Attribuer le ticket', ar: 'تعيين التذكرة' } },
      { key: 'TICKET_CLOSE', name: { en: 'Close Ticket', fr: 'Fermer le ticket', ar: 'إغلاق التذكرة' } },
      { key: 'TICKET_REOPEN', name: { en: 'Reopen Ticket', fr: 'Rouvrir le ticket', ar: 'إعادة فتح التذكرة' } },
      { key: 'TICKET_ESCALATE', name: { en: 'Escalate Ticket', fr: 'Escalader le ticket', ar: 'تصعيد التذكرة' } }
    ]
  },

  /**
   * ======================================================
   * POLICIES & FAQ
   * Policies and frequently asked questions
   * ======================================================
   */
  POLICIES_FAQ: {
    key: 'POLICIES_FAQ',
    name: { en: 'Policies and FAQ', fr: 'Politiques et FAQ', ar: 'السياسات والأسئلة الشائعة' },
    actions: [
      { key: 'POLICY_VIEW', name: { en: 'View Policies', fr: 'Voir les politiques', ar: 'عرض السياسات' } },
      { key: 'POLICY_ADD', name: { en: 'Add Policy', fr: 'Ajouter une politique', ar: 'إضافة سياسة' } },
      { key: 'POLICY_UPDATE', name: { en: 'Update Policy', fr: 'Mettre à jour la politique', ar: 'تحديث السياسة' } },
      { key: 'POLICY_DELETE', name: { en: 'Delete Policy', fr: 'Supprimer la politique', ar: 'حذف السياسة' } },
      { key: 'FAQ_VIEW', name: { en: 'View FAQ', fr: 'Voir la FAQ', ar: 'عرض الأسئلة الشائعة' } },
      { key: 'FAQ_ADD', name: { en: 'Add FAQ', fr: 'Ajouter une FAQ', ar: 'إضافة سؤال شائع' } },
      { key: 'FAQ_UPDATE', name: { en: 'Update FAQ', fr: 'Mettre à jour la FAQ', ar: 'تحديث السؤال الشائع' } },
      { key: 'FAQ_DELETE', name: { en: 'Delete FAQ', fr: 'Supprimer la FAQ', ar: 'حذف السؤال الشائع' } }
    ]
  },

  /**
   * ======================================================
   * PROFILE
   * User profile management
   * ======================================================
   */
  PROFILE: {
    key: 'PROFILE',
    name: { en: 'Profile', fr: 'Profil', ar: 'الملف الشخصي' },
    actions: [
      { key: 'PROFILE_VIEW', name: { en: 'View Profile', fr: 'Voir le profil', ar: 'عرض الملف الشخصي' } },
      { key: 'PROFILE_UPDATE', name: { en: 'Update Profile', fr: 'Mettre à jour le profil', ar: 'تحديث الملف الشخصي' } },
      { key: 'PROFILE_CHANGE_PASSWORD', name: { en: 'Change Password', fr: 'Changer le mot de passe', ar: 'تغيير كلمة المرور' } },
      { key: 'PROFILE_UPDATE_AVATAR', name: { en: 'Update Avatar', fr: 'Mettre à jour avatar', ar: 'تحديث الصورة الرمزية' } }
    ]
  },

  /**
   * ======================================================
   * VERIFICATION
   * User verification management
   * ======================================================
   */
  VERIFICATION: {
    key: 'VERIFICATION',
    name: { en: 'Verification', fr: 'Verification', ar: 'التحقق' },
    actions: [
      { key: 'VERIFICATION_VIEW', name: { en: 'View Verifications', fr: 'Voir les verifications', ar: 'عرض عمليات التحقق' } },
      { key: 'VERIFICATION_APPROVE', name: { en: 'Approve Verification', fr: 'Approuver la verification', ar: 'الموافقة على التحقق' } },
      { key: 'VERIFICATION_REJECT', name: { en: 'Reject Verification', fr: 'Rejeter la verification', ar: 'رفض التحقق' } },
      { key: 'VERIFICATION_REVIEW', name: { en: 'Review Documents', fr: 'Examiner les documents', ar: 'مراجعة المستندات' } },
      { key: 'VERIFICATION_REVERT', name: { en: 'Revert Verification', fr: 'Annuler la verification', ar: 'التراجع عن التحقق' } }
    ]
  },

  /**
   * ======================================================
   * AUDIT_LOGS (Business)
   * Business-level audit logs
   * ======================================================
   */
  AUDIT_LOGS: {
    key: 'AUDIT_LOGS',
    name: { en: 'Audit Logs', fr: 'Journaux audit', ar: 'سجلات التدقيق' },
    actions: [
      { key: 'AUDIT_VIEW', name: { en: 'View Audit Logs', fr: 'Voir les journaux', ar: 'عرض السجلات' } },
      { key: 'AUDIT_EXPORT', name: { en: 'Export Audit Logs', fr: 'Exporter les journaux', ar: 'تصدير السجلات' } },
      { key: 'AUDIT_DELETE', name: { en: 'Delete Audit Logs', fr: 'Supprimer les journaux', ar: 'حذف السجلات' } }
    ]
  }

};
