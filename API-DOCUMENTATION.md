# MKAdmin APIs Documentation

## Base URL
```
http://localhost:4000
```

## Swagger UI
Access the interactive API documentation at:
```
http://localhost:4000/api-docs
```

## Postman Collection
Import the Postman collection from: `AdminAPIs Backend.postman_collection.json`

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication Routes (`/api/auth`)

### 1.1 Login
- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticate user and generate JWT token
- **Access:** Public
- **Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
- **Response (201):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "...",
      "name": "Admin",
      "email": "admin@example.com",
      "role": {
        "_id": "...",
        "name": "Super Admin"
      },
      "status": "ACTIVE",
      "lastLoginAt": "2024-01-01T00:00:00.000Z",
      "currentDevice": {
        "ipAddress": "::1",
        "userAgent": "Mozilla/5.0...",
        "deviceType": "desktop",
        "os": "Windows",
        "browser": "Chrome"
      }
    }
  }
}
```

---

## 2. Admin Profile Routes (`/api/profile`)

### 2.1 Get My Profile
- **Endpoint:** `GET /api/profile/me`
- **Description:** Get logged-in admin profile details
- **Access:** Private (Authenticated)
- **Headers:** `Authorization: Bearer <token>`
- **Response (201):**
```json
{
  "success": true,
  "message": "Profile fetched",
  "data": {
    "_id": "...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": { ... },
    "status": "ACTIVE"
  }
}
```

---

## 3. System Modules Routes (`/api/systemmodules`)

### 3.1 Create Module
- **Endpoint:** `POST /api/systemmodules/add`
- **Description:** Create a new system module
- **Access:** Private (Requires `SYS_MODULES` - `SYS_MODULE_ADD` permission)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "key": "AFFILIATES",
  "moduleName": {
    "en": "Affiliates",
    "fr": "Affiliés",
    "ar": "الشركاء"
  },
  "description": {
    "en": "Manage affiliates",
    "fr": "Gérer les affiliés",
    "ar": "إدارة الشركاء"
  },
  "isActive": true,
  "actions": [
    {
      "key": "VIEW",
      "actionName": {
        "en": "View",
        "fr": "Voir",
        "ar": "عرض"
      },
      "isActive": true
    }
  ]
}
```

### 3.2 List Modules
- **Endpoint:** `GET /api/systemmodules`
- **Description:** Get list of all system modules
- **Access:** Private (Requires `SYS_MODULES` - `SYS_MODULE_VIEW` permission)
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `page`, `limit`, `search`, `status`
- **Request Body:**
```json
{
  "page": 1,
  "limit": 10,
  "search": "",
  "status": "ACTIVE"
}
```

### 3.3 Get Module by ID
- **Endpoint:** `GET /api/systemmodules/:id`
- **Description:** Get details of a specific system module
- **Access:** Private (Requires `SYS_MODULES` - `SYS_MODULE_VIEW` permission)

### 3.4 Update Module
- **Endpoint:** `PUT /api/systemmodules/:id`
- **Description:** Update a system module
- **Access:** Private (Requires `SYS_MODULES` - `SYS_MODULE_UPDATE` permission)
- **Request Body:**
```json
{
  "moduleName": {
    "en": "Updated Name",
    "fr": "Nom mis à jour",
    "ar": "الاسم المحدث"
  }
}
```

### 3.5 Delete Module (Soft Delete)
- **Endpoint:** `DELETE /api/systemmodules/:id`
- **Description:** Disable (soft delete) a system module
- **Access:** Private (Requires `SYS_MODULES` - `SYS_MODULE_DISABLE` permission)

### 3.6 Toggle Module Status
- **Endpoint:** `PATCH /api/systemmodules/:id/status`
- **Description:** Enable or disable a system module
- **Access:** Private (Requires `SYS_MODULES` - `SYS_MODULE_DISABLE` permission)
- **Request Body:**
```json
{
  "isActive": false
}
```

### 3.7 Add Action to Module
- **Endpoint:** `POST /api/systemmodules/:id/actions`
- **Description:** Add a new action to a system module
- **Access:** Private (Requires `SYS_MODULES` - `SYS_MODULE_ADD_ACTION` permission)
- **Request Body:**
```json
{
  "key": "CREATE",
  "actionName": {
    "en": "Create",
    "fr": "Créer",
    "ar": "إنشاء"
  },
  "isActive": true
}
```

