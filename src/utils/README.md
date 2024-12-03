# Utility Functions

This directory contains utility functions and helper modules used across the Ecommerce API project.

## Contents

### Authentication and Security
- `checkPermissions.js`: Validates user access permissions
- `createHash.js`: Generates secure password hashes
- `createTokenUser.js`: Prepares user data for JWT token generation
- `jwt.js`: Manages JSON Web Token (JWT) creation and validation

### Email Services
- `nodemailerConfig.js`: Configures Nodemailer transporter for email sending
- `sendEmail.js`: Generic email sending utility
- `sendResetPasswordEmail.js`: Sends password reset emails
- `sendVerificationEmail.js`: Sends email verification links

### Configuration
- `config.js`: Centralized configuration management for environment variables

## Usage

These utility functions are designed to be imported and used across the application. They provide reusable, modular functionality for common tasks such as authentication, email communication, and configuration management.

### Example

```javascript
const checkPermissions = require('./checkPermissions')
const createTokenUser = require('./createTokenUser')

// Check if a user has permission to access a resource
checkPermissions(requestUser, resourceUserID)

// Create a token payload for JWT generation
const tokenPayload = createTokenUser(user)
```

## Best Practices

- Always use environment variables for sensitive information
- Handle errors appropriately when using these utilities
- Refer to individual function documentation for specific usage details
