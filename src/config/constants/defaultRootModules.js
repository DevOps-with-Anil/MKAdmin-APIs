/**
 * ======================================================
 * ROOT PLATFORM MODULES & ACTION CONSTANTS
 * ======================================================
 * 
 * IMPORTANT (DO NOT BREAK):
 * -------------------------
 * 1. NEVER change existing keys (used as system identifiers)
 * 2. NEVER delete keys in production
 * 3. ONLY add new modules/actions
 * 4. Keys are permanent and stored in DB & logs
 
 * Multi-language Support:
 * -----------------------
 * NEVER localize keys — only name labels.
 */


module.exports = {

SYS_MODULES: {
  key: 'SYS_MODULES',
  name: { en: 'System Modules', fr: 'Modules système' },
  actions: [
    { key: 'SYS_MODULE_ADD', name: { en: 'Add Module', fr: 'Ajouter un module' } },
    { key: 'SYS_MODULE_VIEW', name: { en: 'View Modules', fr: 'Voir les modules' } },
    { key: 'SYS_MODULE_UPDATE', name: { en: 'Update Module', fr: 'Mettre à jour le module' } },

    { key: 'SYS_MODULE_STATUS', name: { en: 'Change Module Status', fr: 'Changer le statut du module' } },
    { key: 'SYS_MODULE_DELETE', name: { en: 'Delete Module', fr: 'Supprimer le module' } },

    { key: 'SYS_MODULE_ADD_ACTION', name: { en: 'Add Module Action', fr: 'Ajouter une action de module' } },
    { key: 'SYS_MODULE_VIEW_ACTION', name: { en: 'View Module Actions', fr: 'Voir les actions du module' } },
    { key: 'SYS_MODULE_UPDATE_ACTION', name: { en: 'Update Module Action', fr: 'Mettre à jour l’action du module' } },

    { key: 'SYS_MODULE_DISABLE_ACTION', name: { en: 'Disable Module Action', fr: 'Désactiver l’action du module' } },
    { key: 'SYS_MODULE_DELETE_ACTION', name: { en: 'Delete Module Action', fr: 'Supprimer l’action du module' } }
  ]
},

TENANT_MODULES: {
  key: 'TENANT_MODULES',
  name: { en: 'Tenant Modules', fr: 'Modules des locataires' },
  actions: [
    { key: 'TENANT_MODULE_ADD', name: { en: 'Add Module', fr: 'Ajouter un module' } },
    { key: 'TENANT_MODULE_VIEW', name: { en: 'View Modules', fr: 'Voir les modules' } },
    { key: 'TENANT_MODULE_UPDATE', name: { en: 'Update Module', fr: 'Mettre à jour le module' } },

    // Status + Delete split
    { key: 'TENANT_MODULE_STATUS', name: { en: 'Change Module Status', fr: 'Changer le statut du module' } },
    { key: 'TENANT_MODULE_DELETE', name: { en: 'Delete Module', fr: 'Supprimer le module' } },

    // Module Actions
    { key: 'TENANT_MODULE_ADD_ACTION', name: { en: 'Add Module Action', fr: 'Ajouter une action' } },
    { key: 'TENANT_MODULE_VIEW_ACTION', name: { en: 'View Module Actions', fr: 'Voir les actions' } },
    { key: 'TENANT_MODULE_UPDATE_ACTION', name: { en: 'Update Module Action', fr: 'Mettre à jour l’action' } },

    { key: 'TENANT_MODULE_STATUS_ACTION', name: { en: 'Change Module Action Status', fr: 'Changer le statut de l’action' } },
    { key: 'TENANT_MODULE_DELETE_ACTION', name: { en: 'Delete Module Action', fr: 'Supprimer l’action' } }
  ]
},

SYS_ROLES: {
  key: 'SYS_ROLES',
  name: { en: 'System Roles', fr: 'Rôles système' },
  actions: [
    { key: 'SYS_ROLE_ADD', name: { en: 'Add Role', fr: 'Ajouter un rôle' } },
    { key: 'SYS_ROLE_VIEW', name: { en: 'View Roles', fr: 'Voir les rôles' } },
    { key: 'SYS_ROLE_UPDATE', name: { en: 'Update Role', fr: 'Mettre à jour le rôle' } },
    { key: 'SYS_ROLE_DELETE', name: { en: 'Delete Role', fr: 'Supprimer le rôle' } },
    { key: 'SYS_ROLE_ASSIGN_PERMISSIONS', name: { en: 'Assign Permissions to Role', fr: 'Attribuer des autorisations au rôle' } }
  ]
},

SYS_USERS: {
  key: 'SYS_USERS',
  name: { en: 'System Users', fr: 'Utilisateurs système' },
  actions: [
    { key: 'SYS_USER_ADD', name: { en: 'Add User', fr: 'Ajouter un utilisateur' } },
    { key: 'SYS_USER_VIEW', name: { en: 'View Users', fr: 'Voir les utilisateurs' } },
    { key: 'SYS_USER_UPDATE', name: { en: 'Update User', fr: 'Mettre à jour l’utilisateur' } },
    { key: 'SYS_USER_DELETE', name: { en: 'Delete User', fr: 'Supprimer l’utilisateur' } },
    { key: 'SYS_USER_RESET_PASSWORD', name: { en: 'Reset User Password', fr: 'Réinitialiser le mot de passe' } },
    { key: 'SYS_USER_CHANGE_STATUS', name: { en: 'Change User Status', fr: 'Changer le statut' } },
  ]
},

SUBSCRIPTION_PLANS: {
  key: 'SUBSCRIPTION_PLANS',
  name: { en: 'Subscription Plans', fr: 'Plans d’abonnement' },
  actions: [
    { key: 'SUB_PLAN_ADD', name: { en: 'Create Plan', fr: 'Créer un plan' } },
    { key: 'SUB_PLAN_VIEW', name: { en: 'View Plans', fr: 'Voir les plans' } },
    { key: 'SUB_PLAN_UPDATE', name: { en: 'Update Plan', fr: 'Mettre à jour le plan' } },

    { key: 'SUB_PLAN_DELETE', name: { en: 'Delete Plan', fr: 'Supprimer le plan' } },
    { key: 'SUB_PLAN_STATUS', name: { en: 'Change Plan Status', fr: 'Changer le statut du plan' } },

    { key: 'SUB_PLAN_ASSIGN_FEATURES', name: { en: 'Assign Plan Permissions', fr: 'Attribuer les autorisations' } }
  ]
},


TENANTS: {
  key: 'TENANTS',
  name: { en: 'WhiteLabel Tenants', fr: 'Locataires en marque blanche' },
  actions: [
    { key: 'TENANT_CREATE', name: { en: 'Create Tenant', fr: 'Créer un locataire' } },
    { key: 'TENANT_VIEW', name: { en: 'View Tenants', fr: 'Voir les locataires' } },
    { key: 'TENANT_UPDATE', name: { en: 'Update Tenant', fr: 'Mettre à jour le locataire' } },

    { key: 'TENANT_DELETE', name: { en: 'Delete Tenant', fr: 'Supprimer le locataire' } },
    { key: 'TENANT_STATUS', name: { en: 'Change Tenant Status', fr: 'Changer le statut' } },

    { key: 'TENANT_ASSIGN_PLAN', name: { en: 'Assign Plan', fr: 'Attribuer un plan' } }
  ]
},

TENANT_SUBSCRIPTIONS: {
  key: 'TENANT_SUBSCRIPTIONS',
  name: { en: 'Tenant Subscriptions', fr: 'Abonnements des locataires' },
  actions: [
    { key: 'TENANT_ASSIGN_PLAN', name: { en: 'Assign Plan', fr: 'Attribuer un plan' } },
    { key: 'TENANT_UPDATE_PLAN', name: { en: 'Update Plan', fr: 'Mettre à jour le plan' } },

    { key: 'TENANT_VIEW_SUBSCRIPTION', name: { en: 'View Subscription', fr: 'Voir l’abonnement' } },
    { key: 'TENANT_VIEW_SUBSCRIPTION_HISTORY', name: { en: 'View Subscription History', fr: 'Voir l’historique des abonnements' } },

    { key: 'TENANT_CANCEL_SUBSCRIPTION', name: { en: 'Cancel Subscription', fr: 'Annuler l’abonnement' } },
    { key: 'TENANT_CHANGE_PLAN', name: { en: 'Change Subscription Plan', fr: 'Changer de plan' } },
    { key: 'TENANT_VIEW_BILLING', name: { en: 'View Tenant Billing', fr: 'Voir la facturation des locataires' } },
  ]
},

TENANTS_KYB: {
  key: 'TENANTS_KYB',
  name: { en: 'Tenant KYB Management', fr: 'Gestion KYB des locataires' },
  actions: [
    { key: 'KYB_UPLOAD', name: { en: 'Upload KYB Documents', fr: 'Télécharger documents KYB' } },
    { key: 'KYB_VIEW', name: { en: 'View KYB Documents', fr: 'Voir documents KYB' } },
    { key: 'KYB_DELETE', name: { en: 'Delete KYB Documents', fr: 'Supprimer documents KYB' } },

    { key: 'TENANT_KYB_VIEW_ALL', name: { en: 'View All KYB Requests', fr: 'Voir toutes les demandes KYB' } },
    { key: 'TENANT_KYB_VERIFY', name: { en: 'Verify KYB Documents', fr: 'Vérifier documents KYB' } },
    { key: 'TENANT_KYB_REJECT', name: { en: 'Reject KYB Documents', fr: 'Rejeter documents KYB' } },
    { key: 'TENANT_KYB_SUSPEND', name: { en: 'Suspend Tenant for KYB Non-Compliance', fr: 'Suspendre pour non-conformité KYB' } },
    { key: 'TENANT_KYB_MARK_EXPIRED', name: { en: 'Mark KYB as Expired', fr: 'Marquer KYB expiré' } },
    { key: 'TENANT_KYB_NOTIFY', name: { en: 'Notify Tenant for KYB Status', fr: 'Notifier le locataire du statut KYB' } }
  ]
},

TENANTS_SUPPORT_TICKETS: {
    key: 'TENANTS_SUPPORT_TICKETS',
    name: { en: 'Tenants Support Tickets', fr: 'Support des tickets locataires' },
    actions: [
      { key: 'TENANT_TICKETS_VIEW_ALL', name: { en: 'View All Tickets', fr: 'Voir tous les tickets' } },
      { key: 'TENANT_TICKETS_VIEW', name: { en: 'View Ticket Details', fr: 'Voir les détails du ticket' } },
      { key: 'TENANT_TICKETS_CREATE', name: { en: 'Create Ticket', fr: 'Créer un ticket' } },
      { key: 'TENANT_TICKETS_UPDATE', name: { en: 'Update Ticket', fr: 'Mettre à jour le ticket' } },
      { key: 'TENANT_TICKETS_DELETE', name: { en: 'Delete Ticket', fr: 'Supprimer le ticket' } },
      { key: 'TENANT_TICKETS_ASSIGN', name: { en: 'Assign Ticket', fr: 'Assigner le ticket' } },
      { key: 'TENANT_TICKETS_CLOSE', name: { en: 'Close Ticket', fr: 'Fermer le ticket' } },
      { key: 'TENANT_TICKETS_REOPEN', name: { en: 'Reopen Ticket', fr: 'Rouvrir le ticket' } },
      { key: 'TENANT_TICKETS_COMMENT', name: { en: 'Add Comment', fr: 'Ajouter un commentaire' } },
      { key: 'TENANT_TICKETS_ATTACHMENTS', name: { en: 'Manage Attachments', fr: 'Gérer les pièces jointes' } },
      { key: 'TENANT_TICKETS_EXPORT', name: { en: 'Export Tickets', fr: 'Exporter les tickets' } },
    ]
},

SYS_ANALYTICS:{
    key: 'SYS_ANALYTICS',
    name: { en: 'System Analytics', fr: 'Affiliés en marque blanche' },
    actions: [
      { key: 'SYS_ANALYTICS_VIEW_ALL', name: { en: 'View All Analytics', fr: 'Voir toutes les demandes KYB' } },
    ]
},

SYS_SETTINGS:{
    key: 'SYS_SETTINGS',
    name: { en: 'System Settings', fr: 'Affiliés en marque blanche' },
    actions: [
      { key: 'SYS_ANALYTICS_VIEW_ALL', name: { en: 'View All Analytics', fr: 'Voir toutes les demandes KYB' } },
    ]
},


SYS_AUDIT_LOGS: {
    key: 'SYS_AUDIT_LOGS',
    name: { en: 'Audit Logs', fr: 'Journaux d’audit' },
    actions: [
      { key: 'SYS_AUDIT_VIEW', name: { en: 'View Audit Logs', fr: 'Voir les journaux' } },
      { key: 'SYS_AUDIT_EXPORT', name: { en: 'Export Audit Logs', fr: 'Exporter les journaux' } }
    ]
}

};