### 3.8 Update Action
- **Endpoint:** `PUT /api/systemmodules/:id/actions`
- **Description:** Update an existing action in a system module
- **Access:** Private (Requires `SYS_MODULES` - `SYS_MODULE_UPDATE_ACTION` permission)
- **Request Body:**
```json
{
  "oldKey": "VIEW",
  "newKey": "VIEW_ALL",
  "actionName": {
    "en": "View All",
    "fr": "Voir tout",
    "ar": "عرض الكل"
  },
  "isActive": true
}
```

### 3.9 Delete Action
- **Endpoint:** `DELETE /api/systemmodules/:id/actions`
- **Description:** Disable an action in a system module
- **Access:** Private (Requires `SYS_MODULES` - `SYS_MODULE_DISABLE_ACTION` permission)
- **Request Body:**
```json
{
  "key": "VIEW"
}
```

---

## 4. Roles Routes (`/api/roles`)

### 4.1 Create Role
- **Endpoint:** `POST /api/roles`
- **Description:** Create a new role
- **Access:** Private (Requires `SYS_ROLES` - `SYS_ROLE_ADD` permission)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "name": {
    "en": "Manager",
    "fr": "Gestionnaire",
    "ar": "مدير"
  },
  "description": {
    "en": "Manager role",
    "fr": "Rôle gestionnaire",
    "ar": "دور المدير"
  }
}
```

### 4.2 List Roles
- **Endpoint:** `GET /api/roles`
- **Description:** Get list of all roles
- **Access:** Private (Requires `SYS_ROLES` - `SYS_ROLE_VIEW` permission)
- **Request Body:**
```json
{
  "page": 1,
  "limit": 10,
  "search": "",
  "status": true
}
```

### 4.3 Update Role
- **Endpoint:** `PUT /api/roles/:id`
- **Description:** Update role details
- **Access:** Private (Requires `SYS_ROLES` - `SYS_ROLE_UPDATE` permission)
- **Request Body:**
```json
{
  "name": {
    "en": "Updated Manager",
    "fr": "Gestionnaire mis à jour",
    "ar": "مدير محدث"
  },
  "description": {
    "en": "Updated description",
    "fr": "Description mise à jour",
    "ar": "الوصف المحدث"
  }
}
```

### 4.4 Update Role Status
- **Endpoint:** `PATCH /api/roles/:id/status`
- **Description:** Update role active/inactive status
- **Access:** Private (Requires `SYS_ROLES` - `SYS_ROLE_UPDATE` permission)
- **Request Body:**
```json
{
  "status": false
}
```

### 4.5 Assign Permissions to Role
- **Endpoint:** `PATCH /api/roles/:id/permissions`
- **Description:** Assign module & action permissions to a role
- **Access:** Private (Requires `SYS_ROLES` - `SYS_ROLE_ASSIGN_PERMISSIONS` permission)
- **Request Body:**
```json
{
  "modules": [
    {
      "moduleKey": "AFFILIATES",
      "actions": [
        {
          "actionKey": "VIEW",
          "allowed": true
        },
        {
          "actionKey": "CREATE",
          "allowed": true
        }
      ]
    }
  ]
}
```

---

## 5. System Users Routes (`/api/systemusers`)

### 5.1 Create User
- **Endpoint:** `POST /api/systemusers`
- **Description:** Create a new system admin
- **Access:** Private (Requires `SYS_ADMINS` - `SYS_ADMIN_ADD` permission)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneCode": "+1",
  "phoneNumber": "1234567890",
  "password": "SecurePass123!",
  "role": "role_id_here",
  "allowedCountries": ["US", "UK"],
  "status": "ACTIVE"
}
```

### 5.2 List Users
- **Endpoint:** `GET /api/systemusers`
- **Description:** Get paginated list of system admins
- **Access:** Private (Requires `SYS_ADMINS` - `SYS_ADMIN_VIEW` permission)
- **Request Body:**
```json
{
  "page": 1,
  "limit": 10,
  "search": "",
  "status": "ACTIVE",
  "roleId": "",
  "country": ""
}
```

### 5.3 Update User
- **Endpoint:** `POST /api/systemusers/:id`
- **Description:** Update system admin
- **Access:** Private (Requires `SYS_ADMINS` - `SYS_ADMIN_UPDATE` permission)
- **Request Body:**
```json
{
  "name": "Updated Name",
  "phoneNumber": "9876543210",
  "role": "new_role_id",
  "status": "ACTIVE"
}
```

