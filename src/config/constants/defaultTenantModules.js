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

  BUSINESS_DETAILS: {
    key: 'BUSINESS_DETAILS',
    name: { en: 'Business Details', fr: 'Détails de l’entreprise' },
    actions: [
      { key: 'BUSINESS_DETAILS_VIEW', name: { en: 'View Business', fr: 'Voir l’entreprise' } },
      { key: 'BUSINESS_DETAILS_UPDATE', name: { en: 'Update Business', fr: 'Mettre à jour' } }
    ]
  },

  BUSINESS_KYB: {
    key: 'BUSINESS_KYB',
    name: { en: 'Business KYB Verification', fr: 'Vérification KYB Entreprise' },
    actions: [
      { key: 'BUSINESS_KYB_VIEW', name: { en: 'View KYB Documents & Status', fr: 'Voir les documents KYB' } },
      { key: 'BUSINESS_KYB_UPLOAD', name: { en: 'Upload KYB Documents', fr: 'Téléverser les documents KYB' } },
      { key: 'BUSINESS_KYB_HISTORY_VIEW', name: { en: 'View KYB History', fr: 'Voir l’historique KYB' } }
    ]
  },

  SYS_ADMINS: {
    key: 'ADMINS',
    name: { en: 'System Admins', fr: 'Administrateurs système' },
    actions: [
      { key: 'SYS_ADMIN_ADD', name: { en: 'Add Admin', fr: 'Ajouter admin' } },
      { key: 'SYS_ADMIN_UPDATE', name: { en: 'Update Admin', fr: 'Mettre à jour admin' } },
      { key: 'SYS_ADMIN_DELETE', name: { en: 'Delete Admin', fr: 'Supprimer admin' } },
      { key: 'SYS_ADMIN_ASSIGN_ROLE', name: { en: 'Assign Role', fr: 'Attribuer rôle' } },
      { key: 'SYS_ADMIN_STATUS_UPDATE', name: { en: 'Update Admin Status', fr: 'Mettre à jour statut' } },
      { key: 'SYS_ADMIN_PASSWORD_RESET', name: { en: 'Reset Admin Password', fr: 'Réinitialiser mot de passe' } }
    ]
  },

  ROLES: {
    key: 'ROLES',
    name: { en: 'Roles Management', fr: 'Gestion des rôles' },
    actions: [
      { key: 'ROLE_CREATE', name: { en: 'Create Role', fr: 'Créer rôle' } },
      { key: 'ROLE_UPDATE', name: { en: 'Update Role', fr: 'Mettre à jour rôle' } },
      { key: 'ROLE_DELETE', name: { en: 'Delete Role', fr: 'Supprimer rôle' } },
      { key: 'ROLE_ASSIGN_PERMISSION', name: { en: 'Assign Permissions', fr: 'Attribuer permissions' } }
    ]
  },

  SUBSCRIPTIONS: {
    key: 'SUBSCRIPTIONS',
    name: { en: 'Subscriptions', fr: 'Abonnements' },
    actions: [
      { key: 'SUBSCRIPTION_VIEW', name: { en: 'View Subscriptions', fr: 'Voir abonnements' } },
      { key: 'SUBSCRIPTION_CANCEL', name: { en: 'Cancel Subscription', fr: 'Annuler abonnement' } },
      { key: 'SUBSCRIPTION_UPGRADE', name: { en: 'Upgrade Subscription', fr: 'Mettre à niveau' } },
      { key: 'SUBSCRIPTION_FEATURES_VIEW', name: { en: 'View Subscription Features', fr: 'Voir fonctionnalités' } }
    ]
  },

  CUSTOMERS: {
    key: 'CUSTOMERS',
    name: { en: 'Customers', fr: 'Clients' },
    actions: [
      { key: 'CUSTOMER_ADD', name: { en: 'Add Customer', fr: 'Ajouter un client' } },
      { key: 'CUSTOMER_VIEW', name: { en: 'View Customers', fr: 'Voir les clients' } },
      { key: 'CUSTOMER_UPDATE', name: { en: 'Update Customer', fr: 'Mettre à jour le client' } },
      { key: 'CUSTOMER_DELETE', name: { en: 'Delete Customer', fr: 'Supprimer le client' } }
    ]
  },

  CMS_MANAGEMENT: {
    key: 'CMS_MANAGEMENT',
    name: { en: 'CMS Management', fr: 'Gestion CMS' },
    actions: [
      { key: 'CMS_CREATE', name: { en: 'Create Page', fr: 'Créer page' } },
      { key: 'CMS_VIEW', name: { en: 'View Pages', fr: 'Voir pages' } },
      { key: 'CMS_UPDATE', name: { en: 'Update Page', fr: 'Mettre à jour' } },
      { key: 'CMS_DELETE', name: { en: 'Delete Page', fr: 'Supprimer' } }
    ]
  },

  SUPPORT_TICKETS: {
    key: 'SUPPORT_TICKETS',
    name: { en: 'Support Tickets', fr: 'Tickets de support' },
    actions: [
      { key: 'TICKET_CREATE', name: { en: 'Create Ticket', fr: 'Créer ticket' } },
      { key: 'TICKET_VIEW', name: { en: 'View Tickets', fr: 'Voir tickets' } },
      { key: 'TICKET_ASSIGN', name: { en: 'Assign Ticket', fr: 'Attribuer ticket' } },
      { key: 'TICKET_REPLY', name: { en: 'Reply Ticket', fr: 'Répondre' } }
    ]
  },

  CUSTOMER_SUPPORT_TICKETS: {
    key: 'CUSTOMER_SUPPORT_TICKETS',
    name: { en: 'Customer Support', fr: 'Support client' },
    actions: [
      { key: 'CUSTOMER_TICKET_CREATE', name: { en: 'Create Ticket', fr: 'Créer ticket' } },
      { key: 'CUSTOMER_TICKET_VIEW', name: { en: 'View Own Tickets', fr: 'Voir ses tickets' } },
      { key: 'CUSTOMER_TICKET_CLOSE', name: { en: 'Close Ticket', fr: 'Fermer ticket' } }
    ]
  },

  GDPR: {
    key: 'GDPR',
    name: { en: 'GDPR Privacy', fr: 'RGPD confidentialité' },
    actions: [
      { key: 'GDPR_EXPORT_DATA', name: { en: 'Export Data', fr: 'Exporter données' } },
      { key: 'GDPR_DELETE_DATA', name: { en: 'Delete Data', fr: 'Supprimer données' } },
      { key: 'GDPR_CONSENT_VIEW', name: { en: 'View Consent', fr: 'Voir consentement' } }
    ]
  },

  SYS_AUDIT_LOGS: {
    key: 'SYS_AUDIT_LOGS',
    name: { en: 'Audit Logs', fr: 'Journaux audit' },
    actions: [
      { key: 'AUDIT_VIEW', name: { en: 'View Audit Logs', fr: 'Voir journaux' } },
      { key: 'AUDIT_EXPORT', name: { en: 'Export Audit Logs', fr: 'Exporter journaux' } }
    ]
  }

};