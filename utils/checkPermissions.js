const CustomError = require("../errors");

/**
 * Checks user permissions for accessing a resource
 * 
 * Validates if the requesting user has permission to access a specific resource.
 * Allows access if:
 * - User is an admin
 * - User is accessing their own resource
 * 
 * @function checkPermissions
 * @param {Object} requestUser - The user making the request
 * @param {string|Object} resourceUserID - The ID of the resource's owner
 * @throws {UnauthorizedError} If user does not have permission to access the resource
 * @returns {void}
 * 
 * @example
 * // Allows admin to access any resource
 * checkPermissions({ role: 'admin' }, '123')
 * 
 * @example
 * // Allows user to access their own resource
 * checkPermissions({ userID: '123' }, '123')
 * 
 * @example
 * // Throws UnauthorizedError for unauthorized access
 * checkPermissions({ userID: '456' }, '123')
 */
const checkPermissions = (requestUser, resourceUserID) => {
  // Uncomment for debugging
  /* console.log(requestUser);
  console.log(resourceUserID);
  console.log(typeof(resourceUserID)); */

  // Admin can access all resources
  if (requestUser.role === "admin") return;

  // User can access their own resources
  if (requestUser.userID === resourceUserID.toString()) return;

  // Throw unauthorized error for other cases
  throw new CustomError.UnauthorizedError("Unauthorized!");
};

module.exports = checkPermissions;