### 5.4 Reset User Password (Admin)
- **Endpoint:** `POST /api/systemusers/:id/reset-password`
- **Description:** Admin resets a user's password
- **Access:** Private (Requires `SYS_ADMINS` - `SYS_ADMIN_RESET_PASSWORD` permission)
- **Request Body:**
```json
{
  "newPassword": "NewSecurePass123!"
}
```

### 5.5 Change Own Password
- **Endpoint:** `POST /api/systemusers/me/change-password`
- **Description:** User changes their own password
- **Access:** Private (Authenticated User)
- **Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

---

## 6. Plans Routes (`/api/plans`)

### 6.1 Create Plan
- **Endpoint:** `POST /api/plans`
- **Description:** Create a new subscription plan
- **Access:** Private (Requires `SUBSCRIPTION_PLANS` - `SUB_PLAN_ADD` permission)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "name": {
    "en": "Basic Plan",
    "fr": "Plan de base",
    "ar الأساسية"
  },
  "description":": "الخطة {
    "en": "Basic features",
    "fr": "Fonctionnalités de base",
    "ar": "الميزات الأساسية"
  },
  "price": 9.99,
  "currency": "USD",
  "duration": "MONTHLY",
  "modules": []
}
```

### 6.2 List Plans
- **Endpoint:** `GET /api/plans`
- **Description:** Get list of all plans
- **Access:** Private (Requires `SUBSCRIPTION_PLANS` - `SUB_PLAN_VIEW` permission)
- **Request Body:**
```json
{
  "page": 1,
  "limit": 10,
  "search": "",
  "status": "ACTIVE"
}
```

### 6.3 Get Plan by ID
- **Endpoint:** `GET /api/plans/:id`
- **Description:** Get single plan by ID
- **Access:** Private (Requires `SUBSCRIPTION_PLANS` - `SUB_PLAN_VIEW` permission)

### 6.4 Update Plan
- **Endpoint:** `PUT /api/plans/:id`
- **Description:** Update a plan
- **Access:** Private (Requires `SUBSCRIPTION_PLANS` - `SUB_PLAN_UPDATE` permission)
- **Request Body:**
```json
{
  "name": {
    "en": "Updated Basic Plan",
    "fr": "Plan de base mis à jour",
    "ar": "الخطة الأساسية المحدثة"
  },
  "price": 14.99,
  "status": "ACTIVE"
}
```

### 6.5 Delete Plan
- **Endpoint:** `DELETE /api/plans/:id`
- **Description:** Delete a plan
- **Access:** Private (Requires `SUBSCRIPTION_PLANS` - `SUB_PLAN_DELETE` permission)

### 6.6 Assign Modules to Plan
- **Endpoint:** `POST /api/plans/:id/modules`
- **Description:** Assign modules & actions to a plan
- **Access:** Private (Requires `SUBSCRIPTION_PLANS` - `SUB_PLAN_ASSIGN_FEATURES` permission)
- **Request Body:**
```json
{
  "modules": [
    {
      "moduleKey": "AFFILIATES",
      "allowed": true,
      "actions": [
        {
          "actionKey": "VIEW",
          "allowed": true
        }
      ]
    }
  ]
}
```

---

## 7. Affiliates Routes (`/api/affilaite`)

### 7.1 Create Affiliate
- **Endpoint:** `POST /api/affilaite`
- **Description:** Create a new affiliate
- **Access:** Private (Requires `AFFILIATES` - `AFFILIATE_CREATE` permission)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "email": "affiliate@example.com",
  "phoneCode": "+1",
  "phoneNumber": "1234567890",
  "password": "SecurePass123!",
  "languages": {
    "name": {
      "en": "John Affiliate",
      "fr": "Jean Affilié",
      "ar": "جون شريك"
    },
    "companyName": {
      "en": "Affiliate Corp",
      "fr": "Corp Affilié",
      "ar": "شركة الشريك"
    },
    "bio": {
      "en": "Best affiliate",
      "fr": "Meilleur affilié",
      "ar": "أفضل شريك"
    },
    "address": {
      "street": { "en": "123 Main St", "fr": "123 Rue Principale", "ar": "123 شارع رئيسي" },
      "city": { "en": "New York", "fr": "New York", "ar": "نيويورك" },
      "state": { "en": "NY", "fr": "NY", "ar": "نيويورك" },
      "country": { "en": "USA", "fr": "États-Unis", "ar": "الولايات المتحدة" }
    }
  },
  "website": "https://affiliate.com",
  "kybVerified": false,
  "status": "ACTIVE"
}
```

