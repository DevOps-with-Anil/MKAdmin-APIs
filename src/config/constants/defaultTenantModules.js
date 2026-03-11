/**
 * ======================================================
 * MASTER SYSTEM MODULES & ACTION CONSTANTS
 * ======================================================
 * WHITELABEL PLATFORM ENTERPRISE RBAC CONFIG
 *
 * RULES:
 * 1. Never delete existing keys
 * 2. Only add new modules/actions
 * 3. Keys are permanent identifiers
 */

module.exports = {



  /**
   * ======================================================
   * BUSINESS DETAILS
   * ======================================================
   */
  BUSINESS_DETAILS: {
    key: 'BUSINESS_DETAILS',
    name: { en: 'Business Details', fr: 'Détails de l’entreprise', ar: 'تفاصيل الشركة' },
    actions: [
      { key: 'BUSINESS_DETAILS_VIEW', name: { en: 'View Business', fr: 'Voir l’entreprise', ar: 'عرض الشركة' } },
      { key: 'BUSINESS_DETAILS_UPDATE', name: { en: 'Update Business', fr: 'Mettre à jour', ar: 'تحديث الشركة' } }
    ]
  },

  /**
  * ======================================================
  * BUSINESS KYB VERIFICATION
  * ======================================================
  */
  BUSINESS_KYB: {
    key: 'BUSINESS_KYB',
    name: { en: 'Business KYB Verification', fr: 'Vérification KYB Entreprise', ar: 'التحقق من هوية الشركات' },
    actions: [
      { key: 'BUSINESS_KYB_VIEW', name: { en: 'View KYB Documents & Status', fr: 'Voir les documents KYB', ar: 'عرض مستندات KYB' } },
      { key: 'BUSINESS_KYB_UPLOAD', name: { en: 'Upload KYB Documents', fr: 'Téléverser les documents KYB', ar: 'رفع مستندات KYB' } },
      { key: 'BUSINESS_KYB_HISTORY_VIEW', name: { en: 'View KYB History', fr: 'Voir l’historique KYB', ar: 'عرض سجل KYB' } }
    ]
  },


  /**
 * ======================================================
 * SYSTEM ADMINS MANAGEMENT
 * ======================================================
 */
  SYS_ADMINS: {
    key: 'ADMINS',
    name: { en: 'System Admins', fr: 'Administrateurs système', ar: 'مدراء النظام' },
    actions: [
      { key: 'SYS_ADMIN_ADD', name: { en: 'Add Admin', fr: 'Ajouter admin', ar: 'إضافة مدير' } },
      { key: 'SYS_ADMIN_UPDATE', name: { en: 'Update Admin', fr: 'Mettre à jour admin', ar: 'تحديث المدير' } },
      { key: 'SYS_ADMIN_DELETE', name: { en: 'Delete Admin', fr: 'Supprimer admin', ar: 'حذف المدير' } },
      { key: 'SYS_ADMIN_ASSIGN_ROLE', name: { en: 'Assign Role', fr: 'Attribuer rôle', ar: 'تعيين دور' } },
      { key: 'SYS_ADMIN_STATUS_UPDATE', name: { en: 'Update Admin Status', fr: 'Mettre à jour statut', ar: 'تحديث حالة المدير' } },
      { key: 'SYS_ADMIN_PASSWORD_RESET', name: { en: 'Reset Admin Password', fr: 'Réinitialiser mot de passe', ar: 'إعادة تعيين كلمة المرور' } }
    ]
  },


  /**
 * ======================================================
 * ROLES MANAGEMENT
 * ======================================================
 */
  ROLES: {
    key: 'ROLES',
    name: { en: 'Roles Management', fr: 'Gestion des rôles', ar: 'إدارة الأدوار' },
    actions: [
      { key: 'ROLE_CREATE', name: { en: 'Create Role', fr: 'Créer rôle', ar: 'إنشاء دور' } },
      { key: 'ROLE_UPDATE', name: { en: 'Update Role', fr: 'Mettre à jour rôle', ar: 'تحديث الدور' } },
      { key: 'ROLE_DELETE', name: { en: 'Delete Role', fr: 'Supprimer rôle', ar: 'حذف الدور' } },
      { key: 'ROLE_ASSIGN_PERMISSION', name: { en: 'Assign Permissions', fr: 'Attribuer permissions', ar: 'تعيين الصلاحيات' } }
    ]
  },

  /**
   * ======================================================
   * SUBSCRIPTIONS
   * ======================================================
   */
  SUBSCRIPTIONS: {
    key: 'SUBSCRIPTIONS',
    name: { en: 'Subscriptions', fr: 'Abonnements', ar: 'الاشتراكات' },
    actions: [
      { key: 'SUBSCRIPTION_VIEW', name: { en: 'View Subscriptions', fr: 'Voir abonnements', ar: 'عرض الاشتراكات' } },
      { key: 'SUBSCRIPTION_CANCEL', name: { en: 'Cancel Subscription', fr: 'Annuler abonnement', ar: 'إلغاء الاشتراك' } },
      { key: 'SUBSCRIPTION_UPGRADE', name: { en: 'Upgrade Subscription', fr: 'Mettre à niveau', ar: 'ترقية الاشتراك' } },
      { key: 'SUBSCRIPTION_FEATURES_VIEW', name: { en: 'View Subscription Features', fr: 'Voir fonctionnalités', ar: 'عرض ميزات الاشتراك' } }
    ]
  },

  /**
   * ======================================================
   * CUSTOMERS
   * ======================================================
   */
  CUSTOMERS: {
    key: 'CUSTOMERS',
    name: { en: 'Customers', fr: 'Clients', ar: 'العملاء' },
    actions: [
      { key: 'CUSTOMER_ADD', name: { en: 'Add Customer', fr: 'Ajouter un client', ar: 'إضافة عميل' } },
      { key: 'CUSTOMER_VIEW', name: { en: 'View Customers', fr: 'Voir les clients', ar: 'عرض العملاء' } },
      { key: 'CUSTOMER_UPDATE', name: { en: 'Update Customer', fr: 'Mettre à jour le client', ar: 'تحديث العميل' } },
      { key: 'CUSTOMER_DELETE', name: { en: 'Delete Customer', fr: 'Supprimer le client', ar: 'حذف العميل' } }
    ]
  },

  /**
   * ======================================================
   * CMS MANAGEMENT
   * ======================================================
   */
  CMS_MANAGEMENT: {
    key: 'CMS_MANAGEMENT',
    name: { en: 'CMS Management', fr: 'Gestion CMS', ar: 'إدارة المحتوى' },
    actions: [
      { key: 'CMS_CREATE', name: { en: 'Create Page', fr: 'Créer page', ar: 'إنشاء صفحة' } },
      { key: 'CMS_VIEW', name: { en: 'View Pages', fr: 'Voir pages', ar: 'عرض الصفحات' } },
      { key: 'CMS_UPDATE', name: { en: 'Update Page', fr: 'Mettre à jour', ar: 'تحديث الصفحة' } },
      { key: 'CMS_DELETE', name: { en: 'Delete Page', fr: 'Supprimer', ar: 'حذف الصفحة' } }
    ]
  },

  /**
   * ======================================================
   * SUPPORT TICKETS
   * ======================================================
   */
  SUPPORT_TICKETS: {
    key: 'SUPPORT_TICKETS',
    name: { en: 'Support Tickets', fr: 'Tickets de support', ar: 'تذاكر الدعم' },
    actions: [
      { key: 'TICKET_CREATE', name: { en: 'Create Ticket', fr: 'Créer ticket', ar: 'إنشاء تذكرة' } },
      { key: 'TICKET_VIEW', name: { en: 'View Tickets', fr: 'Voir tickets', ar: 'عرض التذاكر' } },
      { key: 'TICKET_ASSIGN', name: { en: 'Assign Ticket', fr: 'Attribuer ticket', ar: 'تعيين التذكرة' } },
      { key: 'TICKET_REPLY', name: { en: 'Reply Ticket', fr: 'Répondre', ar: 'الرد' } }
    ]
  },

  /**
   * ======================================================
   * CUSTOMER SUPPORT TICKETS
   * ======================================================
   */
  CUSTOMER_SUPPORT_TICKETS: {
    key: 'CUSTOMER_SUPPORT_TICKETS',
    name: { en: 'Customer Support', fr: 'Support client', ar: 'دعم العملاء' },
    actions: [
      { key: 'CUSTOMER_TICKET_CREATE', name: { en: 'Create Ticket', fr: 'Créer ticket', ar: 'إنشاء تذكرة' } },
      { key: 'CUSTOMER_TICKET_VIEW', name: { en: 'View Own Tickets', fr: 'Voir ses tickets', ar: 'عرض تذاكر العميل' } },
      { key: 'CUSTOMER_TICKET_CLOSE', name: { en: 'Close Ticket', fr: 'Fermer ticket', ar: 'إغلاق التذكرة' } }
    ]
  },

  /**
   * ======================================================
   * GDPR PRIVACY
   * ======================================================
   */
  GDPR: {
    key: 'GDPR',
    name: { en: 'GDPR Privacy', fr: 'RGPD confidentialité', ar: 'الخصوصية' },
    actions: [
      { key: 'GDPR_EXPORT_DATA', name: { en: 'Export Data', fr: 'Exporter données', ar: 'تصدير البيانات' } },
      { key: 'GDPR_DELETE_DATA', name: { en: 'Delete Data', fr: 'Supprimer données', ar: 'حذف البيانات' } },
      { key: 'GDPR_CONSENT_VIEW', name: { en: 'View Consent', fr: 'Voir consentement', ar: 'عرض الموافقة' } }
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
    name: { en: 'Audit Logs', fr: 'Journaux audit', ar: 'سجلات التدقيق' },
    actions: [
      { key: 'AUDIT_VIEW', name: { en: 'View Audit Logs', fr: 'Voir journaux', ar: 'عرض السجلات' } },
      { key: 'AUDIT_EXPORT', name: { en: 'Export Audit Logs', fr: 'Exporter journaux', ar: 'تصدير السجلات' } }
    ]
  }

};