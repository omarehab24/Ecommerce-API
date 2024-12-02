/**
 * Creates a token payload from user information
 * 
 * Extracts and prepares minimal user information 
 * for JWT token generation, ensuring only necessary 
 * details are included in the token.
 * 
 * @function createTokenUser
 * @param {Object} user - The user object from the database
 * @returns {Object} A simplified user object for token generation
 * 
 * @property {string} userID - Unique identifier for the user
 * @property {string} name - User's name
 * @property {string} role - User's role in the system
 * 
 * @example
 * const tokenPayload = createTokenUser(userFromDatabase)
 */
const createTokenUser = (user) => {
  return {
    userID: user._id,
    name: user.name,
    role: user.role,
  }
}

module.exports = createTokenUser