### 7.2 Get Affiliate by ID
- **Endpoint:** `GET /api/affilaite/:id`
- **Description:** Get affiliate by ID
- **Access:** Private (Requires `AFFILIATES` - `AFFILIATE_VIEW` permission)

### 7.3 Update Affiliate
- **Endpoint:** `PUT /api/affilaite/:id`
- **Description:** Update an affiliate
- **Access:** Private (Requires `AFFILIATES` - `AFFILIATE_UPDATE` permission)
- **Request Body:**
```json
{
  "phoneCode": "+1",
  "phoneNumber": "9876543210",
  "languages": {
    "name": {
      "en": "Updated Name"
    }
  },
  "status": "ACTIVE"
}
```

### 7.4 Soft Delete Affiliate
- **Endpoint:** `DELETE /api/affilaite/:id`
- **Description:** Soft delete an affiliate
- **Access:** Private (Requires `AFFILIATES` - `AFFILIATE_DELETE` permission)

### 7.5 List Affiliates
- **Endpoint:** `GET /api/affilaite`
- **Description:** List affiliates with pagination
- **Access:** Private (Requires `AFFILIATES` - `AFFILIATE_VIEW` permission)
- **Request Body:**
```json
{
  "page": 1,
  "limit": 10,
  "search": "",
  "status": "ACTIVE"
}
```

---

## 8. Audit Logs Routes (`/api/audit-logs`)

### 8.1 List Activity Logs
- **Endpoint:** `GET /api/audit-logs`
- **Description:** Get current activity/audit logs with pagination and filters
- **Access:** Private (Requires `SYS_AUDIT_LOGS` - `SYS_AUDIT_VIEW` permission)
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters (optional):** `page`, `limit`, `search`, `module`, `action`, `status`, `userId`, `dateFrom`, `dateTo`
- **Example:**
```http
GET /api/audit-logs?page=1&limit=20&search=role&status=SUCCESS
```

---

## 9. Health Check

### 9.1 Server Status
- **Endpoint:** `GET /`
- **Description:** Simple health/status endpoint
- **Access:** Public
- **Response:** `APIs are running...`

---

## Error Response Format

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Permissions Required

| Module | Permission Key | Description |
|--------|---------------|-------------|
| AUTH | - | Login |
| SYS_MODULES | SYS_MODULE_ADD | Create module |
| SYS_MODULES | SYS_MODULE_VIEW | View modules |
| SYS_MODULES | SYS_MODULE_UPDATE | Update module |
| SYS_MODULES | SYS_MODULE_DISABLE | Disable module |
| SYS_MODULES | SYS_MODULE_ADD_ACTION | Add action |
| SYS_MODULES | SYS_MODULE_UPDATE_ACTION | Update action |
| SYS_MODULES | SYS_MODULE_DISABLE_ACTION | Disable action |
| SYS_ROLES | SYS_ROLE_ADD | Create role |
| SYS_ROLES | SYS_ROLE_VIEW | View roles |
| SYS_ROLES | SYS_ROLE_UPDATE | Update role |
| SYS_ROLES | SYS_ROLE_ASSIGN_PERMISSIONS | Assign permissions |
| SYS_ADMINS | SYS_ADMIN_ADD | Create admin |
| SYS_ADMINS | SYS_ADMIN_VIEW | View admins |
| SYS_ADMINS | SYS_ADMIN_UPDATE | Update admin |
| SYS_ADMINS | SYS_ADMIN_RESET_PASSWORD | Reset password |
| SUBSCRIPTION_PLANS | SUB_PLAN_ADD | Create plan |
| SUBSCRIPTION_PLANS | SUB_PLAN_VIEW | View plans |
| SUBSCRIPTION_PLANS | SUB_PLAN_UPDATE | Update plan |
| SUBSCRIPTION_PLANS | SUB_PLAN_DELETE | Delete plan |
| SUBSCRIPTION_PLANS | SUB_PLAN_ASSIGN_FEATURES | Assign features |
| AFFILIATES | AFFILIATE_CREATE | Create affiliate |
| AFFILIATES | AFFILIATE_VIEW | View affiliates |
| AFFILIATES | AFFILIATE_UPDATE | Update affiliate |
| AFFILIATES | AFFILIATE_DELETE | Delete affiliate |
| SYS_AUDIT_LOGS | SYS_AUDIT_VIEW | View activity logs |

