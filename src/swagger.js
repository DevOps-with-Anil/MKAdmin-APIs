const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MKAdmin APIs",
      version: "1.0.0",
      description: "Backend API documentation for MKAdmin project",
      contact: {
        name: "API Support",
        email: "support@impetrosys.com"
      }
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Development Server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        // Auth Schemas
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" }
          }
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                token: { type: "string" },
                user: { type: "object" }
              }
            }
          }
        },
        
        // User Schemas
        CreateUserRequest: {
          type: "object",
          required: ["name", "email", "password", "role", "phoneCode", "phoneNumber"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            phoneCode: { type: "string" },
            phoneNumber: { type: "string" },
            password: { type: "string" },
            role: { type: "string" },
            allowedCountries: { type: "array", items: { type: "string" } },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE", "SUSPENDED"] }
          }
        },
        
        // Role Schemas
        CreateRoleRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "object",
              properties: {
                en: { type: "string" },
                fr: { type: "string" },
                ar: { type: "string" }
              }
            },
            description: {
              type: "object",
              properties: {
                en: { type: "string" },
                fr: { type: "string" },
                ar: { type: "string" }
              }
            }
          }
        },
        
        // Module Schemas
        CreateModuleRequest: {
          type: "object",
          required: ["key", "moduleName"],
          properties: {
            key: { type: "string" },
            moduleName: {
              type: "object",
              properties: {
                en: { type: "string" },
                fr: { type: "string" },
                ar: { type: "string" }
              }
            },
            description: {
              type: "object",
              properties: {
                en: { type: "string" },
                fr: { type: "string" },
                ar: { type: "string" }
              }
            },
            isActive: { type: "boolean" },
            actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: { type: "string" },
                  actionName: { type: "object" },
                  isActive: { type: "boolean" }
                }
              }
            }
          }
        },
        
        // Plan Schemas
        CreatePlanRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "object",
              properties: {
                en: { type: "string" },
                fr: { type: "string" },
                ar: { type: "string" }
              }
            },
            description: {
              type: "object",
              properties: {
                en: { type: "string" },
                fr: { type: "string" },
                ar: { type: "string" }
              }
            },
            price: { type: "number" },
            currency: { type: "string" },
            duration: { type: "string", enum: ["MONTHLY", "YEARLY", "LIFETIME"] },
            modules: { type: "array" }
          }
        },
        
        // Affiliate Schemas
        CreateAffiliateRequest: {
          type: "object",
          required: ["email", "password", "languages"],
          properties: {
            email: { type: "string", format: "email" },
            phoneCode: { type: "string" },
            phoneNumber: { type: "string" },
            password: { type: "string" },
            photo: { type: "string" },
            languages: {
              type: "object",
              properties: {
                name: { type: "object" },
                companyName: { type: "object" },
                bio: { type: "object" },
                address: { type: "object" }
              }
            },
            website: { type: "string" },
            kybVerified: { type: "boolean" },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE", "SUSPENDED"] }
          }
        },
        CreateCmsRequest: {
          type: "object",
          required: ["title", "content"],
          properties: {
            type: { type: "string", enum: ["PAGE", "ARTICLE", "POST", "BANNER", "OTHER"] },
            title: {
              type: "object",
              properties: {
                en: { type: "string" },
                fr: { type: "string" },
                ar: { type: "string" }
              }
            },
            content: {
              type: "object",
              properties: {
                en: { type: "string" },
                fr: { type: "string" },
                ar: { type: "string" }
              }
            },
            slug: { type: "string" },
            status: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
            tags: {
              type: "array",
              items: { type: "string" }
            },
            meta: {
              type: "object",
              additionalProperties: true
            }
          }
        },
        
        // Common Schemas
        PaginationRequest: {
          type: "object",
          properties: {
            page: { type: "integer", default: 1 },
            limit: { type: "integer", default: 10 },
            search: { type: "string" },
            status: { type: "string" }
          }
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                details: { type: "string" }
              }
            }
          }
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
            meta: { type: "object" }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
    paths: {
      "/": {
        get: {
          summary: "Health check endpoint",
          description: "Returns API status",
          responses: {
            "200": {
              description: "API is running",
              content: {
                "text/plain": {
                  example: "APIs are running..."
                }
              }
            }
          }
        }
      },
      "/api/auth/login": {
        post: {
          summary: "User login",
          description: "Authenticate user and get JWT token",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AuthResponse"
                  }
                }
              }
            },
            "401": {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/profile/me": {
        get: {
          summary: "Get current user profile",
          description: "Returns the profile of the authenticated user",
          tags: ["Profile"],
          security: [{ bearerAuth: [] }],
          responses: {
            "201": {
              description: "Profile fetched successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      ,
        post: {
          summary: "Update current user profile",
          description: "Updates the authenticated user's basic profile fields",
          tags: ["Profile"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "John Doe" },
                    email: { type: "string", format: "email", example: "john@example.com" }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Profile updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            },
            "400": {
              description: "Invalid request data",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/systemmodules": {
        get: {
          summary: "List all system modules",
          description: "Get paginated list of system modules",
          tags: ["System Modules"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginationRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Modules list fetched",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        },
        post: {
          summary: "Create a new system module",
          description: "Create a new system module with actions",
          tags: ["System Modules"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateModuleRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Module created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/systemmodules/{id}": {
        get: {
          summary: "Get module by ID",
          description: "Get details of a specific system module",
          tags: ["System Modules"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          responses: {
            "201": {
              description: "Module fetched successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        },
        put: {
          summary: "Update a system module",
          description: "Update a system module by ID",
          tags: ["System Modules"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateModuleRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Module updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        },
        delete: {
          summary: "Delete a system module",
          description: "Soft delete a system module by ID",
          tags: ["System Modules"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          responses: {
            "201": {
              description: "Module deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/roles": {
        get: {
          summary: "List all roles",
          description: "Get paginated list of roles",
          tags: ["Roles"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginationRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Roles list fetched",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        },
        post: {
          summary: "Create a new role",
          description: "Create a new role with multilingual support",
          tags: ["Roles"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateRoleRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Role created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/roles/{id}": {
        put: {
          summary: "Update a role",
          description: "Update a role by ID",
          tags: ["Roles"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateRoleRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Role updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        },
        patch: {
          summary: "Update role status",
          description: "Update role active/inactive status",
          tags: ["Roles"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "boolean" }
                  }
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Role status updated",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/roles/{id}/permissions": {
        patch: {
          summary: "Assign permissions to role",
          description: "Assign module and action permissions to a role",
          tags: ["Roles"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    modules: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          moduleKey: { type: "string" },
                          actions: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                actionKey: { type: "string" },
                                allowed: { type: "boolean" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Permissions assigned successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/systemusers": {
        get: {
          summary: "List all system users",
          description: "Get paginated list of system admins",
          tags: ["System Users"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginationRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Users list fetched",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        },
        post: {
          summary: "Create a new system user",
          description: "Create a new system admin user",
          tags: ["System Users"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateUserRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "User created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/systemusers/{id}": {
        post: {
          summary: "Update a system user",
          description: "Update a system admin by ID",
          tags: ["System Users"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateUserRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "User updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/systemusers/{id}/reset-password": {
        post: {
          summary: "Reset user password",
          description: "Admin resets a user's password",
          tags: ["System Users"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    newPassword: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Password reset successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/systemusers/me/change-password": {
        post: {
          summary: "Change own password",
          description: "User changes their own password",
          tags: ["System Users"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    currentPassword: { type: "string" },
                    newPassword: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Password changed successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/plans": {
        get: {
          summary: "List all plans",
          description: "Get paginated list of subscription plans",
          tags: ["Plans"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginationRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Plans list fetched",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        },
        post: {
          summary: "Create a new plan",
          description: "Create a new subscription plan",
          tags: ["Plans"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreatePlanRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Plan created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/plans/{id}": {
        get: {
          summary: "Get plan by ID",
          description: "Get single plan by ID",
          tags: ["Plans"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          responses: {
            "201": {
              description: "Plan fetched successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        },
        put: {
          summary: "Update a plan",
          description: "Update a plan by ID",
          tags: ["Plans"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreatePlanRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Plan updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        },
        delete: {
          summary: "Delete a plan",
          description: "Delete a plan by ID",
          tags: ["Plans"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          responses: {
            "201": {
              description: "Plan deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/plans/{id}/modules": {
        post: {
          summary: "Assign modules to plan",
          description: "Assign modules and actions to a plan",
          tags: ["Plans"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    modules: { type: "array" }
                  }
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Modules assigned successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/affilaite": {
        get: {
          summary: "List all affiliates",
          description: "Get paginated list of affiliates",
          tags: ["Affiliates"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginationRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Affiliates list fetched",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        },
        post: {
          summary: "Create a new affiliate",
          description: "Create a new affiliate with multilingual support",
          tags: ["Affiliates"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateAffiliateRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Affiliate created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/affilaite/{id}": {
        get: {
          summary: "Get affiliate by ID",
          description: "Get single affiliate by ID",
          tags: ["Affiliates"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          responses: {
            "201": {
              description: "Affiliate fetched successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        },
        put: {
          summary: "Update an affiliate",
          description: "Update an affiliate by ID",
          tags: ["Affiliates"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateAffiliateRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Affiliate updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        },
        delete: {
          summary: "Soft delete an affiliate",
          description: "Soft delete an affiliate by ID",
          tags: ["Affiliates"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          responses: {
            "201": {
              description: "Affiliate deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/cms": {
        get: {
          summary: "List CMS entries",
          description: "Get CMS entries visible to the authenticated admin hierarchy",
          tags: ["CMS"],
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "CMS entries fetched successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        },
        post: {
          summary: "Create CMS entry",
          description: "Create a CMS entry scoped to the authenticated admin ownership tree",
          tags: ["CMS"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateCmsRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "CMS entry created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      },
      "/api/cms/{id}": {
        get: {
          summary: "Get CMS entry by ID",
          description: "Get a single CMS entry within the caller's ownership scope",
          tags: ["CMS"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          responses: {
            "200": {
              description: "CMS entry fetched successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        },
        put: {
          summary: "Update CMS entry",
          description: "Update a CMS entry within the caller's ownership scope",
          tags: ["CMS"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateCmsRequest"
                }
              }
            }
          },
          responses: {
            "200": {
              description: "CMS entry updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        },
        delete: {
          summary: "Delete CMS entry",
          description: "Soft delete a CMS entry within the caller's ownership scope",
          tags: ["CMS"],
          security: [{ bearerAuth: [] }],
          parameters: [{
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }],
          responses: {
            "200": {
              description: "CMS entry deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessResponse"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ["./routes/*.js"]
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};

