const crypto = require("crypto");

/**
 * Creates a secure hash of a given string using MD5
 * 
 * Generates a hexadecimal representation of the hash, 
 * suitable for storing or comparing hashed values.
 * 
 * @function hashString
 * @param {string} string - The string to hash
 * @returns {string} A hexadecimal representation of the hash
 * 
 * @example
 * const hashedString = hashString('myString')
 */
const hashString = (string) =>
  crypto.createHash("md5").update(string).digest("hex");

module.exports = hashString;
