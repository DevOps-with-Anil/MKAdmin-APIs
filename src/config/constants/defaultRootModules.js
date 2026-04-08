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

AFFILIATE_MODULES: {
  key: 'AFFILIATE_MODULES',
  name: { en: 'Affiliate Modules', fr: 'Modules affiliés' },
  actions: [
    { key: 'AFFILIATE_MODULE_ADD', name: { en: 'Add Module', fr: 'Ajouter un module' } },
    { key: 'AFFILIATE_MODULE_VIEW', name: { en: 'View Modules', fr: 'Voir les modules' } },
    { key: 'AFFILIATE_MODULE_UPDATE', name: { en: 'Update Module', fr: 'Mettre à jour le module' } },

    // ✅ Status + Delete split
    { key: 'AFFILIATE_MODULE_STATUS', name: { en: 'Change Module Status', fr: 'Changer le statut du module' } },
    { key: 'AFFILIATE_MODULE_DELETE', name: { en: 'Delete Module', fr: 'Supprimer le module' } },

    // Module Actions
    { key: 'AFFILIATE_MODULE_ADD_ACTION', name: { en: 'Add Module Action', fr: 'Ajouter une action' } },
    { key: 'AFFILIATE_MODULE_VIEW_ACTION', name: { en: 'View Module Actions', fr: 'Voir les actions' } },
    { key: 'AFFILIATE_MODULE_UPDATE_ACTION', name: { en: 'Update Module Action', fr: 'Mettre à jour l’action' } },

    { key: 'AFFILIATE_MODULE_STATUS_ACTION', name: { en: 'Change Module Action Status', fr: 'Changer le statut de l’action' } },
    { key: 'AFFILIATE_MODULE_DELETE_ACTION', name: { en: 'Delete Module Action', fr: 'Supprimer l’action' } }
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

AFFILIATES: {
  key: 'AFFILIATES',
  name: { en: 'WhiteLabel Affiliates', fr: 'Affiliés en marque blanche' },
  actions: [
    { key: 'AFFILIATE_CREATE', name: { en: 'Create Affiliate', fr: 'Créer un affilié' } },
    { key: 'AFFILIATE_VIEW', name: { en: 'View Affiliates', fr: 'Voir les affiliés' } },
    { key: 'AFFILIATE_UPDATE', name: { en: 'Update Affiliate', fr: 'Mettre à jour l’affilié' } },

    { key: 'AFFILIATE_DELETE', name: { en: 'Delete Affiliate', fr: 'Supprimer l’affilié' } },
    { key: 'AFFILIATE_STATUS', name: { en: 'Change Affiliate Status', fr: 'Changer le statut' } },

    { key: 'AFFILIATE_ASSIGN_PLAN', name: { en: 'Assign Plan', fr: 'Attribuer un plan' } }
  ]
},

AFFILIATE_SUBSCRIPTIONS: {
  key: 'AFFILIATE_SUBSCRIPTIONS',
  name: { en: 'Affiliate Subscriptions', fr: 'Abonnements affiliés' },
  actions: [
    { key: 'AFFILIATE_ASSIGN_PLAN', name: { en: 'Assign Plan', fr: 'Attribuer un plan' } },
    { key: 'AFFILIATE_UPDATE_PLAN', name: { en: 'Update Plan', fr: 'Mettre à jour le plan' } },

    { key: 'AFFILIATE_VIEW_SUBSCRIPTION', name: { en: 'View Subscription', fr: 'Voir l’abonnement' } },
    { key: 'AFFILIATE_VIEW_SUBSCRIPTION_HISTORY', name: { en: 'View Subscription History', fr: 'Voir l’historique des abonnements' } },

    { key: 'AFFILIATE_CANCEL_SUBSCRIPTION', name: { en: 'Cancel Subscription', fr: 'Annuler l’abonnement' } }
  ]
},

AFFILIATES_KYB: {
    key: 'AFFILIATES_KYB',
    name: { en: 'WhiteLabel Affiliates KYB', fr: 'Affiliés en marque blanche' },
    actions: [
      { key: 'AFFILIATE_KYB_VIEW_ALL', name: { en: 'View All KYB Verification Requests', fr: 'Voir toutes les demandes KYB' } },
      { key: 'AFFILIATE_KYB_VERIFY', name: { en: 'Verify KYB Documents', fr: 'Vérifier les documents KYB' } },
      { key: 'AFFILIATE_KYB_REJECT', name: { en: 'Reject KYB Documents', fr: 'Rejeter les documents KYB' } },
      { key: 'AFFILIATE_KYB_SUSPEND', name: { en: 'Suspend Affiliate for KYB Non-Compliance', fr: 'Suspendre pour non-conformité KYB' } },
      { key: 'AFFILIATE_KYB_MARK_EXPIRED', name: { en: 'Mark KYB as Expired', fr: 'Marquer KYB comme expiré' } },
      { key: 'AFFILIATE_KYB_NOTIFY', name: { en: 'Notify Affiliate for KYB Status', fr: 'Notifier l’affilié du statut KYB' } },

      { key: 'AFFILIATE_ASSIGN_PLAN', name: { en: 'Assign Subscription Plan', fr: 'Attribuer un plan' } },
      { key: 'AFFILIATE_CHANGE_PLAN', name: { en: 'Change Subscription Plan', fr: 'Changer de plan' } },
      { key: 'AFFILIATE_VIEW_BILLING', name: { en: 'View Affiliate Billing', fr: 'Voir la facturation' } },

      { key: 'AFFILIATE_UPDATE_BRANDING', name: { en: 'Update Affiliate Branding', fr: 'Mettre à jour la marque' } },
      { key: 'AFFILIATE_SET_DOMAIN', name: { en: 'Set Custom Domain', fr: 'Définir un domaine' } },
      { key: 'AFFILIATE_SET_EMAIL_SMTP', name: { en: 'Set Email SMTP Configuration', fr: 'Configurer SMTP Email' } },

      { key: 'AFFILIATE_EXPORT_DATA', name: { en: 'Export Affiliate Data', fr: 'Exporter les données' } },
    ]
},

AFFILIATES_SUPPORT_TICKETS: {
    key: 'AFFILIATES_SUPPORT_TICKETS',
    name: { en: 'Affiliates Support Tickets', fr: 'Affiliés en marque blanche' },
    actions: [
      { key: 'AFFILIATE_TICKETS_VIEW_ALL', name: { en: 'View All KYB Verification Requests', fr: 'Voir toutes les demandes KYB' } },
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